package notification

const (
	newUserCreated    = "NEW_USER_CREATED"
	newChannelCreated = "NEW_CHANNEL_CREATED"
	channelUpdated    = "CHANNEL_UPDATED"
	channelDeleted    = "CHANNEL_DELETED"
	userJoinedChannel = "USER_JOINED_CHANNEL"
	userLeftChannel   = "USER_LEFT_CHANNEL"
	newMessagePosted  = "NEW_MESSAGE_POSTED"
	messageUpdated    = "MESSAGE_UPDATED"
	messageDeleted    = "MESSAGE_DELETED"
)

//Event is a event interface
type Event struct {
	Type string      `json:"type"`
	Prop interface{} `json:"prop"`
}
