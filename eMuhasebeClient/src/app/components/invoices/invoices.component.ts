import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { InvoicePipe } from '../../pipes/invoice.pipe';
import { DatePipe } from '@angular/common';
import { InvoiceModel } from '../../models/invoice.model';
import { CustomerModel } from '../../models/customer.model';
import { ProductModel } from '../../models/product.model';
import { CashRegisterModel } from '../../models/cash-register.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { InvoiceDetailModel } from '../../models/invoice-detail.model';
import { NgForm } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [SharedModule, InvoicePipe],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
  providers: [DatePipe]
})
export class InvoicesComponent implements OnInit, OnDestroy {
  invoices: InvoiceModel[] = [];
  customers: CustomerModel[] = [];
  
  private routerSubscription: Subscription | undefined;
  products: ProductModel[] = [];
  cashRegisters: CashRegisterModel[] = [];
  search:string = "";
  p: number = 1;
  paymentAmount: number = 0;
  showOnlyUnpaid: boolean = false; // New property to toggle unpaid invoices filter
  
  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:InvoiceModel = new InvoiceModel();
  updateModel:InvoiceModel = new InvoiceModel();
  paymentModel:InvoiceModel = new InvoiceModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private date: DatePipe,
    private router: Router
  ){
    this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCustomers();
    this.getAllProducts();
    this.getAllCashRegisters();
    
    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/invoices') {
          this.getAll();
          this.getAllCustomers();
          this.getAllProducts();
          this.getAllCashRegisters();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getAll(){
    this.http.post<InvoiceModel[]>("Invoices/GetAll",{},(res)=> {
      this.invoices = res;
    });
  }

  getAllCustomers(){
    this.http.post<CustomerModel[]>("Customers/GetAll",{},(res)=> {
      this.customers = res;
    });
  }

  getAllProducts(){
    this.http.post<ProductModel[]>("Products/GetAll",{},(res)=> {
      this.products = res;
    });
  }

  getAllCashRegisters(){
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll",{},(res)=> {
      this.cashRegisters = res;
    });
  }

  calculateTotalAmount(): number {
    return this.createModel.details.reduce((total, detail) => {
      return total + (detail.quantity * detail.price);
    }, 0);
  }

  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("Invoices/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new InvoiceModel();
        this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
        this.createModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  deleteById(model: InvoiceModel){
    this.swal.callSwal("Faturayı Sil?",`${model.invoiceNumber} numaralı faturayı silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Invoices/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: InvoiceModel){
    this.updateModel = {...model};
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Invoices/DeleteById",{id: this.updateModel.id},(res)=> {
        this.http.post<string>("Invoices/Create",this.updateModel,(res)=> {
          this.swal.callToast(res, "info");          
          this.updateModalCloseBtn?.nativeElement.click();
          this.getAll();
        });
      });
    }
  }

  addDetail(){
    const detail: InvoiceDetailModel = {
      price: this.createModel.price,
      quantity: this.createModel.quantity,
      productId: this.createModel.productId,
      id: "",
      invoiceId: "",
      product: this.products.find(p=> p.id == this.createModel.productId) ?? new ProductModel()
    };

    this.createModel.details.push(detail);

    this.createModel.productId = "";
    this.createModel.quantity = 0;
    this.createModel.price = 0;
  }

  removeDetailItem(index: number){
    this.createModel.details.splice(index,1);
  }

  addDetailForUpdate(){
    const detail: InvoiceDetailModel = {
      price: this.updateModel.price,
      quantity: this.updateModel.quantity,
      productId: this.updateModel.productId,
      id: "",
      invoiceId: "",
      product: this.products.find(p=> p.id == this.updateModel.productId) ?? new ProductModel()
    };

    this.updateModel.details.push(detail);

    this.updateModel.productId = "";
    this.updateModel.quantity = 0;
    this.updateModel.price = 0;
  }

  removeDetailItemForUpdate(index: number){
    this.updateModel.details.splice(index,1);
  }

  // New method to get product codes for display
  getProductCodes(invoice: InvoiceModel): string {
    if (!invoice.details || invoice.details.length === 0) {
      return "-";
    }
    
    const productCodes = invoice.details
      .map(detail => detail.product?.productCode || '')
      .filter(code => code.trim() !== '');
    
    if (productCodes.length === 0) {
      return "-";
    }
    
    return productCodes.join(', ');
  }

  printInvoice(model: InvoiceModel){
    const win = window.open('', '_blank');
    if(!win) return;

    const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const details = model.details || [];
    const rows = details.map((d,i)=> {
      const lineTotal = (d.quantity || 0) * (d.price || 0);
      // Show both product code and product name as requested
      let cinsi = '';
      if (d.product?.productCode && d.product.productCode.trim() !== '') {
        cinsi = d.product.productCode;
        // Always add product name if available
        if (d.product?.name && d.product.name.trim() !== '') {
          cinsi += ' - ' + d.product.name;
        }
        // Add description if available
        if (d.product?.description && d.product.description.trim() !== '') {
          cinsi += ' - ' + d.product.description;
        }
      } else if (d.product?.name && d.product.name.trim() !== '') {
        cinsi = d.product.name;
        // Add description if available
        if (d.product?.description && d.product.description.trim() !== '') {
          cinsi += ' - ' + d.product.description;
        }
      }
      // Convert quantity to integer
      const quantity = Math.round(d.quantity || 0);
      return `
      <tr>
        <td style="text-align:center">${quantity}</td>
        <td style="text-align:center">Adet</td>
        <td>${cinsi}</td>
        <td style="text-align:right">${fmt(d.price || 0)}</td>
        <td style="text-align:right">${fmt(lineTotal)}</td>
      </tr>`;
    }).join('');

    const subtotal = details.reduce((s,d)=> s + ((d.quantity || 0) * (d.price || 0)), 0);
    const grandTotal = model.amount || subtotal;

    const customer = model.customer || ({} as any);
    const invoiceDate = model.date ? new Date(model.date).toLocaleDateString('tr-TR') : '';
    
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Fatura ${model.invoiceNumber ?? ''}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; }
  .container { padding: 10mm; }
  
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .logo-section { flex: 1; }
  .logo { max-width: 280px; height: auto; display: block; }
  .company-info { font-size: 9pt; margin-top: 5px; line-height: 1.4; }
  
  .title-section { flex: 1; text-align: right; }
  .title { font-size: 18pt; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; }
  
  .info-section { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 10pt; }
  .info-left, .info-right { flex: 1; }
  .info-row { display: flex; margin-bottom: 5px; }
  .info-label { font-weight: bold; min-width: 100px; }
  .info-value { flex: 1; border-bottom: 1px dotted #999; }
  
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  thead th { background: #f5f5f5; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; font-size: 10pt; }
  tbody td { border: 1px solid #000; padding: 6px; font-size: 10pt; }
  tbody tr { height: 30px; }
  
  .total-row { font-weight: bold; background: #f9f9f9; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  
  .footer { margin-top: 20px; font-size: 9pt; color: #666; }
  
  /* Print-specific styles to ensure visibility */
  @media print {
    .logo {
      visibility: visible !important;
      display: block !important;
    }
    .company-info {
      display: block !important;
    }
  }
  
  /* Additional styles to ensure logo visibility */
  @media screen {
    .logo {
      visibility: visible !important;
      display: block !important;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-section">
        <img src="/assets/dist/img/erka.png" alt="ERKA Dizayn" class="logo" onerror="this.onerror=null; this.src='https://via.placeholder.com/280x80?text=ERKA+Dizayn';">
        <div class="company-info">Taş Dizayn - Lazer Kesim - İnci Çakım</div>
      </div>
      <div class="title-section">
        <div class="title">TEKLİF FORMU</div>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-left">
        <div class="info-row">
          <span class="info-label">Sayın:</span>
          <span class="info-value">${customer.name ?? ''}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Kod:</span>
          <span class="info-value">${model.invoiceNumber ?? ''}</span>
        </div>
      </div>
      <div class="info-right">
        <div class="info-row">
          <span class="info-label">Sipariş Tarihi:</span>
          <span class="info-value">${invoiceDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Teslim Tarihi:</span>
          <span class="info-value">${invoiceDate}</span>
        </div>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th width="10%">MİKTAR</th>
          <th width="10%">BİRİM</th>
          <th width="45%">CİNSİ</th>
          <th width="15%">BİRİM FİYATI</th>
          <th width="20%">TUTARI</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${Array(Math.max(0, 15 - details.length)).fill(0).map(() => 
          '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>'
        ).join('')}
        <tr class="total-row">
          <td colspan="4" class="text-right" style="padding-right: 10px;">TOPLAM:</td>
          <td class="text-right">${fmt(grandTotal)} ₺</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>Bu belge sistem tarafından oluşturulmuştur. - ${new Date().toLocaleDateString('tr-TR')}</p>
    </div>
  </div>
  <script>
    // Ensure logo is visible when printing
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;
    win.document.write(html);
    win.document.close();
  }

  openTrash() {
    // Navigate to the invoice trash page
    this.router.navigate(['/invoice-trash']);
  }

  // Payment functionality (receiving payments)
  openPaymentModal(invoice: InvoiceModel) {
    this.paymentModel = { ...invoice };
    this.paymentAmount = 0; // Reset payment amount for new payment
    // Set the payment date to today
    this.paymentModel.date = this.date.transform(new Date(), "yyyy-MM-dd") ?? "";
    
    // Use setTimeout to ensure the DOM is updated before showing the modal
    setTimeout(() => {
      // Show the payment modal using Bootstrap
      const modalElement = document.getElementById('paymentModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 0);
  }

  payInvoice(form: NgForm) {
    if (form.valid) {
      // Check if payment amount is valid
      if (this.paymentAmount <= 0) {
        this.swal.callToast("Ödeme tutarı 0'dan büyük olmalıdır", "error");
        return;
      }

      // Check if payment would exceed invoice amount
      const totalPaid = this.invoices.find(i => i.id === this.paymentModel.id)?.paidAmount || 0;
      if (totalPaid + this.paymentAmount > this.paymentModel.amount) {
        this.swal.callToast("Ödeme tutarı fatura tutarını aşamaz", "error");
        return;
      }

      // Prepare payment data
      const paymentData = {
        invoiceId: this.paymentModel.id,
        paymentAmount: this.paymentAmount,
        paymentDate: this.paymentModel.date,
        description: this.paymentModel.description || "Fatura ödemesi (Ödeme alındı)",
        cashRegisterId: this.paymentModel.cashRegisterId
      };

      this.http.post<string>("Invoices/Pay", paymentData, (res) => {
        this.swal.callToast(res);
        this.getAll(); // Refresh the invoice list
        this.paymentAmount = 0; // Reset payment amount
        // Close the payment modal (you'll need to add a reference to the close button)
        const closeBtn = document.getElementById("paymentModalCloseBtn");
        if (closeBtn) {
          closeBtn.click();
        }
      });
    }
  }

  // Toggle showing only unpaid invoices (remaining amount > 0)
  toggleUnpaidInvoices() {
    this.showOnlyUnpaid = !this.showOnlyUnpaid;
  }

  // Get filtered invoices based on showOnlyUnpaid flag
  getFilteredInvoices() {
    if (this.showOnlyUnpaid) {
      return this.invoices.filter(invoice => (invoice.amount - invoice.paidAmount) > 0);
    }
    return this.invoices;
  }
}