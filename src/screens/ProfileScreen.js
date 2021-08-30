import React, { useState, memo, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  ScrollView,
  Platform,
} from 'react-native';
import jwt from 'jwt-lite';
import CookieManager from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';
import { AppContext } from '../AppContextProvider';

const termsText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const useWebKit = Platform.OS === 'ios';

let unsubscribe;
const ProfileScreen = ({ navigation }) => {
  const { theme, config } = useContext(AppContext);
  const [accessToken, setAccessToken] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setloading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  async function loadProfile (accessToken, userId) {
    if (accessToken && userId) {
      setloading(true);
      axios.get(`${config.customAPIUrl}/proxy/${config.udp_subdomain}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }}
      )
      .then(response => {
        const { data } = response;
        if(!data.profile[config.consentField]) {
          Alert.alert(
            'Terms and Conditions',
            termsText,
            [
              {
                text: 'Agree',
                onPress: async () => {
                  setloading(true);
                  const newProfile = data.profile;
                  newProfile[config.consentField] = true;
                  axios.put(`${config.customAPIUrl}/proxy/${config.udp_subdomain}/users/${userId}`, {
                    profile: newProfile
                  }, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                  })
                  .then(response => {
                    setloading(false);
                    setUser(response.data.profile);
                  })
                  .catch((error) => {
                    Alert.alert(
                      'Error',
                      'An error has occured, please try again.',
                      [
                        { text: 'OK', onPress: () => setloading(false)}
                      ],
                      { cancelable: false }
                    );
                  })
                }
              },
              { text: 'Disagree', onPress: () => logout(), style: 'cancel'}
            ],
            { cancelable: false }
          );
        } else {
          setloading(false);
          setUser(data.profile);
        }
      }
      ,(e) => {

        if(e.response && e.response.data && e.response.data.message === 'Unauthorized') {
          Alert.alert(
            'Error',
            'Session has expired. Please try to login again',
            [
              { text: 'OK', onPress: async () => {
                logout();
              }
              }
            ]
          );
        } else {
          setloading(false);
          setError(e.message);
        }
      })
    }
  }

  useEffect(() => {
    return unsubscribe;
  }, [navigation]);

  async function initialLoad() {
    const accessToken = await AsyncStorage.getItem('@accessToken');
    if (accessToken) {
      setAccessToken(accessToken, async (currentToken) => {
        let userId = await AsyncStorage.getItem('@userId');
        if(!userId) {
          const result = jwt.decode(accessToken).claimsSet;
          userId = result.uid;
          await AsyncStorage.setItem('@userId', userId);
        }
        setUserId(userId, async (currentId) => {
          await loadProfile(accessToken, userId);
          unsubscribe = navigation.addListener('focus', async () => {
            const accessToken = await AsyncStorage.getItem('@accessToken');
            const userId = await AsyncStorage.getItem('@userId');
            await loadProfile(accessToken, userId);
          });
        });
      });

      const idToken = await AsyncStorage.getItem('@idToken');
      setIdToken(idToken);
    } else {
      const sessionToken = await AsyncStorage.getItem('@sessionToken');
      //const uri = `${config.authUri}?client_id=${config.clientId}&response_type=token&scope=openid&redirect_uri=${config.authUri}/callback&state=customstate&nonce=${config.nonce}&&sessionToken=${sessionToken}`;
      const uri = `${config.authUri}?client_id=${config.clientId}&response_type=code&scope=openid%20offline_access&redirect_uri=${config.authUri}/callback&state=customstate&code_challenge_method=${config.codeChallengeMethod}&code_challenge=${config.codeChallenge}&sessionToken=${sessionToken}`;
      CookieManager.clearAll(useWebKit)
      .then(() => {
        navigation.navigate('CustomWebView', { uri, visible: false, onGoBack: (state) => onSignInSuccess(state), mode: 'auth' });
      })
      .catch(console.warn);
    }

    setloading(false);
  }

  initialLoad();

  onSignInSuccess = async (state) => {
    if(state) {
      await initialLoad();
    } else {
      Alert.alert(
        'Error',
        'An error has occured, please try again later.',
        [
          { text: 'OK', onPress: () => logout() }
        ],
        { cancelable: false }
      );
    }
  }

  transactionalMFA = async () => {
    navigation.navigate('Transaction', { accessToken, user, userId });
  }

  logout = async () => {
    AsyncStorage.getAllKeys()
    .then(keys => {
      if(keys.indexOf('@refreshToken') > -1) {
        keys.splice(keys.indexOf('@refreshToken'), 1);
      }
      AsyncStorage.multiRemove(keys);
    })
    .then(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
          },
        ],
      })
    });
      
  }

  return (loading) ?
    <View centerContent>
      <Spinner
        visible
        textContent={'Loading...'}
        textStyle={styles.spinnerTextStyle}
      />
    </View>
    :
    <Background>
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} centerContent={true}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <Header>Profile</Header>
            <Button style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('EditProfile', { user, userId, accessToken })}>Edit</Button>
          </View>

          <Error error={error} />
          { user && (
            <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
              <Text style={[styles.titleHello, { color: theme.colors.secondary }]}>Welcome {user.firstName}</Text>
              <Text style={styles.titleDetails}>Name: {`${user.firstName} ${user.lastName}`}</Text>
              <Text style={styles.titleDetails}>Email: {user.email}</Text>
              {
                user.primaryPhone && <Text style={styles.titleDetails}>Phone Number: {user.primaryPhone}</Text>
              }
            </View>
          )}
          <View style={{ flexDirection: 'column', marginTop: 10 }}>
            { accessToken &&
              <View style={[styles.tokenContainer, { backgroundColor: '#dbf5f0' }]}>
                <Text style={styles.tokenTitle}>Access Token</Text>
                <View style={styles.tokenDecodeContainer}>
                  <Text style={{color: '#056960'}}>{JSON.stringify(jwt.decode(accessToken).claimsSet, null, 4)}</Text>
                </View>
              </View>
            }

            { idToken && 
              <View style={[styles.tokenContainer, { backgroundColor: '#d8c7d0'}]}>
                <Text style={styles.tokenTitle}>ID Token</Text>
                <View style={styles.tokenDecodeContainer}>
                  <Text style={{color: '#483941'}}>{JSON.stringify(jwt.decode(idToken).claimsSet, null, 4)}</Text>
                </View>
              </View>
            }
            {
              accessToken && <Button style={{ marginTop: 40 }} onPress={transactionalMFA} >Transactions</Button>
            }
            
            <View style={styles.row}>
              <Button onPress={logout} mode="outlined">
                Logout
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </Background>
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 40,
    flexDirection: 'column',
    width: '100%',
    paddingVertical: 30,
  },
  titleHello: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 40
  },
  titleDetails: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 15,
    textAlign: 'center',
  },
  tokenContainer: {
    marginTop: 20,
    padding: 30,
    borderRadius: 30
  },
  tokenDecodeContainer: {
    marginTop: 15,
  },
  tokenTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#424242'
  },
});

export default memo(ProfileScreen);