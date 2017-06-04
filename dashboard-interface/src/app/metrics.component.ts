import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { Elasticsearch } from './elasticsearch';

@Component({
	selector: 'metrics',
	templateUrl: './metrics.html'
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
		public elasticsearch: Elasticsearch
	) { }

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		var previousValue = changes.index.previousValue;
		var currentValue = changes.index.currentValue;
		if(currentValue && previousValue!==currentValue)
			this.setNumFields();
	}

	setNumFields(): void {
		this.elasticsearch.getIndexNumFields(this.index)
		.then(numFields => {
			this.numFields = numFields;
			this.selectedNumField = this.numFields[0];
		});
	}

	count(): void {
		console.log('this.elasticsearch', this.elasticsearch);
		this.elasticsearch.count(this.index)
		.then(count => this.results = [count]);
	}

	avg(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'avg':{'field':this.selectedNumField}
				}
			})
			.then(aggregations => this.results = [aggregations.result.value]);
		}
	}

	sum(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'sum':{'field':this.selectedNumField}
				}
			})
			.then(aggregations => this.results = [aggregations.result.value]);
		}
	}

	min(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'min':{'field':this.selectedNumField}
				}
			})
			.then(aggregations => this.results = [aggregations.result.value]);
		}
	}

	max(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'max':{'field':this.selectedNumField}
				}
			})
			.then(aggregations => this.results = [aggregations.result.value]);
		}
	}

	median(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'percentiles':
						{
							'field':this.selectedNumField,
							'percents': [50]
						}
			}})
			.then(aggregations =>
				this.results = [aggregations.result.values['50.0']]
			);
		}
	}

	stdDeviation(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {
					'grades_stats': {
						'extended_stats':
							{
								'field':this.selectedNumField,
								'sigma': 2
							}
					}
			})
			.then(aggregations =>
				this.results = [
					aggregations.grades_stats.std_deviation_bounds.lower,
					aggregations.grades_stats.std_deviation_bounds.upper
				]
			);
		}
	}

	uniqueCount(): void {
		if(this.index && this.selectedNumField){
			this.elasticsearch.numFieldCalculation(
				this.index, {'result': {
					'cardinality':{'field':this.selectedNumField}
				}
			})
			.then(aggregations => this.results = [aggregations.result.value]);
		}
	}

	processCalculation(value): void{
		switch(this.selectedAggregation){
			case 'Count': {
				this.count();
				break;
			}
			case 'Average': {
				this.avg();
				break;
			}
			case 'Sum': {
				this.sum();
				break;
			}
			case 'Min': {
				this.min();
				break;
			}
			case 'Max': {
				this.max();
				break;
			}
			case 'Median': {
				this.median();
				break;
			}
			case 'Standard Deviation': {
				this.stdDeviation();
				break;
			}
			case 'Unique Count': {
				this.uniqueCount();
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
