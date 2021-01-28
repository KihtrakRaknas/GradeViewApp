import { AsyncStorage } from 'react-native';

export function signOutGlobal () {
    this.setState({ user: null });
}

global.signOutGlobal = signOutGlobal

export function signInGlobal() {
    AsyncStorage.getItem('username').then((user) => {
        console.log(user);
        this.setState({ user: user })
    });
}
global.signInGlobal = signInGlobal