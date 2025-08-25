FROM node:20-alpine

WORKDIR /app

# Copy backend dependencies and install
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci

# Expose ports for backend (3001) and frontend (5000)
EXPOSE 3001 5000