import React, { memo, useState } from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const IDVerification = ({ route, navigation }) => {
  const { uri, id } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  
  onLoad = async(state) => {
    console.log('----', state.url);
    if(state.url.indexOf('?#/done') >= 0) {
      await AsyncStorage.setItem('@uploadedID', id);
      route.params.onGoBack();
      navigation.goBack(null);
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
        source={{ uri }}
        onLoad={() => setIsLoading(false)}
        onNavigationStateChange={onLoad}
        incognito={true}
      />
    </View>
  );
};

const Stack = createStackNavigator();

export default function IDVerificationStack({ route }) {
  const { uri, id, onGoBack } = route.params;
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' }}}
      mode="modal"
    >
      <Stack.Screen name="Modal" component ={memo(IDVerification)} initialParams={{ uri, id, onGoBack }} />
    </Stack.Navigator>
  )
}
