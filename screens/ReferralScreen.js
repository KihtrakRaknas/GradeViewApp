import React from 'react';
import { AsyncStorage, ScrollView, View, ActivityIndicator, Platform, Button, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import { ListItem, Icon } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import Branch, { BranchEvent } from '../branch-module';

Branch.subscribe(async bundle => {
    if (bundle.error) {
        console.error('Error from Branch: ' + error)
        return
    }
    if (bundle && bundle.params && !bundle.error) {
        console.log(`bundle info: ${JSON.stringify(bundle.params)}`)
        console.log(`bundle info: not params:${JSON.stringify(bundle)}`)
        // `bundle.params` contains all the info about the link.
        const referMatch = bundle.params["$canonical_identifier"].match(/^refer_(.*)@school_(.*)/)
        if(referMatch){
            const username = await AsyncStorage.getItem('username')
            const oldUsername = await AsyncStorage.getItem('oldUsername')
            if(username || oldUsername){
                Alert.alert(`Trying to use a referral code? This device already had GradeView installed so it won't work.`)
                return;
            }
            global.referrerEmail = referMatch[1]
            global.referrerSchool = referMatch[2]
            // Alert.alert(global.referrerEmail)
        }
    }
});


export default class ReferralScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {AdFree:null}
        AsyncStorage.getItem("AdFree").then(val=>{
            if(Number(val)>new Date().getTime()){
                this.setState({ adFree:Number(val) })
            }
        })
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Referral',
            headerStyle: navigationHeader,
            headerRight: (
                <View paddingRight={10}>
                    {<Icon onPress={navigation.getParam("shareLink")} name={Platform.OS === 'android' ? "share-google" : "share-apple"} size={30} type={"evilicon"} />}
                </View>
            ),
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({shareLink: ()=>this.shareLink()})
        this.createBranchUniversalObject();
        this.focusListener = this.props.navigation.addListener('didFocus', () => {
            AsyncStorage.getItem("AdFree").then(val=>{
                if(Number(val) && Number(val)>new Date().getTime()){
                    this.setState({ adFree:Number(val) })
                }
            })
        });
    }
    componentWillUnmount() {
        // Remove the event listener
        this.focusListener.remove();
    }

    async createBranchUniversalObject() {
        const username = await AsyncStorage.getItem('username')
        const school = await AsyncStorage.getItem('school')
        this._branchUniversalObject = await Branch.createBranchUniversalObject(
            `refer_${username}@school_${school}`,
            {
                title: "Get GradeView",
                contentImageUrl: "https://gradeview.kihtrak.com/REGENiconWroundedCorners.png",
                contentDescription: "Download GradeView",
                // This metadata can be used to easily navigate back to this screen
                // when implementing deep linking with `Branch.subscribe`.
                metadata: {
                    screen: 'testScreen',
                    params: JSON.stringify({ referrerUsername: username, referrerSchool: school }),
                },
            }
        );
    }

    shareLink = async () => {
        await this._branchUniversalObject.showShareSheet({
            messageHeader: "GradeView Download Link",
            messageBody: `Here is a download link for GradeView`,
        });
    }

    render() {
        const ShareButton = () => <View style={{marginBottom:30}}>
            <Button
                title="Share Referral Link"
                onPress={this.shareLink}
            />
        </View>
        return (
            <RespectThemeBackground >
                <ScrollView style={{ flex: 1, flexDirection: 'column', padding: 10 }}>
                    {this.state.adFree && <Text style={{ fontSize: 40, textAlign: 'center', paddingTop: 10, marginBottom: 20, color:"green" }}>You have will have no ads for {Math.ceil((this.state.adFree-new Date().getTime())/(1000*60*60*24))} more days!</Text>}
                    {/* <ShareButton /> */}
                    <Text style={{ fontSize: 40, textAlign: 'center', paddingTop: 10, marginBottom: 20 }}>Referral FAQ</Text>
                    <Text style={{ fontSize: 20, marginBottom: 15, textDecorationLine: 'underline' }}>How does it work?</Text>
                    <Text style={{ fontSize: 17, marginBottom: 25 }}>You have a custom download link to GradeView. If your friend downloads the app with your custom link, you will automatically get 1 month of ad-free mode.</Text>
                    <Text style={{ fontSize: 20, marginBottom: 15, textDecorationLine: 'underline' }}>What if I already have a month of ad-free mode?</Text>
                    <Text style={{ fontSize: 17, marginBottom: 25 }}>Every new user that signs up with your link will add an extra month to your ad-free period.</Text>
                    <Text style={{ fontSize: 20, marginBottom: 15, textDecorationLine: 'underline' }}>How will I know it worked?</Text>
                    <Text style={{ fontSize: 17, marginBottom: 25 }}>You will get a notification when your friend signs up.</Text>
                    <Text style={{ fontSize: 20, marginBottom: 15, textDecorationLine: 'underline' }}>Can I pay to get the ad-free mode?</Text>
                    <Text style={{ fontSize: 17, marginBottom: 25 }}>No, the referral link is the only way to get ad-free mode</Text>
                    <ShareButton />
                </ScrollView>
            </RespectThemeBackground>
        )
    }

}