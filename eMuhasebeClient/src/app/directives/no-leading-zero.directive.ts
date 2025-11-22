import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoLeadingZero]',
  standalone: true
})
export class NoLeadingZeroDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const value = event.target.value;
    
    // Handle empty value
    if (!value) return;
    
    // Don't process if it's not a number or if it's a decimal starting with 0.
    if (isNaN(value) || value.startsWith('0.')) return;
    
    // Remove leading zeros but allow a single zero
    if (value.length > 1 && value.startsWith('0') && !isNaN(value)) {
      // Remove leading zeros but preserve decimal numbers
      let newValue = value.replace(/^0+/, '') || '0';
      
      // If the result is empty or not a number, set it to '0'
      if (!newValue || isNaN(newValue)) {
        newValue = '0';
      }
      
      this.el.nativeElement.value = newValue;
      
      // Dispatch input event to update ngModel
      const inputEvent = new Event('input', { bubbles: true });
      this.el.nativeElement.dispatchEvent(inputEvent);
    }
  }
  
  @HostListener('blur', ['$event']) onBlur(event: any) {
    const value = event.target.value;
    
    // Handle empty value
    if (!value) return;
    
    // Ensure we don't leave just an empty string or invalid number
    if (isNaN(value)) {
      this.el.nativeElement.value = '';
      const inputEvent = new Event('input', { bubbles: true });
      this.el.nativeElement.dispatchEvent(inputEvent);
    }
  }
}