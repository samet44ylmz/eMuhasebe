import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CustomerModel } from '../../models/customer.model';
// import { CustomerTypes } from '../../models/customer.model';
import { SharedModule } from '../../modules/shared.module';
import { CustomerPipe } from '../../pipes/customer.pipe';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SharedModule, CustomerPipe, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit, OnDestroy {
customers: CustomerModel[] = [];        
search:string = "";
p: number = 1;
// customerTypes = CustomerTypes;

private routerSubscription: Subscription | undefined;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:CustomerModel = new CustomerModel();
  updateModel:CustomerModel = new CustomerModel();

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
        if (event.url === '/customers') {
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
    this.http.post<CustomerModel[]>("Customers/GetAll",{},(res)=> {
      this.customers = res;
    });
  }

  create(form: NgForm){
    // Mark all fields as touched to show validation errors
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
    
    // Manual validation checks
    if (!this.createModel.name || this.createModel.name.trim().length < 2) {
      this.swal.callToast("Müşteri adı en az 2 karakter olmalıdır", "error");
      return;
    }
    
    
  
    
    this.http.post<string>("Customers/Create",this.createModel,(res)=> {
      this.swal.callToast(res);
      this.createModel = new CustomerModel();
      this.createModalCloseBtn?.nativeElement.click();
      this.getAll();
    });
  }

  deleteById(model: CustomerModel){
    this.swal.callSwal("Müşteriyi Sil?",`${model.name} müşterisini silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Customers/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: CustomerModel){
    this.updateModel = {...model};
    // this.updateModel.typeValue = this.updateModel.type.value;

  }

  update(form: NgForm){
    // Mark all fields as touched to show validation errors
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
    
    // Manual validation checks
    if (!this.updateModel.name || this.updateModel.name.trim().length < 2) {
      this.swal.callToast("Müşteri adı en az 2 karakter olmalıdır", "error");
      return;
    }
    
    
    
   
    
    this.http.post<string>("Customers/Update",this.updateModel,(res)=> {
      this.swal.callToast(res,"info");
      this.updateModalCloseBtn?.nativeElement.click();
      this.getAll();
    });
  }
  
  openTrash() {
    // Navigate to the customer trash page
    this.router.navigate(['/customer-trash']);
  }
}
