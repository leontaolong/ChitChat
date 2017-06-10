"use strict";

const express = require('express');
const Channel = require('../models/channels/channel.js');
const Message = require('../models/messages/message.js');
const { Wit } = require('node-wit');

//export a function from this module 
//that accepts a tasks store implementation
module.exports = function(channelStore, messageStore) {
    //create a new Mux
    let router = express.Router();

    const witaiToken = process.env.WITAITOKEN;  
    const witaiClient = new Wit({ accessToken: witaiToken });

    router.get('/v1/tasks', async (req, res, next) => {
        try {
            let tasks = await channelStore.getAll();
            res.json(tasks);
        } catch(err) {
            next(err);
        }
        // store.getAll()
        //     .then(tasks => {
        //         res.json(tasks);
        //     })
        //     .catch(next);
    });

    router.post('/v1/bot', (req, res, next) => {
        let question = req.body;
        console.log(req.body);
        let user = JSON.parse(req.get("User"));
        console.log(user);
        console.log(`user is asking ${question}`);
	    witaiClient.message(question)
		.then(async data => {
			console.log(JSON.stringify(data, undefined, 2));
			switch (data.entities.intent[0].value) {
				case "last post":
                    switch(data.entities.question_type[0].value) {
                        case "when":
                            if (data.entities.channel_name) {
                                try {
                                    let channelName = data.entities.channel_name[0].value;
                                    let channel = await channelStore.getChannelByName(channelName);
                                    let result = await messageStore.getLastPostInChann(user, channel[0]._id);
                                    res.json(result[0]);
                                } catch(err) {
                                    next(err);
                                }
                            } else {
                                try {
                                    let result = await messageStore.getLastPost(user);
                                    res.json(result[0]);
                                } catch(err) {
                                    next(err);
                                }
                            }
					    break;   
                    }
                break;
                case "posts":
                    switch(data.entities.question_type[0].value) {
                        case "How many":
                            if (data.entities.channel_name) {
                                try {
                                    let channelName = data.entities.channel_name[0].value;
                                    let channel = await channelStore.getChannelByName(channelName);
                                    let result = await messageStore.getNumOfPostInChann(user, channel[0]._id);
                                    res.json(result.length);
                                } catch(err) {
                                    next(err);
                                } 
                            }
                        break;
                    }            
                break;  			
				default:
					res.send("Sorry, I'm not sure how to answer that. Please try again.");
			}
		})
		.catch(next);
    });
    return router;
};