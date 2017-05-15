package messages

import (
	"challenges-leontaolong/apiserver/models/users"

	"time"

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

//GetAllChannels returns all channelsa a given user is allowed to see
func (ms *MongoStore) GetAllChannels(userID users.UserID) ([]*Channel, error) {
	channels := []*Channel{}
	query := bson.M{
		"$or": []bson.M{
			bson.M{"private": false},
			bson.M{"private": true,
				"members": userID}}}
	err := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).Find(query).All(&channels)
	if err != nil {
		return nil, err
	}
	return channels, nil
}

//InsertChannel Inserts a new channel and returns a Channel stuct
func (ms *MongoStore) InsertChannel(newChannel *NewChannel, creatorID users.UserID) (*Channel, error) {
	channel := newChannel.ToChannel()
	channel.ID = bson.NewObjectId().Hex()
	channel.CreatorID = creatorID
	err := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).Insert(channel)
	return channel, err
}

//GetMessages gets the most recent N messages posted to a particular channel
func (ms *MongoStore) GetMessages(num int, channelID string) ([]*Message, error) {
	messages := []*Message{}
	query := bson.M{"_channelId": channelID}
	err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).
		Find(query).
		Sort("-createdat").
		Limit(num).All(&messages)
	return messages, err
}

//GetChannel takes in a channelID and returns the corresponding channel
func (ms *MongoStore) GetChannel(channelID string) (*Channel, error) {
	channel := &Channel{}
	err := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).FindId(channelID).One(&channel)
	if err != nil {
		return nil, err
	}
	return channel, nil
}

//DeleteMessages deletes all messages of the given channelID
func (ms *MongoStore) DeleteMessages(channelID string) error {
	query := bson.M{"_channelId": channelID}
	_, err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).RemoveAll(query)
	return err
}

//UpdateChannel updates a channel's Name and Description and returns the updated Channel
func (ms *MongoStore) UpdateChannel(updates *ChannelUpdates, currentChannel *Channel) (*Channel, error) {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	currentChannel.Description = updates.Description
	currentChannel.Name = updates.Name
	dbUpdates := bson.M{"$set": updates}
	err := col.UpdateId(currentChannel.ID, dbUpdates)
	return currentChannel, err
}

//DeleteChannel deletes a channel, as well as all messages posted to that channel
func (ms *MongoStore) DeleteChannel(channel *Channel) (error, error) {
	return ms.DeleteMessages(channel.ID),
		ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName).RemoveId(channel.ID)
}

//AddMember adds a user to a channel's Members list
func (ms *MongoStore) AddMember(userID users.UserID, channel *Channel) error {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	query := bson.M{"_id": channel.ID}
	updates := bson.M{"$push": bson.M{"members": userID}}
	return col.Update(query, updates)
}

//RemoveMember removes a user from a channel's Members list
func (ms *MongoStore) RemoveMember(userID users.UserID, channel *Channel) error {
	col := ms.Session.DB(ms.DatabaseName).C(ms.ChannelCollectionName)
	query := bson.M{"_id": channel.ID}
	updates := bson.M{"$pull": bson.M{"members": userID}}
	return col.Update(query, updates)
}

//InsertMessage inserts a new message to a given channel
func (ms *MongoStore) InsertMessage(newMessage *NewMessage, creator *users.User) (*Message, error) {
	message := newMessage.ToMessage()
	message.ID = bson.NewObjectId().Hex()
	message.CreatorID = creator.ID
	err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).Insert(message)
	return message, err
}

//GetMessage takes in a messageID and retrurns the corresponding message
func (ms *MongoStore) GetMessage(messageID string) (*Message, error) {
	message := &Message{}
	err := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).FindId(messageID).One(&message)
	if err != nil {
		return nil, err
	}
	return message, nil
}

//UpdateMessage updates an existing message and returns the updated message
func (ms *MongoStore) UpdateMessage(updates *MessageUpdate, currentMessage *Message) (*Message, error) {
	col := ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName)
	currentMessage.Body = updates.Body
	err := col.UpdateId(currentMessage.ID, bson.M{"$set": bson.M{"editedAt": time.Now(), "body": updates.Body}})
	return currentMessage, err
}

//DeleteMessage deletes a given message
func (ms *MongoStore) DeleteMessage(message *Message) error {
	return ms.Session.DB(ms.DatabaseName).C(ms.MessageCollectionName).RemoveId(message.ID)
}
