# Use an official Node.js base image (Alpine version for a smaller image size)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/alias-game

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --silent

# Copy the rest of the application files
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port where the application will run
EXPOSE 3000

# Default command to run the application in production mode
CMD ["npm", "run", "start:prod"]