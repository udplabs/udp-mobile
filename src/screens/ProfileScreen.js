import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  // Alert,
} from 'react-native';
import jwt from 'jwt-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';

import axios from '../components/Axios';
import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';
import configFile from '../../samples.config';

export class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: null,
      user: null,
      progress: true,
      error: '',
      userId: null,
      hasConsent: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('focus', this.handleStateChange);
    this.handleStateChange();
    this.setState({ progress: true });
    
    let userId = await AsyncStorage.getItem('@userId');
    if(userId) {
      this.setState({ userId });
    }
    if(!userId) {
      const accessToken = await AsyncStorage.getItem('@accessToken');
      if(accessToken) {
        const result =  jwt.decode(accessToken).claimsSet;
        console.log('---result', result);
        userId = result.uid;
        this.setState({ userId, accessToken });
      }
    }
    axios.get(`${configFile.baseUri}/users/${userId}`)
      .then(response => {
        const { data } = response;
        this.setState({ progress: false, user: data.profile });
      }
      ,(e) => {
        this.setState({ progress: false, error: e.message });
      })
  }

  handleStateChange = async () => {
    const hasConsent = await AsyncStorage.getItem('@hasConsent');
    this.setState({ hasConsent: hasConsent === 'phone' });
  }

  getAccessToken = async () => {
    const { accessToken } = this.state;
    if(!accessToken) {
      const sessionToken = await AsyncStorage.getItem('@sessionToken');
      const url = `${configFile.authUri}?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.oidc.redirectUri}&state=customstate&nonce=${configFile.nonce}&sessionToken=${sessionToken}&prompt=none`;

      axios.get(url)
        .then(response => {
          console.log('----', response.data);
        })
        .catch(error => {
          console.log('----', error);
        })
    }
  }

  logout = async () => {
    const { navigation } = this.props;
 
    clearTokens()
    .then(() => {
    })
    .catch(async e => {
      this.setState({ error: e.message })
    })
    .finally(e => {
      AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(() => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                { name: 'Home' },
              ],
            })
          );
        });
    });
  }

  // getConsent = () => {
  //   const { accessToken } = this.state;
  //   Alert.alert(
  //     'Consent',
  //     'Needs user consent to get the phone number',
  //     [
  //       {
  //         text: 'OK', onPress: () => {
  //           const uri = `${configFile.authBaseUri}${configFile.authServerId}/v1/authorize?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid%20phone&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
  //           this.props.navigation.navigate('CustomWebView', { accessToken, uri });
  //         }
  //       },
  //       {
  //         text: "Cancel",
  //         onPress: () => console.log("Cancel Pressed"),
  //         style: "cancel"
  //       },
  //     ],
  //     { cancelable: false }
  //   );
  // }

  render() {
    const { navigation } = this.props;
    const { user, accessToken, error, progress, hasConsent } = this.state;

    return (
      <Background>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Header>Profile</Header>
            <Button onPress={() => navigation.navigate('EditProfile')}>Edit</Button>
          </View>
          
          <Spinner
            visible={progress}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
          <Error error={error} />
          { user && (
            <View style={{ paddingTop: 20, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Text style={styles.titleHello}>Welcome {user.firstName}</Text>
              <Text style={styles.titleDetails}>Name: {`${user.firstName} ${user.lastName}`}</Text>
              <Text style={styles.titleDetails}>Email: {user.email}</Text>
              {/* {
                !hasConsent && <Button onPress={this.getConsent}>Get consent</Button>
              } */}
              {
                user.primaryPhone && hasConsent && <Text style={styles.titleDetails}>Phone Number: {user.primaryPhone}</Text>
              }
            </View>
          )}
          <View style={{ flexDirection: 'column', marginTop: 20 }}>
            {
              !accessToken && <Button style={{ marginTop: 40 }} onPress={this.getAccessToken} >Get Access token</Button>
            }
            { accessToken &&
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenTitle}>Access Token:</Text>
                <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
              </View>
            }
            <View style={styles.row}>
              <Button onPress={this.logout} mode="outlined">
                Logout
              </Button>
            </View>
          </View>
        </View>
      </Background>
    );
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logoutButton: {
    paddingLeft: 10,
    fontSize: 16,
    color: '#0066cc'
  },
  container: {
    flex: 1,
    paddingTop: 40,
    flexDirection: 'column',
    width: '100%',
  },
  titleHello: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    paddingTop: 40
  },
  titleDetails: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 15,
    textAlign: 'center',
  },
  tokenContainer: {
    marginTop: 20
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});
