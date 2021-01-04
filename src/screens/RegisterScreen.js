import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import ConfirmGoogleCaptcha from 'react-native-google-recaptcha-v2';
import CheckBox from '@react-native-community/checkbox';

import axios from '../components/Axios';
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

const termsText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  onMessage = event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        captchaForm.hide();
        return;
      } else {
        console.log('Verified code from Google', event.nativeEvent.data);
        setTimeout(() => {
          captchaForm.hide();
          
          axios.post(`${configFile.baseUri}/users?activate=true`, {
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
          })
          .then(response => {
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

  showTerms = () => {
    Alert.alert(
      'Terms and Conditions',
      termsText,
      [
        { text: 'OK', onPress: () => {} }
      ],
      { cancelable: false }
    );
  }

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
          <View style={styles.termsRow}>
            <CheckBox
              disabled={false}
              value={toggleCheckBox}
              onValueChange={(newValue) => setToggleCheckBox(newValue)}
            />
            <Text style={{ marginLeft: 10 }}>I agree to </Text>
            <TouchableOpacity style={styles.termsButton} onPress={showTerms}>
              <Text style={{ color: 'blue' }}>terms and conditions</Text>
            </TouchableOpacity>
          </View>
          <Button mode="contained" onPress={_onSignUpPressed} style={styles.button} disabled={!toggleCheckBox}>
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
    paddingBottom: 20,
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
  termsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  termsButton: {
    padding: 0,
    margin: 0,
  }
});

export default memo(RegisterScreen);
