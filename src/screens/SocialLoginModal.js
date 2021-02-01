import React, { memo, useState, useContext } from 'react';
import { View, Dimensions, ActivityIndicator, Alert } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import { AppContext } from '../AppContextProvider';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const SocialLoginModal = ({ route, navigation }) => {
  const { config } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const { mode } = route.params;
  
  const idp = config.idps[mode];
  
  const uri = `${config.authUri}?idp=${idp}&client_id=${config.clientId}&response_type=code&scope=openid%20offline_access&redirect_uri=${config.authUri}/callback&state=customstate&code_challenge_method=${config.codeChallengeMethod}&code_challenge=${config.codeChallenge}`;
  onLoad = async(state) => {
    setIsLoading(false);
    console.log('social url---', state.url);
    if(state.url.indexOf(`${config.authUri}/callback?code`) >= 0) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      const { code } = params;
      const refreshUri = `${config.issuer}/v1/token?grant_type=authorization_code&client_id=${config.clientId}&redirect_uri=${config.authUri}/callback&code=${code}&code_verifier=${config.codeVerifier}`;

      setIsLoading(true);
      axios.post(refreshUri, {
      }, {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
          'cache-control': 'no-cache',
        }
      })
      .then(async(response) => {
        const { access_token, refresh_token } = response.data;

        await AsyncStorage.removeItem('@userId');
        await AsyncStorage.setItem('@accessToken', access_token);
        await AsyncStorage.setItem('@refreshToken', refresh_token);
        setIsLoading(false);
        navigation.goBack();
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Profile',
            },
          ],
        })
      })
      .catch(error => {
        setIsLoading(false);
        console.log('social error----', error.response.data);
        Alert.alert(
          'Error',
          'Something went wrong, please try again.',
          [
            { text: 'OK', onPress: () =>  navigation.goBack() }
          ],
          { cancelable: false }
        );
      })
    }
  }

  return (
    <View style={{
      height: height - 55,
      position: 'absolute',
      width,
      bottom: 0,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: 'white',
    }}>
      <Button
        onPress={() => navigation.goBack(null)}
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        Close
      </Button>
      {
        isLoading && <ActivityIndicator size="large" />
      }
      <WebView
        onLoadStart={(event) => onLoad(event.nativeEvent)}
        source={{ uri }}
      />
    </View>
  );
};

const Stack = createStackNavigator();

export default function ModalStack({ route }) {
  const { mode } = route.params;
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(SocialLoginModal)} initialParams={{ mode }} />
    </Stack.Navigator>
  )
}
