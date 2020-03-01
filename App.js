import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert, Button, TouchableOpacity,TextInput ,KeyboardAvoidingView , ScrollView, Picker,StatusBar,RefreshControl, Switch, FlatList, AppState, Image, LayoutAnimation, UIManager} from 'react-native';
import { Ionicons ,FontAwesome  } from '@expo/vector-icons';
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon, Input ,ButtonGroup } from 'react-native-elements'
import {AsyncStorage, Dimensions} from 'react-native';
import DropdownMenu from 'react-native-dropdown-menu';
import Modal from 'react-native-modal';
//import gradeList from './gradeList.js'
require('create-react-class');
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions'
import {Linking, Platform} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast';
import * as LocalAuthentication from 'expo-local-authentication';
import { SearchBar, ListItem } from 'react-native-elements';
import {SplashScreen } from 'expo';
import Fuse from 'fuse.js';
import { Accelerometer } from 'expo-sensors';
import ColorPalette from 'react-native-color-palette'
//import {LineChart} from "react-native-chart-kit";
import { BarCodeScanner } from 'expo-barcode-scanner';
import TouchableScale from 'react-native-touchable-scale';
import { LinearGradient } from 'expo-linear-gradient';
const categories = ['Homework','Quizzes','Tests','Classwork','Essays','Labs','Oral Assessments','Participation',"Performance Assessments","Pre Test Assessments 1","Pre Test Assessments 2","Post Test Assessment 1","Post Test Assessment 2","Projects","Research and Inquiry","Socratic Seminar","Summer Assignment","Technique"]
const colorsToPickFrom = ['#000000', '#FFFFFF', '#C0392B', '#ffe6ab', '#ff8000', '#ffe0de', '#8E44AD', '#2980B9', '#ff1100', '#ffff00', '#00ff40', '#bfff00', '#e0ffd9', '#e6feff', '#00ffff', '#0000ff', '#d7d9f5']
const defaultColors = {"Homework":"#e6feff","Quizzes":"#ffe6ab","Performance Assessments":"#ffe0de","Tests":"#ffe0de","Classwork":"#e6feff","Essays":"#e6feff","Labs":"#e6feff","Oral Assessments":"#ffe6ab","Participation":"#e0ffd9","Pre Test Assessments 1":"#e0ffd9","Pre Test Assessments 2":"#e0ffd9","Post Test Assessment 1":"#ffe0de","Post Test Assessment 2":"#ffe0de","Projects":"#d7d9f5","Research and Inquiry":"#d7d9f5","Socratic Seminar":"#d7d9f5","Summer Assignment":"#ffff00","Technique":"#e6feff"}

var grades;

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

class LoadInComponent extends React.Component {
  parseJSON(obj){
    var assignments = [];

              for(className in obj){
                if(className!="Status"){
                for(markingPeriod in obj[className]){
                  if(markingPeriod!=null && markingPeriod != "teacher" && markingPeriod != "title"){
                    //console.log(markingPeriod);
                    //console.log(className)
                    var teacher = obj[className]['teacher']
                    //console.log(obj[className][markingPeriod]["Assignments"]);
                    for(var assignment of obj[className][markingPeriod]["Assignments"]){
                      assignment['teacher'] = teacher;
                      assignment['className'] = className;

                      var year = "19";
                      if(assignment["Date"].includes("\n")){
                        if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>6)
                          year = "18";
                        //assignment["Name"] = (assignment["Date"].split("/")[1]).split("\n")[0];
                        assignment["Timestamp"] = Date.parse(assignment["Date"]+"/"+year);
                      }else{
                        assignment["Timestamp"] = Date.parse("12/12"+year-2);
                      }
                        assignments.push(assignment);
                        //console.log(assignment["Date"]+"/"+year);
                    }
                  }
                }
                }
              }

              var arr = assignments;

            /*var i, len = arr.length, el, j;
              for(i = 1; i<len; i++){
                el = arr[i];
                j = i;
                while(j>0 && Date.parse(arr[j-1]["Date"].split("\n")[1])>Date.parse(arr[i]["Date"].split("\n")[1])){
                  arr[j] = arr[j-1];
                  j--;
              }
              arr[j] = el;
              }
              console.log(arr);
              */
              //console.log(arr);
              arr = arr.sort((a, b) => b["Timestamp"] - a["Timestamp"]);
              //console.log("SORTED\n\n\n\n\n\n");
              //console.log(arr);
            var listOfAssignments =[];
            var lastAssignment;
            var tempList = []
              for(var assignment of arr){
                if(lastAssignment!=null&&lastAssignment["Date"]!=assignment["Date"]){
                  var title = lastAssignment["Date"].replace("\n"," ")
                  if(!title)
                    title = "No date"
                  listOfAssignments.push({
                    title: title,
                    data: tempList,
                  });
                  tempList= [];
                }

                tempList.push(assignment);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]

                lastAssignment = assignment;
              }
              var title = assignment["Date"].replace("\n"," ")
              if(!title)
                title = "No date"
              listOfAssignments.push({
                title: title,
                data: tempList,
              });

              return listOfAssignments;
  }

  componentWillMount(){
    console.log("LOADIN COMPONENT RUNNIN")
    console.log("LOADIN COMPONENT DONE!!!")
    console.log(AppState.currentState)
    AppState.addEventListener('change', this._handleAppStateChange);
    AsyncStorage.getItem('username').then((user)=>{
      console.log("TEST")
      console.log(user);
      if(user==null){
        signOutGlobal();
      }else{
        this._retrieveData()
        this.getGrade()
        this.registerForPushNotificationsAsync(user)
      }
    })
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState&&this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.getGrade()
    }
    this.setState({appState: nextAppState});
  };

     registerForPushNotificationsAsync = async(user) => {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
    
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
    
      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return;
      }
      // Get the token that uniquely identifies this device
      let token = await Notifications.getExpoPushTokenAsync();
      console.log(token)
      // POST the token to your backend server from where you can retrieve it to send push notifications.
      AsyncStorage.getItem('password').then((pass)=>{
        return fetch("https://gradeview.herokuapp.com/addToken", {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: {
              value: token,
            },
            user: {
              username: user,
              password: pass,
            },
          }),
        });
      });
    }

    getGrade = async () => {
      return this.getGradeWithoutErrorCatching().catch((error) =>{
				//console.error(error);
			});
    }


  getGradeWithoutErrorCatching = async () => {
  this.props.navigation.setParams({loading: true});
	console.log("TEST")
		return fetch('https://gradeview.herokuapp.com/', {
		method: 'POST',
		headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  username: await AsyncStorage.getItem('username'),//"10012734@sbstudents.org",//10012734 //
		  password: await AsyncStorage.getItem('password'),//"Sled%2#9",//Sled%2#9 //
		}),
	})
			.then((response) => {
		//console.log(response);
		//response.json()
		console.log(typeof response)
			return response.json();
		})
			.then((responseJson) => {

		//console.log(responseJson);
		if(responseJson["Status"]=="Completed"){
      grades = responseJson;
      console.log("GRADES UPDATED")
          AsyncStorage.setItem('grades', JSON.stringify(responseJson));
          parsedJSON = this.parseJSON(responseJson)
					this.setState({
						isLoading: false,
						dataSource: parsedJSON,
					}, function(){

          });
		}else{
      //Alert.alert("NOT cached")
      this.runGetGrades()

    }
    this.props.navigation.setParams({ loading: false })
			})
}

_retrieveData = async () => {
  try {
    const value = await AsyncStorage.getItem('grades');
    if (value != null) {
      var jsonVal = JSON.parse(value)
      grades = jsonVal;
      // console.log("LOCALLY STORED");
      //   console.log(jsonVal)
        console.log("LOCALLY STORED");

        parsedJSON = this.parseJSON(jsonVal)

        this.setState({
          isLoading: false,
          dataSource: parsedJSON,
        }, function(){

        });
    }else{
      this.setState({
        isLoading: true,
        dataSource: {},
      }, function(){

      });
    }
  } catch (error) {
    // Error retrieving data
  }
};

runGetGrades(){
  setTimeout(() => {

    this.getGrade()
  },10000);
}
}

class ListOfAssignmentsView extends React.Component{
  constructor(props){
    super(props);
    this.state = {}
    updateBackgroundColorsGlobal = updateBackgroundColorsGlobal.bind(this);
    AsyncStorage.getItem('backgroundColors').then((backgroundColors)=>{
      if(JSON.parse(backgroundColors))
        this.setState({backgroundColors:JSON.parse(backgroundColors)})
    })
  }

  getBackgroundColor = (cat) =>{
    if(this.state.backgroundColors)
      if(this.state.backgroundColors[cat])
        return this.state.backgroundColors[cat]
    if(defaultColors[cat])
      return defaultColors[cat]
    return "#FFFFFF"
  }

  LightenDarkenColor = (col, amt) => {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
}

