export class ExpenseModel {
  id: string = "";
  name: string = "";
  date: string = ""; // yyyy-MM-dd
  categoryType: ExpenseCategoryType = new ExpenseCategoryType();
  description: string = "";
  price: number = 0;
  cashRegisterDetailId: string | null = null;
  // Add paid amount tracking
  paidAmount: number = 0;
}

export class ExpenseCategoryType {
  name: string = "";
  value: number = 1;
}

export class CreateExpenseModel {
  name: string = "";
  date: string = "";
  categoryValue: number = 1;
  description: string = "";
  price: number = 0;
  isCash: boolean | null = null;
  cashRegisterId: string | null = null;
  // Added isCash and cashRegisterId back to support cash register selection
}

export class UpdateExpenseModel {
  id: string = "";
  name: string = "";
  date: string = "";
  categoryValue: number = 1;
  description: string = "";
  price: number = 0;
  isCash: boolean = true;
  cashRegisterId: string | null = null;
}

export class DeleteExpenseModel {
  id: string = "";
}

// New payment model for expenses
export class PayExpenseModel {
  expenseId: string = "";
  paymentAmount: number = 0;
  paymentDate: string = "";
  description: string = "";
  cashRegisterId: string | null = null;
}