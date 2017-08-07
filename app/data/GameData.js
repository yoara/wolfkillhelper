/**
 * Created by yoara on 2017/7/24.
 */
import {init, move, back, next, JZJX} from '../model/TimeLine';
import {prophet} from '../model/Role';
import * as Action from '../model/Action';
let gameData = {
  gameConfig : null,      //游戏配置
  gamers : null,          //场上玩家
  timeLine : null,        //时间轴
  gameInfoText : [],      //游戏进程信息
  deadOrder : null,       //死亡顺序
  mainConfig : {},        //主界面工具
  firstDayBomb : false,   //警长竞选自爆
  eventId : 0,            //事件Id
  timeLineStack : [],     //时间堆栈
};

function addEventId () {
  gameData.eventId = gameData.eventId + 1;
}

function initGameData (config) {
  gameData.gameConfig = config;
  gameData.gamers = [];
  gameData.gameInfoText = [];
  gameData.timeLine = init();
  gameData.deadOrder = [];
  gameData.firstDayBomb = false;
  gameData.eventId = 0;
  gameData.timeLineStack = [{
    timeLine : gameData.timeLine,
    eventId : gameData.eventId
  }];
  gameData.mainConfig = {
    notify_toast : null,      //主界面tip消息框
    notify_confirm : null,    //主界面确认消息框
    mainEventName : null,     //通知事件
    mainView : null,          //主界面对象
  };
  addGameInfo("欢迎进入游戏\r\n\r\n");
  for (let index = 1; index <= config.roles.length; index++) {
    gameData.gamers.push({
      isAlive : true,
      isSheriff : false,
      action : [],
      sign : null,
      index : index,
      text : index + (gameData.gameConfig.myIndex === index ? gameData.gameConfig.myRole.shortName : "")
    });
  }
  //如果没有警长，则跳过警长竞选阶段
  if (!gameData.gameConfig.hasSheriff) {
    timeLineMove();
    addGameInfo("进入首页");
  } else {
    addGameInfo("进入【警长竞选阶段】........");
  }
}

function timeLineMove () {
  gameData.timeLine = move();
  gameData.timeLineStack.push({
    timeLine : gameData.timeLine,
    eventId : gameData.eventId
  });
}

function timeLineBack () {
  gameData.timeLine = back();
}

function addGameInfo (text, newline = false) {
  gameData.gameInfoText.push({
    text : text + (newline ? ("\r\n\r\n进入【" + next().desc) +
      "】........" : "") + "\r\n",
    eventId : gameData.eventId
  });
}

function getGameInfo () {
  let text = "";
  for (let textInfo of gameData.gameInfoText) {
    text = text + textInfo.text;
  }
  return text;
}

