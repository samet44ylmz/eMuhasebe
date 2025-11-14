import { Pipe, PipeTransform } from '@angular/core';
import { ExpenseModel } from '../models/expense.model';

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
      (p.categoryType.name || '').toLocaleLowerCase().includes(s) ||
      (p.price + '').includes(search) ||
      (p.paidAmount + '').includes(search) ||
      ((p.price - p.paidAmount) + '').includes(search) ||
      (p.date || '').includes(search)
    );
  }
}