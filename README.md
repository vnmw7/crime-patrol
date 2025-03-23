# crime_reporting_app

## Tech Stack

## Issues

- Execution failed for task ':react-native-reanimated:buildCMakeDebug[arm64-v8a]

  - Solution:

    ```powershell
    # clean prebuild
    npx expo prebuild --clean
    # install dependencies
    npm install
    # run expo
    npx expo run:android
    ```
