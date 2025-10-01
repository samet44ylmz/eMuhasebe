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

  get<T>(apiUrl:string, callBack:(res:T)=> void,errorCallBack?:()=> void ){    
    this.http.post<ResultModel<T>>(`${api}/${apiUrl}`, null,{
      headers: this.authHeader()
    }).subscribe({
      next: (res)=> {
        if(res.data){
          callBack(res.data);          
        }        
      },
      error: (err:HttpErrorResponse)=> {        
        this.error.errorHandler(err);

        if(errorCallBack){
          errorCallBack();
        }
      }
    })
  }

  post<T>(apiUrl:string, body:any, callBack:(res:T)=> void,errorCallBack?:()=> void ){    
    this.http.post<ResultModel<T>>(`${api}/${apiUrl}`,body,{
      headers: this.authHeader()
    }).subscribe({
      next: (res)=> {
        if(res.data){
          callBack(res.data);          
        }        
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
