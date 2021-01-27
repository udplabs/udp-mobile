import React, { memo, useEffect, useState } from 'react';
import { View, Alert, StyleSheet, Text, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

import {
  emailValidator,
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
  const [zipCode, setZipCode] = useState({ value: '', error: '' });
  const [streetAddress, setStreetAddress] = useState({ value: '', error: '' });
  const [city, setCity] = useState({ value: '', error: '' });
  const [state, setState] = useState({ value: '', error: '' });
  const [page, setPage] = useState(0);
  const [idStatus, setIdStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setZipCode({ value: user.zipCode, error: ''});
      setCity({ value: user.city, error: ''});
      setStreetAddress({ value: user.streetAddress, error: ''});
      setState({ value: user.state, error: ''});
    }

    async function getIdStatus () {
      const idStatus = await AsyncStorage.getItem('@idStatus');
      if(idStatus) {
        setIdStatus(idStatus);
      }
    }
    
    getIdStatus();
  }, [route.pararms]);

  uploadID = () => {
    const { accessToken } = route.params;
    if(accessToken) {
      setLoading(true);
      axios.post(`${configFile.customAPIUrl}/evidentio/token`, {
        subdomain: configFile.udp_subdomain,
        app: configFile.app_name,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        const { data: {
          id,
          _links: {
            url
          }
        }} = response;
        setLoading(false);
        navigation.navigate('IDVerification', { uri: url, id, onGoBack: () => verifyId() });
      }
      ,(e) => {
        Alert.alert(
          'Error',
          'An alert has occured, please try again later',
          [
            { text: 'OK', onPress: () => {setLoading(false);} }
          ],
          { cancelable: false }
        );
      })
    }
  }

  verifyId = async () => {
    const { accessToken } = route.params;
    const id = await AsyncStorage.getItem('@uploadedID');
    setLoading(true);
    axios.post(`${configFile.customAPIUrl}/evidentio/updateidentity`, {
      evident_id: id,
      subdomain: configFile.udp_subdomain,
      app: configFile.app_name,
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    })
    .then(async(response) => {
      const {
        data: {
          status
        }
      } = response;
      setIdStatus(status);
      setLoading(false);
      await AsyncStorage.setItem('@idStatus', status);
      if(status === 'Verified') {
        await AsyncStorage.removeItem('@uploadedID');
        loadProfile();
      }
    }
    ,(e) => {
      console.log('----verifyError: ', e.response);
      Alert.alert(
        'Error',
        'An alert has occured, please try again later',
        [
          { text: 'OK', onPress: () => {setLoading(false)} }
        ],
        { cancelable: false }
      );
    })

  }

  loadProfile = () => {
    const { accessToken, userId } = route.params;
    if(accessToken) {
      setLoading(true);
      // Checking if the user accepted the permission
      
      axios.get(`${configFile.customAPIUrl}/proxy/${configFile.udp_subdomain}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}
      )
      .then(response => {
        setLoading(false);
        const { data } = response;
        const user = data.profile;
        setFirstName({ value: user.firstName, error: '' });
        setLastName({ value: user.lastName, error: '' });
        setEmail({ value: user.email, error: '' });
        setPhoneNumber({ value: user.primaryPhone, error: '' });
        setZipCode({ value: user.zipCode, error: ''});
        setCity({ value: user.city, error: ''});
        setStreetAddress({ value: user.streetAddress, error: ''});
        setState({ value: user.state, error: ''});
      }
      ,(e) => {
        Alert.alert(
          'Error',
          'An alert has occured, please try again later',
          [
            { text: 'OK', onPress: () => {setLoading(false)} }
          ],
          { cancelable: false }
        );
      })
    }
  }

  _onSave = async () => {
    const { accessToken, user } = route.params;
    if(page === 0) {
      const firstNameError = nameValidator(firstName.value);
      const lastNameError = nameValidator(lastName.value);
      const emailError = emailValidator(email.value);
      const phoneNumberError = phoneNumberValidator(phoneNumber.value);
      if (emailError || lastNameError || firstNameError) {
        setFirstName({ ...firstName, error: firstNameError });
        setLastName({ ...lastName, error: lastNameError });
        setEmail({ ...email, error: emailError });
        return;
      }
      if (phoneNumberError) {
        setPhoneNumber({ ...phoneNumber, error: phoneNumberError });
        if(password.value !== confirmPassword.value) {
          alert('Passwords do not match');
        }
        return;
      }
      setPage(1);
    } else if(page === 1) {
      setLoading(true);
      axios.put(`${configFile.customAPIUrl}/proxy/${configFile.udp_subdomain}/users/${userId}`, {
        profile: {
          ...user,
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          login: email.value,
          primaryPhone: phoneNumber.value,
          zipCode: zipCode.value,
          streetAddress: streetAddress.value,
          city: city.value,
          state: state.value,
        },
        ...password.value && {
          credentials: {
            password: {
              value: password.value,
            }
          }
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        Alert.alert(
          'Success',
          'Your profile was updated successfully.',
          [
            { text: 'OK', onPress: () =>{ setLoading(false) } }
          ],
          { cancelable: false }
        );
      }
      ,(error) => {
        
        Alert.alert(
          'Error',
          'An error has occured, please try again.',
          [
            { text: 'OK', onPress: () => {setLoading(false)} }
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
    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Spinner
          visible={loading}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        
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
            label="Zip code"
            returnKeyType="next"
            value={zipCode.value}
            onChangeText={text => setZipCode({ value: text, error: '' })}
            error={!!zipCode.error}
            errorText={zipCode.error}
            autoCapitalize="none"
            autoCompleteType="postal-code"
            textContentType="postalCode"
          />
          <TextInput
            label="Street address"
            returnKeyType="next"
            value={streetAddress.value}
            onChangeText={text => setStreetAddress({ value: text, error: '' })}
            error={!!streetAddress.error}
            errorText={streetAddress.error}
            autoCompleteType="street-address"
            textContentType="fullStreetAddress"
          />
          <TextInput
            label="City"
            returnKeyType="next"
            value={city.value}
            onChangeText={text => setCity({ value: text, error: '' })}
            error={!!city.error}
            errorText={city.error}
            textContentType="addressCity"
          />
          <TextInput
            label="State"
            returnKeyType="next"
            value={state.value}
            onChangeText={text => setState({ value: text, error: '' })}
            error={!!state.error}
            errorText={state.error}
            textContentType="addressState"
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
      {
        !!idStatus && <Text style={styles.verified}>{`ID Status: ${idStatus}`}</Text>
      }
      <Button onPress={uploadID} mode="outlined">
        Upload a new ID
      </Button>
      {
        idStatus === 'Pending' && <Button onPress={verifyId} mode="outlined">
          Check Status
        </Button>
      }
      </View>
     </ScrollView>
   
   
  </Background>
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  inputContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
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
  },
  verified: {
    marginTop: 20,
    color: 'green',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});


export default memo(EditProfileScreen);