  render(){
    return(
        <SectionList
          ItemSeparatorComponent={({item}) => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>}
          sections={this.props.listOfAssignments}
          renderItem={({item}) => <TouchableOpacity onPress={()=>this.props.navigation.navigate('Assignment',{assignmentData: item})} style={{flexDirection: 'row', justifyContent: 'space-between', /*backgroundColor:this.getBackgroundColor(item["Category"])*/}}>
            <LinearGradient 
              style={{flexDirection: 'row', justifyContent: 'space-between', width:'100%'}} 
              colors={[this.getBackgroundColor(item["Category"]), this.LightenDarkenColor(this.getBackgroundColor(item["Category"]),100)]}
              start = {[0, 0]}
              end = {[.7, 1]}
            >
              <Text style={{
                    flex: 1,
                    padding: 10,
                    fontSize: 18,
                    flexWrap: 'wrap',
                    color:pickTextColorBasedOnBgColorAdvanced(this.getBackgroundColor(item["Category"]))
              }} flex left>{item["Comment"]?<Text style={{textDecorationLine:'underline'}}>{item["Name"]}</Text>:item["Name"]}</Text>
              <Text style={{
                    padding: 10,
                    fontSize: 18,
                    height: 44,
                    fontStyle:"italic",
                    color:pickTextColorBasedOnBgColorAdvanced(this.getBackgroundColor(item["Category"]))
              }} flex>
                <Text style={{color:this.getBackgroundColor(item["Category"])!='#ff1100'?"red":"white",fontSize:15}}>{item["Weighting"]?item["Weighting"] == "RecentlyUpdated"?"Recent ":item["Weighting"]:""}</Text>
                {item["Weighting"]&&item["Weighting"].includes("x")?" - ":""}<Text style={{fontWeight: 'bold'}}>{item["Grade"]}</Text>
              </Text>
            </LinearGradient>
          </TouchableOpacity>}
          renderSectionHeader={({section}) =>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          }
          keyExtractor={(item, index) => index}
        />
    )
  }
}

 class gradeList extends LoadInComponent {
  static navigationOptions = ({ navigation }) => {
    var icon =       <Icon
        name="refresh"
        type = "MaterialIcons"
        onPress={navigation.getParam('refresh')}

      />;
    if(navigation.getParam('loading')){
      icon =<ActivityIndicator/>;
    }
      return {
        title: 'Your Assignments',
        headerStyle: styles.navigationHeader,
      headerRight: (
        <View paddingRight={10}>
          {icon}
        </View>
      ),
      }
  };

  getGradeAndReportError = () =>{
    return this.getGradeWithoutErrorCatching().catch((error) =>{
      Alert.alert("Network Issue!\n Make sure you have a internet connection")
    });
  }

componentDidMount(){
  this.props.navigation.setParams({ refresh: this.getGradeAndReportError.bind(this),});
}

/*

  componentWillMount(){
    AsyncStorage.getItem('username').then((user)=>{
      console.log(user);
      if(user==null){
        this.props.navigation.navigate('SignIn',{refresh: () =>{
            this.componentWillMount();
        }})
      }else{
        this.props.navigation.setParams({ refresh: this.getGrade.bind(this),});
        this._retrieveData()
        this.getGrade()
      }
    })
  }*/

  /*componentDidMount(){
    this.props.navigation.setParams({ refresh: this.getGrade.bind(this)});
    this._retrieveData()
    this.getGrade()
  }*/

	  constructor(props){
	    super(props);
	    this.state ={ isLoading: true}
  }



  render() {
	      if(this.state.isLoading){//padding: 20
	        return(
	          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
	            <ActivityIndicator/>
              <Text style={{padding:20,paddingBottom:50}}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>

              <Button title="Problem?" onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app') }/>
	          </View>
	        )
    	}

	var listOfAssignments = this.state.dataSource


    return (

      <View style={styles.container}>
        <ListOfAssignmentsView navigation={this.props.navigation} listOfAssignments={listOfAssignments}/>
      </View>
    );
  }
/*
  parseJSON(obj){
    var assignments = [];
              for(className in obj){
                if(className!="Status"){
                for(markingPeriod in obj[className]){
                  if(markingPeriod!=null && markingPeriod != "teacher" && markingPeriod != "title"){
                    //console.log(markingPeriod);
                    //console.log(className)
                    //console.log(obj[className][markingPeriod]["Assignments"]);
                    for(var assignment of obj[className][markingPeriod]["Assignments"]){
                      var year = "19";
                      if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>6)
                        year = "18";
                      //assignment["Name"] = (assignment["Date"].split("/")[1]).split("\n")[0];
                      assignment["Timestamp"] = Date.parse(assignment["Date"]+"/"+year);
                      assignments.push(assignment);
                      //console.log(assignment["Date"]+"/"+year);
                    }
                  }
                }
                }
              }
              var arr = assignments;
            /*var i, len = arr.length, el, j;
              for(i = 1; i<len; i++){
                el = arr[i];
                j = i;
                while(j>0 && Date.parse(arr[j-1]["Date"].split("\n")[1])>Date.parse(arr[i]["Date"].split("\n")[1])){
                  arr[j] = arr[j-1];
                  j--;
              }
              arr[j] = el;
              }
              console.log(arr);
              * /
              //console.log(arr);
              arr = arr.sort((a, b) => b["Timestamp"] - a["Timestamp"]);
              //console.log("SORTED\n\n\n\n\n\n");
              //console.log(arr);
            var listOfAssignments =[];
            var lastAssignment;
            var tempList = []
              for(var assignment of arr){
                if(lastAssignment!=null&&lastAssignment["Date"]!=assignment["Date"]){
                  listOfAssignments.push({
                    title: assignment["Date"].replace("\n"," "),
                    data: tempList,
                  });
                  tempList= [];
                }
                console.log("a"+assignment["Grade"]+"b");
                tempList.push(assignment);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]
                lastAssignment = assignment;
              }
              listOfAssignments.push({
                title: assignment["Date"],
                data: tempList,
              });
              return listOfAssignments;
  }*/
}
//container had paddingTop: 22
const styles = StyleSheet.create({
  container: {
   flex: 1,
  },
  sectionHeaderContainer: {
    backgroundColor: '#beeef7',
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight:'bold',
    //textAlign:'center'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  leftContainer: {
    flex: 1,
    padding: 10,
    fontSize: 18,
    //height: 44,
    flexWrap: 'wrap',
    /*flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',*/
  },
  rightContainer: {
    padding: 10,
    fontSize: 18,
    height: 44,
    fontStyle:"italic",
    /*flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    resizeMode: 'contain',*/
    //backgroundColor: 'blue',
    //alignItems: 'center',
  },
  navigationHeader:{
    backgroundColor: '#6fc2d0'
  },
  tabNav: {
    backgroundColor: '#373a6d'
  }
})



class settings extends React.Component {

  constructor(props){
    super(props);
    this.state ={ isLoading: false, email:"", password:"", pushToken:"No Token", id: "loading", }
    Notifications.getExpoPushTokenAsync().then((token)=>{
      this.setState({pushToken:token})
    })
    AsyncStorage.getItem('IDbarcode').then((IDbarcode)=>{
      if(IDbarcode){
        this.setState({idBar: IDbarcode})
      }else{
        AsyncStorage.getItem('username').then((user)=>{
          if(user){
            this.state.id = user;
            fetch('https://gradeview.herokuapp.com/id?id='+user.substring(0,user.indexOf("@")), {
              method: 'GET',
              headers: {
                Accept: 'text/html',
                'Content-Type': 'text/html',
              },
            })
            .then((response) => {
              return response.text();
            }).then((responseTxt) => {
              this.setState({idBar: responseTxt})
              AsyncStorage.setItem('IDbarcode',responseTxt)
            })
          }
        });
      }
    })
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'More',
      headerStyle: styles.navigationHeader,
    }
  }

  
  render() {
          const list = [
            {
              name: 'GPA',
              iconName: 'calculator',
              iconType: 'material-community',
              subtitle: 'View your Grade Point Average',
              action: () => this.props.navigation.navigate('GPA'),
              bottomMargin:5,
            },
            {
              name: 'Global Name Lookup',
              iconName: 'account-search',
              iconType: 'material-community',
              subtitle: 'Search for anyone based on name or ID number',
              action: () => this.props.navigation.navigate('Contacts'),
              bottomMargin:40,
            },
            {
              name: 'Options',
              iconName: 'settings',
              iconType: 'Octicons',
              subtitle: 'View configuration options',
              action: () => this.props.navigation.navigate('Options'),
              bottomMargin:80,
            },
          ]
          const debug =  null// <View style={{flex: 1, flexDirection: 'column', padding:15}}><Text style={{fontSize:20}}>Debugging info:</Text><Text>{this.state.id}</Text><Text style={{marginBottom:20}}>{this.state.pushToken}</Text></View>
      return(
<ScrollView>
  {
    list.map((l, i) => (
      <ListItem
        key={i}
        leftIcon={{ name: l.iconName , type: l.iconType }}
        title={l.name}
        subtitle={l.subtitle}
        onPress={l.action}
        style={{marginBottom:l.bottomMargin}}
        bottomDivider={i!=list.length-1}
        chevron
      />
    ))  
  }
 <View style={{
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Image
      resizeMode={'contain'}
      style={{width: '80%', height: 100, marginTop: 50}}
      source={{uri:this.state.idBar}}
    />
  </View>
  {debug}
</ScrollView>
      )
  }

}



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

  gradeToLetter = (percent) =>{
    if(!Number(percent))
      return "? "
    else if(percent>=97)
      return "A+"
    else if(percent>=93)
      return "A "
    else if(percent>=90)
      return "A-"
    else if(percent>=87)
      return "B+"
    else if(percent>=83)
      return "B "
    else if(percent>=80)
      return "B-"
    else if(percent>=77)
      return "C+"
    else if(percent>=73)
      return "C "
    else if(percent>=70)
      return "C-"
    else if(percent>=67)
      return "D+"
    else if(percent>=63)
      return "D"
    else if(percent>=60)
      return "D-"
    else 
      return "F "
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
    if(Number(avg.substring(0,avg.length-1)))
      avgFrac = Number(avg.substring(0,avg.length-1))/100
    if(avgFrac<.4)
      avgFrac = .4
    fontWeightAvg = 'normal';
    if(this.props.style == "Letter"){
      avg = this.gradeToLetter(avg.substring(0,avg.length-1))
      fontWeightAvg = 'bold'
    }
    if(this.props.style == "Hieroglyphic")
      avg = this.gradeToEmoji(avg.substring(0,avg.length-1))

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
        title={this.props.title}
        titleStyle={{ color: titleColor, fontWeight: 'bold' }}
        subtitleStyle={{ color: titleColor }}
        subtitle={this.props.teach}
        chevron={{ color: avgColor }}
        rightElement = {<Text style={{fontSize:30,textAlign:'right',color:avgColor, fontWeight: fontWeightAvg}}>{avg}</Text>}
        containerStyle = {{ marginLeft: 5,
          marginRight: 5, 
          marginTop: 10, 
          borderRadius: 10, // adds the rounded corners
          backgroundColor: '#fff' }}
      />
    );
  }
}

