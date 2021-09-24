FROM node:16-alpine

WORKDIR /app

COPY . .

EXPOSE 4000

RUN npm install

CMD [ "npm", "start" ]