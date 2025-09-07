# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../backend/package*.json ./
RUN npm install
COPY ../../backend/ .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY ../../backend/package*.json ./
RUN npm install --only=production
#
EXPOSE 5000
CMD ["node", "dist/server.js"]
