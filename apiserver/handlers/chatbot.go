package handlers

import (
	"bytes"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
)

//GetServiceProxy returns a ReverseProxy for a microservice
//given the services address (host:port)
func (ctx *Context) GetServiceProxy(svcAddr string) *httputil.ReverseProxy {
	return &httputil.ReverseProxy{
		Director: func(r *http.Request) {
			t := http.Response{
				Body: ioutil.NopCloser(bytes.NewBufferString("Hello World")),
			}

			buff := bytes.NewBuffer(nil)
			t.Write(buff)

			state := &SessionState{}
			_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
			if err != nil {
				buff.WriteString("error getting session state")
			}
			// get a json-encoded string of the User object
			user := state.User
			j, err := json.Marshal(user)
			if err != nil {
				buff.WriteString("error marshalling user object")
			}
			r.Header.Add("User", string(j))

			r.URL.Scheme = "http"
			r.URL.Host = svcAddr
			log.Println(user)
		},
	}
}
