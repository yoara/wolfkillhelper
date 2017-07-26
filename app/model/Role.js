/**
 * Created by yoara on 2017/7/24.
 */
const villager = {
  id:1,
  name:'村民',
  shortName:'民',
  desc:''
};

const wolf = {
  id:2,
  name:'狼人',
  shortName:'狼',
  desc:''
};

const witch = {
  id:3,
  name:'女巫',
  shortName:'巫',
  desc:''
};

const hunter = {
  id:4,
  name:'猎人',
  shortName:'猎',
  desc:''
};

const guard = {
  id:5,
  name:'守卫',
  shortName:'守',
  desc:''
};

const prophet = {
  id:6,
  name:'预言家',
  shortName:'预',
  desc:''
};

const whiteWolf = {
  id:7,
  name:'白狼王',
  shortName:'白',
  desc:''
};

const cupid = {
  id:8,
  name:'丘比特',
  shortName:'丘',
  desc:''
};

const roleMap = {
  1:villager,
  2:wolf,
  3:witch,
  4:hunter,
  5:guard,
  6:prophet,
  7:whiteWolf,
  8:cupid,
}

const roleList = [
  {
    text:villager.shortName,
    role:villager
  },
  {
    text:wolf.shortName,
    role:wolf
  },
  {
    text:witch.shortName,
    role:witch
  },
  {
    text:hunter.shortName,
    role:hunter
  },
  {
    text:guard.shortName,
    role:guard
  },{
    text:prophet.shortName,
    role:prophet
  },
  {
    text:whiteWolf.shortName,
    role:whiteWolf
  },
  {
    text:cupid.shortName,
    role:cupid
  },
]



export {
  villager,wolf,witch,hunter,guard,prophet,whiteWolf,cupid,

  roleList, //角色列表

  roleMap,  //角色索引
}