package main

import (
	"challenges-leontaolong/apiserver/handlers"
	"log"
	"net/http"
	"os"
)

const defaultPort = "80"

const (
	apiRoot    = "/v1/"
	apiSummary = apiRoot + "summary"
)

//main is the main entry point for this program
func main() {
	port := os.Getenv("PORT")
	host := os.Getenv("HOST")

	if port == "" {
		port = defaultPort
	}
	//read and use the following environment variables
	//when initializing and starting your web server
	// PORT - port number to listen on for HTTP requests (if not set, use defaultPort)
	// HOST - host address to respond to (if not set, leave empty, which means any host)

	http.HandleFunc(apiSummary, handlers.SummaryHandler)
	//add your handlers.SummaryHandler function as a handler
	//for the apiSummary route
	//HINT: https://golang.org/pkg/net/http/#HandleFunc

	//start your web server and use log.Fatal() to log
	//any errors that occur if the server can't start
	//HINT: https://golang.org/pkg/net/http/#ListenAndServe
	log.Fatal(http.ListenAndServe(port+":"+host, nil))
}
