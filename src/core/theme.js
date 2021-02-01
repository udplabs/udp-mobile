import { Settings, Platform } from 'react-native';
import { DefaultTheme } from 'react-native-paper';

let primaryColor = '#2F3F4A';
let secondaryColor = '#DD2864';
let errorColor = 'red';

if(Platform.OS === 'ios') {
  primaryColor = Settings.get('primaryColor') || primaryColor;
  secondaryColor = Settings.get('secondaryColor') || secondaryColor;
  errorColor = Settings.get('errorColor') || errorColor;
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
