/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {gameData, addGameInfo, getGameInfo, gamerDead, gamerAction} from '../../data/GameData';
import * as Action from '../../model/Action';
import Toast from '../../common/util/Toast';
import Confirm from "../../common/util/Confirm";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
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
    gameData.mainConfig = {
      notify_toast : this.refs['toast'],
      notify_confirm : this.refs['confirm'],
      mainEventName : mainEventName,
      mainView : this,
    };

    this.subscription = DeviceEventEmitter.addListener(mainEventName, (data) => {
      let field = data.field;
      if ('bomb' == field) {
        this._bombAction(data);
      } else if ('vote' == field) {
        this._voteAction(data);
      } else if ('kill' == field) {
        this._killAction(data);
      } else if ('deadWith' == field) {
        this._deadWithAction(data);
      }
      this.setState({gamerInfo : getGameInfo()});
    });
  }

  componentWillUnmount () {
    this.subscription.remove();
  }

  _bombAction (data) {
    let gamer = data.item;
    gamerDead(gamer);
    addGameInfo(gamer.index + "号玩家自爆了" +
      (gameData.timeLine.id == 0 && !gameData.gameConfig.firstDayBombHasSheriff ? "，没有警徽" : ""),true);
    if(gameData.timeLine.id == 0){
      gameData.firstDayBomb = true;
    }
    gamerAction({
      gamer : gamer,
      action : Action.bomb,
    });
  }

  _voteAction (data) {
    //出局Index:投票人Index数组
    let outers = data.item;
    let maxIndex = [];
    let maxCount = 0;
    for (let index in outers) {
      let outerIndex = "";
      let outerVoters = [];
      for (let oi in outers[index]) {
        outerIndex = oi;
        outerVoters = outers[index][oi];
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
      let outer = outerIndex != "-1" ? gameData.gamers[parseInt(outerIndex) - 1] : null;
      if (outer != null) {
        gamerAction({
          gamer : outer,
          action : Action.voteEd,
          withMan : withMan,
        });
      }
      for (let i in outerVoters) {
        gamerAction({
          gamer : gameData.gamers[parseInt(outerVoters[i]) - 1],
          gamerWith : outer,
          action : Action.vote,
          withMan : withMan,
        });
      }
    }
    //如果同票人大于1
    if (maxIndex.length > 1) {
      this.refs['toast'].show("平票PK阶段...");
      addGameInfo(maxIndex.join(" ") + "号玩家平票PK");
    } else if (maxIndex.length == 0) {
      addGameInfo("投票玩家全部弃票");
    } else {
      let withMan = "";
      for (let index in outers) {
        for(let outerI in outers[index]){
          if(outerI==maxIndex[0]){
            withMan = outers[index][outerI].join(" ")
          }
        }
      }
      this.refs['toast'].show(maxIndex[0] + "号玩家被归票");
      //如果不是警长竞选阶段，则该玩家出局
      let ga = gameData.gamers[parseInt(maxIndex[0]) - 1];
      if (gameData.timeLine.id > 1) {
        gamerDead(ga);
        addGameInfo(ga.index + "号玩家被投票出局");
        gamerAction({
          gamer : ga,
          action : Action.voteEdDead,
          withMan : withMan,
        });
      } else {  //警长竞选阶段，该玩家上警
        ga.isSheriff = true;
        addGameInfo(ga.index + "号玩家被选为警长");
        gamerAction({
          gamer : ga,
          action : Action.voteEdSheriff,
          withMan : withMan,
        });
      }
    }
  }

  _killAction (data) {
    let gamer = data.item;
    if (gamer.length == 0) {//平安夜
      let withMan = "";
      let aliveGamer = [];
      for (let ga of gameData.gamers) {
        if (ga.isAlive) {//设置平安夜信息
          withMan = withMan + ga.index + " "
          aliveGamer.push(ga);
        }
      }
      gamerAction({
        gamer : aliveGamer,
        action : Action.peaceNight,
        withMan : withMan,
      });
      addGameInfo("平安夜:" + withMan);
    } else if (gamer.length == 1) {//单死
      let oneGamer = gamer[0];
      gamerDead(oneGamer);
      addGameInfo(oneGamer.index + "号玩家夜晚单死");
      gamerAction({
        gamer : oneGamer,
        action : Action.oneDeadNight,
      });
    } else if (gamer.length == 2) {//双死
      let withMan = "";
      for (let ga of gamer) {
        withMan = withMan + ga.index + " "
      }
      for (let ga of gamer) {
        gamerDead(ga);
        gamerAction({
          gamer : ga,
          action : Action.twoDeadNight,
          withMan : withMan,
        });
      }

      addGameInfo(withMan + " 夜晚双死");
    }
  }

  _deadWithAction (data) {
    let gamer = data.item;
    gamerDead(gamer);
    let whoDo = gameData.deadOrder[gameData.deadOrder.length - 2];
    let fromAction = null;
    let toAction = null;
    if ('gun' == data.deadWithType) {
      fromAction = Action.gun;
      toAction = Action.gunEd;
    } else if ('love' == data.deadWithType) {
      fromAction = Action.love;
      toAction = Action.loveEd;
    } else if ('bitch' == data.deadWithType) {
      fromAction = Action.bitch;
      toAction = Action.bitchEd;
    } else {
      fromAction = Action.whiteWolf;
      toAction = Action.whiteWolfEd;
    }
    gamerAction({
      gamer : whoDo,
      action : fromAction,
      gamerWith : gamer,
    });
    gamerAction({
      gamer : gamer,
      action : toAction,
      gamerWith : whoDo,
    });
  }

  _voteNoBody () {
    if (gameData.timeLine.isNight) {
      this.refs['toast'].show("夜晚不能投票...");
      return;
    }
    let withMan = "";
    let aliveGamer = [];
    for (let ga of gameData.gamers) {
      if (ga.isAlive) {
        withMan = withMan + ga.index + " "
        aliveGamer.push(ga);
      }
    }
    gamerAction({
      gamer : aliveGamer,
      action : Action.peaceDay,
      withMan : withMan
    });
    this.refs['toast'].show("平票结束...");
    this.setState({gamerInfo : getGameInfo()});
  }

  _vote () {
    if (gameData.timeLine.isNight) {
      this.refs['toast'].show("夜晚不能投票...");
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
      this.refs['toast'].show("夜晚不能自爆...");
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
      this.refs['toast'].show("白天不能狼刀...");
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
    let gamerInfo = "【" + gamer.index + "号玩家信息】\r\n";
    let action = gamer.action;

    let lastTimeLine = "";
    for (let item of action) {
      if (lastTimeLine != item.timeLine.desc) {
        gamerInfo = gamerInfo + (lastTimeLine == "" ? "" : "\r\n") + "【" + item.timeLine.desc + "】\r\n";
        lastTimeLine = item.timeLine.desc;
      }
      gamerInfo = gamerInfo + item.action.desc + "\r\n";
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
    alignItems : 'center'
  },
  headerButton : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culWidthByPercent(0.15),
    height : Constants.culHeightByPercent(0.03),
    backgroundColor : '#616161',
    borderColor : '#616161',
    borderWidth : 1,
    marginLeft : Constants.culWidthByPercent(0.025),
    marginRight : Constants.culWidthByPercent(0.025),
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