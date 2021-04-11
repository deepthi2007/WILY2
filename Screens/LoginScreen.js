import * as React from 'react'
import {Text , TextInput , TouchableOpacity , View , StyleSheet} from 'react-native'
import firebase from 'firebase'
import TransactionScreen from './TransactionScreen'

export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state={
            userId:"",
            password:""
        }
    }

    login=async(userId,password)=>{
        if(userId && password){
            try{
                const response= await firebase.auth().signInWithEmailAndPassword(userId,password)
                if(response){
                    this.props.navigation.navigate("Transaction")
                }
            }
            catch(error){
                alert(error.message())
            }
        }
    }

    /* username:xyz@gmail.com
    password:abcd123 */

    render(){
        return(
            <View>
                <TextInput 
              style={styles.textbox}
              placeholder="user-id"
              onChangeText={text =>this.setState({userId:text})}
              />
              <TextInput 
              style={styles.textbox}
              placeholder="Password"
              onChangeText={text =>this.setState({password:text})}
              />
              <TouchableOpacity 
             style={styles.button}
              onPress={()=>{
                this.login(this.state.userId,this.state.password)
              }}>
              <Text >Login</Text>
            </TouchableOpacity>
            </View>
        )
    }
}

var styles = StyleSheet.create({
    textbox:{
        alignSelf:"center",
        borderWidth:2,
        marginTop:10,
    },
    button:{
        borderWidth:1,
        height:30,
        width:50,
        alignSelf:"center",
        backgroundColor:'orange'
      }
})