import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { BankModel } from '../../models/bank.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-bank-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './bank-trash.component.html',
  styleUrl: './bank-trash.component.css'
})
export class BankTrashComponent {
  deletedBanks: BankModel[] = [];
  selectedBankIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedBanks();
  }

  getAllDeletedBanks() {
    this.http.post<BankModel[]>("Banks/GetAllDeleted", {}, (res) => {
      this.deletedBanks = res;
    });
  }

  toggleSelection(bankId: string) {
    const index = this.selectedBankIds.indexOf(bankId);
    if (index > -1) {
      this.selectedBankIds.splice(index, 1);
    } else {
      this.selectedBankIds.push(bankId);
    }
  }

  isSelected(bankId: string): boolean {
    return this.selectedBankIds.includes(bankId);
  }

  selectAll() {
    if (this.selectedBankIds.length === this.deletedBanks.length) {
      this.selectedBankIds = [];
    } else {
      this.selectedBankIds = this.deletedBanks.map(u => u.id);
    }
  }

  restoreBank(bank: BankModel) {
    this.swal.callSwal("Geri Yükle?", `${bank.name} bankasını geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Banks/Restore", { id: bank.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Banka başarıyla geri yüklendi", "success");
        this.getAllDeletedBanks();
        this.selectedBankIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteBank(bank: BankModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${bank.name} bankasını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Banks/PermanentDelete", { id: bank.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Banka kalıcı olarak silindi", "success");
        this.getAllDeletedBanks();
        this.selectedBankIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedBankIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz bankaları seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedBankIds.length} bankayı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Banks/BulkPermanentDelete", { ids: this.selectedBankIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedBankIds.length} banka kalıcı olarak silindi`, "success");
        this.getAllDeletedBanks();
        this.selectedBankIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the banks page
    this.router.navigate(['/banks']);
  }
}