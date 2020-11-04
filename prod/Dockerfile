FROM node:10.15.3
MAINTAINER Avinash Billakanti
RUN mkdir /app
WORKDIR /app
ADD ./package.json /app/package.json
ADD ./config /app/config
ADD ./dist  /app/dist
ADD ./docs /app/docs
ADD ./wait-for-it.sh /app/wait-for-it.sh
ENV NODE_ENV=production
RUN npm install
# CMD ["bash",  "-c",  "./wait-for-it.sh --timeout=0 db:27017 && npm run start-prod"]

