import React from 'react';
import { View } from 'react-native';

import { withTheme } from 'react-native-elements';

function MyComponent(props) {
  const { theme, updateTheme, replaceTheme } = props;
  // console.log(theme)
  return (
    <View style={{backgroundColor:theme.colors.offWhite, color: theme.colors.black, flex:1}}>{props.children}</View>
)
}

export default withTheme(MyComponent);