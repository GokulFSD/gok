/**
 * Copyright 2018 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

//works in strict mode
'use strict'

//require the handler module.
//declaring a constant variable.
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')


const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')
const {TextEncoder, TextDecoder} = require('text-encoding/lib/encoding')

const _hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)
var encoder = new TextEncoder('utf8')
var decoder = new TextDecoder('utf8')
const MIN_VALUE = 0
const CJ_FAMILY = 'hygeia'
const CJ_NAMESPACE = _hash(CJ_FAMILY).substring(0, 6)

//function to obtain the payload obtained from the client
const _decodeRequest = (payload) =>
  new Promise((resolve, reject) => {
    payload = payload.toString().split(',')
    if (payload.length === 2) {
      resolve({
        action: payload[0],
        type: payload[1],
        quantity:payload[2]
      })
    }
   
    else {
      let reason = new InvalidTransaction('Invalid payload serialization')
      reject(reason)
    }
})

//function to display the errors
const _toInternalError = (err) => {
  console.log(" in error message block")
  let message = err.message ? err.message : err
  throw new InternalError(message)
}

//function to set the entries in the block using the "SetState" function
const _setEntry = (context, address, stateValue) => {
  let dataBytes = encoder.encode(stateValue)
  let entries = {
    [address]: dataBytes 
  }
  return context.setState(entries)
}

//function to bake a cookie
const makeBake =(context, address, quantity, userPK)  => (possibleAddressValues) => {
  let stateValueRep = possibleAddressValues[address]
  let newCount = 0
  let count
  if (stateValueRep == null || stateValueRep == ''){
    console.log("No previous cookies, creating new cookie jar ")
    newCount = quantity
  }
  else{
    count = decoder.decode(stateValueRep)
    newCount = parseInt(count) + quantity
    console.log("Cookies in the jar:"+newCount)
  }
  const actionText = "Baked " + quantity + (quantity == 1? " cookie": " cookies");
  let strNewCount = newCount.toString()
  context.addEvent(
    "cookiejar/cookiejar-action",
    [["action", "Bake"],["actionText", actionText], ["user", userPK]],
    Buffer.from("Current cookie count: " + newCount, 'utf8')
  )
  context.addReceiptData("Cookie count is " + strNewCount);
  return _setEntry(context, address, strNewCount)
}


class HygieiaHandler extends TransactionHandler{
  constructor(){
    super(CJ_FAMILY,['1.0'],[CJ_NAMESPACE])
  }
  decodepayload(payload){
  
    var  payloadDecoded= {
      action:payload[0],
      type: payload[1],
      quantity:payload[2]
    }
    return payloadDecoded
  }
  apply(transacationProcessRequest, context){

  //payload decoding*****
let payload = transacationProcessRequest.payload.toString().split(',')
console.log("HelloWorldlkfkhdkfshfgs!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
let pl=this.decodepayload(payload);
console.log(pl.action+","+pl.quantity+","+pl.type)

//address generation*****************
let signerPk=transacationProcessRequest.header.signerPublicKey;
console.log(signerPk.toString())
const publicKeyHash= _hash(signerPk)
let address=_hash('hygieia').substring(0,6)+publicKeyHash
/*if(payloadDecoded.action===null && payloadDecoded.quantity===null){
  throw new InvalidTransaction(`Quantity is required `)
}

let header=transactionProcessRequest.header;
let signerPublicKey=header.signerPublicKey;
let address= _hash('cookiejar').substring(0,6)+_hash(signerPublicKey)*/
//business logic
let cookiecount=0;

if(pl.action!==null ){
  
      if(pl.action=='bake'){
        
        if( pl.quantity!==null){
          cookiecount+=pl.quantity;//setState
          console.log(pl.type,pl.quantity);
          return context.getState([address])
          .then((currentStateMap)=>{
                console.log("stateMappings",currentStateMap)
                const myState = currentStateMap[address];
                var oldstate= decoder.decode(myState);
                console.log(oldstate,"oldstate")
                console.log(oldstate['cType'],JSON.stringify(oldstate),"oldstate")
                console.log("myState", decoder.decode(myState.cType),decoder.decode(myState).cQty);
                console.log("parsed mystate" ,parseInt(decoder.decode(myState)))
                console.log("seperate data")

                let newQuantity = 0;
                let newType;
                if(myState == '' || myState == null) {  ///first time baking
                      newQuantity = parseInt(pl.quantity);
                      newType=pl.type;

                  } 
                else {
                  let myStateSplit=decoder.decode(myState).toString().split(':');
                  if(myStateSplit.cType="Gingerbread"){
                    const oldQuantity = myStateSplit.cQty;
                    newQuantity = parseInt(pl.quantity) + parseInt(oldQuantity);
                    newType=pl.type
                  }
                  else if(myStateSplit.cType="Chocochip"){
                    const oldQuantity = myStateSplit.cQty;
                    newQuantity = parseInt(pl.quantity) + parseInt(oldQuantity);
                    newType=pl.type
                  }
                  else{
                    console.log("UNKNOWN TYPE OF COOKIE")
                  }
                  }
                console.log("newQuantity",newQuantity)  

                console.log("",newType+":"+newQuantity.toString())    
                
                
                var stateData={
                  cType:newType,
                  cQty:newQuantity
                };
                console.log(stateData.cQty+stateData.cType+"statedata")
                console.log(JSON.stringify(stateData),"json")
                const mynewState = encoder.encode(JSON.stringify(stateData));
                console.log("mynewState", mynewState);
                const newStateMap = {
                  [address]: mynewState
                }
                return context.setState(newStateMap);
                

            })
        }
        else{
          throw new InvalidTransaction(`Quantity is required `)	
        }
      
      }
      else if(pl.action=='eat'){
        cookiecount-=pl.quantity;
      }
      else{
        throw new InvalidTransaction(`Improper action `)	
      }
  
    }
  else{
    throw new InvalidTransaction(`Action is not given `)	
  }
  

  console.log("Cookie number is ",cookiecount)
  console.log("address",address.toString())






   /* return _decodeRequest(transactionProcessRequest.payload)
    .catch(_toInternalError)
    .then((update) => {
    let header = transactionProcessRequest.header
    let userPublicKey = header.signerPublicKey
    let action = update.action
    if (!update.action) {
      throw new InvalidTransaction('Action is required')
    }
    let quantity = update.quantity
    if (quantity === null || quantity === undefined) {
      throw new InvalidTransaction('Value is required')
    }
    quantity = parseInt(quantity)
    if (typeof quantity !== "number" ||  quantity <= MIN_VALUE) {
      throw new InvalidTransaction(`Value must be an integer ` + `no less than 1`)
    }

    // Select the action to be performed
    let actionFn
    if (update.action === 'bake') { 
      actionFn = makeBake
    }
    
    else {	
      throw new InvalidTransaction(`Action must be bake or eat `)		
    }

    // Get the current state, for the key's address:
    let Address = CJ_NAMESPACE + _hash(userPublicKey).slice(-64)
    let getPromise
    if (update.action == 'bake')
      getPromise = context.getState([Address])
    else
      getPromise = context.getState([Address])
    let actionPromise = getPromise.then(
      actionFn(context,Address, quantity, userPublicKey)
      )
    
    return actionPromise.then(addresses => {
      if (addresses.length === 0) {
        throw new InternalError('State Error!')
      }  
    })

   
   
  })*/
 }
}

module.exports = HygieiaHandler;