function updateAvgDisplayGlobal(style){
  AsyncStorage.setItem("avgDisplayStyle",style)
  this.setState({style:style})
}

class home extends LoadInComponent {

  constructor(props){
    super(props);
    console.log("GERNERATING")  
    this.state ={ isLoading: false, email:"", password:"", num: 0, currentMarking: "Select MP", style:"Percent", firstMPSRender:true}

    this.firstMPSRender = false;
    console.log("GERNERATING DONE")
    
    updateAvgDisplayGlobal = updateAvgDisplayGlobal.bind(this)

    AsyncStorage.getItem("avgDisplayStyle").then((style)=>{
      if(style)
        this.setState({style:style})
    })

    this.props.navigation.setParams({ click: this.click, genMpsArray: this.genMpsArray, genMpSelector: this.genMpSelector, updateMarkingPeriodSelectionAndriod: this.updateMarkingPeriodSelectionAndriod});
    

      AsyncStorage.getItem('MPS').then((oldMps)=>{
        console.log("oldMps - constructor")
        oldMps = JSON.parse(oldMps);
        oldMps = oldMps?oldMps:[];
        console.log("old: "+JSON.stringify(oldMps))
          this.setState({oldMps})
        console.log("mps str"+JSON.stringify(mps))
      })
  }

  componentDidMount = () => {
    //SplashScreen.hide()
  }

  static navigationOptions = ({ navigation }) => {
    var text = navigation.getParam('currentMarking','Select a MP');
    //var genMpsArray = navigation.getParam('genMpsArray',()=>{})();

    if(typeof text != "string"){
      text = "Select a MP"
    }

    var androidEl =  <Text>Select a MP</Text>;
    //console.log(this.state.currentMarking)
    if(text != "Select a MP"){
      androidEl =  <Picker 
        selectedValue={text}
        style={{height: 200, width: 100}}
        onValueChange={(itemValue, itemIndex) =>{
          navigation.getParam('updateMarkingPeriodSelectionAndriod',()=>{})(itemValue);
          }
        }>
        {navigation.getParam("genMpSelector",<Text>Select a MP</Text>,)()}
      </Picker>
    }
    const headerEl = Platform.select({
      ios: 
        <View>
          <Button
            onPress = {navigation.getParam('click',()=>{})}
            title = {text}//{navigation.getParam('currentMarking','Select a MP')}//{this.state.currentMarking}//
          />
        </View>,
      android: androidEl   

    });
      return {
        title: 'Home',
        headerStyle: styles.navigationHeader,
        headerRight: (
          headerEl
        ),
      }
  };

  genMpSelector = () =>{
    var pickerArry = [];
    var mps = this.genMpsArray();
    console.log("MPS");
    for(mp of mps){
      pickerArry.push(<Picker.Item label={mp} value={mp} key={mp}/>);
    }
    return pickerArry

  }

  genMpsArray = () => {
    var mps = [];
    for(classN in grades){
      if(classN!="Status"){
      for(marking in grades[classN]){
        //console.log("MARK1: "+marking+"MARK2: "+classN);
        //console.log(grades[classN]);
        if(Number(marking.substring(2))){
          if(!mps.includes(marking))
            mps.push(marking);
        }
      }
      }
    }
    return mps.sort();
  }

  genTable = ()=>{
    var table = []
    var count = 0;
    var mps = this.genMpsArray();
    //console.log(grades)
    var ClassNames = [];
    if(grades)
      ClassNames = Object.keys(grades).sort()
    for(classN of ClassNames){
      var maxMarking=this.state.currentMarking;
      //console.log(maxMarking);
      var avg = "";
      var teach = "";
      if(grades[classN][maxMarking]){
        if(grades[classN][maxMarking]["avg"]){
          // console.log("YEE2T")
          avg = grades[classN][maxMarking]["avg"]
          // console.log(avg);
          
        }
      }
      if(grades[classN]["teacher"])
      teach = grades[classN]["teacher"]
      // console.log(classN);
      if(count!=0){
        //Adds the seperator
        //table.push(<View key={count} style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '90%', backgroundColor: '#C8C8C8', }}/></View>);
        count++;
      }
      // console.log("avg")
      // console.log(avg)
      if(classN!="Status"&&avg){
        table.push(<ClassBtn key={classN+count} title={classN} teach = {teach} avg={avg} onPress={this.classClicked} style={this.state.style}></ClassBtn>)
        count++;
      }
    }
    console.log("DONE");
    return table
  }

  click = () =>{
    //console.log(grades);

    this.setState({
      visibleModal: !this.state.visibleModal,
    });
  }

  classClicked = (className) =>{
    this.props.navigation.navigate('Class',{className:className,markingPeriod:this.state.currentMarking})
  }
  
  updateMarkingPeriodSelectionAndriod = (newMP)=>{
    this.props.navigation.setParams({ currentMarking: newMP});
    this.setState({currentMarking: newMP})
    AsyncStorage.setItem('MP', newMP)
  }

  refresh = () =>{
    this.setState({refreshing: true});
    this.getGradeWithoutErrorCatching().then(()=>{
      this.setState({refreshing: false});
    }).catch((error) =>{
      this.setState({refreshing: false});
      Alert.alert("Network Issue!\n Make sure you have a internet connection")
    });
  }

  render() {
      if(this.state.isLoading)
        return(
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator/>
            <Text style={{padding:20,paddingBottom:50}}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>

            <Button title="Problem?" onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app') }/>
          </View>
        )

        var mps = this.genMpsArray();
      if(this.state.oldMps&&mps&&this.state.oldMps.length<mps.length){
        this.setState({oldMps:mps})
        if(mps.length>0){
          AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
            
            this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
            this.setState({currentMarking: mps[mps.length-1]});
            console.log("RESET")
            //console.log(mps[mps.length-1])  
          })
          AsyncStorage.setItem('MPS',JSON.stringify(mps))
        }
        
      }

      console.log("render - "+ this.state.currentMarking)
      if(this.state.currentMarking == "Select MP")
        AsyncStorage.getItem('MP').then((mp)=>{
          console.log("mp")
          //console.log(mp)
          console.log("new"+mps)
          if(!mp||(mps.length>0&&!mps.includes(mp))){
                console.log("ENFORCED NEW2")
                if(mps.length>0){
                  AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
                    
                    this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
                    this.setState({currentMarking: mps[mps.length-1]});
                    console.log("RESET")
                    //console.log(mps[mps.length-1])  
                  })
                }
              }else{
                this.props.navigation.setParams({ currentMarking: mp});
                this.setState({currentMarking: mp});
              }
          });
      return(
          <ScrollView style={{flex: 1, flexDirection: 'column'}}         refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refresh}
            />
          }>

          <Modal 
          isVisible={this.state.visibleModal}
          isOpen = {this.state.visibleModal}
          style={{
            justifyContent: 'flex-end',
            margin: 0,
          }}
          onRequestClose={() => this.setState({ visibleModal: false })}
          >
                <View style={{backgroundColor: 'white',padding: 22,justifyContent: 'center',alignItems: 'center',borderRadius: 4,borderColor: 'rgba(0, 0, 0, 0.1)',}}>
                  <Picker
                    selectedValue={this.state.currentMarking}
                    style={{height: 200, width: 100}}
                    onValueChange={(itemValue, itemIndex) =>{
                      AsyncStorage.setItem('MP', itemValue).then(()=>{})
                      this.props.navigation.setParams({ currentMarking: itemValue});
                      this.setState({currentMarking: itemValue})
                    }
                    }>
                    {this.genMpSelector()}
                  </Picker>
                  <Button title="Close" onPress={() => {
                      //AsyncStorage.setItem('MP', this.state.currentMarking)
                      //this.props.navigation.setParams({ currentMarking: this.state.currentMarking});
                      this.setState({ visibleModal: false /*, currentMarking: this.state.currentMarking*/});
                  //})
                }
              }/>
                </View>
          </Modal>

          {this.genTable()}


          </ScrollView>
        

      )
  }

}
 
class AssignmentScreen extends React.Component {
  constructor(props){
    super(props);
  }
  
