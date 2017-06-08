package messages

import (
	"challenges-leontaolong/apiserver/models/users"
	"testing"

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

	// should be visible
	newChan := &NewChannel{
		Name:        "test",
		Description: "A test Desc",
		Members:     []users.UserID{"memberA", "memberB"},
		Private:     false,
	}

	// should NOT be visible
	newChan2 := &NewChannel{
		Name:        "test",
		Description: "A test Desc",
		Members:     []users.UserID{"memberA", "memberB"},
		Private:     true,
	}

	// should be visible
	newChan3 := &NewChannel{
		Name:        "test",
		Description: "A test Desc",
		Members:     []users.UserID{"memberA", "memberB", "memberC"},
		Private:     true,
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

	// sess.DB(store.DatabaseName).C(store.MessageCollectionName).RemoveAll(nil)
	// sess.DB(store.DatabaseName).C(store.ChannelCollectionName).RemoveAll(nil)

	channel, err := store.InsertChannel(newChan, usr.ID)
	if err != nil {
		t.Errorf("error inserting channel: %v\n", err)
	}
	if nil == channel {
		t.Fatalf("nil returned from MongoStore.InsertChannel()--you probably haven't implemented NewChannel.ToChannel() yet")
	}

	if len(string(channel.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	channel2, err := store.InsertChannel(newChan2, usr.ID)
	if err != nil {
		t.Errorf("error inserting channel: %v\n", err)
	}
	if nil == channel {
		t.Fatalf("nil returned from MongoStore.InsertChannel()--you probably haven't implemented NewChannel.ToChannel() yet")
	}

	if len(string(channel.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	channel3, err := store.InsertChannel(newChan3, usr.ID)
	if err != nil {
		t.Errorf("error inserting channel: %v\n", err)
	}
	if nil == channel {
		t.Fatalf("nil returned from MongoStore.InsertChannel()--you probably haven't implemented NewChannel.ToChannel() yet")
	}

	if len(string(channel.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	channels, err := store.GetAllChannels(usr.ID)
	if err != nil {
		t.Errorf("error getting all channels: %v\n", err)
	}
	if len(channels) != 2 {
		t.Errorf("incorrect length of all channels: expected %d but got %d\n", 2, len(channels))
	}
	for _, returnedChannel := range channels {
		if returnedChannel == channel2 {
			t.Errorf("channel should be invisible to the given user\n")
		}
	}
	if channels[0].ID != channel.ID {
		t.Errorf("ID of channels returned by GetAllChannels didn't match: expected %s but got %s\n", channel.ID, channels[0].ID)
	}
	if channels[1].ID != channel3.ID {
		t.Errorf("ID of channels returned by GetAllChannels didn't match: expected %s but got %s\n", channel3.ID, channels[1].ID)
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

	channel, err = store.GetChannel(channel.ID)
	if err != nil {
		t.Errorf("error getting channel with the given channelID")
	}

	err = store.AddMember(usr.ID, channel)
	if err != nil {
		t.Errorf("MongoDB adding member error: %s\n", err)
	}

	err = store.RemoveMember(usr.ID, channel)
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

	message, err := store.InsertMessage(newMsg, usr)
	if err != nil {
		t.Errorf("error inserting message: %v\n", err)
	}
	if nil == message {
		t.Fatalf("nil returned from MongoStore.InsertMessage()--you probably haven't implemented NewMessage.ToMessage() yet")
	}

	if len(string(message.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	message, err = store.GetMessage(message.ID)
	if err != nil {
		t.Errorf("error getting message with the given messageID")
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

	message2, err := store.InsertMessage(newMsg2, usr)
	if err != nil {
		t.Errorf("error inserting message: %v\n", err)
	}
	if nil == message2 {
		t.Fatalf("nil returned from MongoStore.InsertMessage()--you probably haven't implemented NewMessage.ToMessage() yet")
	}

	if len(string(message2.ID)) == 0 {
		t.Errorf("new ID is zero-length\n")
	}

	messages, err := store.GetMessages(2, channel.ID)
	if err != nil {
		t.Errorf("error getting messages: %v\n", err)
	}
	if len(messages) != 2 {
		t.Errorf("incorrect length of all messages: expected number of messages: 2 but got: %v\n", len(messages))
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
