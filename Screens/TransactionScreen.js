import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   Image,
   StyleSheet,
  KeyboardAvoidingView ,
ToastAndroid,Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../Config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
       
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        /* 'noOfBooks': firebase.firestore.FieldValue.increment(1) */
      })
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
      
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
       /*  'noOfBooks': firebase.firestore.FieldValue.increment(-1) */
      })
    }

    checkBookEligibility=async()=>{
    var booksref = await  db.collection("books").where("bookId" ,"==",this.state.scannedBookId)
    .get();
    var transactionType = ""
    if(booksref.docs.length===0){
      transactionType=false;
    }else{
      booksref.docs.map((doc,index)=>{
        var book = doc.data();
        if(book.bookAvailability===true){
          transactionType = "issue";
        }else{
          transactionType = "return"
        }
      })
    }
    return transactionType
    }

    checkStudentEligibilityForBookIssue=async()=>{
      var studentsref = await db.collection("students").where("studentId","==",this.state.scannedStudentId)
      .get();
      var isStudentEligible = ""
      if(studentsref.docs.length===0){
        isStudentEligible=false
        alert("this student doesnt exist in our database")
        this.setState({scannedBookId:"",scannedStudentId:""})
      }else{
        studentsref.docs.map((doc,index)=>{
          var student = doc.data()
          if(student.noOfBooks<2){
            isStudentEligible=true
          }else{
            isStudentEligible=false
            alert("this.student already taken 2 books");
            this.setState({scannedStudentId:"",scannedBookId:""})
          }
        })
      }
      return isStudentEligible
    }

    checkStudentEligibilityForBookReturn=async()=>{
      var studentsref = await db.collection("transactions").where("bookId","==",this.state.scannedBookId)
      .limit(1).get();
      var isStudentEligible = ""
     studentsref.docs.map((doc,index)=>{
       var transaction = doc.data()
       if(transaction.studentId===this.state.scannedStudentId){
         isStudentEligible=true
       }else{
         isStudentEligible=false
         alert('this book was not issued by this student')
         this.setState({scannedBookId:"",scannedStudentId:""})
       }
     })
     return isStudentEligible
    }


    handleTransaction = async()=>{
      //verify if the student is eligible for book issue or return or none 
      //student id exists in the database 
      //issue : number of book issued < 2 
      //issue: verify book availability 
      //return: last transaction -> book issued by the student id
      var transactionType = await this.checkBookEligibility()
      if(!transactionType){
        alert("The book doesnt exist")
        this.setState({scannedBookId:"",scannedStudentId:""})
      }else if(transactionType==="issue"){
        var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
        if(isStudentEligible===true){
          this.initiateBookIssue()
          alert("book is issued to the student")
        }else if(transactionType==="return" ){
          var isStudentEligibleForReturn = this.checkStudentEligibilityForBookReturn()
          if(isStudentEligibleForReturn===true){
            this.initiateBookReturn();
            alert("the book is returned to the library")
          }
        }
      }
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30 , color:"violet" , fontWeight:"bold"}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            {<TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text =>this.setState({scannedBookId:text})}
              value={this.state.scannedBookId}/>}
            {<TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>}
            </View>

            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText ={text => this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                /* this.setState(
                  {scannedBookId:'',
                   scannedStudentId:''}) */
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline',
      color:"violet"
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: 'orange',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: 'orange',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });