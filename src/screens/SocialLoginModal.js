import React, { memo, useState, useContext } from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
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
  const uri = `${config.authUri}?idp=${idp}&client_id=${config.clientId}&response_type=token&response_mode=fragment&scope=openid&redirect_uri=${config.authUri}/callback&state=customstate&nonce=YsG76jo`;
  
  onLoad = async(state) => {
    setIsLoading(false);
    if(state.url.indexOf('/authorize/callback#access_token') >= 0) {
      let regex = /[?#]([^=#]+)=([^&#]*)/g;
      let params = {};
      while ((match = regex.exec(state.url))) {
        params[match[1]] = match[2]
      }
      
      const { access_token } = params;

      await AsyncStorage.removeItem('@userId');
      await AsyncStorage.setItem('@accessToken', access_token);
      await navigation.goBack(null);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Profile',
          },
        ],
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
