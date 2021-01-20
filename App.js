import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, SafeAreaView } from 'react-native';
import { isAuthenticated } from '@okta/okta-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

const Stack = createStackNavigator();

const App = () => {
  const [progress, setProgress] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {

      let { authenticated } = await isAuthenticated();
      const userId = await AsyncStorage.getItem('@userId');
      const accessToken = await AsyncStorage.getItem('@accessToken');
    
      if(!!userId || !!accessToken) {
        authenticated = true;
      }
      setAuthenticated(authenticated);
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
  )
};
export default Root;
