import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert, Button, TouchableOpacity,TextInput ,KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 6.2.2
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon, Input  } from 'react-native-elements'
import {AsyncStorage} from 'react-native';


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
        this.props.navigation.navigate('SignIn')
      }else{
        this.props.navigation.setParams({ refresh: this.getGrade.bind(this)});
        this._retrieveData()
        this.getGrade()
      }
    })
  }

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
		  username: "10012734@sbstudents.org",//10012734 //await AsyncStorage.getItem('username')
		  password: "Sled%2#9",//Sled%2#9 //await AsyncStorage.getItem('password')
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
          AsyncStorage.setItem('grades', JSON.stringify(responseJson));
          this.props.navigation.setParams({ loading: false })
          parsedJSON = this.parseJSON(responseJson)
					this.setState({
						isLoading: false,
						dataSource: parsedJSON,
					}, function(){

          });
		}else{
      Alert.alert("NOT cached")
      this.runGetGrades()

    }

			})
			.catch((error) =>{
				console.error(error);
			});
}

componentDidMount(){
  /*this.props.navigation.setParams({ refresh: this.getGrade.bind(this)});
  this._retrieveData()
  this.getGrade()*/
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

const HomeStack = createStackNavigator({
  Home: { screen: gradeList },
});

const AssignmentsStack = createStackNavigator({
  Settings: { screen: gradeList },
});

const SettingsStack = createStackNavigator({
  Settings: { screen: gradeList },
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
      this.state ={ isLoading: false, email:"en", password:"en",}

    }

    verify = () =>{
      Alert.alert(this.state.email+":"+this.state.password);
    }

    onChangeText = (key, val) => {
      this.setState({ [key]: val})
    }

    render() {
      if(this.state.isLoading){//padding: 20
        return(
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor: "#ededed" }}>
            <ActivityIndicator/>
          </View>
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
                paddingVertical: 5,
                borderRadius: 30,
                width:"80%",alignItems: 'center',
                marginVertical: 30,}}
              onPress={this.verify} 
              
            >
              <Text style={{fontSize: 60,fontWeight: '400',color: "#fff",}}>Sign In</Text>
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
    mode: 'modal',
    headerMode: 'none',
  }
));
