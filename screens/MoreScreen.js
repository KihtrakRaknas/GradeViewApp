import React from 'react';
import { View, Image, ScrollView, AsyncStorage} from 'react-native'
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import { Notifications } from 'expo';

export default class MoreScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: false, email: "", password: "", pushToken: "No Token", id: "loading", }
        Notifications.getExpoPushTokenAsync().then((token) => {
            this.setState({ pushToken: token })
        })
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
                        })
                            .then((response) => {
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
    render() {
        const list = [
            {
                name: 'GPA',
                iconName: 'calculator',
                iconType: 'material-community',
                subtitle: 'View your Grade Point Average',
                action: () => this.props.navigation.navigate('GPA'),
                bottomMargin: 5,
            },
            {
                name: 'Global Name Lookup',
                iconName: 'account-search',
                iconType: 'material-community',
                subtitle: 'Search for anyone based on name or ID number',
                action: () => this.props.navigation.navigate('Contacts'),
                bottomMargin: 40,
            },
            {
                name: 'Options',
                iconName: 'settings',
                iconType: 'Octicons',
                subtitle: 'View configuration options',
                action: () => this.props.navigation.navigate('Options'),
                bottomMargin: 80,
            },
        ]
        const debug = null// <View style={{flex: 1, flexDirection: 'column', padding:15}}><Text style={{fontSize:20}}>Debugging info:</Text><Text>{this.state.id}</Text><Text style={{marginBottom:20}}>{this.state.pushToken}</Text></View>
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
                    <Image
                        resizeMode={'contain'}
                        style={{ width: '80%', height: 100, marginTop: 50 }}
                        source={{ uri: this.state.idBar }}
                    />
                </View>
                {debug}
            </ScrollView>
        )
    }
}