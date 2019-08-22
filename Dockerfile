FROM node:lts AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g typescript

RUN npm install

COPY . .

RUN tsc

RUN mkdir data

RUN touch data/db.json

RUN find . -name "*.map" -type f -delete

FROM gcr.io/distroless/nodejs

COPY --from=builder /usr/src/app/dist /app

COPY --from=builder /usr/src/app/node_modules /app/node_modules

COPY --from=builder /usr/src/app/data /app/data

VOLUME [ "/app/data" ]

WORKDIR /app

CMD ["bot.js"]
