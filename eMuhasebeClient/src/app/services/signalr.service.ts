import { Injectable, signal } from '@angular/core';
import * as signalr from '@microsoft/signalr'
import { signalRAPI } from '../constants';
@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  hub: signalr.HubConnection | undefined
  constructor() { }

  connect(callBack: () => void){
    this.hub = new signalr.HubConnectionBuilder()
    .withUrl(`${signalRAPI}/report-hub`)
    .build();
    this.hub
    .start()
    .then(()=>{
      console.log("Report hub ile bağlantı başlatıldı...")

      callBack();
    })
  }
}
