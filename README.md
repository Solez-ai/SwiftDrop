# ⚡ SwiftDrop

**SwiftDrop** is a blazing-fast, modern Android file-sharing app built with **React + Capacitor**, designed for **true offline sharing** via **Wi-Fi Direct (P2P)** — no internet, no middlemen, no nonsense.

Effortless transfers. Real files. Pure speed.

---

## 🚀 What SwiftDrop Does

SwiftDrop lets you:

- 🔗 **Send & Receive Any File Type**  
  Share photos, videos, documents, APKs, even full apps — no size limits, no file restrictions.

- 📡 **Radar-Based Discovery**  
  Nearby devices appear on a slick, animated radar view. Tap to connect and go.

- 📷 **QR Mode for Direct Transfers**  
  Prefer scanning? Instantly connect with QR codes as a fallback or quick link.

- 📁 **Full Native File Access**  
  Browse, select, and send from your device's actual file system. No sandbox limits.

- 🔒 **No Cloud, No Internet**  
  All sharing happens locally over Wi-Fi Direct — your data never leaves your device.

---

## ⚙️ How It Works (Under the Hood)

- Built with **React + Next.js**
- Wrapped for Android with **Capacitor**
- Uses native **Wi-Fi P2P (WiFi-Direct)** and **Android NSD**
- Offline communication with **no pairing or internet needed**
- Permissions handled in onboarding: storage, location, network, nearby devices

---

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