function getLoginInfo () {
  let text = "";
  for (let v1 of gameData.gamers) {
    //认预言家或标记为预言家
    if ((v1.sign && v1.sign.id === prophet.id) || (v1.declare && v1.declare.id === prophet.id)) {
      text += "【" + v1.index + "号玩家】预言家逻辑\r\n";
      //查杀
      let wolfKill = "";
      //被投票
      let voteEd = "";
      //金水
      let goodMan = "";
      //被站边
      let standToEd = "";
      //被轻踩
      let tallToEd = "";
      //被重踩
      let challengeToEd = "";
      //摇摆人
      let changeMan = "";
      for (let ac of v1.action) {
        if(ac.action.id === Action.voteEd.id){
          if (ac.timeLine.id > 1) {
            voteEd += "--【" + ac.timeLine.desc + "】" + ac.action.withMan + "\r\n";
          }else if(ac.timeLine === JZJX){
            standToEd += ac.action.withMan;
          }
        }
        if (ac.action.gamerWith) {
          let gamerIndex = ac.action.gamerWith.index + " ";
          if (ac.action.id === Action.wolfKill.id) {
            wolfKill += gamerIndex;
          }
          if (ac.action.id === Action.goodMan.id) {
            goodMan += gamerIndex;
          }
          if (ac.action.id === Action.standToEd.id) {
            if (standToEd.indexOf(gamerIndex) !== -1) {
              standToEd = standToEd.replace(gamerIndex, "");
            }
            standToEd += gamerIndex;
            if (tallToEd.indexOf(gamerIndex) !== -1) {
              tallToEd = tallToEd.replace(gamerIndex, "");
              changeMan += gamerIndex;
            }
            if (challengeToEd.indexOf(gamerIndex) !== -1) {
              challengeToEd = challengeToEd.replace(gamerIndex, "");
              changeMan += gamerIndex;
            }
          }
          if (ac.action.id === Action.tallToEd.id) {
            if (tallToEd.indexOf(gamerIndex) !== -1) {
              tallToEd = tallToEd.replace(gamerIndex, "");
            }
            tallToEd += gamerIndex;
            if (standToEd.indexOf(gamerIndex) !== -1) {
              standToEd = standToEd.replace(gamerIndex, "");
              changeMan += gamerIndex;
            }
          }
          if (ac.action.id === Action.challengeToEd.id) {
            if (challengeToEd.indexOf(gamerIndex) !== -1) {
              challengeToEd = challengeToEd.replace(gamerIndex, "");
            }
            challengeToEd += gamerIndex;
            if (standToEd.indexOf(gamerIndex) !== -1) {
              standToEd = standToEd.replace(gamerIndex, "");
              changeMan += gamerIndex;
            }
          }
        }
      }
      text += "【查杀】" + wolfKill + "\r\n";
      text += "【被投票】\r\n" + voteEd;
      text += "【金水】" + goodMan + "\r\n";
      text += "【被站边】" + standToEd + "\r\n";
      text += "【被轻踩】" + tallToEd + "\r\n";
      text += "【被重踩】" + challengeToEd + "\r\n";
      text += "【摇摆人】" + changeMan + "\r\n";
      text += "\r\n-----------\r\n\r\n";
    }
  }
  return text === "" ? "暂无" : text;
}

function gamerDead (gamer) {
  gamer.isAlive = false;
  gameData.deadOrder.push({
    gamer : gamer,
    eventId : gameData.eventId
  });
}

let actionStack = [];
function resetActionStack () {
  actionStack = [];
}
function popActionStack () {
  let action = actionStack.pop();
  if (actionStack.length > 0) {   //一次stack有且仅有一次timeMove
    return;
  }
  if (action && action.needTimeLineMove) {
    addGameInfo("游戏进入下一阶段", true);
    timeLineMove();
    //如果狼人自爆且前个阶段是竞选警长阶段，则警徽丢失
    if (gameData.timeLine.id === 2 && gameData.firstDayBomb) {
      addGameInfo("自爆不能发言", true);
      timeLineMove();
    }
    actionStack = [];
    gameData.mainConfig.notify_toast.show(gameData.timeLine.isNight ? "进入夜晚闭眼阶段..." : "进入白天发言阶段...");
    gameData.mainConfig.mainView.setState({gamerInfo : getGameInfo()});
  }
}

const waiting = [];
/**
 * gamer 主操作玩家
 * gamerWith 被动玩家
 * action 具体行为
 * withMan 需记录的关联玩家群
 * additional 附加信息
 */
