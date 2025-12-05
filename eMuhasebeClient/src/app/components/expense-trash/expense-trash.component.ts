import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { ExpenseModel } from '../../models/expense.model';
import { ExpensesCategories } from '../../models/expenses-category.model';
import { CurrencyTypes } from '../../models/currency.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-expense-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './expense-trash.component.html',
  styleUrl: './expense-trash.component.css'
})
export class ExpenseTrashComponent {
  deletedExpenses: ExpenseModel[] = [];
  selectedExpenseIds: string[] = [];
  search: string = "";
  p: number = 1;
  categories = ExpensesCategories;
  currencies = CurrencyTypes;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedExpenses();
  }

  getAllDeletedExpenses() {
    // Add timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    this.http.post<ExpenseModel[]>("Giderler/GetAllDeleted", { _t: timestamp }, (res) => {
      console.log('getAllDeletedExpenses response:', res);
      this.deletedExpenses = res;
    }, (err) => {
      // Handle error case - maybe show an error message
      console.error('Error fetching deleted expenses:', err);
      this.swal.callToast("Silinen giderler alınırken bir hata oluştu", "error");
    });
  }

  toggleSelection(expenseId: string) {
    const index = this.selectedExpenseIds.indexOf(expenseId);
    if (index > -1) {
      this.selectedExpenseIds.splice(index, 1);
    } else {
      this.selectedExpenseIds.push(expenseId);
    }
  }

  isSelected(expenseId: string): boolean {
    return this.selectedExpenseIds.includes(expenseId);
  }

  selectAll() {
    if (this.selectedExpenseIds.length === this.deletedExpenses.length) {
      this.selectedExpenseIds = [];
    } else {
      this.selectedExpenseIds = this.deletedExpenses.map(u => u.id);
    }
  }

  restoreExpense(expense: ExpenseModel) {
    this.swal.callSwal("Geri Yükle?", `${expense.name} giderini geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Giderler/Restore", { id: expense.id }, (res) => {
        console.log('restoreExpense response:', res);
        // Improve notification for restore operation
        this.swal.callToast("Gider başarıyla geri yüklendi", "success");
        // Navigate back to expenses page to ensure proper refresh of all data including balances
        // Add a longer delay to ensure the restore operation completes before navigation
        setTimeout(() => {
          this.router.navigate(['/expenses']);
        }, 1500);
      }, (error) => {
        // Handle error case
        console.error('Error restoring expense:', error);
        this.swal.callToast("Gider geri yüklenirken bir hata oluştu", "error");
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteExpense(expense: ExpenseModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${expense.name} giderini kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Giderler/PermanentDelete", { id: expense.id }, (res) => {
        console.log('permanentDeleteExpense response:', res);
        // Improve notification for delete operation
        this.swal.callToast("Gider kalıcı olarak silindi", "success");
        this.getAllDeletedExpenses();
        this.selectedExpenseIds = [];
      }, (error) => {
        // Handle error case
        console.error('Error permanently deleting expense:', error);
        this.swal.callToast("Gider kalıcı olarak silinirken bir hata oluştu", "error");
      });
    });
  }

  bulkDelete() {
    if (this.selectedExpenseIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz giderleri seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedExpenseIds.length} gideri kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Giderler/BulkPermanentDelete", { ids: this.selectedExpenseIds }, (res) => {
        console.log('bulkDelete response:', res);
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedExpenseIds.length} gider kalıcı olarak silindi`, "success");
        this.getAllDeletedExpenses();
        this.selectedExpenseIds = [];
      }, (error) => {
        // Handle error case
        console.error('Error bulk deleting expenses:', error);
        this.swal.callToast("Giderler kalıcı olarak silinirken bir hata oluştu", "error");
      });
    });
  }

  goBack() {
    // Navigate back to the expenses page
    this.router.navigate(['/expenses']);
  }

    getCategoryName(value: number): string {
      // Handle invalid or zero values by defaulting to Malzeme (5)
      if (!value || value === 0) {
        value = 5;
      }
      const category = this.categories.find(c => c.value === value);
      return category ? category.name : 'Bilinmiyor';
    }

    getCurrencySymbol(value: number): string {
      const currency = this.currencies.find(c => c.value === value);
      return currency ? currency.symbol : '₺';
    }

    formatCurrency(value: number, currencyValue: number): string {
      const symbol = this.getCurrencySymbol(currencyValue);
      try {
        return `${symbol}${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } catch (e) {
        // Fallback if toLocaleString not available
        return `${symbol}${value.toFixed(2)}`;
      }
    }
}