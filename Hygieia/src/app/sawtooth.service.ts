import { Injectable } from '@angular/core';


import { createHash } from 'crypto-browserify';
import * as protobuf  from "sawtooth-sdk/protobuf";
import { CryptoFactory, createContext } from "sawtooth-sdk/signing";
import * as Secp256k1PrivateKey from 'sawtooth-sdk/signing/secp256k1';

import { HttpClient } from '@angular/common/http';

import {Buffer} from 'buffer/';

import { TextEncoder, TextDecoder} from "text-encoding/lib/encoding";



@Injectable({
  providedIn: 'root'
})
export class SawtoothService {

  private Family_name='hygeia';
  private Family_version='1.0';
  private Rest_api_base_url='http://localhost:4200/api';

  public address:any;
  public publicKey:any;
  public signer:any;

  
    
  constructor() {}


  private hash(v) {
    return createHash('sha512').update(v).digest('hex');
  }

  private genAddress(pblckey){
    this.address =  this.hash("hygeia").substr(0, 6) + this.hash(pblckey).substr(0, 64);
    return this.address;
  }
  /*-------------Creating transactions & batches--------------------*/
/*
  private getTransactionsList(payload): any {
    // Create transaction header
    const transactionHeader = this.getTransactionHeaderBytes([this.address], [this.address], payload);
    // Create transaction
    const transaction = this.getTransaction(transactionHeader, payload);
    // Transaction list
    const transactionsList = [transaction];
    return transactionsList
  }
*/

private getTransactionHeaderBytes(inputAddressList, outputAddressList, payload): any {
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: this.Family_name,
    familyVersion: this.Family_version,
    inputs: inputAddressList,
    outputs: outputAddressList,
    signerPublicKey: this.publicKey,
    batcherPublicKey: this.publicKey,
    dependencies: [],
    payloadSha512: this.hash(payload),
    nonce: (Math.random() * 1000).toString()
  }).finish();

  return transactionHeaderBytes;
}

private getTransaction(transactionHeaderBytes, payloadBytes): any {
    const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: this.signer.sign(transactionHeaderBytes),
    payload: payloadBytes
  });

  return transaction;
}

private getBatchList(transactionsList) {
  // Complete here
  //const transactions = transactionsList;
  const batchHeaderBytes = protobuf.BatchHeader.encode({
  signerPublicKey: this.signer.getPublicKey(),
  transactionIds: transactionsList.map((txn) => txn.headerSignature),//map sets ,for each header in transactionlist ,is stored in new list trasactionIDS
  }).finish();

  const signature = this.signer.sign(batchHeaderBytes)

  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactionsList
    });

    const batchList = protobuf.BatchList.encode({
      batches: [batch]
      }).finish()

      return [batchList]
}

/*-------END Creating transactions & batches-----------*/

// Count button will call this function directly
// For Count button calls, 'batchListBytes' will be null
  public sendToRestAPI(batchListBytes) :Promise<any>{
    /*if (batchListBytes == null) {
      // GET state
      return this.getState(this.address)
        .then((response) => {
          return response.json();
        })
        .then((responseJson) => {
          return this.getDecodedData(responseJson)
        })
        .catch((error) => {
          console.error(error);
        });
    }
    else {*/

      // POST batch list
      return this.postBatchList(batchListBytes)
    /*}*/
  }
  // Post batch list to rest api
  private postBatchList(batchListBytes) {
    // Complete here
      return window.fetch('http://localhost:4201/api/batches', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/octet-stream'
      },
      body: batchListBytes
      })


      .then((resp) => {
      console.log("response", resp);
      })
      .catch((error) => {
      console.log("error in fetch", error);
      })
       
  }




  public sendData(name,age) {
    
    try{

    const context = createContext('secp256k1');
    // Creating a random private key - In LIVE, we will be using our own private keys
    const privateKey = context.newRandomPrivateKey();
    this.signer = new CryptoFactory(context).newSigner(privateKey);
    this.publicKey=this.signer.getPublicKey().asHex();
    console.log("Inside constructor") 
    // Encode the payload
    /*const payload = this.getEncodedData(action, values);*/
    const data = name + "," + age+",";
    console.log(data+"data");
    //return data;
    const encData=new TextEncoder('utf8').encode(data);
    console.log(encData+"encDAta");
    console.log("Public"+this.publicKey+"Private ")
    this.address=this.genAddress(this.publicKey)
    console.log("Address"+this.address)
     // Create transaction header
    const transactionHeader = this.getTransactionHeaderBytes([this.address], [this.address], encData);
    // Create transaction
    const transaction = this.getTransaction(transactionHeader, encData);
    // Transaction list
    const transactionsList = [transaction];
   // Create a list of batches. In our case, one batch only in the list
   const batchList = this.getBatchList(transactionsList);

   // Send the batch to REST API
    this.sendToRestAPI(batchList)
   .then((resp) => {
     console.log("sendToRestAPI response", resp);
   })
   .catch((error) => {
     console.log("error here", error);
   })
    return batchList;
  }
    catch (e) {
      console.log("Error in reading the key details", e);
      return "ERROR";
  }
  
  
/*
    
    const transactionsList = this.getTransactionsList(payload);
    const batchList = this.getBatchList(transactionsList);
    // Send the batch to REST API
    await this.sendToRestAPI(batchList)
      .then((resp) => {
        console.log("response here", resp);
      })
      .catch((error) => {
        console.log("error here", error);
      })*/
  }
}