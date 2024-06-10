FROM node:alpine as base

WORKDIR /app

COPY package.json ./

RUN  yarn install --frozen-lockfile && yarn cache clean

COPY . .

CMD ["node", "./index.cjs"]