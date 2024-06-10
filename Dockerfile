FROM node:alpine as base

WORKDIR /app

COPY package.json ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

EXPOSE 3000

CMD ["node", "./index.cjs"]
