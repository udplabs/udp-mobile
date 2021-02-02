# Okta React Native Authentication Demo

This example demonstrates various Okta Authentication features in your app.

## Clone repo
To run this application, you first need to clone this repo and then enter into this directory:

## Install dependencies

Install dependencies based on package.json
```bash
npm install
```

### Install CocoaPods dependencies
CocoaPods dependencies are needed for ios development
```bash
cd ios && pod install && cd ..
```

## Run sample

Start app server:
```bash
npm start
```

Launch an Android Emulator or iOS Simulator, then
```bash
# Android
react-native run-android

# iOS
react-native run-ios
```

## Using This Example

Enter your credentials and tap the **Login** button. You can login with the same account that you created when signing up for your Developer Org, or you can use a known username and password from your Okta Directory.

After you complete the login flow, you will be able to see the details of user's account.
You can also test editing profile, a demo transaction with MFA, and uploading ID for verification.
