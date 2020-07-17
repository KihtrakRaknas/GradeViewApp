import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FacebookAds from 'expo-ads-facebook';
const { AdTriggerView, AdMediaView , AdIconView, AdOptionsView} = FacebookAds;
export default class AdComponent extends React.Component {
    render() {
        let colorz = ['#6fc2d0', '#373a6d']
        return (
            <View>
                <LinearGradient style={{
                    marginTop: 10, marginLeft: 5,
                    marginRight: 5,
                    borderRadius: 10, // adds the rounded corners
                    backgroundColor: '#000000',
                    padding: 0,
                    marginBottom: 10
                }}

                    colors={colorz}
                    start={[0, 0]}
                    end={[.75, 0]}
                >
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginLeft: 14,
                        marginRight: 10,
                        paddingTop: 5,
                        paddingBottom: 3,
                    }}>
                        <Text style={{ color: "white" }}>Sponsored Content:</Text>
                        <AdOptionsView iconColor="#FFFFFF" style={{ backgroundColor: "#373a6d" }} />
                    </View>
                    <AdMediaView />
                    <AdTriggerView>
                        <ListItem
                            containerStyle={{
                                paddingTop: 0
                            }}

                            linearGradientProps={{
                                colors: colorz,
                                start: [0, 0],
                                end: [.75, 0]
                            }}
                            title={this.props.nativeAd.advertiserName}
                            titleStyle={{ color: "white", fontWeight: 'bold' }}
                            subtitleStyle={{ color: "white" }}
                            subtitle={this.props.nativeAd.bodyText}
                            rightElement={
                                <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                    <AdIconView style={{ width: 50, height: 50 }} />

                                    <Text style={{ fontSize: 20, textAlign: 'right', color: "lightblue", marginTop: 2 }}>{this.props.nativeAd.callToActionText}</Text>

                                </View>}
                        />
                    </AdTriggerView>
                </LinearGradient>
            </View>
        );
    }
}