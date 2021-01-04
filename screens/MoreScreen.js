import React from 'react';
import { View, Image, ScrollView, AsyncStorage, Button, ActivityIndicator, Alert } from 'react-native'
import { Text } from 'react-native-elements';
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import * as FacebookAds from 'expo-ads-facebook';
import { AdMobInterstitial } from 'expo-ads-admob';
import RespectThemeBackground from '../components/RespectThemeBackground.js'
export default class MoreScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, email: "", password: "", id: "loading", lunchBalance: null, lunchBalanceButtonPressed: false }
        AsyncStorage.getItem('IDbarcode').then((IDbarcode) => {
            AsyncStorage.getItem('username').then((user) => {
                if (user) {
                    this.setState({ id: user })
                    const idNumber = user.substring(0, user.indexOf("@"))
                    if(Number(idNumber)){
                        if (IDbarcode) {
                            this.setState({ idBar: IDbarcode })
                        } else {
                            fetch('https://gradeview.herokuapp.com/id?id=' + idNumber, {
                                method: 'GET',
                                headers: {
                                    Accept: 'text/html',
                                    'Content-Type': 'text/html',
                                },
                            }).then((response) => {
                                return response.text();
                            }).then((responseTxt) => {
                                this.setState({ idBar: responseTxt })
                                AsyncStorage.setItem('IDbarcode', responseTxt)
                            })
                        }
                    }
                }
            });
        })

    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'More',
            headerStyle: navigationHeader,
        }
    }

    getLunchMoney = async () => {
        this.setState({ lunchBalanceButtonPressed: true })
        return fetch('https://gradeview.herokuapp.com/money', {
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
        }).then((response) => {
            console.log(typeof response)
            return response.json();
        }).then((responseJson) => {
            console.log(responseJson)
            if (responseJson && responseJson["money"])
                return this.setState({ lunchBalance: responseJson["money"] })
        }).catch((err) => {
            Alert.alert('Could not connect to server. Check your internet connection.')
            return this.setState({ lunchBalanceButtonPressed: false })
        })
    }

    componentDidMount() {
        const { navigation } = this.props;
        this.focusListener = navigation.addListener("didFocus", () => { //Prepares app to display a pop up ad
          AsyncStorage.getItem('noAds').then((noAd)=>{
            if(noAd !== "true"){
                AsyncStorage.getItem('numberOfAppLaunches').then((num)=>{
                    if(Number(num)>20){
                        //'ca-app-pub-3940256099942544/1033173712'
                        AdMobInterstitial.setAdUnitID(__DEV__?"ca-app-pub-3940256099942544/4411468910":Platform.OS === 'ios'?"ca-app-pub-8985838748167691/4846725042":"ca-app-pub-8985838748167691/5663669617"); 
                        console.log('checking ready')
                        AdMobInterstitial.getIsReadyAsync().then((ready)=>{
                            console.log('ready: ' + ready)
                            if(!ready)
                            AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true})
                        })
                        this.showingPopUpAd = true
                    }
                })
            }
          })
        });
    }

    componentWillUnmount() {
        // Remove the event listener
        //this.focusListener.remove();
    }

    render() {
        const list = [
            {
                name: 'GPA',
                iconName: 'calculator',
                iconType: 'material-community',
                subtitle: 'View your Grade Point Average',
                action: () => {
                    if (this.showingPopUpAd == true) {
                        console.log("SHOW FACEBOOK AD")
                        /*FacebookAds.InterstitialAdManager.showAd(Platform.OS === 'ios'?"618501142264378_618574792257013":"618501142264378_623008151813677").then(didClick => {
                            console.log("SHOWN")
                            //this.props.navigation.navigate('GPA')
                        })
                        .catch(error => {
                            console.log("err", error)
                            //this.props.navigation.navigate('GPA')
                        });*/
                        this.props.navigation.navigate('GPA')
                        AdMobInterstitial.getIsReadyAsync().then((ready)=>{
                            console.log('ready: ' + ready)
                            if(ready)
                                AdMobInterstitial.showAdAsync();
                            else{
                            /*console.log("SHOW FACEBOOK AD")
                            FacebookAds.InterstitialAdManager.showAd(Platform.OS === 'ios'?"618501142264378_618574792257013":"618501142264378_623008151813677")
                            .then(didClick => {
                                this.props.navigation.navigate('GPA')
                            })
                            .catch(error => {
                                this.props.navigation.navigate('GPA')
                            });*/
                            AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true}).catch((e)=>{console.log(e)})
                            }
                            let intervalCount
                            let interval = setInterval(()=>{
                                intervalCount++
                                if(intervalCount>20){
                                    clearInterval(interval)
                                }
                                AdMobInterstitial.showAdAsync().then(()=>{
                                    clearInterval(interval)
                                })
                            },1000)
                        }) 
                    } else {
                        this.props.navigation.navigate('GPA')
                    }
                },
                bottomMargin: 5,
            },
            {
                name: 'Options',
                iconName: 'settings',
                iconType: 'Octicons',
                subtitle: 'View configuration options',
                action: () => this.props.navigation.navigate('Options'),
                bottomMargin: 150,
            },
        ]
        const isSB = this.state.id.substring(this.state.id.indexOf("@"))=="@sbstudents.org";
        if(isSB)
            list.splice(1, 0,{
                name: 'Global Name Lookup',
                iconName: 'account-search',
                iconType: 'material-community',
                subtitle: 'Search for anyone based on name or ID number',
                action: () => this.props.navigation.navigate('Contacts'),
                bottomMargin: 5,
            })
        return (
            <RespectThemeBackground >
                <ScrollView>
                    {
                        list.map((l, i) => (
                            <ListItem
                                key={i}
                                leftIcon={{ name: l.iconName, type: l.iconType }}
                                title={l.name}
                                subtitle={l.subtitle}
                                onPress={l.action}
                                style={{ marginBottom: l.bottomMargin }}
                                bottomDivider={i != list.length - 1}
                                chevron
                            />
                        ))
                    }
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <View>
                            {isSB?(this.state.lunchBalance || this.state.lunchBalanceButtonPressed ?
                                <View style={{
                                    flexDirection: 'row',
                                }}>
                                    <Text style={{ fontSize: 20 }}>Lunch balance: </Text>
                                    {this.state.lunchBalance ? <Text style={{ fontSize: 20 }}>{this.state.lunchBalance}</Text> : <ActivityIndicator />}
                                </View>
                                : <Button title="Show Lunch Balance" onPress={this.getLunchMoney} />
                            ):null}
                        </View>
                        {this.state.idBar && <Image
                            resizeMode={'contain'}
                            style={{ width: '80%', height: 100, marginTop: 10, backgroundColor:"white", borderRadius:3 }}
                            source={{ uri: this.state.idBar }}
                        />}
                    </View>
                </ScrollView>
            </RespectThemeBackground>
        )
    }
}