  static navigationOptions = ({ navigation }) => {
    /*return {
      title: navigation.getParam('className',"Class Name"),
    }*/
    return {
      headerStyle: styles.navigationHeader,
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

    if(comment&&comment.length>=2)
      if(comment.substring(0,1) == '"' && comment.substring(comment.length-1,comment.length) == '"'){
        comment = comment.substring(1,comment.length-1)
      }

    return (
      <ScrollView style={{flex:1,padding:15}}>
        <Text adjustsFontSizeToFit numberOfLines={2} style={{fontWeight:"bold", textShadowColor:"grey", textShadowOffset: { width: 0.5, height: 0.5 }, textShadowRadius: 5, fontSize:50, paddingBottom:10}}>{assignment["Name"]?assignment["Name"]:null}</Text>
        <Text style={{fontSize:25, paddingBottom:40}}>{date?date:null}</Text>
        <Text adjustsFontSizeToFit numberOfLines={Platform.OS === 'ios'?1:null} style={{fontSize:25, paddingBottom:10}}>{assignment['className']?assignment['className']:null}</Text>
        <Text style={{fontSize:20, paddingBottom:40}}>{assignment["teacher"]?assignment["teacher"]:null}</Text>
        <Text adjustsFontSizeToFit numberOfLines={1} style={{fontWeight:"bold", textShadowColor:"#ff8246", fontSize:Platform.OS === 'ios'?75:50,textAlign:"right"}}><Text style={{width:"50%"}}>{assignment["Grade"]?assignment["Grade"]:null}</Text> <Text style={{color:"red", width:"50%"}}>{assignment["Weighting"]&&assignment["Weighting"].includes("x")?assignment["Weighting"]:null}</Text></Text>
        <Text style={{paddingTop:20, fontSize:20, textAlign:"right"}}>{assignment["Category"]?""+assignment["Category"]:null}</Text>
        <View style={{marginTop:50,borderRadius:10,backgroundColor:"lightgrey", minHeight:100,padding:5,marginBottom:20}}>
          <Text style={{ fontSize:20}}>{comment?comment:"No Teacher Comment"}</Text>
        </View>
        {/*<LineChart
          style={{marginBottom:20}}
          data={{
            labels: ["F","D-","D","D+","C-","C","C+","B-","B","B+","A-","A","A+"],
            datasets: [
              {
                data: [
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100
                ]
              }
            ]
          }}
          width={Dimensions.get("window").width-40 } // from react-native
          height={220}
          //yAxisLabel={"$"}
          //yAxisSuffix={"k"}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />*/}
      </ScrollView>
    )
  }
}

class ClassScreen extends React.Component {

  constructor(props){
    super(props);
    console.log("GERNERATING")  
    this.state ={ isLoading: false, email:"", password:"", num: 0, currentMarking: "Select MP"}
  }

  static navigationOptions = ({ navigation }) => {
      /*return {
        title: navigation.getParam('className',"Class Name"),
      }*/
      return {
        headerStyle: styles.navigationHeader,
        title: navigation.getParam('className',"Class Name"),
      }
  };

  parseJSON(obj,className,markingPeriod){
    var assignments = [];
    var teacher = obj[className]['teacher']
                    //console.log(markingPeriod);
                    //console.log(className)
                    //console.log(obj[className][markingPeriod]["Assignments"]);
                    for(var assignment of obj[className][markingPeriod]["Assignments"]){
                      assignment['teacher'] = teacher;
                      assignment['className'] = className;

                      var year = "19";
                      if(assignment["Date"].includes("\n")){
                        if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>6)
                          year = "18";
                        //assignment["Name"] = (assignment["Date"].split("/")[1]).split("\n")[0];
                        assignment["Timestamp"] = Date.parse(assignment["Date"]+"/"+year);
                      }else{
                        assignment["Timestamp"] = Date.parse(+"12/12/"+year-2);
                      }
                      assignments.push(assignment);
                      //console.log(assignment["Date"]+"/"+year);
                    }

              var arr = assignments;
            /*var i, len = arr.length, el, j;
              for(i = 1; i<len; i++){
                el = arr[i];
                j = i;
                while(j>0 && Date.parse(arr[j-1]["Date"].split("\n")[1])>Date.parse(arr[i]["Date"].split("\n")[1])){
                  arr[j] = arr[j-1];
                  j--;
              }
              arr[j] = el;
              }
              console.log(arr);
              */
              //console.log(arr);
              arr = arr.sort((a, b) => b["Timestamp"] - a["Timestamp"]);
              //console.log("SORTED\n\n\n\n\n\n");
              //console.log(arr);
            var listOfAssignments =[];
            var lastAssignment;
            var tempList = []
              for(var assignment of arr){
                if(lastAssignment!=null&&lastAssignment["Date"]!=assignment["Date"]){
                  var title = lastAssignment["Date"].replace("\n"," ");
                  if(!title)
                    title = "No date"
                  listOfAssignments.push({
                    title: title,
                    data: tempList,
                  });
                  tempList= [];
                }

                tempList.push(assignment);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]

                lastAssignment = assignment;
              }
              if(assignment){
                var title = assignment["Date"].replace("\n"," ");
                if(!title)
                  title = "No date"
                listOfAssignments.push({
                  title: title,
                  data: tempList,
                });
              }

              //console.log(listOfAssignments)
              return listOfAssignments;
  }

  render() {
    var listOfAssignments = this.parseJSON(grades,this.props.navigation.getParam('className'),this.props.navigation.getParam('markingPeriod'))
    if(listOfAssignments.length==0){
      this.props.navigation.goBack()
      return(<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={{fontSize:20}}>No grades yet</Text></View>)
    }
    
    return (

      <View style={styles.container}>
        <ListOfAssignmentsView navigation={this.props.navigation} listOfAssignments={listOfAssignments}/>
      </View>
    );

  }

}


var options = {
  shouldSort: true,
  tokenize: true,
  threshold: 0.8,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "name",
    "email"
  ]
};

var fuse = new Fuse([], options);
class Contacts extends React.Component {

  constructor(props){
    super(props);
    this.state ={ contacts: [], search: '', result:null}
    AsyncStorage.getItem('contacts').then((contacts)=>{
      if(contacts&&JSON.parse(contacts)){
        let newContacts = JSON.parse(contacts)
        fuse = new Fuse(newContacts, options);
        this.setState({contacts:newContacts});
      }
    })
  }

  componentWillMount = () =>{
    this.getContacts()
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Global Lookup',
      headerStyle: styles.navigationHeader,
      headerRight: (
        <View paddingRight={10}>
          {<Icon onPress={()=>navigation.navigate('ScannedList')} name={"menu"} size={25} type={"MaterialIcons"}/>}
        </View>
      ),
    }
  }

  updateSearch = async => {
    if(this.state.contacts&&this.state.search){
      this.setState({searchLoading:true})
      let result = fuse.search(this.state.search)
      this.setState({result: result,searchLoading:false});
    }
  };

  updateSearchVal = async search => {
    if(!search)
      this.setState({ results: null});
    if(this.state.contacts){
      this.setState({ search: search});
    }
  };

  getContacts = () =>{
    return fetch('https://raw.githubusercontent.com/KihtrakRaknas/DirectoryScraper/master/output.json', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log(typeof response)
        return response.json();
      })
      .then((responseJson) => {
        fuse = new Fuse(responseJson, options);
        AsyncStorage.setItem('contacts',JSON.stringify(responseJson))
        this.setState({contacts:responseJson});
        return responseJson
      })
  }


  render() {
    let list = <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={{fontSize:20}}>Contacts are not current available, connect to the internet and try again</Text></View>
    if(Object.keys(this.state.contacts).length>0){
      arr = this.state.contacts;
      if(this.state.result)//Object.keys(this.state.result).length>0
        arr = this.state.result;
      
      list = <FlatList
        data={arr}
        ListEmptyComponent={<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={{fontSize:20}}>No results</Text></View>}
        keyExtractor={item => item.email}
        //ListHeaderComponent={          }
        ItemSeparatorComponent={({item}) => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>}
        renderItem={({item}) => <NameIDItem item={item}/>}
      />
    }
      return(
        //<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
        <View>
          <SearchBar
            returnKeyType='search'
            placeholder="Search Name/ID #"
            onSubmitEditing={this.updateSearch}
            onChangeText={this.updateSearchVal}
            value={this.state.search}
            lightTheme
            showLoading = {this.state.searchLoading}
            onClear = {()=>{this.setState({search:null,result:null});console.log("kill")}}
          />
          {list}
        </View>
      )
  }

}

class ScannedListScreen extends React.Component {

  constructor(props){
    super(props);
    this.state ={ contacts: [], baseContacts:[], search: '', result:null}

  }

  componentWillMount = () =>{
    this.getContacts()
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      AsyncStorage.getItem('scannedContacts').then((contacts)=>{
        if(contacts&&JSON.parse(contacts)){
          let newContacts = JSON.parse(contacts)
          this.setState({contacts:newContacts});
          AsyncStorage.getItem('contacts').then((baseContacts)=>{
            console.log("Started Getting")
            let newBContacts = [];
            if(baseContacts&&JSON.parse(baseContacts)){
              newBContacts = JSON.parse(baseContacts)
              this.setState({baseContacts:newBContacts});
            }
            console.log("looping")
            for(personIndex in newContacts){
              for(contact of newBContacts){
                if(newContacts[personIndex]["email"] == contact["email"])
                  newContacts[personIndex] = contact
              }
            }
            console.log("done")
            this.setState({contacts:newContacts});
          })
        }
      })
    });
  }

  componentWillUnmount() {
    // Remove the event listener
    this.focusListener.remove();
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Scanned IDs',
      headerStyle: styles.navigationHeader,
      headerRight: (
        <View paddingRight={10}>
          {<Icon onPress={()=>navigation.navigate('Camera')} name={"camera-alt"} size={25} type={"MaterialIcons"}/>}
        </View>
      ),
    }
  }

  getContacts = () =>{
    return fetch('https://raw.githubusercontent.com/KihtrakRaknas/DirectoryScraper/master/output.json', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log(typeof response)
        return response.json();
      })
      .then((responseJson) => {
        fuse = new Fuse(responseJson, options);
        AsyncStorage.setItem('contacts',JSON.stringify(responseJson))
        this.setState({baseContacts:responseJson});
        return responseJson
      })
  }


  render() {
    let list = <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={{fontSize:20}}>Contacts are not current available, connect to the internet and try again</Text></View>
    if(Object.keys(this.state.contacts).length>0){
      arr = this.state.contacts;
      if(this.state.result)//Object.keys(this.state.result).length>0
        arr = this.state.result;
      
      list = <FlatList
        data={arr}
        ListEmptyComponent={<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={{fontSize:20}}>No results</Text></View>}
        keyExtractor={item => item.email}
        //ListHeaderComponent={          }
        ItemSeparatorComponent={({item}) => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>}
        renderItem={({item}) => <NameIDItem item={item}/>}
        ListFooterComponent={this.state.contacts.length>0?<Button title="Clear" onPress={()=>{
          AsyncStorage.setItem('scannedContacts',"[]");
          this.setState({contacts:[]});
       }}/>:null}
      />
    }
      return(
        //<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
        <View>
          {list}
        </View>
      )
  }

}

