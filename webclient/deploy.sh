# on development machine
docker build -t leontaolong/info344webclient .
docker push leontaolong/info344webclient

# on deployment server
docker pull leontaolong/info344webclient
# docker stop and rm current running container
docker run -d --name 344client -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt:ro leontaolong/info344webclient