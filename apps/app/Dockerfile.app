ARG PACKAGE_NAME=app
ARG TURBO_VERSION=2.5.8
ARG TINI_VERSION=v0.19.0

FROM node:24-slim AS core
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ARG TINI_VERSION
ADD "https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static" /tini
RUN  chmod +x /tini
RUN pnpm i -g turbo@${TURBO_VERSION}

FROM core AS prunner
ARG PACKAGE_NAME

COPY --chown=node:node . .
RUN turbo prune --scope=${PACKAGE_NAME} --docker

FROM core AS builder
ARG PACKAGE_NAME

COPY --from=prunner /app/out/json ./

RUN pnpm i --frozen-lockfile
COPY  --from=prunner /app/out/full ./
RUN turbo build --filter=${PACKAGE_NAME}

FROM core AS deps
ARG PACKAGE_NAME

COPY --from=prunner /app/out/json ./
RUN pnpm deploy ${PACKAGE_NAME} --prod --filter=${PACKAGE_NAME} --legacy

FROM gcr.io/distroless/nodejs24-debian12:debug-nonroot AS runner
WORKDIR /app
ARG PACKAGE_NAME

COPY --chown=nonroot:nonroot --from=builder /app/apps/${PACKAGE_NAME}/dist ./
COPY --chown=nonroot:nonroot --from=deps /app/${PACKAGE_NAME}/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=core /tini ./tini

ENV NODE_OPTIONS="--enable-source-maps"

USER nonroot

ENTRYPOINT ["/app/tini", "--", "/nodejs/bin/node"]

CMD ["index.js"]