#!/usr/bin/env bash
# Puts the full bundle where the Dockerfile copies it from (release/voyager-full.zip).
set -euo pipefail

mkdir -p release
curl -fsSL -o release/voyager-full.zip \
  "https://github.com/dxworks/voyager/releases/latest/download/voyager-full.zip"
