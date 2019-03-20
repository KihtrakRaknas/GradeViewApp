import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert, Button, TouchableOpacity,TextInput ,KeyboardAvoidingView , ScrollView, Picker} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 6.2.2
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon, Input  } from 'react-native-elements'
import {AsyncStorage} from 'react-native';
import DropdownMenu from 'react-native-dropdown-menu';
import Modal from 'react-native-modal';


var grades;
 class gradeList extends React.Component {
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
  }

  /*componentDidMount(){
    this.props.navigation.setParams({ refresh: this.getGrade.bind(this)});
    this._retrieveData()
    this.getGrade()
  }*/

	  constructor(props){
	    super(props);
	    this.state ={ isLoading: true}
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

                console.log("a"+assignment["Grade"]+"b");
                tempList.push(assignment);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]

                lastAssignment = assignment;
              }
              listOfAssignments.push({
                title: assignment["Date"],
                data: tempList,
              });

              return listOfAssignments;
  }
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

class home extends React.Component {

  constructor(props){
    super(props);
    this.state ={ isLoading: false, email:"", password:"",num: 0}
    console.log(grades);
  }

  static navigationOptions = ({ navigation }) => {
   
      return {
        title: 'Home',
      headerRight: (
        <View style={{height:20,}} paddingRight={10}>

        </View>
      ),
      }
  };

  genMpSelector = () =>{
    var pickerArry = [];
    var mps = this.genMpsArray();
    console.log("MPS");
    console.log(mps);
    for(mp of mps){
      pickerArry.push(<Picker.Item label={{mp}} value={{mp}} />);
      console.log(mp);
    }
    
    return pickerArry;

  }

  genMpsArray = () =>{
    var mps = []
    for(classN in grades){
      if(classN!="Status"){
      for(marking in grades[classN]){
        console.log("MARK1: "+marking+"MARK2: "+classN);
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
    console.log(grades);
    var mps = this.genMpsArray();
    console.log(mps)
    for(classN in grades){
      var maxMarking="MP0";
      var avg = "";
      for(marking in grades[classN]){
        console.log(marking.substring(2));
        if(Number(marking.substring(2))){
          if(Number(marking.substring(2))>Number(maxMarking.substring(2)))
            maxMarking = marking
        }
      }
      console.log(maxMarking);
      if(grades[classN][maxMarking]){
        
        if(grades[classN][maxMarking]["avg"]){
          console.log("YEET")
          avg = grades[classN][maxMarking]["avg"]
        }
      }
      console.log(classN);
      if(!first){
        table.push(<View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }}/></View>);
      }else{
        first = false;
      }
      table.push(<View style={{flex: 1, flexDirection: 'row',justifyContent: 'space-between', padding:10,paddingVertical:20}}><View style={{backgroundColor: 'skyblue'}}><Text style={{fontSize:30, width:"80%"}}>{classN}</Text><Text style={{fontSize:20}}>Teacher</Text></View><View right style={{backgroundColor: 'skyblue'}}><Text style={{fontSize:30}}>{avg}</Text></View></View>)
    }
    return table
  }

  click = () =>{
    //console.log(grades);
    this.setState({
      visibleModal: !this.state.visibleModal,
    });
  }

  render() {
    var mps = []
    for(classN in grades){
      if(classN!="Status"){
      for(marking in grades[classN]){
        console.log("MARK1: "+marking+"MARK2: "+classN);
        //console.log(grades[classN]);
        if(Number(marking.substring(2))){
          if(!mps.includes(marking))
            mps.push(marking);
        }
      }
      }
    }
    var data = [mps];
      return(
        <ScrollView style={{flex: 1, flexDirection: 'column'}} onPress={this.click}>
        <Modal isVisible={this.state.visibleModal} 
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        onRequestClose={() => this.setState({ visibleModal: false })}
        >
              <View style={{backgroundColor: 'white',padding: 22,justifyContent: 'center',alignItems: 'center',borderRadius: 4,borderColor: 'rgba(0, 0, 0, 0.1)',}}>
                <Picker
                  selectedValue={this.state.language}
                  style={{height: 200, width: 100}}
                  /*onValueChange={(itemValue, itemIndex) =>
                    this.setState({language: itemValue})
                  }*/>
                  //{this.genMpSelector()}
                </Picker>
                <Button title="Set Marking Period" onPress={() => this.setState({ visibleModal: false })}/>
              </View>
        </Modal>
              
        {this.genTable()}

        <Button
        onPress = {this.click}
        title = "Sign Out"
        />  
        <Picker
          selectedValue={this.state.language}
          style={{height: 50, width: 100}}
          onValueChange={(itemValue, itemIndex) =>
            this.setState({language: itemValue})
          }>
          <Picker.Item label="Java" value="java" />
          <Picker.Item label="JavaScript" value="js" />
        </Picker>


        </ScrollView>

      )
  }

}



const HomeStack = createStackNavigator({
  Home: { screen: home },
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
        console.log("LOGOS");
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
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#ededed" }}>

              <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 30,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='email'
                type='MaterialCommunityIcons'
                size={30}
              />
              <TextInput
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8}}
                keyboardType={'email-address'}
                  autoCorrect={false}
                  placeholder={this.state.email}
                />

            </View>
          <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 30,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
              <Icon
                name='lock'
                type='FontAwesome5'
                size={30}
              />
              <TextInput
                style={{flex: 1,fontSize: 30,paddingHorizontal: 8}}
                  autoCorrect={false}
                  secureTextEntry
                  placeholder={this.state.password}
                />

            </View>

            <TouchableOpacity
              style={{
                backgroundColor: "#7a9145",
                paddingHorizontal: 15,
                paddingVertical: 30,
                borderRadius: 30,
                width:"80%",alignItems: 'center',
                marginVertical: 30,}}

            >
              <ActivityIndicator size="large" color="#ffffff"/>
            </TouchableOpacity>

        </KeyboardAvoidingView>
        )
        }

        return(
          <KeyboardAvoidingView behavior="padding" style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#ededed" }}>

              <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 30,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
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
          <View style={{flexDirection: 'row',backgroundColor: "#FFFFFF",margin:10,borderRadius: 30,paddingHorizontal: 20,paddingVertical: 10,marginVertical: 15,}}>
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
                backgroundColor: "#7a9145",
                paddingHorizontal: 15,
                paddingVertical: 30,
                borderRadius: 30,
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
