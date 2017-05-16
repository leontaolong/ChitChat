package handlers

import (
	"challenges-leontaolong/apiserver/models/messages"
	"challenges-leontaolong/apiserver/models/users"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"net/http"
	"path"
	"strconv"

	"challenges-leontaolong/apiserver/notification"

	"github.com/gorilla/websocket"
)

const (
	maxNumOfMessageReturned = 2000
)

//ChannelsHandler handles all requests made to the /v1/channels path
func (ctx *Context) ChannelsHandler(w http.ResponseWriter, r *http.Request) {
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add(headerContentType, contentTypeJSONUTF8)
	encoder := json.NewEncoder(w)

	switch r.Method {
	case "GET":
		channels, err := ctx.MessageStore.GetAllChannels(state.User.ID)
		if err != nil {
			http.Error(w, "error getting all channels: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// write all channels to the client
		encoder.Encode(channels)

	case "POST":
		decoder := json.NewDecoder(r.Body)
		newChannel := &messages.NewChannel{}
		if err := decoder.Decode(newChannel); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		channel, err := ctx.MessageStore.InsertChannel(newChannel, state.User.ID)
		if err != nil {
			http.Error(w, "error inserting new channel: "+err.Error(), http.StatusInternalServerError)
			return
		}
		ctx.MessageStore.AddMember(state.User.ID, channel)
		if err != nil {
			http.Error(w, "error adding creator to members: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.NewChannelCreated,
			Prop: channel,
		})
		// write to the new channel object the client
		encoder.Encode(channel)
	}
}

//SpecificChannelHandler handles all requests made to the /v1/channels/<channel-id> path
func (ctx *Context) SpecificChannelHandler(w http.ResponseWriter, r *http.Request) {
	// get the given channel
	_, channelID := path.Split(r.URL.Path)
	channel, err := ctx.MessageStore.GetChannel(channelID)
	if err != nil {
		http.Error(w, "error getting channel with given channelID: "+err.Error(), http.StatusBadRequest)
		return
	}
	// get current state
	state := &SessionState{}
	_, err = sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}

	switch r.Method {
	case "GET":
		// get number of recent messages from the query string
		queryVals := r.URL.Query()
		msgNumVal := queryVals.Get("msgNum")
		msgNum, err := strconv.Atoi(msgNumVal)
		if err != nil {
			http.Error(w, "error parsing msgNum value as an int: "+err.Error(), http.StatusBadRequest)
			return
		}
		// if the msgNum is too big, set it to maxNumOfMessageReturned
		if msgNum > maxNumOfMessageReturned {
			msgNum = maxNumOfMessageReturned
		}

		// check if channel is visible to the current user
		isMember := false
		for _, member := range channel.Members {
			if member == state.User.ID {
				isMember = true
			}
		}

		if !isMember && channel.Private { // if channel is not visible to the user
			http.Error(w, "requested channel unauthorized", http.StatusBadRequest)
			return
		}
		// otherwise, get the messages
		messages, err := ctx.MessageStore.GetMessages(msgNum, channelID)
		if err != nil {
			http.Error(w, "error getting all messages: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// write all messages to the client
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(messages)

	case "PATCH":
		decoder := json.NewDecoder(r.Body)
		updates := &messages.ChannelUpdates{}
		if err := decoder.Decode(updates); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		if channel.CreatorID != state.User.ID { // if the user is not the creator of the given channel
			http.Error(w, "updating unauthorized: only creator of the channel can perform update", http.StatusBadRequest)
			return
		}

		channel, err = ctx.MessageStore.UpdateChannel(updates, channel)
		if err != nil {
			http.Error(w, "error updating channel info: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.ChannelUpdated,
			Prop: channel,
		})
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(channel)

	case "DELETE":
		if channel.CreatorID != state.User.ID { // if the user is not the creator of the given channel
			http.Error(w, "deleting unauthorized: only creator of the channel can perform deletion", http.StatusBadRequest)
			return
		}
		err1, err2 := ctx.MessageStore.DeleteChannel(channel)
		if err1 != nil {
			http.Error(w, "error deleting all messages in the channel: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if err2 != nil {
			http.Error(w, "error deleting the channel: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.ChannelDeleted,
			Prop: channel,
		})
		w.Write([]byte("delete successful!"))

	case "LINK":
		if !channel.Private {
			err := ctx.MessageStore.AddMember(state.User.ID, channel)
			if err != nil {
				http.Error(w, "error adding member: "+err.Error(), http.StatusInternalServerError)
				return
			}
			go ctx.Notifier.Notify(&notification.Event{
				Type: notification.UserJoinedChannel,
				Prop: state.User,
			})
			w.Write([]byte("link current user successful!"))
		} else {
			if channel.CreatorID != state.User.ID { // if the user is not the creator of the given channel
				http.Error(w, "linking unauthorized: only creator of the channel can add members", http.StatusBadRequest)
				return
			}
			usrID, err := json.Marshal(r.Header.Get("Link"))
			if err != nil {
				http.Error(w, "error marshalling json in request header", http.StatusInternalServerError)
				return
			}
			err = ctx.MessageStore.AddMember(users.UserID(string(usrID)), channel)
			if err != nil {
				http.Error(w, "error adding member: "+err.Error(), http.StatusInternalServerError)
				return
			}
			user, err := ctx.UserStore.GetByID(users.UserID(usrID))
			if err != nil {
				http.Error(w, "error getting user object with the given ID: "+err.Error(), http.StatusInternalServerError)
				return
			}
			go ctx.Notifier.Notify(&notification.Event{
				Type: notification.UserJoinedChannel,
				Prop: user,
			})
			w.Write([]byte("link user successful!"))
		}

	case "UNLINK":
		if !channel.Private {
			err := ctx.MessageStore.RemoveMember(state.User.ID, channel)
			if err != nil {
				http.Error(w, "error removing member: "+err.Error(), http.StatusInternalServerError)
				return
			}
			go ctx.Notifier.Notify(&notification.Event{
				Type: notification.UserLeftChannel,
				Prop: state.User,
			})
			w.Write([]byte("unlink current user successful!"))
		} else {
			if channel.CreatorID != state.User.ID { // if the user is not the creator of the given channel
				http.Error(w, "linking unauthorized: only creator of the channel can add members", http.StatusBadRequest)
				return
			}
			usrID, err := json.Marshal(r.Header.Get("Link"))
			if err != nil {
				http.Error(w, "error marshalling json in request header", http.StatusInternalServerError)
				return
			}
			err = ctx.MessageStore.RemoveMember(users.UserID(string(usrID)), channel)
			if err != nil {
				http.Error(w, "error removing member: "+err.Error(), http.StatusInternalServerError)
				return
			}
			user, err := ctx.UserStore.GetByID(users.UserID(usrID))
			if err != nil {
				http.Error(w, "error getting user object with the given ID: "+err.Error(), http.StatusInternalServerError)
				return
			}
			go ctx.Notifier.Notify(&notification.Event{
				Type: notification.UserLeftChannel,
				Prop: user,
			})
			w.Write([]byte("unlink user successful!"))
		}
	}
}

//MessagesHandler handlea all requests made to the /v1/messages path
func (ctx *Context) MessagesHandler(w http.ResponseWriter, r *http.Request) {
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}
	switch r.Method {
	case "POST":
		decoder := json.NewDecoder(r.Body)
		newMessage := &messages.NewMessage{}
		if err := decoder.Decode(newMessage); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		message, err := ctx.MessageStore.InsertMessage(newMessage, state.User)
		if err != nil {
			http.Error(w, "error inserting new message: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.NewMessagePosted,
			Prop: message,
		})
		// write to the new message object the client
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(message)
	}
}

//SpecificMessageHandler handles all requests made to the /v1/messages/<message-id> path.
func (ctx *Context) SpecificMessageHandler(w http.ResponseWriter, r *http.Request) {
	// get the given message
	_, messageID := path.Split(r.URL.Path)
	message, err := ctx.MessageStore.GetMessage(messageID)
	if err != nil {
		http.Error(w, "error getting message with given messageID: "+err.Error(), http.StatusBadRequest)
		return
	}
	// get current state
	state := &SessionState{}
	_, err = sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}

	switch r.Method {
	case "PATCH":
		decoder := json.NewDecoder(r.Body)
		update := &messages.MessageUpdate{}
		if err := decoder.Decode(update); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		if message.CreatorID != state.User.ID { // if the user is not the creator of the given channel
			http.Error(w, "updating unauthorized: only creator of the message can perform update", http.StatusBadRequest)
			return
		}

		message, err = ctx.MessageStore.UpdateMessage(update, message)
		if err != nil {
			http.Error(w, "error updating message info: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.MessageUpdated,
			Prop: message,
		})
		// write updated message to the client
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(message)

	case "DELETE":
		if message.CreatorID != state.User.ID { // if the user is not the creator of the given channel
			http.Error(w, "deleting unauthorized: only creator of the message can perform deletion", http.StatusBadRequest)
			return
		}
		err := ctx.MessageStore.DeleteMessage(message)
		if err != nil {
			http.Error(w, "error deleting message: "+err.Error(), http.StatusInternalServerError)
			return
		}
		go ctx.Notifier.Notify(&notification.Event{
			Type: notification.MessageDeleted,
			Prop: message,
		})
		w.Write([]byte("delete successful!"))
	}
}

//WebSocketUgradeHandler upgrades a http connection to websocket connection
func (ctx *Context) WebSocketUgradeHandler(w http.ResponseWriter, r *http.Request) {
	// make sure user is authenticated
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "error upgrading to websocket: "+err.Error(), http.StatusInternalServerError)
		return
	}
	ctx.Notifier.AddClient(ws)
}
