import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { UserPipe } from '../../pipes/user.pipe';
import { UserModel } from '../../models/user.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule, UserPipe, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
users: UserModel[] = [];
search:string = "";

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:UserModel = new UserModel();
  updateModel:UserModel = new UserModel();

  constructor(
    private http: HttpService,
    private swal: SwalService
  ){}

  ngOnInit(): void {
    this.getAll();
  }

  getAll(){
    this.http.post<UserModel[]>("Users/GetAll",{},(res)=> {
      console.log('Backend\'den gelen veri:', res);
      this.users = res;
      console.log('Users list updated:', this.users);
    });
  }


  create(form: NgForm){
    // Mark all fields as touched to show validation errors
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
    
    // Manual validation checks
    if (!this.createModel.firstName || this.createModel.firstName.trim().length < 3) {
      this.swal.callToast("Ad en az 3 karakter olmalıdır", "error");
      return;
    }
    
    if (!this.createModel.lastName || this.createModel.lastName.trim().length < 3) {
      this.swal.callToast("Soyad en az 3 karakter olmalıdır", "error");
      return;
    }
    
    if (!this.createModel.userName || this.createModel.userName.trim().length < 3) {
      this.swal.callToast("Kullanıcı adı en az 3 karakter olmalıdır", "error");
      return;
    }
    
    if (!this.createModel.email || !this.createModel.email.includes('@')) {
      this.swal.callToast("Geçerli bir e-posta adresi giriniz", "error");
      return;
    }
    
    if (!this.createModel.password || this.createModel.password.length < 1) {
      this.swal.callToast("Şifre giriniz", "error");
      return;
    }
    
    // All validations passed, proceed with save
    this.http.post<string>("Users/Create",this.createModel,(res)=> {
      this.swal.callToast(res);
      this.createModel = new UserModel();
      form.resetForm();
      
      // Close modal and refresh data
      this.createModalCloseBtn?.nativeElement.click();
      
      // Refresh the user list immediately after create
      this.getAll();
    });
  }

  deleteById(model: UserModel){
    this.swal.callSwal("Kullanıcıyı Sil?",`${model.fullName} Kullanıcısını silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Users/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: UserModel){
    this.updateModel = {...model};
    console.log('Update model populated:', this.updateModel);
  }

  update(form: NgForm){
    if(form.valid){
      // Fix: Check the updateModel password, not set it directly
      if (this.updateModel.password === "") this.updateModel.password = null; 
      
      // Create a clean model for update to avoid entity tracking issues
      const cleanUpdateModel = {
        id: this.updateModel.id,
        firstName: this.updateModel.firstName,
        lastName: this.updateModel.lastName,
        fullName: this.updateModel.fullName,
        password: this.updateModel.password,
        userName: this.updateModel.userName,
        email: this.updateModel.email,
        isAdmin: this.updateModel.isAdmin
        // Excluding companyUsers to avoid entity tracking conflicts
      };
        
      this.http.post<string>("Users/Update",cleanUpdateModel,(res)=> {
        this.swal.callToast(res,"info");
        form.resetForm();
        
        // Close modal and refresh data
        this.updateModalCloseBtn?.nativeElement.click();
        
        // Refresh the user list immediately after update
        this.getAll();
      });
    }
  }
}