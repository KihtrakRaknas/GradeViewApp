import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 6.2.2
import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator} from 'react-navigation';
import { Icon } from 'react-native-elements'


 class gradeList extends React.Component {
  static navigationOptions = {
    title: 'Your Assignments',
  }; 
  
	  constructor(props){
	    super(props);
	    this.state ={ isLoading: true}
  }

getGrade(){
	console.log("TEST")
		return fetch('https://gradeview.herokuapp.com/', {
		method: 'POST',
		headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  username: '10012734',//10012734
		  password: 'Sled%2#9',//Sled%2#9
		}),
	})
			.then((response) => {
		console.log(response);
		//response.json()
		console.log(typeof response)
			return response.json();
		})
			.then((responseJson) => {
		console.log(responseJson);
		if(responseJson["Status"]=="Completed"){
					this.setState({
						isLoading: false,
						dataSource: responseJson,
					}, function(){
            
          });
		}else{
      Alert.alert("NOT cached")
      runGetGrades()

    }

			})
			.catch((error) =>{
				console.error(error);
			});
}

componentDidMount(){
  
  this.getGrade()
}

runGetGrades(){
  setTimeout(function(){

    this.getGrade()
  },3000);
}

  render() {
	      if(this.state.isLoading){//padding: 20
	        return(
	          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
	            <ActivityIndicator/>
	          </View>
	        )
    	}

	var obj = this.state.dataSource
	var assignments = []; 

	for(className in obj){
		if(className!="Status"){
		for(markingPeriod in obj[className]){
			if(markingPeriod!=null && markingPeriod != "teacher" && markingPeriod != "title"){
				console.log(markingPeriod);
				console.log(className)
				console.log(obj[className][markingPeriod]["Assignments"]);
				for(var assignment of obj[className][markingPeriod]["Assignments"]){
          var year = "19";
          if(parseInt((assignment["Date"].split("\n")[1]).split("/")[0])>5)
            year = "18";
          //assignment["Name"] = (assignment["Date"].split("/")[1]).split("\n")[0];
					assignment["Timestamp"] = Date.parse(assignment["Date"]+"/"+year);
          assignments.push(assignment);
					console.log(assignment["Date"]+"/"+year);
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
  console.log(arr);
  arr = arr.sort((a, b) => b["Timestamp"] - a["Timestamp"]);
  console.log("SORTED\n\n\n\n\n\n");
  console.log(arr);
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
      
    console.log(assignment["Date"]);
    tempList.push(assignment["Name"]);//+assignment["Date"].split("\n")[1]+" "+assignment["Timestamp"]

    lastAssignment = assignment;
  }
  listOfAssignments.push({
    title: assignment["Date"],
    data: tempList,
  });

    return (

      <View style={styles.container}>
        <SectionList
          sections={listOfAssignments}
          renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
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

export default createAppContainer(createBottomTabNavigator(
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
));
