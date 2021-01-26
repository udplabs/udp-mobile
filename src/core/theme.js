import { useState } from 'react';
import { Settings } from 'react-native';
import { DefaultTheme } from 'react-native-paper';

const primaryColor = Settings.get('primaryColor');
const secondaryColor = Settings.get('secondaryColor');
const errorColor = Settings.get('errorColor');

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: primaryColor || '#600EE6',
    secondary: secondaryColor || '#414757',
    error: errorColor || '#f13a59',
  },
};
