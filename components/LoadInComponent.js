import React from 'react';
import { AsyncStorage, AppState, Alert } from 'react-native';
import * as Permissions from 'expo-permissions'
import * as Notifications from 'expo-notifications'
import '../globals/signInGlobals'

export default class LoadInComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: global.grades == null }
    }
    componentWillMount() {
        console.log("LOADIN COMPONENT RUNNIN")
        console.log("LOADIN COMPONENT DONE!!!")
        console.log(AppState.currentState)
        AppState.addEventListener('change', this._handleAppStateChange);
        AsyncStorage.getItem('username').then((user) => {
            console.log("TEST")
            console.log(user);
            if (user == null) {
                global.signOutGlobal();
            } else {
                this._retrieveData()
                this.getGrade()
                this.registerForPushNotificationsAsync(user)
            }
        })
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState && this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.getGrade()
        }
        this.setState({ appState: nextAppState });
    }

    registerForPushNotificationsAsync = async (user) => {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
        let token = await Notifications.getExpoPushTokenAsync();
        token=token.data
        console.log(token)
        AsyncStorage.getItem('password').then((pass) => {
            AsyncStorage.getItem('school').then((school) => {
                return fetch("https://gradeview.herokuapp.com/addToken", {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: {
                            value: token,
                        },
                        user: {
                            username: user,
                            password: pass,
                            school: school,
                        },
                    }),
                })
            });
        });
    }

    getGrade = async () => {
        return this.getGradeWithoutErrorCatching().catch((error) => {
            //console.error(error);
        });
    }


    getGradeWithoutErrorCatching = async () => {
        this.props.navigation.setParams({ loading: true });
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
                school: await AsyncStorage.getItem('school'),
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((responseJson) => {
                if (responseJson && responseJson["Status"] == "Invalid") {
                    Alert.alert("Error! The saved credentials did not work. If you changed your password recently, try signing out and then back into your account (with your new password).")
                }else if (responseJson && responseJson["Status"] != "loading...") {
                    global.grades = responseJson;
                    console.log("GRADES UPDATED")
                    AsyncStorage.setItem('grades', JSON.stringify(responseJson));
                    this.setState({
                        isLoading: false,
                    });
                }else {
                    this.runGetGrades()
                }
                this.props.navigation.setParams({ loading: false })
            })
    }

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('grades');
            if (value != null) {
                var jsonVal = JSON.parse(value)
                global.grades = jsonVal;
                console.log("LOCALLY STORED");
                this.setState({
                    isLoading: false,
                });
            } else {
                this.setState({
                    isLoading: true,
                });
            }
        } catch (error) {
            // Error retrieving data
        }
    };

    runGetGrades() {
        setTimeout(() => {
            this.getGrade()
        }, 10000);
    }
}