import React from 'react';
import { Text, AsyncStorage, Alert, Button, View, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import '../globals/signInGlobals'
import { Icon } from 'react-native-elements'

export default class SignInScreen extends React.Component {

    constructor(props) {
      super(props);
      this.state = { isLoading: false, email: "", password: "", }
  
    }
  
    componentDidMount = () => {
      //SplashScreen.hide()
    }
  
    componentWillMount = () => {
      AsyncStorage.getItem('oldUsername').then((user) => {
        if (user) {
          this.setState({ OldAccount: true })
        } else {
          this.setState({ OldAccount: false })
        }
      })
    }
  
    verify = () => {
      var email = this.state.email;
      var pass = this.state.password;
      if (!(email && pass)) {
        Alert.alert("Enter an ID number and password");
        return 0;
      }
      email = email + "@sbstudents.org";
      this.verifyWithParams(email, pass)
    }
  
    verifyUsingOldCredentials = () => {
      AsyncStorage.getItem('oldUsername').then((user) => {
        AsyncStorage.getItem('oldPassword').then((pass) => {
          this.verifyWithParams(user, pass)
          AsyncStorage.getItem('oldBackgroundColors').then((backgroundColor) => {
            if (backgroundColor)
              AsyncStorage.setItem('backgroundColors', backgroundColor)
            //updateBackgroundColorsGlobal(JSON.parse(backgroundColor))
          })
        })
      })
    }
  
    verifyWithParams = (email, pass) => {
      if (!(email && pass)) {
        Alert.alert("Enter an ID number and password");
        return 0;
      }
      //email = email+"@sbstudents.org"; Done in verify function
      this.setState({
        isLoading: true,
      });
      //Alert.alert(this.state.email+":"+this.state.password);
      return fetch('https://gradeview.herokuapp.com/check', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,//10012734 //await AsyncStorage.getItem('username')
          password: pass,//Sled%2#9 //await AsyncStorage.getItem('password')
        }),
      })
        .then((response) => {
          console.log(typeof response)
          return response.json();
        })
        .then((responseJson) => {
          //console.log(responseJson);
          if (responseJson['valid'] == true) {
            AsyncStorage.setItem('username', email).then(() => {
              AsyncStorage.setItem('password', pass).then(() => {
                global.signInGlobal();
              });
            });
  
          } else {
            Alert.alert("Invalid username - password combination!");
          }
          this.setState({
            isLoading: false,
          });
        }).catch((error) => {
          Alert.alert("Network Issue! Make sure you have a internet connection")
          console.log(error);
          this.setState({
            isLoading: false,
          });
        });
    }
  
    onChangeText = (key, val) => {
      this.setState({ [key]: val })
    }
  
    render() {
      var cancelBtn = null;
      if (this.state.OldAccount)
        cancelBtn = <Button title="Cancel (Go back to your account)" color="#ff5c5c" onPress={this.verifyUsingOldCredentials} />
      var btnText = <Text style={{ fontSize: 30, fontWeight: '400', color: "#fff", }}>Sign In</Text>
      if (this.state.isLoading) {
        btnText = <ActivityIndicator size="large" color="#ffffff" />;
      }
  
      return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#373a6d" }}>
          <View style={{ flexDirection: 'row', backgroundColor: "#FFFFFF", margin: 20, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 15, }}>
            <FontAwesome
              name='id-badge'
              size={30}
              color="#373a6d"
            />
            <TextInput
              editable={!this.state.isLoading}
              style={{ flex: 1, fontSize: 20, paddingHorizontal: 11 }}
              keyboardType={'number-pad'}
              autoCorrect={false}
              placeholder="ID number"
              onChangeText={val => this.onChangeText('email', val)}
            />
  
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: "#FFFFFF", margin: 20, borderRadius: 5, paddingHorizontal: 10, paddingVertical: 10, marginVertical: 15, }}>
            <Icon
              name='lock'
              type='FontAwesome5'
              size={30}
              color="#373a6d"
            />
            <TextInput
              editable={!this.state.isLoading}
              style={{ flex: 1, fontSize: 20, paddingHorizontal: 8 }}
              autoCorrect={false}
              secureTextEntry
              placeholder="Password"
              onChangeText={val => this.onChangeText('password', val)}
              onSubmitEditing={this.verify}
            />
  
          </View>
          <TouchableOpacity
            disabled={this.state.isLoading}
            style={{
              backgroundColor: "#6fc2d0",
              paddingHorizontal: 15,
              paddingVertical: 15,
              borderRadius: 15,
              width: "80%", alignItems: 'center',
              marginVertical: 30,
            }}
            onPress={this.verify}
  
          >
            {btnText}
          </TouchableOpacity>
  
          {cancelBtn}
  
          <View>
            <Text style={{ fontSize: 10, padding: 10, color: "white" }}>Note: Your password will be encrypted and stored on our servers so we can get your grades for you</Text>
            <Text style={{ fontSize: 10, padding: 10, color: "white" }}>This app is not affiliated with any school. It was created by a student.</Text>
          </View>
        </KeyboardAvoidingView>
      )
    }
  
  }