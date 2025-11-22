import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { EmployeePipe } from '../../pipes/employee.pipe';
import { EmployeeModel } from '../../models/employee.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { SalaryPaymentModel, CreateSalaryPaymentModel, UpdateSalaryPaymentModel } from '../../models/salary-payment.model';
import { CashRegisterModel } from '../../models/cash-register.model';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [SharedModule, EmployeePipe],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: EmployeeModel[] = [];
  search:string = "";
  p: number = 1; // Add pagination property
  
  private routerSubscription: Subscription | undefined;
  
  // Salary Payment related
  salaryPayments: SalaryPaymentModel[] = [];
  selectedEmployee: EmployeeModel | null = null;
  cashRegisters: CashRegisterModel[] = [];
  selectedPayment: SalaryPaymentModel | null = null;
  
  // Salary payments pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalSalaryPayments: number = 0;
  
  // Multi-month print
  printMonthCount: number = 1;
  printStartMonth: string = "";
  payslipsToPrint: SalaryPaymentModel[] = [];
  selectedPaymentsForPrint: Set<string> = new Set<string>();

  // Bu @ViewChild referansları, getModalInstance çalışmazsa diye
  // yedek olarak .click() metodları için tutuluyor.
  @ViewChild("createModalCloseBtn") createModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateModalCloseBtn") updateModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("viewModalCloseBtn") viewModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("viewModalTriggerBtn") viewModalTriggerBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("createSalaryModalCloseBtn") createSalaryModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("updateSalaryModalCloseBtn") updateSalaryModalCloseBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("salaryPaymentsModalTriggerBtn") salaryPaymentsModalTriggerBtn: ElementRef<HTMLButtonElement> | undefined;
  @ViewChild("payslipModalTriggerBtn") payslipModalTriggerBtn: ElementRef<HTMLButtonElement> | undefined;

  createModel:EmployeeModel = new EmployeeModel();
  updateModel:EmployeeModel = new EmployeeModel();
  viewModel:EmployeeModel = new EmployeeModel();
  createSalaryModel: CreateSalaryPaymentModel = new CreateSalaryPaymentModel();
  updateSalaryModel: UpdateSalaryPaymentModel = new UpdateSalaryPaymentModel();

  constructor(
    private http: HttpService,
    private swal: SwalService,
    public auth: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.getAll();
    
    // Subscribe to router events to refresh data when navigating back to this page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/employees') {
          this.getAll();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  /**
   * Bootstrap modal nesnesini güvenle alır veya oluşturur.
   * @param modalId HTML'deki modal'ın ID'si (örn: 'viewModal')
   * @returns Bootstrap Modal nesnesi veya null
   */
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

  getAll(){
    this.http.post<EmployeeModel[]>("Employees/GetAll",{},(res)=> {
      this.employees = res;
    });
  }

  create(form: NgForm){
    if(form.valid){
      this.http.post<string>("Employees/Create",this.createModel,(res)=> {
        this.swal.callToast(res);
        this.createModel = new EmployeeModel();
        form.resetForm();

        // TEMİZ KAPATMA KODU
        const modal = this.getModalInstance('createModal');
        if(modal) {
          modal.hide();
        } else {
          // Yedek yöntem
          this.createModalCloseBtn?.nativeElement.click();
        }

        this.getAll();
      }, (err) => {
        // Backend'den gelen hata mesajını direkt göster
        if (err.error && err.error.ErrorMessages && err.error.ErrorMessages.length > 0) {
          // Backend'den gelen mesajı direkt göster (örn: "Bu Tc kimlik numarası ile bir çalışan zaten mevcut")
          this.swal.callToast(err.error.ErrorMessages[0], "error");
        } else if (err.error && typeof err.error === 'string') {
          // String formatında hata mesajı gelirse
          this.swal.callToast(err.error, "error");
        } else {
          // ErrorService genel hataları handle eder
        }
      });
    }
  }

  deleteById(model: EmployeeModel){
    this.swal.callSwal("Çalışanı Sil?",`${model.name} çalışanını silmek istiyor musunuz?`,()=> {
      this.http.post<string>("Employees/DeleteById",{id: model.id},(res)=> {
        this.getAll();
        this.swal.callToast(res,"info");
      });
    })
  }

  get(model: EmployeeModel){
    this.updateModel = { ...model };
  }

  update(form: NgForm){
    if(form.valid){
      this.http.post<string>("Employees/Update",this.updateModel,(res)=> {
        this.swal.callToast(res,"info");
        form.resetForm();

        // TEMİZ KAPATMA KODU
        const modal = this.getModalInstance('updateModal');
        if(modal) {
          modal.hide();
        } else {
          // Yedek yöntem
          this.updateModalCloseBtn?.nativeElement.click();
        }

        this.getAll();
      }, (err) => {
        // Backend'den gelen hata mesajını direkt göster
        if (err.error && err.error.ErrorMessages && err.error.ErrorMessages.length > 0) {
          // Backend'den gelen mesajı direkt göster (örn: "Bu Tc kimlik numarası ile bir çalışan zaten mevcut")
          this.swal.callToast(err.error.ErrorMessages[0], "error");
        } else if (err.error && typeof err.error === 'string') {
          // String formatında hata mesajı gelirse
          this.swal.callToast(err.error, "error");
        } else {
          // ErrorService genel hataları handle eder
        }
      });
    }
  }

  openSalaryPayments(model: EmployeeModel){
    this.selectedEmployee = model;
    this.loadSalaryPaymentsForEmployee(model.id);
    this.getAllCashRegisters();
    
    // Reset and initialize create model
    this.createSalaryModel = new CreateSalaryPaymentModel();
    this.createSalaryModel.employeeId = model.id;
    this.createSalaryModel.paymentDate = this.getToday();
    this.createSalaryModel.periodStart = this.getFirstDayOfMonth();
    this.createSalaryModel.periodEnd = this.getLastDayOfMonth();
    this.createSalaryModel.workDays = 30; // Default to 30 days
    this.createSalaryModel.baseSalary = model.salary; // Full salary for 30 days
    this.calculateSalary();
    
    // Set to last page when opening salary payments
    setTimeout(() => {
      if (this.totalSalaryPayments > 0) {
        this.currentPage = this.getTotalPages();
      }
    }, 100);
    
    // Open modal with fallback
    setTimeout(() => {
      const modal = this.getModalInstance('salaryPaymentsModal');
      if (modal) {
        modal.show();
      } else {
        // Fallback method
        this.salaryPaymentsModalTriggerBtn?.nativeElement.click();
      }
    }, 150);
  }

  viewEmployee(model: EmployeeModel){
    // Dropdown'ı kapatma kodu (closeAllDropdowns) kaldırıldı.
    
    this.http.post<EmployeeModel>("EmployeeDetails/GetAll", {employeeId: model.id}, (res)=> {
      this.viewModel = res;
      
      // Angular'ın veriyi işlemesi ve DOM'u güncellemesi için kısa bir gecikme
      setTimeout(() => {
        this.openViewModal();
      }, 50); // 200ms'den 50ms'ye düşürüldü, daha hızlı açılır.
    });
  }
  
  openViewModal(){
    // TEMİZ AÇMA KODU
    const modal = this.getModalInstance('viewModal');
    if (modal) {
      modal.show();
    } else {
      // Sadece bir yedek olarak
      this.viewModalTriggerBtn?.nativeElement.click();
    }
  }


  closeViewModal(){
    // TEMİZ KAPATMA KODU
    const modal = this.getModalInstance('viewModal');
    if (modal) {
      modal.hide();
    } else {
      // Sadece bir yedek olarak
      this.viewModalCloseBtn?.nativeElement.click();
    }
  }

  // Salary Payment Methods
  getToday(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  private getFirstDayOfMonth(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-01`;
  }

  private getLastDayOfMonth(): string {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(lastDay)}`;
  }

  private calculateWorkDays(): number {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let workDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    return workDays;
  }

  loadSalaryPaymentsForEmployee(employeeId: string): void {
    this.http.post<SalaryPaymentModel[]>("SalaryPayments/GetAll", {}, (res) => {
      this.salaryPayments = res.filter(p => p.employeeId === employeeId);
      this.totalSalaryPayments = this.salaryPayments.length;
      // Set to last page after loading data
      if (this.totalSalaryPayments > 0) {
        this.currentPage = this.getTotalPages();
      } else {
        this.currentPage = 1;
      }
    });
  }

  getPaginatedSalaryPayments(): SalaryPaymentModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.salaryPayments.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  getTotalPages(): number {
    return Math.ceil(this.totalSalaryPayments / this.itemsPerPage) || 1;
  }

  getAllCashRegisters(): void {
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAll", {}, (res) => {
      this.cashRegisters = res;
    });
  }

  onEmployeeChangeSalary(): void {
    if (this.selectedEmployee) {
      this.createSalaryModel.baseSalary = this.selectedEmployee.salary;
      this.calculateSalary();
    }
  }

  calculateSalary(): void {
    // Calculate base salary based on work days (out of 30 days) but keep it read-only in UI
    const fullSalary = this.selectedEmployee?.salary || 0;
    const workDays = this.createSalaryModel.workDays || 30;
    this.createSalaryModel.baseSalary = (fullSalary / 30) * workDays;
    
    this.createSalaryModel.grossSalary = 
      this.createSalaryModel.baseSalary + 
      this.createSalaryModel.overtime + 
      this.createSalaryModel.bonus + 
      this.createSalaryModel.allowances;
    
    this.createSalaryModel.totalDeductions = 
      this.createSalaryModel.taxDeduction + 
      this.createSalaryModel.socialSecurityDeduction + 
      this.createSalaryModel.healthInsuranceDeduction + 
      this.createSalaryModel.otherDeductions;
    
    this.createSalaryModel.netSalary = this.createSalaryModel.grossSalary - this.createSalaryModel.totalDeductions;
  }

  createSalaryPayment(form: NgForm): void {
    if(form.valid){
      this.http.post<string>("SalaryPayments/Create", this.createSalaryModel, (res) => {
        this.swal.callToast(res);
        this.createSalaryModel = new CreateSalaryPaymentModel();
        
        if (this.selectedEmployee) {
          this.createSalaryModel.employeeId = this.selectedEmployee.id;
          this.createSalaryModel.baseSalary = this.selectedEmployee.salary;
        }
        this.createSalaryModel.paymentDate = this.getToday();
        this.createSalaryModel.periodStart = this.getFirstDayOfMonth();
        this.createSalaryModel.periodEnd = this.getLastDayOfMonth();
        this.createSalaryModel.workDays = this.calculateWorkDays();
        
        const modal = this.getModalInstance('createSalaryModal');
        if(modal) {
          modal.hide();
        } else {
          this.createSalaryModalCloseBtn?.nativeElement.click();
        }
        
        if (this.selectedEmployee) {
          this.loadSalaryPaymentsForEmployee(this.selectedEmployee.id);
        }
        // Stay on current page after adding new payment
      });
    }
  }

  deleteSalaryPayment(model: SalaryPaymentModel): void {
    this.swal.callSwal("Maaş Ödemesini Sil?", `Bu maaş ödemesini silmek istiyor musunuz?`, () => {
      this.http.post<string>("SalaryPayments/DeleteById", {id: model.id}, (res) => {
        if (this.selectedEmployee) {
          this.loadSalaryPaymentsForEmployee(this.selectedEmployee.id);
        }
        this.swal.callToast(res, "info");
        // Stay on current page after deleting a payment
      });
    });
  }

  getSalaryPayment(model: SalaryPaymentModel): void {
    this.updateSalaryModel = {
      id: model.id,
      employeeId: model.employeeId,
      paymentDate: model.paymentDate,
      periodStart: model.periodStart,
      periodEnd: model.periodEnd,
      baseSalary: model.baseSalary,
      overtime: model.overtime,
      bonus: model.bonus,
      allowances: model.allowances,
      taxDeduction: model.taxDeduction,
      socialSecurityDeduction: model.socialSecurityDeduction,
      healthInsuranceDeduction: model.healthInsuranceDeduction,
      otherDeductions: model.otherDeductions,
      grossSalary: model.grossSalary,
      totalDeductions: model.totalDeductions,
      netSalary: model.netSalary,
      description: model.description,
      payFromCash: model.cashRegisterDetailId !== null,
      cashRegisterId: model.cashRegisterDetailId,
      workDays: model.workDays,
      overtimeHours: model.overtimeHours,
      paymentMethod: model.paymentMethod
    };
  }

  calculateSalaryUpdate(): void {
    // Calculate base salary based on work days (out of 30 days) but keep it read-only in UI
    const fullSalary = this.selectedEmployee?.salary || 0;
    const workDays = this.updateSalaryModel.workDays || 30;
    this.updateSalaryModel.baseSalary = (fullSalary / 30) * workDays;
    
    this.updateSalaryModel.grossSalary = 
      this.updateSalaryModel.baseSalary + 
      this.updateSalaryModel.overtime + 
      this.updateSalaryModel.bonus + 
      this.updateSalaryModel.allowances;
    
    this.updateSalaryModel.totalDeductions = 
      this.updateSalaryModel.taxDeduction + 
      this.updateSalaryModel.socialSecurityDeduction + 
      this.updateSalaryModel.healthInsuranceDeduction + 
      this.updateSalaryModel.otherDeductions;
    
    this.updateSalaryModel.netSalary = this.updateSalaryModel.grossSalary - this.updateSalaryModel.totalDeductions;
  }

  updateSalaryPayment(form: NgForm): void {
    if(form.valid){
      this.http.post<string>("SalaryPayments/Update", this.updateSalaryModel, (res) => {
        this.swal.callToast(res, "info");
        this.updateSalaryModel = new UpdateSalaryPaymentModel();
        
        const modal = this.getModalInstance('updateSalaryModal');
        if(modal) {
          modal.hide();
        } else {
          this.updateSalaryModalCloseBtn?.nativeElement.click();
        }
        
        if (this.selectedEmployee) {
          this.loadSalaryPaymentsForEmployee(this.selectedEmployee.id);
        }
      });
    }
  }

  viewPayslip(payment: SalaryPaymentModel): void {
    this.selectedPayment = payment;
    // selectedEmployee is already set from openSalaryPayments, but ensure it's set
    if (!this.selectedEmployee) {
      this.selectedEmployee = this.employees.find(e => e.id === payment.employeeId) || null;
    }
    
    setTimeout(() => {
      const modal = this.getModalInstance('payslipModal');
      if (modal) {
        modal.show();
      } else {
        // Fallback method
        this.payslipModalTriggerBtn?.nativeElement.click();
      }
    }, 100);
  }

  printPayslip(): void {
    window.print();
  }

  togglePaymentSelection(paymentId: string): void {
    if (this.selectedPaymentsForPrint.has(paymentId)) {
      this.selectedPaymentsForPrint.delete(paymentId);
    } else {
      this.selectedPaymentsForPrint.add(paymentId);
    }
  }

  isPaymentSelected(paymentId: string): boolean {
    return this.selectedPaymentsForPrint.has(paymentId);
  }

  selectAllPayments(): void {
    if (this.selectedPaymentsForPrint.size === this.salaryPayments.length) {
      this.selectedPaymentsForPrint.clear();
    } else {
      this.salaryPayments.forEach(p => this.selectedPaymentsForPrint.add(p.id));
    }
  }

  printSelectedPayslips(): void {
    if (this.selectedPaymentsForPrint.size === 0) {
      this.swal.callToast("Lütfen yazdırılacak bordroları seçin", "warning");
      return;
    }

    if (!this.selectedEmployee) return;
    
    // Get selected payments and sort chronologically
    const paymentsToPrint = this.salaryPayments
      .filter(p => this.selectedPaymentsForPrint.has(p.id))
      .sort((a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime());
    
    // Generate print HTML for all selected payslips
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Maaş Bordrosu - ${this.selectedEmployee.name}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          @media print {
            @page { 
              size: A4 portrait; 
              margin: 0;
            }
            body { 
              font-family: Arial, sans-serif;
              font-size: 9pt;
              line-height: 1.2;
              margin: 0;
              padding: 0;
            }
            .payslip-container { 
              width: 210mm;
              height: 297mm;
              padding: 10mm;
              margin: 0;
              background: white;
              box-sizing: border-box;
              page-break-after: always;
            }
            .page-break { 
              page-break-after: always; 
            }
            .card {
              page-break-inside: avoid;
              border: 1px solid #ddd !important;
              margin-bottom: 5px !important;
              box-shadow: none !important;
            }
            .card-header {
              border-radius: 4px 4px 0 0 !important;
              padding: 6px 10px !important;
              font-size: 10pt;
            }
            .card-body {
              padding: 5px !important;
            }
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              margin-top: 3px;
              margin-bottom: 3px;
            }
            table {
              page-break-inside: avoid;
              font-size: 9pt;
            }
            .table th {
              font-weight: 600;
            }
            .table-sm td, .table-sm th {
              padding: 2px 4px;
            }
            .table-borderless td {
              border: none !important;
            }
            .signature-line {
              border-bottom: 1px solid #333;
              width: 100px;
              height: 30px;
              margin: 0 auto;
            }
            .mb-0 { margin-bottom: 0 !important; }
            .mb-1 { margin-bottom: 0.15rem !important; }
            .mb-2 { margin-bottom: 0.3rem !important; }
            .mt-1 { margin-top: 0.2rem !important; }
            .mt-2 { margin-top: 0.3rem !important; }
            .py-1 { padding-top: 0.2rem !important; padding-bottom: 0.2rem !important; }
            .text-center { text-align: center; }
            .text-end { text-align: right; }
            .fw-bold { font-weight: bold; }
            small, .small { font-size: 8pt; }
            .fs-5 { font-size: 1rem; }
            .fs-6 { font-size: 0.9rem; }
          }
          body { 
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            padding: 20px;
          }
          .payslip-container {
            background: white;
            padding: 15mm;
            width: 210mm;
            height: 297mm;
            margin: 20px auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
    `;
    
    paymentsToPrint.forEach((payment, index) => {
      htmlContent += this.generatePayslipHTML(payment, index < paymentsToPrint.length - 1);
    });
    
    htmlContent += `
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  private generatePayslipHTML(payment: SalaryPaymentModel, addPageBreak: boolean): string {
    const emp = this.selectedEmployee;
    if (!emp) return '';
    
    return `
      <div class="payslip-container ${addPageBreak ? 'page-break' : ''}">
        <div class="text-center mb-2 border-bottom pb-1">
          <h1 class="fw-bold text-primary mb-0">MAAŞ BORDROSU</h1>
          <h5 class="text-muted mb-0 small">Maaş Ödeme Belgesi</h5>
          <p class="mb-0 small"><small>Belge No: ${payment.id.substring(0, 8).toUpperCase()}</small></p>
        </div>

        <div class="card mb-1">
          <div class="card-header bg-primary text-white py-1">
            <h5 class="mb-0 fs-6">Çalışan Bilgileri</h5>
          </div>
          <div class="card-body py-1">
            <div class="row">
              <div class="col-6">
                <table class="table table-borderless table-sm mb-0">
                  <tr><td class="fw-bold small">Ad Soyad:</td><td class="small">${emp.name}</td></tr>
                  <tr><td class="fw-bold small">TC No:</td><td class="small">${emp.identityNumber}</td></tr>
                  <tr><td class="fw-bold small">Pozisyon:</td><td class="small">${emp.position}</td></tr>
                </table>
              </div>
              <div class="col-6">
                <table class="table table-borderless table-sm mb-0">
                  <tr><td class="fw-bold small">Telefon:</td><td class="small">${emp.phone}</td></tr>
                  <tr><td class="fw-bold small">Başlama:</td><td class="small">${this.formatDateTurkish(emp.startDate)}</td></tr>
                  <tr><td class="fw-bold small">Maaş:</td><td class="small">${emp.salary.toLocaleString('tr-TR')} ₺</td></tr>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-1">
          <div class="card-header bg-info text-white py-1">
            <h5 class="mb-0 fs-6">Dönem Bilgileri</h5>
          </div>
          <div class="card-body py-1">
            <div class="row">
              <div class="col-6">
                <table class="table table-borderless table-sm mb-0">
                  <tr><td class="fw-bold small">Dönem:</td><td class="small">${this.formatDateTurkish(payment.periodStart)} - ${this.formatDateTurkish(payment.periodEnd)}</td></tr>
                  <tr><td class="fw-bold small">Ödeme:</td><td class="small">${this.formatDateTurkish(payment.paymentDate)}</td></tr>
                </table>
              </div>
              <div class="col-6">
                <table class="table table-borderless table-sm mb-0">
                  <tr><td class="fw-bold small">Çalışılan:</td><td class="small">${payment.workDays} gün</td></tr>
                  <tr><td class="fw-bold small">Mesai:</td><td class="small">${payment.overtimeHours} saat</td></tr>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-1">
          <div class="card-header bg-success text-white py-1">
            <h5 class="mb-0 fs-6">Maaş Detayı</h5>
          </div>
          <div class="card-body py-1 p-0">
            <table class="table table-bordered mb-0">
              <thead class="table-light">
                <tr>
                  <th class="small">Kazanlar</th>
                  <th class="small">Kesintiler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="p-0">
                    <table class="table table-sm table-borderless mb-0">
                      <tr><td class="small">Temel Maaş</td><td class="text-end small">${payment.baseSalary.toLocaleString('tr-TR')} ₺</td></tr>
                      ${payment.overtime > 0 ? `<tr><td class="small">Mesai</td><td class="text-end small">${payment.overtime.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      ${payment.bonus > 0 ? `<tr><td class="small">Prim</td><td class="text-end small">${payment.bonus.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      <tr class="border-top"><td class="fw-bold small">BRÜT</td><td class="text-end fw-bold text-success small">${payment.grossSalary.toLocaleString('tr-TR')} ₺</td></tr>
                    </table>
                  </td>
                  <td class="p-0">
                    <table class="table table-sm table-borderless mb-0">
                      ${payment.taxDeduction > 0 ? `<tr><td class="small">Gelir Vergisi</td><td class="text-end small">${payment.taxDeduction.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      ${payment.socialSecurityDeduction > 0 ? `<tr><td class="small">SGK</td><td class="text-end small">${payment.socialSecurityDeduction.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      ${payment.healthInsuranceDeduction > 0 ? `<tr><td class="small">Sağlık</td><td class="text-end small">${payment.healthInsuranceDeduction.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      ${payment.otherDeductions > 0 ? `<tr><td class="small">Diğer</td><td class="text-end small">${payment.otherDeductions.toLocaleString('tr-TR')} ₺</td></tr>` : ''}
                      <tr class="border-top"><td class="fw-bold small">TOPLAM</td><td class="text-end fw-bold text-danger small">${payment.totalDeductions.toLocaleString('tr-TR')} ₺</td></tr>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card mb-1 border-2 border-success">
          <div class="card-body bg-light py-1">
            <div class="row align-items-center">
              <div class="col-6">
                <h3 class="mb-0 text-success fs-5">NET MAAŞ</h3>
              </div>
              <div class="col-6 text-end">
                <h1 class="mb-0 text-success fw-bold" style="font-size: 1.4rem;">${payment.netSalary.toLocaleString('tr-TR')} ₺</h1>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-2">
          <div class="card-header bg-warning py-1">
            <h6 class="mb-0 fs-6">İşlem Bilgileri</h6>
          </div>
          <div class="card-body py-1">
            <div class="row small">
              <div class="col-6">
                <small><strong>Belge:</strong> ${payment.id.substring(0, 8).toUpperCase()}</small><br>
                <small><strong>Yöntem:</strong> ${payment.cashRegisterDetailId ? 'Kasa' : 'Banka'}</small>
              </div>
              <div class="col-6">
                <small><strong>İşlem:</strong> ${this.auth.user.name}</small><br>
                <small><strong>Tarih:</strong> ${this.formatDateTurkish(payment.paymentDate)}</small>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-2">
          <div class="col-4 text-center">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="mb-0 mt-1 small fw-bold">Çalışan</p>
            </div>
          </div>
          <div class="col-4 text-center">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="mb-0 mt-1 small fw-bold">İK</p>
            </div>
          </div>
          <div class="col-4 text-center">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="mb-0 mt-1 small fw-bold">İşveren</p>
            </div>
          </div>
        </div>

        <div class="border-top pt-1 mt-1">
          <div class="row">
            <div class="col-6">
              <p class="mb-0 small text-muted">
                <i class="fa-solid fa-clock me-1"></i>
                Baskı: ${this.formatDateTurkish(this.getToday())}
              </p>
            </div>
            <div class="col-6 text-end">
              <p class="mb-0 small text-muted">
                <i class="fa-solid fa-file-alt me-1"></i>
                Elektronik belge
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  formatDateTurkish(dateString: string): string {
    if (!dateString) return '';
    
    // Handle both ISO format (YYYY-MM-DD) and other formats
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  }

  openTrash() {
    // Navigate to the employee trash page
    this.router.navigate(['/employee-trash']);
  }
}