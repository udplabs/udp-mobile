import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button
} from 'react-native';
import { getAccessToken, getUser, clearTokens } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
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

    this.logout = this.logout.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => 
        <Text onPress={this.logout} style={styles.logoutButton}>Logout</Text>
    });

    this.setState({ progress: true });
    getUser()
      .then(user => {
        this.setState({ progress: false, user });
      })
      .catch(e => {
        this.setState({ progress: false, error: e.message });
      });
  }

  getAccessToken() {
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

  logout() {
    clearTokens()
      .then(() => {
        this.props.navigation.navigate('Login');
      })
      .catch(e => {
        this.setState({ error: e.message })
      });
  }

  render() {
    const { user, accessToken, error, progress } = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <Spinner
            visible={progress}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
          <Error error={error} />
          { user && (
            <View style={{ paddingLeft: 20, paddingTop: 20 }}>
              <Text style={styles.titleHello}>Hello {user.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text>Name: </Text>
                <Text>{user.name}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text>Locale: </Text>
                <Text>{user.locale}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text>Zone Info: </Text>
                <Text>{user.zoneinfo}</Text>
              </View>
            </View>
          )}
          <View style={{ flexDirection: 'column', marginTop: 20, paddingLeft: 20, width: 300 }}>
            <Button style={{ marginTop:40 }} title="Get access token" onPress={this.getAccessToken} />
            { accessToken &&
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenTitle}>Access Token:</Text>
                <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
              </View>
            }
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  button: {
    borderRadius: 40,
    width: 200,
    height: 40,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  logoutButton: {
    paddingLeft: 10,
    fontSize: 16,
    color: '#0066cc'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
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
