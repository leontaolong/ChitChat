package handlers

import (
	"challenges-leontaolong/apiserver/models/users"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"net/http"
	"time"
)

const (
	headerContentType = "Content-Type"
)

const (
	charsetUTF8         = "charset=utf-8"
	contentTypeJSON     = "application/json"
	contentTypeJSONUTF8 = contentTypeJSON + "; " + charsetUTF8
)

//UsersHandler allows new users to sign-up (POST) or returns all users
func (ctx *Context) UsersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		decoder := json.NewDecoder(r.Body)
		newUser := &users.NewUser{}
		if err := decoder.Decode(newUser); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		if err := newUser.Validate(); err != nil {
			http.Error(w, "error validating user: "+err.Error(), http.StatusBadRequest)
			return
		}

		_, err := ctx.UserStore.GetByEmail(newUser.Email)
		if err == nil {
			http.Error(w, "user with same email address already exists", http.StatusBadRequest)
			return
		}

		_, err = ctx.UserStore.GetByUserName(newUser.UserName)
		if err == nil {
			http.Error(w, "user with same username already exists", http.StatusBadRequest)
			return
		}

		user, err := ctx.UserStore.Insert(newUser)
		if err != nil {
			http.Error(w, "error inserting user: "+err.Error(), http.StatusInternalServerError)
			return
		}
		ctx.HandleBeginSession(user, w, r)

	case "GET":
		users, err := ctx.UserStore.GetAll()
		if err != nil {
			http.Error(w, "error getting users: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(users)
	}
}

// HandleBeginSession begins a new session and respond to the client
// with the models.User struct encoded as a JSON object
func (ctx *Context) HandleBeginSession(user *users.User, w http.ResponseWriter, r *http.Request) {
	state := SessionState{
		BeganAt:    time.Now(),
		ClientAddr: r.RemoteAddr,
		User:       user,
	}

	_, err := sessions.BeginSession(ctx.SessionKey, ctx.SessionStore, state, w)
	if err != nil {
		http.Error(w, "error starting session: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Add(headerContentType, contentTypeJSONUTF8)
	encoder := json.NewEncoder(w)
	encoder.Encode(user)
}

//SessionsHandler allows existing users to sign-in
func (ctx *Context) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		decoder := json.NewDecoder(r.Body)
		credential := &users.Credentials{}
		if err := decoder.Decode(credential); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		user, err := ctx.UserStore.GetByEmail(credential.Email)
		if err != nil {
			http.Error(w, "email is not valid", http.StatusUnauthorized)
			return
		}

		if err := user.Authenticate(credential.Password); err != nil {
			http.Error(w, "password is not valid", http.StatusUnauthorized)
			return
		}

		ctx.HandleBeginSession(user, w, r)
	}
}

//SessionsMineHandler allows authenticated users to sign-out
func (ctx *Context) SessionsMineHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "DELETE":
		_, err := sessions.EndSession(r, ctx.SessionKey, ctx.SessionStore)
		if err != nil {
			http.Error(w, "signing out not successful", http.StatusInternalServerError)
			return
		}
		w.Write([]byte("signout successful!"))
	}
}

//UsersMeHandler gets the session state and respond to the client with the session state's User field
func (ctx *Context) UsersMeHandler(w http.ResponseWriter, r *http.Request) {
	state := &SessionState{}
	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
	if err != nil {
		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
		return
	}
	switch r.Method {
	case "GET":
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(state.User)

	case "PATCH":
		decoder := json.NewDecoder(r.Body)
		updates := &users.UserUpdates{}
		if err := decoder.Decode(updates); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}

		err = ctx.UserStore.Update(updates, state.User)
		if err != nil {
			http.Error(w, "error update task: "+err.Error(), http.StatusInternalServerError)
			return
		}
		// get newly updated state
		state := &SessionState{}
		_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
		if err != nil {
			http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Add(headerContentType, contentTypeJSONUTF8)
		encoder := json.NewEncoder(w)
		encoder.Encode(state.User)
	}
}
