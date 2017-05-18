package handlers

import (
	"challenges-leontaolong/apiserver/models/users"
	"time"
)

// SessionState is a struct that represents a session
type SessionState struct {
	BeganAt    time.Time
	ClientAddr string
	User       *users.User
}
