
# Use Node.js 22 image
FROM node:22-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy project files
COPY . .

# Application ports
EXPOSE 4300
EXPOSE 4304

# Start dashboard backend
CMD ["node", "server.js"]

