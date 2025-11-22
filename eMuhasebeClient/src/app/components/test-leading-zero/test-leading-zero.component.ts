import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoLeadingZeroDirective } from '../../directives/no-leading-zero.directive';

@Component({
  selector: 'app-test-leading-zero',
  standalone: true,
  imports: [FormsModule, NoLeadingZeroDirective],
  template: `
    <div class="container mt-4">
      <h2>Leading Zero Test</h2>
      <div class="form-group">
        <label>Test Input (should remove leading zeros):</label>
        <input type="text" [(ngModel)]="testValue" class="form-control" appNoLeadingZero>
        <p class="mt-2">Current value: {{ testValue }}</p>
      </div>
    </div>
  `
})
export class TestLeadingZeroComponent {
  testValue: string = '';
}