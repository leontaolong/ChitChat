package handlers

import (
	"bytes"
	"challenges-leontaolong/apiserver/models/users"
	"challenges-leontaolong/apiserver/sessions"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

const headerAuthorization = "Authorization"

func TestAuth(t *testing.T) {
	testNewUser := &users.NewUser{
		Email:        "test@test.com",
		UserName:     "tester",
		FirstName:    "Test",
		LastName:     "Tester",
		Password:     "password",
		PasswordConf: "password",
	}

	cred := &users.Credentials{
		Email:    "test@test.com",
		Password: "password",
	}

	expectedUsr := &users.User{
		ID:        "",
		Email:     "test@test.com",
		UserName:  "tester",
		FirstName: "Test",
		LastName:  "Tester",
		PhotoURL:  "https://www.gravatar.com/avatar/b642b4217b34b1e8d3bd915fc65c4452",
	}

	ctx := &Context{
		SessionKey:   "sessionKey",
		SessionStore: sessions.NewMemStore(-1),
		UserStore:    users.NewMemStore(),
	}

	b := new(bytes.Buffer)

	badCred := &users.Credentials{
		Email:    "bad@test.com",
		Password: "badpassword",
	}

	// ========== Test UsersHandler's POST Method =====================
	json.NewEncoder(b).Encode(testNewUser)
	handler := http.HandlerFunc(ctx.UsersHandler)
	// construct responseRecorder and request
	resRec := httptest.NewRecorder()
	req, err := http.NewRequest("POST", "/", b)
	if err != nil {
		t.Fatal(err)
	}

	handler.ServeHTTP(resRec, req)
	// get the sessionID for secured communication
	sid := resRec.Header().Get(headerAuthorization)
	result := &users.User{}
	json.Unmarshal(resRec.Body.Bytes(), result)
	if err != nil {
		t.Errorf("error Unmarshaling json: " + err.Error())
		return
	}
	userID := result.ID
	if resRec.Code > http.StatusOK {
		t.Errorf("server response status not ok: %v \n", resRec.Code)
	}
	if result.Email != expectedUsr.Email || result.UserName != expectedUsr.UserName ||
		result.PhotoURL != expectedUsr.PhotoURL {
		t.Errorf("error in UsersHandler's POST Method: returned wrong user struct: got %v want %v", result, expectedUsr)
	}
	// set the expectedUsr to be the returned user
	expectedUsr = result

	// ====== Test UsersHandler's POST Method when ===================
	// ====== user with same email and username already exists ========
	resRec = httptest.NewRecorder()
	req, err = http.NewRequest("POST", "/", b)
	if err != nil {
		t.Fatal(err)
	}
	handler.ServeHTTP(resRec, req)
	result = &users.User{}
	json.Unmarshal(resRec.Body.Bytes(), result)
	if err != nil {
		t.Errorf("error Unmarshaling json: " + err.Error())
		return
	}
	if resRec.Code == http.StatusOK {
		t.Errorf("error in UsersHandler's POST Method: does not handle user with same credential properly")
	}

	// ============ Test UsersHandler's GET Method ========================
	resRec = httptest.NewRecorder()
	req, err = http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	var usrs []users.User
	handler.ServeHTTP(resRec, req)
	err = json.Unmarshal([]byte(resRec.Body.String()), &usrs)
	if err != nil {
		t.Errorf("err on Unmarshal json: " + err.Error())
		return
	}
	// chcek if UsersHandler return correct users
	if usrs[0].ID != expectedUsr.ID {
		t.Errorf("error in UsersHandler's GET Method: returned wrong user struct: got %v want %v", result, expectedUsr)
	}

	// ================ Test UsersMeHandler ==============================
	handler = http.HandlerFunc(ctx.UsersMeHandler)
	resRec = httptest.NewRecorder()
	req, err = http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	// Add sessionID authorization to Heander
	req.Header.Add(headerAuthorization, sid)
	handler.ServeHTTP(resRec, req)
	result = &users.User{}
	json.Unmarshal(resRec.Body.Bytes(), result)
	if err != nil {
		t.Errorf("error Unmarshaling json: " + err.Error())
		return
	}
	if resRec.Code > http.StatusOK {
		t.Errorf("server response status not ok %v \n", resRec.Code)
	}
	if result.ID != expectedUsr.ID {
		t.Errorf("error in UsersMeHandler: returned wrong user struct: got %v want %v", result, expectedUsr)
	}

	// ================= Test SessionsMineHandler =============================
	handler = http.HandlerFunc(ctx.SessionsMineHandler)
	resRec = httptest.NewRecorder()
	req, err = http.NewRequest("DELETE", "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Add(headerAuthorization, sid)
	handler.ServeHTTP(resRec, req)
	if resRec.Code > http.StatusOK {
		t.Errorf("server response status not ok %v \n", resRec.Code)
	}
	if resRec.Body.String() != "signout successful!" {
		t.Errorf("sign out fail: %v \n", resRec.Body)
	}

	// ============== test SessionsHandler with VALID Credential =================
	json.NewEncoder(b).Encode(cred)
	resRec = httptest.NewRecorder()
	handler = http.HandlerFunc(ctx.SessionsHandler)
	req, err = http.NewRequest("POST", "/", b)
	if err != nil {
		t.Fatal(err)
	}
	handler.ServeHTTP(resRec, req)
	if resRec.Code > http.StatusOK {
		t.Errorf("server response status not ok %v \n", resRec.Code)
	}
	user := &users.User{}
	err = json.Unmarshal(resRec.Body.Bytes(), user)
	if err != nil {
		t.Errorf("error Unmarshaling json: " + err.Error())
		return
	}
	if user.ID != userID {
		t.Errorf("error in SessionsHandler: returned wrong user struct: got %v want %v", user, expectedUsr)
	}

	// ============== test SessionsHandler with INVALID Credential =================
	json.NewEncoder(b).Encode(badCred)
	resRec = httptest.NewRecorder()
	handler = http.HandlerFunc(ctx.SessionsHandler)
	req, err = http.NewRequest("POST", "/", b)
	if err != nil {
		t.Fatal(err)
	}
	handler.ServeHTTP(resRec, req)
	if resRec.Code == http.StatusOK {
		t.Errorf("error in SessionsHandler: doesn't handle invalid credentials properly: " + resRec.Body.String())
	}
}
