#!/bin/sh
set -eu

mkdir -p /data/videos
chown -R app:app /data
exec su-exec app "$@"
