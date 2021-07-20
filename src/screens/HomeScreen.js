import React, { memo, useContext } from 'react';
import CookieManager from '@react-native-cookies/cookies';
import { Image } from 'react-native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import { AppContext } from '../AppContextProvider';

const useWebKit = Platform.OS === 'ios';

const HomeScreen = ({ navigation }) => {
  const { config } = useContext(AppContext);
  _onFacebookLogin = async () => {
    CookieManager.clearAll(useWebKit)
    .then((success) => {
      navigation.navigate('SocialLoginModal', { mode: 'facebook'});
    });
  }

  // _onGoogleLogin = async () => {
  //   navigation.navigate('SocialLoginModal', { mode: 'google'});
  // }

  _onAppleLogin = async () => {
    CookieManager.clearAll(useWebKit)
    .then((success) => {
      navigation.navigate('SocialLoginModal', { mode: 'apple'});
    });
  }

  return (
    <Background>
      <Logo />
      <Image
          style={{width: '100%', height: 54, marginBottom: 10}}
          source={require('../assets/bank_logo.png')} />

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
      {/* <Button mode="contained" onPress={() => _onGoogleLogin()}>
        Login with Google
      </Button> */}
      <Button mode="contained" onPress={() => _onAppleLogin()}>
        Login with Apple
      </Button>
    </Background>
  );
};

export default memo(HomeScreen);
