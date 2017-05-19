package main

import (
	"challenges-leontaolong/apiserver/handlers"
	"challenges-leontaolong/apiserver/middleware"
	"challenges-leontaolong/apiserver/models/users"
	"challenges-leontaolong/apiserver/notification"
	"challenges-leontaolong/apiserver/sessions"
	"fmt"
	"log"
	"net/http"
	"os"

	"time"

	"challenges-leontaolong/apiserver/models/messages"

	mgo "gopkg.in/mgo.v2"
	redis "gopkg.in/redis.v5"
)

const defaultPort = "443" //default port for https

const (
	apiRoot    = "/v1/"
	apiSummary = apiRoot + "summary"
)

//main is the main entry point for this program
func main() {
	//read and use the following environment variables
	//when initializing and starting the web server
	// PORT - port number to listen on for HTTP requests (if not set, use defaultPort)
	// HOST - host address to respond to (if not set, leave empty, which means any host)
	port := os.Getenv("PORT")
	host := os.Getenv("HOST")
	sessionKey := os.Getenv("SESSIONKEY")
	redisAddr := os.Getenv("REDISADDR")
	dbAddr := os.Getenv("DBADDR")

	if port == "" {
		port = defaultPort
	}

	rsClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	log.Printf("dialing mongo server at %s...\n", dbAddr)
	mongoSession, err := mgo.Dial(dbAddr)
	if err != nil {
		log.Fatalf("error dialing mongo: %v", err)
	}

	redisStore := sessions.NewRedisStore(rsClient, 20*time.Minute)
	notifier := notification.NewNotifier()
	go notifier.Start()

	ctx := &handlers.Context{
		SessionKey:   sessionKey,
		SessionStore: redisStore,
		UserStore: &users.MongoStore{
			Session:        mongoSession,
			DatabaseName:   "info344",
			CollectionName: "users",
		},
		MessageStore: &messages.MongoStore{
			Session:               mongoSession,
			DatabaseName:          "info344",
			ChannelCollectionName: "channels",
			MessageCollectionName: "messages",
		},
		Notifier: notifier,
	}

	mux := http.NewServeMux()
	muxCors := http.NewServeMux()
	mux.Handle(apiRoot, middleware.Adapt(muxCors, middleware.CORS("", "", "", "")))
	muxCors.HandleFunc("/v1/users", ctx.UsersHandler)
	muxCors.HandleFunc("/v1/sessions", ctx.SessionsHandler)
	muxCors.HandleFunc("/v1/sessions/mine", ctx.SessionsMineHandler)
	muxCors.HandleFunc("/v1/users/me", ctx.UsersMeHandler)

	muxCors.HandleFunc("/v1/channels", ctx.ChannelsHandler)
	muxCors.HandleFunc("/v1/channels/", ctx.SpecificChannelHandler)
	muxCors.HandleFunc("/v1/messages", ctx.MessagesHandler)
	muxCors.HandleFunc("/v1/messages/", ctx.SpecificMessageHandler)

	muxCors.HandleFunc("/v1/websocket", ctx.WebSocketUgradeHandler)

	muxCors.HandleFunc(apiSummary, handlers.SummaryHandler)

	addr := fmt.Sprintf("%s:%s", host, port)

	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")

	log.Printf("server is listening at %s...\n", addr)

	//init the server
	initServer(ctx)

	//start your web server and use log.Fatal() to log
	//any errors that occur if the server can't start
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, mux))
}

//init the server
func initServer(ctx *handlers.Context) {
	//check if there's any public channel in the database
	publicChannels, err := ctx.MessageStore.GetAllChannels("system")
	if err != nil {
		log.Println("error getting existing channels")
	}
	if len(publicChannels) == 0 {
		// if not, systematically creates a initial general channel
		newChannel := &messages.NewChannel{
			Name:        "General",
			Description: "A system created general channel",
			Private:     false,
		}
		_, err := ctx.MessageStore.InsertChannel(newChannel, "system")
		if err != nil {
			log.Println("error initializing general channel")
		}
	}
}
