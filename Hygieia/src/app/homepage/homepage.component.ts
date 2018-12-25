import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { SawtoothService } from '../sawtooth.service';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.sass']
})
export class HomepageComponent implements OnInit {
  users=[];
  clickMessage="";
  servicedata="";
  constructor(private Form:SawtoothService) { 
    console.log("Inside home page component.ts")
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


