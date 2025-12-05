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
    // Initialize date range to 1 month: from 1 month ago to today
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    this.startDate = this.date.transform(monthAgo, 'yyyy-MM-dd') ?? "";
    this.endDate = this.date.transform(today, 'yyyy-MM-dd') ?? "";
  }

  ngOnInit(): void {
    this.getAll();
    this.getAllCustomers();
    this.getAllProducts();
    this.getAllCashRegisters();

    // Set default page to last page
    this.setDefaultPageToLast();

    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/invoices') {
          this.getAll();
          this.getAllCustomers();
          this.getAllProducts();
          this.getAllCashRegisters();
          this.setDefaultPageToLast();
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
      // Update to last page when data changes
      this.setDefaultPageToLast();
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
        this.resetCreateForm(); // Reset the form to default values
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

    // Initialize product search field if there's a selected product
    if (this.updateModel.productId) {
      const selectedProduct = this.products.find(p => p.id === this.updateModel.productId);
      if (selectedProduct) {
        this.productSearchUpdate = selectedProduct.productCode + " - " + selectedProduct.name;
      }
    } else {
      // Clear product search if no product is selected
      this.productSearchUpdate = "";
    }

    // Initialize customer search field if there's a selected customer
    if (this.updateModel.customerId) {
      const selectedCustomer = this.customers.find(c => c.id === this.updateModel.customerId);
      if (selectedCustomer) {
        this.customerSearchUpdate = selectedCustomer.name;
      }
    } else {
      // Clear customer search if no customer is selected
      this.customerSearchUpdate = "";
    }

    // Hide dropdowns when initializing
    this.showProductDropdownUpdate = false;
    this.showCustomerDropdownUpdate = false;
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

  // Force-remove any modal overlays/backdrops and hide bootstrap modals.
  // Call this before opening the print window or use the button to fix frozen UI.
  // Public so it can be called from the template's emergency "Fix UI" button.
  removeModalOverlays() {
    try {
      const bootstrap = (window as any).bootstrap;

      // Common overlay selectors (Bootstrap, Summernote, SweetAlert, etc.)
      const overlaySelectors = [
        '.modal.show',
        '.modal-backdrop',
        '.note-modal-backdrop',
        '.swal2-container',
        '.swal2-backdrop',
        '.bootbox',
        '.fancybox-overlay',
        '.iziModal-overlay'
      ];

      overlaySelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el: any) => {
          try {
            // If it's an actual Bootstrap modal element, try to hide it gracefully
            if (el.classList && el.classList.contains('modal') && bootstrap && bootstrap.Modal) {
              const inst = bootstrap.Modal.getOrCreateInstance(el);
              if (inst && typeof inst.hide === 'function') inst.hide();
            } else {
              el.remove();
            }
          } catch (e) {}
        });
      });

      // Heuristic: remove any child element that covers most of the viewport
      Array.from(document.body.children).forEach((el: any) => {
        try {
          const r = el.getBoundingClientRect();
          const vw = window.innerWidth || document.documentElement.clientWidth;
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const coversViewport = r.top <= 1 && r.left <= 1 && r.width >= vw * 0.9 && r.height >= vh * 0.9;
          const z = parseInt(window.getComputedStyle(el).zIndex || '0', 10) || 0;
          const pe = window.getComputedStyle(el).pointerEvents;
          if ((coversViewport && z >= 300 && pe !== 'none') || el.classList.contains('modal-backdrop') || el.classList.contains('note-modal-backdrop')) {
            el.remove();
          }
        } catch (e) {}
      });

      // Remove modal-open class and restore scrolling and pointer-events
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';

      // Restore focus to first available control
      const first = document.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])') as HTMLElement | null;
      if (first) first.focus();
    } catch (e) {
      // ignore
    }
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
    // Reset the update form
    this.resetUpdateForm();

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

    // Focus back on the product search field for quick re-entry
    setTimeout(() => {
      const productSearchInput = document.querySelector('input[placeholder="Ürün ara..."]') as HTMLInputElement;
      if (productSearchInput) {
        productSearchInput.focus();
      }
    }, 10);
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
    // Use a longer delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showProductDropdown = false;
      // If no product is selected after blur, clear the search term
      if (!this.createModel.productId) {
        this.productSearch = "";
      }
    }, 300);
  }
  // Method to select a product for create modal
  selectProductForCreate(product: ProductModel, event?: Event) {
    // Prevent the blur event from hiding the dropdown before selection
    if (event) {
      event.stopPropagation();
    }

    this.createModel.productId = product.id;
    this.productSearch = product.productCode + " - " + product.name;

    // Set default quantity to 0 and price to product's withdrawal price
    this.createModel.quantity = 0;
    this.createModel.price = product.withdrawal || 0;

    // Log for debugging
    console.log('Product selected:', product);
    console.log('Product ID set to:', this.createModel.productId);

    // Trigger change detection
    setTimeout(() => {
      // Force UI update
      this.productSearch = this.productSearch;
    }, 0);

    // Hide the dropdown after a short delay so the user can see the selected item
    setTimeout(() => {
      this.showProductDropdown = false;
    }, 1000);
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

    // Focus back on the product search field for quick re-entry
    setTimeout(() => {
      const productSearchInputs = document.querySelectorAll('input[placeholder="Ürün ara..."]') as NodeListOf<HTMLInputElement>;
      if (productSearchInputs.length > 1) {
        productSearchInputs[1].focus(); // Focus on the second input (update modal)
      }
    }, 10);
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
    // Yalnızca seçim yoksa arama metnini temizle
    if (!this.updateModel.productId) {
      this.productSearchUpdate = "";
    }
  }

  // Method to handle product search blur for update modal
  onProductSearchUpdateBlur() {
    // Use a longer delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showProductDropdownUpdate = false;
      // If no product is selected after blur, clear the search term
      if (!this.updateModel.productId) {
        this.productSearchUpdate = "";
      }
    }, 300);
  }
  // Method to select a product from the dropdown for update modal
  selectProductForUpdate(product: ProductModel, event?: Event) {
    // Prevent the blur event from hiding the dropdown before selection
    if (event) {
      event.stopPropagation();
    }

    this.updateModel.productId = product.id;
    this.productSearchUpdate = product.productCode + " - " + product.name;

    // Set default quantity to 0 and price to product's withdrawal price
    this.updateModel.quantity = 0;
    this.updateModel.price = product.withdrawal || 0;

    // Log for debugging
    console.log('Product selected for update:', product);
    console.log('Product ID set to:', this.updateModel.productId);

    // Trigger change detection
    setTimeout(() => {
      // Force UI update
      this.productSearchUpdate = this.productSearchUpdate;
    }, 0);

    // Hide the dropdown after a short delay so the user can see the selected item
    setTimeout(() => {
      this.showProductDropdownUpdate = false;
    }, 1000);

    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const productSearchInputs = document.querySelectorAll('input[placeholder="Ürün ara..."]') as NodeListOf<HTMLInputElement>;
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
    // Use iframe-based printing to avoid print dialog blocking the UI
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

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

    // Calculate total remaining amounts for this customer (sum of remaining on all invoices)
    const customerInvoices = this.invoices.filter(invoice => invoice.customerId === model.customerId);
    const totalRemaining = customerInvoices.reduce((sum, invoice) => sum + (invoice.amount - invoice.paidAmount), 0);

    // Calculate the current invoice remaining amount
    const currentInvoiceRemaining = model.amount - model.paidAmount;

    // Calculate outstanding balance outside of this invoice (others' remaining)
    // Fix: Only include OTHER invoices, not the current one
    const otherInvoices = customerInvoices.filter(invoice => invoice.id !== model.id);
    const outstandingBalance = otherInvoices.reduce((sum, invoice) => sum + (invoice.amount - invoice.paidAmount), 0);

    // New total should be the total remaining across all invoices (this excludes already paid amounts)
    // This ensures we don't add the full invoice amount again (which would double-count payments)
    const newTotal = totalRemaining;

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
        <!-- Müşteri Borcu removed as requested -->
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
        <!-- Added financial calculations as requested -->
        <tr>
          <td colspan="4" class="text-right" style="padding-right: 10px; border-top: 2px solid #000;">Eski Kalan Bakiye:</td>
          <td class="text-right" style="border-top: 2px solid #000;">${fmt(outstandingBalance)} ₺</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" class="text-right" style="padding-right: 10px;">Yeni Toplam:</td>
          <td class="text-right">${fmt(newTotal)} ₺</td>
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
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(html);
      iframeDoc.close();

      // Print when iframe loads
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
        } catch(e) {}
        // Remove iframe after a short delay
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch(e) {}
        }, 1000);
      };
    }
  }

  // New method to print the list of invoices
  printInvoices() {
    // Use iframe-based printing instead of window.open
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

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
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(html);
      iframeDoc.close();

      // Print when iframe loads
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
        } catch(e) {}
        // Remove iframe after a short delay
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch(e) {}
        }, 1000);
      };
    }
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
    let list = this.invoices;
    if (this.selectedCustomerId) {
      list = list.filter(invoice => invoice.customerId === this.selectedCustomerId);
    }
    if (this.showOnlyUnpaid) {
      list = list.filter(invoice => (invoice.amount - invoice.paidAmount) > 0);
    }
    return list;
  }

  // Get totals for all invoices
  getInvoiceTotals() {
    const filteredInvoices = this.getFilteredInvoices();
    let totalAmount = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    filteredInvoices.forEach(invoice => {
      totalAmount += invoice.amount;
      totalPaid += invoice.paidAmount;
      totalRemaining += (invoice.amount - invoice.paidAmount);
    });

    return {
      totalAmount: totalAmount,
      totalPaid: totalPaid,
      totalRemaining: totalRemaining
    };
  }

  // Calculate total number of pages
  getTotalPages(): number {
    const filteredInvoices = this.getFilteredInvoices();
    return Math.ceil(filteredInvoices.length / 10);
  }

  // Check if we're on the last page
  isLastPage(): boolean {
    return this.p === this.getTotalPages();
  }

  // Set default page to last page
  setDefaultPageToLast() {
    // Use setTimeout to ensure the data is loaded before calculating pages
    setTimeout(() => {
      const filteredInvoices = this.getFilteredInvoices();
      const totalPages = Math.ceil(filteredInvoices.length / 10);
      this.p = totalPages > 0 ? totalPages : 1;
    }, 0);
  }

  // Method to handle customer search input changes
  onCustomerSearchChange(event: any) {
    this.showCustomerDropdown = true;
    // Eğer kullanıcı yazıyorsa, mevcut seçimleri temizle
    if (this.customerSearch !== event.target.value) {
      if (this.createModel.customerId) {
        this.createModel.customerId = "";
      }
      if (this.selectedCustomerId) {
        this.selectedCustomerId = "";
      }
    }
  }

  // Method to handle customer search focus
  onCustomerSearchFocus() {
    this.showCustomerDropdown = true;
    // Müşteri seçili değilse metni temizle
    if (!this.createModel.customerId && !this.selectedCustomerId) {
      this.customerSearch = "";
    }
  }

  // Method to handle customer search blur
  onCustomerSearchBlur() {
    // Use a longer delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showCustomerDropdown = false;
      // Müşteri seçili değilse metni temizle
      if (!this.createModel.customerId && !this.selectedCustomerId) {
        this.customerSearch = "";
      }
    }, 300);
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
    // Use a longer delay to allow click events on dropdown items to register
    setTimeout(() => {
      this.showCustomerDropdownUpdate = false;
      // If no customer is selected after blur, clear the search term
      if (!this.updateModel.customerId) {
        this.customerSearchUpdate = "";
      }
    }, 300);
  }

  // Method to select a customer for create modal
  selectCustomerForCreateModal(customer: CustomerModel, event?: Event) {
    // Prevent the blur event from hiding the dropdown before selection
    if (event) {
      event.stopPropagation();
    }

    this.createModel.customerId = customer.id;
    this.customerSearch = customer.name; // Show just the name after selection

    // Log for debugging
    console.log('Customer selected:', customer);
    console.log('Customer ID set to:', this.createModel.customerId);

    // Trigger change detection
    setTimeout(() => {
      // Force UI update
      this.customerSearch = this.customerSearch;
    }, 0);

    // Hide the dropdown after a short delay so the user can see the selected item
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 1000);

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

  // Method to clear product selection
  clearProductSelection() {
    this.createModel.productId = "";
    this.productSearch = "";
  }

  // Method to clear customer selection in update modal
  clearCustomerUpdateSelection() {
    this.updateModel.customerId = "";
    this.customerSearchUpdate = "";
  }

  // Method to clear product selection in update modal
  clearProductUpdateSelection() {
    this.updateModel.productId = "";
    this.productSearchUpdate = "";
  }

  // Method to select a customer from the dropdown for update modal
  selectCustomerForUpdate(customer: CustomerModel, event?: Event) {
    // Prevent the blur event from hiding the dropdown before selection
    if (event) {
      event.stopPropagation();
    }

    this.updateModel.customerId = customer.id;
    this.customerSearchUpdate = customer.name; // Show just the name after selection

    // Log for debugging
    console.log('Customer selected for update:', customer);
    console.log('Customer ID set to:', this.updateModel.customerId);

    // Trigger change detection
    setTimeout(() => {
      // Force UI update
      this.customerSearchUpdate = this.customerSearchUpdate;
    }, 0);

    // Hide the dropdown after a short delay so the user can see the selected item
    setTimeout(() => {
      this.showCustomerDropdownUpdate = false;
    }, 1000);

    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const customerSearchInputs = document.querySelectorAll('input[placeholder="Müşteri ara..."]') as NodeListOf<HTMLInputElement>;
      if (customerSearchInputs.length > 1) {
        customerSearchInputs[1].focus(); // Focus on the second input (update modal)
      }
    }, 10);
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

  // Method to reset the create form to default values
  resetCreateForm() {
    this.createModel = new InvoiceModel();
    this.createModel.date = this.date.transform(new Date(),"yyyy-MM-dd") ?? "";
    this.createModel.quantity = 0; // Set default quantity to 0
    this.createModel.price = 0; // Set default price to 0
    this.customerSearch = ""; // Clear customer search
    this.productSearch = ""; // Clear product search
  }

  // Method to reset the update form
  resetUpdateForm() {
    this.productSearchUpdate = "";
    this.customerSearchUpdate = "";
    this.showProductDropdownUpdate = false;
    this.showCustomerDropdownUpdate = false;
  }

  // Method to select a customer for filtering
  selectCustomerForFilter(customer: CustomerModel) {
    this.selectedCustomerId = customer.id;
    this.customerSearch = customer.name;
    this.showCustomerDropdown = false;
    this.onCustomerFilterChange(); // Apply the filter immediately

    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const customerSearchInput = document.querySelector('input[placeholder="Müşteri ara..."]') as HTMLInputElement;
      if (customerSearchInput) {
        customerSearchInput.focus();
      }
    }, 10);
  }

  // Method to clear customer filter
  clearCustomerFilter() {
    this.selectedCustomerId = "";
    this.customerSearch = "";
    this.onCustomerFilterChange(); // Apply the filter immediately
  }

  // Method to get the name of the selected customer
  getSelectedCustomerName(): string {
    if (!this.createModel.customerId) {
      return '';
    }

    const customer = this.customers.find(c => c.id === this.createModel.customerId);
    return customer ? customer.name : '';
  }

  // Method to get the name of the selected customer in update modal
  getSelectedCustomerNameForUpdate(): string {
    if (!this.updateModel.customerId) {
      return '';
    }

    const customer = this.customers.find(c => c.id === this.updateModel.customerId);
    return customer ? customer.name : '';
  }

  // Method to get the name of the selected product
  getSelectedProductName(): string {
    if (!this.createModel.productId) {
      return '';
    }

    const product = this.products.find(p => p.id === this.createModel.productId);
    return product ? (product.productCode + " - " + product.name) : '';
  }

  // Method to get the name of the selected product in update modal
  getSelectedProductNameForUpdate(): string {
    if (!this.updateModel.productId) {
      return '';
    }

    const product = this.products.find(p => p.id === this.updateModel.productId);
    return product ? (product.productCode + " - " + product.name) : '';
  }

  // Method to open print options modal
  openPrintOptions() {
    const modal = document.getElementById('printOptionsModal');
    if (modal) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Modal) {
        // Try to get existing instance first
        let printModal = bootstrap.Modal.getInstance(modal);
        if (!printModal) {
          // Create new instance if it doesn't exist
          printModal = new bootstrap.Modal(modal);
        }
        printModal.show();
      } else {
        // Fallback for older Bootstrap versions or if bootstrap is not available
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
      }
    }
  }

  // Method to download PDF
  downloadPdf() {
    // Close the modal first
    const modal = document.getElementById('printOptionsModal');
    if (modal) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Modal) {
        const printModal = bootstrap.Modal.getInstance(modal);
        if (printModal) {
          printModal.hide();
        }
      }
    }
    
    // Get filtered invoices based on current filters
    const filteredInvoices = this.getFilteredInvoices();
    
    // Format the date range for display
    const startDateFormatted = this.startDate ? new Date(this.startDate).toLocaleDateString('tr-TR') : '';
    const endDateFormatted = this.endDate ? new Date(this.endDate).toLocaleDateString('tr-TR') : '';
    const dateRange = startDateFormatted && endDateFormatted ?
      `${startDateFormatted} - ${endDateFormatted}` :
      'Tüm Tarihler';
    
    // Calculate totals
    const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const totalRemaining = totalAmount - totalPaid;
    
    // Create a new window with printable content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Write HTML content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Fatura Listesi</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px;
              margin: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
            }
            .date-range {
              font-size: 14px;
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">FATURA LİSTESİ</div>
            <div class="date-range">Tarih Aralığı: ${dateRange}</div>
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
            <tbody>`);
      
      // Add invoice rows
      filteredInvoices.forEach((invoice, index) => {
        const remaining = invoice.amount - invoice.paidAmount;
        const status = remaining <= 0 ? 'Ödendi' : 'Bekliyor';
        const productCodes = this.getProductCodes(invoice);
        
        printWindow.document.write(`
          <tr>
            <td>${index + 1}</td>
            <td>${invoice.date ? new Date(invoice.date).toLocaleDateString('tr-TR') : ''}</td>
            <td>${invoice.invoiceNumber}</td>
            <td>${productCodes}</td>
            <td>${invoice.customer?.name || ''}</td>
            <td class="text-right">${invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
            <td class="text-right">${invoice.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
            <td class="text-right">${remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
            <td>${status}</td>
          </tr>`);
      });
      
      // Add totals row
      printWindow.document.write(`
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" class="text-right"><strong>TOPLAM:</strong></td>
                <td class="text-right"><strong>${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
                <td class="text-right"><strong>${totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
                <td class="text-right"><strong>${totalRemaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            Bu belge sistem tarafından oluşturulmuştur. - ${new Date().toLocaleDateString('tr-TR')}
          </div>
          
          <script>
            // Automatically show print dialog when page loads
            window.onload = function() {
              // Add a small delay to ensure content is fully loaded before printing
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          </script>
        </body>
        </html>`);
      
      printWindow.document.close();
    } else {
      // Fallback to CSV download if popup is blocked
      this.downloadCsvFallback(filteredInvoices, dateRange, totalAmount, totalPaid, totalRemaining);
    }
  }
  
  // Fallback method to download CSV if popup is blocked
  private downloadCsvFallback(filteredInvoices: InvoiceModel[], dateRange: string, totalAmount: number, totalPaid: number, totalRemaining: number) {
    // Create CSV content
    let csvContent = '\uFEFF'; // Add BOM for Turkish characters
    csvContent += `FATURA LİSTESİ\n`;
    csvContent += `Tarih Aralığı: ${dateRange}\n\n`;
    csvContent += `#,Tarih,Fatura No,Ürünler,Cari,Tutar,Ödenen,Kalan,Durum\n`;
    
    filteredInvoices.forEach((invoice, index) => {
      const remaining = invoice.amount - invoice.paidAmount;
      const status = remaining <= 0 ? 'Ödendi' : 'Bekliyor';
      const productCodes = this.getProductCodes(invoice);
      
      csvContent += `${index + 1},${invoice.date ? new Date(invoice.date).toLocaleDateString('tr-TR') : ''},${invoice.invoiceNumber},"${productCodes}","${invoice.customer?.name || ''}",${invoice.amount.toFixed(2)},${invoice.paidAmount.toFixed(2)},${remaining.toFixed(2)},${status}\n`;
    });
    
    csvContent += `\n,,,,TOPLAM,${totalAmount.toFixed(2)},${totalPaid.toFixed(2)},${totalRemaining.toFixed(2)},\n`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fatura_listesi_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Method to print directly
  printDirect() {
    // Close the modal first
    const modal = document.getElementById('printOptionsModal');
    if (modal) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Modal) {
        const printModal = bootstrap.Modal.getInstance(modal);
        if (printModal) {
          printModal.hide();
        }
      }
    }
    
    // Add a small delay to ensure modal is closed before printing
    setTimeout(() => {
      // Call the existing printInvoices method
      this.printInvoices();
    }, 300);
  }
}
