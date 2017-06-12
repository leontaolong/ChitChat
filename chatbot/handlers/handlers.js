"use strict";

const express = require('express');
const {
    Wit
} = require('node-wit');

//export a function from this module 
//that accepts a tasks store implementation
module.exports = function (channelStore, messageStore, userStore) {
    //create a new Mux
    let router = express.Router();

    const witaiToken = process.env.WITAITOKEN;
    const witaiClient = new Wit({
        accessToken: witaiToken
    });

    router.post('/v1/bot', (req, res, next) => {
        let question = req.body;
        console.log(question)
        let user = JSON.parse(req.get("User"));
        if (user == null) {
            res.status(400).send("user session state not found")
        } else {
            console.log(user);
            console.log(`user is asking ${question}`);
            witaiClient.message(question)
                .then(async data => {
                    console.log(JSON.stringify(data, undefined, 2));
                    switch (data.entities.intent[0].value) {
                        case "last post":
                            switch (data.entities.question_type[0].value) {
                                case "when":
                                    if (data.entities.channel_name) {
                                        try {
                                            let channelName = data.entities.channel_name[0].value;
                                            let channel = await channelStore.getChannelByName(channelName);
                                            let result = await messageStore.getLastPostInChann(user, channel[0]._id);
                                            console.log(result);
                                            res.send("Your last post to the " + channelName + " channel was at " + result[0].createdat + ".");
                                        } catch (err) {
                                            next(err);
                                        }
                                    } else {
                                        try {
                                            let result = await messageStore.getLastPost(user);
                                            res.send("Your last post was at " + result[0].createdat + ".");
                                        } catch (err) {
                                            next(err);
                                        }
                                    }
                                    break;
                            }
                            break;
                        case "posts":
                            switch (data.entities.question_type[0].value) {
                                case "How many":
                                    if (data.entities.channel_name) {
                                        if (data.entities.datetime) {
                                            try {
                                                let datetime = data.entities.datetime[0].value
                                                let channelName = data.entities.channel_name[0].value;
                                                let channel = await channelStore.getChannelByName(channelName);
                                                let result = await messageStore.getNumOfPostInChannWithDatetime(user, channel[0]._id, datetime);
                                                res.send("You made " + result.length + " posts to channel " + channelName + " " + datetime + ".");
                                            } catch (err) {
                                                next(err);
                                            }
                                        } else {
                                            try {
                                                let channelName = data.entities.channel_name[0].value;
                                                let channel = await channelStore.getChannelByName(channelName);
                                                let result = await messageStore.getNumOfPostInChann(user, channel[0]._id);
                                                res.send("You have made " + result.length + " posts to channel on datetime: " + channelName + ".")
                                            } catch (err) {
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
                                        res.send(userNames + " has made the most posts to channel " + channelName + ".")
                                    } catch (err) {
                                        next(err);
                                    }
                                }
                            }
                            break;
                        case "List all":
                            if (data.entities.question_type[0].value == "Who") {
                                if (data.entities.channel_name) {
                                    try {
                                        let channelName = data.entities.channel_name[0].value;
                                        let channel = await channelStore.getChannel(channelName);
                                        let memberNames = await getUserNameByID(channel[0].members);
                                        console.log(channel[0].members)
                                        res.send("All members in channel " + channelName + " : " + memberNames.join(", "));
                                    } catch (err) {
                                        next(err);
                                    }
                                }
                            }
                            if (data.entities.question_type[0].value == "Who hasn't") {
                                if (data.entities.channel_name) {
                                    try {
                                        let channelName = data.entities.channel_name[0].value;
                                        let channel = await channelStore.getChannel(channelName);
                                        let memberIds = channel[0].members;
                                        let users = await userStore.getAll();
                                        let authorizedIUsers = users.filter((user) => {
                                            if (channel[0].private) {
                                                return memberIds.includes(user._id)
                                            }
                                            return true;
                                        }).map((user) => user._id);
                                        let memberNames = await getUserNameByID(authorizedIUsers);
                                        res.send("People who have never posted to channel " + channelName + " are " + memberNames.join(", "));
                                    } catch (err) {
                                        next(err);
                                    }
                                }
                            }
                            break;

                        default:
                            res.send("Sorry, I'm not sure how to answer that. Please try again.");
                    }
                })
                .catch(next);
        }
    });

    async function getUsersWithMostPosts(array) {
        if (array.length == 0)
            return null;
        var modeMap = {};
        var users = [];
        var maxEl = array[0].creatorid,
            maxCount = 1;
        for (var i = 0; i < array.length; i++) {
            var el = array[i].creatorid;
            if (modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;
            if (modeMap[el] > maxCount) {
                maxCount = modeMap[el];
            }
        }
        Object.keys(modeMap).forEach((el) => {
            if (modeMap[el] == maxCount)
                users.push(el)
        });
        return getUserNameByID(users);
    }

    // takes in an array of userIDs and returns an array of corresponding usernames
    async function getUserNameByID(usernIds) {
        let userObj = [];
        for (let i = 0; i < usernIds.length; i++) {
            let userArr = await userStore.getUserByID(usernIds[i]);
            userObj.push(userArr[0])
        }
        let userNames = userObj.map((ele) => {
            if (ele) return ele.firstname + " " + ele.lastname
        });
        return userNames;
    }

    return router;
};