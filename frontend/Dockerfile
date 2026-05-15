# syntax=docker/dockerfile:1.7

############################################
# 1. Build the Vite SPA
############################################
FROM node:22-alpine AS build
WORKDIR /app

ENV CI=true
ENV NODE_ENV=production

# Allow overriding API URL at build time so the bundled JS hits the right host.
# Vite reads only variables prefixed with VITE_ and inlines them at build time.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json package-lock.json* ./
# Use ci when a lockfile exists for reproducible installs, fall back to install
# during very early development before a lockfile has been committed.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

############################################
# 2. Serve with Nginx
############################################
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
