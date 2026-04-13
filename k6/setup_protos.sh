#!/bin/bash
set -euo pipefail

# Fetch bragi proto definitions from bragischema repo
BRAGI_REPO="https://github.com/oddin-gg/bragischema.git"
PROTO_DIR="bragi_proto"
TMP_DIR="$PROTO_DIR.tmp"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

rm -rf "$PROTO_DIR"
git clone --depth 1 --filter=blob:none --sparse "$BRAGI_REPO" "$TMP_DIR"
cd "$TMP_DIR"
git sparse-checkout set proto
cd ..
mv "$TMP_DIR/proto" "$PROTO_DIR"
echo "Bragi protos fetched into $PROTO_DIR/"
