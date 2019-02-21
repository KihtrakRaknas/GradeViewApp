import React from 'react';
import { AppRegistry, SectionList, StyleSheet, Text, View ,ActivityIndicator} from 'react-native';

export default class App extends React.Component {
	  constructor(props){
	    super(props);
	    this.state ={ isLoading: true}
  }

    componentDidMount(){
		console.log("TEST")
      return fetch('https://gradeview.herokuapp.com/', {
		  method: 'POST',
		  headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
			username: '10012734',
			password: 'Sled%2#9',
		  }),
		})
        .then((response) => {
			console.log(response);
			//response.json()
			console.log(typeof response)
				return response.json();
			})
        .then((responseJson) => {
			console.log(responseJson);
          this.setState({
            isLoading: false,
            dataSource: responseJson.movies,
          }, function(){

          });

        })
        .catch((error) =>{
          console.error(error);
        });
  }

  render() {
	      if(this.state.isLoading){
	        return(
	          <View style={{flex: 1, padding: 20}}>
	            <ActivityIndicator/>
	          </View>
	        )
    }

    return (

      <View style={styles.container}>
        <SectionList
          sections={[
            {title: 'Class', data: ['Assignment1']},
            {title: 'cLASS', data: ['Assignment1', 'Assignment1', 'Assignment1', 'Assignment1', 'Assignment1', 'Assignment1', 'Assignment1']},
          ]}
          renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})
