import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterModule],
  template: `
  <div style="height: 90vh; display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <h1>{{ response }}</h1>
    <a routerLink="/login">Giriş sayfasına dönmek için tıklayınız</a>
  </div>
  

`
})
export class ConfirmEmailComponent {
  email: string = '';
  response: string = 'Mail adresiniz onaylanıyor...';
constructor(
  private activated: ActivatedRoute,
  private http: HttpService  
) { 
  this.activated.params.subscribe(res => {
    this.email = res['email'];
    this.confirm();
  });
}

confirm() {
  this.http.post<string>("Auth/ConfirmEmail", { email: this.email }, (res: string) => {
    this.response = res;
  });
}

}