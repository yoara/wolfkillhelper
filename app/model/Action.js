/**
 * Created by yoara on 2017/7/28.
 */
import {gameData, addGameInfo} from '../data/GameData';

const bomb = {
  id : 0,
  name : '自爆',
  checkDeadWith : true,
  needTimeLineMove : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + '玩家自爆了' +
      (gameData.timeLine.id == 1 && !gameData.gameConfig.firstDayBombHasSheriff ? "并炸掉了警徽" : "")
  },
};

const gun = {
  id : 1,
  name : '开枪',
  desc : (actionInfo) => {
    let msg = actionInfo.gamer.index + "号玩家开枪带走了：" + actionInfo.gamerWith.index + "号玩家";
    addGameInfo(msg, false);
    return msg;
  },
};

const gunEd = {
  id : 2,
  name : '被开枪',
  checkDeadWith : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被" + actionInfo.gamerWith.index + "号玩家开枪带走了";
  }
};

const vote = {
  id : 3,
  name : '投票',
  checkDeadWith : false,
  desc : (actionInfo) => {
    return "和" + actionInfo.withMan + "等玩家" +
      (actionInfo.gamerWith == null ? "弃票" : "投票给" + actionInfo.gamerWith.index + "号玩家")
  }
};

const voteEd = {
  id : 4,
  name : '被投票',
  checkDeadWith : false,
  desc : (actionInfo) => {
    addGameInfo(actionInfo.gamer.index + "号玩家被归票");
    return actionInfo.gamer.index + "号玩家被以下玩家投票:" + actionInfo.withMan;
  },
};

const voteEdSheriff = {
  id : 5,
  name : '当选警长',
  needTimeLineMove : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被以下玩家:" + actionInfo.withMan + "选为警长";
  },
};

const voteEdDead = {
  id : 6,
  name : '被归票出局',
  checkDeadWith : true,
  needTimeLineMove : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被以下玩家:" + actionInfo.withMan + "投票出局";
  },
};

const peaceNight = {
  id : 7,
  name : '平安夜',
  checkDeadWith : false,
  group : true,
  desc : (actionInfo) => {
    return "平安夜:" + actionInfo.withMan;
  },
};

const oneDeadNight = {
  id : 8,
  name : '夜晚单死',
  checkDeadWith : true,
  needTimeLineMove : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家夜晚单死";
  }
};

const twoDeadNight = {
  id : 9,
  name : '夜晚双死',
  checkDeadWith : true,
  needTimeLineMove : true,
  group : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家与" + actionInfo.withMan + "号玩家夜晚双死";
  },
};

const peaceDay = {
  id : 10,
  name : '平安日',
  checkDeadWith : false,
  group : true,
  desc : (actionInfo) => {
    return "平票结束:" + actionInfo.withMan;
  },
};

const love = {
  id : 11,
  name : '殉情',
  checkDeadWith : false,
  desc : (actionInfo) => {
    let msg = actionInfo.gamer.index + "号玩家殉情链子了" + actionInfo.gamerWith.index + "号玩家";
    addGameInfo(msg);
    return msg;
  },
};

const loveEd = {
  id : 12,
  name : '被殉情',
  checkDeadWith : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被" + actionInfo.gamerWith.index + "号玩家殉情链子了";
  }
};

const bitch = {
  id : 13,
  name : '魅惑',
  checkDeadWith : false,
  desc : (actionInfo) => {
    let msg = actionInfo.gamer.index + "号玩家魅惑了" + actionInfo.gamerWith.index + "号玩家";
    addGameInfo(msg);
    return msg;
  },
};

const bitchEd = {
  id : 14,
  name : '被魅惑',
  checkDeadWith : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被" + actionInfo.gamerWith.index + "号玩家魅惑了";
  }
};

const whiteWolf = {
  id : 15,
  name : '白狼杀',
  checkDeadWith : false,
  desc : (actionInfo) => {
    let msg = actionInfo.gamer.index + "号玩家白狼王，杀死了" + actionInfo.gamerWith.index + "号玩家";
    addGameInfo(msg);
    return msg;
  },
};

const whiteWolfEd = {
  id : 16,
  name : '被白狼杀',
  checkDeadWith : true,
  desc : (actionInfo) => {
    return actionInfo.gamer.index + "号玩家被" + actionInfo.gamerWith.index + "号玩家白狼王杀死了";
  }
};

export{
  bomb,
  gun, gunEd,
  vote, voteEd, voteEdSheriff, voteEdDead,
  peaceNight, oneDeadNight, twoDeadNight,
  peaceDay,
  love, loveEd,
  bitch, bitchEd,
  whiteWolf, whiteWolfEd,
}
