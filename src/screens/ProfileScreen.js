import React from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
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
    await this.loadProfile();
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
    customAxios.get(`${configFile.baseUri}/users/${userId}`)
      .then(response => {
        const { data } = response;
        this.setState({ progress: false, user: data.profile });
      }
      ,(e) => {
        this.setState({ progress: false, error: e.message });
      })
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
    console.log('---id', id);
    console.log('---accessToken', accessToken);
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
      console.log('error---', e);
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
              <Button onPress={this.uploadID} mode="outlined">
                Upload ID
              </Button>
              {
                idStatus === 'Pending' && <Button onPress={this.verifyId} mode="outlined">
                  Check Status
                </Button>
              }
              {
                idStatus === 'Verified' && <Text style={styles.verified}>ID Verified</Text>
              }
            </View>
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
  },
  verified: {
    color: 'green',
  }
});
