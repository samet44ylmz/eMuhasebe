import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api } from '../constants';
import { ResultModel } from '../models/result.model';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private error: ErrorService
  ) { }

  private authHeader(){
    const token = localStorage.getItem("token") ?? this.auth.token ?? "";
    return {
      "Authorization": "Bearer " + token
    };
  }

  // Add cache-busting headers to prevent caching
  private requestHeaders(){
    const headers = this.authHeader();
    return {
      ...headers,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    };
  }

  post<T>(apiUrl:string, body:any, callBack:(res:T)=> void,errorCallBack?:(err:HttpErrorResponse)=> void ){    
    this.http.post<any>(`${api}/${apiUrl}`,body,{
      headers: this.requestHeaders()
    }).subscribe({
      next: (res)=> {
        console.log('=== HTTP POST Response Debug ===');
        console.log('Full response:', res);
        console.log('Response type:', typeof res);
        console.log('Response keys:', Object.keys(res));
        
        // Handle different response structures
        let data: T;
        if (res.data !== undefined && res.data !== null) {
          console.log('Using res.data:', res.data);
          data = res.data;
        } else if (res.Data !== undefined && res.Data !== null) {
          console.log('Using res.Data:', res.Data);
          data = res.Data;
        } else if (res.isSuccessful && (res.value !== undefined || res.Value !== undefined)) {
          console.log('Using res.value/Value:', res.value || res.Value);
          data = res.value || res.Value;
        } else {
          console.log('Using res directly:', res);
          data = res;
        }
        console.log('Final data to callback:', data);
        console.log('=== End Debug ===');
        callBack(data);
      },
      error: (err:HttpErrorResponse)=> {        
        if(errorCallBack){
          errorCallBack(err);
        } else {
          this.error.errorHandler(err);
        }
      }
    })
  }

  get<T>(apiUrl:string,  callBack:(res:T)=> void,errorCallBack?:()=> void ){    
    this.http.get<any>(`${api}/${apiUrl}`,{
      headers: this.requestHeaders()
    }).subscribe({
      next: (res)=> {
        console.log('=== HTTP POST Response Debug ===');
        console.log('Full response:', res);
        console.log('Response type:', typeof res);
        console.log('Response keys:', Object.keys(res));
        
        // Handle different response structures
        let data: T;
        if (res.data !== undefined && res.data !== null) {
          console.log('Using res.data:', res.data);
          data = res.data;
        } else if (res.Data !== undefined && res.Data !== null) {
          console.log('Using res.Data:', res.Data);
          data = res.Data;
        } else if (res.isSuccessful && (res.value !== undefined || res.Value !== undefined)) {
          console.log('Using res.value/Value:', res.value || res.Value);
          data = res.value || res.Value;
        } else {
          console.log('Using res directly:', res);
          data = res;
        }
        console.log('Final data to callback:', data);
        console.log('=== End Debug ===');
        callBack(data);
      },
      error: (err:HttpErrorResponse)=> {        
        this.error.errorHandler(err);

        if(errorCallBack){
          errorCallBack();
        }
      }
    })
  }
 
}
