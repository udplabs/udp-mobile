import React, { memo, useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert } from 'react-native';
import Background from '../components/Background';
import {
  signIn,
  isAuthenticated,
  getUserFromIdToken,
  EventEmitter,
} from '@okta/okta-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator, passwordValidator } from '../core/utils';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [authenticated, setAuthenticated] = useState(false);
  const [context, setContext] = useState(null);
  const _onLoginPressed = () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    signIn({ username: email.value, password: password.value })
      .then(async token => {
        await AsyncStorage.setItem('@accessToken', token.access_token);
        navigation.navigate('Profile');
      })
      .catch(error => {
        Alert.alert(
          'Error',
          'An error has occured, please try again.',
          [
            { text: 'OK', onPress: () => console.log('error', error.message) }
          ],
          { cancelable: false }
        );
      })
  };
  
  _onWebLoginPressed = () => {
    signIn();
  }

  useEffect(() => {
    EventEmitter.addListener('signInSuccess', function(e) {
      setAuthenticated(true);
      navigation.navigate('Profile');
      setContext('Logged in!');
    });
    EventEmitter.addListener('signOutSuccess', function(e) {
      setAuthenticated(true);
      setContext('Logged out!');
    });
    EventEmitter.addListener('onError', function(e) {
      console.warn(e);
      setContext(e.error_message);
    });
    EventEmitter.addListener('onCancelled', function(e) {
      console.warn(e);
    });
   
    checkAuthentication();
    return () => {
      EventEmitter.removeAllListeners('signInSuccess');
      EventEmitter.removeAllListeners('signOutSuccess');
      EventEmitter.removeAllListeners('onError');
      EventEmitter.removeAllListeners('onCancelled');
    };
  }, []);

  checkAuthentication = async () => {
    const result = await isAuthenticated();
    if (result.authenticated !== authenticated) {
      setAuthenticated(result.authenticated);
    }
  }

  getUserIdToken = async () => {
    let user = await getUserFromIdToken();
    setContext(`
      User Profile:
      ${JSON.stringify(user, null, 4)}
    `);
  }

  return (
    <Background>
      <BackButton goBack={() => navigation.navigate('Home')} />
      <Logo />
      <Header>Welcome back</Header>

      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.label}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>

      <Button mode="contained" onPress={_onLoginPressed}>
        Login
      </Button>

      <Button mode="contained" onPress={_onWebLoginPressed}>
        Login via webpage
      </Button>

      <View style={styles.row}>
        <Text style={styles.label}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default memo(LoginScreen);
