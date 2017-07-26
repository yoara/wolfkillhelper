/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import {StackNavigator} from 'react-navigation';
import Routes from './Routers';

let RootNavigator = null;
const navigatorConfig = {
  initialRouteName: 'InitGame',
  navigationOptions: {
    headerBackTitle: null,
    headerTintColor: '#333',
    showIcon: true,
    headerStyle: {
      backgroundColor: '#ffffff',
    }
  }
};


export default class Root extends React.Component {
  constructor(props) {
    super(props);
    this.initNavigator();
  }

  initNavigator(){
    RootNavigator = StackNavigator(Routes, navigatorConfig);
  }

  render () {
    return (
      <RootNavigator />
    );
  }
}