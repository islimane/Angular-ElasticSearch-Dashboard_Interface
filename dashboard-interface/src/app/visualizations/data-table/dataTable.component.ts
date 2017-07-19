import { Component, Input, ViewChild, SimpleChange } from '@angular/core';

import { MetricsComponent } from '../metrics/metrics.component';
import { BucketsComponent } from '../buckets/buckets.component';

@Component({
	selector: 'data-table',
	templateUrl: './dataTable.component.html'
})

export class DataTableComponent {
	@ViewChild(MetricsComponent)
	private metricsComponent: MetricsComponent

	@Input() index: string;
	@Input() numFields: string[] = [];

	results: any[] = [];
	columns: string[] = []
	rows: string[][] = [];

	/*calculate(): void{
		console.log('CALCULATE - interval:', this.interval);
		var dataTableData = this.getDataTableData();
		this.metricsComponent.calculateMetrics();
	}*/

	resetTable(): void{
		this.columns = [];
		this.rows = [];
	}

	/*private _getDataTableData(): any {
		switch (this.selectedAgg) {
			case 'Histogram':
				return {
					name: this.selectedAgg,
					field: this.selectedNumField,
					interval: this.interval
				};
			case 'Range':
				return {
					name: this.selectedAgg,
					field: this.selectedNumField,
					ranges: this.ranges
				};
			default:
				return null;
		}
	}*/
}
