export const defaultColors = { "Homework": "#e6feff", "Quizzes": "#ffe6ab", "Performance Assessments": "#ffe0de", "Tests": "#ffe0de", "Classwork": "#e6feff", "Essays": "#e6feff", "Labs": "#e6feff", "Oral Assessments": "#ffe6ab", "Participation": "#e0ffd9", "Pre Test Assessments 1": "#e0ffd9", "Pre Test Assessments 2": "#e0ffd9", "Post Test Assessment 1": "#ffe0de", "Post Test Assessment 2": "#ffe0de", "Projects": "#d7d9f5", "Research and Inquiry": "#d7d9f5", "Socratic Seminar": "#d7d9f5", "Summer Assignment": "#ffff00", "Technique": "#e6feff" }

global.updateBackgroundColorsGlobal = function (backgroundColors) {
    this.setState({ backgroundColors })
}

export function pickTextColorBasedOnBgColorAdvanced(bgColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? '#000000' : '#FFFFFF';
}