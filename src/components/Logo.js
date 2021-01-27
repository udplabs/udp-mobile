import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import configFile from '../../samples.config';

const Logo = () => {
  if(configFile.logoUrl) {
    Image.prefetch(configFile.logoUrl);
  }
  return <Image source={configFile.logoUrl ? {uri: configFile.logoUrl} : require('../assets/logo.png')} style={styles.image} />
};

const styles = StyleSheet.create({
  image: {
    width: 128,
    height: 128,
    marginBottom: 12,
  },
});

export default memo(Logo);
