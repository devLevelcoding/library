#!/usr/bin/env bash
set -e

RESULTS_DIR="$(dirname "$0")/../test-results"
OUTPUT="$(dirname "$0")/../test-results/FULL-SHOP-TOUR.mp4"
CONCAT_LIST="/tmp/playwright_concat_list.txt"

echo "🎬 Finding videos..."
> "$CONCAT_LIST"

# Collect videos sorted by test name (alphabetical = test order)
while IFS= read -r video; do
  echo "file '$video'" >> "$CONCAT_LIST"
  echo "  ✓ $video"
done < <(find "$RESULTS_DIR" -name "video.webm" ! -path "*/FULL*" | sort)

if [ ! -s "$CONCAT_LIST" ]; then
  echo "❌ No video.webm files found in $RESULTS_DIR"
  exit 1
fi

echo ""
echo "🔗 Merging videos into: $OUTPUT"

ffmpeg -y \
  -f concat \
  -safe 0 \
  -i "$CONCAT_LIST" \
  -c:v libx264 \
  -preset fast \
  -crf 22 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUTPUT"

echo ""
echo "✅ Done! Final video: $OUTPUT"
open "$OUTPUT"
