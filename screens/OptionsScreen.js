import React from 'react';
import { Text, AsyncStorage, ScrollView, LayoutAnimation, Alert, KeyboardAvoidingView, Linking } from 'react-native';
import { ListItem, ButtonGroup, Input } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications'
import '../globals/signInGlobals'
import {preferredBackgroundColor} from '../helperFunctions/darkModeUtil.js'

export default class OptionsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedIndex: 0, token: "null", showCodeInput: false, showA: true }
        try{
            Notifications.getExpoPushTokenAsync().then((token) => {
                token=token.data
                if (typeof token === 'string' &&token.includes("ExponentPushToken"))
                    token = token.substring(17)
                this.setState({ token })
            })
        }catch(e){
            this.setState({ token: "err getting token. Perhaps this isn't a real physical device?\n" + e })
        }


        AsyncStorage.getItem('needBiometric').then((needBiometric) => {
            var needBiometricR = false;
            if (needBiometric === 'true')
                needBiometricR = true;
            LocalAuthentication.isEnrolledAsync().then((isEnrolled) => {
                if (isEnrolled)
                    this.setState({ needBiometric: needBiometricR });
            })
        });
        const displayOptions = ['Percent', 'Letter', 'Hieroglyphic']
        AsyncStorage.getItem('avgDisplayStyle').then((avgDisplayStyle) => {
            if (avgDisplayStyle) {
                this.setState({ selectedIndex: displayOptions.indexOf(avgDisplayStyle) });
            }
        });

        AsyncStorage.getItem('showA').then((showA) => {
            if (showA == "false") {
                this.setState({ showA: false });
            } else {
                this.setState({ showA: true });
            }
        });

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Options',
            headerStyle: navigationHeader,
        }
    }

    signOut = () => {

        AsyncStorage.getItem('username').then((user) => {
            AsyncStorage.getItem('password').then((pass) => {
                AsyncStorage.getItem('school').then((school) => {
                    AsyncStorage.getItem('backgroundColors').then((backgroundColors) => {
                        AsyncStorage.getItem('numberOfAppLaunches').then((numberOfAppLaunches) => {
                            AsyncStorage.clear().then(() => {
                                AsyncStorage.setItem('numberOfAppLaunches', numberOfAppLaunches).then(() => {
                                    if (user && pass && school) {
                                        AsyncStorage.setItem('oldUsername', user).then(() => {
                                            AsyncStorage.setItem('oldPassword', pass).then(() => {
                                                AsyncStorage.setItem('oldSchool', school).then(() => {
                                                    backgroundColors = backgroundColors ? backgroundColors : JSON.stringify({})
                                                    AsyncStorage.setItem('oldBackgroundColors', backgroundColors).then(() => {
                                                        global.signOutGlobal();
                                                    });
                                                });
                                            });
                                        });
                                    } else {
                                        backgroundColors = backgroundColors ? backgroundColors : JSON.stringify({})
                                        AsyncStorage.setItem('oldBackgroundColors', backgroundColors).then(() => {
                                            global.signOutGlobal();
                                        });
                                    }
                                });
                            })
                        })
                    });
                });
            });
        });
    }

    sendTestNotification = () => {
        Notifications.getExpoPushTokenAsync().then((token) => {
            token=token.data
            fetch('https://gradeview.herokuapp.com/testNotification?token=' + token, {
                method: 'GET',
                headers: {
                    Accept: 'text/html',
                    'Content-Type': 'text/html',
                },
            })
            .then((response) => {
                return response.text();
            }).then((responseTxt) => {
                if (responseTxt == "attempted")
                    Alert.alert("You will get a test notification in 30 seconds. Please close the app and wait for the notification. If you don't recieve a notification, please send feedback and try reinstalling the app.")
                else
                    Alert.alert("Something went wrong in the server")
            }).catch((err) => {
                console.log(err)
                Alert.alert("There was an error in communicating with the server")
            })
        }).catch((e) => {
            Alert.alert("There was an error in getting your push token")
        })
    }

    submitCode = () => {
        this.setState({ showCodeInput: false, code: "" })
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (this.state.code) {
            if (this.state.code && this.state.code.includes(":") && this.state.code.split(":")[0].toLowerCase() == "change") {
                AsyncStorage.setItem('password', this.state.code.split(":")[1])
            } else if (this.state.code.toLowerCase() == "ads") {
                AsyncStorage.setItem('noAds', "false")
            } else if (this.state.code.toLowerCase() == "resetschool") {
                AsyncStorage.removeItem('school')
            } else if (this.state.code.toLowerCase() == "applaunches") {
                AsyncStorage.getItem('numberOfAppLaunches').then((num) => {
                    Alert.alert(num)
                })
            }
            else {
                fetch('https://gradeview.herokuapp.com/checkCode?code=' + this.state.code, {
                    method: 'GET',
                    headers: {
                        Accept: 'text/html',
                        'Content-Type': 'text/html',
                    },
                })
                    .then((response) => {
                        return response.text();
                    }).then((responseTxt) => {
                        console.log("res" + responseTxt)
                        if (responseTxt == "true")
                            AsyncStorage.setItem('noAds', "true").then(() => Alert.alert('No Ads Unlocked'))
                        else
                            Alert.alert('Invalid Code')
                    }).catch((err) => Alert.alert('Error Checking Code'))
            }
        }
    }

    render() {
        var switchEl = <Text>Not Available</Text>
        //if()
        //switchEl = 

        //updateAvgDisplayGlobal
        const displayOptions = ['Percent', 'Letter', 'Hieroglyphic']
        return (
            <ScrollView /*style={{backgroundColor:preferredBackgroundColor()}}*/>
                <KeyboardAvoidingView behavior="position">
                    <ListItem
                        leftIcon={{ name: "fingerprint", type: 'material-community' }}
                        title="Secure Biometrics"
                        subtitle={"Secure your grades with by requiring biometrics on app load"}
                        style={{ marginBottom: 5 }}
                        bottomDivider={true}
                        switch={{
                            onValueChange: () => { var val = !this.state.needBiometric; AsyncStorage.setItem('needBiometric', val.toString()).then((result) => { this.setState({ needBiometric: val }); }) },
                            value: this.state.needBiometric,
                            disabled: this.state.needBiometric == null
                        }}
                    />
                    <ListItem
                        leftIcon={{ name: "color-lens", type: 'MaterialIcons' }}
                        chevron
                        title="Assignment Styling"
                        subtitle={"Set the colors for different assignment types"}
                        onPress={() => this.props.navigation.navigate('ColorPick')}
                        bottomDivider={true}
                    />
                    {displayOptions[this.state.selectedIndex] == "Letter" && <ListItem
                        leftIcon={{ name: "plus", type: 'feather' }}
                        title="Show A+"
                        subtitle={"SBHS does not use the grade A+"}
                        style={{ marginBottom: 5 }}
                        bottomDivider={true}
                        switch={{
                            onValueChange: () => { var val = !this.state.showA; this.setState({ showA: val }); updateShowAGlobal(val); },
                            value: this.state.showA,
                        }}
                    />}
                    <ListItem
                        leftIcon={{ name: "eye", type: 'font-awesome' }}
                        title="Display mode"
                        subtitle={"How your marking period grade will be displayed on the home screen"}
                    />

                    <ButtonGroup
                        onPress={(selectedIndex) => { this.setState({ selectedIndex: selectedIndex }); updateAvgDisplayGlobal(displayOptions[selectedIndex]); LayoutAnimation.configureNext(LayoutAnimation.Presets.spring); }}
                        selectedIndex={this.state.selectedIndex}
                        buttons={displayOptions}
                    //containerStyle={{height: 100}}
                    />

                    <ListItem
                        leftIcon={{ name: "user-secret", type: 'font-awesome' }}
                        title="Enter Code"
                        subtitle={"If you have gotten a secret code from the developer. Enter it here!"}
                        style={{ marginTop: 60, marginBottom: 5 }}
                        topDivider={true}
                        onPress={() => { this.setState({ showCodeInput: true }); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); }}
                    />
                    {this.state.showCodeInput && <Input
                        onChangeText={text => this.setState({ code: text })}
                        value={this.state.code}
                        onSubmitEditing={this.submitCode}
                        placeholder="Enter Code Here"
                        returnKeyType="send"
                    />}
                    <ListItem
                        leftIcon={{ name: "feedback", type: 'MaterialIcons' }}
                        title="Provide Feedback"
                        subtitle={"Any kind of feedback is appreciated!"}
                        topDivider={true}
                        onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app')}
                    />
                    <ListItem
                        leftIcon={{ name: "log-out", type: 'entypo' }}
                        title="Switch User"
                        subtitle={"Sign into a different account"}
                        style={{ marginBottom: 20 }}
                        topDivider={true}
                        onPress={this.signOut}
                    />
                    <ListItem
                        title="Debug info"
                        subtitle={this.state.token}
                        topDivider={true}
                    />
                    <ListItem
                        title="Send a test notification"
                        subtitle={'Some people were worried they were not getting notifications. \nPressing this button will send you a notification 30 seconds after pressing it.'}
                        onPress={this.sendTestNotification}
                        topDivider={true}
                    />
                </KeyboardAvoidingView>
            </ScrollView>
            /*
            
                  
              return(
                <ScrollView style={{flex: 1, flexDirection: 'column', padding:10}}>
        
                  <Text style={{fontSize:20}}>Secure biometrics: {switchEl}</Text>
        
        
                  <Button 
                  
                  title="Provide Feedback" 
                  />
        
                <ButtonGroup
                  onPress={(selectedIndex) => { this.setState({ selectedIndex: selectedIndex }); updateAvgDisplayGlobal(displayOptions[selectedIndex]) }}
                  selectedIndex={this.state.selectedIndex}
                  buttons={displayOptions}
                //containerStyle={{height: 100}}
                />
        
                <ListItem
                  leftIcon={{ name: "feedback", type: 'MaterialIcons' }}
                  title="Provide Feedback"
                  subtitle={"Any kind of feedbacks is appricated!"}
                  style={{ marginTop: 60, marginBottom: 5 }}
                  topDivider={true}
                  onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app')}
                />
                <ListItem
                  leftIcon={{ name: "log-out", type: 'entypo' }}
                  title="Switch User"
                  subtitle={"Sign into a different account"}
                  style={{ marginBottom: 20 }}
                  topDivider={true}
                  onPress={this.signOut}
                />
                <ListItem
                  title="Debug info"
                  subtitle={this.state.token}
                  topDivider={true}
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