import React from 'react';
import { View, Image, ScrollView, AsyncStorage, Button, Text, ActivityIndicator } from 'react-native'
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import * as FacebookAds from 'expo-ads-facebook';
export default class MoreScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, email: "", password: "", id: "loading", lunchBalance: null, lunchBalanceButtonPressed: false }
        AsyncStorage.getItem('IDbarcode').then((IDbarcode) => {
            if (IDbarcode) {
                this.setState({ idBar: IDbarcode })
            } else {
                AsyncStorage.getItem('username').then((user) => {
                    if (user) {
                        this.state.id = user;
                        fetch('https://gradeview.herokuapp.com/id?id=' + user.substring(0, user.indexOf("@")), {
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
                });
            }
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
        /*this.focusListener = navigation.addListener("didFocus", () => { //Prepares app to display a pop up ad
          AsyncStorage.getItem('noAds').then((noAd)=>{
            if(noAd !== "true"){
              //'ca-app-pub-3940256099942544/1033173712'
              AdMobInterstitial.setAdUnitID(Platform.OS === 'ios'?"ca-app-pub-8985838748167691/4846725042":"ca-app-pub-8985838748167691/5663669617"); 
              AdMobInterstitial.setTestDeviceID('EMULATOR');
              AdMobInterstitial.getIsReadyAsync().then((ready)=>{
                console.log('ready: ' + ready)
                if(!ready)
                  AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true})
              })
            }
          })
        });*/
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
                    AsyncStorage.getItem('noAds').then((noAd) => {
                        if (noAd !== "true") {
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
                            /*
                            AdMobInterstitial.getIsReadyAsync().then((ready)=>{
                              console.log('ready: ' + ready)
                              if(ready)
                                AdMobInterstitial.showAdAsync();
                              else{
                                console.log("SHOW FACEBOOK AD")
                                FacebookAds.InterstitialAdManager.showAd(Platform.OS === 'ios'?"618501142264378_618574792257013":"618501142264378_623008151813677")
                                .then(didClick => {
                                  this.props.navigation.navigate('GPA')
                                })
                                .catch(error => {
                                  this.props.navigation.navigate('GPA')
                                });
                                //AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true}).then(()=>AdMobInterstitial.showAdAsync())
                              }
                            }) 
                            */
                        } else {
                            this.props.navigation.navigate('GPA')
                        }
                    })
                },
                bottomMargin: 5,
            },
            {
                name: 'Global Name Lookup',
                iconName: 'account-search',
                iconType: 'material-community',
                subtitle: 'Search for anyone based on name or ID number',
                action: () => this.props.navigation.navigate('Contacts'),
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
        return (
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
                        {this.state.lunchBalance || this.state.lunchBalanceButtonPressed ?
                            <View style={{
                                flexDirection: 'row',
                            }}>
                                <Text style={{ fontSize: 20 }}>Lunch balance: </Text>
                                {this.state.lunchBalance ? <Text style={{ fontSize: 20 }}>{this.state.lunchBalance}</Text> : <ActivityIndicator />}
                            </View>
                            : <Button title="Show Lunch Balance" onPress={this.getLunchMoney} />
                        }
                    </View>
                    <Image
                        resizeMode={'contain'}
                        style={{ width: '80%', height: 100, marginTop: 10 }}
                        source={{ uri: this.state.idBar }}
                    />
                </View>
            </ScrollView>
        )
    }
}