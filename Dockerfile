FROM node:24-alpine3.21
COPY . /server
RUN chmod -R 700 /server
RUN adduser -D shopp_server
RUN chown -R shopp_server:shopp_server /server
USER shopp_server
WORKDIR /server
RUN npm install && npm run build
CMD ["node", "./dist/server.js"]
