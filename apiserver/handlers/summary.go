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

	//if there was an error, return it
	if err != nil {
		return nil, err
	}

	//make sure the response body gets closed
	defer resp.Body.Close()

	//check response status code
	if resp.StatusCode >= 400 {
		return nil, errors.New("Response status was " + resp.Status)
	}

	//check if the response's Content-Type header
	//starts with "text/html", return an error noting
	//what the content type was and that you were
	//expecting HTML
	ctype := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(ctype, "text/html") {
		return nil, errors.New("response content type was " + ctype + " not text/htm")
	}

	//create a new openGraphProps map instance to hold
	//the Open Graph properties we find
	ogProps := make(openGraphProps)

	//create a new tokenizer over the response body
	tokenizer := html.NewTokenizer(resp.Body)

	//tokenize the response body's HTML and extract
	//any Open Graph properties you find into the map
	//break if encounter an error (which includes the end of the file
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
				var prop string
				var content string
				for i := 0; i < len(token.Attr); i++ {
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
}

//SummaryHandler fetches the URL in the `url` query string parameter, extracts
//summary information about the returned page and sends those summary properties
//to the client as a JSON-encoded object.
func SummaryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "application/json; charset=utf-8")
	// allow JavaScript served from other origins to call this API
	w.Header().Add("Access-Control-Allow-Origin", "*")

	URL := r.FormValue("url")
	//if no `url` parameter was provided, respond with
	//an http.StatusBadRequest error and return
	if URL == "" {
		http.Error(w, "Bad Request, no parameter key 'url' found", http.StatusBadRequest)
		return
	}

	//call getPageSummary() passing the requested URL
	//and holding on to the returned openGraphProps map
	openGraphMap, err := getPageSummary(URL)

	//if get back an error, respond to the client
	//with that error and an http.StatusBadRequest code
	if err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	//otherwise, respond by writing the openGrahProps
	//map as a JSON-encoded object
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(openGraphMap); err != nil {
		http.Error(w, "error encoding json: "+err.Error(), http.StatusInternalServerError)
	}
}
