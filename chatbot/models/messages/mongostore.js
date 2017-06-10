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
}

//export the class
module.exports = MongoStore;