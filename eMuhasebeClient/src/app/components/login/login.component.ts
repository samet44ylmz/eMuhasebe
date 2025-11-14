import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { LoginModel } from '../../models/login.model';
import { HttpService } from '../../services/http.service';
import { LoginResponseModel } from '../../models/login.response.model';
import { Router } from '@angular/router';
import { SwalService } from '../../services/swal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  model: LoginModel = new LoginModel();
  // email:string = "";

  // @ViewChild("sendConfirmEmailModalCloseBtn") sendConfirmEmailModalCloseBtn:ElementRef<HTMLButtonElement>|undefined;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ){}

 signIn() {
    this.http.post<LoginResponseModel>("Auth/Login",this.model,(res)=> {
        localStorage.setItem("token", res.token);
        this.router.navigateByUrl("/");
    }, (err: HttpErrorResponse) => {
        // Handle login errors and display appropriate messages
        console.log('Login failed:', err);
        
        // Check if it's a 500 error with a specific message
        if (err.status === 500) {
            if (err.error && err.error.ErrorMessages && err.error.ErrorMessages.length > 0) {
                this.swal.callToast(err.error.ErrorMessages[0], "error");
            } else if (err.error && typeof err.error === 'string') {
                this.swal.callToast(err.error, "error");
            } else {
                this.swal.callToast("Giriş başarısız oldu", "error");
            }
        } else {
            // For other errors, let the ErrorService handle them
            // But we need to import and inject ErrorService for this
            this.swal.callToast("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
        }
    });
}

// sendConfirmEmail() {
//     this.http.post<string>("Auth/SendConfirmEmail",{email: this.email},(res)=> {
//         this.swal.callToast(res,"info");
//         this.sendConfirmEmailModalCloseBtn?.nativeElement.click();
//         this.email = "";
//     });
// }
}