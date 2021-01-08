import React from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  ScrollView,
} from 'react-native';
import jwt from 'jwt-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import customAxios from '../components/Axios';
import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';
import configFile from '../../samples.config';

const termsText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: null,
      user: null,
      progress: true,
      error: '',
      userId: null,
      idStatus: null,
      uploadedID: null,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('focus', this.handleStateChange);
    this.handleStateChange();
    const uploadedID = await AsyncStorage.getItem('@uploadedID');
    if(uploadedID) {
      this.setState({ uploadedID });
    }
    const idStatus = await AsyncStorage.getItem('@idStatus');
    if(idStatus) {
      this.setState({ idStatus });
    }
  }

  loadProfile = async () => {
    this.setState({ progress: true });
    const accessToken = await AsyncStorage.getItem('@accessToken');
    if(accessToken) {
      this.setState({ accessToken });
    }

    let userId = await AsyncStorage.getItem('@userId');
    if(userId) {
      this.setState({ userId });
    } else {
      if(accessToken) {
        const result =  jwt.decode(accessToken).claimsSet;
        
        userId = result.uid;
        this.setState({ userId });
      }
    }

    // Checking if the user accepted the permission
    const acceptedUsers = await AsyncStorage.getItem('@acceptedUsers');
    const userArray = JSON.parse(acceptedUsers) || [];
    if(userArray.indexOf(userId) < 0)  {
      this.showTerms();
    } else {
      customAxios.get(`${configFile.baseUri}/users/${userId}`)
      .then(response => {
        const { data } = response;
        this.setState({ progress: false, user: data.profile });
      }
      ,(e) => {
        this.setState({ progress: false, error: e.message });
      })
    }
  }

  handleStateChange = async () => {
    this.loadProfile();
  }

  getAccessToken = async () => {
    const { navigation } = this.props;
    const { accessToken } = this.state;
    if(!accessToken) {
      const sessionToken = await AsyncStorage.getItem('@sessionToken');
      const uri = `${configFile.authUri}?client_id=${configFile.oidc.clientId}&response_type=token&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=${configFile.nonce}&sessionToken=${sessionToken}`;

      navigation.navigate('CustomWebView', { uri });
    }
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
      this.setState({ error: e.message })
    })
    .finally(e => {
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
  }

  uploadID = () => {
    const { accessToken } = this.state;
    const { navigation } = this.props;
    if(accessToken) {
      var instance = axios.create();
      delete instance.defaults.headers.common['Authorization'];
      instance.post(`${configFile.evidentUrl}/token`, {
        subdomain: "udp-mobile",
        app: "udp-mobile",
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
        navigation.navigate('IDVerification', { uri: url, id, onGoBack: () => this.verifyId() });
      }
      ,(e) => {
        Alert.alert(
          'Error',
          'An alert has occured, please try again later',
          [
            { text: 'OK', onPress: () => {} }
          ],
          { cancelable: false }
        );
      })
    }
  }

  verifyId = async () => {
    const { accessToken } = this.state;
    const id = await AsyncStorage.getItem('@uploadedID');

    var instance = axios.create();
    const self = this;
    delete instance.defaults.headers.common['Authorization'];
    instance.post(`${configFile.evidentUrl}/updateidentity`, {
      evident_id: id,
      subdomain: "udp-mobile",
      app: "udp-mobile",
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

      self.setState({ idStatus: status });

      await AsyncStorage.setItem('@idStatus', status);
      if(status === 'Verified') {
        await AsyncStorage.removeItem('@uploadedID');
      }
    }
    ,(e) => {
      console.log('----verifyError: ', e.response);
      Alert.alert(
        'Error',
        'An alert has occured, please try again later',
        [
          { text: 'OK', onPress: () => {} }
        ],
        { cancelable: false }
      );
    })

  }

  render() {
    const { navigation } = this.props;
    const { user, accessToken, error, progress, userId, idStatus } = this.state;

    return (
      <Background>
        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Header>Profile</Header>
            <Button style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('EditProfile', { user, userId })}>Edit</Button>
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
              {
                idStatus && <Text style={styles.verified}>{`ID Status: ${idStatus}`}</Text>
              }
              <Button onPress={this.uploadID} mode="outlined">
                Upload a new ID
              </Button>
              {
                idStatus === 'Pending' && <Button onPress={this.verifyId} mode="outlined">
                  Check Status
                </Button>
              }
            </View>
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
  verified: {
    marginTop: 20,
    color: 'green',
  }
});
