import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert, Button, TouchableOpacity,TextInput ,KeyboardAvoidingView , ScrollView, Picker} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 6.2.2
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon, Input  } from 'react-native-elements'
import {AsyncStorage} from 'react-native';
import DropdownMenu from 'react-native-dropdown-menu';
import Modal from 'react-native-modal';
//import gradeList from './gradeList.js'
require('create-react-class');

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
                      if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>5)
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
                  listOfAssignments.push({
                    title: assignment["Date"].replace("\n"," "),
                    data: tempList,
                  });
                  tempList= [];
                }

                tempList.push(assignment);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]

                lastAssignment = assignment;
              }
              listOfAssignments.push({
                title: assignment["Date"],
                data: tempList,
              });

              return listOfAssignments;
  }

  componentWillMount(){
    console.log("LOADIN COMPONENT RUNNIN")
    AsyncStorage.getItem('username').then((user)=>{
      console.log(user);
      if(user==null){
        this.props.navigation.navigate('SignIn',{refresh: () =>{
            this.componentWillMount();
        }})
      }else{
        this._retrieveData()
        this.getGrade()
      }
    })
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
      console.log("LOCALLY STORED");
        console.log(jsonVal)
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
    if(navigation.getParam('loading')){
      return {
        title: 'Your Assignments',
      headerRight: (
        <View paddingRight={10}>
          <ActivityIndicator/>
        </View>
      ),
      }
    }

    return {
      title: 'Your Assignments',
    headerRight: (
      <View paddingRight={10}>
      <Icon
        name="refresh"
        type = "MaterialIcons"
        onPress={navigation.getParam('refresh')}

      />
      </View>
    ),
    }
  };

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
            <Text style={styles.rightContainer} flex right>{item["Grade"]}</Text>
            </View>}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
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
                      if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>5)
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
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
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
})



class settings extends React.Component {

  constructor(props){
    super(props);
    this.state ={ isLoading: false, email:"", password:"",}

  }

  signOut = ()=>{
    AsyncStorage.clear()
    this.props.navigation.navigate('SignIn')
  }

  render() {
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column'}}>
          <Button
          onPress = {this.signOut}
          title = "Sign Out"
          />
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

  render() {
    return (
      <TouchableOpacity onPress={() => this.classClicked(this.props.title)} style={{flex: 1, flexDirection: 'row',justifyContent: 'space-between', padding:10,paddingVertical:10}}>
        <View style={{flex: 7, }}>
          <Text style={{fontSize:20, }}>{this.props.title}</Text>
          <Text style={{fontSize:15}}>{this.props.teach}</Text>
        </View>

        <View right style={{flex: 2,}}>
          <Text style={{fontSize:30,textAlign:"right"}}>{this.props.avg}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}


class home extends LoadInComponent {

  constructor(props){
    super(props);
    console.log("GERNERATING")  
    this.state ={ isLoading: false, email:"", password:"", num: 0, currentMarking: "Select MP"}

    console.log("GERNERATING DONE")
    

    

    this.props.navigation.setParams({ click: this.click,});
  }

  static navigationOptions = ({ navigation }) => {
    console.log("TEXT: "+navigation.getParam('currentMarking','Select a MP'))
    console.log(navigation.getParam('currentMarking','Select a MP'))
    var text = navigation.getParam('currentMarking','Select a MP');
    console.log(typeof text)
    if(typeof text != "string"){
      text = "Select a MP"
    }
    console.log("TEXTt: "+text)
      return {
        title: 'Home',
      headerRight: (
        <View>
        <Button
          onPress = {navigation.getParam('click')}
          title = {text}//{navigation.getParam('currentMarking','Select a MP')}//{this.state.currentMarking}//
        />
        </View>
      ),
      }
  };

  genMpSelector = () =>{
    var pickerArry = [];
    var mps = this.genMpsArray();
    console.log("MPS");
    for(mp of mps){
      pickerArry.push(<Picker.Item label={mp} value={mp}/>);
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
    return mps;
  }

  genTable = ()=>{
    var table = []
    var first = true;
    var mps = this.genMpsArray();
    for(classN in grades){
      var maxMarking=this.state.currentMarking;
      console.log(maxMarking);
      var avg = "";
      var teach = "";
      if(grades[classN][maxMarking]){
        if(grades[classN][maxMarking]["avg"]){
          console.log("YEE2T")
          avg = grades[classN][maxMarking]["avg"]
          console.log(avg);
          
        }
      }
      if(grades[classN]["teacher"])
      teach = grades[classN]["teacher"]
      console.log(classN);
      if(!first){
        table.push(<View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>);
      }else{
        first = false;
      }
      console.log("avg")
      console.log(avg)
      if(classN!="Status")
        table.push(<ClassBtn title={classN} teach = {teach} avg={avg} onPress={this.classClicked}></ClassBtn>)
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
    this.props.navigation.navigate('Class',{className:className})
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
          console.log(mp)
          if(!mp){
            var mps = this.genMpsArray();
            console.log(mps)
            if(mps.length>0){
              AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
                
                this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
                this.setState({currentMarking: mps[mps.length-1]});
                console.log(mps[mps.length-1])  
              })
            }
          }else{
            this.props.navigation.setParams({ currentMarking: mp});
            this.setState({currentMarking: mp});
          }
        });
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column'}}>
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
        title: navigation.getParam('className',"Class Name"),
      }
  };

