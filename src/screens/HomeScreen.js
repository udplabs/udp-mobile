import React, { memo } from 'react';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';

const HomeScreen = ({ navigation }) => {
  _onFacebookLogin = async () => {
    navigation.navigate('SocialLoginModal');
  }

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
    </Background>
  );
};

export default memo(HomeScreen);
