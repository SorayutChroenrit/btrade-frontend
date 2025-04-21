FROM node:20-alpine

# Set working directory
WORKDIR /src/app

# Copy package files first for better layer caching
COPY package.json yarn.lock* ./

# Install dependencies with specific flags to avoid permission issues
RUN yarn install --frozen-lockfile --no-cache

# Copy the rest of the application code
COPY . .

# Start the development server
CMD ["yarn", "dev"]