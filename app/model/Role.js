/**
 * Created by yoara on 2017/7/24.
 */
const god = {
  id : 0,
  name : '上帝',
  shortName : '上帝',
  desc : ''
};

const villager = {
  id : 1,
  name : '村民',
  shortName : '民',
  desc : ''
};

const wolf = {
  id : 2,
  name : '狼人',
  shortName : '狼',
  desc : ''
};

const witch = {
  id : 3,
  name : '女巫',
  shortName : '巫',
  desc : ''
};

const hunter = {
  id : 4,
  name : '猎人',
  shortName : '猎',
  desc : ''
};

const guard = {
  id : 5,
  name : '守卫',
  shortName : '守',
  desc : ''
};

const prophet = {
  id : 6,
  name : '预言家',
  shortName : '预',
  desc : ''
};

const whiteWolf = {
  id : 7,
  name : '白狼王',
  shortName : '白',
  desc : ''
};

const cupid = {
  id : 8,
  name : '丘比特',
  shortName : '丘',
  desc : ''
};

const beautifulWolf = {
  id : 9,
  name : '狼美人',
  shortName : '美',
  desc : ''
};

const villager_up = {
  id : 10,
  name : '民及民以上',
  shortName : '民↑',
  desc : ''
};

const god_up = {
  id : 11,
  name : '强神',
  shortName : '神↑',
  desc : ''
};

const roleMap = {
  0 : god,
  1 : villager,
  2 : wolf,
  3 : witch,
  4 : hunter,
  5 : guard,
  6 : prophet,
  7 : whiteWolf,
  8 : cupid,
  9 : beautifulWolf,
  10 : villager_up,
  11 : god_up
}

const roleList = [
  {
    text : villager.name,
    role : villager
  },
  {
    text : wolf.name,
    role : wolf
  },
  {
    text : witch.name,
    role : witch
  },
  {
    text : hunter.name,
    role : hunter
  },
  {
    text : guard.name,
    role : guard
  }, {
    text : prophet.name,
    role : prophet
  },
  {
    text : whiteWolf.name,
    role : whiteWolf
  },
  {
    text : cupid.name,
    role : cupid
  },
  {
    text : god.name,
    role : god
  },
];

const godList = [
  {
    text : witch.shortName,
    role : witch,
    checked : false
  },
  {
    text : hunter.shortName,
    role : hunter,
    checked : false
  },
  {
    text : guard.shortName,
    role : guard,
    checked : false
  },
  {
    text : prophet.shortName,
    role : prophet,
    checked : false
  },
  {
    text : cupid.shortName,
    role : cupid,
    checked : false
  },
];

const wolfList = [
  {
    text : whiteWolf.name,
    role : whiteWolf,
    checked : false
  },
  {
    text : beautifulWolf.name,
    role : beautifulWolf,
    checked : false
  },
];

const declareList = [
  {
    text : villager_up.name,
    role : villager_up
  },
  {
    text : god_up.name,
    role : god_up
  },
  {
    text : villager.name,
    role : villager
  },
  {
    text : witch.name,
    role : witch
  },
  {
    text : hunter.name,
    role : hunter
  },
  {
    text : guard.name,
    role : guard
  },
  {
    text : prophet.name,
    role : prophet
  },
  {
    text : cupid.name,
    role : cupid
  },
  {
    text : wolf.name,
    role : wolf
  },
];

export {
  god, villager, wolf, witch, hunter, guard, prophet, whiteWolf, cupid, beautifulWolf,

  roleList, godList, wolfList, declareList, //角色列表

  roleMap,  //角色索引
}