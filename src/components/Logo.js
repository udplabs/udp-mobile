import React, { memo, useContext } from 'react';
import { Image, StyleSheet } from 'react-native';
import { AppContext } from '../AppContextProvider';

const Logo = () => {
  const { config } = useContext(AppContext);
  if(config.logoUrl) {
    Image.prefetch(config.logoUrl);
  }
  return <Image source={config.logoUrl ? {uri: config.logoUrl} : require('../assets/logo.png')} style={styles.image} />
};

const styles = StyleSheet.create({
  image: {
    width: 128,
    height: 128,
    marginBottom: 12,
  },
});

export default memo(Logo);
