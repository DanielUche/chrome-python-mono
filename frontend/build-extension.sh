#!/bin/bash
# Build script that copies manifest.json to dist

echo "Building extension..."
npm run build

echo "Copying manifest.json to dist..."
cp src/manifest.json dist/manifest.json

echo "Copying icons to dist..."
mkdir -p dist/icons
cp src/icons/* dist/icons/ 2>/dev/null || true

# Find the main JS bundle (it has a hash)
MAIN_JS=$(ls dist/main.*.js 2>/dev/null | head -1 | xargs basename)
MAIN_CSS=$(ls dist/assets/main.*.css 2>/dev/null | head -1 | xargs basename)

echo "Creating sidepanel.html at dist root..."
cat > dist/sidepanel.html << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chrome Python Monitor</title>
    <link rel="stylesheet" crossorigin href="./assets/$MAIN_CSS">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./$MAIN_JS"></script>
  </body>
</html>
EOF

echo "Build complete! Extension is ready in dist/"
echo ""
echo "To load the extension:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the 'dist' folder"
