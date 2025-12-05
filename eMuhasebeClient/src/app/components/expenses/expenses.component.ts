import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { ExpensePipe } from '../../pipes/expense.pipe';
import { ExpenseModel, CreateExpenseModel, UpdateExpenseModel, PayExpenseModel } from '../../models/expense.model';
import { ExpensesCategories } from '../../models/expenses-category.model';
import { CurrencyTypes } from '../../models/currency.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { NgForm } from '@angular/forms';
import { CashRegisterModel } from '../../models/cash-register.model';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [SharedModule, ExpensePipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  providers: [DatePipe]
})
export class ExpensesComponent implements OnInit, OnDestroy {
  expenses: ExpenseModel[] = [];
  search: string = "";
  p: number = 1; // Add pagination property

  // Add property to toggle unpaid expenses filter
  showOnlyUnpaid: boolean = false;

  private routerSubscription: Subscription | undefined;

  categories = ExpensesCategories;
  currencies = CurrencyTypes;
  cashRegisters: CashRegisterModel[] = [];

  // Add category filter property
  selectedCategoryId: number | null = null;

  // Add date filtering properties
  startDate: string = "";
  endDate: string = "";

  // Add category search properties (similar to customer search in invoices)
  categorySearch: string = "";
  showCategoryDropdown: boolean = false;

  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("paymentModalCloseBtn") paymentModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel: CreateExpenseModel = new CreateExpenseModel();
  updateModel: UpdateExpenseModel = new UpdateExpenseModel();
  paymentModel: PayExpenseModel = new PayExpenseModel();
  paymentAmount: number = 0;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router,
    private datePipe: DatePipe
  ){}

  ngOnInit(): void {
    this.createModel.date = this.getToday();
    // Initialize date range to 1 month: from 1 month ago to today
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.startDate = `${monthAgo.getFullYear()}-${pad(monthAgo.getMonth()+1)}-${pad(monthAgo.getDate())}`;
    this.endDate = this.getToday();
    this.getAll();
    this.getCashRegisters();

    // Initialize isCash to false by default
    this.createModel.isCash = false;
    // Initialize currency to TL (1)
    this.createModel.giderCurrencyTypeValue = 1;

    // Set default page to last page
    this.setDefaultPageToLast();

    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/expenses') {
          // Add a longer delay to ensure the navigation is complete before refreshing data
          setTimeout(() => {
            this.getAll();
            // getCashRegisters is now called within getAll to ensure proper sequencing
            this.setDefaultPageToLast();
          }, 500);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getAll(){
    // Add timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    const catId = this.getSelectedCategoryId();
    this.http.post<ExpenseModel[]>("Giderler/GetAll", {
      _t: timestamp,
      startDate: this.startDate,
      endDate: this.endDate,
      categoryId: catId
    }, (res) => {
      console.log('getAll response:', res);
      this.expenses = res;
      // Update to last page when data changes
      this.setDefaultPageToLast();
      // Refresh cash registers after expenses are loaded to ensure balance consistency
      this.getCashRegisters();
    }, (err) => {
      // Handle error case
      console.error('Error fetching expenses:', err);
      this.swal.callToast("Giderler alınırken bir hata oluştu", "error");
    });
  }

  // Set default page to last page
  setDefaultPageToLast() {
    // Use setTimeout to ensure the data is loaded before calculating pages
    setTimeout(() => {
      const filteredExpenses = this.getFilteredExpenses();
      const totalPages = Math.ceil(filteredExpenses.length / 10);
      this.p = totalPages > 0 ? totalPages : 1;
    }, 0);
  }

  // Toggle showing only unpaid expenses (remaining amount > 0)
  toggleUnpaidExpenses() {
    this.showOnlyUnpaid = !this.showOnlyUnpaid;
  }

  // Get filtered expenses based on showOnlyUnpaid flag
  getFilteredExpenses() {
    let list = this.expenses;
    const catId = this.getSelectedCategoryId();
    if (catId != null) {
      list = list.filter(expense => Number(expense.categoryType) === Number(catId));
    }
    if (this.showOnlyUnpaid) {
      list = list.filter(expense => (expense.price - expense.paidAmount) > 0);
    }
    return list;
  }

  private getSelectedCategoryId(): number | null {
    if (this.selectedCategoryId != null) return this.selectedCategoryId;
    if (this.categorySearch) {
      const found = this.categories.find(c => c.name.toLowerCase() === this.categorySearch.toLowerCase());
      if (found) return found.value;
    }
    return null;
  }

  getCashRegisters(){
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll", {}, (res) => {
      this.cashRegisters = res;
    });
  }

  // Calculate remaining amount for an expense
  calculateRemainingAmount(expense: ExpenseModel): number {
    return expense.price - expense.paidAmount;
  }

  // Get expense by ID
  getExpenseById(expenseId: string): ExpenseModel | undefined {
    if (!expenseId) return undefined;
    return this.expenses.find(e => e.id === expenseId);
  }

  // Get expense price for payment modal
  getExpensePrice(expenseId: string): number {
    const expense = this.getExpenseById(expenseId);
    return expense ? expense.price : 0;
  }

  // Get expense paid amount for payment modal
  getExpensePaidAmount(expenseId: string): number {
    const expense = this.getExpenseById(expenseId);
    return expense ? expense.paidAmount : 0;
  }

  // Get expense remaining amount for payment modal
  getExpenseRemainingAmount(expenseId: string): number {
    const expense = this.getExpenseById(expenseId);
    return expense ? (expense.price - expense.paidAmount) : 0;
  }

  // Get expense currency symbol for payment modal
  getExpenseCurrencySymbol(expenseId: string): string {
    const expense = this.getExpenseById(expenseId);
    return expense ? this.getCurrencySymbol(expense.giderCurrencyTypeValue) : '₺';
  }

  // Get expense name by ID for payment modal
  getExpenseName(expenseId: string): string {
    if (!expenseId) return '';
    const expense = this.expenses.find(e => e.id === expenseId);
    return expense ? expense.name : '';
  }

  // Method to reset the create form to default values
  resetCreateForm() {
    this.createModel = new CreateExpenseModel();
    this.createModel.date = this.getToday(); // Set to today's date
    this.createModel.isCash = false; // Reset to default value
    this.createModel.giderCurrencyTypeValue = 1; // Reset currency to TL
  }

  create(form: NgForm){
    if(form.valid){
      // Validate that category is selected (not 0)
      if (this.createModel.categoryValue === 0) {
        this.swal.callToast("Kategori seçilmelidir", "error");
        return;
      }

      // Check if cash payment is selected but no cash register is chosen
      if (this.createModel.isCash === true && (!this.createModel.cashRegisterId || this.createModel.cashRegisterId === '')) {
        this.swal.callToast("Nakit ödeme seçildiğinde kasa seçilmelidir", "error");
        return;
      }

      this.http.post<string>("Giderler/Create", this.createModel, (res) => {
        this.swal.callToast(res);

        // Reset the form and set date to today for next entry
        this.resetCreateForm();
        form.resetForm(); // Reset the form
        this.closeCreateModal(); // Use proper modal closing
        this.getAll();
      });
    }
  }

  deleteById(model: ExpenseModel){
    this.swal.callSwal("Gideri Sil?", `${model.name} giderini silmek istiyor musunuz?`, () => {
      this.http.post<string>("Giderler/DeleteById", {id: model.id}, (res) => {
        console.log('deleteById response:', res);
        this.getAll();
        this.swal.callToast(res, "info");
      }, (error) => {
        // Handle error case
        console.error('Error deleting expense:', error);
        this.swal.callToast("Gider silinirken bir hata oluştu", "error");
      });
    })
  }

  get(model: ExpenseModel){
    this.updateModel = {
      id: model.id,
      name: model.name,
      date: model.date,
      categoryValue: model.categoryType,
      description: model.description,
      price: model.price,
      isCash: model.cashRegisterDetailId !== null,
      cashRegisterId: null,
      giderCurrencyTypeValue: model.giderCurrencyTypeValue
    };
  }

  update(form: NgForm){
    if(form.valid){
      // Validate that category is selected (not 0)
      if (this.updateModel.categoryValue === 0) {
        this.swal.callToast("Kategori seçilmelidir", "error");
        return;
      }

      this.http.post<string>("Giderler/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
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

  private getToday(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  getCategoryName(value: number): string {
    const category = this.categories.find(c => c.value === value);
    return category ? category.name : '';
  }

  getCurrencySymbol(currencyValue: number): string {
    const currency = this.currencies.find(c => c.value === currencyValue);
    return currency ? currency.symbol : '₺';
  }

  formatCurrency(value: number, currencyValue: any): string {
    const cv = typeof currencyValue === 'string' ? parseInt(currencyValue) : currencyValue;
    const symbol = this.getCurrencySymbol(cv);
    try {
      return `${symbol}${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } catch (e) {
      return `${symbol}${value.toFixed(2)}`;
    }
  }

  // Get totals grouped by currency
  getCurrencyTotals(): { [key: number]: { amount: number; paid: number; remaining: number; symbol: string; name: string } } {
    const totals: { [key: number]: { amount: number; paid: number; remaining: number; symbol: string; name: string } } = {};

    this.getFilteredExpenses().forEach(expense => {
      const currency = expense.giderCurrencyTypeValue;
      const currencyData = this.currencies.find(c => c.value === currency);
      const symbol = currencyData ? currencyData.symbol : '₺';
      const name = currencyData ? currencyData.name : 'Bilinmeyen';

      if (!totals[currency]) {
        totals[currency] = { amount: 0, paid: 0, remaining: 0, symbol: symbol, name: name };
      }

      totals[currency].amount += expense.price;
      totals[currency].paid += expense.paidAmount;
      totals[currency].remaining += this.calculateRemainingAmount(expense);
    });

    return totals;
  }

  // Calculate total number of pages
  getTotalPages(): number {
    const filteredExpenses = this.getFilteredExpenses();
    return Math.ceil(filteredExpenses.length / 10);
  }

  // Check if we're on the last page
  isLastPage(): boolean {
    return this.p === this.getTotalPages();
  }

  openTrash() {
    // Navigate to the expense trash page
    this.router.navigate(['/expense-trash']);
  }

  // Payment functionality (receiving payments for expenses)
  openPaymentModal(expense: ExpenseModel) {
    this.paymentModel = {
      expenseId: expense.id,
      paymentAmount: this.calculateRemainingAmount(expense),
      paymentDate: this.datePipe.transform(new Date(), "yyyy-MM-dd") ?? "",
      description: "Gider ödemesi",
      cashRegisterId: null
    };
    this.paymentAmount = this.calculateRemainingAmount(expense);

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

  payExpense(form: NgForm) {
    if (form.valid) {
      // Check if payment amount is valid
      if (this.paymentAmount <= 0) {
        this.swal.callToast("Ödeme tutarı 0'dan büyük olmalıdır", "error");
        return;
      }

      // Prepare payment data
      const paymentData = {
        expenseId: this.paymentModel.expenseId,
        paymentAmount: this.paymentAmount,
        paymentDate: this.paymentModel.paymentDate,
        description: this.paymentModel.description,
        cashRegisterId: this.paymentModel.cashRegisterId
      };

      this.http.post<string>("Giderler/Pay", paymentData, (res) => {
        this.swal.callToast(res);
        this.getAll(); // Refresh the expense list
        this.paymentAmount = 0; // Reset payment amount
        // Close the payment modal
        const closeBtn = document.getElementById("paymentModalCloseBtn");
        if (closeBtn) {
          closeBtn.click();
        }
      });
    }
  }

  // New method to print the list of expenses
  printExpenses() {
    const win = window.open('', '_blank');
    if (!win) return;

    // Get filtered expenses based on current filters
    const filteredExpenses = this.getFilteredExpenses();

    // Format the date range for display
    const startDateFormatted = this.startDate ? new Date(this.startDate).toLocaleDateString('tr-TR') : '';
    const endDateFormatted = this.endDate ? new Date(this.endDate).toLocaleDateString('tr-TR') : '';
    const dateRange = startDateFormatted && endDateFormatted ?
      `${startDateFormatted} - ${endDateFormatted}` :
      'Tüm Tarihler';

    // Create table rows for expenses
    const rows = filteredExpenses.map((expense, index) => {
      const remaining = this.calculateRemainingAmount(expense);
      const status = remaining <= 0 ? 'Ödendi' : 'Bekliyor';
      const statusClass = remaining <= 0 ? 'bg-success' : 'bg-warning';
      const categoryName = this.getCategoryName(expense.categoryType);
      const currencySymbol = this.getCurrencySymbol(expense.giderCurrencyTypeValue);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${expense.date ? new Date(expense.date).toLocaleDateString('tr-TR') : ''}</td>
          <td>${expense.name}</td>
          <td>${categoryName}</td>
          <td>${expense.description}</td>
          <td style="text-align:right">${expense.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}</td>
          <td style="text-align:right">${expense.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}</td>
          <td style="text-align:right">${remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol}</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
        </tr>`;
    }).join('');

    // Calculate totals by currency
    const totalsByurrency: { [key: number]: { amount: number; paid: number; remaining: number; symbol: string } } = {};

    filteredExpenses.forEach(expense => {
      const currency = expense.giderCurrencyTypeValue;
      const symbol = this.getCurrencySymbol(currency);

      if (!totalsByurrency[currency]) {
        totalsByurrency[currency] = { amount: 0, paid: 0, remaining: 0, symbol: symbol };
      }

      totalsByurrency[currency].amount += expense.price;
      totalsByurrency[currency].paid += expense.paidAmount;
      totalsByurrency[currency].remaining += this.calculateRemainingAmount(expense);
    });

    // Create total rows for each currency
    const totalRows = Object.keys(totalsByurrency).map((currencyKey: string) => {
      const totals = totalsByurrency[parseInt(currencyKey)];
      return `
        <tr class="total-row">
          <td colspan="5" class="text-right"><strong>TOPLAM (${totals.symbol}):</strong></td>
          <td class="text-right"><strong>${totals.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${totals.symbol}</strong></td>
          <td class="text-right"><strong>${totals.paid.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${totals.symbol}</strong></td>
          <td class="text-right"><strong>${totals.remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${totals.symbol}</strong></td>
          <td></td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Gider Listesi</title>
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
      <div class="title">GİDER LİSTESİ</div>
    </div>

    <div class="date-range">
      Tarih Aralığı: ${dateRange}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tarih</th>
          <th>Gider Adı</th>
          <th>Kategori</th>
          <th>Açıklama</th>
          <th>Tutar</th>
          <th>Ödenen</th>
          <th>Kalan</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        ${totalRows}
      </tbody>
    </table>
    <div style="margin-top: 10px; font-size: 9pt; color: #666;">
      <p><strong>Not:</strong> Farklı para birimlerine sahip giderler listelenmiştir. Her satırın yanında para birimi sembolü gösterilmektedir. Toplamlar para birimlerine göre ayrı ayrı hesaplanmıştır.</p>
    </div>

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

  // Add method to handle category filter change
  onCategoryFilterChange() {
    this.p = 1;
    this.getAll();
  }

  // Method to get filtered categories based on search term (similar to getFilteredCustomers in invoices)
  getFilteredCategories(): any[] {
    if (!this.categorySearch) {
      return this.categories;
    }

    return this.categories.filter(category =>
      category.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  // Method to handle category search input changes (similar to onCustomerSearchChange in invoices)
  onCategorySearchChange(event: any) {
    this.showCategoryDropdown = true;
    // If a category is already selected and user starts typing, clear the selection
    if (this.selectedCategoryId && this.categorySearch !== event.target.value) {
      this.selectedCategoryId = null;
    }
  }

  // Method to handle category search focus (similar to onCustomerSearchFocus in invoices)
  onCategorySearchFocus() {
    this.showCategoryDropdown = true;
    // Only clear the search term if no category is selected
    if (!this.selectedCategoryId) {
      this.categorySearch = "";
    }
  }

  // Method to handle category search blur (similar to onCustomerSearchBlur in invoices)
  onCategorySearchBlur() {
    // Don't hide the dropdown immediately to allow clicking on items
    setTimeout(() => {
      this.showCategoryDropdown = false;
      // If no category is selected after blur, clear the search term
      if (!this.selectedCategoryId) {
        this.categorySearch = "";
      }
    }, 200);
  }

  // Method to select a category for filtering (similar to selectCustomerForFilter in invoices)
  selectCategoryForFilter(category: any) {
    this.selectedCategoryId = category.value;
    this.categorySearch = category.name;
    this.showCategoryDropdown = false;
    this.onCategoryFilterChange(); // Apply the filter immediately

    // Make sure the input field gets focus after selection
    setTimeout(() => {
      const categorySearchInput = document.querySelector('input[placeholder="Kategori ara..."]') as HTMLInputElement;
      if (categorySearchInput) {
        categorySearchInput.focus();
      }
    }, 10);
  }

  // Method to clear category filter (similar to clearCustomerFilter in invoices)
  clearCategoryFilter() {
    this.selectedCategoryId = null;
    this.categorySearch = "";
    this.onCategoryFilterChange(); // Apply the filter immediately
  }
}
