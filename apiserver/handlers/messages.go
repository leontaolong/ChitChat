package handlers

import (
	"challenges-leontaolong/apiserver/models/messages"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"net/http"
)

//ChannelsHandler handles all requests made to the /v1/channels path
func (ctx *Context) ChannelsHandler(w http.ResponseWriter, r *http.Request) {
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}
	switch r.Method {
	case "GET":
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		channels, err := ctx.MessageStore.GetAllChannels(state.User)
		if err != nil {
			http.Error(w, "error getting all channels: "+err.Error(), http.StatusInternalServerError)
			return
		}
		encoder := json.NewEncoder(w)
		encoder.Encode(channels)

	case "POST":
		decoder := json.NewDecoder(r.Body)
		newChannel := &messages.NewChannel{}
		if err := decoder.Decode(newChannel); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		channel, err := ctx.MessageStore.InsertChannel(newChannel, state.User)
		if err != nil {
			http.Error(w, "error inserting new channel: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// write to the new channel object the client
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(channel)
	}
}
