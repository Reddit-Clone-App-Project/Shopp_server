FROM node:24-alpine3.21
WORKDIR /server
COPY . .
RUN adduser -D shopp_server
USER shopp_server
RUN npm install && npm run build
CMD ["node", "./dist/server.js"]
