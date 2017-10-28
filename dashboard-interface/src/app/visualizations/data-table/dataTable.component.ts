import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';

import { MetricsComponent } from '../metrics/metrics.component';
import { BucketsComponent } from '../buckets/buckets.component';

import { DataTableService } from './data-table.service';

import { VisualizationState } from '../../object-classes/visualizationState';
import { AggregationData } from '../../object-classes/aggregationData';
import { SearchSourceJSON } from '../../object-classes/searchSourceJSON';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import * as _ from "lodash";
declare var $: any;

@Component({
	selector: 'data-table',
	templateUrl: './dataTable.component.html',
	styleUrls: ['./dataTable.component.scss'],
	providers: [ DataTableService ]
})

export class DataTableComponent {
	@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	@ViewChild(BucketsComponent) private _bucketsComponent: BucketsComponent;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() dashMode: boolean = false;
	@Input() index: string;
	private _numFields: string[];
	private _textFields: string[];

	results: any[] = [];
	columns: string[] = []
	rows: string[][] = [];

	private _columnsHeaders: string[] = []
	private _rows: string[][] = [];

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
		let resultsObj: any = this._dataTableService.getResults(this.index, metricAggs, bucketAggs).then(
			resultsObj => {
				this._columnsHeaders = resultsObj.columnsHeaders;
				this._rows = this._getFormattedRows(resultsObj.rows);
				console.log('DATA TABLE - resultsObj:', resultsObj);
			}
		);
	}

	private _getHeight(elemId: string): Number {
		//console.log('PIE CHART - elemId:', elemId);
		let configHeight = ($(window).height() - $('#' + elemId).position().top);
		//console.log('PIE CHART - config height:', configHeight);
		return configHeight;
	}

	private _getDisplayStyle(): string {
		if(this.dashMode) return 'none';
		return '';
	}

	private _getFormattedRows(rows: any[]): any[]{
		let formattedRows = [];
		for(let i=0; i<rows.length; i++){
			let formattedRow = _.flatMap(rows[i], (valueObj) => {
				return (valueObj.value) ? valueObj.value : valueObj.result;
			});
			console.log('DATA TABLE - formattedRow:', formattedRow);
			formattedRows.push(formattedRow);
		}
		return formattedRows;
	}

	private _save(visTitle: string): void {
		let allAggs = this._getAllAggs();
		if(visTitle !== ''){
			var visualizationState = new VisualizationState();
			visualizationState.title = visTitle;
			visualizationState.type = 'table';
			visualizationState.aggs = allAggs;
			console.log(visualizationState);

			var searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			var visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this._dataTableService.saveDataTable(visualizationObject);
		}
	}

	loadVis(aggs: AggregationData[]): void {
		console.log('DATA TABLE - loadVis():', aggs);
		let metrics = _.filter(aggs, (agg) => agg.id.split('_')[0]==='metric');
		let buckets = _.filter(aggs, (agg) => agg.id.split('_')[0]==='bucket');
		console.log('DATA TABLE - metrics:', metrics);
		console.log('DATA TABLE - buckets:', buckets);
		this._metricsComponent.loadMetrics(metrics);
		this._bucketsComponent.loadBuckets(buckets);
		this.calculate();
	}

	private _getAllAggs(): AggregationData[] {
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		return _.concat(metricAggs, bucketAggs);
	}

	resetTable(): void{
		this.columns = [];
		this.rows = [];
	}

}
