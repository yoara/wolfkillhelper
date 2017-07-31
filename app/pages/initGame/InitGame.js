/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {boards} from './StandardBoard';
import {roleList} from '../../model/Role';
import {gameData, initGameData} from '../../data/GameData';

import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  DeviceEventEmitter,
  Alert,
} from 'react-native';

import CheckBox from 'react-native-check-box';

const chooseBoardEventName = 'InitGame';
export default class InitGame extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      board : '请选择板子',
      myRole : '我的角色',
      hasSheriff : true,
      firstDayBombHasSheriff : false,
    };
  }

  componentDidMount () {
    this.subscription = DeviceEventEmitter.addListener(chooseBoardEventName, (data) => {
      let field = data.field;
      if ('board' == field) {
        let roles = data.item.roles;
        let board = '';
        for (let role of roles) {
          board += (role.shortName + " ");
        }
        this.setState({board : board});
        this.roles = roles;
      } else if ('myRole' == field) {
        let role = data.item.role;
        this.setState({myRole : role.name});
        this.myRole = role;
      }
    });
  }

  componentWillUnmount () {
    this.subscription.remove();
  }

  static navigationOptions = ({navigation}) => ({
    title : '游戏配置',
  });

  _chooseBoard () {
    this.props.navigation.navigate('ChooseView', {
      dataField : 'board',
      entityList : boards,
      eventName : chooseBoardEventName
    });
  }

  _chooseMyRole () {
    if (this.state.board == '请选择板子') {
      Alert.alert("请先选择板子");
      return;
    }

    this.props.navigation.navigate('ChooseView', {
      dataField : 'myRole',
      entityList : roleList,
      eventName : chooseBoardEventName
    });
  }

  _startGame () {
    if (this.state.board == '请选择板子') {
      Alert.alert("请先选择板子");
      return;
    }

    if (this.state.myRole == '我的角色') {
      Alert.alert("请先选择角色");
      return;
    }
    let config = {
      roles : this.roles,
      myRole : this.myRole,
      hasSheriff : this.state.hasSheriff,
      firstDayBombHasSheriff : this.state.firstDayBombHasSheriff,
    }
    initGameData(config);
    this.props.navigation.navigate('Main', {});
  }

  render () {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.modelView}>
          <View style={styles.model_Text}>
            <Text style={styles.model_Text_Word}>{this.state.board}</Text>
          </View>
          <TouchableHighlight style={[styles.model_Button]}
                              onPress={() => this._chooseBoard()} underlayColor="#E1F6FF">
            <Text style={styles.model_Button_Text}>选择板子</Text>
          </TouchableHighlight>
        </View>


        <View style={[styles.modelView]}>
          <View style={styles.model_Text}>
            <Text style={styles.model_Text_Word}>{this.state.myRole}</Text>
          </View>
          <TouchableHighlight style={[styles.model_Button]}
                              onPress={() => this._chooseMyRole()} underlayColor="#E1F6FF">
            <Text style={styles.model_Button_Text}>选择角色</Text>
          </TouchableHighlight>
        </View>


        <CheckBox
          style={{flex : 1, padding : 10}}
          onClick={() => this.setState({
            hasSheriff : !this.state.hasSheriff
          })}
          isChecked={this.state.hasSheriff}
          leftTextStyle={styles.checkBoxText}
          leftText='是否包含警长'
        />

        <CheckBox
          style={{flex : 1, padding : 10}}
          onClick={() => this.setState({
            firstDayBombHasSheriff : !this.state.firstDayBombHasSheriff
          })}
          isChecked={this.state.firstDayBombHasSheriff}
          leftTextStyle={styles.checkBoxText}
          leftText='首页自爆是否还有警徽'
        />

        <TouchableHighlight style={[styles.submitButton]}
                            onPress={() => this._startGame()} underlayColor="#E1F6FF">
          <Text style={styles.model_Button_Text}>开始游戏</Text>
        </TouchableHighlight>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container : {   //容器局样式
    backgroundColor : '#ffffff',
    height : Constants.STANDARD_HEIGHT
  },

  space : {       //组件间隔
    marginTop : Constants.culHeight(10),
    borderBottomWidth : Constants.culHeight(1),
    borderColor : '#e1e1e1'
  },

  modelView : {   //板子配置样式

  },
  model_Text : {  //板子描述样式
    height : Constants.culHeightByPercent(0.085),
    justifyContent : 'center'
  },
  model_Text_Word : {
    textAlign : 'center',
    color : '#5c5c5c',
    fontSize : 16
  },
  model_Button : {  //板子选择按钮
    backgroundColor : '#f39800',
    width : Constants.culWidthByPercent(0.92),
    height : Constants.culHeightByPercent(0.065),
    marginLeft : Constants.culWidthByPercent(0.04),
    borderRadius : 5,
    alignItems : 'center',
    justifyContent : 'center'
  },
  model_Button_Text : {
    fontSize : 16,
    color : '#ffffff'
  },
  checkBoxText : {
    fontSize : 16,
    textAlign : 'right',
    marginRight : Constants.culWidth(5)
  },
  submitButton : {  //提交按钮
    backgroundColor : '#f39800',
    width : Constants.culWidthByPercent(0.32),
    height : Constants.culHeightByPercent(0.065),
    marginLeft : Constants.culWidthByPercent(0.64),
    borderRadius : 5,
    alignItems : 'center',
    justifyContent : 'center',
    marginTop : Constants.culHeight(200)
  },
});