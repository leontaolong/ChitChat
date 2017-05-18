package users

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"io"
	"net/mail"

	"golang.org/x/crypto/bcrypt"
)

//gravatarBasePhotoURL is the base URL for Gravatar profile photos
const gravatarBasePhotoURL = "https://www.gravatar.com/avatar/"
const bcryptCost = 13

//UserID defines the type for user IDs
type UserID string

//User represents a user account in the database
type User struct {
	ID        UserID `json:"id" bson:"_id"`
	Email     string `json:"email"`
	PassHash  []byte `json:"-" bson:"passHash"` //stored in mongo, but never encoded to clients
	UserName  string `json:"userName"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	PhotoURL  string `json:"photoURL"`
}

//Credentials represents user sign-in credentials
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//NewUser represents a new user signing up for an account
type NewUser struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
	UserName     string `json:"userName"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
}

//UserUpdates represents updates one can make to a user
type UserUpdates struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
}

//Validate validates the new user
func (nu *NewUser) Validate() error {
	//ensure Email field is a valid Email
	//HINT: use mail.ParseAddress()
	//https://golang.org/pkg/net/mail/#ParseAddress
	_, err := mail.ParseAddress(nu.Email)
	if err != nil {
		return errors.New("error parsing email: " + err.Error())
	}

	//ensure Password is at least 6 chars
	if len(nu.Password) < 6 {
		return errors.New("password should be at least 6 characters")
	}

	//ensure Password and PasswordConf match
	if nu.Password != nu.PasswordConf {
		return errors.New("password confirmation does not match")
	}

	//ensure UserName has non-zero length
	if len(nu.UserName) == 0 {
		return errors.New("username cannot have zero length")
	}

	//if you made here, it's valid, so return nil
	return nil
}

//ToUser converts the NewUser to a User
func (nu *NewUser) ToUser() (*User, error) {
	//build the Gravatar photo URL by creating an MD5
	//hash of the new user's email address, converting
	//that to a hex string, and appending it to their base URL:
	//https://www.gravatar.com/avatar/ + hex-encoded md5 has of email
	h := md5.New()
	io.WriteString(h, nu.Email)
	src := h.Sum(nil)
	dst := make([]byte, hex.EncodedLen(len(src)))
	hex.Encode(dst, src)
	photoURL := gravatarBasePhotoURL + string(dst)
	//construct a new User setting the various fields
	//but don't assign a new ID here--do that in your
	//concrete Store.Insert() method
	usr := &User{
		Email:     nu.Email,
		UserName:  nu.UserName,
		FirstName: nu.FirstName,
		LastName:  nu.LastName,
		PhotoURL:  photoURL,
	}

	// call the User's SetPassword() method to set the password,
	// which will hash the plaintext password
	err := usr.SetPassword(nu.Password)
	if err != nil {
		return nil, err
	}
	//return the User and nil
	return usr, nil
}

//SetPassword hashes the password and stores it in the PassHash field
func (u *User) SetPassword(password string) error {
	//hash the plaintext password using an adaptive
	//crytographic hashing algorithm like bcrypt
	//https://godoc.org/golang.org/x/crypto/bcrypt
	passhash, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return errors.New("error hashing password: " + err.Error())
	}
	//set the User's PassHash field to the resulting hash
	u.PassHash = passhash
	return nil
}

//Authenticate compares the plaintext password against the stored hash
//and returns an error if they don't match, or nil if they do
func (u *User) Authenticate(password string) error {
	//compare the plaintext password with the PassHash field
	//using the same hashing algorithm you used in SetPassword
	passhash := u.PassHash
	err := bcrypt.CompareHashAndPassword(passhash, []byte(password))
	if err != nil {
		return errors.New("Invalid Password")
	}
	return nil
}
