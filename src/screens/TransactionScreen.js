import React, { memo, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
import { Snackbar, Subheading, Title, TextInput as Input } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';

import TextInput from '../components/TextInput';
import { theme } from '../core/theme';
import Button from '../components/Button';
import configFile from '../../samples.config';

const date = new Date();
const history = [
  {
    detail: `Ending balance as of ${date.toDateString()}`,
    balance: 5689,
  },
  {
    detail: `Available balance`,
    balance: 5129,
  }
];
const accounts = [
  {
    value: 0,
    label: '800000 Corporate',
  },
  {
    value: 1,
    label: '800001 Checking',
  }
]
const successMessage = 'Transaction has been successfully authorized.';

const TransactionScreen = ({ route, navigation }) => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [message, setMessage] = useState(successMessage);
  const [fromAccount, setFromAccount] = useState(null);
  const [toAccount, setToAccount] = useState(null);
  const [showFromDropDown, setShowFromDropDown] = useState(false);
  const [showToDropDown, setShowToDropDown] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);

  onPayment = () => {
    if(!amount || amount <= 0) {
      setAmountError('You have to specify the amount');
    } else {
      setAmountError(null);
      const uri = `${configFile.authUri}?client_id=${configFile.transactionalMFA.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
      navigation.navigate('CustomWebView', { uri, onGoBack: (status) => displayBanner(status) }, false);
    }
    
  }

  displayBanner = (status) => {
    setMessage(status ? successMessage : 'An error has occured.');
    setBannerVisible(true);
  }

  return (
    <Background>
      <BackButton goBack={() => navigation.goBack()} />
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.amount}>{`$${item.balance}`}</Text>
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
                setValue={setFromAccount}
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
                setValue={setToAccount}
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
                value={amount}
                onChangeText={amount => setAmount(amount)}
                error={!!amountError}
                errorText={amountError}
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
      <Snackbar
        visible={bannerVisible}
        action={{
          label: 'OK',
          onPress: () => {
            setBannerVisible(false);
          },
        }}
        onDismiss={() => {}}
      >
        {message}
      </Snackbar>
    </Background>
  )
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
    color: theme.colors.primary,
  }
});

export default memo(TransactionScreen);
