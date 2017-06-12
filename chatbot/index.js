"use strict";

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Wit } = require('node-wit');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const MessageStore = require('./models/messages/mongostore.js');
const ChannelStore = require('./models/channels/mongostore.js');
const UserStore = require('./models/users/mongostore.js');

const app = express();

app.use(morgan(process.env.LOGFORMAT || 'dev'));
// add CORS headers
// app.use(cors());

const port = process.env.PORT || '80';
const host = process.env.HOST || '';
const dbAddr = process.env.DBADDR;
const witaiToken = process.env.WITAITOKEN;


if (!witaiToken) {
	console.error("please set WITAITOKEN to your wit.ai app token");
	process.exit(1);
}

if (!dbAddr) {
	console.error("please set DBADDR to connect to Database");
	process.exit(1);
}

app.use(bodyParser.text());
// app.use(bodyParser.json());

mongodb.MongoClient.connect(`mongodb://${dbAddr}/info344`)
    .then(db => {
		let colChannels = db.collection('channels');
        let colMessages = db.collection('messages');
		let colUsers = db.collection('users');

        let handlers = require('./handlers/handlers.js');

		let channelStore = new ChannelStore(colChannels);
		let messageStore = new MessageStore(colMessages);
		let userStore = new UserStore(colUsers);

		app.use(handlers(channelStore, messageStore, userStore));

        //error handler
        app.use((err, req, res, next) => {
            console.error(err);
            res.status(err.status || 500).send(err.message);
        });

        app.listen(port, host, () => {
            console.log(`server is listening at http://${host}:${port}...`);
        });
    })
    .catch(err => {
        console.error(err);
    });
