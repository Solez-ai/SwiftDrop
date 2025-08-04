#!/bin/bash

# Exit on any error
set -e

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using:"
    echo "  - macOS: brew install imagemagick"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - Windows: Download from https://imagemagick.org/"
    exit 1
fi

# Create directories if they don't exist
mkdir -p "../android/app/src/main/res/mipmap-mdpi"
mkdir -p "../android/app/src/main/res/mipmap-hdpi"
mkdir -p "../android/app/src/main/res/mipmap-xhdpi"
mkdir -p "../android/app/src/main/res/mipmap-xxhdpi"
mkdir -p "../android/app/src/main/res/mipmap-xxxhdpi"

# Check if source icon exists
if [ ! -f "../resources/icon.png" ]; then
    echo "Error: Source icon not found at ../resources/icon.png"
    echo "Please provide an icon.png file (1024x1024px recommended)"
    exit 1
fi

# Generate launcher icons
echo "Generating launcher icons..."
convert "../resources/icon.png" -resize 48x48 "../android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
convert "../resources/icon.png" -resize 72x72 "../android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
convert "../resources/icon.png" -resize 96x96 "../android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
convert "../resources/icon.png" -resize 144x144 "../android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
convert "../resources/icon.png" -resize 192x192 "../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"

# Generate round launcher icons for Android 7.1+
convert "../resources/icon.png" -resize 48x48 -background none -gravity center -extent 48x48 -alpha set -channel A -evaluate set 100% "../android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
convert "../resources/icon.png" -resize 72x72 -background none -gravity center -extent 72x72 -alpha set -channel A -evaluate set 100% "../android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
convert "../resources/icon.png" -resize 96x96 -background none -gravity center -extent 96x96 -alpha set -channel A -evaluate set 100% "../android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
convert "../resources/icon.png" -resize 144x144 -background none -gravity center -extent 144x144 -alpha set -channel A -evaluate set 100% "../android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
convert "../resources/icon.png" -resize 192x192 -background none -gravity center -extent 192x192 -alpha set -channel A -evaluate set 100% "../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

# Generate adaptive icons for Android 8.0+
mkdir -p "../android/app/src/main/res/mipmap-anydpi-v26"
cat > "../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" << 'EOL'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOL

cat > "../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" << 'EOL'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
EOL

# Create foreground layer (simplified version, you might want to customize this)
convert -size 108x108 xc:none -fill white -draw 'circle 54,54 54,0' \
    "../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"

# Create background color resource
echo "<?xml version=\"1.0\" encoding=\"utf-8\"?>" > "../android/app/src/main/res/values/colors.xml"
echo "<resources>" >> "../android/app/src/main/res/values/colors.xml"
echo "    <color name=\"ic_launcher_background\">#FFFFFF</color>" >> "../android/app/src/main/res/values/colors.xml"
echo "</resources>" >> "../android/app/src/main/res/values/colors.xml"

echo "✅ Icons generated successfully!"
echo "You can now build your Android app with the new icons."
