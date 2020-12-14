import React, { memo } from 'react';
import { clearTokens } from '@okta/okta-react-native';
import { CommonActions } from '@react-navigation/native';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';

const Dashboard = ({ navigation }) => {
  logout = () => {
    clearTokens()
      .then(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: 'Login' },
            ],
          })
        );
      })
      .catch(e => {
        console.log(e.message);
      });
  }
  return <Background>
    <Logo />
    <Header>Dashboard</Header>
    <Paragraph>
      Dashboard
    </Paragraph>
    <Button mode="outlined" onPress={logout}>
      Logout
    </Button>
  </Background>
};

export default memo(Dashboard);
