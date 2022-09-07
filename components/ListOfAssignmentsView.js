import React from 'react';
import { SectionList, View, TouchableOpacity, AsyncStorage, StyleSheet, Text as NormalText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {  pickTextColorBasedOnBgColorAdvanced } from '../globals/assignmentColorGlobals.js'
import { defaultColors } from '../globals/constants'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import { withTheme, Text } from 'react-native-elements';

const styles = StyleSheet.create({
    sectionHeaderContainer: {
        // backgroundColor: '#beeef7',
        paddingTop: 5,
        marginTop: 0,
        paddingBottom: 5,
        marginBottom: 1,
        paddingHorizontal: 34,
        // borderWidth: StyleSheet.hairlineWidth,
        // borderColor: '#ededed',
    },
    sectionHeaderText: {
        fontSize: 20,
        fontFamily: 'Futura',
        // fontWeight: 'bold',
        //textAlign:'center'
    },
})

class ListOfAssignmentsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        
        //global.updateBackgroundColorsGlobal = global.updateBackgroundColorsGlobal.bind(this);
        AsyncStorage.getItem('backgroundColors').then((backgroundColors) => {
            if (JSON.parse(backgroundColors))
                this.setState({ backgroundColors: JSON.parse(backgroundColors) })
        })
    }

    componentDidMount = ()=>{
        global.instancesOfListOfAssignmentView.push(this)
    }

    componentWillUnmount = ()=>{
        const index = global.instancesOfListOfAssignmentView.indexOf(this);
        if (index > -1) {
            global.instancesOfListOfAssignmentView.splice(index, 1);
        }
    }

    getBackgroundColor = (cat) => {
        if (this.state.backgroundColors)
            if (this.state.backgroundColors[cat])
                return this.state.backgroundColors[cat]
        if (defaultColors[cat])
            return defaultColors[cat]
        return "#FFFFFF"
    }

    LightenDarkenColor = (col, amt) => {
        amt*=this.props.theme.isLight?1:-1;
        var usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        var num = parseInt(col, 16);
        var r = (num >> 16) + amt;
        if (r > 255)
            r = 255;
        else if (r < 0)
            r = 0;
        var b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255)
            b = 255;
        else if (b < 0)
            b = 0;
        var g = (num & 0x0000FF) + amt;
        if (g > 255)
            g = 255;
        else if (g < 0)
            g = 0;
        return (usePound ? "#" : "") + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6);
    }

    render() {
        console.log(this.props.theme)
        return (
            <RespectThemeBackground>
                <SectionList
                    // ItemSeparatorComponent={({ item }) => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{ height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }} /></View>}
                    sections={this.props.listOfAssignments}
                    renderItem={({ item }) => {
                        let leftColor = this.getBackgroundColor(item["Category"])
                        let rightColor = this.LightenDarkenColor(this.getBackgroundColor(item["Category"]), 100)
                        return(<TouchableOpacity onPress={() => this.props.navigation.navigate('Assignment', { assignmentData: item })} style={{ flexDirection: 'row', justifyContent: 'space-between', borderRadius:10, shadowRadius:10, justifyContent: 'space-between', backgroundColor:this.props.theme.colors.grey1, padding:10, marginHorizontal:8, marginVertical:8, shadowOffset: {width: 3, height: 3}, shadowColor: this.props.theme.colors.grey6, shadowOpacity:.2, shadowRadius: 2 }}>
                                {/* <View style={{  , flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor:"white", padding:10 }}> */}
                                    <LinearGradient style={{width:5, borderRadius:2.5, backgroundColor:"purple"}} colors={[leftColor, rightColor]}></LinearGradient>
                                    <Text style={{
                                        flex: 1,
                                        padding: 10,
                                        fontSize: 18,
                                        flexWrap: 'wrap',
                                        // color: pickTextColorBasedOnBgColorAdvanced(leftColor)
                                        color: this.props.theme.colors.grey6
                                    }} flex left>{item["Comment"] || item["Subtitle"]? <NormalText style={{ textDecorationLine: 'underline' }}>{item["Name"]}</NormalText> : item["Name"]}</Text>
                                    <NormalText style={{
                                        padding: 10,
                                        fontSize: 18,
                                        height: 44,
                                        fontStyle: "italic",
                                        // color: pickTextColorBasedOnBgColorAdvanced(rightColor)
                                        color: this.props.theme.colors.grey6
                                    }} flex>
                                        <NormalText style={{ color: leftColor != '#ff1100' ? "red" : "white", fontSize: 15 }}>{item["Weighting"] ? item["Weighting"] == "RecentlyUpdated" ? "Recent " : item["Weighting"] : ""}</NormalText>
                                        {item["Weighting"] && item["Weighting"].includes("x") ? " - " : ""}
                                        <NormalText style={{ fontWeight: 'bold' }}>{item["Grade"]}</NormalText>
                                    </NormalText>
                                {/* </View> */}
                        </TouchableOpacity>
                        )}
                    }
                    renderSectionHeader={({ section }) => {
                        const backgroundTheme = {backgroundColor: this.props.theme.colors.offWhite + "F0"};
                        return (
                            <View style={[styles.sectionHeaderContainer, backgroundTheme]}>
                                <Text style={[styles.sectionHeaderText,{color:this.props.theme.colors.cardText}]}>{section.title}</Text>
                            </View>
                        )
                    }}
                    keyExtractor={(item, index) => item + index}
                />
            </RespectThemeBackground>
        )
    }
}

export default withTheme(ListOfAssignmentsView)