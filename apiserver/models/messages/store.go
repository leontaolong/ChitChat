package messages

import "challenges-leontaolong/apiserver/models/users"

//Store is an interface that can be implemented using concrete DBMS
type Store interface {
	//Get all channels a given user is allowed to see
	GetAllChannels(userID users.UserID) ([]*Channel, error)

	//InsertChannel Inserts a new channel and returns a Channel stuct
	InsertChannel(newChannel *NewChannel, creatorID users.UserID) (*Channel, error)

	//GetMessages gets the most recent N messages posted to a particular channel
	GetMessages(num int, channelID string) ([]*Message, error)

	//UpdateChannel updates a channel's Name and Description
	UpdateChannel(updates *ChannelUpdates, currentChannel *Channel) (*Channel, error)

	//GetChannel takes in a channelID and returns the corresponding channel
	GetChannel(channelID string) (*Channel, error)

	//Delete deletes a channel, as well as all messages posted to that channel
	DeleteChannel(channel *Channel) (error, error)

	//DeleteMessages deletes all messages of the given channelID
	DeleteMessages(channelID string) error

	//AddMember adds a user to a channel's Members list
	AddMember(userID users.UserID, channel *Channel) error

	//RemoveMember removes a user from a channel's Members list
	RemoveMember(userID users.UserID, channel *Channel) error

	//InsertMessage inserts a new message to a given channel and returns the message
	InsertMessage(newMessage *NewMessage, creator *users.User) (*Message, error)

	//GetMessage takes in a messageID and retrurns the corresponding message
	GetMessage(messageID string) (*Message, error)

	//UpdateMessage updates an existing message
	UpdateMessage(updates *MessageUpdate, currentMessage *Message) (*Message, error)

	//DeleteMessage deletes a given message
	DeleteMessage(message *Message) error
}
