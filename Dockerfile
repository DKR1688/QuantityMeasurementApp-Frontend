FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY deployment/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY deployment/frontend/docker-entrypoint.d/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
COPY --from=build /app/dist/angular-app /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80
