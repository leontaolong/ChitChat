package messages

import "challenges-leontaolong/apiserver/models/users"

//Store is an interface that can be implemented using concrete DBMS
type Store interface {
	//Get all channels a given user is allowed to see
	GetAll(userID users.UserID) ([]*Channel, error)

	//InsertChannel Inserts a new channel
	//and returns a Channel stuct
	InsertChannel(newChannel *NewChannel) (*Channel, error)

	//GetMessages gets the most recent N messages posted to a particular channel
	GetMessages(num int, channelID string) ([]*Channel, error)

	//Update updates a channel's Name and Description
	Update(updates *ChannelUpdates, currentChannel *Channel) error

	//Delete deletes a channel, as well as all messages posted to that channel
	Delete(channelID string) error

	//AddMember adds a user to a channel's Members list
	AddMember(userID users.UserID, channelID string) error

	//RemoveMember removes a user from a channel's Members list
	RemoveMember(userID users.UserID, channelID string) error

	//InsertMessage inserts a new message to a given channel
	InsertMessage(message *Message, channelID string) error

	//UpdateMessage updates an existing message
	UpdateMessage(updates *MeessageUpdate, currentMessage *Message) error

	//DeleteMessage deletes a given message
	DeleteMessage(messageID string) error
}
