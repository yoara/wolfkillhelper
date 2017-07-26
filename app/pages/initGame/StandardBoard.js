/**
 * Created by yoara on 2017/7/24.
 */
import {villager,wolf,witch,hunter,guard,prophet,whiteWolf,cupid} from '../../model/Role';
const boards = [
  {
    text:'标准板（12人）',
    roles:[
      villager,villager,villager,villager,
      prophet,witch,hunter,guard,
      wolf,wolf,wolf,wolf,
    ]
  },
  {
    text:'白狼王板（12人）',
    roles:[
      villager,villager,villager,villager,
      prophet,witch,hunter,guard,
      wolf,wolf,wolf,whiteWolf,
    ]
  },
  {
    text:'丘比特板（12人）',
    roles:[
      villager,villager,villager,villager,
      prophet,witch,hunter,cupid,
      wolf,wolf,wolf,wolf,
    ]
  }
];

export{
  boards
}