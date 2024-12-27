[ ! "$(docker ps | grep '6379->6379/tcp')" ] && docker run -d -p 6379:6379 redis
