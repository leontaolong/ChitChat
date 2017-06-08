docker run -d -p 27017:27017 -v ~/data:/data/db mongo
export DBADDR=127.0.0.1:27017
export REDISADDR=127.0.0.1:6379
export TLSKEY=./tls/privkey.pem
export TLSCERT=./tls/fullchain.pem