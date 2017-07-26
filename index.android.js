import Root from './app/Root';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class wolfkillhelper extends Component {
  render() {
    return (
      <Root/>
    );
  }
}
AppRegistry.registerComponent('wolfkillhelper', () => wolfkillhelper);
