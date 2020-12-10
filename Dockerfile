FROM node:13.12.0
MAINTAINER Avinash Billakantijhsdkhkhfbmnbmb
RUN mkdir /app
WORKDIR /app
ADD ./package.json /app/package.json
RUN npm install
ADD . /app
# CMD ["bash",  "-c",  "./wait-for-it.sh --timeout=0 db:27017 && npm run start-dev"]


