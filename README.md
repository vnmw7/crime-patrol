# Crime Reporting App

> A mobile application for reporting crimes and alerting authorities.

This project is a full-stack application designed to help users report incidents, view crime maps, and receive safety alerts. It's built for citizens and local authorities to improve community safety.

## Badges

<!-- Add badges here from shields.io -->

[![Build Status](https://img.shields.io/travis/com/user/repo.svg)](https://travis-ci.com/user/repo)
[![Coverage Status](https://img.shields.io/coveralls/github/user/repo.svg)](https://coveralls.io/github/user/repo?branch=main)
[![Version](https://img.shields.io/github/v/release/user/repo)](https://github.com/user/repo/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Demo / Screenshots

### Live Demo

<!-- [Link to your live demo](https://your-project-demo.com) -->

### Screenshots

<!-- ![Screenshot of the main dashboard](./docs/images/screenshot-dashboard.png) -->

## Features

- ✨ Real-time crime reporting
- 🚀 Interactive map with incident locations
- ✅ User authentication and profiles
- 🔔 Notifications and safety alerts

## Tech Stack

### Frontend (Mobile)

- **Framework:** React Native with Expo
- **State Management:** (Add state management library if any, e.g., Redux, MobX)
- **Navigation:** React Navigation

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** (Add database, e.g., MongoDB, PostgreSQL)
- **API:** RESTful API

### Testing

- (Add testing libraries, e.g., Jest, Detox)

## Getting Started: Setup and Initialization

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PowerShell](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell)
- [Android Studio](https://developer.android.com/studio) or [Xcode](https://developer.apple.com/xcode/) for mobile development.

### Installation

1.  **Clone the repository:**

    ```sh
    git clone <your-repository-url>
    cd crime_reporting_app
    ```

2.  **Run the development setup script:**
    This script will handle the installation of dependencies for all parts of the project (mobile, backend).
    ```powershell
    .\scripts\dev-setup.ps1
    ```

## Running the Project

- **Run the mobile app:**

  ```powershell
  npx expo run:android
  ```

  or

  ```powershell
  npx expo run:ios
  ```

- **Start the backend server:**
  ```sh
  cd backend
  npm start
  ```

## Troubleshooting

### Common Issues

- **Issue:** Expo prebuild fails.
- **Solution:**
  ```powershell
  # clean prebuild
  npx expo prebuild --clean
  # install dependencies
  npm install
  npx expo install expo-dev-client
  # run expo
  npx expo run:android
  ```

## Building for Production (Android Release)

### 1. Generate an Upload Key

You need a signing key to publish your app to the Google Play Store.

```powershell
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

- Put the generated `.keystore` file (e.g., `my-upload-key.keystore`) in the `android/app` directory of your project.

### 2. Configure Gradle Credentials

To keep your credentials secure, do not commit them to your repository.

- Create a file named `gradle.properties` in your user's Gradle directory (`~/.gradle/`).
- Add the following lines to `gradle.properties`, replacing the placeholders with your actual information:
  ```
  MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
  MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
  MYAPP_UPLOAD_STORE_PASSWORD=your-keystore-password
  MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
  ```

### 3. Configure App Signing in Gradle

Edit `android/app/build.gradle` to use the release signing configuration.

- Inside the `android { ... }` block, add the `signingConfigs` block if it doesn't exist:

  ```groovy
  signingConfigs {
      release {
          if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
              storeFile file(MYAPP_UPLOAD_STORE_FILE)
              storePassword MYAPP_UPLOAD_STORE_PASSWORD
              keyAlias MYAPP_UPLOAD_KEY_ALIAS
              keyPassword MYAPP_UPLOAD_KEY_PASSWORD
          }
      }
  }
  ```

- Inside the `buildTypes { ... }` block, ensure your release build type uses this signing config:
  ```groovy
  buildTypes {
      release {
          // ... other release settings
          signingConfig signingConfigs.release
      }
  }
  ```

### 4. Build the Release APK or AAB

- **To build an APK:**

  ```sh
  cd android && ./gradlew assembleRelease
  ```

- **To build an Android App Bundle (AAB):**
  ```sh
  cd android && ./gradlew app:bundleRelease
  ```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please read our `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

## Authors & Acknowledgments

- **@YourName** - _Initial Work_
- Acknowledge any libraries, tutorials, or individuals that helped you.