class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.setState({ scanned: false })
      // The screen is focused
      // Call any action
    });
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    AsyncStorage.getItem('scannedContacts').then((contacts)=>{
      let newC = [];
      if(contacts&&JSON.parse(contacts))
        newC = JSON.parse(contacts);
      newC.push({email:data+"@sbstudents.org"})
      AsyncStorage.setItem('scannedContacts',JSON.stringify(newC)).then((contacts)=>{
        
        this.props.navigation.navigate('ScannedList')
      });
    });
  };
  componentWillUnmount() {
    // Remove the event listener
    this.focusListener.remove();
  }
}


class NameIDItem extends React.Component {
  constructor(props){
    super(props);
    this.state ={ name: this.props.nams, id:""}
  }
  render() {
    let email = this.props.item.email
    if (email.split("@")[1] == "sbstudents.org")
      email = email.split("@")[0]
    let image = this.props.item.image;
    if(image){
      if(image.split("=").length<2)
        image = image.replace('/s36-p-k-rw-no','')
      image = image.split("=")[0]
    }else{
      image = null;
    }
    return (
        <ListItem
          leftAvatar={{ source: { uri: image } }}
          title={this.props.item.name}
          subtitle={email}
        />
    )
  }
}



class GPA extends React.Component {
  constructor(props){
    super(props);
    this.state ={unweightedOldGPA:"Not Available", weightedOldGPA:"Not Available", unweightedNewGPA:"Not Available",weightedNewGPA:"Not Available", unweightedCurrGPA:"Not Available",weightedCurrGPA:"Not Available"}
    AsyncStorage.getItem('weightedOldGPA').then((gpa)=>{
      if(gpa)
        this.setState({weightedOldGPA: gpa})
    });
    AsyncStorage.getItem('unweightedOldGPA').then((gpa)=>{
      if(gpa)
        this.setState({unweightedOldGPA: gpa})
    });
    AsyncStorage.getItem('unweightedNewGPA').then((gpa)=>{
      if(gpa)
        this.setState({unweightedNewGPA: gpa})
    });
    AsyncStorage.getItem('weightedNewGPA').then((gpa)=>{
      if(gpa)
        this.setState({weightedNewGPA: gpa})
    });
    AsyncStorage.getItem('unweightedCurrGPA').then((gpa)=>{
      if(gpa)
        this.setState({unweightedCurrGPA: gpa})
    });
    AsyncStorage.getItem('weightedCurrGPA').then((gpa)=>{
      if(gpa)
        this.setState({weightedCurrGPA: gpa})
    });
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'GPA',
      headerStyle: styles.navigationHeader,
    }
  }

  weightToGPABoost = (weight) =>{
    if(weight.includes("A.P."))
      return 1;
    else if(weight.includes("Honors"))
      return .5;
    else
      return 0;
  };

  letterGradeToGPA = (letter) =>{
    switch(letter.substring(0,2).trim()) {
      case "A+":
        return 4.0
        break;
      case "A":
        return 4.0
        break;
      case "A-":
        return 3.7
        break;
      case "B+":
        return 3.3
        break;
      case "B":
        return 3.0
        break;  
      case "B-":
        return 2.7
        break;
      case "C+":
        return 2.3
        break;
      case "C":
        return 2.0
        break;
      case "C-":
        return 1.7
        break;
      case "D+":
        return 1.3
        break;
      case "D":
        return 1.0
        break;  
      case "D-":
        return 0.7
        break;
      case "F":
        return 0.0
        break;
      default:
        console.log("Unrecognised Letter Grade - " + letter.substring(0,2).trim())
        return "error"
    }
  }

  getOldFGs = async () => {
    this.props.navigation.setParams({loading: true});
    console.log("TEST")
      return fetch('https://gradeview.herokuapp.com/oldGrades', {
      method: 'POST',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: await AsyncStorage.getItem('username'),//"10012734@sbstudents.org",//10012734 //This was left here on purpose. Stop pretending like you "hacked the app"//
        password: await AsyncStorage.getItem('password'),//"Sled%2#9",//Sled%2#9 //
      }),
    })
    .then((response) => {
    //console.log(response);
    //response.json()
    console.log(typeof response)
      return response.json();
    })
    .then((responseJson) => {
      console.log("old")
      //console.log(responseJson)
      return responseJson
    });
  }

  getNewFGs = async () => {
    this.props.navigation.setParams({loading: true});
    console.log("TEST - new FG starting")
      return fetch('https://gradeview.herokuapp.com/newGrades', {
      method: 'POST',
      headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: await AsyncStorage.getItem('username'),//"10012734@sbstudents.org",//10012734 //
        password: await AsyncStorage.getItem('password'),//"Sled%2#9",//Sled%2#9 //
      }),
    })
    .then((response) => {
    //console.log(response);
    //response.json()
    console.log(typeof response)
      return response.json();
    })
    .then((responseJson) => {
      console.log("new")
      if(grades&&responseJson){
        responseJson.map((classObj)=>{
          if(grades[classObj['Name']]){
            for(mpsName in grades[classObj['Name']]){
              if(mpsName.includes("MP") && grades[classObj['Name']][mpsName]['avg']){
                var percent = grades[classObj['Name']][mpsName]['avg']
                percent = percent.substring(0,percent.length-1)
                if(!classObj[mpsName])
                  classObj[mpsName] = this.gradeToLetter(percent);
              }
            }
          }
          return classObj;
        })
      }
      console.log("TEST - new FG ending")
      console.log(responseJson)
      return responseJson
    });
  }

  gradeToLetter = (percent) =>{
    if(!Number(percent))
      return "? "
    else if(percent>=97)
      return "A+"
    else if(percent>=93)
      return "A "
    else if(percent>=90)
      return "A-"
    else if(percent>=87)
      return "B+"
    else if(percent>=83)
      return "B "
    else if(percent>=80)
      return "B-"
    else if(percent>=77)
      return "C+"
    else if(percent>=73)
      return "C "
    else if(percent>=70)
      return "C-"
    else if(percent>=67)
      return "D+"
    else if(percent>=63)
      return "D"
    else if(percent>=60)
      return "D-"
    else 
      return "F "
  }

  componentDidMount = () =>{
    this.getOldFGs().then((FGs)=>{
      var GPA = null;
      for(var year of FGs){
        var yrGPA = 0;
        var totalCredits=0;
        for(var classs of year){
          if(this.letterGradeToGPA(classs["FG"]) == "error")
            continue;
          totalCredits += classs["Credits"];
          yrGPA += this.letterGradeToGPA(classs["FG"])*classs["Credits"];
        }
        yrGPA = yrGPA/totalCredits;
        GPA += yrGPA/FGs.length
      }
      if(GPA){
        this.setState({unweightedOldGPA:GPA.toFixed(2)})
        AsyncStorage.setItem('unweightedOldGPA',GPA.toFixed(2))
      }
        

      var weightedGPA = null;
      var failed = false;
      for(var year of FGs){
        var yrGPA = 0;
        var totalCredits=0;
        for(var classs of year){
          if(this.letterGradeToGPA(classs["FG"]) == "error")
            continue;
          totalCredits += classs["Credits"];
          if(classs["Weight"]){
            yrGPA += (this.letterGradeToGPA(classs["FG"])+this.weightToGPABoost(classs["Weight"]))*classs["Credits"];
          }else{
            failed = true;
            Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
          }
        }
        yrGPA = yrGPA/totalCredits;
        weightedGPA += yrGPA/FGs.length
      }
      if(weightedGPA&&!failed){
        this.setState({weightedOldGPA:weightedGPA.toFixed(2)})
        AsyncStorage.setItem('weightedOldGPA',weightedGPA.toFixed(2));
      }
        

      this.getNewFGs().then((newFGs)=>{
        var newGPA = null;
        for(var year of FGs){
          var yrGPA = 0;
          var totalCredits=0;
          for(var classs of year){
            if(this.letterGradeToGPA(classs["FG"]) == "error")
              continue;
            totalCredits += classs["Credits"];
            yrGPA += this.letterGradeToGPA(classs["FG"])*classs["Credits"];
          }
          yrGPA = yrGPA/totalCredits;
          newGPA += yrGPA/(FGs.length+1)
        }

        var yrGPA = 0;
        var totalCredits=0;
        for(var classs of newFGs){
          let total = 0;
          let totalGPA = 0;
          for(gradePerMP in classs){
            if(gradePerMP.includes("MP")){
              if(this.letterGradeToGPA(classs[gradePerMP]) == "error")
                continue;
              total++;
              totalGPA+=this.letterGradeToGPA(classs[gradePerMP])
            }
          }
          if(total){
            totalCredits += classs["Credits"];
            let classGPA = totalGPA/total
            if(classs["ME"]&&classs["FE"]&&this.letterGradeToGPA(classs["ME"]) != "error"&&this.letterGradeToGPA(classs["FE"]) != "error")
              classGPA = classGPA*.8+this.letterGradeToGPA(classs["ME"])*.1+this.letterGradeToGPA(classs["FE"])*.1
            else if(classs["ME"]&&this.letterGradeToGPA(classs["ME"]) != "error")
              classGPA = classGPA*.9+this.letterGradeToGPA(classs["ME"])*.1
            else if(classs["FE"]&&this.letterGradeToGPA(classs["FE"]) != "error")
              classGPA = classGPA*.9+this.letterGradeToGPA(classs["FE"])*.1
            console.log(classs["Name"]+": "+classGPA)
            yrGPA += classGPA*classs["Credits"];
          }
        }
        yrGPA = yrGPA/totalCredits;
        newGPA += yrGPA/(FGs.length+1)

        if(yrGPA){
          this.setState({unweightedCurrGPA:yrGPA.toFixed(2)})
          AsyncStorage.setItem('unweightedCurrGPA',yrGPA.toFixed(2))
        }

        if(newGPA){
          this.setState({unweightedNewGPA:newGPA.toFixed(2)})
          AsyncStorage.setItem('unweightedNewGPA',newGPA.toFixed(2))
        }
          



          var newWeightedGPA = null;
          var failed = false;
          for(var year of FGs){
            var yrGPA = 0;
            var totalCredits=0;
            for(var classs of year){
              if(this.letterGradeToGPA(classs["FG"]) == "error")
                continue;
              totalCredits += classs["Credits"];
              if(classs["Weight"]){
                yrGPA += (this.letterGradeToGPA(classs["FG"])+this.weightToGPABoost(classs["Weight"]))*classs["Credits"];
              }else{
                failed = true;
                Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
              }
            }
            yrGPA = yrGPA/totalCredits;
            newWeightedGPA += yrGPA/(FGs.length+1)
          }

          var yrGPA = 0;
          var totalCredits=0;
          for(var classs of newFGs){
            let total = 0;
            let totalGPA = 0;
            for(gradePerMP in classs){
              if(gradePerMP.includes("MP")){
                if(this.letterGradeToGPA(classs[gradePerMP]) == "error")
                  continue;
                total++;
                totalGPA+=this.letterGradeToGPA(classs[gradePerMP])
              }
            }
            if(total){
              totalCredits += classs["Credits"];
              let classGPA = totalGPA/total
              if(classs["ME"]&&classs["FE"]&&this.letterGradeToGPA(classs["ME"])!="error"&&this.letterGradeToGPA(classs["FE"])!="error")
                classGPA = classGPA*.8+this.letterGradeToGPA(classs["ME"])*.1+this.letterGradeToGPA(classs["FE"])*.1
              else if(classs["ME"]&&this.letterGradeToGPA(classs["ME"])!="error")
                classGPA = classGPA*.9+this.letterGradeToGPA(classs["ME"])*.1
              else if(classs["FE"]&&this.letterGradeToGPA(classs["FE"])!="error")
                classGPA = classGPA*.9+this.letterGradeToGPA(classs["FE"])*.1
              
              if(classs["Weight"]){
                yrGPA += (classGPA+this.weightToGPABoost(classs["Weight"]))*classs["Credits"];
              }else{
                failed = true;
                Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
              }
            }
          }
          yrGPA = yrGPA/totalCredits;
          newWeightedGPA += yrGPA/(FGs.length+1)

          if(yrGPA&&!failed){
            this.setState({weightedCurrGPA:yrGPA.toFixed(2)})
            AsyncStorage.setItem('weightedCurrGPA',yrGPA.toFixed(2))
          }

          if(newWeightedGPA&&!failed){
            this.setState({weightedNewGPA:newWeightedGPA.toFixed(2)})
            AsyncStorage.setItem('weightedNewGPA',newWeightedGPA.toFixed(2))
          }
            
      });
    })
  }


  render() {
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column', padding:10}}>
      <ListItem  
        title={<Text style={{fontSize:40,textAlign: 'center'}}>Past GPA</Text>}
        subtitle={"GPA without factoring in the current year"}
        subtitleProps={{style:{fontSize:17}}}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.unweightedOldGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Unweighted:</Text>}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.weightedOldGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Weighted:</Text>}
        bottomDivider={true}
      />
      <ListItem  
        topDivider={true}
        title={<Text style={{fontSize:40,textAlign: 'center'}}>This Year</Text>}
        subtitle={"GPA only for this year (estimate)"}
        subtitleProps={{style:{fontSize:17}}}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.unweightedCurrGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Unweighted:</Text>}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.weightedCurrGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Weighted:</Text>}
        bottomDivider={true}
      />
      <ListItem  
        title={<Text style={{fontSize:40,textAlign: 'center'}}>Total GPA estimate</Text>}
        subtitle={"GPA so far (estimate)"}
        topDivider={true}
        subtitleProps={{style:{fontSize:17}}}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.unweightedNewGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Unweighted:</Text>}
      />
      <ListItem  
        rightElement={<Text style={{fontSize:20}}>{this.state.weightedNewGPA}</Text>}
        leftElement={<Text style={{fontSize:20}}>Weighted:</Text>}
      />
        </ScrollView>
      )
  }

}

