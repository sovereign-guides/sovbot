FROM node:18-alpine

WORKDIR /sovbot
COPY . .

RUN yarn install
RUN yarn build

CMD ["node", "dist/index.js"]
