import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { InvoiceModel } from '../../models/invoice.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-invoice-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './invoice-trash.component.html',
  styleUrl: './invoice-trash.component.css'
})
export class InvoiceTrashComponent {
  deletedInvoices: InvoiceModel[] = [];
  selectedInvoiceIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedInvoices();
  }

  getAllDeletedInvoices() {
    this.http.post<InvoiceModel[]>("Invoices/GetAllDeleted", {}, (res) => {
      this.deletedInvoices = res;
    });
  }

  toggleSelection(invoiceId: string) {
    const index = this.selectedInvoiceIds.indexOf(invoiceId);
    if (index > -1) {
      this.selectedInvoiceIds.splice(index, 1);
    } else {
      this.selectedInvoiceIds.push(invoiceId);
    }
  }

  isSelected(invoiceId: string): boolean {
    return this.selectedInvoiceIds.includes(invoiceId);
  }

  selectAll() {
    if (this.selectedInvoiceIds.length === this.deletedInvoices.length) {
      this.selectedInvoiceIds = [];
    } else {
      this.selectedInvoiceIds = this.deletedInvoices.map(u => u.id);
    }
  }

  restoreInvoice(invoice: InvoiceModel) {
    this.swal.callSwal("Geri Yükle?", `${invoice.invoiceNumber} faturasını geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Invoices/Restore", { id: invoice.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Fatura başarıyla geri yüklendi", "success");
        this.getAllDeletedInvoices();
        this.selectedInvoiceIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteInvoice(invoice: InvoiceModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${invoice.invoiceNumber} faturasını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Invoices/PermanentDelete", { id: invoice.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Fatura kalıcı olarak silindi", "success");
        this.getAllDeletedInvoices();
        this.selectedInvoiceIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedInvoiceIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz faturaları seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedInvoiceIds.length} faturayı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Invoices/BulkPermanentDelete", { ids: this.selectedInvoiceIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedInvoiceIds.length} fatura kalıcı olarak silindi`, "success");
        this.getAllDeletedInvoices();
        this.selectedInvoiceIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the invoices page
    this.router.navigate(['/invoices']);
  }
}