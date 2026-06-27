FROM node:22-alpine

# Install Chromium for Remotion rendering
RUN apk add --no-cache chromium ffmpeg

ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files first for caching
COPY packages/video-engine/package.json packages/video-engine/
COPY packages/video-engine/remotion.config.ts packages/video-engine/
COPY packages/video-orchestrator/package.json packages/video-orchestrator/

# Install dependencies for both packages
RUN cd packages/video-engine && npm install
RUN cd packages/video-orchestrator && npm install

# Copy source code
COPY packages/video-engine/src packages/video-engine/src
COPY packages/video-engine/public packages/video-engine/public
COPY packages/video-orchestrator/src packages/video-orchestrator/src

WORKDIR /app/packages/video-orchestrator

EXPOSE 4000

CMD ["npm", "run", "start"]
