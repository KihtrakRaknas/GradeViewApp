global.updateAvgDisplayGlobal = function (style) {
    AsyncStorage.setItem("avgDisplayStyle", style)
    this.setState({ style: style })
  }
