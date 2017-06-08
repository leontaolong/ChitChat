package handlers

import (
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
)

//GetServiceProxy returns a ReverseProxy for a microservice
//given the services address (host:port)
func (ctx *Context) GetServiceProxy(svcAddr string) *httputil.ReverseProxy {
	fmt.Println("in get proxy")
	return &httputil.ReverseProxy{
		Director: func(r *http.Request) {
			state := &SessionState{}
			_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
			if err != nil {
				log.Println("error getting session state")
			}
			r.URL.Scheme = "http"
			r.URL.Host = svcAddr

			// get a json-encoded string of the User object
			user := state.User
			j, err := json.Marshal(user)
			if err != nil {
				log.Println("error marshalling user object")
			}
			r.Header.Add("User", string(j))
		},
	}
}
