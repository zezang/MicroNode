FROM node:18.5.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install

COPY ./src ./src

COPY ./assets ./assets

RUN npm run build

CMD ["npm", "start"]