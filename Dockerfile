# ===========================
# Stage 1: Dependencies
# ===========================
FROM node:22-alpine AS deps

WORKDIR /app

COPY src/backend/package.json ./
RUN npm ci --only=production

# ===========================
# Stage 2: Production
# ===========================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY src/backend/ ./
COPY .env .env

# Create uploads and logs directories
RUN mkdir -p uploads logs && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
