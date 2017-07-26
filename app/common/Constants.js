/**
 * Created by yoara on 2017/6/19.
 */
import {
  Dimensions,
} from 'react-native';
import Platform from 'Platform'

const OS = Platform.OS;

const IPHONE6_HEIGHT = 667;
const IPHONE6_WIDTH = 375;

const STANDARD_HEIGHT = Dimensions.get('window').height;
const STANDARD_WIDTH = Dimensions.get('window').width;

const HEIGHT_RATIO = STANDARD_HEIGHT / IPHONE6_HEIGHT;
const WIDTH_RATIO = STANDARD_WIDTH / IPHONE6_WIDTH;

function culHeight (height) {
  return Math.round(HEIGHT_RATIO * height);
}

function culWidth (width) {
  return Math.round(WIDTH_RATIO * width);
}

function culHeightByPercent(heightPercent){
  return Math.round(STANDARD_HEIGHT * heightPercent);
}

function culWidthByPercent(widthPercent){
  return Math.round(STANDARD_WIDTH * widthPercent);
}

export {
  OS,
  IPHONE6_HEIGHT,   //原图尺寸长
  IPHONE6_WIDTH,    //原图尺寸宽
  STANDARD_HEIGHT,  //当前设备尺寸 长
  STANDARD_WIDTH,   //当前设备尺寸 宽
  HEIGHT_RATIO,     //比例 长
  WIDTH_RATIO,      //比例 宽
  culHeight,        //返回设备对比原型所需要的尺寸height
  culWidth,         //返回设备对比原型所需要的尺寸width
  culHeightByPercent,         //返回设备百分比尺寸 height
  culWidthByPercent,          //返回设备百分比尺寸 width
};
