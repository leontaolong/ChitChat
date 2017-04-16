package main

import (
	"challenges-leontaolong/apiserver/handlers"
	"fmt"
	"log"
	"net/http"
	"os"
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
	addr := fmt.Sprintf("%s:%s", host, port)

	if port == "" {
		port = defaultPort
	}

	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")

	fmt.Printf("server is listening at %s...\n", addr)

	//add handlers.SummaryHandler function as a handler
	//for the apiSummary route
	http.HandleFunc("/v1/summary", handlers.SummaryHandler)

	//start your web server and use log.Fatal() to log
	//any errors that occur if the server can't start
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, nil))
}
