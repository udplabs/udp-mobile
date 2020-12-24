import React, { memo, useState } from 'react';
import { Dimensions } from 'react-native'; 
import WebViewModalProvider, { WebViewModal } from "react-native-webview-modal";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import configFile from '../../samples.config';

const config = {
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.facebook.com/v3.1/dialog/oauth',
    tokenEndpoint: 'ttps://udp-udp-mobile-6aa.oktapreview.com/oauth2/v1/token'
  },
  clientId: '866135357520828',
  redirectUrl: 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/v1/authorize/callback',
  scopes: ['openid', 'profile']
};

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const HomeScreen = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  _onFacebookLogin = async () => {
    /*
    try {
      const authState = await authorize(config);
      // result includes accessToken, accessTokenExpirationDate and refreshToken
      console.log('---', authState);
      // const refreshedState = await refresh(config, {
      //   refreshToken: authState.refreshToken,
      // });
    } catch (error) {
      console.log(error);
    }
    */
    // Refresh token
   

    // Revoke token
    // await revoke(config, {
    //   tokenToRevoke: refreshedState.refreshToken
    // });
    setVisible(true);
  }

  onLoad = async(state) => {

    let regex = /[?#]([^=#]+)=([^&#]*)/g,
      params = {},
      match
    while ((match = regex.exec(state.url))) {
      params[match[1]] = match[2]
    }
    const { access_token } = params;
    console.log('----token', access_token);
    if(!state.loading) {
      await AsyncStorage.removeItem('@userId');
      await AsyncStorage.setItem('@accessToken', access_token);
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

  const fbUrl = `${configFile.authUri}?idp=0oavyrdmiygFJn4GX0h7&client_id=${configFile.oidc.clientId}&response_type=token&response_mode=fragment&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=YsG76jo`;
  console.log('fb---', fbUrl);
  return (
    <WebViewModalProvider>
      <Background>
        <Logo />
        <Header>UDP Mobile</Header>

        <Button mode="contained" onPress={() => navigation.navigate('Login')}>
          Login with email
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
        >
          Sign Up
        </Button>
        <Button mode="contained" onPress={() => _onFacebookLogin()}>
          Login with Facebook
        </Button>
        <WebViewModal
          visible={visible}
          source={{ uri: fbUrl }}
          style={{
            bottom: 0,
          }}
          onNavigationStateChange={onLoad}
        />
      </Background>
    </WebViewModalProvider>
  );
};

export default memo(HomeScreen);
