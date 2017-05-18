package users

import (
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

//MongoStore represents an concrete MongoDB store for model.User objects.
//This is used by the HTTP handlers to insert new users,
//get users, and update users.
type MongoStore struct {
	Session        *mgo.Session
	DatabaseName   string
	CollectionName string
}

//Query represents a json for querying from MongoDB
type Query struct {
	Email    string `json:"email"`
	UserName string `json:"userName"`
}

//GetAll returns all users
func (ms *MongoStore) GetAll() ([]*User, error) {
	usrs := []*User{}
	err := ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).Find(nil).All(&usrs)
	if err != nil {
		return nil, err
	}
	return usrs, nil
}

//GetByID returns the User with the given ID
func (ms *MongoStore) GetByID(id UserID) (*User, error) {
	usr := &User{}
	err := ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).FindId(id).One(usr)
	return usr, err
}

//GetByEmail returns the User with the given email
func (ms *MongoStore) GetByEmail(email string) (*User, error) {
	usr := &User{}
	query := bson.M{"email": email}
	err := ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).Find(query).One(usr)
	return usr, err
}

//GetByUserName returns the User with the given user name
func (ms *MongoStore) GetByUserName(name string) (*User, error) {
	usr := &User{}
	query := bson.M{"username": name}
	err := ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).Find(query).One(usr)
	return usr, err
}

//Insert inserts a new NewUser into the store
//and returns a User with a newly-assigned ID
func (ms *MongoStore) Insert(newUser *NewUser) (*User, error) {
	usr, err := newUser.ToUser()
	if err != nil {
		return nil, err
	}
	usr.ID = UserID(bson.NewObjectId())
	err = ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).Insert(usr)
	return usr, err
}

//Update applies UserUpdates to the currentUser
func (ms *MongoStore) Update(usrUpdate *UserUpdates, currentUser *User) error {
	col := ms.Session.DB(ms.DatabaseName).C(ms.CollectionName)
	currentUser.FirstName = usrUpdate.FirstName
	currentUser.LastName = usrUpdate.LastName
	err := col.UpdateId(currentUser.ID, currentUser)
	// for store testing purposes, uncomment the code below
	// to update the currentUser model with the currentUser from the store

	// ms.Session.DB(ms.DatabaseName).C(ms.CollectionName).FindId(currentUser.ID).One(currentUser)
	return err
}
