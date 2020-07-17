export default (percent) => {
    if (!Number(percent))
        return "? "
    else if (percent >= 97)
        return "A+"
    else if (percent >= 93)
        return "A "
    else if (percent >= 90)
        return "A-"
    else if (percent >= 87)
        return "B+"
    else if (percent >= 83)
        return "B "
    else if (percent >= 80)
        return "B-"
    else if (percent >= 77)
        return "C+"
    else if (percent >= 73)
        return "C "
    else if (percent >= 70)
        return "C-"
    else if (percent >= 67)
        return "D+"
    else if (percent >= 63)
        return "D"
    else if (percent >= 60)
        return "D-"
    else
        return "F "
}