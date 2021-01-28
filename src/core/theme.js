import { Settings, Platform } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
let primaryColor = '#C01A98';
let secondaryColor = '#00FF1E';
let errorColor = 'yellow';

if(Platform.OS === 'ios') {
  primaryColor = Settings.get('primaryColor') || primaryColor;
  secondaryColor = Settings.get('secondaryColor') || secondaryColor;
  errorColor = Settings.get('errorColor') || errorColor;
} else if(Platform.OS === 'android') {
  const SharedPreferences = require('react-native-shared-preferences');
  SharedPreferences.setName('prefs.db');
  SharedPreferences.getItem("primaryColor", function(value){
    primaryColor = value;
  });
  SharedPreferences.getItem("secondaryColor", function(value){
    secondaryColor = value;
  });
  SharedPreferences.getItem("errorColor", function(value){
    errorColor = value;
  });
}


export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
  },
};
