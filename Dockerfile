# Base image with Node.js 20 (LTS)
FROM node:20-slim

# Install Python 3.11, system dependencies for Python, and Puppeteer dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    wget \
    gnupg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Backend Setup ---
# Copy requirements first for cache optimization
COPY src/requirements.txt ./src/requirements.txt

# Create virtual environment and install dependencies
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r src/requirements.txt

# Copy backend source code
COPY src ./src

# --- Frontend Setup ---
# Copy frontend source code
COPY anc-cpq ./anc-cpq

# Build Frontend
WORKDIR /app/anc-cpq
RUN npm install
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime Setup ---
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

# Expose Next.js port (EasyPanel routes traffic here)
EXPOSE 3000

# Start both services
CMD ["./start.sh"]
