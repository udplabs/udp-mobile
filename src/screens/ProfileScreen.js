import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getAccessToken, getUser, clearTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { CommonActions } from '@react-navigation/native';
import Header from '../components/Header';
import Background from '../components/Background';
import Button from '../components/Button';
import Error from '../components/Error';

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

  componentDidMount() {
    this.setState({ progress: true });
    getUser()
      .then(user => {
        this.setState({ progress: false, user });
      })
      .catch(e => {
        this.setState({ progress: false, error: e.message });
      });
  }

  getAccessToken = () => {
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
  }

  logout = () => {
    const { navigation } = this.props;
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
              <Text style={styles.titleHello}>Welcome {user.name}</Text>
              <Text style={styles.titleDetails}>Name: {user.name}</Text>
              <Text style={styles.titleDetails}>Email: {user.preferred_username}</Text>
              <Text style={styles.titleDetails}>Phone Number: {user.mobilePhone}</Text>

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
