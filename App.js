import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert, Button, TouchableOpacity,TextInput ,KeyboardAvoidingView , ScrollView, Picker,StatusBar,RefreshControl, Switch, FlatList, AppState} from 'react-native';
import { Ionicons ,FontAwesome  } from '@expo/vector-icons';
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon, Input ,ButtonGroup } from 'react-native-elements'
import {AsyncStorage} from 'react-native';
import DropdownMenu from 'react-native-dropdown-menu';
import Modal from 'react-native-modal';
//import gradeList from './gradeList.js'
require('create-react-class');
import { Permissions, Notifications } from 'expo';
import {Linking, Platform} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast';
import { LocalAuthentication } from 'expo';
import { SearchBar, ListItem } from 'react-native-elements';
import {SplashScreen } from 'expo';
import Fuse from 'fuse.js';
var grades;

class LoadInComponent extends React.Component {
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
          this.props.navigation.setParams({ loading: false })
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

			})
			.catch((error) =>{
				console.error(error);
			});
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

componentDidMount(){
  this.props.navigation.setParams({ refresh: this.getGrade.bind(this),});
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
              <Text style={{padding:20}}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>
	          </View>
	        )
    	}

	var listOfAssignments = this.state.dataSource


    return (

      <View style={styles.container}>
        <SectionList
          ItemSeparatorComponent={({item}) => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>}
          sections={listOfAssignments}
          renderItem={({item}) => <View style={{flexDirection: 'row',
          justifyContent: 'space-between'}}>
            <Text style={styles.leftContainer} flex left>{item["Name"]}</Text>
            <Text style={styles.rightContainer} flex>{item["Grade"]}</Text>
            </View>}
          renderSectionHeader={({section}) =>     <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>{section.title}</Text></View>}
          keyExtractor={(item, index) => index}
        />
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
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  leftContainer: {
    padding: 10,
    fontSize: 18,
    height: 44,
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
    AsyncStorage.getItem('username').then((user)=>{
      if(user)
        this.state.id = user;
    });
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
      />
    ))
    
  }
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
    if(this.props.style == "Letter")
      avg = this.gradeToLetter(avg.substring(0,avg.length-1))
    if(this.props.style == "Hieroglyphic")
      avg = this.gradeToEmoji(avg.substring(0,avg.length-1))
    return (
      <TouchableOpacity onPress={() => this.classClicked(this.props.title)} style={{flex: 1, flexDirection: 'row',justifyContent: 'space-between', padding:10,paddingVertical:10}}>
        <View style={{flex: 7, }}>
          <Text style={{fontSize:20, }}>{this.props.title}</Text>
          <Text style={{fontSize:15}}>{this.props.teach}</Text>
        </View>

        <View style={{flex: 2,}}>
          <Text style={{fontSize:30,textAlign:'right'}}>{avg}</Text>
        </View>
      </TouchableOpacity>
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
    this.state ={ isLoading: false, email:"", password:"", num: 0, currentMarking: "Select MP", style:"Percent"}

    console.log("GERNERATING DONE")
    
    updateAvgDisplayGlobal = updateAvgDisplayGlobal.bind(this)

    AsyncStorage.getItem("avgDisplayStyle").then((style)=>{
      if(style)
        this.setState({style:style})
    })

    this.props.navigation.setParams({ click: this.click, genMpsArray: this.genMpsArray, genMpSelector: this.genMpSelector, updateMarkingPeriodSelectionAndriod: this.updateMarkingPeriodSelectionAndriod});
  }

  componentDidMount = () => {
    //SplashScreen.hide()
  }

  static navigationOptions = ({ navigation }) => {
    console.log("TEXT: "+navigation.getParam('currentMarking','Select a MP'))
    console.log(navigation.getParam('currentMarking','Select a MP'))
    var text = navigation.getParam('currentMarking','Select a MP');
    //var genMpsArray = navigation.getParam('genMpsArray',()=>{})();

    console.log(typeof text)
    if(typeof text != "string"){
      text = "Select a MP"
    }
    console.log("TEXTt: "+text)

    var androidEl =  <Text>Select a MP</Text>;
    console.log('test')
    //console.log(this.state.currentMarking)
    console.log('te3st')
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
    console.log('te4st')
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
    console.log("header done")
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
        table.push(<View key={count} style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '90%', backgroundColor: '#C8C8C8', }}/></View>);
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
    this.getGrade().then(()=>{
      this.setState({refreshing: false});
    })
  }

  render() {
      if(this.state.isLoading)
        return(
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator/>
            <Text style={{padding:20}}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>
          </View>
        )

        if(this.state.currentMarking == "Select MP")
        AsyncStorage.getItem('MP').then((mp)=>{
          console.log("mp")
          //console.log(mp)
          if(!mp){
            var mps = this.genMpsArray();
            //console.log(mps)
            if(mps.length>0){
              AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
                
                this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
                this.setState({currentMarking: mps[mps.length-1]});
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
        <Modal isVisible={this.state.visibleModal}
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
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({currentMarking: itemValue})
                  }>
                  {this.genMpSelector()}
                </Picker>
                <Button title="Set Marking Period" onPress={() => {
                  AsyncStorage.setItem('MP', this.state.currentMarking)//.then(()=>{
                    this.props.navigation.setParams({ currentMarking: this.state.currentMarking});
                    this.setState({ visibleModal: false , currentMarking: this.state.currentMarking});
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

                    //console.log(markingPeriod);
                    //console.log(className)
                    //console.log(obj[className][markingPeriod]["Assignments"]);
                    for(var assignment of obj[className][markingPeriod]["Assignments"]){
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
              var title = assignment["Date"].replace("\n"," ");
              if(!title)
                title = "No date"
              listOfAssignments.push({
                title: title,
                data: tempList,
              });

              return listOfAssignments;
  }

  render() {
    var listOfAssignments = this.parseJSON(grades,this.props.navigation.getParam('className'),this.props.navigation.getParam('markingPeriod'))
    return (

      <View style={styles.container}>
        <SectionList
          ItemSeparatorComponent={({item}) => <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>}
          sections={listOfAssignments}
          renderItem={({item}) => <View style={{flexDirection: 'row',
          justifyContent: 'space-between'}}>
            <Text style={styles.leftContainer} flex left>{item["Name"]}</Text>
            <Text style={styles.rightContainer} flex>{item["Grade"]}</Text>
            </View>}
          renderSectionHeader={({section}) =>     <View style={styles.sectionHeaderContainer}><Text style={styles.sectionHeaderText}>{section.title}</Text></View>}
          keyExtractor={(item, index) => index}
        />
      </View>
    );

  }

}


var options = {
  shouldSort: true,
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
    if(image.split("=").length<2)
      image = image.replace('/s36-p-k-rw-no','')
    image = image.split("=")[0]
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
        console.log("Unrecognised Letter Grade")
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
      console.log("old")
      //console.log(responseJson)
      return responseJson
    });
  }

  getNewFGs = async () => {
    this.props.navigation.setParams({loading: true});
    console.log("TEST")
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
      return responseJson
    });
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
          totalCredits += classs["Credits"];
          
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
            let classGPA = totalGPA/total
            if(classs["ME"]&&classs["FE"]&&this.letterGradeToGPA(classs["ME"]) != "error"&&this.letterGradeToGPA(classs["FE"]) != "error")
              classGPA = classGPA*.8+this.letterGradeToGPA(classs["ME"])*.1+this.letterGradeToGPA(classs["FE"])*.1
            else if(classs["ME"]&&this.letterGradeToGPA(classs["ME"]) != "error")
              classGPA = classGPA*.9+this.letterGradeToGPA(classs["ME"])*.1
            else if(classs["FE"]&&this.letterGradeToGPA(classs["FE"]) != "error")
              classGPA = classGPA*.9+this.letterGradeToGPA(classs["FE"])*.1
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
            totalCredits += classs["Credits"];
            
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
          <Text style={{fontSize:40}}>Total GPA</Text>
          <Text style={{fontSize:10}}>(Does not include current year)</Text>
          <Text style={{fontSize:20}}>Unweighted: {this.state.unweightedOldGPA}</Text>
          <Text style={{fontSize:20}}>Weighted: {this.state.weightedOldGPA}</Text>

          <Text style={{fontSize:40,marginTop:40}}>This year</Text>
          <Text style={{fontSize:10}}>An estimate of your HS GPA based your grades for this year</Text>
          <Text style={{fontSize:20}}>Unweighted: {this.state.unweightedCurrGPA}</Text>
          <Text style={{fontSize:20}}>Weighted: {this.state.weightedCurrGPA}</Text>

          <Text style={{fontSize:40,marginTop:40}}>Total GPA estimate</Text>
          <Text style={{fontSize:10}}>An estimate of your HS GPA based your grades for this year</Text>
          <Text style={{fontSize:20}}>Unweighted: {this.state.unweightedNewGPA}</Text>
          <Text style={{fontSize:20}}>Weighted: {this.state.weightedNewGPA}</Text>
        </ScrollView>
      )
  }

}

