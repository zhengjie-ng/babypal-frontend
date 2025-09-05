FROM node:22-alpine

WORKDIR /app

ENV PORT=5173

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "start"]