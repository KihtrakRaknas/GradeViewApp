import React from 'react';
import { ListItem } from 'react-native-elements'

export default class NameIDItem extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let email = this.props.item.email
        let name = this.props.item.name
        if (email.split("@")[1] == "sbstudents.org")
            email = email.split("@")[0]
        if(!name)
            name = email
        let image = this.props.item.image;
        if (image) {
            if (image.split("=").length < 2)
                image = image.replace('/s36-p-k-rw-no', '')
            image = image.split("=")[0]
        } else {
            image = null;
        }
        return (
            <ListItem
                leftAvatar={{ source: { uri: image } }}
                title={name}
                subtitle={email}
            />
        )
    }
}