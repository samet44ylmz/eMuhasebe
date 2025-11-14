import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceModel } from '../models/invoice.model';

@Pipe({
  name: 'invoice',
  standalone: true
})
export class InvoicePipe implements PipeTransform {

    transform(value: InvoiceModel[], search:string): InvoiceModel[] {
        // Remove the default filtering of unpaid invoices
        // This will now be handled in the component
        
        if(!search) return value;
    
        return value.filter(p=> 
          p.customer.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
          p.invoiceNumber.includes(search) ||
          p.date.includes(search) ||
          p.details.some(detail => 
            (detail.product.productCode && detail.product.productCode.toLocaleLowerCase().includes(search.toLocaleLowerCase())) ||
            (detail.product.name && detail.product.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
          ) ||
          p.amount.toString().includes(search) ||
          p.paidAmount.toString().includes(search) ||
          (p.amount - p.paidAmount).toString().includes(search)
        );
      }
}