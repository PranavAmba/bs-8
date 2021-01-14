import * as React from 'react'
import {View,Text,StyleSheet,TextInput,TouchableOpacity, Alert , KeyboardAvoidingView} from 'react-native'
//import { FlatList, ScrollView } from 'react-native-gesture-handler'
import db from '../config.js'
import firebase from 'firebase'
import AppHeader from '../Components/header.js'
import { FlatList, TapGestureHandler } from 'react-native-gesture-handler'
import {BookSearch} from 'react-native-google-books'
import { TouchableHighlight } from 'react-native'

export default class Request extends React.Component{
    constructor(){
        super()
        this.state={
            userId:firebase.auth().currentUser.email,
            title:'',
            reason:'',
            bookRequestActive:false,
            bookStatus:'',
            docId:'',
            requestId:'',
            dataSource:'',
            showFlatList:false
        }
    }
    render(){
        console.log(this.state.bookRequestActive)
        if(this.state.bookRequestActive==false){
        return(
            <View style={styles.container}>
                <AppHeader title='Request' navigation={this.props.navigation}></AppHeader>
                <KeyboardAvoidingView style={styles.keyBoardStyle}>
                    <TextInput placeholder='Title of book' style={styles.formTextInput} onChangeText={(info)=>{
                        this.getBooksFromApi(info)
                    }} 
                    onClear={()=>{
                        console.log('pranav')
                    }}
                    value={this.state.title}
                    ></TextInput>
                    {this.state.showFlatList
                    ?(<FlatList
                    data={this.state.dataSource}
                    renderItem={({item,i})=>(
                        <TouchableHighlight style={{ 
                            alignItems: "center", 
                            backgroundColor: "#DDDDDD", 
                            padding: 10, 
                            width: '90%', 
                        }} 
                        activeOpacity={0.6} 
                        underlayColor="#DDDDDD" 
                        onPress={()=>{ this.setState({ showFlatlist:false, bookName:item.volumeInfo.title, })} } 
                        bottomDivider>
                            <Text>{item.volumeInfo.title}</Text>
                        </TouchableHighlight>
                    )}
                    style={{marginTop:10,}}
                    keyExtractor={(item,index)=>{index.toString()}}
                    ></FlatList>)
                    :(<View style={styles.container}>
                        <TextInput placeholder='Why do you need this book?' style={styles.formTextInput} onChangeText={(info)=>{this.setState({
                        reason:info
                    })}}></TextInput>
                    <TouchableOpacity style={styles.button} onPress={()=>{
                        this.submitRequest()
                        this.setState({
                            bookRequestActive:true,
                            bookStatus:'requested'
                        })
                        }}>
                       <Text>Request</Text>
                    </TouchableOpacity>
                    </View>)
                    }
                </KeyboardAvoidingView>
            </View>
            
        )
    }
    else{
        return(
            <View style={styles.container}>
                <AppHeader title='Request' navigation={this.props.navigation}></AppHeader>
                <View style={{flex:1,justifyContent:'center'}}>
                    <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                        <Text>Book Name</Text>
                        <Text>{this.state.title}</Text>
                    </View>
                    <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
                        <Text>Book Status</Text>
                        <Text>{this.state.bookStatus}</Text>
                    </View>
                    <TouchableOpacity style={[styles.button,{width:'100%'}]} onPress={()=>{
                        this.sendNotification()
                        this.updateBookRequestStatus()
                        this.receivedBooks()
                        this.setState({
                            bookStatus:'received',
                            bookRequestActive:false
                        })
                    }}>
                        <Text>I have Received the book</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    }
    componentDidMount(){
        this.getRequestStatus()
        this.getBookRequest()
    }
    createUniqueId=()=>{
       return Math.random().toString(36).substring(7)
    }
    getBooksFromApi=async(bookName)=>{
        this.setState({
            title:bookName
        })
        console.log(bookName,'mercure')
        if(bookName>2){
            var books = await BookSearch.searchbook(bookName,'AIzaSyDbsitzcGH_XHLYGueUUvFRX0HrpDzhN5M')
            console.log(books)
            this.setState({
                dataSource:books.data,
                showFlatList:true
            })
        }
    }

     submitRequest=async()=>{
         db
        .collection('Request')
        .add({
            'userId':this.state.userId,
            'title':this.state.title,
            'reason':this.state.reason,
            'requestId':this.createUniqueId(),
            'status':'requested'
        })
        db
         .collection('users')
         .where('email','==',this.state.userId)
         .get()
         .then((snapshot)=>{
             snapshot.docs.map((doc)=>{
                 db
                 .collection('users')
                 .doc(doc.id)
                 .update({
                    isBookRequestActive:true
                })
             })
         })
        Alert.alert('done')
     }
     getRequestStatus=()=>{
         db
         .collection('users')
         .where('email','==',this.state.userId)
         .get()
         .then((snapShot)=>{
             snapShot.docs.map((doc)=>{
                 var temp = doc.data()
                 this.setState({
                     bookRequestActive:temp['isBookRequestActive']
                 })
             })
         })
     }
     getBookRequest=()=>{
         db
         .collection('Request')
         .where('userId','==',this.state.userId)
         .get()
         .then((snapshot)=>{
             snapshot.docs.map((doc)=>{
                 var temp = doc.data()
                 this.setState({
                     title:temp['title'],
                     requestId:temp['requestId'],
                     bookStatus:temp['status'],
                     docId:doc.id
                 })
             })
         })

     }
     sendNotification=()=>{
         db
         .collection('users')
         .where('email','==',this.state.userId)
         .get()
         .then((snapshot)=>{
             snapshot.docs.map((doc)=>{
                 var temp=doc.data()
                 var name=temp['firstName']+' '+temp['lastName']
                 db
                 .collection('Notifications')
                 .where('requestId','==',this.state.requestId)
                 .get()
                 .then((snapshot)=>{
                     snapshot.docs.map((doc)=>{
                         var temp2=doc.data()
                         db
                         .collection('Notifications')
                         .add({
                             bookName:this.state.title,
                             date:firebase.firestore.FieldValue.serverTimestamp(),
                             donorId:temp2['donorId'],
                             message:name+' recived the book '+this.state.title,
                             requestId:this.state.requestId,
                             status:'unread',
                             targetedUserId:temp2['donorId']
                         })     
                     })
                 })
             })
         })
     }

     updateBookRequestStatus=()=>{
         db
         .collection('Request')
         .where('userId','==',this.state.userId)
         .get()
         .then((snapshot)=>{
             snapshot.docs.map((doc)=>{
                 db
                 .collection('Request')
                 .doc(doc.id)
                 .update({
                    status:'received'
                })
             })
         })
         db
         .collection('users')
         .where('email','==',this.state.userId)
         .get()
         .then((snapshot)=>{
             snapshot.docs.map((doc)=>{
                 db
                 .collection('users')
                 .doc(doc.id)
                 .update({
                    isBookRequestActive:false
                })
             })
         })
     }
     receivedBooks=()=>{
         db
         .collection('BookReceived')
         .add({
             userId:this.state.userId,
             bookName:this.state.title,
             requestId:this.state.requestId,
             bookStatus:'Received'
         })
     }

}

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    keyBoardStyle : { 
        flex:1,
        alignItems:'center', 
        justifyContent:'center'
    }, 
    formTextInput:{ 
        width:"75%", 
        height:35, 
        alignSelf:'center', 
        borderColor:'#ffab91', 
        borderRadius:10, 
        borderWidth:1, 
        marginTop:20, 
        padding:10, 
    }, 
    button:{ 
        width:"75%", 
        height:50, 
        justifyContent:'center', 
        alignItems:'center', 
        borderRadius:10, 
        backgroundColor:"#ff5722", 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 8, }, 
        shadowOpacity: 0.44, 
        shadowRadius: 10.32, 
        elevation: 16, 
        marginTop:20 
    }, 


})