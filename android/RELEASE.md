# SwiftDrop Android Release Guide

This guide explains how to build and release the SwiftDrop Android app to the Google Play Store.

## Prerequisites

1. JDK 11 or later
2. Android Studio (latest stable version)
3. Android SDK with API level 33 installed
4. Google Play Developer Account

## Building a Release APK

### 1. Set up the Keystore

1. Create a keystore file using the following command (or use the provided script):
   ```bash
   keytool -genkey -v -keystore swiftdrop-keystore.jks \
       -keyalg RSA -keysize 2048 -validity 10000 \
       -alias swiftdrop-key \
       -dname "CN=SwiftDrop, OU=Mobile, O=YourCompany, L=YourCity, ST=YourState, C=US" \
       -storepass "your_keystore_password" \
       -keypass "your_key_password"
   ```

2. Create or update `keystore.properties` in the `android` directory with your keystore information:
   ```properties
   storePassword=your_keystore_password
   keyPassword=your_key_password
   keyAlias=swiftdrop-key
   storeFile=../swiftdrop-keystore.jks
   ```

### 2. Build the Release APK

#### Option 1: Using the provided script (recommended)

```bash
# Make the script executable
chmod +x release.sh

# Run the release script
./release.sh
```

#### Option 2: Manual build

```bash
# Clean the project
./gradlew clean

# Build the release APK
./gradlew assembleRelease
```

The release APK will be available at:
`app/build/outputs/apk/release/app-release.apk`

## Preparing for Google Play Store

### 1. App Bundle (Recommended)

To generate an Android App Bundle (recommended for Play Store):

```bash
./gradlew bundleRelease
```

The AAB file will be available at:
`app/build/outputs/bundle/release/app-release.aab`

### 2. App Signing

For Google Play App Signing, you'll need to:

1. Generate an upload key and keystore
2. Export the certificate for the upload key
3. Register your app signing key with Google Play
4. Upload your app bundle to the Play Console

### 3. Release Checklist

- [ ] Update version code and version name in `app/build.gradle`
- [ ] Update app icon and splash screen
- [ ] Update feature graphics and screenshots
- [ ] Test the app thoroughly on multiple devices
- [ ] Update release notes
- [ ] Verify all permissions are properly documented
- [ ] Test in-app purchases (if any)
- [ ] Test deep linking (if any)
- [ ] Verify analytics and crash reporting

## Publishing to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select an existing one
3. Go to "Production" > "Create new release"
4. Upload the AAB file
5. Fill in the release notes
6. Review and roll out to production

## Troubleshooting

### App crashes on launch
- Check Logcat for crash logs
- Verify all native dependencies are properly included
- Test on a different device/emulator

### Build fails with signing errors
- Verify keystore file exists and is accessible
- Check keystore passwords in `keystore.properties`
- Ensure the keystore alias is correct

### App size is too large
- Enable ProGuard/R8 code shrinking
- Use WebP images instead of PNG/JPEG
- Enable resource shrinking
- Use Android App Bundles (AAB)

## Security Best Practices

1. Never commit the keystore file to version control
2. Store keystore passwords securely (consider using environment variables in CI/CD)
3. Use Google Play App Signing for added security
4. Keep your keystore file in a secure location with backups
