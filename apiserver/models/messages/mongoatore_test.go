package messages

import (
	"testing"

	"challenges-leontaolong/apiserver/models/users"

	mgo "gopkg.in/mgo.v2"
)

func TestMongoStore(t *testing.T) {
	sess, err := mgo.Dial("localhost:27017")
	if err != nil {
		t.Fatalf("error dialing Mongo: %v", err)
	}
	defer sess.Close()

	store := &MongoStore{
		Session:               sess,
		DatabaseName:          "test",
		MessageCollectionName: "messages",
		ChannelCollectionName: "channels",
	}

	newChan := &NewChannel{
		Name:        "test",
		Description: "A test Desc",
		Members:     []users.UserID{"memberA", "memberB"},
		Private:     false,
	}

	usr := &users.User{
		ID:        "memberC",
		Email:     "test@test.test",
		PassHash:  []byte("testtest"),
		UserName:  "tester",
		FirstName: "test",
		LastName:  "tester",
		PhotoURL:  "testtest",
	}

	channel, err := store.InsertChannel(newChan)
	if err != nil {
		t.Errorf("error inserting channel: %v\n", err)
	}
	if nil == channel {
		t.Fatalf("nil returned from MongoStore.InsertChannel()--you probably haven't implemented NewChannel.ToChannel() yet")
	}

	if len(string(channel.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	channels, err := store.GetAllChannels(usr)
	if err != nil {
		t.Errorf("error getting all channels: %v\n", err)
	}
	if len(channels) != 1 {
		t.Errorf("incorrect length of all channels: expected %d but got %d\n", 1, len(channels))
	}
	if channels[0].ID != channel.ID {
		t.Errorf("ID of channels returned by GetAllChannels didn't match: expected %s but got %s\n", channels[0].ID, channel.ID)
	}

	chanUpdates := &ChannelUpdates{
		Name:        "UPDATED Name",
		Description: "UPDATED Desc",
	}

	updatedChan, err := store.UpdateChannel(chanUpdates, channel)
	if err != nil {
		t.Errorf("error updating channel: %v\n", err)
	}
	if updatedChan.Name != "UPDATED Name" {
		t.Errorf("Name field not updated: expected `UPDATED Name` but got `%s`\n", updatedChan.Name)
	}
	if updatedChan.Description != "UPDATED Desc" {
		t.Errorf("Description field not updated: expected `UPDATED Desc` but got `%s`\n", updatedChan.Description)
	}

	err = store.AddMember(usr, channel)
	if err != nil {
		t.Errorf("MongoDB adding member error: %s\n", err)
	}

	err = store.RemoveMember(usr, channel)
	if err != nil {
		t.Errorf("MongoDB removing member error: %s\n", err)
	}

	newMsg := &NewMessage{
		ChannelID: channel.ID,
		Body:      "test message body 1",
	}

	newMsg2 := &NewMessage{
		ChannelID: channel.ID,
		Body:      "test message body 2",
	}

	message, err := store.InsertMessage(newMsg)
	if err != nil {
		t.Errorf("error inserting message: %v\n", err)
	}
	if nil == message {
		t.Fatalf("nil returned from MongoStore.InsertMessage()--you probably haven't implemented NewMessage.ToMessage() yet")
	}

	if len(string(message.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	msgUpdate := &MessageUpdate{
		Body: "UPDATED body",
	}

	updatedMsg, err := store.UpdateMessage(msgUpdate, message)
	if err != nil {
		t.Errorf("error updating message: %v\n", err)
	}
	if updatedMsg.Body != "UPDATED body" {
		t.Errorf("Message body not updated: expected `UPDATED body` but got `%s`\n", updatedMsg.Body)
	}

	message2, err := store.InsertMessage(newMsg2)
	if err != nil {
		t.Errorf("error inserting message: %v\n", err)
	}
	if nil == message2 {
		t.Fatalf("nil returned from MongoStore.InsertMessage()--you probably haven't implemented NewMessage.ToMessage() yet")
	}

	if len(string(message2.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	messages, err := store.GetMessages(2, channel)
	if err != nil {
		t.Errorf("error getting messages: %v\n", err)
	}
	if len(messages) != 2 {
		t.Errorf("returned messages not enough, expected number of messages: 2 but got: %v\n", len(messages))
	}
	if messages[0].Body != message2.Body {
		t.Errorf("error getting most recent messages: expected `test message body 2` but got `%s`\n", messages[0].Body)
	}

	err = store.DeleteMessage(message)
	if err != nil {
		t.Errorf("error deleting message: %v\n", err)
	}

	err = store.DeleteChannel(channel)
	if err != nil {
		t.Errorf("error deleting channel: %v\n", err)
	}

	sess.DB(store.DatabaseName).C(store.MessageCollectionName).RemoveAll(nil)
	sess.DB(store.DatabaseName).C(store.ChannelCollectionName).RemoveAll(nil)
}
