import React, { memo, useContext } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppContext } from '../AppContextProvider';

const Paragraph = ({ children }) => {
  const { theme } = useContext(AppContext);
  return <Text style={[styles.text, { color: theme.colors.secondary }]}>{children}</Text>
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 26,
    
    textAlign: 'left',
    marginBottom: 14,
  },
});

export default memo(Paragraph);
