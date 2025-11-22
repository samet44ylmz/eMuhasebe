import { Pipe, PipeTransform } from '@angular/core';
import { ExpenseModel } from '../models/expense.model';
import { ExpensesCategories } from '../models/expenses-category.model';

@Pipe({
  name: 'expense',
  standalone: true
})
export class ExpensePipe implements PipeTransform {

  transform(value: ExpenseModel[], search: string): ExpenseModel[] {
    if (!search) return value;
    const s = search.toLocaleLowerCase();
    return value.filter(p =>
      (p.name || '').toLocaleLowerCase().includes(s) ||
      (p.description || '').toLocaleLowerCase().includes(s) ||
        (this.getCategoryName(p.categoryType) || '').toLocaleLowerCase().includes(s) ||
      (p.price + '').includes(search) ||
      (p.paidAmount + '').includes(search) ||
      ((p.price - p.paidAmount) + '').includes(search) ||
      (p.date || '').includes(search)
    );
  }

    getCategoryName(value: number): string {
      if (!value || value === 0) {
        value = 5;
      }
      const category = ExpensesCategories.find(c => c.value === value);
      return category ? category.name : '';
    }
}