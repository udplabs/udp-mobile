import React, { memo, useState, useContext } from 'react';
import { View, Dimensions, ActivityIndicator, Alert } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Button from '../components/Button';

import { AppContext } from '../AppContextProvider';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const CustomWebView = ({ route, navigation }) => {
  const { uri, onGoBack, mode, visible = true } = route.params;

  const { config } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(visible);

  navigationChange = async (state) => {
    
    if(mode === 'auth') {
      if (state.url.indexOf('sessionToken') >= 0) {
        setIsVisible(false);
      }

      console.log('onload---', state.url);
      if(state.url.indexOf('/authorize/callback?code') >= 0) {
        
        setIsVisible(false);
        let regex = /[?#]([^=#]+)=([^&#]*)/g;
        let params = {};
        while ((match = regex.exec(state.url))) {
          params[match[1]] = match[2]
        }
        const { code } = params;
        const uri = `${config.issuer}/v1/token?grant_type=authorization_code&client_id=${config.clientId}&redirect_uri=${config.authUri}/callback&code=${code}&code_verifier=${config.codeVerifier}`;
        setIsLoading(true);
        
        axios.post(uri, {
        }, {
          headers: {
            'accept': 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'cache-control': 'no-cache',
          }
        })
        .then(async(response) => {
          setIsLoading(false);
          const { access_token, refresh_token, id_token } = response.data;
          await AsyncStorage.setItem('@accessToken', access_token);
          await AsyncStorage.setItem('@idToken', id_token);
          await AsyncStorage.setItem('@refreshToken', refresh_token);
          onGoBack(true);
          navigation.goBack();
        })
        .catch(error => {
          setIsLoading(false);
          Alert.alert(
            'Error',
            'Something went wrong, please try again.',
            [
              { text: 'OK', onPress: () =>  console.log('error', error) }
            ],
            { cancelable: false }
          );
        })
      }
    }
    else {
      setIsLoading(false);
      if(state.url.indexOf('/authorize/callback#access_token') >= 0) {
        
        let regex = /[?#]([^=#]+)=([^&#]*)/g;
        let params = {};
        while ((match = regex.exec(state.url))) {
          params[match[1]] = match[2]
        }
        const { access_token } = params;
        await AsyncStorage.setItem('@accessToken', access_token);
    
        onGoBack(true);
        navigation.goBack();
      } else if(state.url.indexOf('/authorize/callback#state') >= 0) {
        await AsyncStorage.removeItem('@accessToken');
        navigation.goBack();
      }
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
      display: (isVisible) ? 'flex' : 'none'
    }}>
      <Button
        onPress={() => {
          onGoBack(false, { action: 'CLOSED_WINDOW' });
          navigation.goBack()
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        Close
      </Button>
      <View style={{ flex: 1, display: 'flex' }}>
        {
          isLoading && 
          <ActivityIndicator size="large" />       
        }
        <WebView
          onLoadStart={(event) => navigationChange(event.nativeEvent)}
          source={{ uri }}
        />
      </View>
    </View>
  );
};

const Stack = createStackNavigator();

export default function WebViewStack({ route }) {
  const { uri, onGoBack, mode, visible } = route.params;
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(CustomWebView)} initialParams={{ uri, onGoBack, mode, visible }} />
    </Stack.Navigator>
  )
}
