import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlankComponent } from '../components/blank/blank.component';
import { SectionComponent } from '../components/section/section.component';
import { FormsModule } from '@angular/forms';
import { TrCurrencyPipe } from 'tr-currency';
import { FlexiGridModule } from 'flexi-grid';
import { FlexiSelectModule } from 'flexi-select';
import { UserPipe } from '../pipes/user.pipe';
import { FormValidateDirective } from 'form-validate-angular';
import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [    
  ],
  imports: [
 
    CommonModule,
    BlankComponent, 
    SectionComponent,
    FormsModule,
    TrCurrencyPipe,
    FormValidateDirective,
    NgxPaginationModule
  ],
  exports: [
    CommonModule,
    BlankComponent, 
    SectionComponent,
    FormsModule,
    TrCurrencyPipe,
    FormValidateDirective,
    NgxPaginationModule,
  ]
})
export class SharedModule { }
