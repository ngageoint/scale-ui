FROM node:latest

# Put code at /usr/src/scale-ui-api
RUN mkdir -p /usr/src/scale-ui-api
WORKDIR /usr/src/scale-ui-api
COPY . /usr/src/scale-ui-api

RUN npm install

# Our app will run on port 9000
EXPOSE 8081

# Start a hapi server on port 9000
CMD [ "npm", "start" ]
