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

    getUserByID(userID) {
        return this.collection.find( { "_id" : userID}).limit(1).toArray();
    }

}

//export the class
module.exports = MongoStore;