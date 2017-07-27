/**
 * Created by yoara on 2017/7/24.
 */
import {init, move, next} from '../model/TimeLine';

let gameData = {
  gameConfig : null,    //游戏配置
  gamers : null,        //场上玩家
  timeLine : null,        //时间轴
  gameInfoText : "",      //游戏进程信息
  deadOrder:null,       //死亡顺序
};
function initGameData (config) {
  gameData.gameConfig = config;
  gameData.gamers = [];
  gameData.gameInfoText = "欢迎进入游戏\r\n进入警长竞选环节\r\n\r\n";
  gameData.timeLine = init();
  gameData.deadOrder = [];
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
  if(!gameData.gameConfig.hasSheriff){
    timeLimeMove();
  }
}

function timeLimeMove () {
  gameData.timeLine = move();
}

function addGameInfo (text, newline = false) {
  gameData.gameInfoText = gameData.gameInfoText + gameData.timeLine.desc +
    ":\r\n" + text + (newline ? ("\r\n\r\n进入" + next().desc) +
      "........\r\n" : "") + "\r\n";
}

function getGameInfo () {
  return gameData.gameInfoText;
}

function gamerDead(gamer){
  gamer.isAlive = false;
  gameData.deadOrder.push(gamer);
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
  timeLimeMove,
  addGameInfo,
  getGameInfo,
  gamerDead
}
