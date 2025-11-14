import { AfterViewInit, Component } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { HttpService } from '../../services/http.service';
import { InvoiceBalanceReportModel } from '../../models/invoice-balance-report.model';
import { ExpenseBalanceReportModel } from '../../models/expense-balance-report.model';
import { BankBalanceReportModel } from '../../models/bank-balance-report.model';
import { RecentCashTransactionModel } from '../../models/recent-cash-transaction.model';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { SignalrService } from '../../services/signalr.service';
import { RouterLink } from '@angular/router';

// Models for our dashboard data
interface CashRegisterBalance {
  cashRegisterName: string;
  balance: number;
}

interface ProductProfitability {
  id: string;
  name: string;
  depositPrice: number;
  withdrawalPrice: number;
  profitPercent: number;
  profit: number;
}

interface RecentActivity {
  id: number;
  icon: string;
  color: string;
  title: string;
  description: string;
  time: string;
}

declare const Chart: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, DatePipe, CurrencyPipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [DatePipe]
})
export class HomeComponent implements AfterViewInit {
  invoiceBalanceChart: any;
  expenseBalanceChart: any;
  invoiceResponse: InvoiceBalanceReportModel = new InvoiceBalanceReportModel();
  expenseResponse: ExpenseBalanceReportModel = new ExpenseBalanceReportModel();
  
  // Dashboard data properties
  cashRegisterBalance: number = 0;
  bankBalance: number = 0;
  totalCustomers: number = 0;
  totalProducts: number = 0;
  productProfitability: ProductProfitability[] = [];
  recentCashTransactions: RecentCashTransactionModel[] = [];
  recentActivities: RecentActivity[] = [
    {
      id: 1,
      icon: 'fas fa-shopping-cart',
      color: 'blue',
      title: 'Yeni Sipariş',
      description: 'Müşteri: ABC Ltd. Şti. - 1.250,00 TL',
      time: '12:30'
    },
    {
      id: 2,
      icon: 'fas fa-user-plus',
      color: 'green',
      title: 'Yeni Cari',
      description: 'Yeni müşteri kaydı: XYZ A.Ş.',
      time: '11:45'
    },
    {
      id: 3,
      icon: 'fas fa-box',
      color: 'yellow',
      title: 'Ürün Stok Güncellemesi',
      description: 'Ürün: Laptop - Stok: 15 adet',
      time: '10:30'
    },
    {
      id: 4,
      icon: 'fas fa-money-bill-wave',
      color: 'red',
      title: 'Ödeme Girişi',
      description: 'Ödeme türü: Nakit - Tutar: 2.500,00 TL',
      time: '09:15'
    }
  ];

  constructor(
    private http: HttpService,
    private date: DatePipe,
    private signalR: SignalrService
  ) {}

  ngAfterViewInit(): void {
    this.showInvoiceBalanceChart();
    this.showExpenseBalanceChart();
    this.getDashboardData();
    this.getInvoiceBalanceReports();
    this.getExpenseBalanceReports();
  }

  getDashboardData() {
    // Get cash register balances
    this.http.post<CashRegisterBalance[]>("Reports/GetCashRegisterBalanceReports", {}, (res) => {
      this.cashRegisterBalance = res.reduce((sum, item) => sum + item.balance, 0);
    });

    // Get bank balances
    this.http.post<BankBalanceReportModel[]>("Reports/GetBankBalanceReports", {}, (res) => {
      this.bankBalance = res.reduce((sum, item) => sum + item.balance, 0);
    });

    // Get recent cash transactions
    this.http.post<RecentCashTransactionModel[]>("Reports/GetRecentCashTransactions", {}, (res) => {
      this.recentCashTransactions = res;
    });

    // Get customer count
    this.http.post<number>("Reports/GetCustomerCount", {}, (res) => {
      this.totalCustomers = res;
    });

    // Get product count
    this.http.post<number>("Reports/GetProductCount", {}, (res) => {
      this.totalProducts = res;
    });

    // Get product profitability
    this.http.post<ProductProfitability[]>("Reports/GetProductProfitabilityReports", {}, (res) => {
      this.productProfitability = res.slice(0, 5); // Show top 5 products
    });
  }

  getInvoiceBalanceReports() {
    this.http.post<InvoiceBalanceReportModel>("Reports/GetInvoiceBalanceReports", {}, (res) => {
      this.invoiceResponse = res;
      this.updateInvoiceBalanceChart();
      this.invoiceBalanceChart.update();
    });
  }

  getExpenseBalanceReports() {
    this.http.post<ExpenseBalanceReportModel>("Reports/GetExpenseBalanceReports", {}, (res) => {
      this.expenseResponse = res;
      this.updateExpenseBalanceChart();
      this.expenseBalanceChart.update();
    });
  }

  updateInvoiceBalanceChart() {
    this.invoiceBalanceChart.data.labels = this.invoiceResponse.dates.map(value => {
      return this.date.transform(value, 'dd.MM.yyyy')
    });
    
    this.invoiceBalanceChart.data.datasets[0].data = this.invoiceResponse.outstandingBalances;
    this.invoiceBalanceChart.data.datasets[1].data = this.invoiceResponse.paidAmounts;

    this.invoiceBalanceChart.update();
  }

  updateExpenseBalanceChart() {
    this.expenseBalanceChart.data.labels = this.expenseResponse.dates.map(value => {
      return this.date.transform(value, 'dd.MM.yyyy')
    });
    
    this.expenseBalanceChart.data.datasets[0].data = this.expenseResponse.outstandingBalances;
    this.expenseBalanceChart.data.datasets[1].data = this.expenseResponse.paidAmounts;

    this.expenseBalanceChart.update();
  }

  showInvoiceBalanceChart() {
    const ctx = document.getElementById('invoiceBalanceChart');

    this.invoiceBalanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ödenmemiş Tutar',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Ödenen Tutar',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  showExpenseBalanceChart() {
    const ctx = document.getElementById('expenseBalanceChart');

    this.expenseBalanceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Ödenmemiş Tutar',
            data: [],
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          },
          {
            label: 'Ödenen Tutar',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }
}