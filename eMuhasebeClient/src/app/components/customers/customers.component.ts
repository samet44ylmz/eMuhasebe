import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CustomerModel } from '../../models/customer.model';
// import { CustomerTypes } from '../../models/customer.model';
import { SharedModule } from '../../modules/shared.module';
import { CustomerPipe } from '../../pipes/customer.pipe';
import { AgGridWrapperComponent } from '../../shared/ag-grid/ag-grid-wrapper.component';
import type { ColDef, CellClickedEvent, ICellRendererParams } from 'ag-grid-community';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SharedModule, CustomerPipe, RouterLink, AgGridWrapperComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit, OnDestroy {
customers: CustomerModel[] = [];        
search:string = "";
p: number = 1;
// customerTypes = CustomerTypes;

private routerSubscription: Subscription | undefined;

  customerColDefs: ColDef[] = [
    { headerName: '#', valueGetter: 'node.rowIndex + 1', width: 70, sortable: false, filter: false, resizable: false },
    { field: 'name', headerName: 'Müşteri Adı', minWidth: 160 },
    { headerName: 'İl/İlçe', minWidth: 160, valueGetter: p => `${p.data?.city ?? ''} / ${p.data?.town ?? ''}` },
    { field: 'fullAddress', headerName: 'Adres', minWidth: 220 },
    { field: 'taxDepartment', headerName: 'Vergi Dairesi', minWidth: 160 },
    { field: 'taxNumber', headerName: 'Vergi Numarası', minWidth: 160 },
    { field: 'actions', headerName: 'İşlemler', sortable: false, filter: false, minWidth: 200, cellRenderer: (params: ICellRendererParams) => {
        const id = params.data?.id || '';
        return `
          <div class="d-flex">
            <a data-action="details" data-id="${id}" class="btn btn-dark btn-sm me-1" title="Detaylar">
              <i class="fa-solid fa-file me-1"></i>
            </a>
            <button data-action="edit" class="btn btn-outline-primary btn-sm me-1" title="Düzenle">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button data-action="delete" class="btn btn-outline-danger btn-sm" title="Sil">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;
      }
    }
  ];

  onCustomerGridCellClicked = (event: CellClickedEvent) => {
    if (!event || event.colDef.field !== 'actions') return;
    const originalEvent = event.event as MouseEvent;
    const target = originalEvent.target as HTMLElement;
    const buttonOrLink = target.closest('button, a') as HTMLElement | null;
    if (!buttonOrLink) return;
    const action = buttonOrLink.getAttribute('data-action');
    switch (action) {
      case 'details': {
        const id = buttonOrLink.getAttribute('data-id');
        if (id) {
          this.router.navigate(['/customers/details', id]);
        }
        break;
      }
      case 'edit':
        this.get(event.data);
        break;
      case 'delete':
        this.deleteById(event.data);
        break;
      default:
        break;
    }
  };

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

  // Method to reset the create form to default values
  resetCreateForm() {
    this.createModel = new CustomerModel();
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
      this.resetCreateForm(); // Reset the model to default values
      form.resetForm(); // Reset the form
      this.closeCreateModal(); // Use proper modal closing
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
      form.resetForm(); // Reset the form
      this.closeUpdateModal(); // Use proper modal closing
      this.getAll();
    });
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
  
  openTrash() {
    // Navigate to the customer trash page
    this.router.navigate(['/customer-trash']);
  }
}