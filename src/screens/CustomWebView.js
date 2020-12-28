
import React, { memo, useState } from 'react';
import { View, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import configFile from '../../samples.config';
import Button from '../components/Button';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const CustomWebView = (props) => {
  const uri = `${configFile.authBaseUri}${configFile.authServerId}/v1/authorize?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid%20phone&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
  console.log('---', uri);
  onLoad = async(state) => {
    if(state.url.indexOf('/authorize/callback#access_token') >= 0) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      
      const { access_token } = params;

      await AsyncStorage.removeItem('@userId');
      await AsyncStorage.setItem('@accessToken', access_token);
      await navigation.goBack(null);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Profile' },
          ],
        })
      );
    }
  }


  return (
    <View style={{
      height: height - 55,
      position: 'absolute',
      width,
      bottom: 0,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: 'white',
    }}>
      <Button
        onPress={() => navigation.goBack(null)}
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        Close
      </Button>
      <WebView
        source={{ uri }}
        onNavigationStateChange={onLoad}
      />
    </View>
  );
};

const Stack = createStackNavigator();

export default function WebViewStack({ route }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(CustomWebView)} />
    </Stack.Navigator>
  )
}
