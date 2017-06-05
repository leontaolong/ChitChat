package handlers

import (
	"bytes"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
)

// // Prox is a RerverseProxy object
// type Prox struct {
// 	// target url of reverse proxy
// 	target *url.URL
// 	// instance of Go ReverseProxy thatwill do the job for us
// 	proxy *httputil.ReverseProxy
// }

// // New is a small factory
// func New(target string) *Prox {
// 	url, _ := url.Parse(target)
// 	// you should handle error on parsing
// 	return &Prox{target: url, proxy: httputil.NewSingleHostReverseProxy(url)}
// }

// func (p *Prox) handle(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("X-GoProxy", "GoProxy")
// 	// call to magic method from ReverseProxy object
// 	p.proxy.ServeHTTP(w, r)
// }

// ChatbotHandler handles all requests made to the /v1/messages path
// func (ctx *Context) ChatbotHandler(w http.ResponseWriter, r *http.Request) *httputil.ReverseProxy {
// 	state := &SessionState{}
// 	_, err := sessions.GetState(r, ctx.SessionKey, ctx.SessionStore, state)
// 	if err != nil {
// 		http.Error(w, "error getting session state: "+err.Error(), http.StatusInternalServerError)
// 	}

// 	// get a json-encoded string of the User object
// 	user := state.User
// 	buf := new(bytes.Buffer)
// 	json.NewEncoder(buf).Encode(user)
// 	bufStr := buf.String()

// 	fmt.Println(bufStr)

// 	botSvrAddr := os.Getenv("BOTSVRADDR")
// 	if len(botSvrAddr) == 0 {
// 		log.Fatal("you must supply a value for BOTSVRADDR")
// 	}
// 	r.Header.Add("User", bufStr)
// 	fmt.Println("calling proxy")
// 	return GetServiceProxy(botSvrAddr, bufStr)
// 	// ctx.ChatbotProxy.ServeHTTP(w, r)
// 	// http.Handle(botSvrAddr, getServiceProxy(botSvrAddr, bufStr))

// 	// // add the User header containing current user info and redirect to Node.js chatbot microservice
// 	// r.Header.Set("User", bufStr)
// 	// fmt.Println(r.Header)
// 	// http.Redirect(w, r, "http://localhost:4001/v1/bot", 301)
// }

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
			// get a json-encoded string of the User object
			user := state.User
			buf := new(bytes.Buffer)
			json.NewEncoder(buf).Encode(user)
			bufStr := buf.String()
			r.URL.Scheme = "http"
			r.URL.Host = svcAddr
			r.Header.Add("User", bufStr)
		},
	}
}
