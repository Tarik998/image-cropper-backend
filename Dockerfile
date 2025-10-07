FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --force

COPY src/ ./src/

EXPOSE 5001

CMD ["sh", "-c", "npx typeorm migration:run -d src/database/index.js && node src/server.js"]