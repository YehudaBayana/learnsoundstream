FROM golang:1.27.0-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.20

# yt-dlp is a Python zipapp, so it needs python3; ffmpeg is used for stream processing.
RUN apk add --no-cache ffmpeg python3 ca-certificates curl && \
    curl -fL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    apk del curl && \
    adduser -D -u 10001 app

COPY --from=build /server /usr/local/bin/server

USER app
EXPOSE 8080
CMD ["server"]
