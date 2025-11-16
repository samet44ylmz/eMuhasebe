import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { CustomerModel } from '../../models/customer.model';
import { CustomerPipe } from '../../pipes/customer.pipe';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-customer-trash',
  standalone: true,
  imports: [SharedModule, CustomerPipe],
  templateUrl: './customer-trash.component.html',
  styleUrl: './customer-trash.component.css'
})
export class CustomerTrashComponent {
  deletedCustomers: CustomerModel[] = [];
  selectedCustomerIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedCustomers();
  }

  getAllDeletedCustomers() {
    this.http.post<CustomerModel[]>("Customers/GetAllDeleted", {}, (res) => {
      this.deletedCustomers = res;
    });
  }

  toggleSelection(customerId: string) {
    const index = this.selectedCustomerIds.indexOf(customerId);
    if (index > -1) {
      this.selectedCustomerIds.splice(index, 1);
    } else {
      this.selectedCustomerIds.push(customerId);
    }
  }

  isSelected(customerId: string): boolean {
    return this.selectedCustomerIds.includes(customerId);
  }

  selectAll() {
    if (this.selectedCustomerIds.length === this.deletedCustomers.length) {
      this.selectedCustomerIds = [];
    } else {
      this.selectedCustomerIds = this.deletedCustomers.map(u => u.id);
    }
  }

  restoreCustomer(customer: CustomerModel) {
    this.swal.callSwal("Geri Yükle?", `${customer.name} Müşterisini geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Customers/Restore", { id: customer.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Müşteri başarıyla geri yüklendi", "success");
        this.getAllDeletedCustomers();
        this.selectedCustomerIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteCustomer(customer: CustomerModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${customer.name} Müşterisini kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Customers/PermanentDelete", { id: customer.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Müşteri kalıcı olarak silindi", "success");
        this.getAllDeletedCustomers();
        this.selectedCustomerIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedCustomerIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz müşterileri seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedCustomerIds.length} müşteriyi kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Customers/BulkPermanentDelete", { ids: this.selectedCustomerIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedCustomerIds.length} müşteri kalıcı olarak silindi`, "success");
        this.getAllDeletedCustomers();
        this.selectedCustomerIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the customers page
    this.router.navigate(['/customers']);
  }
}