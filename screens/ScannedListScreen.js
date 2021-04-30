import React from 'react';
import { Text, View, FlatList, AsyncStorage, Button } from 'react-native';
import { Icon } from 'react-native-elements'
import NameIDItem from '../components/NameIDItem'
import { navigationHeader } from '../globals/styles'
import RespectThemeBackground from '../components/RespectThemeBackground.js'

export default class ScannedListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { contacts: [], baseContacts: [], search: '', result: null }
    }
    UNSAFE_componentWillMount = () => {
        this.getContacts()
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            AsyncStorage.getItem('scannedContacts').then((contacts) => {
                if (contacts && JSON.parse(contacts)) {
                    let newContacts = JSON.parse(contacts)
                    this.setState({ contacts: newContacts });
                    AsyncStorage.getItem('contacts').then((baseContacts) => {
                        console.log("Started Getting")
                        let newBContacts = [];
                        if (baseContacts && JSON.parse(baseContacts)) {
                            newBContacts = JSON.parse(baseContacts)
                            this.setState({ baseContacts: newBContacts });
                        }
                        console.log("looping")
                        for (let personIndex in newContacts) {
                            for (let contact of newBContacts) {
                                if (newContacts[personIndex]["email"] == contact["email"])
                                    newContacts[personIndex] = contact
                            }
                        }
                        console.log("done")
                        this.setState({ contacts: newContacts });
                    })
                }
            })
        });
    }

    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Scanned IDs',
            headerStyle: navigationHeader,
            headerRight: (
                <View paddingRight={10}>
                    {<Icon onPress={() => navigation.navigate('Camera')} name={"camera-alt"} size={25} type={"MaterialIcons"} />}
                </View>
            ),
        }
    }

    getContacts = () => {
        return fetch('https://raw.githubusercontent.com/KihtrakRaknas/DirectoryScraper/master/output.json', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                console.log(typeof response)
                return response.json();
            })
            .then((responseJson) => {
                AsyncStorage.setItem('contacts', JSON.stringify(responseJson))
                this.setState({ baseContacts: responseJson });
                return responseJson
            })
    }


    render() {
        let list = <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>Contacts are not current available, connect to the internet and try again</Text></View>
        if (Object.keys(this.state.contacts).length > 0) {
            arr = this.state.contacts;
            if (this.state.result)//Object.keys(this.state.result).length>0
                arr = this.state.result;

            list = <FlatList
                data={arr}
                ListEmptyComponent={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 20 }}>No results</Text></View>}
                keyExtractor={item => item.email}
                //ListHeaderComponent={          }
                ItemSeparatorComponent={({ item }) => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{ height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }} /></View>}
                renderItem={({ item }) => {
                    console.log(`item: ${JSON.stringify(item)}`)
                    return(<NameIDItem item={item} />)
                }}
                ListFooterComponent={this.state.contacts.length > 0 ? <Button title="Clear" onPress={() => {
                    AsyncStorage.setItem('scannedContacts', "[]");
                    this.setState({ contacts: [] });
                }} /> : null}
            />
        }
        return (
            //<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
            <RespectThemeBackground>
                <View>
                    {list}
                </View>
            </RespectThemeBackground>
        )
    }

}