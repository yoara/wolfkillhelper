/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {
  gameData,
  addGameInfo,
  getGameInfo,
  gamerDead,
  gamerAction,
  resetActionStack,
  gameRedo,
  addEventId,
  getLoginInfo
} from '../../data/GameData';
import * as Action from '../../model/Action';
import Toast from '../../common/util/Toast';
import Confirm from "../../common/util/Confirm";
import {roleList, declareList} from '../../model/Role';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
  TouchableOpacity
} from 'react-native';
export {
  mainEventName
}
const mainEventName = 'mainChoose';
export default class Main extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title : '游戏界面',
    header : null
  });

  constructor (props) {
    super(props);
    this.state = {
      gamerInfo : getGameInfo(),
      officeData : this.props.navigation.state.params.officeData
    };
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
      let showInfoType = "main";
      if ('bomb' === field) {
        resetActionStack();
        this._bombAction(data);
      } else if ('vote' === field) {
        this._voteAction(data);
      } else if ('kill' === field) {
        resetActionStack();
        this._killAction(data);
      } else if ('deadWith' === field) {
        this._deadWithAction(data);
      } else if ('sign' === field) {
        this._signAction(data);
        showInfoType = 'gamer';
      } else if ('declare' === field) {
        this._declareAction(data);
        showInfoType = 'gamer';
      } else if ('behaviour' === field) {
        this._behaviourAction(data);
        showInfoType = 'gamer';
      } else if ('checkOut' === field) {
        this._checkOutAction(data);
        showInfoType = 'gamer';
      } else if ('witchOut' === field) {
        this._witchOutAction(data);
        showInfoType = 'gamer';
      } else if ('giveSheriff' == field) {
        this._giveSheriffAction(data);
      }
      if (showInfoType == 'main') {
        this.setState({gamerInfo : getGameInfo()});
      } else if (showInfoType == 'gamer') {
        this._showGamerInfo(gameData.gamers[this.state.gamerIndex - 1]);
      }
    });

    if (this.state.officeData) {
      this._office(this.state.officeData);
    }
  }

  componentWillUnmount () {
    this.subscription.remove();
  }

  _bombAction (data) {
    let gamer = data.item[0];
    gamerDead(gamer);
    addGameInfo(gamer.index + "号玩家自爆了" +
      (gameData.timeLine.id == 0 && !gameData.gameConfig.firstDayBombHasSheriff ? "，没有警徽" : ""));
    if (gameData.timeLine.id == 0) {
      gameData.firstDayBomb = true;
    }
    gamerAction({
      gamer : gamer,
      action : Action.bomb,
    });
  }

  _voteAction (data) {
    if (data.voteNoBody) {
      this._voteNoBody();
      return;
    }

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
      let withMan = outerVoters.join(" ") + " ";
      let outer = outerIndex != "-1" ? gameData.gamers[parseInt(outerIndex) - 1] : null;
      let hasSheriff = false;
      for (let i in outerVoters) {
        if (gameData.gamers[parseInt(outerVoters[i]) - 1].isSheriff) {
          hasSheriff = true;
          break;
        }
      }
      //计算投票人数量
      if (outerIndex != "-1") {
        if ((outerVoters.length + (hasSheriff ? 0.5 : 0)) > maxCount) {
          maxCount = outerVoters.length + (hasSheriff ? 0.5 : 0);
          maxIndex = [];
          maxIndex.push(outerIndex);
        } else if (outerVoters.length == maxCount) {
          maxIndex.push(outerIndex);
        }
      }
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
      addGameInfo(maxIndex.join(" ") + " 号玩家平票PK");
    } else if (maxIndex.length == 0) {
      addGameInfo("投票玩家全部弃票");
    } else {
      let withMan = "";
      for (let index in outers) {
        for (let outerI in outers[index]) {
          if (outerI == maxIndex[0]) {
            withMan = outers[index][outerI].join(" ") + " "
          }
        }
      }
      this.refs['toast'].show(maxIndex[0] + "号玩家被归票");
      //如果不是警长竞选阶段，则该玩家出局
      let ga = gameData.gamers[parseInt(maxIndex[0]) - 1];
      if (gameData.timeLine.id > 1) {
        gamerDead(ga);
        addGameInfo(Action.voteEdDead.desc({gamer : ga, withMan : withMan}));
        gamerAction({
          gamer : ga,
          action : Action.voteEdDead,
          withMan : withMan,
        });
      } else {  //警长竞选阶段，该玩家上警
        ga.isSheriff = true;
        addGameInfo(Action.voteEdSheriff.desc({gamer : ga, withMan : withMan}));
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
          withMan = withMan + ga.index + " ";
          aliveGamer.push(ga);
        }
      }
      gamerAction({
        gamer : aliveGamer,
        action : Action.peaceNight,
        withMan : withMan,
      });
    } else if (gamer.length == 1) {//单死
      let oneGamer = gamer[0];
      gamerDead(oneGamer);
      addGameInfo(Action.oneDeadNight.desc({gamer : oneGamer}));
      gamerAction({
        gamer : oneGamer,
        action : Action.oneDeadNight,
      });
    } else if (gamer.length == 2) {//双死
      let withMan = "";
      for (let ga of gamer) {
        withMan = withMan + ga.index + " ";
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
    let gamer = data.item[0];
    gamerDead(gamer);
    let whoDo = gameData.deadOrder[gameData.deadOrder.length - 2].gamer;
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
    addEventId();
    let withMan = "";
    let aliveGamer = [];
    for (let ga of gameData.gamers) {
      if (ga.isAlive) {
        withMan = withMan + ga.index + " ";
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
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'vote',
      viewTitle : '投票',
      needAddEvent : true,
      bodyEntityList : gameData.gamers,
    });
  }

  _bomb () {
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'bomb',
      viewTitle : '自爆',
      needAddEvent : true
    });
  }

  _kill () {
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'kill',
      viewTitle : '狼刀',
      needAddEvent : true
    });
  }

  _operation (param) {
    if (param.needAddEvent) {
      addEventId();
    }
    this.props.navigation.navigate(param.view, {
      dataField : param.dataField,
      entityList : param.gamers || gameData.gamers,
      eventName : mainEventName,
      title : param.viewTitle,
      bodyEntityList : param.bodyEntityList,
    });
  }

  _redo () {
    gameRedo();
    this._info();
    this.refs['toast'].show("撤销完成...");
  }

  _info () {
    this.setState({gamerInfo : getGameInfo(), gamerIndex : null});
  }

  _sign () {
    this._operation({
      view : 'ChooseView',
      dataField : 'sign',
      viewTitle : '选择标记',
      gamers : roleList
    });
  }

  _signAction (data) {
    let role = data.item.role;
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    gamer.sign = role;
  }

  _declare () {
    this._operation({
      view : 'ChooseView',
      dataField : 'declare',
      viewTitle : '认身份',
      gamers : declareList
    });
  }

  _unDeclare () {
    if (!this.state.gamerIndex) {
      this.refs['toast'].show("请先选择玩家");
      return;
    }
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    let role = gamer.declare;
    if (!role) {
      this.refs['toast'].show("玩家没有认身份");
      return;
    }
    gamer.declare = null;
    gamerAction({
      gamer : gamer,
      action : Action.unDeclareRole,
      additional : role
    });
    this._showGamerInfo(gamer);
  }

  _declareAction (data) {
    let role = data.item.role;
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    gamer.declare = role;

    gamerAction({
      gamer : gamer,
      action : Action.declareRole,
      additional : role
    });
  }

  _behaviour () {
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'behaviour',
      viewTitle : '行为',
      needAddEvent : true,
    });
  }

  _checkOut () {
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'checkOut',
      viewTitle : '报验人',
      needAddEvent : true,
    });
  }

  _witchOut () {
    this._operation({
      view : 'ChooseCircleView',
      dataField : 'witchOut',
      viewTitle : '发银水',
      needAddEvent : true,
    });
  }

  _witchOutAction (data) {
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    let to = data.item[0];
    let action = Action.saveTo;
    let actionTo = Action.saveToEd;
    gamerAction({
      gamer : gamer,
      action : action,
      gamerWith : to
    });
    gamerAction({
      gamer : to,
      action : actionTo,
      gamerWith : gamer,
    });
    addGameInfo(action.desc({gamer : gamer, gamerWith : to}))
  }

  _checkOutAction (data) {
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    let to = data.item[0];
    let action;
    let actionTo;
    let withMan = "";
    for (let ga of data.item) {
      withMan = withMan + ga.index + " ";
    }
    if (data.checkOutType === 'wolf') {
      action = Action.wolfKill;
      actionTo = Action.wolfKillEd;
    } else if (data.checkOutType === 'man') {
      action = Action.goodMan;
      actionTo = Action.goodManEd;
    } else if (data.checkOutType === 'check') {
      action = Action.checkOrder;
    }
    gamerAction({
      gamer : gamer,
      action : action,
      gamerWith : to,
      withMan : withMan,
    });
    if (actionTo) {
      gamerAction({
        gamer : to,
        action : actionTo,
        gamerWith : gamer,
        withMan : withMan,
      });
    }
    addGameInfo(action.desc({gamer : gamer, gamerWith : to, withMan : withMan}))
  }

  _behaviourAction (data) {
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    let to = data.item;
    let action;
    let actionTo;
    if (data.behaviourType === 'tallTo') {
      action = Action.tallTo;
      actionTo = Action.tallToEd;
    } else if (data.behaviourType === 'challengeTo') {
      action = Action.challengeTo;
      actionTo = Action.challengeToEd;
    } else if (data.behaviourType === 'standTo') {
      action = Action.standTo;
      actionTo = Action.standToEd;
    } else {
      return;
    }
    let withMan = "";
    for (let ga of to) {
      withMan = withMan + ga.index + " "
    }
    for (let ga of to) {
      gamerAction({
        gamer : ga,
        action : actionTo,
        withMan : withMan,
        gamerWith : gamer
      });
    }
    gamerAction({
      gamer : gamer,
      action : action,
      withMan : withMan,
    });

    addGameInfo(action.desc({gamer : gamer, withMan : withMan}))
  }


  _office (data) {
    let gamer = data.item;
    if (gamer.length === 0) {
      this.refs['toast'].show("无人竞选警长");
      this._voteNoBody();
      return;
    }
    let withMan = "";
    for (let ga of gamer) {
      withMan = withMan + ga.index + " ";
    }
    for (let ga of gamer) {
      ga.office = true;
      gamerAction({
        gamer : ga,
        action : Action.office,
        withMan : withMan,
      });
    }
    addGameInfo(withMan + " 参与警长竞选");
    this.setState({gamerInfo : getGameInfo()});
  }

  _unOffice () {
    if (!this.state.gamerIndex) {
      this.refs['toast'].show("请先选择玩家");
      return;
    }
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    gamer.office = false;
    gamerAction({
      gamer : gamer,
      action : Action.unOffice,
    });
    addGameInfo(Action.unOffice.desc({gamer : gamer}));
    this._showGamerInfo(gamer);
  }

  _giveSheriff (type) {
    if (type) {
      this._operation({
        view : 'ChooseCircleView',
        dataField : 'giveSheriff',
        viewTitle : '飞警徽',
        needAddEvent : true,
      });
    } else {
      let gamer = gameData.gamers[this.state.gamerIndex - 1];
      addEventId();
      gamer.isSheriff = false;
      gamerAction({
        gamer : gamer,
        action : Action.destroySheriff,
      });
      addGameInfo(Action.destroySheriff.desc({gamer : gamer}));
    }
  }

  _giveSheriffAction (data) {
    let gamer = gameData.gamers[this.state.gamerIndex - 1];
    let to = data.item[0];
    let action = Action.giveSheriff;
    let actionTo = Action.giveSheriffEd;
    gamerAction({
      gamer : gamer,
      action : action,
      gamerWith : to
    });
    gamerAction({
      gamer : to,
      action : actionTo,
      gamerWith : gamer,
    });
    gamer.isSheriff = false;
    to.isSheriff = true;
    addGameInfo(action.desc({gamer : gamer, gamerWith : to}))
  }

  _gameOver () {
    //this.refs['toast'].show("游戏结束...");
    //this.props.navigation.goBack();
  }

  _logic () {
    this.setState({gamerInfo : getLoginInfo()});
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
    this.setState({gamerInfo : gamerInfo, gamerIndex : gamer.index});
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
        <Text
          style={styles.body_edge_window_text}>
          {
            gamer.text + (gamer.isSheriff ? "徽" : "") +
            (gamer.sign ? "\r\n标:" + gamer.sign.shortName : "") +
            (gamer.declare ? "\r\n认:" + gamer.declare.shortName : "") +
            (gamer.isAlive ? "" : "\r\n(死亡)")
          }</Text>
      </TouchableOpacity>
    );
  }

  render () {
    return (
      <View style={styles.container}>
        <View style={styles.headerTitle}>
          <Text style={styles.title_Text}>{gameData.timeLine.desc}</Text>
        </View>
        <View style={styles.headerContainer}>
          <View style={styles.headerContainerView}>
            {
              !gameData.timeLine.isNight ?
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    this._vote()
                  }}>
                  <Text style={styles.headerButtonText}>投票</Text>
                </TouchableOpacity>
                : null
            }
            {
              !gameData.timeLine.isNight ?
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    this._bomb()
                  }}>
                  <Text style={styles.headerButtonText}>自爆</Text>
                </TouchableOpacity>
                : null
            }
            {
              gameData.timeLine.isNight ?
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    this._kill()
                  }}>
                  <Text style={styles.headerButtonText}>狼刀</Text>
                </TouchableOpacity>
                : null
            }
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                this._redo()
              }}>
              <Text style={styles.headerButtonText}>撤销</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                this._info()
              }}>
              <Text style={styles.headerButtonText}>信息</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                this._logic()
              }}>
              <Text style={styles.headerButtonText}>盘逻辑</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <View style={[styles.body_edge, {borderRightWidth : 1, borderRightColor : '#e1e1e1'}]}>
            {
              gameData.gamers.map((gamer, i) => this._edgeWindow(gamer, i, 0, 5))
            }
          </View>
          <View style={styles.body_center}>
            <View style={styles.body_scroll}>
              <ScrollView >
                <Text style={styles.body_center_text}>
                  {this.state.gamerInfo}
                </Text>
              </ScrollView>
            </View>
            <View style={[styles.footerContainer]}>
              <Text style={{width : Constants.culWidthByPercent(0.7)}}>{"【" +
              (this.state.gamerIndex ? this.state.gamerIndex + "号" : "未选择") + "玩家】"}</Text>
              <View style={styles.headerContainerView}>
                {
                  this.state.gamerIndex ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._sign()
                      }}>
                      <Text style={styles.footerButtonText}>标记</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  this.state.gamerIndex && gameData.gamers[this.state.gamerIndex - 1].isAlive ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._behaviour()
                      }}>
                      <Text style={styles.footerButtonText}>行为</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  this.state.gamerIndex &&
                  gameData.gamers[this.state.gamerIndex - 1].isAlive &&
                  (
                    (gameData.gamers[this.state.gamerIndex - 1].declare &&
                    gameData.gamers[this.state.gamerIndex - 1].declare.id === 6) ||
                    (
                      this.state.gamerIndex === gameData.gameConfig.myIndex &&
                      gameData.gameConfig.myRole.id === 6
                    )
                  ) ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._checkOut()
                      }}>
                      <Text style={styles.footerButtonText}>报验人</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  this.state.gamerIndex &&
                  gameData.gamers[this.state.gamerIndex - 1].isAlive &&
                  (
                    (gameData.gamers[this.state.gamerIndex - 1].declare &&
                    gameData.gamers[this.state.gamerIndex - 1].declare.id === 3) ||
                    (
                      this.state.gamerIndex === gameData.gameConfig.myIndex &&
                      gameData.gameConfig.myRole.id === 3
                    )
                  ) ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._witchOut()
                      }}>
                      <Text style={styles.footerButtonText}>发银水</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  this.state.gamerIndex ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._declare()
                      }}>
                      <Text style={styles.footerButtonText}>认身份</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  this.state.gamerIndex &&
                  gameData.gamers[this.state.gamerIndex - 1].declare ?
                    <TouchableOpacity
                      style={styles.footerButton}
                      onPress={() => {
                        this._unDeclare()
                      }}>
                      <Text style={styles.footerButtonText}>脱衣服</Text>
                    </TouchableOpacity>
                    : null
                }
                {
                  gameData.timeLine.id === 0 && this.state.gamerIndex &&
                  gameData.gamers[this.state.gamerIndex - 1].isAlive &&
                  gameData.gamers[this.state.gamerIndex - 1].office ?
                    (
                      <TouchableOpacity
                        style={styles.footerButton}
                        onPress={() => {
                          this._unOffice()
                        }}>
                        <Text style={styles.footerButtonText}>退水</Text>
                      </TouchableOpacity>
                    ) : null
                }
                {
                  this.state.gamerIndex &&
                  !gameData.gamers[this.state.gamerIndex - 1].isAlive &&
                  gameData.gamers[this.state.gamerIndex - 1].isSheriff ?
                    (
                      <TouchableOpacity
                        style={styles.footerButton}
                        onPress={() => {
                          this._giveSheriff(true)
                        }}>
                        <Text style={styles.footerButtonText}>飞警徽</Text>
                      </TouchableOpacity>
                    ) : null
                }
                {
                  this.state.gamerIndex &&
                  !gameData.gamers[this.state.gamerIndex - 1].isAlive &&
                  gameData.gamers[this.state.gamerIndex - 1].isSheriff ?
                    (
                      <TouchableOpacity
                        style={styles.footerButton}
                        onPress={() => {
                          this._giveSheriff(false)
                        }}>
                        <Text style={styles.footerButtonText}>撕警徽</Text>
                      </TouchableOpacity>
                    ) : null
                }
              </View>
            </View>
          </View>
          <View style={[styles.body_edge, {borderLeftWidth : 1, borderLeftColor : '#e1e1e1'}]}>
            {
              gameData.gamers.map((gamer, i) => this._edgeWindow(gamer, i, 6, gameData.gameConfig.gamerCount - 1))
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
    )
      ;
  }
}

