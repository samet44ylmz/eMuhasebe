import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { CashRegisterPipe } from '../../pipes/cash-register.pipe';
import { CashRegisterModel } from '../../models/cash-register.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { CurrencyTypes } from '../../models/currency-type.model';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-registers',
  standalone: true,
  imports: [SharedModule, CashRegisterPipe, RouterLink],
  templateUrl: './cash-registers.component.html',
  styleUrl: './cash-registers.component.css'
})
export class CashRegistersComponent implements OnInit, OnDestroy {
cashRegisters: CashRegisterModel[] = [];
search:string = "";

private routerSubscription: Subscription | undefined;

currencyTypes = CurrencyTypes;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:CashRegisterModel = new CashRegisterModel();
  updateModel:CashRegisterModel = new CashRegisterModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getAll();
    
    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/cash-registers') {
          this.getAll();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getAll(){
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll",{},(res)=> {
      this.cashRegisters = res;
    });
  }

  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("CashRegisters/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new CashRegisterModel();
        form.resetForm(); // Reset the form
        this.closeCreateModal(); // Use proper modal closing
        this.getAll();
      });
    }
  }

  deleteById(model: CashRegisterModel){
    this.swal.callSwal("Kasayı Sil?",`${model.name} kasasını silmek istiyor musunuz?`,()=> {
      this.http.post<string>("CashRegisters/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: CashRegisterModel){
    this.updateModel = {...model};
    this.updateModel.currencyTypeValue = this.updateModel.currencyType.value;
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("CashRegisters/Update",this.updateModel,(res)=> {
        this.swal.callToast(res,"info");
        form.resetForm(); // Reset the form
        this.closeUpdateModal(); // Use proper modal closing
        this.getAll();
      });
    }
  }
  
  // Proper modal closing methods
  private getModalInstance(modalId: string): any {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
      console.error(`${modalId} ID'li modal elementi bulunamadı.`);
      return null;
    }

    const bootstrap = (window as any).bootstrap;
    if (bootstrap && bootstrap.Modal) {
      try {
        // Modalı al veya (yoksa) oluştur
        return bootstrap.Modal.getOrCreateInstance(modalElement);
      } catch (e) {
        console.error("Bootstrap Modal hatası:", e);
        return null;
      }
    }
    console.error("Bootstrap 5 JavaScript (Modal) kütüphanesi bulunamadı.");
    return null;
  }
  
  closeCreateModal() {
    // TEMİZ KAPATMA KODU
    const modal = this.getModalInstance('createModal');
    if(modal) {
      modal.hide();
    } else {
      // Yedek yöntem
      this.createModalCloseBtn?.nativeElement.click();
    }
  }
  
  closeUpdateModal() {
    // TEMİZ KAPATMA KODU
    const modal = this.getModalInstance('updateModal');
    if(modal) {
      modal.hide();
    } else {
      // Yedek yöntem
      this.updateModalCloseBtn?.nativeElement.click();
    }
  }

changeCurrencyNameToSymbol(name: string) {
  if (name === "TL") return "₺";
  else if (name === "USD") return "$";
  else if (name === "EURO") return "€";
  else return "";
}

openTrash() {
  // Navigate to the cash register trash page
  this.router.navigate(['/cash-register-trash']);
}
}
  

