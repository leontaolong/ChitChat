package handlers

import (
	"bytes"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"net/http"
)

// ChatbotHandler handles all requests made to the /v1/messages path
func (ctx *Context) ChatbotHandler(w http.ResponseWriter, r *http.Request) {
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// get a json-encoded string of the User object
	user := state.User
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(user)
	bufStr := buf.String()

	// add the User header containing current user info and redirect to Node.js chatbot microservice
	r.Header.Add("User", bufStr)
	http.Redirect(w, r, "localhost:2222/v1/bot", 301)
}
