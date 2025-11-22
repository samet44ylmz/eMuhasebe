import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { BankPipe } from '../../pipes/bank.pipe';
import { RouterLink } from '@angular/router';
import { BankModel } from '../../models/bank.model';
import { CurrencyTypes } from '../../models/currency-type.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-banks',
  standalone: true,
  imports: [SharedModule, BankPipe, RouterLink],
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.css'
})
export class BanksComponent implements OnInit, OnDestroy {
banks: BankModel[] = [];
search:string = "";

private routerSubscription: Subscription | undefined;

currencyTypes = CurrencyTypes;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:BankModel = new BankModel();
  updateModel:BankModel = new BankModel();

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
        if (event.url === '/banks') {
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
    this.http.post<BankModel[]>("Banks/GetAll",{},(res)=> {
      this.banks = res;
    });
  }

  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("Banks/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new BankModel();
        form.resetForm(); // Reset the form
        this.closeCreateModal(); // Use proper modal closing
        this.getAll();
      });
    }
  }

  deleteById(model: BankModel){
    this.swal.callSwal("Bankayı Sil?",`${model.name} bankasını silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Banks/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: BankModel){
    this.updateModel = {...model};
    this.updateModel.currencyTypeValue = this.updateModel.currencyType.value;
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Banks/Update",this.updateModel,(res)=> {
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
  // Navigate to the bank trash page
  this.router.navigate(['/bank-trash']);
}
}