class Options extends React.Component {
  constructor(props){
    super(props);
    this.state ={selectedIndex:0, token:"null"}

    Notifications.getExpoPushTokenAsync().then((token)=>{
      if(token.includes("ExponentPushToken"))
      token = token.substring(17)
      this.setState({token})
    })

    AsyncStorage.getItem('needBiometric').then((needBiometric)=>{
      var needBiometricR = false;
      if(needBiometric === 'true')
        needBiometricR = true;
      LocalAuthentication.isEnrolledAsync().then((isEnrolled)=>{
          if(isEnrolled)
            this.setState({needBiometric:needBiometricR});
      })
    });
    const displayOptions = ['Percent', 'Letter', 'Hieroglyphic']
    AsyncStorage.getItem('avgDisplayStyle').then((avgDisplayStyle)=>{
      if(avgDisplayStyle){
        this.setState({selectedIndex:displayOptions.indexOf(avgDisplayStyle)});
      }
    });
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Options',
      headerStyle: styles.navigationHeader,
    }
  }

  signOut = ()=>{
    
    AsyncStorage.getItem('username').then((user)=>{
      AsyncStorage.getItem('password').then((pass)=>{
        AsyncStorage.getItem('backgroundColors').then((backgroundColors)=>{
          AsyncStorage.clear().then(()=>{
            AsyncStorage.setItem('oldUsername',user).then(()=>{
              AsyncStorage.setItem('oldPassword',pass).then(()=>{
                backgroundColors = backgroundColors?backgroundColors:JSON.stringify({})
                AsyncStorage.setItem('oldBackgroundColors',backgroundColors).then(()=>{
                  signOutGlobal();
                });
              });
            });
          })
        });
      });
    });
  }

  render() {
    var switchEl = <Text>Not Available</Text>
    //if()
          //switchEl = 

          //updateAvgDisplayGlobal
          const displayOptions = ['Percent', 'Letter', 'Hieroglyphic']
return(
<ScrollView>
<ListItem  
  leftIcon={{ name: "fingerprint" , type: 'material-community' }}
  title="Secure Biometrics"
  subtitle={"Secure your grades with by requiring biometrics on app load"}
  style={{marginBottom:5}}
  bottomDivider={true}
  switch = {{
    onValueChange:()=>{ var val = !this.state.needBiometric; AsyncStorage.setItem('needBiometric',val.toString()).then((result)=>{this.setState({needBiometric: val});})},
   value:this.state.needBiometric,
   disabled: this.state.needBiometric == null
  }}
/>
<ListItem  
  leftIcon={{ name: "color-lens" , type: 'MaterialIcons' }}
  chevron
  title="Assignment Styling"
  subtitle={"Color-code different assignment types"}
  onPress={()=>this.props.navigation.navigate('ColorPick')}
  bottomDivider={true}
/>
<ListItem  
  leftIcon={{ name: "eye" , type: 'font-awesome' }}
  title="Display mode"
  subtitle={"How your marking period grade will be displayed on the home screen"}
/>

<ButtonGroup
    onPress={(selectedIndex)=>{this.setState({selectedIndex:selectedIndex});updateAvgDisplayGlobal(displayOptions[selectedIndex])}}
    selectedIndex={this.state.selectedIndex}
    buttons={displayOptions}
    //containerStyle={{height: 100}}
  />

<ListItem  
  leftIcon={{ name: "feedback" , type: 'MaterialIcons' }}
  title="Provide Feedback"
  subtitle={"Any kind of feedbacks is appricated!"}
  style={{marginTop:60,marginBottom:5}}
  topDivider={true}
  onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app') }
/>
<ListItem  
  leftIcon={{ name: "log-out" , type: 'entypo' }}
  title="Switch User"
  subtitle={"Sign into a different account"}
  style={{marginBottom:20}}
  topDivider={true}
  onPress = {this.signOut}
/>
<ListItem  
  title="Debug info"
  subtitle={this.state.token}
  topDivider={true}
/>
</ScrollView>
    /*
    
          
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column', padding:10}}>

          <Text style={{fontSize:20}}>Secure biometrics: {switchEl}</Text>


          <Button 
          
          title="Provide Feedback" 
          />


          <Button
          onPress = {this.signOut}
          title = "Switch Accounts"
          />
        */
      )
  }

}

class ColorPickScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={ selectedColor:'#C0392B', selectedCategory:null}
    AsyncStorage.getItem('backgroundColors').then((backgroundColors)=>{
      if(JSON.parse(backgroundColors))
        backgroundColors = JSON.parse(backgroundColors)
      else
        backgroundColors = {}
      this.setState({backgroundColors})
    })
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Assignment Styling',
      headerStyle: styles.navigationHeader,
    }
  }

  setColor = (color,item) =>{
    var newBackgroundColors = this.state.backgroundColors
    newBackgroundColors[item] = color
    this.setState({backgroundColors:newBackgroundColors})
    AsyncStorage.getItem('backgroundColors').then((backgroundColors)=>{
      if(JSON.parse(backgroundColors))
        backgroundColors = JSON.parse(backgroundColors)
      else
        backgroundColors = {}
      backgroundColors[item] = color;
      AsyncStorage.setItem('backgroundColors',JSON.stringify(backgroundColors)).then(()=>{
        updateBackgroundColorsGlobal(backgroundColors)
      })
    })
  }

  render(){
    var items = [];
    categories.forEach((item)=>{
      items.push(<ListItem
        title={item}
        onPress={()=>{
          AsyncStorage.getItem('backgroundColors').then((backgroundColors)=>{
            console.log(backgroundColors)
          })
          LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
          this.setState({selectedCategory:item})
        }}
        rightElement={<View style={{
          width: 50,
          height: 50,
          borderRadius: 50/2,
          borderWidth: this.state.backgroundColors&&this.state.backgroundColors[item]=='#FFFFFF'?1:defaultColors[item]=='#FFFFFF'?1:0,
          backgroundColor: this.state.backgroundColors&&this.state.backgroundColors[item]?this.state.backgroundColors[item]:defaultColors[item]?defaultColors[item]:'#FFFFFF'
        }}></View>}
        bottomDivider={true}
      />)
        items.push(
          <View style={{backgroundColor:"#F0F0F0"}}>{this.state.selectedCategory == item && <ColorPalette
            onChange={color =>{
              this.setColor(color,item)
            } }
            value={this.state.backgroundColors[item]?this.state.backgroundColors[item]:defaultColors[item]?defaultColors[item]:'#FFFFFF'}
            colors={colorsToPickFrom}
            title={""}
            icon={
              <Text style={{color: pickTextColorBasedOnBgColorAdvanced(this.state.backgroundColors[item]?this.state.backgroundColors[item]:defaultColors[item]?defaultColors[item]:'#FFFFFF')}}>✓</Text>
            }
          />}</View>)
          return item;
        })
    return(
      <ScrollView >
        {items}
        <ListItem
          title="Reset"
          onPress={()=>{
            this.setState({backgroundColors:defaultColors})
            AsyncStorage.setItem('backgroundColors',JSON.stringify(defaultColors)).then(()=>{
              updateBackgroundColorsGlobal(defaultColors)
            })
          }}
          subtitle="Reset the assignment stylings back to thier default colors"
        />
      </ScrollView>
    )
  }
}



const HomeStack = createStackNavigator({
  Home: { screen: home},
  Class:{ screen: ClassScreen},
  Assignment: {screen: AssignmentScreen}
});

const AssignmentsStack = createStackNavigator({
  Assignments: { screen: gradeList },
  Assignment: {screen: AssignmentScreen}
});

const SettingsStack = createStackNavigator({
  Settings: { screen: settings },
  Options: {screen: Options},
  Contacts: {screen: Contacts},
  GPA: {screen: GPA},
  ColorPick: {screen: ColorPickScreen},
  ScannedList: {screen: ScannedListScreen},
  Camera: {screen: CameraScreen}
});

const TabNav = createBottomTabNavigator(
  {
    Home: { screen:  HomeStack},
    Assignments: { screen:  AssignmentsStack},
     
    More: { screen:  SettingsStack},
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName = "list_alt";
        let type = "material"
        if (routeName === 'Home') {
          type="FontAwesome5"
          iconName = "home"//`${focused ? 'infocirlce' : 'infocirlceo'}`;
        } else if (routeName === 'Assignments') {
          if(focused){
            type = "ionicon";
            iconName = 'ios-list-box'
          }else{
            iconName = 'view-headline'
          }

          //iconName = `${focused ? 'ios-list-box' : 'view-headline'}`; // assignment
        } else if (routeName === 'More') {
          iconName = `more-horiz`;
          type = 'MaterialIcons';
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} type={type}/>;//<Ionicons name="md-checkmark-circle" size={32} color="green" />//
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: '#ff8246',
      inactiveTintColor: 'white',
      style: styles.tabNav,
    },
    animationEnabled: false,
    swipeEnabled: false,
  }
)


class SignIn extends React.Component {

	  constructor(props){
      super(props);
      this.state ={ isLoading: false, email:"", password:"",}

    }

    componentDidMount = () =>{
      //SplashScreen.hide()
    }

    componentWillMount = () =>{
      AsyncStorage.getItem('oldUsername').then((user)=>{
        if(user){
          this.setState({OldAccount:true})
        }else{
          this.setState({OldAccount:false})
        }
      })
    }

    verify = () =>{
      var email = this.state.email;
      var pass = this.state.password;
      if(!(email&&pass)){
        Alert.alert("Enter an ID number and password");
        return 0;
      }
      email = email+"@sbstudents.org";
      this.verifyWithParams(email,pass)
    }

    verifyUsingOldCredentials = () =>{
      AsyncStorage.getItem('oldUsername').then((user)=>{
        AsyncStorage.getItem('oldPassword').then((pass)=>{
          this.verifyWithParams(user,pass)
          AsyncStorage.getItem('oldBackgroundColors').then((backgroundColor)=>{
            if(backgroundColor)
              AsyncStorage.setItem('backgroundColors',backgroundColor)
            //updateBackgroundColorsGlobal(JSON.parse(backgroundColor))
          })
        })
      })
    }

