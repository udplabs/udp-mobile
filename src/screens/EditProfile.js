import React, { memo, useEffect, useState, useRef } from 'react';
import { View, Alert, StyleSheet, Dimensions } from 'react-native';

import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import axios from '../components/Axios';
import {
  emailValidator,
  passwordValidator,
  nameValidator,
  phoneNumberValidator,
} from '../core/utils';
import configFile from '../../samples.config';


const EditProfileScreen = ({ route, navigation }) => {
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [confirmPassword, setConfirmPassword] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });
  const [page, setPage] = useState(0);

  useEffect(() => {
    const { user, userId } = route.params;
    if(userId) {
      setUserId(userId);
    }
    if(user) {
      setFirstName({ value: user.firstName, error: '' });
      setLastName({ value: user.lastName, error: '' });
      setEmail({ value: user.email, error: '' });
      setPhoneNumber({ value: user.primaryPhone, error: '' });
    }
    
  }, [route.pararms]);

  _onSave = () => {
    if(page === 0) {
      const firstNameError = nameValidator(firstName.value);
      const lastNameError = nameValidator(lastName.value);
      const emailError = emailValidator(email.value);
    
      if (emailError || lastNameError || firstNameError) {
        setFirstName({ ...firstName, error: firstNameError });
        setLastName({ ...lastName, error: lastNameError });
        setEmail({ ...email, error: emailError });
        return;
      }
      setPage(1);
    } else if(page === 1) {
      const phoneNumberError = phoneNumberValidator(phoneNumber.value);
      if (phoneNumberError) {
        setPhoneNumber({ ...phoneNumber, error: phoneNumberError });
        if(password.value !== confirmPassword.value) {
          alert('Passwords do not match');
        }
        return;
      }
      axios.put(`${configFile.baseUri}/users/${userId}`, {
        profile: {
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          login: email.value,
          primaryPhone: phoneNumber.value,
        },
        ...password.value && {
          credentials: {
            password: {
              value: password.value,
            }
          }
        }
      })
      .then(response => {
        Alert.alert(
          'Success',
          'Your profile was updated successfully.',
          [
            { text: 'OK', onPress: () =>{ navigation.goBack(null)} }
          ],
          { cancelable: false }
        );
      }
      ,(error) => {
        Alert.alert(
          'Error',
          'An error has occured, please try again.',
          [
            { text: 'OK', onPress: () => console.log('error', error.response) }
          ],
          { cancelable: false }
        );
      })
    }
  }

  _onGoBack = () => {
    setPage(0);
  }

  return <Background>
    <BackButton goBack={() => navigation.goBack()} />
    <View style={styles.container}>
      <Header>Edit Profile</Header>
      { page === 0 && (
        <View style={styles.inputContainer}>
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

          <Button mode="contained" onPress={_onSave} style={styles.button}>
            Save and Continue
          </Button>

        </View>
      )
    }
    {
      page === 1 && (
      <View style={styles.inputContainer}>
        <TextInput
          keyboardType="numeric"
          returnKeyType="next"
          placeholder='Enter mobile number'
          label="Mobile number"
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
          placeholder="Password"
          returnKeyType="next"
          value={password.value}
          onChangeText={text => setPassword({ value: text, error: '' })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry
        />

        <TextInput
          label="Confirm Password"
          placeholder="Confirm Password"
          returnKeyType="done"
          value={confirmPassword.value}
          onChangeText={text => setConfirmPassword({ value: text, error: '' })}
          error={!!confirmPassword.error}
          errorText={confirmPassword.error}
          secureTextEntry
        />
        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={_onSave} style={styles.button}>
            Save
          </Button>
          <Button mode="contained" onPress={_onGoBack} style={styles.button}>
            Go Back
          </Button>
        </View>
      </View>
    )}
    </View>
  </Background>
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    flexDirection: 'column',
    width: '100%',
  },
  inputContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonRow: {
    flexDirection: 'column',
    width: '100%',
  },
  button: {
    width: '100%'
  }
});


export default memo(EditProfileScreen);
