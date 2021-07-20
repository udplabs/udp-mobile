import React, { memo, useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Subheading,
  Title,
  TextInput as Input,
} from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import DropDown from 'react-native-paper-dropdown';
import BackButton from '../components/BackButton';
import Background from '../components/Background';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import { AppContext } from '../AppContextProvider';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const date = new Date();
const accounts = [
  {
    value: 0,
    label: '800000 Corporate',
  },
  {
    value: 1,
    label: '800001 Checking',
  }
];
const requiredFields = [
  {
    name: 'zipCode',
    label: 'Zip code',
    autoCompleteType: 'postal-code',
    textContentType: 'postalCode'
  },
  {
    name: 'streetAddress',
    label: 'Street address',
    autoCompleteType: 'street-address',
    textContentType: 'fullStreetAddress'
  },
  {
    name: 'city',
    label: 'City',
    textContentType: 'addressCity'
  },
  {
    name: 'state',
    label: 'State',
    textContentType: 'addressState'
  }
];
const successMessage = 'Transaction has been successfully authorized.';

const TransactionScreen = ({ route, navigation }) => {
  const [history, setHistory] = useState([
    {
      detail: `Ending balance as of ${date.toDateString()}`,
      balance: 5689,
    },
    {
      detail: `Available balance`,
      balance: 5129,
    }
  ]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const { config, theme } = useContext(AppContext);
  const [fromAccount, setFromAccount] = useState(accounts[0].value);
  const [toAccount, setToAccount] = useState(accounts[1].value);
  const [showFromDropDown, setShowFromDropDown] = useState(false);
  const [showToDropDown, setShowToDropDown] = useState(false);
  const [amount, setAmount] = useState({ value: '', error: ''});
  const [fields, setFields] = useState([]);
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalValues, setModalValues] = useState({
    zipCode: {
      value: '',
      error: '',
    },
    streetAddress: {
      value: '',
      error: '',
    },
    city: {
      value: '',
      error: '',
    },
    state: {
      value: '',
      error: '',
    }
  });

  useEffect(() => {
    const { user } = route.params;
    if(user) {
      const list = [];
      for(let item of requiredFields) {
        if(!user[item.name]) {
          list.push(item);
        }
      }
      setFields(list);
    }
  }, [route.params]);

  const onPayment = () => {
    if(!amount.value || parseFloat(amount.value) <= 0) {
      setAmount({ ...amount, error: 'You have to specify the amount'});
    } else {
      if (parseFloat(amount.value) <= 50) {
        return sendTransaction({ sent: amount.value });
      }
      // Require step up over 50
      const uri = `${config.authUri}?client_id=${config.transactionalMFA.clientId}&response_type=token&scope=openid&redirect_uri=${config.authUri}/callback&state=customstate&nonce=${config.nonce}`;
      console.log(uri);
      navigation.navigate('CustomWebView', { uri, onGoBack: (status, details) => displayBanner(status, {...details, data: { sent: amount.value }})} );
    }
  }

  const sendTransaction = (transaction) => {
    const { sent } = transaction;

      const historyCopy = history.concat();
      historyCopy[1].balance = history[1].balance - sent;
      setHistory(historyCopy);

      const transactionHistoryCopy = transactionHistory.concat();
      const now = new Date();
      transactionHistoryCopy.unshift({
        date: `${now.getMonth()}/${now.getDay()}/${now.getFullYear()}`,
        description: 'Account Transfer',
        amount: sent,
      });
      setTransactionHistory(transactionHistoryCopy);
  
      Alert.alert(
        '✅ Success',
        successMessage,
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
  }

  const displayBanner = (status, details) => {
    if(status) {
      sendTransaction(details.data);
    } else {
      if (details && details.action === 'CLOSED_WINDOW') {
        return Alert.alert(
          '⚠️ Transaction Cancelled',
          'MFA verification required to send money',
          [
            { text: 'OK', onPress: () => {} }
          ],
          { cancelable: false }
        );
      }
      Alert.alert(
        'Failure',
        'An error has occured.',
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
    }
  }

  const changeModalValues = (name, text) => {
    switch(name) {
      case 'zipCode':
        setModalValues({...modalValues, zipCode: { value: text, error: '' } });
        break;
      case 'streetAddress':
        setModalValues({...modalValues, streetAddress: { value: text, error: '' } });
        break;
      case 'city':
        setModalValues({...modalValues, city: { value: text, error: '' } });
        break;
      case 'state':
        setModalValues({...modalValues, state: { value: text, error: '' } });
        break;
    }
  }

  const onUpdateProfile = () => {
    const { accessToken, userId, user } = route.params;
    setLoading(true);
    axios.post(`${config.customAPIUrl}/api/users/${userId}/register`, {
      profile: {
        ...user,
        ...modalValues.zipCode.value && { zipCode: modalValues.zipCode.value },
        ...modalValues.streetAddress.value && { streetAddress: modalValues.streetAddress.value },
        ...modalValues.city.value && { city: modalValues.city.value },
        ...modalValues.state.value && { state: modalValues.state.value },
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
          { text: 'OK', onPress: () => {
            setModalVisible(false);
            setLoading(false);
          } }
        ],
        { cancelable: false }
      );
    }
    ,(error) => {
      Alert.alert(
        'Error',
        'An error has occured, please try again.',
        [
          { text: 'OK', onPress: () => { setLoading(false)} }
        ],
        { cancelable: false }
      );
    })
  }

  return (
    <Background>
      <Spinner
        visible={loading}
        textContent={'Loading...'}
        textStyle={styles.spinnerTextStyle}
      />
      <BackButton goBack={() => navigation.goBack()} />
      {
        modalVisible && fields.length > 0 ? 
        <KeyboardAvoidingView behavior='height' style={{ width: '100%', padding: 0 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}>
          <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} centerContent={true}>
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', height, justifyContent: 'center' }}>
              <View style={styles.modalContainer}>
                <Header>Update Profile</Header>
                <Paragraph>You need to fill the following fields to proceed</Paragraph>
                <View>
                  {
                    fields.map(item => (
                      <TextInput
                        key={item.name}
                        label={item.label}
                        returnKeyType="next"
                        value={modalValues[item.name].value}
                        onChangeText={text => changeModalValues(item.name, text)}
                        error={!!modalValues[item.name].error}
                        errorText={modalValues[item.name].error}
                        autoCompleteType={item.autoCompleteType ? item.autoCompleteType : 'off'}
                        textContentType={item.textContentType}
                      />
                    ))
                  }
                </View>
                <Button mode="contained" onPress={onUpdateProfile} style={styles.button}>
                  Update
                </Button>
              </View>
            </View>
          </ScrollView>
          </KeyboardAvoidingView> : (
          <KeyboardAvoidingView behavior='height' style={{ width: '100%', padding: 0 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}>
            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} centerContent={true}>
              <View style={styles.container}>
                <Header>Account</Header>
                <View style={styles.inputContainer}>
                  <View style={styles.panel}>
                    <Title>Account History</Title>
                    <Subheading>Balance Details</Subheading>
                    {
                      history.map(item => (
                        <View key={item.detail} style={styles.row}>
                          <Text style={styles.itemDetail}>{item.detail}</Text>
                          <Text style={[styles.amount, {color: theme.colors.primary}]}>{`$${item.balance}`}</Text>
                        </View>
                      ))
                    }
                  </View>

                  <View style={styles.panel}>
                    <Title>Recent Activity</Title>
                    <Subheading>Most Recent Transactions</Subheading>
                    {
                      transactionHistory.slice(0, 5).map((item, index)=> (
                        <View key={`${item.date}-${item.amount}-${index}`} style={[styles.row, { justifyContent: 'space-between', flexDirection: 'row', marginTop: 5, alignItems: 'center'}]}>
                          <Text style={[styles.itemDetail, { marginTop: 0}]}>{item.date} - {item.description}</Text>
                          <Text style={[styles.amount, {color: theme.colors.primary, marginTop: 0}]}>{`$${item.amount}`}</Text>
                        </View>
                      ))
                    }
                  </View>
                  <View style={styles.panel}>
                    <Title>Transfer Money</Title> 
                    <View style={styles.row}>
                      <DropDown
                        label={'From Account'}
                        mode={'outlined'}
                        value={fromAccount}
                        setValue={(value) => {
                          setFromAccount(value);
                          if(toAccount === value) {
                            const newValue = accounts.filter(item => item.value !== value)[0].value;
                            setToAccount(newValue);
                          }
                        }}
                        list={accounts}
                        visible={showFromDropDown}
                        showDropDown={() => setShowFromDropDown(true)}
                        onDismiss={() => setShowFromDropDown(false)}
                        inputProps={{
                          right: <Input.Icon name={'menu-down'} />,
                        }}
                      />
                    </View>
                    <View style={styles.row}>
                      <DropDown
                        label={'To Account'}
                        mode={'outlined'}
                        value={toAccount}
                        setValue={(value) => {
                          setToAccount(value);
                          if(fromAccount === value) {
                            const newValue = accounts.filter(item => item.value !== value)[0].value;
                            setFromAccount(newValue);
                          }
                        }}
                        list={accounts}
                        visible={showToDropDown}
                        showDropDown={() => setShowToDropDown(true)}
                        onDismiss={() => setShowToDropDown(false)}
                        inputProps={{
                          right: <Input.Icon name={'menu-down'} />,
                        }}
                      />
                    </View>
                    <View style={styles.row}>
                      <TextInput
                        label="Amount to Transfer"
                        value={amount.value}
                        onChangeText={amount => setAmount({value: amount, error: ''})}
                        error={!!amount.error}
                        errorText={amount.error}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <Button mode="contained" onPress={onPayment} style={styles.button}>
                    Submit Transfer
                  </Button>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )
      }
    </Background>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    flexDirection: 'column',
    width: '100%',
    paddingVertical: 30,
    alignItems: 'center',
  },
  inputContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  panel: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    padding: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%'
  },
  itemDetail: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 15,
  },
  row: {
    marginBottom: 10,
    width: '100%',
  },
  amount: {
    marginTop: 10,
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    justifyContent: 'center'
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default memo(TransactionScreen);
