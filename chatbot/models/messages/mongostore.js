"use strict";

const mongodb = require('mongodb'); //for mongodb.ObjectID()

/**
 * MongoStore is a concrete store for Message and Channel models
 */
class MongoStore {
    /**
     * Constructs a new MongoStore
     * @param {mongodb.Collection} collection 
     */
    constructor(collection) {
        this.collection = collection;
    }

    /**
     * getAll returns all tasks in the store
     */
    getAll() {
        return this.collection.find().toArray();
    }

    getLastPost(user) {
        return this.collection.find( { "creatorid" : "Y\t\ufffd\ufffd\ufffd\ufffd\ufffdЛ\ufffde\t"}).sort({
                "createdat": -1
            }).limit(1).toArray();
    }

    getLastPostInChann(user, channelID) {
        return this.collection.find( { "creatorid" : "Y\t\ufffd\ufffd\ufffd\ufffd\ufffdЛ\ufffde\t", "_channelId" : channelID})
        .sort({
                "createdat": -1
            }).limit(1).toArray();
    }

    getNumOfPostInChann(user, channelID) {
        return this.collection.find( { "creatorid" : "Y\t\ufffd\ufffd\ufffd\ufffd\ufffdЛ\ufffde\t", "_channelId" : channelID}).toArray();
    }

    getNumOfPostInChannWithDatetime(user, channelID, datetime) {
        var startDate = new Date(datetime);
        startDate.setSeconds(0);
        startDate.setHours(0);
        startDate.setMinutes(0);

        var dateMidnight = new Date(datetime);
        dateMidnight.setHours(23);
        dateMidnight.setMinutes(59);
        dateMidnight.setSeconds(59);

        return this.collection.find( { "creatorid" : "Y\t\ufffd\ufffd\ufffd\ufffd\ufffdЛ\ufffde\t", "_channelId" : channelID,
        "createdat" : { $gt: startDate, 
                        $lt: dateMidnight}}
        ).toArray();
    }

    getAllPosts(channelID) {
        return this.collection.find( {"_channelId" : channelID}).toArray();
    }
}

//export the class
module.exports = MongoStore;