import { AsyncStorage } from 'react-native';


global.signOutGlobal = function () {
    this.setState({ user: null });
}

global.signInGlobal = function () {
    AsyncStorage.getItem('username').then((user) => {
        console.log(user);
        this.setState({ user: user })
    });
}