FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci && npx remotion browser ensure

COPY . .

# Bind-mount the host directory here when running the container.
VOLUME ["/opt/osbo/cotiza"]

CMD ["npm", "run", "render", "--", "--input", "/opt/osbo/cotiza/social.json", "--out-dir", "/opt/osbo/cotiza"]
