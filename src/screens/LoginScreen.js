import React, { memo, useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import {
  signIn,
  isAuthenticated,
  getUserFromIdToken,
  EventEmitter,
} from '@okta/okta-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

import axios from '../components/Axios';
import Logo from '../components/Logo';
import Background from '../components/Background';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator, passwordValidator } from '../core/utils';
import configFile from '../../samples.config';
import { errorMonitor } from 'events';

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

    axios.post(`${configFile.baseUri}/authn`, {
      username: email.value,
      password: password.value
    })
      .then(response => {
        const { data: { stateToken, _embedded, status} } = response;
        
        if(status === 'MFA_REQUIRED') {
          const userId = _embedded.user.id;
          const factorId = _embedded.factors[0].id;
          const verifyLink = `${configFile.baseUri}/users/${userId}/factors/${factorId}/verify`; 
          
          axios.post(verifyLink)
            .then(verifyResponse => {
              if(verifyResponse.data.factorResult === 'CHALLENGE') {
                Alert.prompt(
                  "Enter passcode",
                  "A verification email with passcode was sent to your email. Please input the passcode here.",
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel"
                    },
                    {
                      text: "OK",
                      onPress: passCode => {
                        axios.post(verifyLink, {
                          passCode,
                        })
                          .then(async activateResponse => {
                            const { factorResult } = activateResponse.data;
            
                            if(factorResult === 'SUCCESS') {
                              await AsyncStorage.setItem('@userId', userId);
                              await AsyncStorage.removeItem('@accessToken');
                              navigation.dispatch(
                                CommonActions.reset({
                                  index: 0,
                                  routes: [
                                    { name: 'Profile' },
                                  ],
                                })
                              );
                            }
                          })
                          .catch(activateError => {
                            const { data } = activateError.response;

                            const errorMsg = data.errorCauses && data.errorCauses.length > 0 && data.errorCauses[0].errorSummary ? data.errorCauses[0].errorSummary : 'An error has occured, please try again.';
                            
                            Alert.alert(
                              'Error',
                              errorMsg,
                              [
                                { text: 'OK', onPress: () => console.log('error', errorMsg) }
                              ],
                              { cancelable: false }
                            );
                          })
                      }
                    }
                  ],
                );
              }
            })
            .catch(verifyError => {
              const { data } = verifyError.response;
              const errorMsg = data.errorCauses && data.errorCauses.length > 0 && data.errorCauses[0].errorSummary ? data.errorCauses[0].errorSummary : 'An error has occured, please try again.';

              Alert.alert(
                'Error',
                errorMsg,
                [
                  { text: 'OK', onPress: () => console.log('error', errorMsg) }
                ],
                { cancelable: false }
              );
            })   
        }
      }
      ,(error) => {
        const { data } = error.response;
        const errorMsg = data.errorSummary ? data.errorSummary : 'An error has occured, please try again.';

        Alert.alert(
          'Error',
          errorMsg,
          [
            { text: 'OK', onPress: () => console.log('error', errorMsg) }
          ],
          { cancelable: false }
        );
      })
  };
  
  _onWebLoginPressed = () => {
    signIn();
  }

  _onTouchIDPressed = () => {
    ReactNativeBiometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
    .then((resultObject) => {
      const { success } = resultObject;
      if (success) {
        _onLoginPressed();
      }
    })
    .catch((error) => {
      console.log('biometrics failed');
    })
  }

  useEffect(() => {
    EventEmitter.addListener('signInSuccess', async function(e) {
      await AsyncStorage.setItem('@accessToken', e.access_token);
      setAuthenticated(true);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Profile' },
          ],
        })
      );

      setContext('Logged in!');
    });
    EventEmitter.addListener('signOutSuccess', function(e) {
      setAuthenticated(true);
      setContext('Logged out!');
    });
    EventEmitter.addListener('onError', function(e) {
      console.log(e);
      setContext(e.error_message);
    });
    EventEmitter.addListener('onCancelled', function(e) {
      console.log(e);
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
    const userId = await AsyncStorage.getItem('@userId');
    if (result.authenticated !== authenticated || !!userId) {
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
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
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

          <Button mode="contained" onPress={_onTouchIDPressed}>
            Authenticate with Touch ID
          </Button>
          
          <View style={styles.row}>
            <Text style={styles.label}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
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
