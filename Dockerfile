FROM node:18-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV DATABASE_URL="file:/app/dev.db"
ENV NEXT_PUBLIC_API_URL="http://localhost:3000"

# Create database
RUN npx prisma db push

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 