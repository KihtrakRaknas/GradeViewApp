import React from 'react';
import { View, ActivityIndicator, Alert, Button, ScrollView, Picker, RefreshControl, Platform, AsyncStorage, LayoutAnimation, Linking} from 'react-native';
import LoadInComponent from '../components/LoadInComponent'
import Modal from 'react-native-modal';
import ClassBtn from '../components/ClassBtn'
import { navigationHeader } from '../globals/styles'
//import AdComponent from '../components/AdComponent' /* uses facebook ads */
import '../globals/homeScreenGlobals.js'
import {preferredBackgroundColor} from '../helperFunctions/darkModeUtil.js'
import {
    AdMobBanner,
    getPermissionsAsync
} from 'expo-ads-admob';
//import * as FacebookAds from 'expo-ads-facebook';
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import { Text } from 'react-native-elements';

export default class HomeScreen extends LoadInComponent {
    constructor(props){
      super(props);
      console.log("GERNERATING")  
      this.state ={ isLoading: false, email:"", password:"", num: 0, currentMarking: "Select MP", style:"Percent", firstMPSRender:true, showAd:false, showA:true, personalizeAds:false}
  
      this.firstMPSRender = false;
      console.log("GERNERATING DONE")
      
      global.updateAvgDisplayGlobal = global.updateAvgDisplayGlobal.bind(this)
      global.updateShowAGlobal = global.updateShowAGlobal.bind(this)
  
      AsyncStorage.getItem("avgDisplayStyle").then((style)=>{
        if(style)
          this.setState({style:style})
      })
  
      AsyncStorage.getItem('showA').then((showA)=>{
        if(showA == "false")
          this.setState({showA:false})
        else
          this.setState({showA:true})
      })
  
      this.checkAd()
  
      this.props.navigation.setParams({ click: this.click, genMpsArray: this.genMpsArray, genMpSelector: this.genMpSelector, updateMarkingPeriodSelectionAndriod: this.updateMarkingPeriodSelectionAndriod});
      
  
        AsyncStorage.getItem('MPS').then((oldMps)=>{
          console.log("oldMps - constructor")
          oldMps = JSON.parse(oldMps);
          oldMps = oldMps?oldMps:[];
          console.log("old: "+JSON.stringify(oldMps))
            this.setState({oldMps})
          //console.log("mps str"+JSON.stringify(mps))
        })
        /*
        this.adsManager = new FacebookAds.NativeAdsManager(Platform.OS === 'ios'?"618501142264378_618513918929767":"618501142264378_618581928922966", 1);
        this.adsManager.setMediaCachePolicy('all');
        */
    }

    checkAd = () =>{
      getPermissionsAsync().then(res=>res.status=='granted'?this.setState({personalizeAds:true}):null)
      AsyncStorage.getItem('noAds').then((noAd)=>{
        if(noAd !== "true"){
          AsyncStorage.getItem("AdFree").then(val=>{
            if(!Number(val) || Number(val)<new Date().getTime()){
              AsyncStorage.getItem('numberOfAppLaunches').then((num)=>{
                if(!num || !Number(num) || Number(num)<0){
                  num = 0
                }else{
                  num = Number(num)
                }
                num++
                console.log("App Launches: "+num)
                AsyncStorage.setItem('numberOfAppLaunches',num.toString())
                if(num>1){
                  this.setState({showAd:true, showAdExplanation: num<10, adStyle:/*Math.random()<.5?"facebook":*/"google"})
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
                }
              })
            }
          })
        }
      })
    }
  
    componentDidMount = () => {
      //SplashScreen.hide()
      this.focusListener = this.props.navigation.addListener('didFocus', () => {
        this.checkAd()
      });
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }
  
