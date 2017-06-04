import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { MetricsService } from './metrics.service';

@Component({
	selector: 'metrics',
	templateUrl: './metrics.html',
	providers: [ MetricsService ]
})

export class MetricsComponent implements OnChanges{
	@Input() index: string;

	numFields: string[] = [];
	selectedNumField: string = '';

	aggregationsArr: string[] = [
		'Count',
		'Average',
		'Sum',
		'Min',
		'Max',
		'Median',
		'Standard Deviation',
		'Unique Count'
	];
	selectedAggregation: string = this.aggregationsArr[0];
	numFieldAgg: string[] = [
		'Average', 'Sum', 'Min', 'Max', 'Median', 'Standard Deviation',
		'Unique Count'
	];

	results: number[] = [0];

	constructor(
		public metricsService: MetricsService
	) { }

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		var previousValue = changes.index.previousValue;
		var currentValue = changes.index.currentValue;
		if(currentValue && previousValue!==currentValue)
			this.metricsService.getNumFields(this.index).then(numFields => {
				this.numFields = numFields;
				this.selectedNumField = this.numFields[0];
			});
	}

	processCalculation(value): void{
		switch(this.selectedAggregation){
			case 'Count': {
				this.metricsService.count(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Average': {
				this.metricsService.avg(this.index, this.selectedNumField)
				.then();
				break;
			}
			case 'Sum': {
				this.metricsService.sum(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Min': {
				this.metricsService.min(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Max': {
				this.metricsService.max(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Median': {
				this.metricsService.median(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Standard Deviation': {
				this.metricsService.stdDeviation(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Unique Count': {
				this.metricsService.uniqueCount(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			default: {
				console.error('Error: aggeregation not found.');
				break;
			}
		}
	}

	isNumFieldAgg(): Boolean{
		//console.log(this.selectedAggregation);
		return (this.numFieldAgg.indexOf(this.selectedAggregation)>=0);
	}
}
