const dbAddr = process.env.DBADDR;
const funcs = {
    getLastMessages : function (db, user, callback) {
        var cursor = db.collection('messages').find().sort({
                "createdAt": 1
            }).limit(1);
        cursor.each(function (err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                console.dir(doc);
            } else {
                callback(doc);
            }
        });
    }
}