import { Pipe, PipeTransform } from '@angular/core';
import { ProductModel } from '../models/product.model';

@Pipe({
  name: 'product',
  standalone: true
})
export class ProductPipe implements PipeTransform {

  transform(value: ProductModel[], search:string): ProductModel[] {
    // Always return an array, even if null/undefined
    if(!value) return [];
    
    // If no search term, return all products
    if(!search) return value;
    
    // Filter products based on search term
    return value.filter(p=> 
      p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      p.productCode.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    );
  }
}