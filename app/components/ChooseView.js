/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../common/Constants';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  DeviceEventEmitter
} from 'react-native';

export default class ChooseView extends React.Component {
  constructor (props) {
    super(props);
    this.entityList = this.props.navigation.state.params.entityList || [];
    this.eventName = this.props.navigation.state.params.eventName;
    this.dataField = this.props.navigation.state.params.dataField;
    this.contentViewStyle = this.props.navigation.state.params.contentViewStyle;
    this.contentTextStyle = this.props.navigation.state.params.contentTextStyle;
    this.customView = this.props.navigation.state.params.customView;
  }

  static navigationOptions = ({navigation}) => ({
    title : navigation.state.params.title || '选择',
  });

  _choose (item) {
    let data = {field : this.dataField, item : item};
    DeviceEventEmitter.emit(this.eventName, data);
    this.props.navigation.goBack();
  }

  _renderItem (item, i) {
    return (
      <TouchableHighlight key={i} style={[styles.tipContentView, this.contentViewStyle]}
                          underlayColor='#f0f0f0' onPress={() => this._choose(item)}>
        <Text style={[styles.tipText, this.contentTextStyle]}>{item.text}</Text>
      </TouchableHighlight>
    );
  }

  /**
   * 底部自定义提交按钮栏
   */
  _returnSubmitView () {
    return (
      <View>
        {
          'custom' == this.customView ? this.customView : <View/>
        }
      </View>
    );
  }

  render () {
    return (
      <ScrollView style={[styles.container]}>
        {
          this.entityList.map((item, i) => this._renderItem(item, i))
        }
        {
          this._returnSubmitView()
        }
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container : {   //容器局样式
    backgroundColor : '#ffffff',
    height : Constants.STANDARD_HEIGHT
  },

  tipContentView : {
    borderBottomWidth : 1,
    borderBottomColor : "#f0f0f0",
    height : Constants.culHeight(44),
    justifyContent : "center",
    backgroundColor : "#ffffff",
  },
  tipText : {
    marginLeft : Constants.culWidth(17),
    color : "#3a3a3a",
    fontSize : 16,
    textAlignVertical : "bottom"
  },
});