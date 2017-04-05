package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"golang.org/x/net/html"
)

//openGraphPrefix is the prefix used for Open Graph meta properties
const openGraphPrefix = "og:"

//openGraphProps represents a map of open graph property names and values
type openGraphProps map[string]string

func getPageSummary(url string) (openGraphProps, error) {
	//GET the URL
	resp, err := http.Get(url)

	//if there waspwd an error, report it and exit
	if err != nil {
		// log.Fatalf("error fetching URL: %v\n", err)
		return nil, err
	}

	//make sure the response body gets closed
	defer resp.Body.Close()

	//check response status code
	if resp.StatusCode >= 400 {
		return nil, errors.New("Response status was " + resp.Status)
	}

	//check response content type
	ctype := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(ctype, "text/html") {
		return nil, errors.New("response content type was " + ctype + " not text/htm")
	}

	ogProps := make(openGraphProps)

	//create a new tokenizer over the response body
	tokenizer := html.NewTokenizer(resp.Body)

	//loop until we find the title element and its content
	//or encounter an error (which includes the end of the file)
	for {
		//get the next token type
		tokenType := tokenizer.Next()

		//if it's an error token, we either reached
		//the end of the file, or the HTML was malformed
		if tokenType == html.ErrorToken {
			return ogProps, tokenizer.Err()
		}

		//if this is a start tag or self closing tag token...
		if tokenType == html.StartTagToken || tokenType == html.SelfClosingTagToken {
			//get the token
			token := tokenizer.Token()
			// if the name of the token is meta
			if "meta" == token.Data {
				for i := 0; i < len(token.Attr); i++ {
					var prop string
					var content string
					switch token.Attr[i].Key {
					case "property":
						prop = token.Attr[i].Val
					case "content":
						content = token.Attr[i].Val
					}
					if prop != "" && content != "" {
						trimedProp := strings.TrimPrefix(prop, openGraphPrefix)
						ogProps[trimedProp] = content
					}
				}
			}
		}
	}
	//Get the URL
	//If there was an error, return it

	//ensure that the response body stream is closed eventually
	//HINTS: https://gobyexample.com/defer
	//https://golang.org/pkg/net/http/#Response

	//if the response StatusCode is >= 400
	//return an error, using the response's .Status
	//property as the error message

	//if the response's Content-Type header does not
	//start with "text/html", return an error noting
	//what the content type was and that you were
	//expecting HTML

	//create a new openGraphProps map instance to hold
	//the Open Graph properties you find
	//(see type definition above)

	//tokenize the response body's HTML and extract
	//any Open Graph properties you find into the map,
	//using the Open Graph property name as the key, and the
	//corresponding content as the value.
	//strip the openGraphPrefix from the property name before
	//you add it as a new key, so that the key is just `title`
	//and not `og:title` (for example).

	//HINTS: https://info344-s17.github.io/tutorials/tokenizing/
	//https://godoc.org/golang.org/x/net/html
}

//SummaryHandler fetches the URL in the `url` query string parameter, extracts
//summary information about the returned page and sends those summary properties
//to the client as a JSON-encoded object.
func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json; charset=utf-8")
	w.Header().Add("Access-Control-Allow-Origin", "*")

	URL := r.FormValue("url")

	if URL == "" {
		http.Error(w, "Bad Request, no parameter key 'url' found", http.StatusBadRequest)
		return
	}

	openGraphMap, err := getPageSummary(URL)
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	encoder := json.NewEncoder(w)
	if err := encoder.Encode(openGraphMap); err != nil {
		http.Error(w, "error encoding json: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// URL = r.URL.Query().Get("url")
	//Add the following header to the response
	//   Access-Control-Allow-Origin: *
	//this will allow JavaScript served from other origins
	//to call this API

	//get the `url` query string parameter
	//if you use r.FormValue() it will also handle cases where
	//the client did POST with `url` as a form field
	//HINT: https://golang.org/pkg/net/http/#Request.FormValue

	//if no `url` parameter was provided, respond with
	//an http.StatusBadRequest error and return
	//HINT: https://golang.org/pkg/net/http/#Error

	//call getPageSummary() passing the requested URL
	//and holding on to the returned openGraphProps map
	//(see type definition above)

	//if you get back an error, respond to the client
	//with that error and an http.StatusBadRequest code

	//otherwise, respond by writing the openGrahProps
	//map as a JSON-encoded object
	//add the following headers to the response before
	//you write the JSON-encoded object:
	//   Content-Type: application/json; charset=utf-8
	//this tells the client that you are sending it JSON
}
