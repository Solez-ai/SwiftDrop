#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Android build and install..."

# Check if adb is installed
if ! command -v adb &> /dev/null; then
    echo "Error: ADB is not installed or not in PATH."
    echo "Please install Android SDK Platform-Tools:"
    echo "  - macOS: brew install android-platform-tools"
    echo "  - Ubuntu/Debian: sudo apt-get install android-sdk-platform-tools"
    echo "  - Windows: Install via Android Studio SDK Manager"
    exit 1
fi

# Check if a device is connected
if ! adb devices | grep -w "device" &> /dev/null; then
    echo "No Android device found. Please connect a device or start an emulator."
    echo "List of connected devices:"
    adb devices
    exit 1
fi

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${PROJECT_DIR}/android"

# Change to Android directory
cd "${ANDROID_DIR}"

# Clean the project
echo "🧹 Cleaning project..."
./gradlew clean

# Build the debug APK
echo "🔨 Building debug APK..."
./gradlew assembleDebug

# Find the APK file
APK_PATH=$(find "${ANDROID_DIR}/app/build/outputs/apk/debug" -name "*.apk" | head -n 1)

if [ -z "${APK_PATH}" ]; then
    echo "❌ Error: Could not find the generated APK file."
    exit 1
fi

# Get package name from build.gradle
PACKAGE_NAME=$(grep "applicationId" "${ANDROID_DIR}/app/build.gradle" | sed "s/.*applicationId \"\(.*\)\"/\1/" | head -n 1 | tr -d '[:space:]')

if [ -z "${PACKAGE_NAME}" ]; then
    echo "❌ Error: Could not determine package name."
    exit 1
fi

# Uninstall existing app if needed
echo "🗑️  Uninstalling existing app (if installed)..."
adb uninstall "${PACKAGE_NAME}" 2> /dev/null || true

# Install the APK
echo "📲 Installing APK..."
adb install -r "${APK_PATH}"

if [ $? -eq 0 ]; then
    echo "✅ App installed successfully!"
    
    # Launch the app
    echo "🚀 Launching app..."
    adb shell am start -n "${PACKAGE_NAME}/.MainActivity"
    
    # Show logcat
    echo "📋 Showing logs (press Ctrl+C to stop)..."
    adb logcat -c  # Clear logcat
    adb logcat -s ReactNative:V ReactNativeJS:V *:E
else
    echo "❌ Failed to install the app."
    exit 1
fi
