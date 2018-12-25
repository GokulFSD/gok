import { Component, OnInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { SawtoothService } from '../sawtooth.service';
@Component({
  selector: 'app-hosprec',
  templateUrl: './hosprec.component.html',
  styleUrls: ['./hosprec.component.sass']
})
export class HosprecComponent implements OnInit {
  users=[];
  clickMessage="";
  servicedata="";
  constructor(private Form:SawtoothService) { 
    console.log("Inside recipient page component.ts")
  }
  ngOnInit() {
  }
  addForm(btype:string,otype:string){
   // event.preventDefault();
   
    this.clickMessage="btype+otype"+btype+otype;
    
    const servd =this.Form.sendData(btype,otype);
    
    this.servicedata="this is service data"+servd;
    //+servDt.toString();
    
  }
}

  
