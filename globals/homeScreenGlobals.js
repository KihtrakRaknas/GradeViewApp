import { AsyncStorage } from 'react-native';

global.updateAvgDisplayGlobal = function (style) {
    AsyncStorage.setItem("avgDisplayStyle", style)
    this.setState({ style: style })
}

global.updateShowAGlobal = function (val) {
    AsyncStorage.setItem('showA', val.toString())
    this.setState({ showA: val })
}