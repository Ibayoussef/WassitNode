# Stage 1: Build the Node.js application
FROM node:alpine as build

WORKDIR /app

COPY package.json ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

# Stage 2: Setup NGINX to serve the application
FROM nginx:alpine

COPY --from=build /app /app
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
