"use strict";

const express = require('express');
const Channel = require('../models/channels/channel.js');
const Message = require('../models/messages/message.js');
const { Wit } = require('node-wit');

//export a function from this module 
//that accepts a tasks store implementation
module.exports = function(channelStore, messageStore, userStore) {
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
                                if (data.entities.datetime) {
                                    try {
                                        let datetime = data.entities.datetime[0].value
                                        let channelName = data.entities.channel_name[0].value;
                                        let channel = await channelStore.getChannelByName(channelName);
                                        let result = await messageStore.getNumOfPostInChannWithDatetime(user, channel[0]._id, datetime);
                                        res.json(result.length);
                                    } catch(err) {
                                        next(err);
                                    }
                                } else {
                                    try {
                                        let channelName = data.entities.channel_name[0].value;
                                        let channel = await channelStore.getChannelByName(channelName);
                                        let result = await messageStore.getNumOfPostInChann(user, channel[0]._id);
                                        res.json(result.length);
                                    } catch(err) {
                                        next(err);
                                    }
                                }
                            }
                        break;
                    }            
                break; 
                case "most_posts":
                    if (data.entities.question_type[0].value == "Who") {
                        if (data.entities.channel_name) {
                            try {
                                let channelName = data.entities.channel_name[0].value;
                                let channel = await channelStore.getChannelByName(channelName);
                                let posts = await messageStore.getAllPosts(channel[0]._id);
                                let userNames = await getUsersWithMostPosts(posts);
                                
                                // let users = mode(posts);
                                // let userObj = [];
                                // for (let i = 0; i < users.length; i++) {
                                //     let userArr = await userStore.getUserByID(users[i]);
                                //     userObj.push(userArr[0])
                                // }
                                // let userNames = userObj.map((ele) => {if (ele) return ele.firstname + " " + ele.lastname});
                                res.json(userNames);
                            } catch(err) {
                                next(err);
                            }
                        }
                    }
                break; 
                case "List all":
                    if (data.entities.question_type[0].value == "Who") {
                        if (data.entities.channel_name) {

                        }
                    }
                break;			
				default:
					res.send("Sorry, I'm not sure how to answer that. Please try again.");
			}
		})
		.catch(next);
    });

    async function getUsersWithMostPosts(array){
        if(array.length == 0)
            return null;
        var modeMap = {};
        var users = [];
        var maxEl = array[0].creatorid, maxCount = 1;
        for(var i = 0; i < array.length; i++)
        {
            var el = array[i].creatorid;
            if(modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;  
            if(modeMap[el] > maxCount)
            {
                maxCount = modeMap[el];
            }
        }
        Object.keys(modeMap).forEach((el) => {
            if (modeMap[el] == maxCount)
                users.push(el)
        });
        let userObj = [];
        for (let i = 0; i < users.length; i++) {
            let userArr = await userStore.getUserByID(users[i]);
            userObj.push(userArr[0])
        }
        let userNames = userObj.map((ele) => {if (ele) return ele.firstname + " " + ele.lastname});
        return userNames;
    }

    return router;
};