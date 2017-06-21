import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from './metrics.service';
import { PercentilesMetricComponent } from './metrics/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './metrics/percentileRanksMetric.component';
import { TopHitMetricComponent } from './metrics/topHitMetric.component';


@Component({
	selector: 'metrics',
	templateUrl: './metrics.component.html',
	providers: [ MetricsService ]
})

export class MetricsComponent implements OnChanges{
	@ViewChild(PercentilesMetricComponent)
	private percentilesMetricComponent: PercentilesMetricComponent;
	@ViewChild(PercentileRanksMetricComponent)
	private percentileRanksMetricComponent: PercentileRanksMetricComponent;
	@ViewChild(TopHitMetricComponent)
	private topHitMetricComponent: TopHitMetricComponent;

	@Input() index: string;
	@Input() widgetMode: boolean = false;
	@Input() numFields: string[] = [];
	@Output() resultsChange = new EventEmitter<number[]>();

	results: number[] = [];

	selectedNumField: string = '';

	aggregationsArr: string[] = [
		'Count',
		'Average',
		'Sum',
		'Min',
		'Max',
		'Median',
		'Standard Deviation',
		'Unique Count',
		'Percentiles',
		'Percentile Ranks',
		'Top Hit'
	];
	selectedAggregation: string = this.aggregationsArr[0];
	numFieldAgg: string[] = [
		'Average', 'Sum', 'Min', 'Max', 'Median', 'Standard Deviation',
		'Unique Count', 'Percentiles', 'Percentile Ranks', 'Top Hit'
	];


	constructor(
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		console.log('changes.numFields:', changes.numFields);
		var oldNumFields = (changes.numFields) ? changes.numFields.previousValue : '';
		var newNumFields = (changes.numFields) ? changes.numFields.currentValue : '';
		console.log('oldNumFields:', oldNumFields);
		console.log('newNumFields:', newNumFields);
		if(newNumFields && oldNumFields!==newNumFields){
			this.selectedNumField = (this.numFields.length) ? this.numFields[0] : '';
		}
	}

	processCalculation(dataTableData: any): void{
		console.log('PROCESSCALC - dataTableData:', dataTableData);
		switch(this.selectedAggregation){
			case 'Count': {
				this.metricsService.count(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Average': {
				this.metricsService.avg(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Sum': {
				this.metricsService.sum(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Min': {
				this.metricsService.min(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Max': {
				this.metricsService.max(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Median': {
				this.metricsService.median(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Standard Deviation': {
				this.metricsService.stdDeviation(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Unique Count': {
				this.metricsService.uniqueCount(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}case 'Percentiles': {
				this.percentilesMetricComponent.calculate(dataTableData);
				break;
			}case 'Percentile Ranks':{
				this.percentileRanksMetricComponent.calculate(dataTableData);
				break;
			}case 'Top Hit':{
				this.topHitMetricComponent.calculate(dataTableData);
				break;
			}
			default: {
				console.error('Error: aggeregation not found.');
				break;
			}
		}
	}

	onResultsEvent(results): void {
		this.results = results;
		this.triggerResultsEvent();
	}

	triggerResultsEvent(): void{
		// trigger this event for parent update
		if(this.widgetMode)
			this.resultsChange.emit(this.results);
	}

	isNumFieldAgg(): Boolean{
		//console.log(this.selectedAggregation);
		return (this.numFieldAgg.indexOf(this.selectedAggregation)>=0);
	}
}
