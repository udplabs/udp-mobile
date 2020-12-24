import React, { memo } from 'react';
import { WebView } from 'react-native-webview';

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

const HomeScreen = ({ navigation }) => {
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
  }
  const fbUrl = `${configFile.authUri}?idp=${configFile.oidc.clientId}&client_id=866135357520828&response_type=token&response_mode=fragment&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=YsG76jo`;
  return (
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
      <WebView source={{ uri: fbUrl }} />
    </Background>
  );
};

export default memo(HomeScreen);
