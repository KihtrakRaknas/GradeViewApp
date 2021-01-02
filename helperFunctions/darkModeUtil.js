import { Appearance } from 'react-native';

export function preferredBackgroundColor(){
    const colorScheme = Appearance.getColorScheme();
    // Appearance.addChangeListener((colorScheme)=>{
    //     console.log(`color update: ${JSON.stringify(colorScheme)`)
    // })
    console.log(`color: ${colorScheme}`)
    if (colorScheme === 'dark') {
        return "black"
    }
    return "white"
}