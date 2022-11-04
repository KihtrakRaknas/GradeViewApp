import React from 'react';
import { AsyncStorage, ScrollView, View, ActivityIndicator, Alert, StyleSheet} from 'react-native';
import { Text} from 'react-native-elements';
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import gradeToLetter from '../helperFunctions/gradeToLetter'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import { withTheme } from 'react-native-elements';

class GPAScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { unweightedOldGPA: "Loading...", weightedOldGPA: "Loading...", unweightedNewGPA: "Loading...", weightedNewGPA: "Loading...", unweightedCurrGPA: "Loading...", weightedCurrGPA: "Loading...", showingCached:false, gettingPast:true, gettingCurr:false, done:false, hasError:false }
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
                return 3 + 2/3//3.7
                break;
            case "B+":
                return 3 + 1/3//3.3
                break;
            case "B":
                return 3.0
                break;
            case "B-":
                return 2 + 2/3//2.7
                break;
            case "C+":
                return 2 + 1/3//2.3
                break;
            case "C":
                return 2.0
                break;
            case "C-":
                return 1.67//1.7
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
            case "P":
            case "AW":
            case "W":
            case "WP":
            case "WF":
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
        return fetch('https://gradeviewapi.kihtrak.com/oldGrades', {
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
                this.setState({hasError:true, error:e.toString()})
            });
    }

    getNewFGs = async () => {
        this.props.navigation.setParams({ loading: true });
        console.log("TEST - new FG starting")
        return fetch('https://gradeviewapi.kihtrak.com/newGrades', {
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
                            for (let mpsName in global.grades[classObj['Name']]) {
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
                //console.log(responseJson)
                return responseJson
            }).catch((e)=>{
                console.log(e)
                this.setState({hasError:true, error:e.toString()})
            })
    }

    componentDidMount = () => {
        this.getOldFGs().then((FGs) => {
            console.log(JSON.stringify(FGs))
            this.setState({gettingPast:false, gettingCurr:true})
            let pastUnscaledGPA = 0;
            let pastTotalCredits = 0
            for (var year of FGs) {
                for (var classs of year) {
                    if (this.letterGradeToGPA(classs["FG"]) == "error")
                        continue;
                    pastTotalCredits += classs["Credits"];
                    pastUnscaledGPA += this.letterGradeToGPA(classs["FG"]) * classs["Credits"];
                }
            }
            const pastUnweightedGPA = pastUnscaledGPA / pastTotalCredits
            if (pastUnweightedGPA) {
                this.setState({ unweightedOldGPA: pastUnweightedGPA.toFixed(4) })
                AsyncStorage.setItem('unweightedOldGPA', pastUnweightedGPA.toFixed(4))
            }else{
                this.setState({ unweightedOldGPA: "Not Available" })
            }

            let pastUnscaledWeightedGPA = 0;
            let failed = false;
            for (var year of FGs) {
                for (var classs of year) {
                    if (this.letterGradeToGPA(classs["FG"]) == "error")
                        continue;
                    //totalCredits += classs["Credits"];
                    if (classs["Weight"]) {
                        pastUnscaledWeightedGPA += (this.letterGradeToGPA(classs["FG"]) + this.weightToGPABoost(classs["Weight"])) * classs["Credits"];
                    } else {
                        failed = true;
                        Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback button"')
                    }
                }
            }
            console.log(`past frac: ${pastUnscaledWeightedGPA} / ${pastTotalCredits}`)
            const pastWeightedGPA = pastUnscaledWeightedGPA / pastTotalCredits
            if (pastWeightedGPA && !failed) {
                this.setState({ weightedOldGPA: pastWeightedGPA.toFixed(4) })
                AsyncStorage.setItem('weightedOldGPA', pastWeightedGPA.toFixed(4));
            }else{
                this.setState({ weightedOldGPA: "Not Available" })
            }


            this.getNewFGs().then((newFGs) => {
                console.log(JSON.stringify(newFGs))
                this.setState({gettingCurr:false})
                let yrUnscaledGPA = 0
                let yrTotalCredits = 0//-2.5//0

                for (var classs of newFGs) {
                    if(classs["FG"] && this.letterGradeToGPA(classs["FG"]) != "error")
                        continue
                    let total = 0;
                    let totalmpGPA = 0;
                    for (let gradePerMP in classs) {
                        if (gradePerMP.includes("MP")) {
                            if (this.letterGradeToGPA(classs[gradePerMP]) == "error")
                                continue;
                            total++;
                            totalmpGPA += this.letterGradeToGPA(classs[gradePerMP])
                        }
                    }
                    if (total) {
                        yrTotalCredits += classs["Credits"];
                        let classGPA = totalmpGPA / total
                        if (classs["ME"] && classs["FE"] && this.letterGradeToGPA(classs["ME"]) != "error" && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .8 + this.letterGradeToGPA(classs["ME"]) * .1 + this.letterGradeToGPA(classs["FE"]) * .1
                        else if (classs["ME"] && this.letterGradeToGPA(classs["ME"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["ME"]) * .1
                        else if (classs["FE"] && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["FE"]) * .1
                        console.log(classs["Name"] + ": " + classGPA)
                        yrUnscaledGPA += classGPA * classs["Credits"];
                    }
                }
                console.log(`this year unweighted: ${yrUnscaledGPA} / ${yrTotalCredits}`)
                const yrGPA = yrUnscaledGPA / yrTotalCredits;
                if (yrGPA) {
                    this.setState({ unweightedCurrGPA: yrGPA.toFixed(4) })
                    AsyncStorage.setItem('unweightedCurrGPA', yrGPA.toFixed(4))
                }else{
                    this.setState({ unweightedCurrGPA: "Not Available" })
                }

                const newUnscaledGPA = pastUnscaledGPA + yrUnscaledGPA
                const newTotalCredits = pastTotalCredits + yrTotalCredits
                const newGPA = newUnscaledGPA / newTotalCredits;
                if (newGPA) {
                    this.setState({ unweightedNewGPA: newGPA.toFixed(4) })
                    AsyncStorage.setItem('unweightedNewGPA', newGPA.toFixed(4))
                }else{
                    this.setState({ unweightedNewGPA: "Not Available" })
                }

                let yrUnscaledWeightedGPA = 0
                for (var classs of newFGs) {
                    if(classs["FG"] && this.letterGradeToGPA(classs["FG"]) != "error")
                        continue
                    let total = 0;
                    let totalmpGPA = 0;
                    for (let gradePerMP in classs) {
                        if (gradePerMP.includes("MP")) {
                            if (this.letterGradeToGPA(classs[gradePerMP]) == "error")
                                continue;
                            total++;
                            totalmpGPA += this.letterGradeToGPA(classs[gradePerMP])
                        }
                    }
                    if (total) {
                        let classGPA = totalmpGPA / total
                        if (classs["ME"] && classs["FE"] && this.letterGradeToGPA(classs["ME"]) != "error" && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .8 + this.letterGradeToGPA(classs["ME"]) * .1 + this.letterGradeToGPA(classs["FE"]) * .1
                        else if (classs["ME"] && this.letterGradeToGPA(classs["ME"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["ME"]) * .1
                        else if (classs["FE"] && this.letterGradeToGPA(classs["FE"]) != "error")
                            classGPA = classGPA * .9 + this.letterGradeToGPA(classs["FE"]) * .1

                        if (classs["Weight"]) {
                            console.log(`${classs["Name"]} This year weighted: ${(classGPA + this.weightToGPABoost(classs["Weight"])) * classs["Credits"]} (${classGPA})`)
                            yrUnscaledWeightedGPA += (classGPA + this.weightToGPABoost(classs["Weight"])) * classs["Credits"];
                        } else {
                            failed = true;
                            Alert.alert('One or more of your classes does not have a known weighting. Please report this using the "Provide Feedback" button')
                        }
                    }
                }
                console.log(`this year weighted: ${yrUnscaledWeightedGPA} / ${yrTotalCredits}`)
                const yrWeightedGPA = yrUnscaledWeightedGPA / yrTotalCredits
                
                if (yrWeightedGPA && !failed) {
                    this.setState({ weightedCurrGPA: yrWeightedGPA.toFixed(4) })
                    AsyncStorage.setItem('weightedCurrGPA', yrGPA.toFixed(4))
                }else{
                    this.setState({ weightedCurrGPA: "Not Available" })
                }

                const newUnscaledWeightedGPA = pastUnscaledWeightedGPA + yrUnscaledWeightedGPA
                const newWeightedGPA = newUnscaledWeightedGPA / newTotalCredits;
                if (newWeightedGPA && !failed) {
                    this.setState({ weightedNewGPA: newWeightedGPA.toFixed(4), done:true })
                    AsyncStorage.setItem('weightedNewGPA', newWeightedGPA.toFixed(4))
                }else{
                    this.setState({ weightedNewGPA: "Not Available" })
                }

            });
        })
    }

    styles = StyleSheet.create({
        gpaDiv: {
            borderRadius:10, 
            backgroundColor:this.props.theme.colors.grey1, 
            // marginTop:10, 
            marginVertical:15,
            padding: 10,
            shadowOffset: {width: 5, height: 5}, 
            shadowColor: this.props.theme.colors.grey6, 
            shadowOpacity:.2, 
            shadowRadius: 2,
        },
        horizontalRule: {borderBottomColor: 'black',borderBottomWidth: 1},
        subtitle: { fontSize: 13,paddingBottom:15, paddingLeft:7},
        title: { fontSize: 40, textAlign: 'center' },
        numericalContainer: {
            flex:1, 
            flexDirection:'row', 
            justifyContent: "space-between", 
            padding:10, 
            backgroundColor:this.props.theme.colors.grey2, 
            borderRadius:10, 
            marginVertical:3,
            shadowOffset: {width: 1, height: 1}, 
            shadowColor: this.props.theme.colors.grey5, 
            shadowOpacity:.2, 
            shadowRadius: 2,
        },
    })

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
                        {this.state.hasError && <Text style={{color:"red"}}>Error! Most likely a network issue. {this.state.error}</Text>}
                    </Text>}
                    
                    <View style={[this.styles.gpaDiv, {marginTop:10}]}>
                        <Text style={this.styles.title}>Past GPA</Text>
                        <Text style={this.styles.subtitle}>GPA from completed school years</Text>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Unweighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.unweightedOldGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.unweightedOldGPA}</Text>
                        </View>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Weighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.weightedOldGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.weightedOldGPA}</Text>      
                        </View>
                    </View>
                    {/* <View style={this.styles.horizontalRule}/> */}
                    <View style={this.styles.gpaDiv}>
                        <Text style={this.styles.title}>This Year</Text>
                        <Text style={this.styles.subtitle}>A prediction using every grade from this year</Text>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Unweighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.unweightedCurrGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.unweightedCurrGPA}</Text>
                        </View>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Weighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.weightedCurrGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.weightedCurrGPA}</Text>      
                        </View>
                    </View>
                    {/* <View style={this.styles.horizontalRule}/> */}
                    <View style={[this.styles.gpaDiv,{marginBottom:40}]}>
                        <Text style={this.styles.title}>Total GPA</Text>
                        <Text style={this.styles.subtitle}>An estimate of the total GPA you will end the year with</Text>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Unweighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.unweightedNewGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.unweightedNewGPA}</Text>
                        </View>
                        <View style={this.styles.numericalContainer}>
                            <Text style={{ fontSize: 20, color:this.props.theme.colors.cardText }}>Weighted:</Text>
                            <Text style={{ fontSize: 20 }}>{this.state.weightedNewGPA==="Loading..."&&!this.state.hasError?<ActivityIndicator/>:this.state.weightedNewGPA}</Text>      
                        </View>
                    </View>
                </ScrollView>
            </RespectThemeBackground>
        )
    }

}

export default withTheme(GPAScreen)