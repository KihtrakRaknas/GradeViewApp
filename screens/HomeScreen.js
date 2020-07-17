import React from 'react';
import { Text, View, ActivityIndicator, Alert, Button, ScrollView, Picker, RefreshControl, Platform, AsyncStorage } from 'react-native';
import LoadInComponent from '../components/LoadInComponent'
import Modal from 'react-native-modal';
import ClassBtn from '../components/ClassBtn'
import { navigationHeader } from '../globals/styles'
import '../globals/homeScreenGlobals.js'

export default class HomeScreen extends LoadInComponent {
    constructor(props) {
        super(props);
        console.log("GERNERATING")
        this.state = { isLoading: false, email: "", password: "", num: 0, currentMarking: "Select MP", style: "Percent", firstMPSRender: true }

        this.firstMPSRender = false;
        console.log("GERNERATING DONE")

        global.updateAvgDisplayGlobal = global.updateAvgDisplayGlobal.bind(this)

        AsyncStorage.getItem("avgDisplayStyle").then((style) => {
            if (style)
                this.setState({ style: style })
        })

        this.props.navigation.setParams({ click: this.click, genMpsArray: this.genMpsArray, genMpSelector: this.genMpSelector, updateMarkingPeriodSelectionAndriod: this.updateMarkingPeriodSelectionAndriod });


        AsyncStorage.getItem('MPS').then((oldMps) => {
            console.log("oldMps - constructor")
            oldMps = JSON.parse(oldMps);
            oldMps = oldMps ? oldMps : [];
            console.log("old: " + JSON.stringify(oldMps))
            this.setState({ oldMps })
            console.log("mps str" + JSON.stringify(mps))
        })
    }

    componentDidMount = () => {
        //SplashScreen.hide()
    }

    static navigationOptions = ({ navigation }) => {
        var text = navigation.getParam('currentMarking', 'Select a MP');
        //var genMpsArray = navigation.getParam('genMpsArray',()=>{})();

        if (typeof text != "string") {
            text = "Select a MP"
        }

        var androidEl = <Text>Select a MP</Text>;
        //console.log(this.state.currentMarking)
        if (text != "Select a MP") {
            androidEl = <Picker
                selectedValue={text}
                style={{ height: 200, width: 100 }}
                onValueChange={(itemValue, itemIndex) => {
                    navigation.getParam('updateMarkingPeriodSelectionAndriod', () => { })(itemValue);
                }}
            >
                {navigation.getParam("genMpSelector", <Text>Select a MP</Text>,)()}
            </Picker>
        }
        const headerEl = Platform.select({
            ios:
                <View>
                    <Button
                        onPress={navigation.getParam('click', () => { })}
                        title={text}//{navigation.getParam('currentMarking','Select a MP')}//{this.state.currentMarking}//
                    />
                </View>,
            android: androidEl

        });
        return {
            title: 'Home',
            headerStyle: navigationHeader,
            headerRight: (
                headerEl
            ),
        }
    };

    genMpSelector = () => {
        var pickerArry = [];
        var mps = this.genMpsArray();
        console.log("MPS");
        for (mp of mps) {
            pickerArry.push(<Picker.Item label={mp} value={mp} key={mp} />);
        }
        return pickerArry

    }

    genMpsArray = () => {
        var mps = [];
        for (classN in global.grades) {
            if (classN != "Status") {
                for (marking in global.grades[classN]) {
                    //console.log("MARK1: "+marking+"MARK2: "+classN);
                    //console.log(global.grades[classN]);
                    if (Number(marking.substring(2))) {
                        if (!mps.includes(marking))
                            mps.push(marking);
                    }
                }
            }
        }
        return mps.sort();
    }

    genTable = () => {
        var table = []
        var count = 0;
        var mps = this.genMpsArray();
        //console.log(global.grades)
        var ClassNames = [];
        if (global.grades)
            ClassNames = Object.keys(global.grades).sort()
        for (classN of ClassNames) {
            var maxMarking = this.state.currentMarking;
            //console.log(maxMarking);
            var avg = "";
            var teach = "";
            if (global.grades[classN][maxMarking]) {
                if (global.grades[classN][maxMarking]["avg"]) {
                    // console.log("YEE2T")
                    avg = global.grades[classN][maxMarking]["avg"]
                    // console.log(avg);

                }
            }
            if (global.grades[classN]["teacher"])
                teach = global.grades[classN]["teacher"]
            // console.log(classN);
            if (count != 0) {
                //Adds the seperator
                //table.push(<View key={count} style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '90%', backgroundColor: '#C8C8C8', }}/></View>);
                count++;
            }
            // console.log("avg")
            // console.log(avg)
            if (classN != "Status" && avg) {
                table.push(<ClassBtn key={classN + count} title={classN} teach={teach} avg={avg} onPress={this.classClicked} style={this.state.style}></ClassBtn>)
                count++;
            }
        }
        console.log("DONE");
        return table
    }

