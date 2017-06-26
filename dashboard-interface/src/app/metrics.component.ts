import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from './metrics.service';
import { PercentilesMetricComponent } from './metrics/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './metrics/percentileRanksMetric.component';
import { TopHitMetricComponent } from './metrics/topHitMetric.component';

import { VisualizationState } from './object-classes/visualizationState';
import { AggregationData } from './object-classes/aggregationData';
import { SearchSourceJSON } from './object-classes/searchSourceJSON';
import { VisualizationObj } from './object-classes/visualizationObj';

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
	@Input() textFields: string[] = [];
	@Output() resultsChange = new EventEmitter<number[]>();

	results: number[] = [];

	selectedNumField: string = '';

	aggregationsArr: any[] = [
		{ label: 'Count', value: 'count'},
		{ label: 'Average', value: 'avg'},
		{ label: 'Sum', value: 'sum'},
		{ label: 'Min', value: 'min'},
		{ label: 'Max', value: 'max'},
		{ label: 'Median', value: 'median'},
		{ label: 'Standard Deviation', value: 'extended_stats'},
		{ label: 'Unique Count', value: 'cardinality'},
		{ label: 'Percentiles', value: 'percentiles'},
		{ label: 'Percentile Ranks', value: 'percentile_ranks'},
		{ label: 'Top Hit', value: 'top_hits'}
	];
	selectedAggregation: string = this.aggregationsArr[0].value;
	numFieldAgg: string[] = [
		'avg', 'sum', 'min', 'max', 'median', 'extended_stats',
		'cardinality', 'percentiles', 'percentile_ranks', 'top_hits'
	];

	metricSavedData: any = null;

	childrenData: any = {
		percentilesMetricData: null,
		percentileRanksMetricData: null,
		topHitMetricData: null
	}


	constructor(
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	save(visTitle: string): void {
		if(visTitle !== ''){
			var aggregationData = new AggregationData();
			aggregationData.id = '1';
			aggregationData.enabled = true;
			aggregationData.type = this.selectedAggregation;
			aggregationData.schema = 'metric';
			aggregationData.params = this.getAggParams();

			var visualizationState = new VisualizationState();
			visualizationState.title = visTitle;
			visualizationState.type = 'metric';
			visualizationState.aggs = [aggregationData];
			console.log(visualizationState);

			var searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			var visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this.metricsService.saveMetric(visualizationObject);
		}
	}

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		console.log('changes.numFields:', changes.numFields);
		var oldNumFields = (changes.numFields) ? changes.numFields.previousValue : '';
		var newNumFields = (changes.numFields) ? changes.numFields.currentValue : '';
		console.log('oldNumFields:', oldNumFields);
		console.log('newNumFields:', newNumFields);
		if(newNumFields && oldNumFields!==newNumFields){
			if(this.metricSavedData===null) this.selectedNumField = (this.numFields.length) ? this.numFields[0] : '';
		}
	}

	loadSavedMetric(metricSavedData: any): void {
		console.log('metricSavedData', metricSavedData);
		this.metricSavedData = metricSavedData;
		var visState = JSON.parse(metricSavedData._source.visState);
		console.log('visState', visState);
		this.selectedAggregation = visState.aggs[0].type;
		this.selectedNumField = visState.aggs[0].params.field;
		console.log('selectedAggregation', this.selectedAggregation);
		console.log('selectedNumField', this.selectedNumField);
		var that = this;
		if(!this.isChildComponent(visState.aggs[0])){
			this.processCalculation(null);
		}else{
			this.processChildCalculation(visState);
		}
	}

	processChildCalculation(visState: any): void {
		console.log('visState.aggs[0].type:', visState.aggs[0].type);
		if(visState.aggs[0].type=='percentile_ranks'){
			console.log('SET DATA');
			this.childrenData.percentileRanksMetricData = visState.aggs[0];
		}else if(visState.aggs[0].type=='percentiles'){
			this.childrenData.percentilesMetricData = visState.aggs[0];
		}else if(visState.aggs[0].type=='top_hits'){
			this.childrenData.topHitMetricData = visState.aggs[0];
		}
	}

	isChildComponent(agg: any): boolean {
		switch(agg.type){
			case 'percentile_ranks':
			case 'percentiles':
			case 'top_hits':
				return true;
			default:
				return false;
		}
	}

	processCalculation(dataTableData: any): void{
		console.log('PROCESSCALC - dataTableData:', dataTableData);
		console.log('selectedAggregation:', this.selectedAggregation);
		switch(this.selectedAggregation){
			case 'count':
			case 'Count': {
				this.metricsService.count(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'avg':
			case 'Average': {
				this.metricsService.avg(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'sum':
			case 'Sum': {
				this.metricsService.sum(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'min':
			case 'Min': {
				this.metricsService.min(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'max':
			case 'Max': {
				this.metricsService.max(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'median':
			case 'Median': {
				this.metricsService.median(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'extended_stats':
			case 'Standard Deviation': {
				this.metricsService.stdDeviation(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'cardinality':
			case 'Unique Count': {
				this.metricsService.uniqueCount(this.index, this.selectedNumField, dataTableData)
				.then(results => {
					this.results = results;
					this.triggerResultsEvent();
				});
				break;
			}
			case 'percentiles':
			case 'Percentiles': {
				this.percentilesMetricComponent.calculate(dataTableData);
				break;
			}
			case 'percentile_ranks':
			case 'Percentile Ranks':{
				this.percentileRanksMetricComponent.calculate(dataTableData);
				break;
			}
			case 'top_hits':
			case 'Top Hit':{
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

	getAggParams(): any {
		switch (this.selectedAggregation){
			case 'count': {
				return {};
			}case 'avg': {
			}case 'sum': {
			}case 'min': {
			}case 'max': {
			}case 'median': {
			}case 'extended_stats': {
			}case 'cardinality': {
				return {
					field: this.selectedNumField
				};
			}case 'percentiles': {
				return {
					field: this.selectedNumField,
					percents: this.percentilesMetricComponent.percentileValues
				};
			}case 'percentile_ranks': {
				return {
					field: this.selectedNumField,
					values: this.percentileRanksMetricComponent.percentileRankValues
				};
			}case 'top_hits': {
				return {
					field: this.topHitMetricComponent.selectedField,
					aggregate: this.topHitMetricComponent.selectedTopHitAgg,
					size: this.topHitMetricComponent.hitsSize,
					sortField: this.topHitMetricComponent.selectedSortField,
					sortOrder: this.topHitMetricComponent.selectedOrder
				};
			}default: {
				return null;
			}
		}
	}
}
