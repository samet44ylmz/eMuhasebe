import { Pipe, PipeTransform } from '@angular/core';
import { EmployeeModel } from '../models/employee.model';

@Pipe({
  name: 'employee',
  standalone: true
})
export class EmployeePipe implements PipeTransform {

  transform(value: EmployeeModel[], search:string): EmployeeModel[] {
    if(!search) return value;

    const s = search.toLocaleLowerCase();
    return value.filter(p=>
      (p.name ?? '').toLocaleLowerCase().includes(s) ||
      (p.department ?? '').toLocaleLowerCase().includes(s) ||
      (p.position ?? '').toLocaleLowerCase().includes(s) ||
      (p.phone ?? '').toLocaleLowerCase().includes(s) ||
      (p.identityNumber ?? '').toLocaleLowerCase().includes(s)
    );
  }
}