class Options extends React.Component {
  constructor(props){
    super(props);
    this.state ={selectedIndex:0}

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
        AsyncStorage.clear().then(()=>{
          AsyncStorage.setItem('oldUsername',user).then(()=>{
            AsyncStorage.setItem('oldPassword',pass).then(()=>{
              signOutGlobal();
            });
          });
        })
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
  switch = {{
    onValueChange:()=>{ var val = !this.state.needBiometric; AsyncStorage.setItem('needBiometric',val.toString()).then((result)=>{this.setState({needBiometric: val});})},
   value:this.state.needBiometric,
   disabled: this.state.needBiometric == null
  }}
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
  onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app') }
/>
<ListItem  
  leftIcon={{ name: "log-out" , type: 'entypo' }}
  title="Switch User"
  subtitle={"Sign into a different account"}
  style={{marginBottom:20}}
  onPress = {this.signOut}
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




const HomeStack = createStackNavigator({
  Home: { screen: home},
  Class:{ screen: ClassScreen},
});

const AssignmentsStack = createStackNavigator({
  Assignments: { screen: gradeList },
});

const SettingsStack = createStackNavigator({
  Settings: { screen: settings },
  Options: {screen: Options},
  Contacts: {screen: Contacts},
  GPA: {screen: GPA},
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
                <Text style={{fontSize: 10,padding:10,color:"white"}}>Note: Your password will be stored on our servers so we can get your grades for you</Text>
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



 
  const AppContainer = createAppContainer(TabNav)
  export default class App extends React.Component {
    constructor(){
      super();
      SplashScreen.preventAutoHide();
      signOutGlobal = signOutGlobal.bind(this);
      signInGlobal = signInGlobal.bind(this);
      this.state = {user:9};
      this.returningUser();
    }

    returningUser = () =>{
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
      
      this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }

    _handleNotification = (notification) => {
      console.log(notification)
      console.log(this.refs)
      if(notification.data.txt)
        this.refs.toast.show(notification.data.txt);
    };

    render(){
      if(this.state.user == 9)
        return null;
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
  }/*createStackNavigator(
    {
      Normal: {
        screen: TabNav,
      },
      SignIn: {
        screen: signIn,
      },
    },
    {
      //mode: 'modal',
      headerMode: 'none',
    }
  )*/
  
  //;
