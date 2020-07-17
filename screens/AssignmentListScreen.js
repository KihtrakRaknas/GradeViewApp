import React from 'react';
import { Icon} from 'react-native-elements'
import { Text, View, ActivityIndicator, Alert, Button } from 'react-native'
import LoadInComponent from '../components/LoadInComponent'
import ListOfAssignmentsView from '../components/ListOfAssignmentsView'
import { navigationHeader, container } from '../globals/styles'
import { prepareAssignmentsObjectForSectionList, getAssignmentsFromClassAndMP} from '../helperFunctions/convertingGradesObjectForSectionList'

export default class AssignmentListScreen extends LoadInComponent {
    convertGradesToAssignments(obj) {
        var assignments = [];
        for (className in obj) {
            if (className != "Status") {
                for (markingPeriod in obj[className]) {
                    if (markingPeriod != null && markingPeriod != "teacher" && markingPeriod != "title") {
                        assignments = assignments.concat(getAssignmentsFromClassAndMP(obj, className, markingPeriod))
                    }
                }
            }
        }
        return prepareAssignmentsObjectForSectionList(assignments)
    }
    static navigationOptions = ({ navigation }) => {
        var icon = <Icon
            name="refresh"
            type="MaterialIcons"
            onPress={navigation.getParam('refresh')}

        />;
        if (navigation.getParam('loading')) {
            icon = <ActivityIndicator />;
        }
        return {
            title: 'Your Assignments',
            headerStyle: navigationHeader,
            headerRight: (
                <View paddingRight={10}>
                    {icon}
                </View>
            ),
        }
    };

    getGradeAndReportError = () => {
        return this.getGradeWithoutErrorCatching().catch((error) => {
            Alert.alert("Network Issue!\n Make sure you have a internet connection")
        });
    }

    componentDidMount() {
        this.props.navigation.setParams({ refresh: this.getGradeAndReportError.bind(this), });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                    <Text style={{ padding: 20, paddingBottom: 50 }}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>

                    <Button title="Problem?" onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app')} />
                </View>
            )
        }
        var listOfAssignments = this.convertGradesToAssignments(global.grades)
        return (
            <View style={container}>
                <ListOfAssignmentsView navigation={this.props.navigation} listOfAssignments={listOfAssignments} />
            </View>
        );
    }
}