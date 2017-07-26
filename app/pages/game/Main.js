/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {gameData, timeLimeMove} from '../../data/GameData';
import {roleMap} from '../../model/Role';

import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  DeviceEventEmitter,
  Alert,
  TouchableOpacity
} from 'react-native';

const mainEventName = 'mainChoose';
export default class Main extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title : '游戏界面',
  });

  constructor (props) {
    super(props);
    this.state = {gamerInfo : "欢迎进入游戏"};
  }

  componentDidMount () {
    this.subscription = DeviceEventEmitter.addListener(mainEventName, (data) => {
      let field = data.field;
      //时间轴记录信息
      let date = new Date();
      let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      if ('bomb' == field) {
        let gamer = data.item;
        //设置离场信息
        gamer.isAlive = false;
        //时间轴记录信息
        gamer.action.push({
          timeLine : gameData.timeLine,
          time : time,
          action : '自爆了'
        });
        timeLimeMove();
      } else if ('vote' == field) {

      } else if ('kill' == field) {
        let gamer = data.item;
        if (gamer.length == 0) {//平安夜
          let withMan = "平安夜:";
          for (let ga of gameData.gamers) {
            if (ga.isAlive) {//设置平安夜信息
              withMan = withMan + ga.index + " "
            }
          }
          for (let ga of gameData.gamers) {
            if (ga.isAlive) {//设置平安夜信息
              ga.action.push({
                timeLine : gameData.timeLine,
                time : time,
                action : withMan
              });
            }
          }
        } else if (gamer.length == 1) {//单死
          //设置离场信息
          gamer.isAlive = false;
          //时间轴记录信息
          gamer.action.push({
            timeLine : gameData.timeLine,
            time : time,
            action : '夜晚单死'
          });
        } else if (gamer.length == 2) {//双死
          let withMan = "双死:";
          for (let ga of gamer) {
            withMan = withMan + ga.index + " "
          }
          for (let ga of gamer) {
            ga.action.push({
              timeLine : gameData.timeLine,
              time : time,
              action : withMan
            });
          }
        }

        timeLimeMove();
      }
      this.setState({gamerInfo : this.state.gamerInfo + "\r\n" + "..."});
    });
  }

  _vote () {
    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'bomb',
      entityList : gameData.gamers,
      bodyEntityList : gameData.gamers,
      eventName : mainEventName,
    });
  }

  _bomb () {
    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'bomb',
      entityList : gameData.gamers,
      eventName : mainEventName,
    });
  }

  _kill () {
    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'kill',
      entityList : gameData.gamers,
      eventName : mainEventName,
    });
  }

  _showGamerInfo (gamer) {
    let gamerInfo = "";
    let action = gamer.action;

    let lastTimeLine = "";
    for (let item of action) {
      if (lastTimeLine != item.timeLine.desc) {
        gamerInfo = gamerInfo + item.timeLine.desc + "\r\n";
        lastTimeLine = item.timeLine.desc;
      }

      gamerInfo = gamerInfo + "(" + item.time + ")" + item.action + "\r\n";
    }
    this.setState({gamerInfo : gamerInfo});
  }

  _edgeWindow (gamer, i, startIndex, endIndex) {
    if (i < startIndex || i > endIndex) {
      return;
    }
    return (
      <TouchableOpacity
        key={i}
        style={[styles.body_edge_window, !gamer.isAlive && styles.body_edge_window_readonly]}
        onPress={() => this._showGamerInfo(gamer)}
      >
        <Text style={styles.body_edge_window_text}>{gamer.text + (gamer.isAlive ? "" : "死亡")}</Text>
      </TouchableOpacity>
    );
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._vote()
            }}>
            <Text style={{color : '#ffffff'}}>投票</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._bomb()
            }}>
            <Text style={{color : '#ffffff'}}>自爆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._kill()
            }}>
            <Text style={{color : '#ffffff'}}>狼刀</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bodyContainer}>
          <View style={[styles.body_edge, {borderRightWidth : 1, borderRightColor : '#e1e1e1'}]}>
            {
              gameData.gamers.map((gamer, i) => this._edgeWindow(gamer, i, 0, 5))
            }
          </View>
          <ScrollView style={styles.body_center}>
            <Text style={styles.body_center_text}>
              {this.state.gamerInfo}
            </Text>
          </ScrollView>
          <View style={[styles.body_edge, {borderLeftWidth : 1, borderLeftColor : '#e1e1e1'}]}>
            {
              gameData.gamers.map((gamer, i) => this._edgeWindow(gamer, i, 6, 11))
            }
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container : {   //容器局样式
    backgroundColor : '#ffffff',
    height : Constants.STANDARD_HEIGHT
  },
  headerContainer : {
    backgroundColor : '#ffffff',
    height : Constants.culHeightByPercent(0.1),
    justifyContent : 'space-around',
    alignItems : 'center',
    flexDirection : 'row'
  },
  headerButton : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culHeightByPercent(0.08),
    height : Constants.culHeightByPercent(0.08),
    backgroundColor : '#616161',
    borderColor : '#616161',
    borderRadius : 28,
    borderWidth : 1
  },
  bodyContainer : {
    borderTopWidth : Constants.culHeight(1),
    borderColor : '#e1e1e1',
    height : Constants.culHeightByPercent(0.9),
    flexDirection : 'row'
  },
  body_edge : {
    width:Constants.culWidthByPercent(0.15)
  },
  body_edge_window : {
    height : Constants.culHeightByPercent(0.132),
    borderBottomWidth : Constants.culHeight(1),
    borderColor : '#e1e1e1',
    alignItems : 'center',
    justifyContent : 'center',
  },
  body_edge_window_readonly : {
    backgroundColor : '#4a4a4a'
  },
  body_edge_window_text : {
    fontSize : 16,
  },
  body_center : {
    width:Constants.culWidthByPercent(0.7)
  },
  body_center_text : {
    marginTop : 3,
    marginLeft : 3
  }
});