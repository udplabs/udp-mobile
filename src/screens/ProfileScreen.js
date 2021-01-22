import React from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  ScrollView,
} from 'react-native';
import jwt from 'jwt-lite';
import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';

import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';
import configFile from '../../samples.config';

const termsText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const useWebKit = true;

export class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: null,
      user: null,
      progress: false,
      error: '',
      userId: null,

    };
  }

  async componentDidMount() {
    const { navigation, route } = this.props;
    const incognito = route.params && route.params.incognito;
    
    const accessToken = await AsyncStorage.getItem('@accessToken');
    if(accessToken) {
      this.setState({ accessToken }, () => {
        this.loadProfile();
        navigation.addListener('focus', this.loadProfile);
      });
    } else {
      const uri = `${configFile.authUri}?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}`;
      navigation.navigate('CustomWebView', { uri, onGoBack: (state, access_token) => onSignInSuccess(access_token), incognito: false });
    }
  }

  loadProfile = async () => {
    console.log('loadprofile--', this.loadProfile);
    const { accessToken } = this.state;
    if(accessToken) {
      this.setState({ progress: true });
      let userId = await AsyncStorage.getItem('@userId');
      if(userId) {
        this.setState({ userId });
      } else {
        const result =  jwt.decode(accessToken).claimsSet;
        userId = result.uid;
        this.setState({ userId });
      }

      // Checking if the user accepted the permission
      const acceptedUsers = await AsyncStorage.getItem('@acceptedUsers');
      const userArray = JSON.parse(acceptedUsers) || [];
      if(userArray.indexOf(userId) < 0)  {
        this.showTerms();
      } else {
        axios.get(`${configFile.customUrl}/proxy/udp-mobile/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }}
        )
        .then(response => {
          const { data } = response;
          this.setState({ progress: false, user: data.profile });
        }
        ,(e) => {

          if(e.response && e.response.data && e.response.data.message === 'Unauthorized') {
            Alert.alert(
              'Error',
              'Session has expired. Please try to login again',
              [
                { text: 'OK', onPress: async () => {
                  this.logout();
                }
                }
              ]
            );
          } else {
            this.setState({ progress: false, error: e.message });
          }
        })
      }
    }
  }

  onSignInSuccess = async(access_token) => {
    await AsyncStorage.setItem('@accessToken', access_token);
  }

  transactionalMFA = async () => {
    const { navigation } = this.props;
    const { accessToken, user, userId } = this.state;

    navigation.navigate('Transaction', { accessToken, user, userId });
  }

  showTerms = () => {
    Alert.alert(
      'Terms and Conditions',
      termsText,
      [
        { text: 'Agree', onPress: async () => {
          const { userId } = this.state;
          if(userId) {
            const acceptedUsers = await AsyncStorage.getItem('@acceptedUsers');
            const userArray = JSON.parse(acceptedUsers) || [];
            userArray.push(userId);
            await AsyncStorage.setItem('@acceptedUsers', JSON.stringify(userArray));
            this.loadProfile();
          }

        } },
        { text: 'Disagree', onPress: () => this.logout(), style: 'cancel'}
      ],
      { cancelable: false }
    );
  }

  logout = async () => {
    const { navigation } = this.props;
 
    clearTokens()
    .then(() => {
    })
    .catch(async e => {
      //this.setState({ error: e.message })
    })
    .finally(e => {
      CookieManager.clearAll(useWebKit)
        .then((success) => {
          console.log('CookieManager.clearAll =>', success);
          AsyncStorage.getAllKeys()
          .then(keys => {
            if(keys.indexOf('@acceptedUsers') > -1) {
              keys.splice(keys.indexOf('@acceptedUsers'), 1);
            }
            AsyncStorage.multiRemove(keys);
          })
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
    });
  }

  render() {
    const { navigation } = this.props;
    const { user, accessToken, error, progress, userId } = this.state;

    return (
      <Background>
        
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.headerRow}>
              <Header>Profile</Header>
              <Button style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('EditProfile', { user, userId, accessToken })}>Edit</Button>
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
                {
                  user.primaryPhone && <Text style={styles.titleDetails}>Phone Number: {user.primaryPhone}</Text>
                }
              </View>
            )}
            <View style={{ flexDirection: 'column', marginTop: 20 }}>
              
              { accessToken &&
                <View style={styles.tokenContainer}>
                  <Text style={styles.tokenTitle}>Access Token:</Text>
                  <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
                </View>
              }
              {
                accessToken && <Button style={{ marginTop: 40 }} onPress={this.transactionalMFA} >Transactions</Button>
              }
             
              <View style={styles.row}>
                <Button onPress={this.logout} mode="outlined">
                  Logout
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
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
  },
});
