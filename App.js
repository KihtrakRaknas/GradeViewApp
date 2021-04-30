import React from 'react';
import { View, Button, StatusBar, UIManager, Appearance } from 'react-native';
//import { createBottomTabNavigator, createAppContainer, TabBarBottom, createStackNavigator } from 'react-navigation';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, TabBarBottom } from 'react-navigation-tabs';

import { Icon, ThemeProvider } from 'react-native-elements'
import { AsyncStorage } from 'react-native';
require('create-react-class');
import * as Notifications from 'expo-notifications'

import { Platform } from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SplashScreen from 'expo-splash-screen'
import RespectThemeBackground from './components/RespectThemeBackground.js'
import { Text } from 'react-native-elements';
//import { Accelerometer } from 'expo-sensors';

//SCREENS
import HomeScreen from './screens/HomeScreen'
import AssignmentListScreen from './screens/AssignmentListScreen'
import AssignmentScreen from './screens/AssignmentScreen'
import OptionsScreen from './screens/OptionsScreen'
import MoreScreen from './screens/MoreScreen'
import GPAScreen from './screens/GPAScreen'
import ClassScreen from './screens/ClassScreen'
import ContactsScreen from './screens/ContactsScreen'
import ScannedListScreen from './screens/ScannedListScreen'
import CameraScreen from './screens/CameraScreen'
import ColorPickScreen from './screens/ColorPickScreen'
import SignInScreen from './screens/SignInScreen'
import ReferralScreen from './screens/ReferralScreen'

import {signOutGlobal, signInGlobal} from './globals/signInGlobals'

// import { SafeAreaView } from 'react-navigation';
// if (Platform.OS === 'android') {
//   SafeAreaView.setStatusBarHeight(0);
// }


const HomeStack = createStackNavigator({
  Home: { screen: HomeScreen },
  Class: { screen: ClassScreen },
  Assignment: { screen: AssignmentScreen }
});

const AssignmentsStack = createStackNavigator({
  Assignments: { screen: AssignmentListScreen },
  Assignment: { screen: AssignmentScreen }
});

const SettingsStack = createStackNavigator({
  Settings: { screen: MoreScreen },
  Options: { screen: OptionsScreen },
  Contacts: { screen: ContactsScreen },
  GPA: { screen: GPAScreen },
  ColorPick: { screen: ColorPickScreen },
  ScannedList: { screen: ScannedListScreen },
  Camera: { screen: CameraScreen },
  Referral: {screen: ReferralScreen}
});

const TabNav = createBottomTabNavigator(
  {
    Home: { screen: HomeStack },
    Assignments: { screen: AssignmentsStack },

    More: { screen: SettingsStack },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName = "list_alt";
        let type = "material"
        if (routeName === 'Home') {
          type = "FontAwesome5"
          iconName = "home"//`${focused ? 'infocirlce' : 'infocirlceo'}`;
        } else if (routeName === 'Assignments') {
          // if (focused) {
          //   type = "ionicon";
          //   iconName = 'ios-list-box'
          // } else {
            iconName = 'view-headline'
          // }

          //iconName = `${focused ? 'ios-list-box' : 'view-headline'}`; // assignment
        } else if (routeName === 'More') {
          iconName = `more-horiz`;
          type = 'MaterialIcons';
        }
        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} type={type} />;//<Ionicons name="md-checkmark-circle" size={32} color="green" />//
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: '#ff8246',
      inactiveTintColor: 'white',
      style: {
        backgroundColor: '#373a6d'
      },
    },
    animationEnabled: true,
    swipeEnabled: false,
  }
)

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AppContainer = createAppContainer(TabNav)
export default class App extends React.Component {
  constructor() {
    super();
    try {
      SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.warn(e);
    }
    global.signOutGlobal = signOutGlobal.bind(this);
    global.signInGlobal = signInGlobal.bind(this);
    this.state = { user: 8, debug: false, pass: [], txt: "Unfortunately, the district's IT division has decided that this app must be shutdown. I have not been informed of any rules or policies that were violated, but nonetheless, I was instructed to pour 2 long months' worth of work down the drain..." };
    this.returningUser();
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    //This is old code from the whole "fake shutdown" thing
    /*AsyncStorage.getItem('debug').then((debug)=>{
      if(debug=="true")
      this.returningUser();
    })
    setTimeout(()=>{this.setState({txt: ""})},15000);
    setTimeout(()=>{this.setState({txt: "Unfortunately, the district's IT division has decided that students must use the Genesis online site, despite it being absolute garbage. I have not been informed of any rules or policies that were violated, but nonetheless, I was told to take the app down."})},16000);*/
  }

