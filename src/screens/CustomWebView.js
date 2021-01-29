import React, { memo, useState } from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const CustomWebView = ({ route, navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { uri, onGoBack, login } = route.params;

  navigationChange = async (state) => {
    console.log('url---', state.url);
    setIsLoading(false);
    if(state.url.indexOf('/authorize/callback#access_token') >= 0) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      const { access_token } = params;
      if(login) {
        await AsyncStorage.setItem('@accessToken', access_token);
      }
      onGoBack(true);
      navigation.goBack();
    } else if(state.url.indexOf('/authorize/callback#state') >= 0) {
      await AsyncStorage.removeItem('@accessToken');
      navigation.goBack();
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
        onPress={() => navigation.goBack()}
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
        onLoadStart={(event) => navigationChange(event.nativeEvent)}
        source={{ uri }}
      />
    
    </View>
  );
};

const Stack = createStackNavigator();

export default function WebViewStack({ route }) {
  const { uri, onGoBack, login } = route.params;
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(CustomWebView)} initialParams={{ uri, onGoBack, login }} />
    </Stack.Navigator>
  )
}
