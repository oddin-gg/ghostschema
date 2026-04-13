#!/bin/bash
# Fetch bragi proto definitions from bragischema repo
BRAGI_REPO="https://github.com/oddin-gg/bragischema.git"
PROTO_DIR="bragi_proto"

rm -rf "$PROTO_DIR"
git clone --depth 1 --filter=blob:none --sparse "$BRAGI_REPO" "$PROTO_DIR.tmp"
cd "$PROTO_DIR.tmp"
git sparse-checkout set proto
cd ..
mv "$PROTO_DIR.tmp/proto" "$PROTO_DIR"
rm -rf "$PROTO_DIR.tmp"
echo "Bragi protos fetched into $PROTO_DIR/"
