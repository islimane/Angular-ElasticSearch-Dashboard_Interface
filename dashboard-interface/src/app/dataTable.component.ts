import { Component, Input, ViewChild } from '@angular/core';

import { MetricsComponent } from './metrics.component';

@Component({
	selector: 'data-table',
	templateUrl: './dataTable.component.html'
})

export class DataTableComponent {
	@ViewChild(MetricsComponent)
	private metricsComponent: MetricsComponent

	@Input() index: string;

	results: any[] = [];

	columns: string[] = []

	rows: string[][] = [];

	calculate(): void{
		this.metricsComponent.processCalculation();
	}

	onResultChange(results): void{
		this.resetTable();
		console.log('results:', results);
		this.results = results;
		var row = [];
		for(var i=0; i<this.results.length; i++){
			console.log(this.results[i]);
			this.columns.push(this.results[i].label);
			row.push(this.results[i].result);
		}

		this.rows.push(row);
	}

	resetTable(): void{
		this.columns = [];
		this.rows = [];
	}
}
