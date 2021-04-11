import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import Transactionscreen from './Screens/TransactionScreen';
import SearchScreen from './Screens/SearchScreen';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createAppContainer , createSwitchNavigator } from 'react-navigation';
import LoginScreen from './Screens/LoginScreen';

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const TabNavigator = createBottomTabNavigator(
  {
    Transaction:  Transactionscreen ,
    Search:  SearchScreen ,
  }, {
  defaultNavigationOptions: ({ navigation }) =>( {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        if (routeName === 'Transaction') {
          return (
            <Image
              source={require('./assets/book.png')}
              style={{ width: 20, height: 20 }}
            />
          );
        }
        if (routeName === 'Search') {
          return (
            <Image
              source={require('./assets/searchingbook.png')}
              style={{ width: 20, height: 20 }}
            />
          );
        }
      }
    }),
  }
);

const SwitchNvaigator = createSwitchNavigator({
  Login :LoginScreen,
  TabNavigator:TabNavigator
})

const AppContainer = createAppContainer(SwitchNvaigator);
