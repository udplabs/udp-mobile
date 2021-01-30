import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, SafeAreaView } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, DefaultTheme } from 'react-native-paper';
import {
  HomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  EditProfileScreen,
  ProfileScreen,
  SocialLoginModal,
  CustomWebView,
  IDVerification,
  TransactionScreen,
} from './src/screens';
import AppContextProvider, { AppContext } from './src/AppContextProvider';
import { useContext } from 'react';
import sampleConfig from './samples.config';
import { theme as oldTheme } from './src/core/theme';

let {
  app_name,
  clientId,
  issuer,
  title,
  logoUrl,
  baseUri,
  udp_subdomain,
  authUri,
  reCaptchaSiteKey,
  reCaptchaBaseUrl,
  nonce,
  customAPIUrl,
  consentField,
  transactionalMFA,
  idps: {
    facebook,
    google,
    apple,
  },
} = sampleConfig;


const Stack = createStackNavigator();

const App = () => {
  const [progress, setProgress] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const {changeTheme, changeConfig} = useContext(AppContext);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      
      let authenticated = false;
      const userId = await AsyncStorage.getItem('@userId');
      const accessToken = await AsyncStorage.getItem('@accessToken');
    
      if(!!userId || !!accessToken) {
        authenticated = true;
      }
      setAuthenticated(authenticated);
      if(Platform.OS === 'android') {
        const SharedPreferences = require('react-native-shared-preferences');
        SharedPreferences.setName('prefs.db');
        SharedPreferences.getItems(['clientId', 'issuer', 'udp_subdomain', 'app_name', 'customAPIUrl', 'reCaptchaSiteKey', 'nonce', 'transactionalMfaClientId', 'consentField', 'facebookIDP', 'googleIDP', 'appleIDP', 'title', 'logoUrl', 'primaryColor', 'secondaryColor', 'errorColor', 'isAppetize'], function(values){
          clientId = (values[0] && values[0] !== 'null') ? values[0] : clientId;
          issuer = (values[1] && values[1] !== 'null') ? values[1] : issuer;
          udp_subdomain = (values[2] && values[2] !== 'null') ? values[2] : udp_subdomain;
          app_name = (values[3] && values[3] !== 'null') ? values[3] : app_name;
          customAPIUrl = (values[4] && values[4] !== 'null') ? values[4] : customAPIUrl;
          reCaptchaSiteKey = (values[5] && values[5] !== 'null') ? values[5] : reCaptchaSiteKey;
      
          const splitArray = issuer.split('/');
          reCaptchaBaseUrl = (values[5] && values[5] !== 'null') ? `${splitArray[0]}//${splitArray[2]}` : reCaptchaBaseUrl;
      
          nonce = (values[6] && values[6] !== 'null') ? values[6] :  nonce;
          const transactionalMfaClientId = (values[7] && values[7] !== 'null') ? values[7] :  transactionalMFA.clientId;
          consentField = (values[8] && values[8] !== 'null') ? values[8] :  consentField;
          const facebookIDP = (values[9] && values[9] !== 'null') ? values[9] :  facebook;
          const googleIDP = (values[10] && values[10] !== 'null') ? values[10] :  google;
          const appleIDP = (values[11] && values[11] !== 'null') ? values[11] :  apple;
          title = (values[12] && values[12] !== 'null') ? values[12] :  title;
          logoUrl = (values[13] && values[13] !== 'null') ? values[13] :  logoUrl;
          const primaryColor = (values[14] && values[14] !== 'null') ? values[14] : oldTheme.colors.primary;
          const secondaryColor = (values[15] && values[15] !== 'null') ? values[15] : oldTheme.colors.secondary;
          const errorColor = (values[16] && values[16] !== 'null') ? values[16] : oldTheme.colors.error;
          const isAppetize = (values[17] !== 'null') && values[17];
          baseUri = `${splitArray[0]}//${splitArray[2]}/api/v1`;
          authUri = `${issuer}/v1/authorize`;
          changeConfig({
            ...sampleConfig,
            app_name,
            clientId,
            title,
            logoUrl,
            baseUri,
            udp_subdomain,
            authUri,
            reCaptchaSiteKey,
            reCaptchaBaseUrl,
            nonce,
            customAPIUrl,
            consentField,
            transactionalMFA: {
              clientId: transactionalMfaClientId,
            },
            idps: {
              facebook: facebookIDP,
              google: googleIDP,
              apple: appleIDP,
            },
            isAppetize,
          })
          changeTheme({
            ...DefaultTheme,
            colors: {
              primary: primaryColor,
              secondary: secondaryColor,
              error: errorColor,
            }
          })
        });
      }
      setProgress(false);
    }

    setProgress(true);
    checkAuthStatus();
  }, []);

  if (progress) {
    return (
      <SafeAreaView>
        <View>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <Stack.Navigator initialRouteName={authenticated ? 'Profile' : 'Home'} headerMode={false}>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home', headerLeft: null }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Login', headerLeft: null }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Register', headerLeft: null }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'ForgotPassword', headerLeft: null }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'EditProfile', headerLeft: null }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'User Profile'}} 
      />
       <Stack.Screen 
        name="Transaction" 
        component={TransactionScreen} 
        options={{ title: 'Transaction'}} 
      />
    </Stack.Navigator>
  )
};

const Root = () => {
  return (
    <Provider>
      <AppContextProvider>
        <NavigationContainer>
          <Stack.Navigator headerMode="none" mode="modal">
            <Stack.Screen 
              name="Home" 
              component={App}
              options={{ title: 'App', headerLeft: null }} 
            />
            <Stack.Screen 
              name="SocialLoginModal" 
              component={SocialLoginModal} 
              options={{
                cardStyle: { backgroundColor: 'transparent' }
              }} 
            />
            <Stack.Screen 
              name="CustomWebView" 
              component={CustomWebView} 
              options={{
                cardStyle: { backgroundColor: 'transparent' }
              }} 
            />
            <Stack.Screen 
              name="IDVerification" 
              component={IDVerification} 
              options={{
                cardStyle: { backgroundColor: 'transparent' }
              }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContextProvider>
    </Provider>
  )
};
export default Root;
