import React from 'react';
import { Text, AsyncStorage, Alert, Button, View, ActivityIndicator, LayoutAnimation, TouchableOpacity, TextInput, Linking } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { FontAwesome } from '@expo/vector-icons';
import '../globals/signInGlobals'
import { Icon, ListItem } from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler';
import TouchableScale from 'react-native-touchable-scale'; 
import { SafeAreaView } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import {decode as atob, encode as btoa} from 'base-64';

export default class SignInScreen extends React.Component {

    schools=[
      {
        name:"South Brunswick School District",
        ending:"sbstudents.org",
        acronym: "SB",
        numericUsername: true,
        applyEnding:true,
      },
      {
        // name:"Middlesex County Vocational and Technical Schools",
        name:"Middlesex County Magnet Schools",
        // ending:"mcvts.net",
        ending: "mcmsnj.net",
        acronym: "MCMS",
        numericUsername: false,
        applyEnding:false,
      },
      {
        name:"Montgomery Township School District",
        ending:"mtsdstudent.us",
        acronym: "MTSD",
        numericUsername: false,
        applyEnding:true,
      },
      {
        name:"Morris County Vocational School District",
        ending:"mcvts.org",
        acronym: "MCVSD",
        numericUsername: false,
        applyEnding:true,
      },
      {
        name:"West Windsor-Plainsboro Regional School District",
        ending:"wwprsd.org",
        acronym: "WWP",
        numericUsername: false,
        applyEnding:true,
      },
      {
        name:"East Brunswick Public Schools",
        ending:"ebnet.org",
        acronym: "EBPS",
        numericUsername: false,
        applyEnding:true,
      },
      {
        name:"Bernards Township School District",
        ending:"bernardsboe.com",
        acronym: "BTSD",
        numericUsername: false,
        applyEnding:true,
      }
    ]

    constructor(props) {
      super(props);
      this.state = { isLoading: false, email: "", password: "", school: null}
    }
  
    componentDidMount = () => {
      //SplashScreen.hide()
    }
  
    UNSAFE_componentWillMount = () => {
      AsyncStorage.getItem('oldSchool').then((ending) => {
        if (ending) {
          const school = this.schools.find(school=>school.ending == ending)
          this.setState({ OldAccount: ending, school: school})
        } else {
          this.setState({ OldAccount: false })
        }
      })
    }
  
    verify = () => {
      var email = this.state.email;
      var pass = this.state.password;
      const matches = pass.match(/^atob\("(\S*)"\)$/)
      if(matches){
        pass = atob(matches[1])
        console.log(matches[1])
      }
      var schoolEnding = this.state.school.ending
      if (!(email && pass)) {
        Alert.alert("Enter an ID number and password");
        return 0;
      }

      email = email.trim()
      if(this.state.school.applyEnding){
        if(email.includes("@")){
          if(!email.includes(schoolEnding))
             return Alert.alert("You used an unsupported email ending. \nPlease make sure you are using either your school email or school username.\n(Do not use parent portal login)");
        }else{
          email = email + (this.state.school.applyEnding?"@"+schoolEnding:"");
        }
      }
      this.verifyWithParams(email, pass, schoolEnding)
    }
  
    verifyUsingOldCredentials = () => {
      AsyncStorage.getItem('oldUsername').then((user) => {
        AsyncStorage.getItem('oldPassword').then((pass) => {
          AsyncStorage.getItem('oldSchool').then((school) => {
            this.verifyWithParams(user, pass, school)
            AsyncStorage.getItem('oldBackgroundColors').then((backgroundColor) => {
              if (backgroundColor)
                AsyncStorage.setItem('backgroundColors', backgroundColor)
              //updateBackgroundColorsGlobal(JSON.parse(backgroundColor))
            })
          })
        })
      })
    }
  
