import React from 'react';
import { Text, View } from 'react-native';
import ListOfAssignmentsView from '../components/ListOfAssignmentsView'
import { navigationHeader, container} from '../globals/styles'
import { prepareAssignmentsObjectForSectionList, getAssignmentsFromClassAndMP} from '../helperFunctions/convertingGradesObjectForSectionList'
export default class ClassScreen extends React.Component {

    constructor(props) {
      super(props);
      console.log("GERNERATING")
      this.state = { isLoading: false, email: "", password: "", num: 0, currentMarking: "Select MP" }
    }
  
    static navigationOptions = ({ navigation }) => {
      /*return {
        title: navigation.getParam('className',"Class Name"),
      }*/
      return {
        headerStyle: navigationHeader,
        title: navigation.getParam('className', "Class Name"),
      }
    };
  
    parseJSON(obj, className, markingPeriod) {
      var assignments = getAssignmentsFromClassAndMP(obj,className,markingPeriod)
      return prepareAssignmentsObjectForSectionList(assignments)
    }
  
    render() {
      var listOfAssignments = this.parseJSON(global.grades, this.props.navigation.getParam('className'), this.props.navigation.getParam('markingPeriod'))
      if (listOfAssignments.length == 0) {
        this.props.navigation.goBack()
        return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>No grades yet</Text></View>)
      }
  
      return (
  
        <View style={container}>
          <ListOfAssignmentsView navigation={this.props.navigation} listOfAssignments={listOfAssignments} />
        </View>
      );
  
    }
  
  }