    static navigationOptions = ({ navigation }) => {
      var text = navigation.getParam('currentMarking','Select a MP');
      //var genMpsArray = navigation.getParam('genMpsArray',()=>{})();
  
      if(typeof text != "string"){
        text = "Select a MP"
      }
  
      var androidEl =  <Text>Select a MP</Text>;
      //console.log(this.state.currentMarking)
      if(text != "Select a MP"){
        androidEl =  <Picker 
          selectedValue={text}
          style={{height: 200, width: 120}}
          onValueChange={(itemValue, itemIndex) =>{
            navigation.getParam('updateMarkingPeriodSelectionAndriod',()=>{})(itemValue);
            }
          }>
          {navigation.getParam("genMpSelector",<Text>Select a MP</Text>,)()}
        </Picker>
      }
      const headerEl = Platform.select({
        ios: 
          <View>
            <Button
              onPress = {navigation.getParam('click',()=>{})}
              title = {text}//{navigation.getParam('currentMarking','Select a MP')}//{this.state.currentMarking}//
            />
          </View>,
        android: androidEl   
  
      });
        return {
          title: 'Home',
          headerStyle: navigationHeader,
          headerRight: ()=>(
            headerEl
          ),
        }
    };
  
    genMpSelector = () =>{
      var pickerArry = [];
      var mps = this.genMpsArray();
      console.log("MPS");
      for(mp of mps){
        pickerArry.push(<Picker.Item label={mp} value={mp} key={mp}/>);
      }
      return pickerArry
  
    }
  
    genMpsArray = () => {
      var mps = [];
      for(classN in global.grades){
        if(classN!="Status"){
        for(marking in global.grades[classN]){
          //console.log("MARK1: "+marking+"MARK2: "+classN);
          //console.log(global.grades[classN]);
          if(Number(marking.substring(2))){
            if(!mps.includes(marking))
              mps.push(marking);
          }
        }
        }
      }
      return mps.sort();
    }
  
    genTable = ()=>{
      var table = []
      var count = 0;
      var ClassNames = [];
      if(global.grades)
        ClassNames = Object.keys(global.grades).sort()
      for(classN of ClassNames){
        var maxMarking=this.state.currentMarking;
        //console.log(maxMarking);
        var avg = "";
        var teach = "";
        if(global.grades[classN][maxMarking]){
          if(global.grades[classN][maxMarking]["avg"]){
            // console.log("YEE2T")
            avg = global.grades[classN][maxMarking]["avg"]
            // console.log(avg);
            
          }
        }
        if(global.grades[classN]["teacher"])
        teach = global.grades[classN]["teacher"]
        // console.log(classN);
        if(count!=0){
          //Adds the seperator
          //table.push(<View key={count} style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{height: 0.5, width: '90%', backgroundColor: '#C8C8C8', }}/></View>);
          count++;
        }
        // console.log("avg")
        // console.log(avg)
        // console.log(classN)
        // console.log(avg)
        if(classN!="Status"&&avg){
          table.push(<ClassBtn key={classN+count} title={classN} showAPlus={this.state.showA} teach = {teach} avg={avg} onPress={this.classClicked} style={this.state.style}></ClassBtn>)
          count++;
        }
        // console.log(table.length)
      }
      // console.log("DONE");
      return table
    }
  
    click = () =>{
      //console.log(global.grades);
  
      this.setState({
        visibleModal: !this.state.visibleModal,
      });
    }
  
    classClicked = (className) =>{
      this.props.navigation.navigate('Class',{className:className,markingPeriod:this.state.currentMarking})
    }
    
    updateMarkingPeriodSelectionAndriod = (newMP)=>{
      this.props.navigation.setParams({ currentMarking: newMP});
      this.setState({currentMarking: newMP})
      AsyncStorage.setItem('MP', newMP)
    }
  
    refresh = () =>{
      this.setState({refreshing: true});
      this.getGradeWithoutErrorCatching().then(()=>{
        this.setState({refreshing: false});
      }).catch((error) =>{
        this.setState({refreshing: false});
        Alert.alert("Network Issue!\n Make sure you have a internet connection")
      });
    }
  
