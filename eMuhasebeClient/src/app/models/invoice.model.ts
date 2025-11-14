import { CustomerModel } from "./customer.model";
import { InvoiceDetailModel } from "./invoice-detail.model";

export class InvoiceModel{
    id: string = "";
    date: string = "";
    description: string = "";
    amount: number = 0;
    paidAmount: number = 0;
    type: InvoiceTypeEnum = new InvoiceTypeEnum();
    customerId: string = "";
    customer: CustomerModel = new CustomerModel();
    details: InvoiceDetailModel[] = [];
    invoiceNumber: string ="";
    productId: string ="";
    quantity: number = 0;
    price: number = 0;
    cashRegisterId: string | null = null;
}

export class InvoiceTypeEnum{
    name: string = "";
    value: number = 1;
}