import React, { memo, useState, useContext } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import prompt from 'react-native-prompt-android';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';

import Logo from '../components/Logo';
import Background from '../components/Background';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { AppContext } from '../AppContextProvider';
import { emailValidator, passwordValidator } from '../core/utils';

const useWebKit = Platform.OS === 'ios';

const LoginScreen = ({ navigation }) => {
  const { config, theme } = useContext(AppContext);
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
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
    axios.post(`${config.baseUri}/authn`, {
      username: email.value,
      password: password.value
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then(async response => {
        const { data: { _embedded, status } } = response;
        const userId = _embedded.user.id;
        
        if(status === 'MFA_REQUIRED') {
          const { stateToken } =  response.data;
          const factorId = _embedded.factors[0].id;
          
          axios.post(`${config.baseUri}/authn/factors/${factorId}/verify`, {
            stateToken,
          })
            .then(verifyResponse => {
              if(verifyResponse.data.factorResult === 'CHALLENGE') {
                prompt(
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
                        axios.post(`${config.baseUri}/authn/factors/${factorId}/verify`, {
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
                    },
                  ],
                  {
                    keyboardType: 'numeric'
                  }
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
    CookieManager.clearAll(useWebKit)
    .then((success) => {
      const uri = `${config.authUri}?client_id=${config.clientId}&response_type=code&scope=openid%20offline_access%20profile&redirect_uri=${config.authUri}/callback&state=customstate&code_challenge_method=${config.codeChallengeMethod}&code_challenge=${config.codeChallenge}`;
      navigation.navigate('CustomWebView', { uri, onGoBack: (state) => onSignInSuccess(state), mode: 'auth' });
    });
  }

  const _onTouchIDPressed = async () => {
    const refreshToken = await AsyncStorage.getItem('@refreshToken');
  
    if(!refreshToken) {
      Alert.alert(
        'Error',
        'No previous sessions exist. You have to login first.',
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
    } else {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
      // if (biometryType === ReactNativeBiometrics.TouchID || biometryType === ReactNativeBiometrics.Biometrics) {
      //   ReactNativeBiometrics.createKeys('signin')
      //   .then((resultObject) => {
      //     const { publicKey } = resultObject;
        
      //     let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
      //     let payload = epochTimeSeconds + 'some message'
      //     ReactNativeBiometrics.createSignature({
      //       promptMessage: 'Confirm fingerprint',
      //       payload,
      //     })
      //       .then(async (resultObject) => {
      //         const { success, signature } = resultObject
  
      //         if (success) {
      //           await refreshSession();
      //         }
      //       })
      //       .catch((error) => {
      //         Alert.alert(
      //           'Error',
      //           'Something went wrong, please try again.',
      //           [
      //             { text: 'OK', onPress: () => {console.log('createKeyError--', error)} }
      //           ],
      //           { cancelable: false }
      //         );
      //       })
      //   });
      // } else {
        ReactNativeBiometrics.simplePrompt({
          promptMessage: 'Confirm fingerprint'
        })
          .then(async (resultObject) => {
            const { success } = resultObject
        
            if (success) {
              await refreshSession();
            } else {
              Alert.alert(
                'Error',
                'Something went wrong, please try again.',
              );
            }
          })
          .catch((error) => {
            Alert.alert(
              'Error',
              'Something went wrong, please try again.',
            );
          })
          
      //}
    }
  }

  refreshSession = async () => {
    const refreshToken = await AsyncStorage.getItem('@refreshToken');
    const uri = `${config.issuer}/v1/token?grant_type=refresh_token&client_id=${config.clientId}&redirect_uri=${config.authUri}/callbac&scope=openid%20offline_access&refresh_token=${refreshToken}`;
    setLoading(true);
    axios.post(uri, {
    }, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': `JSESSIONID=B70B6FD0E2A1CF2F00AC83629045FC18`,
      }
    })
    .then(async(response) => {
      setLoading(false);
      const { access_token, refresh_token } = response.data;
      await AsyncStorage.setItem('@accessToken', access_token);
      await AsyncStorage.setItem('@refreshToken', refresh_token);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Profile',
          },
        ],
      })
    })
    .catch(error => {
      setLoading(false);
      console.log('error--', error);
      const errorMsg = error && error.response && error.response.data && error.response.data.errorSummary ? error.response.data.errorSummary : 'An error has occured, please try again.';
      Alert.alert(
        'Error',
        errorMsg,
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
    })
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

  return (
    <Background>
      <BackButton goBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior='height' style={{ width: '100%', padding: 0 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} centerContent={true}>
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
              <Text style={{ color: theme.colors.secondary }}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          <Button mode="contained" onPress={_onLoginPressed}>
            Login
          </Button>

          <Button mode="contained" onPress={_onWebLoginPressed}>
            Login via webpage
          </Button>

          <Button mode="contained" onPress={_onTouchIDPressed}>
            Login with Fingerprint
          </Button>
          
          <View style={styles.row}>
            <Text style={{ color: theme.colors.secondary }}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, {color: theme.colors.primary}]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  link: {
    fontWeight: 'bold',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default memo(LoginScreen);
