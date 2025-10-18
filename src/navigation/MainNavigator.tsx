import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation, Text } from 'react-native-paper';
import HomeScreen from '../screens/main/HomeScreen';
import CreateScreen from '../screens/main/CreateScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const MainNavigator: React.FC = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'create', title: 'Create', focusedIcon: 'plus', unfocusedIcon: 'plus-outline' },
    { key: 'profile', title: 'Profile', focusedIcon: 'account', unfocusedIcon: 'account-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    create: CreateScreen,
    profile: ProfileScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeColor="#667eea"
      inactiveColor="#999"
      barStyle={styles.bottomBar}
    />
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#ffffff',
    elevation: 8,
  },
});

export default MainNavigator;
