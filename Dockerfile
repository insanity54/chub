FROM electronuserland/builder:wine

WORKDIR /app
COPY package.json pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .

CMD [ "pnpm", "run", "build" ]
