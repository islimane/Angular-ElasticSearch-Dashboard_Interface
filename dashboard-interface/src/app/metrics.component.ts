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
	@Output() resultsChange = new EventEmitter<number[]>();

	results: number[] = [0];

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
		var previousValue = changes.index.previousValue;
		var currentValue = changes.index.currentValue;
		if(currentValue && previousValue!==currentValue){
			this.metricsService.getNumFields(this.index).then(numFields => {
				this.numFields = numFields;
				this.selectedNumField = this.numFields[0];
				//this.selectedTopHitField = this.numFields[0];
			});
		}
	}

	processCalculation(): void{
		switch(this.selectedAggregation){
			case 'Count': {
				this.metricsService.count(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Average': {
				this.metricsService.avg(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Sum': {
				this.metricsService.sum(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Min': {
				this.metricsService.min(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Max': {
				this.metricsService.max(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Median': {
				this.metricsService.median(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Standard Deviation': {
				this.metricsService.stdDeviation(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'Unique Count': {
				this.metricsService.uniqueCount(this.index, this.selectedNumField)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}case 'Percentiles': {
				this.percentilesMetricComponent.calculate();
				break;
			}case 'Percentile Ranks':{
				this.percentileRanksMetricComponent.calculate();
				break;
			}case 'Top Hit':{
				this.topHitMetricComponent.calculate();
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
