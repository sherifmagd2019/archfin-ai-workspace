# --- Stage 1: Build the React Application ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations and install dependencies
COPY package.json bun.lock ./
RUN npm install

# Copy all source files and compile the production build
COPY . .
RUN npm run build

# --- Stage 2: Serve the App using Nginx ---
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the serverless container handler
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
