import React from 'react';
import {
  StyleSheet,
  Text,
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
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('focus', this.handleStateChange);
    this.handleStateChange();
    await this.loadProfile();
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

  verifyId = () => {
    const { accessToken } = this.state;
    console.log('---', accessToken);
    axios.post(`${configFile.evidentUrl}/token`, {
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
      .then(response => {
        const { data } = response;
        console.log('response---', data);
      }
      ,(e) => {
        console.log('error---', e);
      })
  }

  render() {
    const { navigation } = this.props;
    const { user, accessToken, error, progress, userId } = this.state;

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
              <Button onPress={this.verifyId} mode="outlined">
                Verify ID
              </Button>
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
  }
});
