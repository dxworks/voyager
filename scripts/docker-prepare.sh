#!/usr/bin/env bash
# Puts the Linux bundles where the Dockerfile takes them from (release/voyager-full-linux-<x64|arm64>.zip):
# the image is built for linux/amd64 and linux/arm64, each from its own platform's bundle.
set -euo pipefail

mkdir -p release
for p in linux-x64 linux-arm64; do
  curl -fsSL -o "release/voyager-full-$p.zip" \
    "https://github.com/dxworks/voyager/releases/latest/download/voyager-full-$p.zip"
done