    verifyWithParams = (email, pass, schoolEnding) => {
      if (!(email && pass)) {
        Alert.alert("Enter an ID number and password");
        return 0;
      }

      //email = email+"@sbstudents.org"; Done in verify function
      this.setState({
        isLoading: true,
      });
      //Alert.alert(this.state.email+":"+this.state.password);
      return fetch('https://gradeviewapi.kihtrak.com/check', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,//10012734 //await AsyncStorage.getItem('username')
          password: pass,//Sled%2#9 //await AsyncStorage.getItem('password')
          school: schoolEnding,
          referrer: global.referrerEmail,
          referrerSchool: global.referrerSchool
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
                AsyncStorage.setItem('school', schoolEnding).then(() => {
                  global.signInGlobal();
                }); 
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
      if(this.state.school)
        return this.textFeildPage()
      return this.showSchools()
    }

    showSchools = () =>{
      let buttons = this.schools.map(schoolInfo=><ListItem
        Component={TouchableScale}
        friction={90}
        tension={100}
        activeScale={0.95}
        linearGradientProps={{
          colors: ['#6fc2d0', '#373a6d'],
          start: { x: 1, y: 0 },
          end: { x: 0, y: 0 },
        }}
        ViewComponent={LinearGradient}
        title={schoolInfo.name}
        titleStyle={{ color: 'white', fontWeight: 'bold' }}
        key={schoolInfo.ending}
        containerStyle = {{ 
          marginLeft: 15,
          marginRight: 15, 
          marginTop: 20, 
          borderRadius: 10, // adds the rounded corners
          backgroundColor: '#fff' 
        }}
        chevron
        subtitleStyle={{color:"white"}}
        subtitle={`Your account ends in ${schoolInfo.ending}`}
        onPress={()=>{
          LayoutAnimation.configureNext({
            duration: 100,
            create:{
              type:"linear",
              property:"scaleY"
            },
          });
          this.setState({school:schoolInfo})
        }}
      />)
      return(<SafeAreaView style={{ flex: 1, backgroundColor: "#373a6d"}}>
        <ScrollView style={{flex: 1, flexDirection: 'column'}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical:50 }}>
          <Text style={{fontSize:40, textAlign:"center", color:"white", marginBottom:20, fontWeight:"bold", textDecorationLine: 'underline'}}>Select a school</Text>
          {buttons}
        </ScrollView>
      </SafeAreaView>)
    }

    textFeildPage = () =>{
      var cancelBtn = null;
      if (this.state.OldAccount && this.state.OldAccount == this.state.school.ending)
        cancelBtn = <Button title="Cancel (Go back to your account)" color="#ff5c5c" onPress={this.verifyUsingOldCredentials} />
      var btnText = <Text style={{ fontSize: 30, fontWeight: '400', color: "#fff", }}>Sign In</Text>
      if (this.state.isLoading) {
        btnText = <ActivityIndicator size="large" color="#ffffff" />;
      }
  
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#373a6d", justifyContent: 'center', alignItems: 'center',}}>
          <KeyboardAwareScrollView style={{ backgroundColor: "#373a6d" }} contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center',}} resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={true}>
            <Text style={{fontSize:30, textAlign:"center", color:"white", fontWeight:"bold", marginBottom:10}}>{this.state.school.acronym} Sign In</Text>
            <Button title="Select a different school" onPress={()=>{
              LayoutAnimation.configureNext({
                duration: 100,
                delete:{
                  type:"linear",
                  property:"scaleY"
                },
              });
              this.setState({school:null})
            }}/>
            <View style={{ flexDirection: 'row', backgroundColor: "#FFFFFF", margin: 20, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 15, }}>
              <FontAwesome
                name='id-badge'
                size={30}
                color="#373a6d"
              />
              <TextInput
                editable={!this.state.isLoading}
                style={{ flex: 1, fontSize: 20, paddingHorizontal: 11 }}
                keyboardType={this.state.school.numericUsername?'number-pad':'default'}
                autoCorrect={false}
                placeholderTextColor="gray"
                placeholder={this.state.school.numericUsername?'ID number':'Username/Email'}
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
                placeholderTextColor="gray"
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

            <Button title="Having trouble signing in?" onPress={() => Linking.openURL('https://gradeview.kihtrak.com/sign-in-help/')} />
            
            <View style={{height:10}}></View>
            {cancelBtn}
           
            <View>
              <Text style={{ fontSize: 10, padding: 10, color: "white" }}>Note: Your password will be encrypted and stored on our servers so we can get your grades for you</Text>
              <Text style={{ fontSize: 10, padding: 10, color: "white" }}>This app is not affiliated with any school. It was created by a student.</Text>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      )
    }
  
  }