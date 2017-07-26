/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {gameData, timeLimeMove, addGameInfo, getGameInfo} from '../../data/GameData';
import {roleMap} from '../../model/Role';
import Toast from '../../common/util/Toast';
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
    this.state = {gamerInfo : getGameInfo()};
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
          action : '自爆了' + (gameData.timeLine.id == 1 ? "并炸掉了警徽" : "")
        });
        this.refs.toast.show("进入夜晚闭眼阶段...");
        addGameInfo(gamer.index + "自爆了" + (gameData.timeLine.id == 1 ? "，没有警徽" : ""), true);
        timeLimeMove();
        if (gameData.timeLine.id == 2) { //如果前个阶段是竞选警长阶段，则警徽丢失
          addGameInfo("自爆不能发言", true);
          timeLimeMove();
        }
      } else if ('vote' == field) {
        //出局Index:投票人Index数组
        let outers = data.item;
        let maxIndex = [];
        let maxCount = 0;
        for (let index in outers) {
          let outerIndex = "";
          let outerVoters = [];
          for (let oi in outers[index]) {
            outerVoters = outers[index][oi];
            outerIndex = oi;
          }

          //计算投票人数量
          if (outerIndex != "-1") {
            if (outerVoters.length > maxCount) {
              maxCount = outerVoters.length;
              maxIndex = [];
              maxIndex.push(outerIndex);
            } else if (outerVoters.length == maxCount) {
              maxIndex.push(outerIndex);
            }
          }
          let withMan = outerVoters.join(" ");
          //记录行为
          if (outerIndex != "-1") {
            gameData.gamers[parseInt(outerIndex) - 1].action.push({
              timeLine : gameData.timeLine,
              time : time,
              action : "被以下玩家投票:" + withMan
            });
          }
          for (let i in outerVoters) {
            gameData.gamers[parseInt(outerVoters[i]) - 1].action.push({
              timeLine : gameData.timeLine,
              time : time,
              action : "和" + withMan + (outerIndex == "-1" ? "弃票" : "投票给" + outerIndex)
            });
          }
        }
        //如果通票人大于1
        if (maxIndex.length > 1) {
          this.refs.toast.show("平票PK阶段...");
          addGameInfo(maxIndex.join(" ") + "号玩家平票PK");
        } else if (maxIndex.length == 0) {
          addGameInfo("投票玩家全部弃票");
        } else {
          this.refs.toast.show(maxIndex[0] + "号玩家被归票");
          addGameInfo(maxIndex[0] + "号玩家被归票", true);
          timeLimeMove();
        }
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
          addGameInfo(withMan, true);
        } else if (gamer.length == 1) {//单死
          //设置离场信息
          let oneGamer = gamer[0];
          oneGamer.isAlive = false;
          //时间轴记录信息
          oneGamer.action.push({
            timeLine : gameData.timeLine,
            time : time,
            action : '夜晚单死'
          });
          addGameInfo(oneGamer.index + " 夜晚单死", true);
        } else if (gamer.length == 2) {//双死
          let withMan = "双死:";
          for (let ga of gamer) {
            withMan = withMan + ga.index + " "
          }
          for (let ga of gamer) {
            ga.isAlive = false;
            ga.action.push({
              timeLine : gameData.timeLine,
              time : time,
              action : withMan
            });
          }
          addGameInfo(withMan + " 夜晚双死", true);
        }
        this.refs.toast.show("进入白天发言阶段...");
        timeLimeMove();
      }
      this.setState({gamerInfo : getGameInfo()});
    });
  }

  _voteNoBody () {
    if (gameData.timeLine.isNight) {
      this.refs.toast.show("夜晚不能投票...");
      return;
    }

    let date = new Date();
    let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    let withMan = "平票结束:";
    for (let ga of gameData.gamers) {
      if (ga.isAlive) {
        withMan = withMan + ga.index + " "
      }
    }
    for (let ga of gameData.gamers) {
      if (ga.isAlive) {
        ga.action.push({
          timeLine : gameData.timeLine,
          time : time,
          action : withMan
        });
      }
    }
    addGameInfo(withMan, true);
    this.refs.toast.show("平票结束...");
    timeLimeMove();
    this.setState({gamerInfo : getGameInfo()});
  }

  _vote () {
    if (gameData.timeLine.isNight) {
      this.refs.toast.show("夜晚不能投票...");
      return;
    }

    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'vote',
      entityList : gameData.gamers,
      bodyEntityList : gameData.gamers,
      eventName : mainEventName,
      title : '投票'
    });
  }

  _bomb () {
    if (gameData.timeLine.isNight) {
      this.refs.toast.show("夜晚不能自爆...");
      return;
    }

    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'bomb',
      entityList : gameData.gamers,
      eventName : mainEventName,
      title : '自爆'
    });
  }

  _kill () {
    if (!gameData.timeLine.isNight) {
      this.refs.toast.show("白天不能狼刀...");
      return;
    }
    this.props.navigation.navigate('ChooseCircleView', {
      dataField : 'kill',
      entityList : gameData.gamers,
      eventName : mainEventName,
      title : '狼刀'
    });
  }

  _info () {
    this.setState({gamerInfo : getGameInfo()});
  }

  _showGamerInfo (gamer) {
    let gamerInfo = "";
    let action = gamer.action;

    let lastTimeLine = "";
    for (let item of action) {
      if (lastTimeLine != item.timeLine.desc) {
        gamerInfo = gamerInfo + (lastTimeLine == "" ? "" : "\r\n") + item.timeLine.desc + "\r\n";
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
              this._voteNoBody()
            }}>
            <Text style={{color : '#ffffff'}}>平安日</Text>
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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._info()
            }}>
            <Text style={{color : '#ffffff'}}>信息</Text>
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
        <Toast ref="toast"/>
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
    flexDirection : 'row',
    justifyContent : 'space-between',
  },
  body_edge : {
    width : Constants.culWidthByPercent(0.15)
  },
  body_edge_window : {
    height : Constants.culHeightByPercent(0.13),
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
    width : Constants.culWidthByPercent(0.7)
  },
  body_center_text : {
    marginTop : 3,
    marginLeft : 3
  }
});