import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { ExpensePipe } from '../../pipes/expense.pipe';
import { ExpenseModel, CreateExpenseModel, UpdateExpenseModel, PayExpenseModel } from '../../models/expense.model';
import { ExpensesCategories } from '../../models/expenses-category.model';
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
  
  // Add property to toggle unpaid expenses filter
  showOnlyUnpaid: boolean = false;
  
  private routerSubscription: Subscription | undefined;
  
  categories = ExpensesCategories;
  cashRegisters: CashRegisterModel[] = [];

  // Add category filter property
  selectedCategoryId: number | null = null;
  
  // Add date filtering properties
  startDate: string = "";
  endDate: string = "";

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
    // Initialize date range to today
    this.startDate = this.getToday();
    this.endDate = this.getToday();
    this.getAll();
    this.getCashRegisters();
    
    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/expenses') {
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
    // Add timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    this.http.post<ExpenseModel[]>("Giderler/GetAll", { 
      _t: timestamp,
      startDate: this.startDate,
      endDate: this.endDate,
      categoryId: this.selectedCategoryId
    }, (res) => {
      console.log('getAll response:', res);
      this.expenses = res;
    }, (err) => {
      // Handle error case
      console.error('Error fetching expenses:', err);
    });
  }

  // Toggle showing only unpaid expenses (remaining amount > 0)
  toggleUnpaidExpenses() {
    this.showOnlyUnpaid = !this.showOnlyUnpaid;
  }

  // Get filtered expenses based on showOnlyUnpaid flag
  getFilteredExpenses() {
    if (this.showOnlyUnpaid) {
      return this.expenses.filter(expense => (expense.price - expense.paidAmount) > 0);
    }
    return this.expenses;
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

  create(form: NgForm){
    if(form.valid){
      // Removed payment-related validations to make expense creation work like invoice creation
      // Expenses can be paid later through the payment modal
      
      this.http.post<string>("Giderler/Create", this.createModel, (res) => {
        this.swal.callToast(res);
        this.createModel = new CreateExpenseModel();
        this.createModel.date = this.getToday();
        this.createModalCloseBtn?.nativeElement.click();
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
      });
    })
  }

  get(model: ExpenseModel){
    this.updateModel = {
      id: model.id,
      name: model.name,
      date: model.date,
      categoryValue: model.categoryType.value,
      description: model.description,
      price: model.price,
      isCash: model.cashRegisterDetailId !== null,
      cashRegisterId: null
    };
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Giderler/Update", this.updateModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateModalCloseBtn?.nativeElement.click();
        this.getAll();
      });
    }
  }

  private getToday(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  getCategoryName(value: number): string {
    const category = this.categories.find(c => c.value === value);
    return category ? category.name : 'Bilinmiyor';
  }

  openTrash() {
    // Navigate to the expense trash page
    this.router.navigate(['/expense-trash']);
  }

  // Get expense name by ID for payment modal
  getExpenseName(expenseId: string): string {
    if (!expenseId) return '';
    const expense = this.expenses.find(e => e.id === expenseId);
    return expense ? expense.name : '';
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
      const categoryName = this.getCategoryName(expense.categoryType.value);
      
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${expense.date ? new Date(expense.date).toLocaleDateString('tr-TR') : ''}</td>
          <td>${expense.name}</td>
          <td>${categoryName}</td>
          <td>${expense.description}</td>
          <td style="text-align:right">${expense.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td style="text-align:right">${expense.paidAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td style="text-align:right">${remaining.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
          <td><span class="badge ${statusClass}">${status}</span></td>
        </tr>`;
    }).join('');

    // Calculate totals
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.price, 0);
    const totalPaid = filteredExpenses.reduce((sum, expense) => sum + expense.paidAmount, 0);
    const totalRemaining = totalAmount - totalPaid;

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

  // Add method to handle category filter change
  onCategoryFilterChange() {
    this.getAll();
  }
}