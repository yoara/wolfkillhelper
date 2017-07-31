/**
 * Created by yoara on 2017/7/27.
 */
import React, {Component, PropTypes} from 'react';

import {
  StyleSheet,
  View,
  Modal,
  Text,
  Dimensions,
  TouchableHighlight,
  PixelRatio,
} from 'react-native';


export default class Confirm extends Component {
  constructor (props) {
    super(props);
    this.state = {
      flag : false,
    };
  }

  static propTypes = {
    btnRejectText : PropTypes.string,
    btnApproveText : PropTypes.string,
    title : PropTypes.string.isRequired,
    textAlign : PropTypes.string,
    msg : PropTypes.string.isRequired,
    btnTextRejectColor : PropTypes.string,
    btnTextApproveColor : PropTypes.string,
    swap : PropTypes.bool,
  };

  static defaultProps = {
    btnRejectText : '取消',
    btnApproveText : '确定',
    title : '提示',
    textAlign : 'left', // 标题与提示内容的文本对齐方式， 默认left, 可以：center, right.
    msg : '请您确认',
    btnTextRejectColor : '#999',
    btnTextApproveColor : '#34a3f9',
    swap : true, // swap为true，默认值，即 确认事件按钮在右边，取消按钮及事件在左边
  };

  open = (rejectFunc, approveFunc, title = null, msg = null) => {
    this.rejectFunc = rejectFunc;
    this.approveFunc = approveFunc;
    this.hasOpen = true;
    this.setState({
      flag : true,
      title : title,
      msg : msg
    });
  };

  /**
   * _onRejectPress 事件拒绝函数，默认位置在对话框左边
   * @private
   */
  _onRejectPress = () => {
    this.hasOpen = false;
    this.setState({
      flag : false,
    });
    this.rejectFunc();
  };

  /**
   * _onApprovePress 事件同意函数，默认位置在对话框右边
   * @private
   */
  _onApprovePress = () => {
    this.hasOpen = false;
    this.setState({
      flag : false
    });
    this.approveFunc();
  };

  render () {
    const {...title} = this.props;
    let swapStatic = this.props.swap;
    return (
      <Modal animationType={"fade"}
             transparent={true}
             visible={this.state.flag}
             onRequestClose={() => {
             }}>
        <View style={styles.confirmModal}>
          <View style={styles.confirm}>
            <View style={styles.title}>
              <Text
                style={[styles.titleCon, {textAlign : this.props.textAlign}]}>{this.state.title || this.props.title}</Text>
            </View>
            <View style={styles.content}>
              <Text style={[styles.text, {textAlign : this.props.textAlign}]}>{this.state.msg || this.props.msg}</Text>
            </View>
            <View style={styles.btn}>
              <TouchableHighlight underlayColor='#eee'
                                  onPress={swapStatic ? this._onRejectPress : this._onApprovePress}
                                  style={styles.btnClick}>
                <View style={[styles.btnView, styles.btnReject]}>
                  <Text
                    style={[styles.btnText, {color : swapStatic ? this.props.btnTextRejectColor : this.props.btnTextApproveColor}]}>
                    {swapStatic ? this.props.btnRejectText : this.props.btnApproveText}
                  </Text>
                </View>
              </TouchableHighlight>
              <View style={{height : 45, width : 1 / PixelRatio.get(), backgroundColor : '#c5c5c5'}}/>
              <TouchableHighlight underlayColor='#eee'
                                  onPress={swapStatic ? this._onApprovePress : this._onRejectPress}
                                  style={styles.btnClick}>
                <View style={[styles.btnView, styles.btnApprove]}>
                  <Text
                    style={[styles.btnText, {color : swapStatic ? this.props.btnTextApproveColor : this.props.btnTextRejectColor}]}>
                    {swapStatic ? this.props.btnApproveText : this.props.btnRejectText}
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}


let _width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  confirmModal : {
    flex : 1,
    alignItems : 'center',
    justifyContent : 'center',
    flexDirection : 'column',
    backgroundColor : 'rgba(0,0,0,.45)'
  },
  confirm : {
    width : _width * .86,
    backgroundColor : '#fff',
    flexDirection : 'column',
    // alignItems: 'center',
    justifyContent : 'center',
    borderRadius : 5,
    overflow : 'hidden'
  },
  title : {
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'center',
    height : 45,
    borderBottomColor : '#c5c5c5',
    borderBottomWidth : 1 / PixelRatio.get(),
  },
  titleCon : {
    flex : 1,
    textAlign : 'center',
    fontSize : 20,
    paddingLeft : 10,
    color : '#34a3f9',
  },
  content : {
    padding : 5,
    paddingLeft : 15,
    paddingRight : 15,
    marginTop : 5,
    marginBottom : 5,
    minHeight : 100,
    justifyContent : 'center',
  },
  text : {
    fontSize : 18,
    textAlign : 'left',
    lineHeight : 28,
  },
  btn : {
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'center',
    height : 45,
    borderTopColor : '#c5c5c5',
    borderTopWidth : 1 / PixelRatio.get(),
    overflow : 'hidden'
  },
  btnClick : {
    flex : 1,
    alignItems : 'center',
    justifyContent : 'center',
    flexDirection : 'row',
    overflow : 'hidden',
  },
  btnText : {
    textAlign : 'center',
    textAlignVertical : 'center',
    overflow : 'hidden',
    fontSize : 16,
  },
  btnView : {
    flex : 1,
    height : 44,
    alignItems : 'center',
    justifyContent : 'center',
    borderLeftColor : '#c5c5c5',
    // borderLeftWidth: 11,
  },
  btnReject : {},
  btnApprove : {},
});