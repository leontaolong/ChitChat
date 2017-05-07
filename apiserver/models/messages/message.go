package messages

import (
	"challenges-leontaolong/apiserver/models/users"
	"time"
)

//Message represents a message
type Message struct {
	ID        string         `json:"id" bson:"_id"`
	ChannelID string         `json:"channelId" bson:"_channelId"`
	Body      string         `json:"body"`
	CreatedAt time.Time      `json:"createdAt"`
	CreatorID users.UserID   `json:"creatorID"`
	EditedAt  time.Time      `json:"editedAt"`
	Members   []users.UserID `json:"members"`
	Private   bool           `json:"private"`
}

//NewMessage represents a new message
type NewMessage struct {
	ChannelID string `json:"channelId" bson:"_channelId"`
	Body      string `json:"body"`
}

//MeessageUpdate represents a message update
type MeessageUpdate struct {
	Body string `json:"body"`
}
