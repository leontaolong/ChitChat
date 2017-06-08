package messages

import (
	"challenges-leontaolong/apiserver/models/users"
	"time"
)

//Message represents a message
type Message struct {
	ID        string       `json:"id" bson:"_id"`
	ChannelID string       `json:"channelId" bson:"_channelId"`
	Body      string       `json:"body"`
	CreatedAt time.Time    `json:"createdAt"`
	CreatorID users.UserID `json:"creatorID"`
	EditedAt  time.Time    `json:"editedAt"`
}

//NewMessage represents a new message
type NewMessage struct {
	ChannelID string `json:"channelId" bson:"_channelId"`
	Body      string `json:"body"`
}

//MessageUpdate represents a message update
type MessageUpdate struct {
	Body string `json:"body"`
}

//ToMessage converts the NewMessage to a Message
func (nMsg *NewMessage) ToMessage() *Message {
	message := &Message{
		Body:      nMsg.Body,
		ChannelID: nMsg.ChannelID,
		CreatedAt: time.Now(),
		EditedAt:  time.Now(),
	}
	//return the message
	return message
}