  returningUser = () => {
    this.setState({ debug: false })
    AsyncStorage.setItem("debug", "true")
    AsyncStorage.getItem('username').then((user) => {
      console.log(user);
      AsyncStorage.getItem('needBiometric').then((needBiometric) => {
        if (needBiometric === 'true')
          LocalAuthentication.isEnrolledAsync().then((valid) => {
            if (valid)
              LocalAuthentication.authenticateAsync("Authenticate to view grades").then((result) => {
                if (result["success"])
                  this.setState({ user: user })
                else
                  this.setState({ user: 8 })
              })
            else
              this.setState({ user: user })
          })
        else
          this.setState({ user: user })
      })
    });
  }
  componentDidMount() {
    //this._subscribe();
    this._notificationSubscription = Notifications.addNotificationReceivedListener(this._handleNotification.bind(this));
  }

  /*
  componentWillUnmount() {
    this._unsubscribe();
  }

  _subscribe = () => {
    this._subscription = Accelerometer.addListener(
      accelerometerData => {
        let magnitude = Math.pow(Math.pow(accelerometerData.x, 2) + Math.pow(accelerometerData.y, 2) + Math.pow(accelerometerData.z, 2), .5)

        if (Math.abs(magnitude - 1) > 5 && this.state.user == 9)
          this.setState({ debug: true })
      }
    );
    Accelerometer.setUpdateInterval(
      16
    );
  };

  _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };
  */

  _handleNotification = (notification) => {
    console.log(`notif callback called`)
    console.log(`notif: ${JSON.stringify(notification, null, 2)}`)
    if (notification&&notification.request.content.body&&this.toast)
        this.toast.show(notification.request.content.body);
  }

  returningUser = () => {
    //this.setState({debug:false})
    AsyncStorage.setItem("debug", "true")
    AsyncStorage.getItem('username').then((user) => {
      console.log(user);
      AsyncStorage.getItem('needBiometric').then((needBiometric) => {
        if (needBiometric === 'true')
          LocalAuthentication.isEnrolledAsync().then((valid) => {
            if (valid)
              LocalAuthentication.authenticateAsync("Authenticate to view grades").then((result) => {
                if (result["success"])
                  this.setState({ user: user })
                else
                  this.setState({ user: 8 })
              })
            else
              this.setState({ user: user })
          })
        else
          this.setState({ user: user })
      })

    });
  }

  /*
  colorClicked = async (color) => {
    switch (color) {
      case 0:
        var arr = this.state.pass;
        arr.push(0)
        this.setState({ pass: arr })
        let notification2 = await Notifications.getExpoPushTokenAsync();
        this.refs.toast.show("Token: " + notification2);
        break;
      case 1:
        AsyncStorage.getItem("username").then((user) => {
          this.refs.toast.show((!!user).toString());
        })
        var arr = this.state.pass;
        arr.push(1)
        this.setState({ pass: arr })
        break;
      case 2:
        this.refs.toast.show("Toast Test");
        var arr = this.state.pass;
        arr.push(2)
        this.setState({ pass: arr })
        break;
      default:
        this.refs.toast.show("Reset");
        this.setState({ pass: [] })
    }
    const passArr = [1, 1, 2, 3, 5, 8]
    console.log(this.state.pass)
    if (this.state.pass.length == 6) {
      var current = true
      for (index in this.state.pass) {
        if (this.state.pass[index] != passArr[index] % 3)
          current = false
      }
      if (current) {
        this.returningUser()
      }

    }
  }
  

  onChangeText = (val) => {
    this.setState({ emailForUpdate: val })
  }

  subEmail = () => {
    this.setState({ emailIsLoading: true })
    this.state.emailForUpdate
    if (this.state.emailForUpdate && this.validateEmail(this.state.emailForUpdate)) {
      fetch('https://gradeview.herokuapp.com/emailList', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.state.emailForUpdate
        }),
      })
        .then((response) => {
          console.log(typeof response)
          return response.json();
        })
        .then((responseJson) => {
          Alert.alert("Recorded. We will notify you of updates.")
          console.log(responseJson)
          this.setState({ emailIsLoading: false })
        }).catch((error) => {
          Alert.alert("Network Issue! Make sure you have a internet connection")
          console.log(error);
          this.setState({ emailIsLoading: false })
        });
    } else {
      Alert.alert("Invalid Email!")
      this.setState({ emailIsLoading: false })
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  */

