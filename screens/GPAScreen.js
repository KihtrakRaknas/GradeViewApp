import React from 'react';
import { AsyncStorage, ScrollView, View } from 'react-native';
import { Text} from 'react-native-elements';
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import gradeToLetter from '../helperFunctions/gradeToLetter'
import RespectThemeBackground from '../components/RespectThemeBackground.js'

export default class GPAScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { unweightedOldGPA: "Not Available", weightedOldGPA: "Not Available", unweightedNewGPA: "Not Available", weightedNewGPA: "Not Available", unweightedCurrGPA: "Not Available", weightedCurrGPA: "Not Available", showingCached:false, gettingPast:true, gettingCurr:false, done:false, hasError:false }
        AsyncStorage.getItem('weightedOldGPA').then((gpa) => {
            if (gpa)
                this.setState({ weightedOldGPA: gpa, showingCached:true })
        });
        AsyncStorage.getItem('unweightedOldGPA').then((gpa) => {
            if (gpa)
                this.setState({ unweightedOldGPA: gpa, showingCached:true })
        });
        AsyncStorage.getItem('unweightedNewGPA').then((gpa) => {
            if (gpa)
                this.setState({ unweightedNewGPA: gpa, showingCached:true })
        });
        AsyncStorage.getItem('weightedNewGPA').then((gpa) => {
            if (gpa)
                this.setState({ weightedNewGPA: gpa, showingCached:true })
        });
        AsyncStorage.getItem('unweightedCurrGPA').then((gpa) => {
            if (gpa)
                this.setState({ unweightedCurrGPA: gpa, showingCached:true })
        });
        AsyncStorage.getItem('weightedCurrGPA').then((gpa) => {
            if (gpa)
                this.setState({ weightedCurrGPA: gpa, showingCached:true })
        });
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'GPA',
            headerStyle: navigationHeader,
        }
    }

    weightToGPABoost = (weight) => {
        if (weight.includes("A.P."))
            return 1;
        else if (weight.includes("Honors"))
            return .5;
        else
            return 0;
    };

    letterGradeToGPA = (letter) => {
        switch (letter.substring(0, 2).trim()) {
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
                console.log("Unrecognised Letter Grade - " + letter.substring(0, 2).trim())
                return "error"
        }
    }

    getOldFGs = async () => {
        this.props.navigation.setParams({ loading: true });
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
                school: await AsyncStorage.getItem('school'),
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
            }).catch((e)=>{
                console.log(e)
                this.setState({hasError:true})
            });
    }

    getNewFGs = async () => {
        this.props.navigation.setParams({ loading: true });
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
                school: await AsyncStorage.getItem('school'),
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
                if (global.grades && responseJson) {
                    responseJson.map((classObj) => {
                        if (global.grades[classObj['Name']]) {
                            for (mpsName in global.grades[classObj['Name']]) {
                                if (mpsName.includes("MP") && global.grades[classObj['Name']][mpsName]['avg']) {
                                    var percent = global.grades[classObj['Name']][mpsName]['avg']
                                    percent = percent.substring(0, percent.length - 1)
                                    if (!classObj[mpsName])
                                        classObj[mpsName] = gradeToLetter(percent);
                                }
                            }
                        }
                        return classObj;
                    })
                }
                console.log("TEST - new FG ending")
                console.log(responseJson)
                return responseJson
            }).catch((e)=>{
                console.log(e)
                this.setState({hasError:true})
            })
    }

    componentDidMount = () => {
        this.getOldFGs().then((FGs) => {
            this.setState({gettingPast:false, gettingCurr:true})
            var GPA = null;
            for (var year of FGs) {
                var yrGPA = 0;
                var totalCredits = 0;
                for (var classs of year) {
                    if (this.letterGradeToGPA(classs["FG"]) == "error")
                        continue;
                    totalCredits += classs["Credits"];
                    yrGPA += this.letterGradeToGPA(classs["FG"]) * classs["Credits"];
                }
                yrGPA = yrGPA / totalCredits;
                GPA += yrGPA / FGs.length
            }
            if (GPA) {
                this.setState({ unweightedOldGPA: GPA.toFixed(2) })
                AsyncStorage.setItem('unweightedOldGPA', GPA.toFixed(2))
            }


            var weightedGPA = null;
            var failed = false;
            for (var year of FGs) {
                var yrGPA = 0;
                var totalCredits = 0;
                for (var classs of year) {
                    if (this.letterGradeToGPA(classs["FG"]) == "error")
                        continue;
                    totalCredits += classs["Credits"];
                    if (classs["Weight"]) {
                        yrGPA += (this.letterGradeToGPA(classs["FG"]) + this.weightToGPABoost(classs["Weight"])) * classs["Credits"];
                    } else {
                        failed = true;
                        Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
                    }
                }
                yrGPA = yrGPA / totalCredits;
                weightedGPA += yrGPA / FGs.length
            }
            if (weightedGPA && !failed) {
                this.setState({ weightedOldGPA: weightedGPA.toFixed(2) })
                AsyncStorage.setItem('weightedOldGPA', weightedGPA.toFixed(2));
            }


            this.getNewFGs().then((newFGs) => {
                this.setState({gettingCurr:false})
                var newGPA = null;
                for (var year of FGs) {
                    var yrGPA = 0;
                    var totalCredits = 0;
                    for (var classs of year) {
                        if (this.letterGradeToGPA(classs["FG"]) == "error")
                            continue;
                        totalCredits += classs["Credits"];
                        yrGPA += this.letterGradeToGPA(classs["FG"]) * classs["Credits"];
                    }
                    yrGPA = yrGPA / totalCredits;
                    newGPA += yrGPA / (FGs.length + 1)
                }

                var yrGPA = 0;
                var totalCredits = 0;
                for (var classs of newFGs) {
                    let total = 0;
                    let totalGPA = 0;
                    for (gradePerMP in classs) {
                        if (gradePerMP.includes("MP")) {
                            if (this.letterGradeToGPA(classs[gradePerMP]) == "error")
                                continue;
                            total++;
                            totalGPA += this.letterGradeToGPA(classs[gradePerMP])
                        }
                    }
                    if (total) {
                        totalCredits += classs["Credits"];
                        let classGPA = totalGPA / total
                        if (classs["ME"] && classs["FE"] && this.letterGradeToGPA(classs["ME"]) != "error" && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .8 + this.letterGradeToGPA(classs["ME"]) * .1 + this.letterGradeToGPA(classs["FE"]) * .1
                        else if (classs["ME"] && this.letterGradeToGPA(classs["ME"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["ME"]) * .1
                        else if (classs["FE"] && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["FE"]) * .1
                        console.log(classs["Name"] + ": " + classGPA)
                        yrGPA += classGPA * classs["Credits"];
                    }
                }
                yrGPA = yrGPA / totalCredits;
                newGPA += yrGPA / (FGs.length + 1)

                if (yrGPA) {
                    this.setState({ unweightedCurrGPA: yrGPA.toFixed(2) })
                    AsyncStorage.setItem('unweightedCurrGPA', yrGPA.toFixed(2))
                }

                if (newGPA) {
                    this.setState({ unweightedNewGPA: newGPA.toFixed(2) })
                    AsyncStorage.setItem('unweightedNewGPA', newGPA.toFixed(2))
                }




                var newWeightedGPA = null;
                var failed = false;
                for (var year of FGs) {
                    var yrGPA = 0;
                    var totalCredits = 0;
                    for (var classs of year) {
                        if (this.letterGradeToGPA(classs["FG"]) == "error")
                            continue;
                        totalCredits += classs["Credits"];
                        if (classs["Weight"]) {
                            yrGPA += (this.letterGradeToGPA(classs["FG"]) + this.weightToGPABoost(classs["Weight"])) * classs["Credits"];
                        } else {
                            failed = true;
                            Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
                        }
                    }
                    yrGPA = yrGPA / totalCredits;
                    newWeightedGPA += yrGPA / (FGs.length + 1)
                }

                var yrGPA = 0;
                var totalCredits = 0;
                for (var classs of newFGs) {
                    let total = 0;
                    let totalGPA = 0;
                    for (gradePerMP in classs) {
                        if (gradePerMP.includes("MP")) {
                            if (this.letterGradeToGPA(classs[gradePerMP]) == "error")
                                continue;
                            total++;
                            totalGPA += this.letterGradeToGPA(classs[gradePerMP])
                        }
                    }
                    if (total) {
                        totalCredits += classs["Credits"];
                        let classGPA = totalGPA / total
                        if (classs["ME"] && classs["FE"] && this.letterGradeToGPA(classs["ME"]) != "error" && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .8 + this.letterGradeToGPA(classs["ME"]) * .1 + this.letterGradeToGPA(classs["FE"]) * .1
                        else if (classs["ME"] && this.letterGradeToGPA(classs["ME"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["ME"]) * .1
                        else if (classs["FE"] && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["FE"]) * .1

                        if (classs["Weight"]) {
                            yrGPA += (classGPA + this.weightToGPABoost(classs["Weight"])) * classs["Credits"];
                        } else {
                            failed = true;
                            Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback" button')
                        }
                    }
                }
                yrGPA = yrGPA / totalCredits;
                newWeightedGPA += yrGPA / (FGs.length + 1)

                if (yrGPA && !failed) {
                    this.setState({ weightedCurrGPA: yrGPA.toFixed(2) })
                    AsyncStorage.setItem('weightedCurrGPA', yrGPA.toFixed(2))
                }

                if (newWeightedGPA && !failed) {
                    this.setState({ weightedNewGPA: newWeightedGPA.toFixed(2), done:true })
                    AsyncStorage.setItem('weightedNewGPA', newWeightedGPA.toFixed(2))
                }

            });
        })
    }


    render() {
        return (
            <RespectThemeBackground >
                <ScrollView style={{ flex: 1, flexDirection: 'column', padding: 10 }}>
                    {!this.state.done && <Text style={{textAlign:"center"}}>
                        Status: {this.state.showingCached && <Text style={{color:"green"}}>Showing Cached Data{"\n"}</Text>}
                        {!this.state.hasError && <>
                            {this.state.gettingPast && <Text style={{color:"blue"}}>Getting new data for past years...</Text>}
                            {this.state.gettingCurr && <Text style={{color:"blue"}}>Getting new data for this year...</Text>}
                        </>}
                        {this.state.hasError && <Text style={{color:"red"}}>Error! Most likely a network issue.</Text>}
                    </Text>}

                    <Text style={{ fontSize: 40, textAlign: 'center', paddingTop:10}}>Past GPA</Text>
                    <Text style={{ fontSize: 17,paddingBottom:15}}>GPA without factoring in the current year</Text>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Unweighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.unweightedOldGPA}</Text>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Weighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.weightedOldGPA}</Text>      
                    </View>
                    <ListItem
                        bottomDivider={true}
                    />
                    <ListItem
                        topDivider={true}
                    />
                    <Text style={{ fontSize: 40, textAlign: 'center' }}>This Year</Text>
                    <Text style={{ fontSize: 17,paddingBottom:15}}>GPA only for this year (estimate)</Text>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Unweighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.unweightedCurrGPA}</Text>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Weighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.weightedCurrGPA}</Text>      
                    </View>
                    <ListItem
                        bottomDivider={true}
                    />
                    <ListItem
                        topDivider={true}
                    />
                    <Text style={{ fontSize: 40, textAlign: 'center' }}>Total GPA estimate</Text>
                    <Text style={{ fontSize: 17,paddingBottom:15}}>GPA so far (estimate)</Text>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Unweighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.unweightedNewGPA}</Text>
                    </View>
                    <View style={{flex:1, flexDirection:'row', justifyContent: "space-between", padding:10}}>
                        <Text style={{ fontSize: 20 }}>Weighted:</Text>
                        <Text style={{ fontSize: 20 }}>{this.state.weightedNewGPA}</Text>      
                    </View>
                </ScrollView>
            </RespectThemeBackground>
        )
    }

}