package main

import (
	"challenges-leontaolong/apiserver/handlers"
	"fmt"
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
	//read and use the following environment variables
	//when initializing and starting the web server
	// PORT - port number to listen on for HTTP requests (if not set, use defaultPort)
	// HOST - host address to respond to (if not set, leave empty, which means any host)
	port := os.Getenv("PORT")
	host := os.Getenv("HOST")

	if port == "" {
		port = defaultPort
	}

	fmt.Printf("server is listening at %s...\n", host+":"+port)

	//add handlers.SummaryHandler function as a handler
	//for the apiSummary route
	http.HandleFunc("/v1/summary", handlers.SummaryHandler)

	//start your web server and use log.Fatal() to log
	//any errors that occur if the server can't start
	log.Fatal(http.ListenAndServe(host+":"+port, nil))
}
