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

	results: number[] = [0, 1];

	calculate(): void{
		this.metricsComponent.processCalculation();
	}

	onResultChange(results): void{
		console.log('results:', results);
		this.results = results;
	}
}
