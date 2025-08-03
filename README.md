# SwiftDrop - Offline File Transfer App

A modern, offline file transfer application for Android devices using Wi-Fi Direct.

## Features

- Offline peer-to-peer file transfers using Wi-Fi Direct
- Clean, matte UI with multiple theme options
- File transfer progress tracking
- Device discovery and connection management
- Support for all file types
- QR code connection option

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the Android plugin:
   ```bash
   chmod +x build-plugin.sh
   ./build-plugin.sh
   ```
4. Run the app:
   ```bash
   npm run android
   ```

## Project Structure

- `/src` - React frontend code
- `/android` - Native Android code
- `/src/types` - TypeScript type definitions
- `/src/components` - React components

## Requirements

- Node.js and npm
- Android Studio
- Capacitor CLI
- Java Development Kit (JDK)

## License

MIT License
