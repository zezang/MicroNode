FROM node:18.5.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY tsconfig.json ./

COPY ./assets ./assets

RUN npm install

COPY ./src ./src

RUN npm run build

ENV NODE_ENV=production

CMD ["npm", "start"]