    render() {
      console.log("HOME UPDATED")
        if(this.state.isLoading)
          return(
            <RespectThemeBackground><View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator/>
              <Text style={{padding:20,paddingBottom:50}}>This is the first time we are retrieving your grades so this may take a bit longer. Future requests will be much faster!</Text>
  
              <Button title="Problem?" onPress={() => Linking.openURL('mailto:gradeViewApp@kihtrak.com?subject=Feedback%20about%20the%20app') }/>
            </View></RespectThemeBackground>
          )
  
          var mps = this.genMpsArray();
        if(this.state.oldMps&&mps&&this.state.oldMps.length<mps.length){
          this.setState({oldMps:mps})
          if(mps.length>0){
            AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
              
              this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
              this.setState({currentMarking: mps[mps.length-1]});
              console.log("RESET")
              //console.log(mps[mps.length-1])  
            })
            AsyncStorage.setItem('MPS',JSON.stringify(mps))
          }
          
        }
  
        console.log("render - "+ this.state.currentMarking)
        if(this.state.currentMarking == "Select MP")
          AsyncStorage.getItem('MP').then((mp)=>{
            console.log("mp")
            //console.log(mp)
            console.log("new"+mps)
            console.log(mps)
            if(!mp||(mps.length>0&&!mps.includes(mp))){
                  console.log("ENFORCED NEW2")
                  if(mps.length>0){
                    AsyncStorage.setItem('MP', mps[mps.length-1]).then(()=>{
                      
                      this.props.navigation.setParams({ currentMarking: mps[mps.length-1]});
                      this.setState({currentMarking: mps[mps.length-1]});
                      console.log("RESET")
                      //console.log(mps[mps.length-1])  
                    })
                  }
                }else{
                  this.props.navigation.setParams({ currentMarking: mp});
                  this.setState({currentMarking: mp});
                }
            });
        //let CustomAd = FacebookAds.withNativeAd(AdComponent)
        return(
          <RespectThemeBackground>
            <ScrollView style={{flex: 1, flexDirection: 'column'/*, backgroundColor: preferredBackgroundColor()*/}} refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.refresh}
              />
            }>
  
            <Modal 
            isVisible={this.state.visibleModal}
            isOpen = {this.state.visibleModal}
            style={{
              justifyContent: 'flex-end',
              margin: 0,
            }}
            onRequestClose={() => this.setState({ visibleModal: false })}
            >
                  <View style={{backgroundColor: 'white',padding: 22,justifyContent: 'center',alignItems: 'center',borderRadius: 4,borderColor: 'rgba(0, 0, 0, 0.1)',}}>
                    <Picker
                      selectedValue={this.state.currentMarking}
                      style={{height: 200, width: 100}}
                      onValueChange={(itemValue, itemIndex) =>{
                        AsyncStorage.setItem('MP', itemValue).then(()=>{})
                        this.props.navigation.setParams({ currentMarking: itemValue});
                        this.setState({currentMarking: itemValue})
                        console.log("MP value changed")
                      }
                      }>
                      {this.genMpSelector()}
                    </Picker>
                    <Button title="Close" onPress={() => {
                        //AsyncStorage.setItem('MP', this.state.currentMarking)
                        //this.props.navigation.setParams({ currentMarking: this.state.currentMarking});
                        this.setState({ visibleModal: false /*, currentMarking: this.state.currentMarking*/});
                    //})
                  }
                }/>
                  </View>
            </Modal>
  
            {this.genTable()}
            {this.state.showAdExplanation?<><Text style={{fontSize:5,textAlign:"center",marginTop:5}}>Why are there ads?</Text>
            <Text style={{fontSize:5,textAlign:"center", paddingBottom:0, marginBottom:0}}>Running this app costs money. Ads help offset the cost of keeping the app online.</Text></>:null}
            {/*"ca-app-pub-3940256099942544/6300978111"*/}
            {this.state.showAd?this.state.adStyle == "google"? <AdMobBanner
              style={{marginTop:10}}
              bannerSize="smartBannerPortrait"
              adUnitID={__DEV__?"ca-app-pub-3940256099942544/2934735716":Platform.OS === 'ios'?"ca-app-pub-8985838748167691/6884417794":"ca-app-pub-8985838748167691/7707857953"} // Test ID, Replace with your-admob-unit-id
              //testDeviceID="7BE32C8C-101D-45EE-AFFD-81B6BF27CEC2"
              servePersonalizedAds={this.state.personalizeAds} // true or false
              onDidFailToReceiveAdWithError={(err)=>{
                console.log("GOOGLE AD FAILED")
                console.log(err)
                LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
                //this.setState({adStyle:"facebook"})
              }} />:
              /*<CustomAd adsManager={this.adsManager}/>*/null:null}
            </ScrollView>
          </RespectThemeBackground>
  
        )
    }
  
  }