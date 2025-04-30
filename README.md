# crime_reporting_app

## Quick Start

```powershell
.\scripts\dev-setup.ps1
```

## Tech Stack

## Issues

- Solution:

  ```powershell
  # clean prebuild
  npx expo prebuild --clean
  # install dependencies
  npm install
  npx expo install expo-dev-client
  # run expo
  npx expo run:android
  ```

  # Realeas

  keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

  - Put the generated .keystore file (e.g., my-upload-key.keystore) in the android/app directory of your project.

  - Configure Gradle: Tell Gradle where to find the keystore and credentials.
    Create a file named gradle.properties in the ~/.gradle/ directory (this is system-wide, keeps credentials out of your project repo) or, less securely, in the android/ directory of your project. System-wide is recommended.
    Add the following lines to gradle.properties, replacing the placeholders with your actual information:
    MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
    MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
    MYAPP_UPLOAD_STORE_PASSWORD=your-keystore-password
    MYAPP_UPLOAD_KEY_PASSWORD=your-key-password

    Edit android/app/build.gradle. Find the android { ... } block.

    Inside android { ... }, find signingConfigs { ... }. If it doesn't exist, create it.
    Add a release signing config (if not already present):
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

    Inside the buildTypes { ... } block (usually inside android { ... }), ensure your release build type uses this signing config:
    buildTypes {
    release {
    // ... other release settings
    signingConfig signingConfigs.release
    }
    }

- cd androd && gradlew app:bundleRelease
