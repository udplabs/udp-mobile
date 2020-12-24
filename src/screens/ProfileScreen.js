import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from '../components/Axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessToken, clearTokens, introspectAccessToken } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';

import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';
import configFile from '../../samples.config';
import samplesConfig from '../../samples.config';

export class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: null,
      user: null,
      progress: true,
      error: ''
    };
  }

  async componentDidMount() {
    this.setState({ progress: true });
    let userId = await AsyncStorage.getItem('@userId');
   
    if(!userId) {
      const token = await AsyncStorage.getItem('@accessToken');
      console.log('----token', token);
      const result = await introspectAccessToken(token);
      userId = result.uid;
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

  getAccessToken = async () => {
    let userId = await AsyncStorage.getItem('@userId');
    if(!userId) {
      this.setState({ progress: false });
      getAccessToken()
        .then(token => {
          this.setState({
            progress: false,
            accessToken: token.access_token
          });
        })
        .catch(e => {
          this.setState({ progress: false, error: e.message });
        })
    } else {
      const sessionToken = await AsyncStorage.getItem('@sessionToken');
      const url = `https://udp-udp-mobile-6aa.oktapreview.com/oauth2/v1/authorize?client_id=${samplesConfig.oidc.clientId}&response_type=token&scope=openid&redirect_uri=${samplesConfig.oidc.redirectUri}&state=customstate&nonce=52b839be-3b79-4d09-a933-ef04bd34491f&sessionToken=${sessionToken}&prompt=none`;
      console.log('url----', url);

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
    const userId = await AsyncStorage.getItem('@userId');
    if(userId) {
      await AsyncStorage.removeItem('@userId');
      await AsyncStorage.removeItem('@sessionToken');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Home' },
          ],
        })
      );
    } else {
      clearTokens()
      .then(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Home' },
            ],
          })
          );
        })
      .catch(e => {
        this.setState({ error: e.message })
      });
    }
  }

  render() {
    const { user, accessToken, error, progress } = this.state;

    return (
      <Background>
        <View style={styles.container}>
          <Header>Profile</Header>
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
                user.mobilePhone && <Text style={styles.titleDetails}>Phone Number: {user.mobilePhone}</Text>
              }
            </View>
          )}
          <View style={{ flexDirection: 'column', marginTop: 20 }}>
            <Button style={{ marginTop: 40 }} onPress={this.getAccessToken} >Get Access token</Button>
            { accessToken &&
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenTitle}>Access Token:</Text>
                <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
              </View>
            }
            <View style={styles.row}>
              <Button onPress={this.logout}>
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
