/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {gameData, timeLimeMove, addGameInfo, getGameInfo, gamerDead} from '../../data/GameData';
import {roleMap} from '../../model/Role';
import Toast from '../../common/util/Toast';
import Confirm from "../../common/util/Confirm";
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

  componentWillUnmount () {
    this.subscription.remove();
  }

  _bombAction (data, time) {
    let gamer = data.item;
    //设置离场信息
    gamerDead(gamer);
    //时间轴记录信息
    gamer.action.push({
      timeLine : gameData.timeLine,
      time : time,
      action : '自爆了' + (gameData.timeLine.id == 1 ? "并炸掉了警徽" : "")
    });
    addGameInfo(gamer.index + "自爆了" + (gameData.timeLine.id == 1 ? "，没有警徽" : ""), true);
    let callback = () => {
      timeLimeMove();
      if (gameData.timeLine.id == 2) { //如果前个阶段是竞选警长阶段，则警徽丢失
        addGameInfo("自爆不能发言", true);
        timeLimeMove();
      }
      this.refs.toast.show("进入夜晚闭眼阶段...");
    };
    this._deadWith(callback);
  }

  _voteAction (data, time) {
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
    //如果同票人大于1
    if (maxIndex.length > 1) {
      this.refs.toast.show("平票PK阶段...");
      addGameInfo(maxIndex.join(" ") + "号玩家平票PK");
    } else if (maxIndex.length == 0) {
      addGameInfo("投票玩家全部弃票");
    } else {
      this.refs.toast.show(maxIndex[0] + "号玩家被归票");
      addGameInfo(maxIndex[0] + "号玩家被归票", true);
      //如果不是警长竞选阶段，则该玩家出局
      if (gameData.timeLine.id > 1) {
        gamerDead(gameData.gamers[parseInt(maxIndex[0]) - 1]);
        gameData.gamers[parseInt(maxIndex[0]) - 1].action.push({
          timeLine : gameData.timeLine,
          time : time,
          action : "归票出局"
        });
        let callback = () => {
          addGameInfo(maxIndex[0] + "号玩家被投票出局死亡", false);
          timeLimeMove();
          this.refs.toast.show("进入夜晚闭眼阶段...");
        };
        this._deadWith(callback);
      } else {  //警长竞选阶段，该玩家上警
        gameData.gamers[parseInt(maxIndex[0]) - 1].isSheriff = true;
        addGameInfo(maxIndex[0] + "号玩家被选为警长", true);
        timeLimeMove();
      }
    }
  }

  _killAction (data, time) {
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
      timeLimeMove();
    } else if (gamer.length == 1) {//单死
      //设置离场信息
      let oneGamer = gamer[0];
      gamerDead(oneGamer);
      //时间轴记录信息
      oneGamer.action.push({
        timeLine : gameData.timeLine,
        time : time,
        action : '夜晚单死'
      });
      let callback = () => {
        addGameInfo(oneGamer.index + " 夜晚单死", true);
        timeLimeMove();
        this.refs.toast.show("进入夜晚闭眼阶段...");
      };
      this._deadWith(callback);
    } else if (gamer.length == 2) {//双死
      let withMan = "双死:";
      for (let ga of gamer) {
        withMan = withMan + ga.index + " "
      }
      for (let ga of gamer) {
        gamerDead(ga);
        ga.action.push({
          timeLine : gameData.timeLine,
          time : time,
          action : withMan
        });
      }
      //TODO 双死关联
      let callback = () => {
        addGameInfo(withMan + " 夜晚双死", true);
        timeLimeMove();
        this.refs.toast.show("进入夜晚闭眼阶段...");
      };
      this._deadWith(callback);
    }
    this.refs.toast.show("进入白天发言阶段...");
  }

  _deadWithAction (data, time) {
    let gamer = data.item;
    //设置离场信息
    gamerDead(gamer);
    //时间轴记录信息
    gamer.action.push({
      timeLine : gameData.timeLine,
      time : time,
      action : "关联" + gameData.deadOrder[gameData.deadOrder.length - 2].index + "玩家死亡，类型：" + data.deadWithType
    });
    gameData.deadOrder[gameData.deadOrder.length - 2].action.push({
      timeLine : gameData.timeLine,
      time : time,
      action : "将" + gamer.index + "玩家带走，类型：" + data.deadWithType
    });
    addGameInfo(gamer.index + "被关联出局了，死亡类型：" + data.deadWithType, true);
    data.callback();
  }

  componentDidMount () {
    this.subscription = DeviceEventEmitter.addListener(mainEventName, (data) => {
      let field = data.field;
      //时间轴记录信息
      let date = new Date();
      let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      if ('bomb' == field) {
        this._bombAction(data, time);
      } else if ('vote' == field) {
        this._voteAction(data, time);
      } else if ('kill' == field) {
        this._killAction(data, time);
      } else if ('deadWith' == field) {
        this._deadWithAction(data, time);
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

  _deadWith (callback) {
    let rejectFunc = () => {
      callback();
    };
    let approveFunc = () => {
      this.props.navigation.navigate('ChooseCircleView', {
        dataField : 'deadWith',
        entityList : gameData.gamers,
        eventName : mainEventName,
        title : '自爆',
        callback : callback
      });
    };
    this.refs.confirm.open(rejectFunc, approveFunc);
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
            <Text style={styles.headerButtonText}>投票</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._voteNoBody()
            }}>
            <Text style={styles.headerButtonText}>平安日</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._bomb()
            }}>
            <Text style={styles.headerButtonText}>自爆</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._kill()
            }}>
            <Text style={styles.headerButtonText}>狼刀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              this._info()
            }}>
            <Text style={styles.headerButtonText}>信息</Text>
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
        <Confirm
          ref="confirm"
          title='请您确认'
          msg='是否发动关联死亡'
          btnRejectText='不关联'
          btnApproveText='关联'
        />
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
    flexDirection : 'row',
    flexWrap : 'wrap',
    alignItems:'center'
  },
  headerButton : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culWidthByPercent(0.15),
    height : Constants.culHeightByPercent(0.03),
    backgroundColor : '#616161',
    borderColor : '#616161',
    borderWidth : 1,
    marginLeft:Constants.culWidthByPercent(0.025),
    marginRight:Constants.culWidthByPercent(0.025),
  },
  headerButtonText : {
    color : '#ffffff',
    fontSize : 14
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
    width : Constants.culWidthByPercent(0.7),
    height : Constants.culHeightByPercent(0.85)
  },
  body_center_text : {
    marginTop : 3,
    marginLeft : 3
  }
});