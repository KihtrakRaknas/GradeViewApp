import React from 'react';
import { Text, AsyncStorage, ScrollView, LayoutAnimation, View } from 'react-native';
import ColorPalette from 'react-native-color-palette'
import { ListItem } from 'react-native-elements';
import { navigationHeader } from '../globals/styles'
import { categories, colorsToPickFrom, defaultColors } from '../globals/constants';
import { pickTextColorBasedOnBgColorAdvanced } from '../globals/assignmentColorGlobals.js'
import RespectThemeBackground from '../components/RespectThemeBackground.js'

export default class ColorPickScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedColor: '#C0392B', selectedCategory: null }
        AsyncStorage.getItem('backgroundColors').then((backgroundColors) => {
            if (JSON.parse(backgroundColors))
                backgroundColors = JSON.parse(backgroundColors)
            else
                backgroundColors = {}
            this.setState({ backgroundColors })
        })
    }
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Assignment Styling',
            headerStyle: navigationHeader,
        }
    }

    setColor = (color, item) => {
        var newBackgroundColors = this.state.backgroundColors
        newBackgroundColors[item] = color
        this.setState({ backgroundColors: newBackgroundColors })
        AsyncStorage.getItem('backgroundColors').then((backgroundColors) => {
            if (JSON.parse(backgroundColors))
                backgroundColors = JSON.parse(backgroundColors)
            else
                backgroundColors = {}
            backgroundColors[item] = color;
            AsyncStorage.setItem('backgroundColors', JSON.stringify(backgroundColors)).then(() => {
                global.updateBackgroundColorsGlobal(backgroundColors)
            })
        })
    }

    render() {
        var items = [];
        categories.forEach((item) => {
            items.push(<ListItem
                title={item}
                key={item + "i"}
                onPress={() => {
                    AsyncStorage.getItem('backgroundColors').then((backgroundColors) => {
                        console.log(backgroundColors)
                    })
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
                    this.setState({ selectedCategory: item })
                }}
                rightElement={<View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50 / 2,
                    borderWidth: this.state.backgroundColors && this.state.backgroundColors[item] == '#FFFFFF' ? 1 : defaultColors[item] == '#FFFFFF' ? 1 : 0,
                    backgroundColor: this.state.backgroundColors && this.state.backgroundColors[item] ? this.state.backgroundColors[item] : defaultColors[item] ? defaultColors[item] : '#FFFFFF'
                }}></View>}
                bottomDivider={true}
            />)
            items.push(
                <View style={{ backgroundColor: "#F0F0F0" }} key={item + "p"}>{this.state.selectedCategory == item && <ColorPalette
                    onChange={color => {
                        this.setColor(color, item)
                    }}
                    value={this.state.backgroundColors[item] ? this.state.backgroundColors[item] : defaultColors[item] ? defaultColors[item] : '#FFFFFF'}
                    colors={colorsToPickFrom}
                    title={""}
                    icon={
                        <Text style={{ color: pickTextColorBasedOnBgColorAdvanced(this.state.backgroundColors[item] ? this.state.backgroundColors[item] : defaultColors[item] ? defaultColors[item] : '#FFFFFF') }}>✓</Text>
                    }
                />}</View>)
            return item;
        })
        return (
            <RespectThemeBackground>
                <ScrollView >
                    {items}
                    <ListItem
                        title="Reset"
                        key="Reset"
                        onPress={() => {
                            this.setState({ backgroundColors: defaultColors })
                            AsyncStorage.setItem('backgroundColors', JSON.stringify(defaultColors)).then(() => {
                                global.updateBackgroundColorsGlobal(defaultColors)
                            })
                        }}
                        subtitle="Reset the assignment stylings back to their default colors"
                    />
                </ScrollView>
            </RespectThemeBackground>
        )
    }
}