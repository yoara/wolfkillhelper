/**
 * Created by yoara on 2017/7/24.
 */
import {init, move, next} from '../model/TimeLine';
let gameData = {
  gameConfig : null,    //游戏配置
  gamers : null,        //场上玩家
  timeLine : null,        //时间轴
  gameInfoText : "",      //游戏进程信息
  deadOrder : null,       //死亡顺序
  mainConfig : {},        //主界面工具
  firstDayBomb : false,     //警长竞选自爆
};
function initGameData (config) {
  gameData.gameConfig = config;
  gameData.gamers = [];
  gameData.gameInfoText = "欢迎进入游戏\r\n\r\n";
  gameData.timeLine = init();
  gameData.deadOrder = [];
  gameData.firstDayBomb = false;
  gameData.mainConfig = {
    notify_toast : null,      //主界面tip消息框
    notify_confirm : null,    //主界面确认消息框
    mainEventName : null,     //通知事件
    mainView : null,          //主界面对象
  };
  for (let index = 1; index <= config.roles.length; index++) {
    gameData.gamers.push({
      isAlive : true,
      isSheriff : false,
      action : [],
      sign : {},
      index : index,
      text : index
    });
  }
  //如果没有警长，则跳过警长竞选阶段
  if (!gameData.gameConfig.hasSheriff) {
    timeLineMove();
    addGameInfo("进入首页");
  } else {
    addGameInfo("进入警长竞选阶段");
  }
}

function timeLineMove () {
  gameData.timeLine = move();
}

function addGameInfo (text, newline = false) {
  gameData.gameInfoText = gameData.gameInfoText + "【" + gameData.timeLine.desc + "】" +
    ":\r\n" + text + (newline ? ("\r\n\r\n进入【" + next().desc) +
      "】........\r\n" : "") + "\r\n";
}

function getGameInfo () {
  return gameData.gameInfoText;
}

function gamerDead (gamer) {
  gamer.isAlive = false;
  gameData.deadOrder.push(gamer);
}

let actionStack = [];
function popActionStack () {
  let action = actionStack.pop();
  if (actionStack.length > 0) {   //一次stack有且仅有一次timeMove
    return;
  }
  if (action && action.needTimeLineMove) {
    timeLineMove();
    //如果狼人自爆且前个阶段是竞选警长阶段，则警徽丢失
    if (gameData.timeLine.id == 2 && gameData.firstDayBomb) {
      addGameInfo("自爆不能发言", true);
      timeLineMove();
    }
    actionStack = [];
    gameData.mainConfig.notify_toast.show(gameData.timeLine.isNight ? "进入夜晚闭眼阶段..." : "进入白天发言阶段...");
    gameData.mainConfig.mainView.setState({gamerInfo : getGameInfo()});
  }
}
/**
 * gamer 主操作玩家
 * gamerWith 被动玩家
 * action 具体行为
 * withMan 需记录的关联玩家群
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
      withMan : actionParam.withManWithoutMe
    };
    ga.action.push({
      timeLine : gameData.timeLine,
      time : actionParam.time,
      action : {
        id : actionParam.action.id,
        desc : actionParam.action.desc(actionInfo),
        withMan : actionParam.withManWithoutMe
      }
    });
  }
  if (actionParam.action.checkDeadWith) {
    if (actionParam.action.needTimeLineMove) {
      actionStack.push(actionParam.action);
    }
    let rejectFunc = () => {
      popActionStack();
    };
    let approveFunc = () => {
      gameData.mainConfig.mainView.props.navigation.navigate('ChooseCircleView', {
        dataField : 'deadWith',
        entityList : gameData.gamers,
        eventName : gameData.mainConfig.mainEventName,
        title : gamers[0].index + "号玩家" + actionParam.action.name + "欲带走：",
      });
    };
    gameData.mainConfig.notify_confirm.open(rejectFunc, approveFunc);
  } else {
    if (actionParam.action.group) {
      addGameInfo(actionParam.withMan);
      timeLineMove();
    } else {
      popActionStack();
    }
  }
}
/**
 *  gameConfig:
 *    {
 *      roles//角色板子
 *      myRole//我的角色
 *      hasSheriff//是否包含警长
 *      timeLine//当前游戏进程
 *    }
 */
/**
 *  gamers:
 *    [{
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
 *        {
 *          角色枚举:true,
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
  gamerDead,
  gamerAction,
}
