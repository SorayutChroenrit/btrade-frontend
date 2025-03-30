FROM node:20-alpine

WORKDIR /src/app

COPY . .

RUN yarn install

CMD ["yarn", "dev"]


