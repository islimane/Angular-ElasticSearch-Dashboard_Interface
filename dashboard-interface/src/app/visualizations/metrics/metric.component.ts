import { Component, Input, Output, OnChanges, SimpleChange, EventEmitter, ViewChild } from '@angular/core';

import { MetricsService } from './metrics.service';
import { PercentilesMetricComponent } from './aggregations/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './aggregations/percentileRanksMetric.component';
import { TopHitMetricComponent } from './aggregations/topHitMetric.component';

import { AggregationData } from '../../object-classes/aggregationData';

import * as _ from "lodash";

@Component({
	selector: 'metric',
	templateUrl: './metric.component.html',
	providers: [ MetricsService ]
})

export class MetricComponent {
	@ViewChild(PercentilesMetricComponent)
	private percentilesMetricComponent: PercentilesMetricComponent;
	@ViewChild(PercentileRanksMetricComponent)
	private percentileRanksMetricComponent: PercentileRanksMetricComponent;
	@ViewChild(TopHitMetricComponent)
	private topHitMetricComponent: TopHitMetricComponent;

	@Output() dataChange = new EventEmitter<AggregationData>();
	@Output() remove = new EventEmitter<any>();

	@Input() index: string;
	@Input() widgetMode: boolean = false;

	private _numFields: string[] = [];
	@Input() set numFields(numFields: string[]) {
		console.log('numFields:', numFields);
		this._numFields = numFields;
		if(numFields && numFields.length>0)
			this.selectedField = numFields[0];
		//this.dataChangeEvent();
	};
	get numFields(): string[] {
		return this._numFields;
	};

	private _textFields: string[] = [];
	@Input() set textFields(textFields: string[]) {
		console.log('textFields:', textFields);
		this._textFields = textFields;
		//this.dataChangeEvent();
	};
	get textFields(): string[] {
		return this._textFields;
	};

	private _savedData: any = null;
	@Input() set savedData(savedData: any) {
		console.log('METRIC - SET - savedData');
		this._savedData = savedData;
		if(savedData)
			this.loadSavedMetric(savedData);
		//this.dataChangeEvent();
	};
	get savedData(): any {
		return this._savedData;
	};

	results: number[] = [];

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
	selectedField: string = '';

	childrenData: any = {
		percentilesMetricData: null,
		percentileRanksMetricData: null,
		topHitMetricData: null
	}

	constructor( public metricsService: MetricsService ) { }

	ngOnInit(): void {
		console.log('METRIC - ngOnInit()');
	}

	triggerRemoveEvent(): void {
		this.remove.emit();
	}

	dataChangeEvent(): void {
		console.log('METRIC - dataChangeEvent()');
		let aggregationData = this.getAggregationData();
		console.log('aggregationData:', aggregationData);
		if(aggregationData.params){
			this.dataChange.emit(aggregationData);
		}
	}

	getAggregationData(): AggregationData {
		var aggregationData = new AggregationData();
		aggregationData.enabled = true;
		aggregationData.type = this.selectedAggregation;
		aggregationData.schema = 'metric';
		aggregationData.params = this.getAggParams();

		return aggregationData;
	}

	loadSavedMetric(agg: AggregationData): void {
		console.log('METRIC - load():', agg);
		this.selectedAggregation = agg.type;
		this.selectedField = agg.params.field;
	}

	processCalculation(dataTableData: any): PromiseLike<any> {
		console.log('PROCESSCALC - dataTableData:', dataTableData);
		console.log('selectedAggregation:', this.selectedAggregation);
		switch(this.selectedAggregation){
			case 'count':
			case 'Count':
				return this.metricsService.count(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'avg':
			case 'Average':
				return this.metricsService.avg(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'sum':
			case 'Sum':
				return this.metricsService.sum(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'min':
			case 'Min':
				return this.metricsService.min(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'max':
			case 'Max':
				return this.metricsService.max(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'median':
			case 'Median':
				return this.metricsService.median(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'extended_stats':
			case 'Standard Deviation':
				return this.metricsService.stdDeviation(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'cardinality':
			case 'Unique Count':
				return this.metricsService.uniqueCount(this.index, this.selectedField, dataTableData)
				.then(results => this.results = results);
			case 'percentiles':
			case 'Percentiles':
				return this.metricsService.percentiles(
					this.index,
					this.percentilesMetricComponent.numField,
					this.percentilesMetricComponent.percentileValues,
					dataTableData
				).then(results => this.results = results);
			case 'percentile_ranks':
			case 'Percentile Ranks':
				return this.metricsService.percentileRanks(
					this.index,
					this.percentileRanksMetricComponent.numField,
					this.percentileRanksMetricComponent.percentileRankValues,
					dataTableData
				).then(results => this.results = results);
			case 'top_hits':
			case 'Top Hit':
			return this.metricsService.topHits(
					this.index,
					this.selectedField,
					this.topHitMetricComponent.selectedSortField,
					this.topHitMetricComponent.hitsSize,
					this.topHitMetricComponent.selectedOrder,
					this.topHitMetricComponent.selectedTopHitAgg,
					dataTableData
				).then(results => this.results = results);
			default:
				console.error('Error: aggeregation not found.');
		}
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
					field: this.selectedField
				};
			}case 'percentiles': {
				let cmp = this.percentilesMetricComponent;
				return {
					field: this.selectedField,
					percents: (cmp) ? cmp.percentileValues : []
				};
			}case 'percentile_ranks': {
				let cmp = this.percentileRanksMetricComponent;
				return {
					field: this.selectedField,
					values: (cmp) ? cmp.percentileRankValues : []
				};
			}case 'top_hits': {
				if(this.topHitMetricComponent){
					let cmp = this.topHitMetricComponent;
					return {
						field: this.selectedField,
						aggregate: (cmp) ? cmp.selectedTopHitAgg: 'Concatenate',
						size: (cmp) ? cmp.hitsSize: '1',
						sortField: (cmp) ? cmp.selectedSortField: this._numFields[0],
						sortOrder: (cmp) ? cmp.selectedOrder: 'desc'
					};
				}else{
					return null;
				}
			}default: {
				return null;
			}
		}
	}

	getTopHitsFieldData(): any {
		return {
			field: this.selectedField,
			isTextField: (this._textFields.indexOf(this.selectedField)>-1)
		}
	}

	getFields(): any {
		if(this.selectedAggregation==='top_hits')
			return this.getAllFields();

		return this._numFields;
	}

	getAllFields(): any {
		return _.concat(this._numFields, this._textFields);
	}
}
