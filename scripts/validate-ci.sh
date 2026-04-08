#!/bin/bash
set -e

echo "=== Step 1: Install dependencies ==="
npm install --ignore-scripts

echo ""
echo "=== Step 2: Validate project structure ==="
node scripts/validate-structure.js

echo ""
echo "=== Step 3: Check JavaScript syntax ==="
node --check bin/yida.js && echo "  ✓ bin/yida.js"
for f in lib/*.js; do
  node --check "$f" && echo "  ✓ $f"
done
echo "All JS files passed syntax check"

echo ""
echo "=== Step 4: Run tests ==="
npm test

echo ""
echo "=== All checks passed! ==="
