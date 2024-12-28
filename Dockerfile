FROM node:22-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache build-base bash vim git curl

ADD . /app

WORKDIR /app

RUN yarn
RUN yarn run build

EXPOSE 8421