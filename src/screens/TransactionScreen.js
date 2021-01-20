import React, { memo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Background from '../components/Background';
import BackButton from '../components/BackButton';
import Header from '../components/Header';
import { Snackbar } from 'react-native-paper';
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
const successMessage = 'Transaction has been successfully authorized.';

const TransactionScreen = ({ route, navigation }) => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [message, setMessage] = useState(successMessage);
  
  onPayment = () => {
    const uri = `${configFile.authUri}?client_id=${configFile.transactionalMFA.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
    navigation.navigate('CustomWebView', { uri, onGoBack: (status) => displayBanner(status) }, false);
  }

  displayBanner = (status) => {
    setMessage(status ? successMessage : 'An error has occured.');
    setBannerVisible(true);
  }

  return (
    <Background>
      <BackButton goBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Header>Account</Header>
        <View style={styles.inputContainer}>
          <View>
            <Text>Balance Details</Text>
            {
              history.map(item => (
                <View key={item.detail}>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                  <Text>{item.balance}</Text>
                </View>
              ))
            }
          </View>
          <View>

          </View>
          <Button mode="contained" onPress={onPayment} style={styles.button}>
            Submit Transfer
          </Button>
        </View>
      </View>
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
  itemDetail: {
    color: '#aaaaaa',
    fontSize: 15,
  }
});


export default memo(TransactionScreen);
