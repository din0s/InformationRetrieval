FROM node:14

WORKDIR /krepa/query_processor

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=8080
EXPOSE ${PORT}

ENV NODE_ENV=production
ENTRYPOINT [ "node", "dist/index.js" ]
