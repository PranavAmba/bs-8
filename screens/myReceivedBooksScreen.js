import * as React from 'react'
import {View,Text,StyleSheet,TextInput,TouchableOpacity, Alert , KeyboardAvoidingView} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import db from '../config.js'
import firebase from 'firebase'
import AppHeader from '../Components/header.js'

export default class MyReceivedBooksScreen extends React.Component{
    constructor(){
        super()
        this.state={
            userId:firebase.auth().currentUser.email,
            books:[]
        }
    }
    render(){
        return(
            <View>
                <AppHeader title='MyReceivedBooks' navigation={this.props.navigation}></AppHeader>
                <FlatList
                   data={this.state.books}
                   renderItem={({item,i})=>(
                       <ListItem
                       key={i}
                       title={item.bookName}
                       titleStyle={{color:'black',fontWeight:'bold'}}
                       ></ListItem>
                   )}
                   keyExtractor={(item,index)=>index.toString()}
                ></FlatList>
            </View>
        )
    }
    getMyReceivedBooks=()=>{
        db
        .collection('BookReceived')
        .where('userId','==',this.state.userId)
        .get()
        .then((snapshot)=>{
            var tempArr =[]
            snapshot.docs.map((doc)=>{
                var temp=doc.data()
                tempArr.push(temp)
            })
            this.setState({
                books:tempArr
            })
        })
    }
}