  render() {
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column'}}>
        

        <Picker
          selectedValue={this.state.language}
          style={{height: 50, width: 100}}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({language: itemValue})
          }>
          <Picker.Item label="Java" value={this.props.navigation.getParam('className')} />
          <Picker.Item label="JavaScript" value="js" />
        </Picker>


        </ScrollView>

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
});

const TabNav = createBottomTabNavigator(
  {
    Home: { screen:  HomeStack},
    Assignments: { screen:  AssignmentsStack},
     
    Settings: { screen:  SettingsStack},
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName = "list_alt";
        let type = "material"
        if (routeName === 'Home') {
          type="antdesign"
          iconName = `${focused ? 'infocirlce' : 'infocirlceo'}`;
        } else if (routeName === 'Assignments') {
          if(focused){
            type = "ionicon";
            iconName = 'ios-list-box'
          }else{
            iconName = 'view-headline'
          }

          //iconName = `${focused ? 'ios-list-box' : 'view-headline'}`; // assignment
        } else if (routeName === 'Settings') {
          iconName = `settings`;
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} type={type}/>;//<Ionicons name="md-checkmark-circle" size={32} color="green" />//
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    animationEnabled: false,
    swipeEnabled: false,
  }
)


class signIn extends React.Component {

	  constructor(props){
      super(props);
      this.state ={ isLoading: false, email:"", password:"",}

    }

    verify = () =>{
      this.setState({
        isLoading: true,
      });
      var email = this.state.email;
      var pass = this.state.password;
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
        console.log(responseJson);
        if(responseJson['valid']==true){
          AsyncStorage.setItem('username', email).then(()=>{
            AsyncStorage.setItem('password', pass).then(()=>{
              this.props.navigation.navigate('Normal')
              let refreshFunc = this.props.navigation.getParam('refresh');
              if(refreshFunc)
              refreshFunc();
            });
          });

        }else{
          Alert.alert("Invalid username or password!");
        }
        this.setState({
          isLoading: false,
        });
      });
    }

    onChangeText = (key, val) => {
      this.setState({ [key]: val})
    }

    render() {
      if(this.state.isLoading){//padding: 20
        return(
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#f3f9fb" }}>

              <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='email'
                type='MaterialCommunityIcons'
                size={30}
              />
              <Text
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8,color:"#ededed"}}>{this.state.email}</Text>


            </View>
          <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='lock'
                type='FontAwesome5'
                size={30}
              />
              <Text
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8,color:"#ededed"}}
                >verifying credentials</Text>

            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#113f67",
                paddingHorizontal: 15,
                paddingVertical: 15,
                borderRadius: 15,
                width:"80%",alignItems: 'center',
                marginVertical: 30,}}

            >
              <ActivityIndicator size="large" color="#ffffff"/>
            </TouchableOpacity>

        </KeyboardAvoidingView>
        )
        }

        return(
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#f3f9fb" }}>

              <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:20,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='email'
                type='MaterialCommunityIcons'
                size={30}
              />
              <TextInput
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8}}
                keyboardType={'email-address'}
                  autoCorrect={false}
                  placeholder="Email"
                  onChangeText={val => this.onChangeText('email', val)}
                />

            </View>
          <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:20,borderRadius: 15,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='lock'
                type='FontAwesome5'
                size={30}
              />
              <TextInput
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8}}
                  autoCorrect={false}
                  secureTextEntry
                  placeholder="Password"
                  onChangeText={val => this.onChangeText('password', val)}
                  onSubmitEditing={this.verify}
                />

            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#113f67",
                paddingHorizontal: 15,
                paddingVertical: 15,
                borderRadius: 15,
                width:"80%",alignItems: 'center',
                marginVertical: 30,
              }}
              onPress={this.verify}

            >
              <Text style={{fontSize: 30,fontWeight: '400',color: "#fff",}}>Sign In</Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
        )
    }

  }







export default createAppContainer(createStackNavigator(
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
));