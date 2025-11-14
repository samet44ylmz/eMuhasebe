import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../modules/shared.module';
import { ProductModel } from '../../models/product.model';
import { HttpService } from '../../services/http.service';
import { SwalService } from '../../services/swal.service';

@Component({
  selector: 'app-product-trash',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './product-trash.component.html',
  styleUrl: './product-trash.component.css'
})
export class ProductTrashComponent {
  deletedProducts: ProductModel[] = [];
  selectedProductIds: string[] = [];
  search: string = "";
  p: number = 1;

  constructor(
    private http: HttpService,
    private swal: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDeletedProducts();
  }

  getAllDeletedProducts() {
    this.http.post<ProductModel[]>("Products/GetAllDeleted", {}, (res) => {
      this.deletedProducts = res;
    });
  }

  toggleSelection(productId: string) {
    const index = this.selectedProductIds.indexOf(productId);
    if (index > -1) {
      this.selectedProductIds.splice(index, 1);
    } else {
      this.selectedProductIds.push(productId);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedProductIds.includes(productId);
  }

  selectAll() {
    if (this.selectedProductIds.length === this.deletedProducts.length) {
      this.selectedProductIds = [];
    } else {
      this.selectedProductIds = this.deletedProducts.map(u => u.id);
    }
  }

  restoreProduct(product: ProductModel) {
    this.swal.callSwal("Geri Yükle?", `${product.name} ürününü geri yüklemek istiyor musunuz?`, () => {
      this.http.post<string>("Products/Restore", { id: product.id }, (res) => {
        // Improve notification for restore operation
        this.swal.callToast("Ürün başarıyla geri yüklendi", "success");
        this.getAllDeletedProducts();
        this.selectedProductIds = [];
      });
    }, "Geri Yükle", "İptal");
  }

  permanentDeleteProduct(product: ProductModel) {
    this.swal.callSwal("Kalıcı Olarak Sil?", `${product.name} ürününü kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Products/PermanentDelete", { id: product.id }, (res) => {
        // Improve notification for delete operation
        this.swal.callToast("Ürün kalıcı olarak silindi", "success");
        this.getAllDeletedProducts();
        this.selectedProductIds = [];
      });
    });
  }

  bulkDelete() {
    if (this.selectedProductIds.length === 0) {
      this.swal.callToast("Lütfen silmek istediğiniz ürünleri seçin", "error");
      return;
    }

    this.swal.callSwal("Kalıcı Olarak Sil?", `Seçili ${this.selectedProductIds.length} ürünü kalıcı olarak silmek istiyor musunuz? Bu işlem geri alınamaz!`, () => {
      this.http.post<string>("Products/BulkPermanentDelete", { ids: this.selectedProductIds }, (res) => {
        // Improve notification for bulk delete operation
        this.swal.callToast(`${this.selectedProductIds.length} ürün kalıcı olarak silindi`, "success");
        this.getAllDeletedProducts();
        this.selectedProductIds = [];
      });
    });
  }

  goBack() {
    // Navigate back to the products page
    this.router.navigate(['/products']);
  }
}