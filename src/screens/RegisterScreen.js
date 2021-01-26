import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import ConfirmGoogleCaptcha from 'react-native-google-recaptcha-v2';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import {
  emailValidator,
  passwordValidator,
  nameValidator,
  phoneNumberValidator,
} from '../core/utils';
import configFile from '../../samples.config';

const siteKey = configFile.reCaptchaSiteKey;
const baseUrl = configFile.reCaptchaBaseUrl;

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });
  const [loading, setLoading] = useState(false);

  onMessage = event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        captchaForm.hide();
        return;
      } else {
        console.log('Verified code from Google', event.nativeEvent.data);
        setTimeout(() => {
          captchaForm.hide();
          const url = `${configFile.customAPIUrl}/proxy/udp-mobile/users?activate=true`;
          setLoading(true);
          axios.post(url, {
            profile: {
              firstName: firstName.value,
              lastName: lastName.value,
              email: email.value,
              login: email.value,
              primaryPhone: phoneNumber.value,
            },
            credentials: {
              password: {
                value: password.value,
              }
            }
          }, {
            headers: {
              Authorization: 'Bearer zt100'
            }
          }
          )
          .then(response => {
            setLoading(false);
            Alert.alert(
              'Signup',
              'You have signed up successfully. Please login to continue.',
              [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
              ],
              { cancelable: false }
            );
          }
          ,(error) => {
            setLoading(false);
            Alert.alert(
              'Error',
              'An error has occured, please try again.',
              [
                { text: 'OK', onPress: () => console.log('error', error.message) }
              ],
              { cancelable: false }
            );
          })

        }, 1500);
      }
    }
  };

  const _onSignUpPressed = () => {
    const firstNameError = nameValidator(firstName.value);
    const lastNameError = nameValidator(lastName.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    const phoneNumberError = phoneNumberValidator(phoneNumber.value);

    if (emailError || passwordError || firstNameError || lastNameError) {
      setFirstName({ ...firstName, error: firstNameError });
      setLastName({ ...lastName, error: lastNameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setPhoneNumber({ ...phoneNumber, error: phoneNumberError });
      return;
    }
    captchaForm.show();
   
  };

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

          <Header>Create Account</Header>
          <TextInput
            label="First Name"
            returnKeyType="next"
            value={firstName.value}
            onChangeText={text => setFirstName({ value: text, error: '' })}
            error={!!firstName.error}
            errorText={firstName.error}
          />

          <TextInput
            label="Last Name"
            returnKeyType="next"
            value={lastName.value}
            onChangeText={text => setLastName({ value: text, error: '' })}
            error={!!lastName.error}
            errorText={lastName.error}
          />

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
            keyboardType="numeric"
            returnKeyType="next"
            label="Mobile number"
            placeholder='Enter mobile number'
            value={phoneNumber.value}
            error={!!phoneNumber.error}
            errorText={phoneNumber.error}
            onChangeText={(value) => {
              let num = value.replace(".", '');
              if(isNaN(num)){
                  // Its not a number
              }else{
                  setPhoneNumber({ value: num, error: ''})}  
              }
            }
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
          <Button mode="contained" onPress={_onSignUpPressed} style={styles.button}>
            Sign Up
          </Button>

          <View style={styles.row}>
            <Text style={styles.label}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
          <ConfirmGoogleCaptcha
            ref={_ref => captchaForm = _ref}
            siteKey={siteKey}
            baseUrl={baseUrl}
            languageCode='en'
            onMessage={onMessage}
          />
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
  label: {
    color: theme.colors.secondary,
  },
  button: {
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default memo(RegisterScreen);
