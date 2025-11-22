export class ExpenseModel {
  id: string = "";
  name: string = "";
  date: string = ""; // yyyy-MM-dd
  categoryType: number = 1; // Changed from object to number to match backend DTO
  description: string = "";
  price: number = 0;
  cashRegisterDetailId: string | null = null;
  // Add paid amount tracking
  paidAmount: number = 0;
  // Add currency type tracking
  giderCurrencyTypeValue: number = 1;
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
  giderCurrencyTypeValue: number = 1;
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
  giderCurrencyTypeValue: number = 1;
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