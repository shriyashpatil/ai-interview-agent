# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Use envsubst to inject BACKEND_URL at runtime, default to local docker-compose name
ENV BACKEND_URL=http://backend:8080
ENV PORT=80

RUN apk add --no-cache gettext

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
