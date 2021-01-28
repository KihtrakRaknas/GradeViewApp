import React from 'react';
import { Text as NormalText, View, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
export default class AssignmentScreen extends React.Component {
    constructor(props){
      super(props);
    }
    
    static navigationOptions = ({ navigation }) => {
      /*return {
        title: navigation.getParam('className',"Class Name"),
      }*/
      return {
        headerStyle: navigationHeader,
        title: "Assignment Details"//navigation.getParam('assignmentData',{Name:""})["Name"],
      }
    };
  
    render(){
      assignment = this.props.navigation.getParam('assignmentData',{})
      var year = new Date().getFullYear();
      if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>6)
          year = year--;
  
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      
      var date = new Date(assignment["Date"]+"/"+year);
  
      date = date.toLocaleDateString(undefined, options)
  
      console.log(assignment["Comment"])
  
      var comment = assignment["Comment"];
      var subtitle = assignment["Subtitle"];
  
      if(comment&&comment.length>=2)
        if(comment.substring(0,1) == '"' && comment.substring(comment.length-1,comment.length) == '"'){
          comment = comment.substring(1,comment.length-1)
        }
      console.log(assignment["Name"])
      return (
        <RespectThemeBackground>
          <View style={{  
            borderBottomWidth: 2,
            borderColor: '#373a6d',
            padding:15,
            paddingBottom:15,
            //backgroundColor:'#f2feff'
          }}>
            <Text adjustsFontSizeToFit numberOfLines={2} style={{fontWeight:"bold", textShadowColor:"lightblue", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 10, fontSize:50, paddingBottom:10,}}>{assignment["Name"]?assignment["Name"]:null}</Text>
            <Text style={{fontSize:25}}>{date?date:null}</Text>
          </View>
          <ScrollView style={{flex:1,padding:15, paddingTop:25}}>
            <Text adjustsFontSizeToFit numberOfLines={Platform.OS === 'ios'?1:null} style={{fontSize:25, paddingBottom:10}}>{assignment['className']?assignment['className']:null}</Text>
            <Text style={{fontSize:20, paddingBottom:40}}>{assignment["teacher"]?assignment["teacher"]:null}</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={{fontWeight:"bold", textShadowColor:"#ff8246", fontSize:Platform.OS === 'ios'?75:50,textAlign:"right"}}><Text style={{width:"50%"}}>{assignment["Grade"]?assignment["Grade"]:null}</Text> <Text style={{color:"red", width:"50%"}}>{assignment["Weighting"]&&assignment["Weighting"].includes("x")?assignment["Weighting"]:null}</Text></Text>
            <Text style={{paddingTop:10, fontSize:30, textAlign:"right"}}>{assignment["Grade"].split("/").length==2?(Number(assignment["Grade"].split("/")[0])/Number(assignment["Grade"].split("/")[1])*100).toFixed(1)+"%":null}</Text>
            <Text style={{paddingTop:20, fontSize:20, textAlign:"right"}}>{assignment["Category"]?""+assignment["Category"]:null}</Text>
            <View style={{marginTop:50,borderRadius:10,backgroundColor:"#f7f7f7", minHeight:100,padding:5,marginBottom:30}}>
              {subtitle?<NormalText style={{ fontSize:20, marginBottom:20}}>{subtitle}</NormalText>:null}
              <NormalText style={{ fontSize:20}}>{comment?comment:"No Teacher Comment"}</NormalText>
            </View>
          </ScrollView>
        </RespectThemeBackground>
      )
    }
  }