  render() {
    /*
    if (this.state.debug)
      return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Toast ref="toast" /><Text>Debuging tools</Text>
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity onPress={() => this.colorClicked(0)} style={{ width: 50, height: 50, backgroundColor: 'powderblue' }} />
          <TouchableOpacity onPress={() => this.colorClicked(1)} style={{ width: 50, height: 50, backgroundColor: 'skyblue' }} />
          <TouchableOpacity onPress={() => this.colorClicked(2)} style={{ width: 50, height: 50, backgroundColor: 'steelblue' }} />
          <TouchableOpacity onPress={() => this.colorClicked(-1)} style={{ width: 50, height: 50, backgroundColor: 'red' }} />
        </View>

      </View>;
    let btnText = <Text>Submit</Text>;
    if (this.state.emailIsLoading)
      btnText = <ActivityIndicator />;
    if (this.state.user == 9)
      return (<KeyboardAvoidingView behavior="position" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, alignItems: 'center', }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>Until further notice</Text>
        <Text style={{ fontSize: 25, marginBottom: 20 }}>GradeView will not be usable</Text>
        <Text style={{ fontSize: 20 }}>{this.state.txt}</Text>
        <Text style={{ fontSize: 20, marginTop: 10 }}>If you would like to be notified about updates with the app (i.e. the app is usable again) please enter an email that you check here:</Text>
        <View style={{ flexDirection: 'row', backgroundColor: "#EEEEEE", margin: 5, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 15, }}>
          <FontAwesome
            name='envelope'
            size={30}
            color="#373a6d"
          />
          <TextInput
            editable={!this.state.emailIsLoading}
            style={{ flex: 1, fontSize: 20, paddingHorizontal: 11 }}
            keyboardType={'email-address'}
            autoCorrect={false}
            placeholder="Email that you check"
            onChangeText={val => this.onChangeText(val)}
            onSubmitEditing={this.subEmail}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            disabled={this.state.emailIsLoading}
            style={{
              backgroundColor: "#6fc2d0",
              paddingHorizontal: 15,
              paddingVertical: 15,
              borderRadius: 15,
              width: "80%", alignItems: 'center',
              marginVertical: 5,
              marginHorizontal: 5,
              flex: 1
            }}
            onPress={this.subEmail}
          >{btnText}</TouchableOpacity>
        </View>
      </KeyboardAvoidingView>);
    else
    */
    SplashScreen.hideAsync()
    console.log(this.state.user)
    if (this.state.user == 8)
      return <ThemeProvider useDark={Appearance.getColorScheme() === 'dark'}><RespectThemeBackground ><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Please Authenticate</Text><Button title="Authenticate Again" onPress={this.returningUser}></Button></View></RespectThemeBackground></ThemeProvider>;
    if (this.state.user) {
      console.log("tab nav");
      console.log(`color: ${Appearance.getColorScheme()}`)
      return <ThemeProvider useDark={Appearance.getColorScheme() === 'dark'}><View style={{ flex: 1 }}><StatusBar translucent hidden={false} barStyle="dark-content" backgroundColor="#6fc2d0"/><Toast ref={(toast) => this.toast = toast} /><AppContainer /></View></ThemeProvider>;
    }
    return <SignInScreen />;
  }
}
