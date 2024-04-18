# Fetching the latest node image on apline linux
FROM node:18.16.0-buster-slim AS builder

# Declaring env
ENV NODE_ENV staging

# Setting up the work directory
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json ./

# Install dependencies
RUN npm install

# Copying all the files in our project
COPY . .

## Build the app
RUN npm run build:staging

# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy .env file
# COPY .env.staging .

# EXPOSE 3000

# Copying our nginx.conf
COPY devops/nginx.conf /etc/nginx/conf.d/default.conf