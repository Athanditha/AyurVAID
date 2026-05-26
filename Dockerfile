# =========================================================
# Stage 1: Build the Next.js Frontend
# =========================================================
FROM node:18-slim AS client-builder

WORKDIR /app/client

# Copy package descriptors and install dependencies
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source code and compile production build
COPY client/ ./
ENV NODE_ENV=production
RUN npm run build

# =========================================================
# Stage 2: Complete Self-Contained Runtime Stack
# =========================================================
FROM node:18-slim AS runner

WORKDIR /app

# Install Python 3, pip, and system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Root/Backend package descriptors and install production node_modules
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy Express Server files and ML datasets
COPY server/ ./server/
COPY datasets/ ./datasets/

# Copy precompiled Next.js client, node_modules, and configuration
COPY --from=client-builder /app/client/package*.json ./client/
COPY --from=client-builder /app/client/node_modules ./client/node_modules
COPY --from=client-builder /app/client/.next ./client/.next
COPY --from=client-builder /app/client/public ./client/public
COPY --from=client-builder /app/client/next.config.js ./client/

# Copy and install Python ML dependencies
COPY server/python/requirements.txt ./server/python/
RUN pip install --no-cache-dir --break-system-packages -r ./server/python/requirements.txt

# Copy orchestration script and apply execution permissions
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Expose Next.js server port (which proxies API requests internally to Express)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHON_API_URL=http://127.0.0.1:8000

# Launch all three services concurrently
CMD ["./entrypoint.sh"]
