import React from 'react';
import { Text } from 'react-native'
import { ListItem } from 'react-native-elements';
import { pickTextColorBasedOnBgColorAdvanced } from '../globals/assignmentColorGlobals.js'
import TouchableScale from 'react-native-touchable-scale';
import gradeToLetter from '../helperFunctions/gradeToLetter'
import { LinearGradient } from 'expo-linear-gradient';
import { withTheme } from 'react-native-elements';

class ClassBtn extends React.Component {
    constructor(props) {
      super(props);
      //title
      //teacher
      //avg
    }
  
    classClicked=(className)=>{
      this.props.onPress(className)
    }
  
    gradeToEmoji = (percent) =>{
      if(!Number(percent))
        return "❓ "
      else if(percent>=97)
        return "🎉🎉"
      else if(percent>=93)
        return "😄😄"
      else if(percent>=90)
        return "😄"
      else if(percent>=87)
        return "😶😶"
      else if(percent>=83)
        return "😐😐"
      else if(percent>=80)
        return "😐"
      else if(percent>=77)
        return "😟"
      else if(percent>=73)
        return "😟😟"
      else if(percent>=70)
        return "😪"
      else if(percent>=67)
        return "😪😪"
      else if(percent>=63)
        return "😰"
      else if(percent>=60)
        return "😰😰"
      else 
        return "😭😭"
    }
  
    render () {
      avg = this.props.avg
      avgFrac = 0;
      if(Number(avg.substring(0,avg.length-1))){
        avg=Number(avg.substring(0,avg.length-1))+avg.substring(avg.length-1)
        avgFrac = Number(avg.substring(0,avg.length-1))/100
      }
      if(avgFrac<.4)
        avgFrac = .4
      fontWeightAvg = 'normal';
      if(this.props.style == "Letter"){
        avg = gradeToLetter(avg.substring(0,avg.length-1))
        if(!this.props.showAPlus && avg=="A+")
          avg="A"
        fontWeightAvg = 'bold'
      }else if(this.props.style == "Hieroglyphic"){
        avg = this.gradeToEmoji(avg.substring(0,avg.length-1))
      }
  
      colorz = ['#373a6d', '#6fc2d0']//['#F44336', '#FF9800']//
      titleColor = pickTextColorBasedOnBgColorAdvanced(colorz[0])
      avgColor = titleColor//pickTextColorBasedOnBgColorAdvanced(colorz[1])
      return (
        /*<TouchableOpacity style={{flex: 1, flexDirection: 'row',justifyContent: 'space-between', padding:10,paddingVertical:10}}>
          <View style={{flex: 7, }}>
            <Text style={{fontSize:20, }}></Text>
            <Text style={{fontSize:15}}></Text>
          </View>
  
          <View style={{flex: 2,}}>
            <Text style={{fontSize:30,textAlign:'right'}}>{avg}</Text>
          </View>
        </TouchableOpacity>*/
        <ListItem
          onPress={() => this.classClicked(this.props.title)}
          Component={TouchableScale}
          friction={10} //
          tension={100} // These props are passed to the parent component (here TouchableScale)
          activeScale={0.8} //
          linearGradientProps={{
            colors: colorz,
            start: [avgFrac-.6, .8],
            end: [avgFrac, 1]
          }}
          ViewComponent={LinearGradient}
          title={this.props.title}
          titleStyle={{ color: titleColor, fontWeight: 'bold' }}
          subtitleStyle={{ color: titleColor }}
          subtitle={this.props.teach?this.props.teach:null}
          chevron={{ color: avgColor }}
          rightElement = {<Text style={{fontSize:30,textAlign:'right',color:avgColor, fontWeight: fontWeightAvg}}>{avg?avg:null}</Text>}
          containerStyle = {{ marginLeft: 5,
            marginRight: 5, 
            marginTop: 10, 
            borderRadius: 10, // adds the rounded corners
            backgroundColor: '#fff',
          }}
          style={{shadowOffset: {width: 3, height: 3}, shadowColor: this.props.theme.colors.grey6, shadowOpacity:.2, shadowRadius: 2}}
        />
      );
    }
  }

export default withTheme(ClassBtn)