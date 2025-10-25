import { Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { UserPipe } from '../../pipes/user.pipe';
import { UserModel } from '../../models/user.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { CompanyModel } from '../../models/company.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule, UserPipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
users: UserModel[] = [];
companies: CompanyModel[] = [];
search:string = "";
selectedCompanyIds: string[] = [];

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
   this.getAllCompanies();
  }

  getAll(){
    this.http.post<UserModel[]>("Users/GetAll",{},(res)=> {
      console.log('Backend\'den gelen veri:', res);
      console.log('İlk kullanıcının companyUsers:', res[0]?.companyUsers);
      console.log('İlk kullanıcının companyUsers uzunluğu:', res[0]?.companyUsers?.length);
      this.users = res;
    });
  }

    getAllCompanies(){
    this.http.post<CompanyModel[]>("Companies/GetAll",{},(res)=> {
      this.companies = res;
    });
  }


  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("Users/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new UserModel();
        form.resetForm();
        
        // Force close modal using multiple methods
        setTimeout(() => {
          // Method 1: Click close button
          this.createModalCloseBtn?.nativeElement.click();
          
          // Method 2: jQuery modal hide
          if ((window as any).$) {
            (window as any).$('#createModal').modal('hide');
          }
          
          // Method 3: Bootstrap 5 modal hide
          const modalElement = document.getElementById('createModal');
          if (modalElement) {
            const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
            if (modal) {
              modal.hide();
            } else {
              // Method 4: Remove modal classes manually
              modalElement.classList.remove('show');
              modalElement.style.display = 'none';
              document.body.classList.remove('modal-open');
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.remove();
              }
            }
          }
        }, 200);
        
        this.getAll();
      });
    }
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
    this.updateModel.companyIds = this.updateModel.companyUsers.map(value => value.companyId);
  }

  update(form: NgForm){
    if(form.valid){
      if (this.updateModel.password === "")this.updateModel.password = null; 
        
    
      this.http.post<string>("Users/Update",this.updateModel,(res)=> {
        this.swal.callToast(res,"info");
        form.resetForm();
        
        // Force close modal using multiple methods
        setTimeout(() => {
          // Method 1: Click close button
          this.updateModalCloseBtn?.nativeElement.click();
          
          // Method 2: jQuery modal hide
          if ((window as any).$) {
            (window as any).$('#updateModal').modal('hide');
          }
          
          // Method 3: Bootstrap 5 modal hide - Daha güvenli yaklaşım
          const modalElement = document.getElementById('updateModal');
          if (modalElement) {
            // Bootstrap kontrolü
            const bootstrap = (window as any).bootstrap;
            if (bootstrap && bootstrap.Modal) {
              try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                  modal.hide();
                } else {
                  // Modal instance yoksa sadece DOM manipülasyonu yap
                  modalElement.classList.remove('show');
                  modalElement.style.display = 'none';
                  document.body.classList.remove('modal-open');
                  const backdrop = document.querySelector('.modal-backdrop');
                  if (backdrop) {
                    backdrop.remove();
                  }
                }
              } catch (error) {
                // Hata durumunda DOM manipülasyonu
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                  backdrop.remove();
                }
              }
            } else {
              // Bootstrap yoksa DOM manipülasyonu
              modalElement.classList.remove('show');
              modalElement.style.display = 'none';
              document.body.classList.remove('modal-open');
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) {
                backdrop.remove();
              }
            }
          }
        }, 200);
        
        this.getAll();
      });
    }
  }

  // Helpers for multi-select without Ctrl key
  isSelected(selectedIds: string[] | undefined, id: string): boolean {
    if (!selectedIds) return false;
    return selectedIds.includes(id);
  }

  toggleSelection(selectedIds: string[] | undefined, id: string): void {
    if (!selectedIds) {
      // initialize if undefined
      if (this.createModel && (this.createModel as any).companyIds === selectedIds) {
        this.createModel.companyIds = [id];
        return;
      }
      if (this.updateModel && (this.updateModel as any).companyIds === selectedIds) {
        this.updateModel.companyIds = [id];
        return;
      }
      return;
    }

    const index = selectedIds.indexOf(id);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(id);
    }
  }
}
