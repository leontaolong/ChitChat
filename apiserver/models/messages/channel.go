package messages

import (
	"challenges-leontaolong/apiserver/models/users"
	"time"
)

//Channel represents a channel
type Channel struct {
	ID          string         `json:"id" bson:"_id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	CreatorID   users.UserID   `json:"creatorID"`
	Members     []users.UserID `json:"members"`
	Private     bool           `json:"private"`
}

//NewChannel represents a new channel
type NewChannel struct {
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	Members     []users.UserID `json:"members,omitempty"`
	Private     bool           `json:"private,omitempty"`
}

//ChannelUpdates represents a channel updates
type ChannelUpdates struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

//ToChannel converts the NewChannel to a Channel
func (nchan *NewChannel) ToChannel() *Channel {
	channel := &Channel{
		Name:        nchan.Name,
		Description: nchan.Description,
		Members:     nchan.Members,
		Private:     nchan.Private,
		CreatedAt:   time.Now(),
	}
	//return the channel
	return channel
}
