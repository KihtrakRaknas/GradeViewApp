import React from 'react';
import { Text, View, AsyncStorage, Button, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import { navigationHeader } from '../globals/styles'

export default class CameraScreen extends React.Component {
    state = {
        hasCameraPermission: null,
        scanned: false,
    };

    async componentDidMount() {
        this.getPermissionsAsync();
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            this.setState({ scanned: false })
            // The screen is focused
            // Call any action
        });
    }
    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }

    getPermissionsAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    };

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'ID Scanner',
            headerStyle: navigationHeader,
        }
    };

    render() {
        const { hasCameraPermission, scanned } = this.state;

        if (hasCameraPermission === null) {
            return <Text>Requesting for camera permission</Text>;
        }
        if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        }
        return (
            <RespectThemeBackground>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                    }}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {scanned && (
                        <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
                    )}
                </View>
            </RespectThemeBackground>
        );
    }

    handleBarCodeScanned = ({ type, data }) => {
        this.setState({ scanned: true });
        AsyncStorage.getItem('scannedContacts').then((contacts) => {
            let newC = [];
            if (contacts && JSON.parse(contacts))
                newC = JSON.parse(contacts);
            newC.push({ email: data + "@sbstudents.org" })
            AsyncStorage.setItem('scannedContacts', JSON.stringify(newC)).then((contacts) => {

                this.props.navigation.navigate('ScannedList')
            });
        });
    };
}