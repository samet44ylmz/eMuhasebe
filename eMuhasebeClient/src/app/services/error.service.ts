import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwalService } from './swal.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private swal: SwalService
  ) { }

  errorHandler(err:HttpErrorResponse){
    console.log(err);

    switch (err.status) {
      case 0:
        this.swal.callToast("API adresine ulaşılamıyor","error");
        break; 
        
        case 400:
          this.swal.callToast("Gönderilen parametrelerden biri eksik!","error");
          break;
      
      case 403:
        let errorMessage = "";
        for(const e of err.error.ErrorMessages){
          errorMessage += e + "\n";
        }

        this.swal.callToast(errorMessage,"error");
        break;
    
      case 404:
        this.swal.callToast("API adresi bulunamadı","error")
        break;
        
     case 500:
        // Handle 500 errors with error messages
        if(err.error && err.error.ErrorMessages && err.error.ErrorMessages.length > 0){
            this.swal.callToast(err.error.ErrorMessages[0], "error");
        } else if(err.error && typeof err.error === 'string'){
            // Handle case where error message is directly in the response body
            this.swal.callToast(err.error, "error");
        } else{
            this.swal.callToast("Bir hata oluştu", "error");
        }
        break;
      
    }    
  }
}