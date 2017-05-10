package messages

import (
	"challenges-leontaolong/apiserver/models/users"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

//MongoStore represents an concrete MongoDB store for model.message objects.
//This is used by the HTTP handlers to manage the channels and messages
type MongoStore struct {
	Session               *mgo.Session
	DatabaseName          string
	MessageCollectionName string
	ChannelCollectionName string
}

// //Query represents a json for querying from MongoDB

//GetAllChannels returns all channelsa a given user is allowed to see
func (ms *MongoStore) GetAllChannels(user *users.User) ([]*Channel, error) {
	channels := []*Channel{}
	query := bson.M{
		"$or": []bson.M{
			bson.M{"private": false},
			bson.M{"private": true,
				"members": user.ID}}}
	err := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).Find(query).All(&channels)
	if err != nil {
		return nil, err
	}
	return channels, nil
}

//InsertChannel Inserts a new channel and returns a Channel stuct
func (ms *MongoStore) InsertChannel(newChannel *NewChannel) (*Channel, error) {
	channel := newChannel.ToChannel()
	channel.ID = string(bson.NewObjectId())
	// channel.CreatorID = handlers.SessionState.User.ID
	err := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).Insert(channel)
	return channel, err
}

//GetMessages gets the most recent N messages posted to a particular channel
func (ms *MongoStore) GetMessages(num int, channel *Channel) ([]*Message, error) {
	messages := []*Message{}
	query := bson.M{"_channelId": channel.ID}
	err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).
		Find(query).
		Sort("-createdat").
		Limit(num).All(&messages)
	return messages, err
}

//UpdateChannel updates a channel's Name and Description and returns the updated Channel
func (ms *MongoStore) UpdateChannel(updates *ChannelUpdates, currentChannel *Channel) (*Channel, error) {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	currentChannel.Description = updates.Description
	currentChannel.Name = updates.Name
	dbUpdates := bson.M{"$set": updates}

	err := col.UpdateId(currentChannel.ID, dbUpdates)
	// for store testing purposes, uncomment the code below
	// to update the currentChannel model with the currentChannel from the store

	// ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).FindId(currentChannel.ID).One(currentChannel)
	return currentChannel, err
}

//DeleteChannel deletes a channel, as well as all messages posted to that channel
func (ms *MongoStore) DeleteChannel(channel *Channel) error {
	query := bson.M{"_id": channel.ID}
	return ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).Remove(query)
}

//AddMember adds a user to a channel's Members list
func (ms *MongoStore) AddMember(user *users.User, channel *Channel) error {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	query := bson.M{"_id": channel.ID}
	updates := bson.M{"$push": bson.M{"members": user.ID}}
	return col.Update(query, updates)
}

//RemoveMember removes a user from a channel's Members list
func (ms *MongoStore) RemoveMember(user *users.User, channel *Channel) error {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	query := bson.M{"_id": channel.ID}
	updates := bson.M{"$pull": bson.M{"members": user.ID}}
	return col.Update(query, updates)
}

//InsertMessage inserts a new message to a given channel
func (ms *MongoStore) InsertMessage(newMessage *NewMessage) (*Message, error) {
	message := newMessage.ToMessage()
	message.ID = string(bson.NewObjectId())
	err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).Insert(message)
	return message, err
}

//UpdateMessage updates an existing message and returns the updated message
func (ms *MongoStore) UpdateMessage(updates *MessageUpdate, currentMessage *Message) (*Message, error) {
	col := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName)
	currentMessage.Body = updates.Body
	dbUpdates := bson.M{"$set": updates}
	err := col.UpdateId(currentMessage.ID, dbUpdates)
	return currentMessage, err
}

//DeleteMessage deletes a given message
func (ms *MongoStore) DeleteMessage(message *Message) error {
	query := bson.M{"_id": message.ID}
	return ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).Remove(query)
}
