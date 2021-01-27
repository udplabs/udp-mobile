import React, { memo } from 'react';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import configFile from '../../samples.config';

const HomeScreen = ({ navigation }) => {
  _onFacebookLogin = async () => {
    navigation.navigate('SocialLoginModal', { mode: 'facebook'});
  }

  // _onGoogleLogin = async () => {
  //   navigation.navigate('SocialLoginModal', { mode: 'google'});
  // }

  _onAppleLogin = async () => {
    navigation.navigate('SocialLoginModal', { mode: 'apple'});
  }

  return (
    <Background>
      <Logo />
      <Header>{configFile.title}</Header>

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
