FROM andersfylling/disgord:latest as builder
WORKDIR /build
COPY . /build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags \"-static\"' -o reactroles .

FROM gcr.io/distroless/base
WORKDIR /bot
COPY --from=builder /build/reactroles .
CMD ["/bot/reactroles"]