function gamerAction (actionParam) {
  let date = new Date();
  let time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  actionParam.time = time;
  let gamers = actionParam.action.group ? actionParam.gamer : [actionParam.gamer];
  for (let ga of gamers) {
    if (actionParam.withMan) {
      actionParam.withManWithoutMe = actionParam.withMan.replace(ga.index + " ", "");
    }
    let actionInfo = {
      gamer : ga,
      gamerWith : actionParam.gamerWith,
      withMan : actionParam.withManWithoutMe,
      additional : actionParam.additional
    };
    ga.action.push({
      eventId : gameData.eventId,
      timeLine : gameData.timeLine,
      time : actionParam.time,
      action : {
        id : actionParam.action.id,
        desc : actionParam.action.desc(actionInfo),
        withMan : actionParam.withManWithoutMe,
        gamerWith : actionInfo.gamerWith,
        additional : actionInfo.additional,
      }
    });
  }
  if (actionParam.action.checkDeadWith) {
    if (actionParam.action.needTimeLineMove) {
      actionStack.push(actionParam.action);
    }
    let rejectFunc = () => {
      popActionStack();
      if (waiting.length > 0) {
        let config = waiting.pop();
        if (config) {
          gameData.mainConfig.notify_confirm.open(
            config.rejectFunc, config.approveFunc, config.title, config.msg);
        }
      }
    };
    let approveFunc = () => {
      gameData.mainConfig.mainView.props.navigation.navigate('ChooseCircleView', {
        dataField : 'deadWith',
        entityList : gameData.gamers,
        eventName : gameData.mainConfig.mainEventName,
        title : gamers[0].index + "号玩家" + actionParam.action.name + "可带走：",
      });
    };
    let title = gamers[0].index + "号玩家关联死亡";
    let msg = "是否要执行关联死亡";
    if (gameData.mainConfig.notify_confirm.hasOpen) {
      let config = {
        rejectFunc : rejectFunc,
        approveFunc : approveFunc,
        title : title,
        msg : msg,
      };
      waiting.push(config);
    } else {
      gameData.mainConfig.notify_confirm.open(
        rejectFunc, approveFunc, title, msg);
    }
  } else {
    if (actionParam.action.needTimeLineMove) {
      if (actionParam.action.group) {
        addGameInfo(actionParam.action.desc(actionParam));
      }
      addGameInfo("游戏进入下一阶段", true);
      timeLineMove();
    }
    // else {
    //   popActionStack();
    //   if (waiting.length > 0) {
    //     let config = waiting.pop();
    //     if (config) {
    //       gameData.mainConfig.notify_confirm.open(config.rejectFunc, config.approveFunc, config.title, config.msg);
    //     }
    //   }
    // }
  }
}

function gameRedo () {
  if (gameData.eventId === 0) {
    return;
  }

  while (true) {
    let text = gameData.gameInfoText.pop();
    if (text.eventId !== gameData.eventId) {
      gameData.gameInfoText.push(text);
      break;
    }
  }

  for (let gamer of gameData.gamers) {
    while (true) {
      let action = gamer.action.pop();
      if (!action) {
        break;
      }
      if (action.eventId !== gameData.eventId) {
        gamer.action.push(action);
        break;
      }
    }
  }

  while (true) {
    let time = gameData.timeLineStack.pop();
    if (time.eventId !== gameData.eventId) {
      gameData.timeLineStack.push(time);
      break;
    } else {
      timeLineBack();
    }
  }

  while (true) {
    let deadGamer = gameData.deadOrder.pop();
    if (!deadGamer) {
      break;
    }
    if (deadGamer.eventId !== gameData.eventId) {
      gameData.deadOrder.push(deadGamer);
      break;
    } else {
      deadGamer.gamer.isAlive = true;
    }
  }

  gameData.eventId = gameData.eventId - 1;
}
/**
 *  gameConfig:
 *    {
 *      roles//角色板子
 *      myRole//我的角色
 *      myIndex//我的序号
 *      hasSheriff//是否包含警长
 *      timeLine//当前游戏进程
 *    }
 */
/**
 *  gamers:
 *    [{
 *      office//参加警上竞选
 *      isAlive//是否离场
 *      isSheriff//是否警长
 *      action//行为
 *        [{
 *          timeLine://时间轴
 *          time://具体事件
 *          action://行为
 *            {
 *              id://行为枚举id
 *              desc://行为描述
 *              withMan://关联人
 *            }
 *        },...]
 *      text://显示信息
 *      sign://标记
 *      declare://认身份
 *        {
 *          role
 *          ...
 *        }
 *      index:序号
 *    },...]
 */
export {
  gameData,
  initGameData,
  timeLineMove,
  addGameInfo,
  getGameInfo,
  addEventId,
  gamerDead,
  gamerAction,
  resetActionStack,
  gameRedo,
  getLoginInfo,
}
