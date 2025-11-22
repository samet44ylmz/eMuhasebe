import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions, CellClickedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register all Community features for AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
	selector: 'app-ag-grid',
	standalone: true,
	imports: [AgGridAngular],
	template: `
		<div class="ag-theme-quartz" [style.height]="height" style="width: 100%;">
			<ag-grid-angular
				[class]="'w-100 h-100'"
				[rowData]="rowData"
				[columnDefs]="columnDefs"
				[defaultColDef]="defaultColDef"
				[pagination]="pagination"
				[paginationPageSize]="paginationPageSize"
				[pinnedBottomRowData]="pinnedBottomRowData"
				[gridOptions]="gridOptions"
				(cellClicked)="onCellClicked && onCellClicked($event)">
			</ag-grid-angular>
		</div>
	`
})
export class AgGridWrapperComponent {
	@Input() rowData: any[] = [];
	@Input() columnDefs: ColDef[] = [];
	@Input() height: string = '500px';
	@Input() pagination: boolean = true;
	@Input() paginationPageSize: number = 10;
	@Input() onCellClicked?: (event: CellClickedEvent) => void;
	@Input() pinnedBottomRowData?: any[] = undefined;

	defaultColDef: ColDef = {
		resizable: true,
		sortable: true,
		filter: true,
		flex: 1,
		minWidth: 120
	};

	gridOptions: GridOptions = {
		animateRows: true,
		rowSelection: 'single'
	};
}


