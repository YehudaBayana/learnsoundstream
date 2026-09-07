FROM golang:1.24-bookworm

WORKDIR /app

# Install ffmpeg, Python3, and download yt-dlp binary
RUN apt-get update && \
    apt-get install -y ffmpeg curl python3 && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy go mod and sum files
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN go build -o server ./cmd/server

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./server"]