    click = () => {
        //console.log(global.grades);

        this.setState({
            visibleModal: !this.state.visibleModal,
        });
    }

    classClicked = (className) => {
        this.props.navigation.navigate('Class', { className: className, markingPeriod: this.state.currentMarking })
    }

    updateMarkingPeriodSelectionAndriod = (newMP) => {
        this.props.navigation.setParams({ currentMarking: newMP });
        this.setState({ currentMarking: newMP })
        AsyncStorage.setItem('MP', newMP)
    }

    refresh = () => {
        this.setState({ refreshing: true });
        this.getGradeWithoutErrorCatching().then(() => {
            this.setState({ refreshing: false });
        }).catch((error) => {
            this.setState({ refreshing: false });
            Alert.alert("Network Issue!\n Make sure you have a internet connection")
        });
    }

    render() {
        if (this.state.isLoading)
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                    <Text style={{ padding: 20, paddingBottom: 50 }}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>

                    <Button title="Problem?" onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app')} />
                </View>
            )

        var mps = this.genMpsArray();
        if (this.state.oldMps && mps && this.state.oldMps.length < mps.length) {
            this.setState({ oldMps: mps })
            if (mps.length > 0) {
                AsyncStorage.setItem('MP', mps[mps.length - 1]).then(() => {

                    this.props.navigation.setParams({ currentMarking: mps[mps.length - 1] });
                    this.setState({ currentMarking: mps[mps.length - 1] });
                    console.log("RESET")
                    //console.log(mps[mps.length-1])  
                })
                AsyncStorage.setItem('MPS', JSON.stringify(mps))
            }

        }

        console.log("render - " + this.state.currentMarking)
        if (this.state.currentMarking == "Select MP")
            AsyncStorage.getItem('MP').then((mp) => {
                console.log("mp")
                //console.log(mp)
                console.log("new" + mps)
                if (!mp || (mps.length > 0 && !mps.includes(mp))) {
                    console.log("ENFORCED NEW2")
                    if (mps.length > 0) {
                        AsyncStorage.setItem('MP', mps[mps.length - 1]).then(() => {

                            this.props.navigation.setParams({ currentMarking: mps[mps.length - 1] });
                            this.setState({ currentMarking: mps[mps.length - 1] });
                            console.log("RESET")
                            //console.log(mps[mps.length-1])  
                        })
                    }
                } else {
                    this.props.navigation.setParams({ currentMarking: mp });
                    this.setState({ currentMarking: mp });
                }
            });
        return (
            <ScrollView style={{ flex: 1, flexDirection: 'column' }} refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.refresh}
                />
            }>

                <Modal
                    isVisible={this.state.visibleModal}
                    isOpen={this.state.visibleModal}
                    style={{
                        justifyContent: 'flex-end',
                        margin: 0,
                    }}
                    onRequestClose={() => this.setState({ visibleModal: false })}
                >
                    <View style={{ backgroundColor: 'white', padding: 22, justifyContent: 'center', alignItems: 'center', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)', }}>
                        <Picker
                            selectedValue={this.state.currentMarking}
                            style={{ height: 200, width: 100 }}
                            onValueChange={(itemValue, itemIndex) => {
                                AsyncStorage.setItem('MP', itemValue).then(() => { })
                                this.props.navigation.setParams({ currentMarking: itemValue });
                                this.setState({ currentMarking: itemValue })
                            }
                            }>
                            {this.genMpSelector()}
                        </Picker>
                        <Button title="Close" onPress={() => {
                            //AsyncStorage.setItem('MP', this.state.currentMarking)
                            //this.props.navigation.setParams({ currentMarking: this.state.currentMarking});
                            this.setState({ visibleModal: false /*, currentMarking: this.state.currentMarking*/ });
                            //})
                        }
                        } />
                    </View>
                </Modal>

                {this.genTable()}


            </ScrollView>


        )
    }
}
