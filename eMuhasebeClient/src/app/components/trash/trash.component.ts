import { Component } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { UserModel } from '../../models/user.model';
import { UserPipe } from '../../pipes/user.pipe';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [SharedModule, UserPipe],
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.css'
})
export class TrashComponent {
  deletedUsers: UserModel[] = [];
  selectedUserIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedUsers();
  }

  getAllDeletedUsers() {
    this.http.post<UserModel[]>("Users/GetAllDeleted", {}, (res) => {
      this.deletedUsers = res;
    });
  }

  // Add goBack method to navigate back to users page
  goBack() {
    this.router.navigate(['/users']);
  }

  toggleSelection(userId: string) {
    const index = this.selectedUserIds.indexOf(userId);
    if (index > -1) {
      this.selectedUserIds.splice(index, 1);
    } else {
      this.selectedUserIds.push(userId);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUserIds.includes(userId);
  }

  selectAll() {
    if (this.selectedUserIds.length === this.deletedUsers.length) {
      this.selectedUserIds = [];
    } else {
      this.selectedUserIds = this.deletedUsers.map(u => u.id);
    }
  }

  restoreUser(user: UserModel) {
    this.swal.callSwal("Geri Yükle?", `${user.fullName} kullanıcısını geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Users/Restore", { id: user.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Kullanıcı başarıyla geri yüklendi", "success");
        this.getAllDeletedUsers();
        this.selectedUserIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteUser(user: UserModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${user.fullName} kullanıcısını kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Users/PermanentDelete", { id: user.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Kullanıcı kalıcı olarak silindi", "success");
        this.getAllDeletedUsers();
        this.selectedUserIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedUserIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz kullanıcıları seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedUserIds.length} kullanıcıyı kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Users/BulkDelete", { ids: this.selectedUserIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedUserIds.length} kullanıcı kalıcı olarak silindi`, "success");
        this.getAllDeletedUsers();
        this.selectedUserIds = [];
      });
    });
  }
}