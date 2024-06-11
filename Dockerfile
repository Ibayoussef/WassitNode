# Stage 1: Build the Node.js application
FROM node:alpine as build

WORKDIR /app

COPY package.json ./

RUN bun install 

COPY . .

# Ensure Node.js server listens on all network interfaces
ENV HOST 0.0.0.0
ENV PORT 3000

# Start the Node.js application
CMD ["bun", "run","./index.cjs"]

# Stage 2: Setup NGINX to serve the application
FROM nginx:alpine

COPY --from=build /app /app
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
