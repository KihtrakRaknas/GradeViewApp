import { StyleSheet } from 'react-native';


export const container = {
    flex: 1,
}


export const navigationHeader = {
    backgroundColor: '#6fc2d0'
}

// Function that takes a boolean for dark mode and returns a color scheme
export const themeFromMode = l => ({
    isLight: l,
    colors: {
        black: l ? '#000000' : '#FFFFFF',
        white: l ? '#FFFFFF' : '#000000',
        offWhite: l ? '#f5f5f5' : '#151515',
        grey6: l ? '#151515' : '#f5f5f5',
    },
    ListItem: {
        containerStyle:{
            backgroundColor: l ? '#f5f5f5' : '#151515',
        }
    }
})