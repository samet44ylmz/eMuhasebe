import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { CashRegisterModel } from '../../models/cash-register.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-cash-register-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './cash-register-trash.component.html',
  styleUrl: './cash-register-trash.component.css'
})
export class CashRegisterTrashComponent {
  deletedCashRegisters: CashRegisterModel[] = [];
  selectedCashRegisterIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedCashRegisters();
  }

  getAllDeletedCashRegisters() {
    this.http.post<CashRegisterModel[]>("CashRegisters/GetAllDeleted", {}, (res) => {
      this.deletedCashRegisters = res;
    });
  }

  toggleSelection(cashRegisterId: string) {
    const index = this.selectedCashRegisterIds.indexOf(cashRegisterId);
    if (index > -1) {
      this.selectedCashRegisterIds.splice(index, 1);
    } else {
      this.selectedCashRegisterIds.push(cashRegisterId);
    }
  }

  isSelected(cashRegisterId: string): boolean {
    return this.selectedCashRegisterIds.includes(cashRegisterId);
  }

  selectAll() {
    if (this.selectedCashRegisterIds.length === this.deletedCashRegisters.length) {
      this.selectedCashRegisterIds = [];
    } else {
      this.selectedCashRegisterIds = this.deletedCashRegisters.map(u => u.id);
    }
  }

  restoreCashRegister(cashRegister: CashRegisterModel) {
    this.swal.callSwal("Geri Yükle?", `${cashRegister.name} kasasını geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("CashRegisters/Restore", { id: cashRegister.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Kasa başarıyla geri yüklendi", "success");
        this.getAllDeletedCashRegisters();
        this.selectedCashRegisterIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteCashRegister(cashRegister: CashRegisterModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${cashRegister.name} kasasını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("CashRegisters/PermanentDelete", { id: cashRegister.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Kasa kalıcı olarak silindi", "success");
        this.getAllDeletedCashRegisters();
        this.selectedCashRegisterIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedCashRegisterIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz kasaları seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedCashRegisterIds.length} kasayı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("CashRegisters/BulkPermanentDelete", { ids: this.selectedCashRegisterIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedCashRegisterIds.length} kasa kalıcı olarak silindi`, "success");
        this.getAllDeletedCashRegisters();
        this.selectedCashRegisterIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the cash registers page
    this.router.navigate(['/cash-registers']);
  }
}