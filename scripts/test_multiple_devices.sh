#!/bin/bash

# Exit on any error
set -e

echo "📱 Starting multi-device testing..."

# Check if adb is installed
if ! command -v adb &> /dev/null; then
    echo "Error: ADB is not installed or not in PATH."
    echo "Please install Android SDK Platform-Tools:"
    echo "  - macOS: brew install android-platform-tools"
    echo "  - Ubuntu/Debian: sudo apt-get install android-sdk-platform-tools"
    echo "  - Windows: Install via Android Studio SDK Manager"
    exit 1
fi

# Get list of connected devices
devices=($(adb devices | grep -v "List of devices" | grep -v "^$" | awk '{print $1}'))

if [ ${#devices[@]} -eq 0 ]; then
    echo "No Android devices found. Please connect at least one device or start an emulator."
    exit 1
fi
echo "Found ${#devices[@]} device(s): ${devices[*]}"

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${PROJECT_DIR}/android"

# Change to Android directory
cd "${ANDROID_DIR}"

# Clean and build the project
echo "🔨 Building debug APK..."
./gradlew clean assembleDebug

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

# Function to install and run on a device
install_and_run() {
    local device=$1
    echo "📱 Device ${device}:"
    
    # Set the device for adb
    export ANDROID_SERIAL=${device}
    
    # Uninstall existing app if needed
    echo "  🗑️  Uninstalling existing app..."
    adb -s ${device} uninstall "${PACKAGE_NAME}" 2> /dev/null || true
    
    # Install the APK
    echo "  📲 Installing APK..."
    adb -s ${device} install -r "${APK_PATH}"
    
    if [ $? -eq 0 ]; then
        echo "  ✅ App installed successfully on ${device}"
        
        # Launch the app
        echo "  🚀 Launching app..."
        adb -s ${device} shell am start -n "${PACKAGE_NAME}/.MainActivity"
        
        # Start logcat in background
        echo "  📋 Starting logcat (PID: $!)..."
        adb -s ${device} logcat -c
        adb -s ${device} logcat -s ReactNative:V ReactNativeJS:V *:E | tee "${PROJECT_DIR}/logs/device_${device//:/_}.log" &
    else
        echo "  ❌ Failed to install on ${device}"
    fi
}

# Create logs directory
mkdir -p "${PROJECT_DIR}/logs"

# Install and run on all devices
echo "🚀 Installing and running on all devices..."
for device in "${devices[@]}"; do
    install_and_run "${device}" &
done

# Wait for all background processes to complete
wait

echo "\n✅ Testing completed on all devices!"
echo "📝 Logs are available in: ${PROJECT_DIR}/logs/"
echo "\nTo view logs for a specific device, use:"
echo "  tail -f ${PROJECT_DIR}/logs/device_<DEVICE_ID>.log"

# Clean up background processes on exit
trap "pkill -P $$" EXIT
