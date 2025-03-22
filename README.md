# crime_reporting_app

## Tech Stack

## DevOps

Developer Operations (DevOps) is the symbiotic relationship between teams, culture and development that allows for collaboration, growth and continuous improvement. Used as a set of practices and tools, DevOps integrates and automates the work of software development and operations as a means for improving the development life cycle. (https://education.github.com/experiences/dev_ops)

- CodeScene
  One of its standout features is the Code Health metric, which evaluates the maintainability of source code based on complexity attributes and code smells.

  [![CodeScene Average Code Health](https://codescene.io/projects/65157/status-badges/average-code-health)](https://codescene.io/projects/65157)

- Travis CI
  Travis CI is a continuous integration and delivery (CI/CD) platform that automates the process of building, testing, and deploying code.

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
