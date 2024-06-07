FROM node:20

WORKDIR /Server


COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD [ "node","server.js" ]
