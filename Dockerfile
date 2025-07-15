# Upwind MCP Server Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S upwind -u 1001

# Change ownership of the app directory
RUN chown -R upwind:nodejs /app
USER upwind

# Expose port (if needed for health checks)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
