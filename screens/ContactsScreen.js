import React from 'react';
import { Text, View, FlatList, AsyncStorage } from 'react-native';
import { Icon, SearchBar } from 'react-native-elements'
import NameIDItem from '../components/NameIDItem'
import { navigationHeader } from '../globals/styles'

export default class ContactsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { contacts: [], search: '', result: null }
        AsyncStorage.getItem('contacts').then((contacts) => {
            if (contacts && JSON.parse(contacts)) {
                let newContacts = JSON.parse(contacts)
                this.setState({ contacts: newContacts });
            }
        })
    }

    componentWillMount = () => {
        this.getContacts()
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Global Lookup',
            headerStyle: navigationHeader,
            headerRight: (
                <View paddingRight={10}>
                    {<Icon onPress={() => navigation.navigate('ScannedList')} name={"menu"} size={25} type={"MaterialIcons"} />}
                </View>
            ),
        }
    }

    updateSearch = async => {
        if (this.state.contacts && this.state.search) {
            this.setState({ searchLoading: true })
            var search = this.state.search.toLowerCase();
            let result = this.state.contacts.filter(item => {
                return item.name.toLowerCase().includes(search) || item.email.toLowerCase().includes(search)
            })
            console.log("search updated")
            if (search == "")
                result = null
            this.setState({ result: result, searchLoading: false });
        }
    };

    updateSearchWVal = async search => {
        if (this.state.contacts && search) {

            this.setState({ searchLoading: true })
            let result = this.state.contacts.filter(item => {
                return item.name.toLowerCase().includes(search) || item.email.toLowerCase().includes(search)
            })
            result = result.slice(0, 20)

            console.log("search updated")
            if (search == "")
                result = null
            this.setState({ result: result, searchLoading: false });
        }
    };

    updateSearchVal = async search => {
        if (!search)
            this.setState({ results: null });
        if (this.state.contacts) {
            this.setState({ search: search })
            this.updateSearchWVal(search.toLowerCase())
        }
    };

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
                this.setState({ contacts: responseJson });
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
                renderItem={({ item }) => <NameIDItem item={item} />}
            />
        }
        return (
            //<View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
            <View>
                <SearchBar
                    returnKeyType='search'
                    placeholder="Search Name/ID #"
                    onSubmitEditing={this.updateSearch}
                    onChangeText={this.updateSearchVal}
                    value={this.state.search}
                    lightTheme
                    showLoading={this.state.searchLoading}
                    onClear={() => {
                        this.setState({ search: null, result: null });
                        console.log("kill")
                    }}
                />
                {list}
            </View>
        )
    }

}