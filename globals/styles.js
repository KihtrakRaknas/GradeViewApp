import { StyleSheet } from 'react-native';


export const container = {
    flex: 1,
}


export const navigationHeader = {
    backgroundColor: '#6fc2d0'
}

// Function that takes a boolean for dark mode and returns a color scheme
export const themeFromMode = l => {
    const offWhite = l ? '#fefefe' : '#010101'
    return {
        isLight: l,
        colors: {
            black: l ? '#000000' : '#FFFFFF',
            white: l ? '#FFFFFF' : '#000000',
            offWhite,
            grey1: l ? '#F6F8FA' : '#25262C',
            grey2: l ? '#E6E8EA' : '#35363C',
            cardText: l ? '#55565C' : '#C6C8CA',
            grey5: l ? '#35363C' : '#E6E8EA',
            grey6: l ? '#25262C' : '#F6F8FA',
        },
        ListItem: {
            containerStyle:{
                backgroundColor: offWhite,
            }
        }
    }
}