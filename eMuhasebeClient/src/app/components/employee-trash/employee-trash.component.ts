import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { EmployeeModel } from '../../models/employee.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-employee-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './employee-trash.component.html',
  styleUrl: './employee-trash.component.css'
})
export class EmployeeTrashComponent {
  deletedEmployees: EmployeeModel[] = [];
  selectedEmployeeIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedEmployees();
  }

  getAllDeletedEmployees() {
    this.http.post<EmployeeModel[]>("Employees/GetAllDeleted", {}, (res) => {
      this.deletedEmployees = res;
    });
  }

  toggleSelection(employeeId: string) {
    const index = this.selectedEmployeeIds.indexOf(employeeId);
    if (index > -1) {
      this.selectedEmployeeIds.splice(index, 1);
    } else {
      this.selectedEmployeeIds.push(employeeId);
    }
  }

  isSelected(employeeId: string): boolean {
    return this.selectedEmployeeIds.includes(employeeId);
  }

  selectAll() {
    if (this.selectedEmployeeIds.length === this.deletedEmployees.length) {
      this.selectedEmployeeIds = [];
    } else {
      this.selectedEmployeeIds = this.deletedEmployees.map(u => u.id);
    }
  }

  restoreEmployee(employee: EmployeeModel) {
    this.swal.callSwal("Geri Yükle?", `${employee.name} çalışanını geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Employees/Restore", { id: employee.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Çalışan başarıyla geri yüklendi", "success");
        this.getAllDeletedEmployees();
        this.selectedEmployeeIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteEmployee(employee: EmployeeModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${employee.name} çalışanını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Employees/PermanentDelete", { id: employee.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Çalışan kalıcı olarak silindi", "success");
        this.getAllDeletedEmployees();
        this.selectedEmployeeIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedEmployeeIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz çalışanları seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedEmployeeIds.length} çalışanı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Employees/BulkPermanentDelete", { ids: this.selectedEmployeeIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedEmployeeIds.length} çalışan kalıcı olarak silindi`, "success");
        this.getAllDeletedEmployees();
        this.selectedEmployeeIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the employees page
    this.router.navigate(['/employees']);
  }
}