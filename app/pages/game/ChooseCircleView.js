/**
 * Created by yoara on 2017/7/24.
 */
import React from 'react';
import * as Constants from '../../common/Constants';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  DeviceEventEmitter,
  Alert
} from 'react-native';

export default class ChooseView extends React.Component {
  constructor (props) {
    super(props);
    this.entityList = this.props.navigation.state.params.entityList || [];
    this.bodyEntityList = this.props.navigation.state.params.bodyEntityList || [];
    this.eventName = this.props.navigation.state.params.eventName;
    this.dataField = this.props.navigation.state.params.dataField;
    this.contentViewStyle = this.props.navigation.state.params.contentViewStyle;
    this.contentTextStyle = this.props.navigation.state.params.contentTextStyle;
    this.customView = this.props.navigation.state.params.customView;
    this.state = {};
    this.headerChoice = {};
    this.bodyChoice = {};
    this.voteInfo = [];
  }

  static navigationOptions = ({navigation}) => ({
    title : navigation.state.params.title || '选择',
  });

  _headerChoose (item) {
    if (!item.isAlive) {
      return;
    }

    let active = {};
    if (this.state[item.index + "headerActive"]) {
      active[item.index + "headerActive"] = false;
      delete this.headerChoice[item.index];
    } else {
      //自爆或者投票只能选择一个
      if ('bomb' == this.dataField || 'vote' == this.dataField) {
        if (Object.keys(this.headerChoice).length == 1) {
          Alert.alert("只能选择一个玩家");
          return;
        }
      }
      active[item.index + "headerActive"] = true;
      this.headerChoice[item.index] = item;
    }
    this.setState(active);
  }

  _bodyChoose (item) {
    if (!item.isAlive) {
      return;
    }
    let active = {};
    if (this.state[item.index + "bodyActive"]) {
      active[item.index + "bodyActive"] = false;
      delete this.bodyChoice[item.index];
    } else {
      active[item.index + "bodyActive"] = true;
      this.bodyChoice[item.index] = item;
    }
    this.setState(active);
  }

  _renderHeaderItem (item, i) {
    let active = this.state[item.index + "headerActive"] ? true : false;
    return (
      <TouchableHighlight
        key={i}
        style={[styles.tipContentView, active && styles.tipContentCheckedView,
          !item.isAlive && styles.tipContentReadOnlyView, this.contentViewStyle]}
        underlayColor='#f0f0f0' onPress={() => this._headerChoose(item)}>
        <Text style={[styles.tipText, this.contentTextStyle]}>{item.text}</Text>
      </TouchableHighlight>
    );
  }

  _renderBodyItem (item, i) {
    let active = this.state[item.index + "bodyActive"] ? true : false;
    return (
      <TouchableHighlight
        key={i}
        style={[styles.tipContentView, active && styles.tipContentCheckedView,
          !item.isAlive && styles.tipContentReadOnlyView, this.contentViewStyle]}
        underlayColor='#f0f0f0' onPress={() => this._bodyChoose(item)}>
        <Text style={[styles.tipText, this.contentTextStyle]}>{item.text}</Text>
      </TouchableHighlight>
    );
  }

  _getHeaderChoiceData () {
    let items = [];
    for (let key in this.headerChoice) {
      items.push(this.headerChoice[key]);
    }
    return items;
  }

  _bomb () {
    if (Object.keys(this.headerChoice).length == 0) {
      Alert.alert("请选择一个玩家自爆");
      return;
    }
    let data = {
      item : this._getHeaderChoiceData()[0]
    };
    this._returnMain(data);
  }

  _oneKill () {
    if (Object.keys(this.headerChoice).length != 1) {
      Alert.alert("单死必须选择一个玩家");
      return;
    }
    let data = {
      item : this._getHeaderChoiceData()
    };
    this._returnMain(data);
  }

  _twoKill () {
    if (Object.keys(this.headerChoice).length != 2) {
      Alert.alert("双死必须选择两个玩家");
      return;
    }
    let data = {
      item : this._getHeaderChoiceData()
    };
    this._returnMain(data);
  }

  _noKill () {
    if (Object.keys(this.headerChoice).length != 0) {
      Alert.alert("平安夜不用选择玩家");
      return;
    }
    this._returnMain({item : []});
  }

