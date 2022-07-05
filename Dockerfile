# Stage 0 - use an official, larger base node image for installing dependencies
FROM node:16.15.1@sha256:6155ff062c403e99c1da7c317710c5c838c1e060f526d98baea6ee921ca61729 AS dependencies
 
LABEL maintainer="Haeun Kim <haeun159951@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV NODE_ENV=production

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
# (copy files & folders from build context to a path inside image)
COPY package*.json ./

# Install only production dependencies defined in package-lock.json
RUN npm ci --only=production

###################################################

#Stage 1 - pick an offical smaller base node image for production
FROM node:16.15.1-alpine3.15@sha256:1fafca8cf41faf035192f5df1a5387656898bec6ac2f92f011d051ac2344f5c9 AS production

RUN apk update && apk add --no-cache dumb-init=~1.2.5

# run using NODE_ENV=production
ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node --from=dependencies /app /app

# Copy src to /app/src/
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Add a user group node
USER node

# Start the container by running our server
CMD ["dumb-init", "node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

# Define an automated healthcheck
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail localhost:8080 || exit 1
