FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY database/ ./database/

EXPOSE 5001

CMD ["node", "src/server.js"]