  _returnMain (data) {
    data.field = this.dataField;
    DeviceEventEmitter.emit(this.eventName, data);
    this.props.navigation.goBack();
  }

  _vote () {
    if (Object.keys(this.headerChoice).length == 0
        &&Object.keys(this.bodyChoice).length == 0) {
      Alert.alert("请选择投票结果");
      return;
    }

    if (Object.keys(this.headerChoice).length > 0
      &&Object.keys(this.bodyChoice).length == 0) {
      Alert.alert("请选择投票玩家");
      return;
    }

    let voter = [];
    let vote = {};
    for (let index in this.bodyChoice) {
      voter.push(index);
    }
    let outer = "-1";
    for (let index in this.headerChoice) {
      outer = index + "";
    }
    vote[outer] = voter;
    this.voteInfo.push(vote);

    //清除选择数据
    let active = {};
    for (let index in this.headerChoice) {
      active[index + "headerActive"] = false;
    }
    for (let index in this.bodyChoice) {
      active[index + "bodyActive"] = false;
    }
    this.headerChoice = {};
    this.bodyChoice = {};
    this.setState(active);
  }

  _voteFinish () {
    if(this.voteInfo.length==0){
      Alert.alert("请录入投票结果");
      return;
    }
    let data = {
      item : this.voteInfo
    }
    this._returnMain(data);
  }


  render () {
    return (
      <View style={[styles.container]}>
        <View style={[styles.headerContainer]}>
          {
            this.entityList.map((item, i) => this._renderHeaderItem(item, i))
          }
        </View>

        <View style={[styles.bodyContainer]}>
          {
            this.bodyEntityList.map((item, i) => this._renderBodyItem(item, i))
          }
        </View>

        <View style={[styles.footerContainer]}>

          {
            this.dataField == 'bomb' ?
              <View style={styles.footerContainer}>
                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._bomb()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>自爆</Text>
                </TouchableHighlight>
              </View>
              : <View/>
          }
          {
            this.dataField == 'kill' ?
              <View style={styles.footerContainer}>
                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._oneKill()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>单死</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._twoKill()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>双死</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._noKill()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>平安夜</Text>
                </TouchableHighlight>
              </View>
              : <View/>
          }
          {
            this.dataField == 'vote' ?
              <View style={styles.footerContainer}>
                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._vote()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>投票</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  underlayColor="#E1F6FF"
                  onPress={() => this._voteFinish()}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>结束</Text>
                </TouchableHighlight>
              </View>
              : <View/>
          }
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container : {   //容器局样式
    backgroundColor : '#ffffff',
    height : Constants.STANDARD_HEIGHT,
    justifyContent : 'space-between',
  },
  headerContainer : {
    height : Constants.culHeightByPercent(0.3),
    justifyContent : 'space-around',
    flexDirection : 'row',
    flexWrap : 'wrap'
  },
  bodyContainer : {
    height : Constants.culHeightByPercent(0.3),
    justifyContent : 'space-around',
    flexDirection : 'row',
    flexWrap : 'wrap'
  },
  footerContainer : {
    height : Constants.culHeightByPercent(0.3),
    width : Constants.STANDARD_WIDTH,
    justifyContent : 'space-around',
    alignItems : 'center',
    flexDirection : 'row'
  },
  tipContentView : {
    justifyContent : 'center',
    alignItems : 'center',
    width : Constants.culWidthByPercent(0.12),
    height : Constants.culWidthByPercent(0.12),
    borderWidth : 1,
    borderColor : "#f0f0f0",
    justifyContent : "center",
    backgroundColor : "#ffffff",
    borderRadius : 28,
    margin : Constants.culWidth(5),
  },
  tipContentReadOnlyView : {
    backgroundColor : '#4a4a4a'
  },
  tipContentCheckedView : {
    backgroundColor : '#f39800'
  },
  tipText : {
    color : "#3a3a3a",
    fontSize : 16,
  },
  button : {
    backgroundColor : '#f39800',
    width : Constants.culWidthByPercent(0.2),
    height : Constants.culHeight(50),
    marginBottom : Constants.culWidthByPercent(0.04),
    borderRadius : 5,
    alignItems : 'center',
    justifyContent : 'center',
  },
  buttonText : {
    fontSize : 16,
    color : '#ffffff'
  }
});