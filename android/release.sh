#!/bin/bash

# Exit on any error
set -e

# Check if keystore exists
if [ ! -f "swiftdrop-keystore.jks" ]; then
    echo "Creating new keystore..."
    keytool -genkey -v -keystore swiftdrop-keystore.jks \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias swiftdrop-key \
        -dname "CN=SwiftDrop, OU=Mobile, O=YourCompany, L=YourCity, ST=YourState, C=US" \
        -storepass "your_keystore_password" \
        -keypass "your_key_password"
    
    echo "Keystore created. Please update the keystore.properties file with the actual passwords."
    exit 1
fi

# Clean the project
./gradlew clean

# Build the release APK
./gradlew assembleRelease

# Verify the APK
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "\n✅ Release APK built successfully!"
    echo "APK location: $(pwd)/app/build/outputs/apk/release/app-release.apk"
    
    # Sign the APK (optional, as it's already signed during build)
    # apksigner sign --ks swiftdrop-keystore.jks --out app-release-signed.apk app/build/outputs/apk/release/app-release.apk
    # echo "\n✅ APK signed successfully!"
    # echo "Signed APK location: $(pwd)/app-release-signed.apk"
else
    echo "\n❌ Error: Failed to build release APK"
    exit 1
fi