    verifyWithParams = (email, pass) =>{
      if(!(email&&pass)){
        Alert.alert("Enter an ID number and password");
        return 0;
      }
      //email = email+"@sbstudents.org"; Done in verify function
      this.setState({
        isLoading: true,
      });
      //Alert.alert(this.state.email+":"+this.state.password);
      return fetch('https://gradeview.herokuapp.com/check', {
        method: 'POST',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,//10012734 //await AsyncStorage.getItem('username')
          password: pass,//Sled%2#9 //await AsyncStorage.getItem('password')
        }),
      })
			.then((response) => {
		    console.log(typeof response)
			  return response.json();
	  	})
			.then((responseJson) => {
        //console.log(responseJson);
        if(responseJson['valid']==true){
          AsyncStorage.setItem('username', email).then(()=>{
            AsyncStorage.setItem('password', pass).then(()=>{
              signInGlobal();
            });
          });

        }else{
          Alert.alert("Invalid username - password combination!");
        }
        this.setState({
          isLoading: false,
        });
      }).catch((error) => {
        Alert.alert("Network Issue! Make sure you have a internet connection")
        console.log(error);
        this.setState({
          isLoading: false,
        });
      });
    }

    onChangeText = (key, val) => {
      this.setState({ [key]: val})
    }

    render() {
      var cancelBtn = null;
      if(this.state.OldAccount)
        cancelBtn = <Button title="Cancel (Go back to your account)" color="#ff5c5c" onPress={this.verifyUsingOldCredentials}/>
      var btnText = <Text style={{fontSize: 30,fontWeight: '400',color: "#fff",}}>Sign In</Text>
      if(this.state.isLoading){
        btnText = <ActivityIndicator size="large" color="#ffffff"/>;

        //padding: 20
        // return(
        //   <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#f3f9fb" }}>

        //       <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
        //       <Icon
        //         name='email'
        //         type='MaterialCommunityIcons'
        //         size={30}
        //       />
        //       <Text
        //         style={{flex: 1,fontSize: 30,paddingHorizontal: 8,color:"#ededed"}}>{this.state.email}</Text>


        //     </View>
        //   <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
        //       <Icon
        //         name='lock'
        //         type='FontAwesome5'
        //         size={30}
        //       />
        //       <Text
        //         style={{flex: 1,fontSize: 30,paddingHorizontal: 8,color:"#ededed"}}
        //         >verifying credentials</Text>

        //     </View>

        //     <TouchableOpacity
        //       style={{
        //         backgroundColor: "#113f67",
        //         paddingHorizontal: 15,
        //         paddingVertical: 15,
        //         borderRadius: 15,
        //         width:"80%",alignItems: 'center',
        //         marginVertical: 30,}}

        //     >
        //       <ActivityIndicator size="large" color="#ffffff"/>
        //     </TouchableOpacity>

        // </KeyboardAvoidingView>
        // )
        }

        return(
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#373a6d" }}>
              
              <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:20,borderRadius: 5,paddingHorizontal: 14,paddingVertical: 10,marginVertical: 15,}}>
              <FontAwesome
                name='id-badge'
                size={30}
                color="#373a6d"
              />
              <TextInput
                editable={!this.state.isLoading}
                style={{flex: 1,fontSize: 20,paddingHorizontal: 11}}
                keyboardType={'number-pad'}
                  autoCorrect={false}
                  placeholder="ID number"
                  onChangeText={val => this.onChangeText('email', val)}
                />

            </View>
          <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:20,borderRadius: 5,paddingHorizontal: 10,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='lock'
                type='FontAwesome5'
                size={30}
                color="#373a6d"
              />
              <TextInput
                editable={!this.state.isLoading}
                style={{flex: 1,fontSize: 20,paddingHorizontal: 8}}
                  autoCorrect={false}
                  secureTextEntry
                  placeholder="Password"
                  onChangeText={val => this.onChangeText('password', val)}
                  onSubmitEditing={this.verify}
                />

            </View>
            <TouchableOpacity
              disabled={this.state.isLoading}
              style={{
                backgroundColor: "#6fc2d0",
                paddingHorizontal: 15,
                paddingVertical: 15,
                borderRadius: 15,
                width:"80%",alignItems: 'center',
                marginVertical: 30,
              }}
              onPress={this.verify}

            >
              {btnText}
            </TouchableOpacity>

            {cancelBtn}

            <View>
                <Text style={{fontSize: 10,padding:10,color:"white"}}>Note: Your password will be encrypted and stored on our servers so we can get your grades for you</Text>
                <Text style={{fontSize: 10,padding:10,color:"white"}}>This app is not affliated with any school. It was created by a student.</Text>
              </View>
        </KeyboardAvoidingView>
        )
    }

  }

  function signOutGlobal() {
    this.setState({ user: null });
  }
  function signInGlobal() {
    AsyncStorage.getItem('username').then((user)=>{
      console.log(user);
      this.setState({user:user})
    });
  }

  function updateBackgroundColorsGlobal(backgroundColors){
        this.setState({backgroundColors})
  }


  function pickTextColorBasedOnBgColorAdvanced(bgColor){
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? '#000000' : '#FFFFFF';
  }

 
  const AppContainer = createAppContainer(TabNav)
  export default class App extends React.Component {
    constructor(){
      super();
      SplashScreen.preventAutoHide();
      signOutGlobal = signOutGlobal.bind(this);
      signInGlobal = signInGlobal.bind(this);
      this.state = {user:8,debug:false,pass:[],txt: "Unfortunately, the district's IT division has decided that this app must be shutdown. I have not been informed of any rules or policies that were violated, but nonetheless, I was instructed to pour 2 long months' worth of work down the drain..."};
      this.returningUser();
      /*AsyncStorage.getItem('debug').then((debug)=>{
        if(debug=="true")
        this.returningUser();
      })
      setTimeout(()=>{this.setState({txt: ""})},15000);
      setTimeout(()=>{this.setState({txt: "Unfortunately, the district's IT division has decided that students must use the Genesis online site, despite it being absolute garbage. I have not been informed of any rules or policies that were violated, but nonetheless, I was told to take the app down."})},16000);*/
    }

    returningUser = () =>{
      this.setState({debug:false})
      AsyncStorage.setItem("debug","true")
      AsyncStorage.getItem('username').then((user)=>{
        console.log(user);
        AsyncStorage.getItem('needBiometric').then((needBiometric)=>{
          if(needBiometric === 'true')
            LocalAuthentication.isEnrolledAsync().then((valid)=>{
              if(valid)
                LocalAuthentication.authenticateAsync("Authenticate to view grades").then((result)=>{
                  if(result["success"])
                    this.setState({user:user})
                  else  
                  this.setState({user:8})
                }) 
              else
                this.setState({user:user})
            })
          else 
            this.setState({user:user})
        })
        
      });
    }
    componentDidMount(){
      this._subscribe();
      this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    componentWillUnmount() {
      this._unsubscribe();
    }

    
    _subscribe = () => {
      this._subscription = Accelerometer.addListener(
        accelerometerData => {
          let magnitude = Math.pow(  Math.pow(accelerometerData.x, 2) + Math.pow(accelerometerData.y, 2) + Math.pow(accelerometerData.z, 2)  ,.5)
  
          if(Math.abs(magnitude-1)>5 &&this.state.user == 9)
            this.setState({debug:true})
        }
      ); 
      Accelerometer.setUpdateInterval(
        16
      ); 
    };
  
    _unsubscribe = () => {
      this._subscription && this._subscription.remove(); 
      this._subscription = null;
    };

    _handleNotification = (notification) => {
      console.log(notification)
      console.log(this.refs)
      if(notification.data.txt)
        if(this.refs.toast)
         this.refs.toast.show(notification.data.txt);
    };

    colorClicked = async (color) =>{
      
      switch(color){
        case 0:
          var arr = this.state.pass;
          arr.push(0)
          this.setState({pass:arr})
          let notification2 = await Notifications.getExpoPushTokenAsync();
          this.refs.toast.show("Token: "+notification2);
        break;
        case 1:
          AsyncStorage.getItem("username").then((user)=>{
            this.refs.toast.show((!!user).toString());
          })
          var arr = this.state.pass;
          arr.push(1)
          this.setState({pass:arr})
        break;
        case 2:
          this.refs.toast.show("Toast Test");
          var arr = this.state.pass;
          arr.push(2)
          this.setState({pass:arr})
        break;
        default:
          this.refs.toast.show("Reset");
          this.setState({pass:[]})
      }
      const passArr = [1,1,2,3,5,8]
      console.log(this.state.pass)
      if(this.state.pass.length==6){
        var current = true
        for(index in this.state.pass){
          if(this.state.pass[index] != passArr[index]%3)
            current = false
        }
        if(current){
          this.returningUser() 
        }
          
      }
    }

    onChangeText = (val) =>{
      this.setState({emailForUpdate:val})
    }

    subEmail = () =>{
      this.setState({emailIsLoading:true})
      this.state.emailForUpdate
      if(this.state.emailForUpdate&&this.validateEmail(this.state.emailForUpdate)){
        fetch('https://gradeview.herokuapp.com/emailList', {
          method: 'POST',
          headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.state.emailForUpdate
          }),
        })
        .then((response) => {
          console.log(typeof response)
          return response.json();
        })
        .then((responseJson) => {
          Alert.alert("Recorded. We will notify you of updates.")
          console.log(responseJson)
          this.setState({emailIsLoading:false})
        }).catch((error) => {
          Alert.alert("Network Issue! Make sure you have a internet connection")
          console.log(error);
          this.setState({emailIsLoading:false})
        });
      }else{
        Alert.alert("Invalid Email!")
        this.setState({emailIsLoading:false})
      }
    }

    validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    render(){
      //<Text>{this.state.pass}</Text>
      if(this.state.debug)
        return <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Toast ref="toast"/><Text>Debuging tools</Text>      
          <View style={{flexDirection: 'row', marginTop:20}}>
              <TouchableOpacity onPress={() => this.colorClicked(0) } style={{width: 50, height: 50, backgroundColor: 'powderblue'}} />
              <TouchableOpacity onPress={() => this.colorClicked(1) } style={{width: 50, height: 50, backgroundColor: 'skyblue'}} />
              <TouchableOpacity onPress={() => this.colorClicked(2) } style={{width: 50, height: 50, backgroundColor: 'steelblue'}} />
              <TouchableOpacity onPress={() => this.colorClicked(-1) } style={{width: 50, height: 50, backgroundColor: 'red'}} />
          </View>
          
        </View>;
      let btnText = <Text>Submit</Text>;
      if(this.state.emailIsLoading)
        btnText = <ActivityIndicator/>;
      if(this.state.user == 9)
        return (<KeyboardAvoidingView behavior="position" style={{flex:1,justifyContent: 'center',alignItems: 'center',padding:20,alignItems: 'center',}}>
          <Text style={{fontSize:40,marginBottom:10}}>Until further notice</Text>
          <Text style={{fontSize:25,marginBottom:20}}>GradeView will not be usable</Text>
          <Text style={{fontSize:20}}>{this.state.txt}</Text>
          <Text style={{fontSize:20,marginTop:10}}>If you would like to be notified about updates with the app (i.e. the app is usable again) please enter an email that you check here:</Text>
            <View style={{flexDirection: 'row',backgroundColor: "#EEEEEE",margin:5,borderRadius: 5,paddingHorizontal: 14,paddingVertical: 10,marginVertical: 15,}}>
              <FontAwesome
                name='envelope'
                size={30}
                color="#373a6d"
              />
              <TextInput
                editable={!this.state.emailIsLoading}
                style={{flex: 1,fontSize: 20,paddingHorizontal: 11}}
                keyboardType={'email-address'}
                  autoCorrect={false}
                  placeholder="Email that you check"
                  onChangeText={val => this.onChangeText(val)}
                  onSubmitEditing={this.subEmail}
                />
            </View>
            <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
                disabled={this.state.emailIsLoading}
                style={{
                  backgroundColor: "#6fc2d0",
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 15,
                  width:"80%",alignItems: 'center',
                  marginVertical: 5,
                  marginHorizontal: 5,
                  flex:1
                }}
                onPress={this.subEmail}
              >{btnText}</TouchableOpacity>
            </View>
        </KeyboardAvoidingView>);
      else
        setTimeout(()=>SplashScreen.hide(),10)
      if(this.state.user == 8)
        return <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text>Please Authenticate</Text><Button title="Authenticate Again" onPress={this.returningUser}></Button></View>;
      if(this.state.user){
        console.log("tab nav");
        return <View style={{flex:1}}><StatusBar barStyle="dark-content" /><Toast ref="toast"/><AppContainer/></View>;
      } 
      return <SignIn/>;
    } 
  }
