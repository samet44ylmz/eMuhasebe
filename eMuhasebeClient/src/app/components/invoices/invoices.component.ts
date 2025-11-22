import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { InvoicePipe } from '../../pipes/invoice.pipe';
import { ProductPipe } from '../../pipes/product.pipe';
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
  imports: [SharedModule, InvoicePipe, ProductPipe],
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
  productSearch:string = "";
  productSearchUpdate:string = "";
  customerSearch: string = ""; // Add customer search property
  customerSearchUpdate: string = ""; // Add customer search property for update modal
  showProductDropdown: boolean = false;
  showProductDropdownUpdate: boolean = false;
  showCustomerDropdown: boolean = false; // Add customer dropdown visibility
  showCustomerDropdownUpdate: boolean = false; // Add customer dropdown visibility for update modal
  p: number = 1;
  paymentAmount: number = 0;
  showOnlyUnpaid: boolean = false; // New property to toggle unpaid invoices filter
  
  // Add customer filter property
  selectedCustomerId: string = "";
  
  // Add date filtering properties
  startDate: string = "";
  endDate: string = "";
  
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
    // Initialize date range to today
    this.startDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
    this.endDate = this.date.transform(new Date(), 'yyyy-MM-dd') ?? "";
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
    // Pass date range parameters to the backend
    this.http.post<InvoiceModel[]>("Invoices/GetAll", {
      type: 0, // Get all invoices (both purchase and sales)
      startDate: this.startDate,
      endDate: this.endDate,
      customerId: this.selectedCustomerId || null
    }, (res)=> {
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
      // Check if customer is selected
      if (!this.createModel.customerId) {
        this.swal.callToast("Lütfen bir müşteri seçin", "error");
        return;
      }
      
      // Check if at least one product detail is added
      if (this.createModel.details.length === 0) {
        this.swal.callToast("Lütfen en az bir ürün ekleyin", "error");
        return;
      }
      
      this.http.post<string>("Invoices/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new InvoiceModel();
        this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
        this.customerSearch = ""; // Clear customer search
        this.productSearch = ""; // Clear product search
        form.resetForm(); // Reset the form
        this.closeCreateModal(); // Use proper modal closing
        this.getAll();
      });
    }
  }

  deleteById(model: InvoiceModel){
    this.swal.callSwal("Faturayı Sil?",`${model.invoiceNumber} numaralı faturayı silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Invoices/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast("Fatura silindi","info");
      });
    })
  }

  get(model: InvoiceModel){
    this.updateModel = {...model};
  }

  update(form: NgForm){
    if(form.valid){
      // Check if customer is selected
      if (!this.updateModel.customerId) {
        this.swal.callToast("Lütfen bir müşteri seçin", "error");
        return;
      }
      
      // Check if at least one product detail is added
      if (this.updateModel.details.length === 0) {
        this.swal.callToast("Lütfen en az bir ürün ekleyin", "error");
        return;
      }
      
      this.http.post<string>("Invoices/DeleteById",{id: this.updateModel.id},(res)=> {
        this.http.post<string>("Invoices/Create",this.updateModel,(res)=> {
          this.swal.callToast(res, "info");
          form.resetForm(); // Reset the form
          this.closeUpdateModal(); // Use proper modal closing
          this.getAll();
        });
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

  addDetail(){
    // Find the selected product before it gets cleared
    let selectedProduct = this.products.find(p => p.id === this.createModel.productId) ?? new ProductModel();
    
    // If we couldn't find the product by ID, try to find it by the product search text
    if (!selectedProduct.id && this.productSearch) {
      const productText = this.productSearch.split(" - ");
      if (productText.length >= 2) {
        const productCode = productText[0];
        const productName = productText.slice(1).join(" - ");
        selectedProduct = this.products.find(p => p.productCode === productCode && p.name === productName) ?? new ProductModel();
      }
    }
    
    const detail: InvoiceDetailModel = {
      price: this.createModel.price,
      quantity: this.createModel.quantity,
      productId: this.createModel.productId,
      id: "",
      invoiceId: "",
      product: selectedProduct
    };

    this.createModel.details.push(detail);

    this.createModel.productId = "";
    this.createModel.quantity = 0;
    this.createModel.price = 0;
    this.productSearch = ""; // Clear product search after adding
  }

  removeDetailItem(index: number){
    this.createModel.details.splice(index,1);
  }

  // Method to handle product search input changes
  onProductSearchChange(event: any) {
    // Ensure the dropdown stays visible when typing
    this.showProductDropdown = true;
  }
  
  // Method to handle product search focus
  onProductSearchFocus() {
    this.showProductDropdown = true;
    // Clear the search term when focusing to show all products
    this.productSearch = "";
  }
  
  // Method to handle product search blur
  onProductSearchBlur() {
    // Use a small delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 200);
  }
  
  // Method to select a product from the dropdown
  selectProduct(product: ProductModel) {
    this.createModel.productId = product.id;
    this.productSearch = product.productCode + " - " + product.name;
    this.showProductDropdown = false;
    
    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const productSearchInput = document.querySelector('input[placeholder="Ürün kodu veya adı girin"]') as HTMLInputElement;
      if (productSearchInput) {
        productSearchInput.focus();
      }
    }, 10);
    
    // Don't call addDetail() here, let the user click "Ekle" button
  }

  // Method to select a product for create modal
  selectProductForCreate(product: ProductModel) {
    this.createModel.productId = product.id;
    this.productSearch = product.name;
    this.showProductDropdown = false;
  }

  // Method to handle product selection in create modal
  onProductSelect(productId: string) {
    this.createModel.productId = productId;
  }

  addDetailForUpdate(){
    // Find the selected product before it gets cleared
    let selectedProduct = this.products.find(p => p.id === this.updateModel.productId) ?? new ProductModel();
    
    // If we couldn't find the product by ID, try to find it by the product search text
    if (!selectedProduct.id && this.productSearchUpdate) {
      const productText = this.productSearchUpdate.split(" - ");
      if (productText.length >= 2) {
        const productCode = productText[0];
        const productName = productText.slice(1).join(" - ");
        selectedProduct = this.products.find(p => p.productCode === productCode && p.name === productName) ?? new ProductModel();
      }
    }
    
    const detail: InvoiceDetailModel = {
      price: this.updateModel.price,
      quantity: this.updateModel.quantity,
      productId: this.updateModel.productId,
      id: "",
      invoiceId: "",
      product: selectedProduct
    };

    this.updateModel.details.push(detail);

    this.updateModel.productId = "";
    this.updateModel.quantity = 0;
    this.updateModel.price = 0;
    this.productSearchUpdate = ""; // Clear product search after adding
  }

  removeDetailItemForUpdate(index: number){
    this.updateModel.details.splice(index,1);
  }

  // Method to handle product search input changes for update modal
  onProductSearchUpdateChange(event: any) {
    // Ensure the dropdown stays visible when typing
    this.showProductDropdownUpdate = true;
  }
  
  // Method to handle product search focus for update modal
  onProductSearchUpdateFocus() {
    this.showProductDropdownUpdate = true;
    // Clear the search term when focusing to show all products
    this.productSearchUpdate = "";
  }
  
  // Method to handle product search blur for update modal
  onProductSearchUpdateBlur() {
    // Use a small delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showProductDropdownUpdate = false;
    }, 200);
  }
  
  // Method to select a product from the dropdown for update modal
  selectProductForUpdate(product: ProductModel) {
    this.updateModel.productId = product.id;
    this.productSearchUpdate = product.productCode + " - " + product.name;
    this.showProductDropdownUpdate = false;
    
    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const productSearchInputs = document.querySelectorAll('input[placeholder="Ürün kodu veya adı girin"]') as NodeListOf<HTMLInputElement>;
      if (productSearchInputs.length > 1) {
        productSearchInputs[1].focus(); // Focus on the second input (update modal)
      }
    }, 10);
    
    // Don't call addDetailForUpdate() here, let the user click "Ekle" button
  }

  // New method to get product codes for display
  getProductCodes(invoice: InvoiceModel): string {
    if (!invoice.details || invoice.details.length === 0) {
      return "-";
    }
    
    const productInfo = invoice.details
      .map(detail => {
        if (detail.product?.productCode && detail.product?.name) {
          return detail.product.productCode + ' - ' + detail.product.name;
        } else if (detail.product?.productCode) {
          return detail.product.productCode;
        } else if (detail.product?.name) {
          return detail.product.name;
        }
        return '';
      })
      .filter(info => info.trim() !== '');
    
    if (productInfo.length === 0) {
      return "-";
    }
    
    return productInfo.join(', ');
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
    
    // Calculate total remaining amounts for this customer
    const customerInvoices = this.invoices.filter(invoice => invoice.customerId === model.customerId);
    const totalRemaining = customerInvoices.reduce((sum, invoice) => sum + (invoice.amount - invoice.paidAmount), 0);
    
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
        <div class="info-row">
          <span class="info-label">Müşteri Borcu:</span>
          <span class="info-value">${fmt(totalRemaining)} ₺</span>
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

  // New method to print the list of invoices
  printInvoices() {
    const win = window.open('', '_blank');
    if (!win) return;

    // Get filtered invoices based on current filters
    const filteredInvoices = this.getFilteredInvoices();
    
    // Format the date range for display
    const startDateFormatted = this.startDate ? new Date(this.startDate).toLocaleDateString('tr-TR') : '';
    const endDateFormatted = this.endDate ? new Date(this.endDate).toLocaleDateString('tr-TR') : '';
    const dateRange = startDateFormatted && endDateFormatted ? 
      `${startDateFormatted} - ${endDateFormatted}` : 
      'Tüm Tarihler';

    // Create table rows for invoices
    const rows = filteredInvoices.map((invoice, index) => {
      const remaining = invoice.amount - invoice.paidAmount;
      const status = remaining <= 0 ? 'Ödendi' : 'Bekliyor';
      const statusClass = remaining <= 0 ? 'bg-success' : 'bg-warning';
      const productCodes = this.getProductCodes(invoice);
      
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${invoice.date ? new Date(invoice.date).toLocaleDateString('tr-TR') : ''}</td>
          <td>${invoice.invoiceNumber}</td>
          <td>${productCodes}</td>
          <td>${invoice.customer?.name || ''}</td>
          <td style="text-align:right">${invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td style="text-align:right">${invoice.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td style="text-align:right">${remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
        </tr>`;
    }).join('');

    // Calculate totals
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const totalRemaining = totalAmount - totalPaid;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Fatura Listesi</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #000; }
  .container { padding: 10mm; }
  
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 15px; 
    border-bottom: 2px solid #000; 
    padding-bottom: 10px; 
  }
  
  .title { 
    font-size: 18pt; 
    font-weight: bold; 
    text-align: center;
    flex: 1;
  }
  
  .date-range {
    font-size: 12pt;
    text-align: center;
    margin-bottom: 15px;
  }
  
  table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-top: 10px; 
  }
  
  thead th { 
    background: #f5f5f5; 
    border: 1px solid #000; 
    padding: 8px; 
    text-align: center; 
    font-weight: bold; 
    font-size: 10pt; 
  }
  
  tbody td { 
    border: 1px solid #000; 
    padding: 6px; 
    font-size: 10pt; 
  }
  
  tbody tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .total-row { 
    font-weight: bold; 
    background: #e9e9e9; 
  }
  
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  
  .badge {
    display: inline-block;
    padding: 0.25em 0.4em;
    font-size: 75%;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: 0.25rem;
    color: #fff;
  }
  
  .bg-success {
    background-color: #28a745;
  }
  
  .bg-warning {
    background-color: #ffc107;
    color: #000;
  }
  
  .footer { 
    margin-top: 20px; 
    font-size: 9pt; 
    color: #666; 
    text-align: center;
  }
  
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">FATURA LİSTESİ</div>
    </div>
    
    <div class="date-range">
      Tarih Aralığı: ${dateRange}
    </div>
    
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tarih</th>
          <th>Fatura No</th>
          <th>Ürünler</th>
          <th>Cari</th>
          <th>Tutar</th>
          <th>Ödenen</th>
          <th>Kalan</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="5" class="text-right"><strong>TOPLAM:</strong></td>
          <td class="text-right"><strong>${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
          <td class="text-right"><strong>${totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
          <td class="text-right"><strong>${totalRemaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>Bu belge sistem tarafından oluşturulmuştur. - ${new Date().toLocaleDateString('tr-TR')}</p>
    </div>
  </div>
  <script>
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

  // Method to handle customer search input changes
  onCustomerSearchChange(event: any) {
    this.showCustomerDropdown = true;
    // If a customer is already selected and user starts typing, clear the selection
    if (this.createModel.customerId && this.customerSearch !== event.target.value) {
      this.createModel.customerId = "";
    }
  }
  
  // Method to handle customer search focus
  onCustomerSearchFocus() {
    this.showCustomerDropdown = true;
    // Only clear the search term if no customer is selected
    if (!this.createModel.customerId) {
      this.customerSearch = "";
    }
  }
  
  // Method to handle customer search blur
  onCustomerSearchBlur() {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 200);
  }
  
  // Method to handle customer search input changes for update modal
  onCustomerSearchUpdateChange(event: any) {
    this.showCustomerDropdownUpdate = true;
    // If a customer is already selected and user starts typing, clear the selection
    if (this.updateModel.customerId && this.customerSearchUpdate !== event.target.value) {
      this.updateModel.customerId = "";
    }
  }
  
  // Method to handle customer search focus for update modal
  onCustomerSearchUpdateFocus() {
    this.showCustomerDropdownUpdate = true;
    // Only clear the search term if no customer is selected
    if (!this.updateModel.customerId) {
      this.customerSearchUpdate = "";
    }
  }
  
  // Method to handle customer search blur for update modal
  onCustomerSearchUpdateBlur() {
    setTimeout(() => {
      this.showCustomerDropdownUpdate = false;
    }, 200);
  }
  
  // Method to select a customer for create modal
  selectCustomerForCreateModal(customer: CustomerModel) {
    this.createModel.customerId = customer.id;
    this.customerSearch = customer.name;
    this.showCustomerDropdown = false;
    
    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const customerSearchInput = document.querySelector('input[placeholder="Müşteri ara..."]') as HTMLInputElement;
      if (customerSearchInput) {
        customerSearchInput.focus();
      }
    }, 10);
  }
  
  // Method to clear customer selection
  clearCustomerSelection() {
    this.createModel.customerId = "";
    this.customerSearch = "";
  }
  
  // Method to clear customer selection in update modal
  clearCustomerUpdateSelection() {
    this.updateModel.customerId = "";
    this.customerSearchUpdate = "";
  }
  
  // Method to select a customer from the dropdown for update modal
  selectCustomerForUpdate(customer: CustomerModel) {
    this.updateModel.customerId = customer.id;
    this.customerSearchUpdate = customer.name;
    this.showCustomerDropdownUpdate = false;
    
    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const customerSearchInputs = document.querySelectorAll('input[placeholder="Müşteri ara..."]') as NodeListOf<HTMLInputElement>;
      if (customerSearchInputs.length > 1) {
        customerSearchInputs[1].focus(); // Focus on the second input (update modal)
      }
    }, 10);
    
    // Don't call addDetailForUpdate() here, let the user click "Ekle" button
  }
  
  // Method to get filtered customers based on search term
  getFilteredCustomers(): CustomerModel[] {
    if (!this.customerSearch) {
      return this.customers;
    }
    
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(this.customerSearch.toLowerCase())
    );
  }
  
  // Method to get filtered customers for update modal based on search term
  getFilteredCustomersForUpdate(): CustomerModel[] {
    if (!this.customerSearchUpdate) {
      return this.customers;
    }
    
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(this.customerSearchUpdate.toLowerCase())
    );
  }
  
  // Method to get filtered products based on search term
  getFilteredProducts(): ProductModel[] {
    if (!this.productSearch) {
      return this.products;
    }
    
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.productSearch.toLowerCase()) ||
      (product.productCode && product.productCode.toLowerCase().includes(this.productSearch.toLowerCase()))
    );
  }
  
  // Method to get filtered products for update modal based on search term
  getFilteredProductsForUpdate(): ProductModel[] {
    if (!this.productSearchUpdate) {
      return this.products;
    }
    
    return this.products.filter(product => 
      product.name.toLowerCase().includes(this.productSearchUpdate.toLowerCase()) ||
      (product.productCode && product.productCode.toLowerCase().includes(this.productSearchUpdate.toLowerCase()))
    );
  }

  // Add method to handle customer filter change
  onCustomerFilterChange() {
    this.getAll();
  }
}