import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
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

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });

  const _onSignUpPressed = () => {
    const firstNameError = nameValidator(firstName.value);
    const lastNameError = nameValidator(lastName.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    const phoneNumberError = phoneNumberValidator(phoneNumber.value);

    if (emailError || passwordError || firstNameError) {
      setFirstName({ ...firstName, error: firstNameError });
      setLastName({ ...lastName, error: lastNameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      setPhoneNumber({ ...phoneNumber, error: phoneNumberError });
      return;
    }
    axios.post(`${configFile.baseUri}/users?activate=true`, {
      profile: {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        login: email.value,
        mobilePhone: phoneNumber.value,
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
});

export default memo(RegisterScreen);
