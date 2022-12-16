FROM node:18-alpine

WORKDIR /sovbot
COPY . .

RUN yarn install --prod
RUN yarn start:prod
