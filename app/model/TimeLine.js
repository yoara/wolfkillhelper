/**
 * Created by yoara on 2017/7/25.
 */
const JZJX = {
  id : 0,
  desc : '警长竞选'
};
const NIGHT = {
  id : 1,
  desc : '首夜',
  isNight : true
};
const DAY_1 = {
  id : 2,
  desc : '第一天早上'
};
const NIGHT_1 = {
  id : 3,
  desc : '第一天夜间',
  isNight : true
};
const DAY_2 = {
  id : 4,
  desc : '第二天早上'
};
const NIGHT_2 = {
  id : 5,
  desc : '第二天夜间',
  isNight : true
};
const DAY_3 = {
  id : 6,
  desc : '第三天早上'
};
const NIGHT_3 = {
  id : 7,
  desc : '第三天夜间',
  isNight : true
};
const DAY_4 = {
  id : 8,
  desc : '第四天早上'
};
const NIGHT_4 = {
  id : 9,
  desc : '第四天夜间',
  isNight : true
};
const DAY_5 = {
  id : 10,
  desc : '第五天早上'
};
const NIGHT_5 = {
  id : 11,
  desc : '第五天夜间',
  isNight : true
};

const timeLineList = [
  JZJX, NIGHT, DAY_1, NIGHT_1,
  DAY_2, NIGHT_2, DAY_3, NIGHT_3,
  DAY_4, NIGHT_4, DAY_5, NIGHT_5
]
let timeIndex = 0;
function init () {
  timeIndex = 0;
  return now();
}

function now () {
  return timeLineList[timeIndex];
}

function move () {
  timeIndex = timeIndex + 1;
  return now();
}

function back () {
  timeIndex = timeIndex - 1;
  return now();
}

function next () {
  return timeLineList[timeIndex + 1];
}

export{
  init,     //初始化时间轴
  now,      //当前时间轴
  move,     //时间轴前推
  back,     //时间轴倒退
  next,     //下一个时间轴
  JZJX
}