package notification

//event tags
const (
	NewUserCreated    = "NEW_USER_CREATED"
	NewChannelCreated = "NEW_CHANNEL_CREATED"
	ChannelUpdated    = "CHANNEL_UPDATED"
	ChannelDeleted    = "CHANNEL_DELETED"
	UserJoinedChannel = "USER_JOINED_CHANNEL"
	UserLeftChannel   = "USER_LEFT_CHANNEL"
	NewMessagePosted  = "NEW_MESSAGE_POSTED"
	MessageUpdated    = "MESSAGE_UPDATED"
	MessageDeleted    = "MESSAGE_DELETED"
)

//Event is a event interface
type Event struct {
	Type string      `json:"type"`
	Prop interface{} `json:"prop"`
}
