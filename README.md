This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Version Controll

```bash
#node
18.20.2

#npm
10.5.0

#react-native
15.1.3

#java
17.0.10

#Android Studio - android
Android Studio Ladybug | 2024.2.1

#gradle - android
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10.2-all.zip

#xcode - ios
Xcode 16.2
Build version 16C5032a

#watchman
2024.12.02.00

#pod - ios
1.16.2

#cocapods - ios
1.15.2

```

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

  개발 서버 빌드 (debug)
  npm run android => "react-native run-android --mode=devDebug"

  개발 서버 빌드 (release)
  npm run android-release => "react-native run-android --mode=release",

  운영 서버 빌드 (debug)
  npm run android-prod-debug => "set ENVFILE=.env.prod && cd android && gradlew.bat installProdDebug && cd .. && adb shell monkey -p com. spiritfront -c android.intent.category.LAUNCHER 1",

  운영 서버 빌드 (release)
  npm run android-prod-release => "set ENVFILE=.env.prod && cd android && gradlew.bat installProdRelease && cd .. && adb shell monkey -p com.spiritfront -c android.intent.category.LAUNCHER 1",

  운영 서버 빌드 APK(debug)
  npm run build-android-prod-debug => "cd ./android && set ENVFILE=.env.prod && gradlew.bat assembleProdDebug && cd ../",

  운영 서버 빌드 APK(release)
  npm run build-android-prod-release => "cd ./android && set ENVFILE=.env.prod && gradlew.bat assembleProdRelease && cd ../",

  운영 서버 App bundle (.abb)
  npm run bundle-prod-release => "cd android && set ENVFILE=.env.prod && gradlew.bat bundleProdRelease && cd ../"
