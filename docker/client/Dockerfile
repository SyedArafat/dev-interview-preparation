# ============================================================
# Stage 1 — base: shared foundation
# ============================================================
FROM node:23-alpine AS base

WORKDIR /app

# Useful utilities for debugging inside the container
RUN apk add --no-cache nano curl bash

# ============================================================
# Stage 2 — development: hot-reload dev server
# ============================================================
FROM base AS development

ARG FE_FOLDER=client/

# Copy package files first to leverage Docker layer cache
COPY ${FE_FOLDER}package*.json ./

RUN npm install

# Copy the rest of the source
COPY ${FE_FOLDER} ./

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ============================================================
# Stage 3 — build: compile the production bundle
# ============================================================
FROM base AS build

ARG FE_FOLDER=client/

COPY ${FE_FOLDER}package*.json ./

# Use 'ci' for clean, reproducible installs
RUN npm ci

COPY ${FE_FOLDER} ./

RUN npm run build

# ============================================================
# Stage 4 — production: serve with nginx (minimal image)
# ============================================================
FROM nginx:1.27-alpine AS production

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy the built bundle from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/client/nginx.conf /etc/nginx/conf.d/default.conf

# Run nginx as non-root for better security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fs http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

