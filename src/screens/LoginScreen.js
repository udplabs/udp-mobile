import React, { memo, useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import {
  isAuthenticated,
  getUserFromIdToken,
} from '@okta/okta-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';

import Logo from '../components/Logo';
import Background from '../components/Background';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator, passwordValidator } from '../core/utils';
import configFile from '../../samples.config';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [authenticated, setAuthenticated] = useState(false);
  const [context, setContext] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const _onLoginPressed = () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
    setLoading(true);
    axios.post(`${configFile.baseUri}/authn`, {
      username: email.value,
      password: password.value
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...fingerprint && { 'X-Device-Fingerprint': fingerprint }
      }
    })
      .then(async response => {
        const { data: { _embedded, status } } = response;
        const userId = _embedded.user.id;
        
        if(status === 'MFA_REQUIRED') {
          const { stateToken } =  response.data;
          const factorId = _embedded.factors[0].id;
          
          axios.post(`${configFile.baseUri}/authn/factors/${factorId}/verify`, {
            stateToken,
          })
            .then(verifyResponse => {
              if(verifyResponse.data.factorResult === 'CHALLENGE') {
                Alert.prompt(
                  "Enter passcode",
                  "A verification email with passcode was sent to your email. Please input the passcode here.",
                  [
                    {
                      text: "Cancel",
                      onPress: () => setLoading(false),
                      style: "cancel"
                    },
                    {
                      text: "OK",
                      onPress: passCode => {
                        axios.post(`${configFile.baseUri}/authn/factors/${factorId}/verify`, {
                          stateToken,
                          passCode,
                        })
                          .then(async activateResponse => {
                            const { status, sessionToken } = activateResponse.data;
                           
                            if(status === 'SUCCESS') {
                              
                              await AsyncStorage.setItem('@userId', userId);
                              await AsyncStorage.setItem('@sessionToken', sessionToken);
                              await AsyncStorage.removeItem('@accessToken');
                              setLoading(false);
                              navigation.reset({
                                index: 0,
                                routes: [
                                  {
                                    name: 'Profile',
                                  },
                                ],
                              })
                            }
                          })
                          .catch(activateError => {
                            setLoading(false);
                            const { data } = activateError.response;
                            console.log('----activateError', data);
                            const errorMsg = data.errorCauses && data.errorCauses.length > 0 && data.errorCauses[0].errorSummary ? data.errorCauses[0].errorSummary : 'An error has occured, please try again.';
                            
                            Alert.alert(
                              'Error',
                              errorMsg,
                              [
                                { text: 'OK', onPress: () => setLoading(false) }
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
              setLoading(false);
              const { data } = verifyError.response;
              console.log('---verifyError', data);
              const errorMsg = data.errorCauses && data.errorCauses.length > 0 && data.errorCauses[0].errorSummary ? data.errorCauses[0].errorSummary : 'An error has occured, please try again.';

              Alert.alert(
                'Error',
                errorMsg,
                [
                  { text: 'OK', onPress: () => setLoading(false) }
                ],
                { cancelable: false }
              );
            })   
        } else if(status === 'SUCCESS') {
          setLoading(false);
          const { sessionToken } = response.data;
          await AsyncStorage.setItem('@userId', userId);
          await AsyncStorage.setItem('@sessionToken', sessionToken);
          await AsyncStorage.removeItem('@accessToken');
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Profile',
              },
            ],
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
            { text: 'OK', onPress: () => setLoading(false) }
          ],
          { cancelable: false }
        );
      })
  };
  
  _onWebLoginPressed = () => {
    const uri = `${configFile.authUri}?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
    navigation.navigate('CustomWebView', { uri, onGoBack: (state) => onSignInSuccess(state), login: true });
  }

  const _onTouchIDPressed = async () => {
    const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    
    if (biometryType === ReactNativeBiometrics.TouchID) {
      ReactNativeBiometrics.createKeys('Confirm fingerprint')
      .then((resultObject) => {
        const { publicKey } = resultObject

        let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
        let payload = epochTimeSeconds + 'some message'
        ReactNativeBiometrics.createSignature({
          promptMessage: 'Sign in',
          payload,
        })  
        .then((resultObject) => {
          const { success, signature } = resultObject

          if (success) {
            console.log(signature)
            setFingerprint(signature);
            _onLoginPressed();

          }
        })
        .catch((error) => {
          console.log('biometrics failed---', error);
        })
      })
    }
    else {
      Alert.alert(
        'Error',
        'Touch ID is not supported.',
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
    }
  }

  onSignInSuccess = (state) => {
    if(state) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Profile',
          },
        ],
      })
    }
  }
  /*
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
*/

  checkAuthentication = async () => {
    const result = await isAuthenticated();
    const userId = await AsyncStorage.getItem('@userId');
    const accessToken = await AsyncStorage.getItem('@accessToken');
    if (result.authenticated !== !!accessToken || !!userId) {
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
      <BackButton goBack={() => navigation.goBack()} />
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Spinner
            visible={loading}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
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
    paddingVertical: 30,
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
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default memo(LoginScreen);
