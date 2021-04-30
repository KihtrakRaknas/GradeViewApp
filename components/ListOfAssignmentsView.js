import React from 'react';
import { SectionList, Text, View, TouchableOpacity, AsyncStorage, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {  pickTextColorBasedOnBgColorAdvanced } from '../globals/assignmentColorGlobals.js'
import { defaultColors } from '../globals/constants'
import RespectThemeBackground from '../components/RespectThemeBackground.js'
import { withTheme } from 'react-native-elements';

const styles = StyleSheet.create({
    sectionHeaderContainer: {
        backgroundColor: '#beeef7',
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ededed',
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
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
        amt*=this.props.theme.colors.white==='#ffffff'?1:-1;
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
        return (
            <RespectThemeBackground>
                <SectionList
                    ItemSeparatorComponent={({ item }) => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><View style={{ height: 0.5, width: '96%', backgroundColor: '#C8C8C8', }} /></View>}
                    sections={this.props.listOfAssignments}
                    renderItem={({ item }) => {
                        let leftColor = this.getBackgroundColor(item["Category"])
                        let rightColor = this.LightenDarkenColor(this.getBackgroundColor(item["Category"]), 100)
                        return(<TouchableOpacity onPress={() => this.props.navigation.navigate('Assignment', { assignmentData: item })} style={{ flexDirection: 'row', justifyContent: 'space-between', /*backgroundColor:this.getBackgroundColor(item["Category"])*/ }}>
                            <LinearGradient
                                style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
                                colors={[leftColor, rightColor]}
                                start={[0, 0]}
                                end={[.7, 1]}
                            >
                                <Text style={{
                                    flex: 1,
                                    padding: 10,
                                    fontSize: 18,
                                    flexWrap: 'wrap',
                                    color: pickTextColorBasedOnBgColorAdvanced(leftColor)
                                }} flex left>{item["Comment"] || item["Subtitle"]? <Text style={{ textDecorationLine: 'underline' }}>{item["Name"]}</Text> : item["Name"]}</Text>
                                <Text style={{
                                    padding: 10,
                                    fontSize: 18,
                                    height: 44,
                                    fontStyle: "italic",
                                    color: pickTextColorBasedOnBgColorAdvanced(rightColor)
                                }} flex>
                                    <Text style={{ color: leftColor != '#ff1100' ? "red" : "white", fontSize: 15 }}>{item["Weighting"] ? item["Weighting"] == "RecentlyUpdated" ? "Recent " : item["Weighting"] : ""}</Text>
                                    {item["Weighting"] && item["Weighting"].includes("x") ? " - " : ""}
                                    <Text style={{ fontWeight: 'bold' }}>{item["Grade"]}</Text>
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        )}
                    }
                    renderSectionHeader={({ section }) =>
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                        </View>
                    }
                    keyExtractor={(item, index) => item + index}
                />
            </RespectThemeBackground>
        )
    }
}

export default withTheme(ListOfAssignmentsView)