import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { ProductPipe } from '../../pipes/product.pipe';
import { RouterLink } from '@angular/router';
import { ProductModel } from '../../models/product.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SharedModule, ProductPipe, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, OnDestroy {
products: ProductModel[] = [];
search:string = "";
p: number = 1;

private routerSubscription: Subscription | undefined;


  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:ProductModel = new ProductModel();
  updateModel:ProductModel = new ProductModel();

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
        if (event.url === '/products') {
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
    this.http.post<ProductModel[]>("Products/GetAll",{},(res)=> {
      this.products = res;
    });
  }

  create(form: NgForm){
    // Mark all fields as touched to show validation errors
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
    
    // Manual validation checks
    if (!this.createModel.name || this.createModel.name.trim().length < 2) {
      this.swal.callToast("Ürün adı en az 2 karakter olmalıdır", "error");
      return;
    }
    
    
    
    this.http.post<string>("Products/Create",this.createModel,(res)=> {
      this.swal.callToast(res);
      this.createModel = new ProductModel();
      this.createModalCloseBtn?.nativeElement.click();
      this.getAll();
    });
  }

  deleteById(model: ProductModel){
    this.swal.callSwal("Ürünü Sil?",`${model.name} ürününü silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Products/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: ProductModel){
    this.updateModel = {...model};
    
  }

  update(form: NgForm){
    // Mark all fields as touched to show validation errors
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
    
    // Manual validation checks
    if (!this.updateModel.name || this.updateModel.name.trim().length < 2) {
      this.swal.callToast("Ürün adı en az 2 karakter olmalıdır", "error");
      return;
    }
    
   
    
    this.http.post<string>("Products/Update",this.updateModel,(res)=> {
      this.swal.callToast(res,"info");
      this.updateModalCloseBtn?.nativeElement.click();
      this.getAll();
    });
  }
  
  openTrash() {
    // Navigate to the product trash page
    this.router.navigate(['/product-trash']);
  }

}


