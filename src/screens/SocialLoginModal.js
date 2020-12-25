
import React, { memo, useState } from 'react';
//import WebViewModalProvider, { WebViewModal } from "react-native-webview-modal";
import { View, Dimensions } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import configFile from '../../samples.config';
import Button from '../components/Button';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const SocialLoginModal = ({ navigation }) => {
  const [visible, setVisible] = useState(true);

  onLoad = async(state) => {
    if(state.url.indexOf('/authorize/callback#access_token')!== -1 && !state.loading && visible) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      
      const { access_token } = params;

      await AsyncStorage.removeItem('@userId');
      await AsyncStorage.setItem('@accessToken', access_token);
      await navigation.goBack(null);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Profile' },
          ],
        })
      );
    }
  }

  const fbUrl = `${configFile.authUri}?idp=0oavyrdmiygFJn4GX0h7&client_id=${configFile.oidc.clientId}&response_type=token&response_mode=fragment&scope=openid&redirect_uri=${configFile.authUri}/callback&state=customstate&nonce=YsG76jo`;

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
      <WebView
        source={{ uri: fbUrl }}
        onNavigationStateChange={onLoad}
      />
    </View>
  );
};

const Stack = createStackNavigator();

export default function ModalStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(SocialLoginModal)} />
    </Stack.Navigator>
  )
}
