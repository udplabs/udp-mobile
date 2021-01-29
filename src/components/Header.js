import React, { memo, useContext } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppContext } from '../AppContextProvider';

const Header = ({ children }) => {
  const { theme } = useContext(AppContext);
  return <Text style={[styles.header, { color: theme.colors.primary }]}>{children}</Text>
};

const styles = StyleSheet.create({
  header: {
    fontSize: 26,

    fontWeight: 'bold',
    paddingVertical: 14,
  },
});

export default memo(Header);
