import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';

import { MetricsComponent } from '../metrics/metrics.component';
import { BucketsComponent } from '../buckets/buckets.component';

import { DataTableService } from './data-table.service';

@Component({
	selector: 'data-table',
	templateUrl: './dataTable.component.html',
	providers: [ DataTableService ]
})

export class DataTableComponent {
	@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	@ViewChild(BucketsComponent) private _bucketsComponent: BucketsComponent;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() index: string;
	private _numFields: string[];
	private _textFields: string[];

	results: any[] = [];
	columns: string[] = []
	rows: string[][] = [];

	constructor( private _dataTableService: DataTableService ) {}

	ngOnInit(): void {
		console.log('DATA TABLE - ngOnInit()');
		console.log('this._numFields:', this._numFields);
		this.init.emit();
	}

	calculate(): void{
		console.log('DATA TABLE - calculate()');
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		this._dataTableService.getResults(this.index, metricAggs, bucketAggs);
	}

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
