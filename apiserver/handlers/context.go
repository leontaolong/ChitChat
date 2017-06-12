package handlers

import (
	"challenges-leontaolong/apiserver/models/messages"
	"challenges-leontaolong/apiserver/models/users"
	"challenges-leontaolong/apiserver/notification"
	"challenges-leontaolong/apiserver/sessions"
)

//Context holds all the shared values that
//multiple HTTP Handlers will need
type Context struct {
	SessionKey   string
	SessionStore sessions.Store
	UserStore    users.Store
	MessageStore messages.Store
	Notifier     *notification.Notifier
}
