/**
 * Created by yoara on 2017/7/24.
 */
import {init,move} from '../model/TimeLine';

let gameData = {
  gameConfig : null,    //游戏配置
  gamers : null,        //场上玩家
  timeLine:null,        //时间轴
};
function initGameData (config) {
  gameData.gameConfig = config;
  gameData.gamers = [];
  gameData.timeLine = init();
  for (let index = 1; index <= config.roles.length; index++) {
    gameData.gamers.push({
      isAlive : true,
      action : [],
      sign : {},
      index : index,
      text : index
    });
  }
}

function timeLimeMove(){
  gameData.timeLine = move();
}
/**
 *  gameConfig:
 *    {
 *      roles//角色板子
 *      myRole//我的角色
 *      hasSheriff//是否包含警长
 *    }
 */
/**
 *  gamers:
 *    [{
 *      isAlive//是否离场
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
  timeLimeMove
}
