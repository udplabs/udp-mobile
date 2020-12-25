import React, { memo, useState } from 'react';
import WebViewModalProvider, { WebViewModal } from "react-native-webview-modal";
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import configFile from '../../samples.config';

const HomeScreen = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  _onFacebookLogin = async () => {
    setVisible(true);
  }

  onLoad = async(state) => {
    if(state.url.indexOf('/authorize/callback#access_token')!== -1 && !state.loading && visible) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      
      const { access_token } = params;

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
