# Use an official Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the app (for frontend or server-side build step)
RUN npm run build

# Expose port (optional: only needed if you're running a web server)
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]