const styles = StyleSheet.create({
  headerTitle : {
    marginTop : Constants.culHeightByPercent(0.02),
    backgroundColor : '#ffffff',
    height : Constants.culHeightByPercent(0.05),
    justifyContent : 'center',
    alignItems : 'center',
  },
  title_Text : {
    textAlign : 'center',
    color : '#5c5c5c',
    fontSize : 16
  },
  container : {   //容器局样式
    backgroundColor : '#ffffff',
    height : Constants.culHeightByPercent(Constants.OS === 'ios' ? 0.93 : 1)
  },
  headerContainer : {
    backgroundColor : '#ffffff',
    height : Constants.culHeightByPercent(0.1),
    justifyContent : 'space-around',
  },
  headerContainerView : {
    flexDirection : 'row',
    justifyContent : 'space-around',
  },
  headerButton : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culHeightByPercent(0.08),
    height : Constants.culHeightByPercent(0.08),
    backgroundColor : '#f39800',
    borderColor : '#f39800',
    borderRadius : 28,
    borderWidth : 1,
  },
  headerButtonText : {
    color : '#ffffff',
    fontSize : 14
  },
  bodyContainer : {
    borderTopWidth : Constants.culHeight(1),
    borderColor : '#e1e1e1',
    height : Constants.culHeightByPercent(Constants.OS === 'ios' ? 0.83 : 0.9),
    flexDirection : 'row',
    justifyContent : 'space-between',
  },
  body_edge : {
    width : Constants.culWidthByPercent(0.15),
    backgroundColor : '#ffffff',
  },
  body_edge_window : {
    height : Constants.culHeightByPercent(Constants.OS === 'ios' ? 0.14 : 0.133),
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
  },
  body_scroll : {
    height : Constants.culHeightByPercent(Constants.OS === 'ios' ? 0.7 : 0.62),
    borderBottomWidth : 0.3,
    borderBottomColor : '#8e8e8e'
  },
  body_center_text : {
    marginTop : 3,
    marginLeft : 3
  },
  footerContainer : {
    backgroundColor : '#ffffff',
    height : Constants.culHeightByPercent(Constants.OS === 'ios' ? 0.13 : 0.18),
    justifyContent : 'space-around',
  },
  footerButton : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culHeightByPercent(0.06),
    height : Constants.culHeightByPercent(0.06),
    backgroundColor : '#f39800',
    borderColor : '#f39800',
    borderRadius : 22,
    borderWidth : 1,
  },
  footerButtonText : {
    color : '#ffffff',
    fontSize : 12
  },
});