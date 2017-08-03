/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {villager, wolf, god, roleList, godList, wolfList} from '../../model/Role';
import {gameData, initGameData} from '../../data/GameData';
import {mainEventName} from '../game/Main';

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
      myIndex : null,
      myRole : god,
      hasSheriff : true,
      firstDayBombHasSheriff : false,
      godList : godList,
      wolfList : wolfList,
      gamerCount : 12
    };
  }

  componentDidMount () {
    this.subscription = DeviceEventEmitter.addListener(chooseBoardEventName, (data) => {
      let field = data.field;
      if ('myRole' === field) {
        this.setState({myRole : data.item.role});
      } else if ('myIndex' === field) {
        this.setState({myIndex : data.item.index});
      } else if ('gamerCount' === field) {
        this.setState({gamerCount : data.item.count});
      }
    });
  }

  componentWillUnmount () {
    this.subscription.remove();
  }

  static navigationOptions = ({navigation}) => ({
    title : '游戏配置',
  });

  _chooseGamerCount () {
    this.props.navigation.navigate('ChooseView', {
      dataField : 'gamerCount',
      entityList : Array.from({length : 3}, (v, k) => {
        return {
          text : (k + 2) * 3,
          count : (k + 2) * 3,
        }
      }),
      eventName : chooseBoardEventName
    });
  }

  _chooseMyIndex () {
    this.props.navigation.navigate('ChooseView', {
      dataField : 'myIndex',
      entityList : Array.from({length : 12}, (v, k) => {
        return {
          text : k + 1,
          index : k + 1
        }
      }),
      eventName : chooseBoardEventName
    });
  }

  _chooseMyRole () {
    this.props.navigation.navigate('ChooseView', {
      dataField : 'myRole',
      entityList : roleList,
      eventName : chooseBoardEventName
    });
  }

  _startGame () {
    let roles = [];
    for (let god of this.state.godList) {
      if (god.checked) {
        roles.push(god);
      }
    }
    if (roles.length === 0) {
      Alert.alert("请选择神职");
      return;
    }

    if (roles.length > this.state.gamerCount / 3) {
      Alert.alert("神职不能大于总人数的1/3");
      return;
    }

    if (!this.state.myRole) {
      Alert.alert("请选择角色");
      return;
    }

    if (this.state.myRole.id !== 0 && !this.state.myIndex) {
      Alert.alert("请选择序号");
      return;
    }

    for (let wolf of this.state.wolfList) {
      if (wolf.checked) {
        roles.push(wolf);
      }
    }
    for (let i = 0, l = this.state.gamerCount - roles.length; i < l; i++) {
      i % 2 === 0 ? roles.push(villager) : roles.push(wolf);
    }
    let config = {
      roles : roles,
      myRole : this.state.myRole,
      myIndex : this.state.myIndex,
      gamerCount : this.state.gamerCount,
      hasSheriff : this.state.hasSheriff,
      firstDayBombHasSheriff : this.state.firstDayBombHasSheriff,
    };
    initGameData(config);
    if (gameData.gameConfig.hasSheriff) {
      this.props.navigation.navigate('ChooseCircleView', {
        dataField : 'office',
        entityList : gameData.gamers,
        eventName : mainEventName,
        title : '警上竞选'
      });
    } else {
      this.props.navigation.navigate('Main', {});
    }
  }

  renderCheckBox (data) {
    let leftText = data.text;
    return (
      <CheckBox
        style={styles.checkBoxStyle}
        onClick={() => {
          data.checked = !data.checked;
          this.setState({a : true});
        }}
        isChecked={data.checked}
        leftTextStyle={styles.checkBoxText}
        leftText={leftText}
      />
    )
  }

  makeCheckBoxViews (list) {
    let len = list.length;
    let checkBoxViews = [];
    for (let i = 0; i < len; i += 5) {
      checkBoxViews.push(
        <View key={i} style={{flexDirection : 'row', justifyContent : 'flex-start'}}>
          {this.renderCheckBox(list[i])}
          {list[i + 1] ? this.renderCheckBox(list[i + 1]) : null}
          {list[i + 2] ? this.renderCheckBox(list[i + 2]) : null}
          {list[i + 3] ? this.renderCheckBox(list[i + 3]) : null}
          {list[i + 4] ? this.renderCheckBox(list[i + 4]) : null}
        </View>
      )
    }
    return checkBoxViews;
  }

  render () {
    let godCheckBoxViews = this.makeCheckBoxViews(this.state.godList);
    let wolfCheckBoxViews = this.makeCheckBoxViews(this.state.wolfList);
    return (
      <ScrollView style={styles.container}>

        <View style={[styles.modelView, {flexDirection : 'row'}]}>
          <View style={[styles.model_Text, styles.model_Text_WidthHalf]}>
            <Text style={styles.model_Text_Word}>{this.state.gamerCount ? this.state.gamerCount : '请选择玩家数量'}</Text>
          </View>
          <TouchableHighlight style={[styles.model_Button]}
                              onPress={() => this._chooseGamerCount()} underlayColor="#E1F6FF">
            <Text style={styles.model_Button_Text}>请选择玩家数量</Text>
          </TouchableHighlight>
        </View>

        <View style={styles.modelView}>
          <View style={styles.model_Text}>
            <Text style={styles.model_Text_Word}>请选择神职</Text>
          </View>
          {godCheckBoxViews}
        </View>

        <View style={styles.modelView}>
          <View style={styles.model_Text}>
            <Text style={styles.model_Text_Word}>请选择狼职</Text>
          </View>
          {wolfCheckBoxViews}
        </View>

        <View style={styles.modelView}>
          <View style={styles.model_Text}>
            <Text style={styles.model_Text_Word}>配置角色信息</Text>
          </View>
        </View>

        <View style={[styles.modelView, {flexDirection : 'row'}]}>
          <View style={[styles.model_Text, styles.model_Text_WidthHalf]}>
            <Text style={styles.model_Text_Word}>{this.state.myRole ? this.state.myRole.shortName : '请选择角色'}</Text>
          </View>
          <TouchableHighlight style={[styles.model_Button]}
                              onPress={() => this._chooseMyRole()} underlayColor="#E1F6FF">
            <Text style={styles.model_Button_Text}>选择角色</Text>
          </TouchableHighlight>
        </View>
        {
          this.state.myRole && this.state.myRole.id !== 0 ?
            <View style={[styles.modelView, {flexDirection : 'row'}]}>
              <View style={[styles.model_Text, styles.model_Text_WidthHalf]}>
                <Text style={styles.model_Text_Word}>{this.state.myIndex ? this.state.myIndex : '请选择序号'}</Text>
              </View>
              <TouchableHighlight style={[styles.model_Button]}
                                  onPress={() => this._chooseMyIndex()} underlayColor="#E1F6FF">
                <Text style={styles.model_Button_Text}>选择序号</Text>
              </TouchableHighlight>
            </View>
            : null
        }

        <CheckBox
          style={styles.checkBoxStyle}
          onClick={() => this.setState({
            hasSheriff : !this.state.hasSheriff
          })}
          isChecked={this.state.hasSheriff}
          leftTextStyle={styles.checkBoxText}
          leftText='是否包含警长'
        />

        <CheckBox
          style={styles.checkBoxStyle}
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
    justifyContent : 'center',
    alignItems : 'center',
  },
  model_Text : {  //板子描述样式
    height : Constants.culHeightByPercent(0.085),
    justifyContent : 'center'
  },
  model_Text_WidthHalf : {  //板子描述样式
    width : Constants.culWidthByPercent(0.45)
  },
  model_Text_Word : {
    textAlign : 'center',
    color : '#5c5c5c',
    fontSize : 16
  },
  model_Button : {  //板子选择按钮
    backgroundColor : '#f39800',
    width : Constants.culWidthByPercent(0.45),
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
  checkBoxStyle : {
    flex : 1,
    padding : 10
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
    marginTop : Constants.culHeight(20)
  },
});