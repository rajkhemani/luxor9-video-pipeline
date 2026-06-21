FROM node:22-alpine

RUN apk add --no-cache chromium ffmpeg

ENV CHROMIUM_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser
ENV REMOTION_PROJECT_DIR=/app/packages/video-engine
ENV REMOTION_OUTPUT_DIR=/app/output/videos

WORKDIR /app

# Must run from LUXOR9 root: docker build -f deploy/video-pipeline/Dockerfile .

COPY packages/video-engine/package.json packages/video-engine/package-lock.json \
  packages/video-engine/remotion.config.ts packages/video-engine/tsconfig.json \
  ./packages/video-engine/

COPY packages/video-orchestrator/package.json packages/video-orchestrator/package-lock.json \
  packages/video-orchestrator/tsconfig.json \
  ./packages/video-orchestrator/

RUN cd packages/video-engine && npm install && cd ../..
RUN cd packages/video-orchestrator && npm install && cd ../..

COPY packages/video-engine/src ./packages/video-engine/src
COPY packages/video-engine/public ./packages/video-engine/public
COPY packages/video-orchestrator/src ./packages/video-orchestrator/src

RUN mkdir -p /app/output/videos

EXPOSE 4000
CMD ["npx", "tsx", "packages/video-orchestrator/src/server.ts"]
