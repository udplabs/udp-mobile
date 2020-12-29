import React, { memo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
import TextInput from '../components/TextInput';

const EditProfileScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState({ value: '', error: '' });
  const [lastName, setLastName] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [phoneNumber, setPhoneNumber] = useState({ value: '', error: '' });
  return <Background>
    <BackButton goBack={() => navigation.goBack()} />
    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
      
      <View style={styles.inputContainer}>
      <Header>Edit Profile</Header>
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
      </View>
    </ScrollView>
  </Background>
};

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});


export default memo(EditProfileScreen);
