"use strict";

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Wit } = require('node-wit');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan(process.env.LOGFORMAT || 'dev'));
//add CORS headers
app.use(cors());

const port = process.env.PORT || '80';
const host = process.env.HOST || '';
const dbAddr = process.env.DBADDR;
const witaiToken = process.env.WITAITOKEN;

const dbFuncs = require('./db').funcs;

const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

if (!witaiToken) {
	console.error("please set WITAITOKEN to your wit.ai app token");
	process.exit(1);
}

if (!dbAddr) {
	console.error("please set DBADDR to connect to Database");
	process.exit(1);
}

const witaiClient = new Wit({ accessToken: witaiToken });


function handleWhenLastPost(req, res, userData, witaiData) {
    // Use connect method to connect to the Server
    MongoClient.connect(dbAddr, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        dbFuncs.getLastMessages(db, userData, (result) => {
            console.log(result);
            res.send(result);
            db.close();
        });
    });
}


app.get("/v1/bot", (req, res, next) => {
	//TODO: use witaiClient.message() to
	//extract meaning from the value in the
	//`q` query string param and respond
	//accordingly
    console.log("in node handler");
        let question = req.body;
        console.log(req.headers);
        let user = JSON.parse(req.headers.User);
        console.log(`user is asking ${question}`);
	    witaiClient.message(question)
		.then(data => {
			console.log(JSON.stringify(data, undefined, 2));
			switch (data.entities.intent[0].value) {
				case "last_post":
                    switch(data.entities.question_type[0].value) {
                        case "when":
                        	handleWhenLastPost(req, res, user, data);
					    break;     
                    }			
				default:
					res.send("Sorry, I'm not sure how to answer that. Please try again.");
			}
		})
		.catch(next);
});

app.post("/this", (req, res, next) => {
    console.log("hello");
})

app.listen(port, host, () => {
	console.log(`server is listening at http://${host}:${port}`);
});