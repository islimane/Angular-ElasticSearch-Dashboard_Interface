import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';

import { MetricsComponent } from '../metrics/metrics.component';
import { BucketsComponent } from '../buckets/buckets.component';

import { PieChartService } from './pie-chart.service';

import { VisualizationState } from '../../object-classes/visualizationState';
import { AggregationData } from '../../object-classes/aggregationData';
import { SearchSourceJSON } from '../../object-classes/searchSourceJSON';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { VisualizationTools } from "../../shared/visualization-tools";

import * as _ from "lodash";
import Chart from "chart.js";
import table from "text-table";
declare var $: any;

@Component({
	selector: 'pie-chart',
	templateUrl: './pieChart.component.html',
	styleUrls: ['./pieChart.component.scss'],
	providers: [ PieChartService ]
})

export class PieChartComponent {
	@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	@ViewChild(BucketsComponent) private _bucketsComponent: BucketsComponent;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() dashMode: boolean = false;
	@Input() index: string;
	private _numFields: string[];
	private _textFields: string[];

	private _chart: Chart = null;

	private _options: any = {
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: true
		},
		fullWidth: true,
		tooltipFontSize: 10,
		tooltips: {
			callbacks: {
				label: (tooltipItem, data) => {
					var dataset = data.datasets[tooltipItem.datasetIndex];
					var index = tooltipItem.index;
					console.log('PIE CHART - tooltipItem:', tooltipItem);
					console.log('PIE CHART - data:', data);
					console.log('PIE CHART - dataset.labels[index]:', dataset.labels[index]);
					return table(dataset.labels[index]).split('\n');
				}
			},
			displayColors: false,
			tooltipCaretSize: 0
		}
	}
	private _canvasId: string = 'myChart';

	constructor( private _pieChartService: PieChartService ) {}

	ngOnInit(): void {
		console.log('PIE CHART - ngOnInit()');
		console.log('this._numFields:', this._numFields);
		this.init.emit();
		this._setCanvasId();
	}

	calculate(): void{
		console.log('PIE CHART- calculate()');
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		if(metricAggs.length>0 && bucketAggs.length>0){
			let resultsObj = this._pieChartService.getResults(this.index, metricAggs[0], bucketAggs).then(
				results => {
					let chartObj = this._getChartObj(results);
					this._renderChart(chartObj);
				}
			);
		}
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

	private _setCanvasId(): any {
		this._canvasId = (this.dashMode) ? this._guidGenerator() : this._canvasId;
	}

	private _renderChart(chartObj: any): void {
		console.log('PIE CHART - _renderChart()');
		console.log('PIE CHART - chartObj:', chartObj);
		if(this._chart) this._chart.destroy();
		var ctx = $("#" + this._canvasId);
		this._chart= new Chart(ctx, chartObj);
	}

	private _getChartObj(results: any): any {
		console.log('PIE CHART - _getChartObj()');
		let rMap: Map<string, any[]> = results.rMap;
		let rArray: any[] = results.rArray;
		console.log('PIE CHART - rMap:', rMap);
		console.log('PIE CHART - rArray:', rArray);
		let datasets = [];
		let hexColors = [];
		let prevLength = null;
		rMap.forEach((value, key, map) => {
			let values = value.map(resultObj => resultObj.metricResult.result);
			console.log('PIE CHART - values:', values);
			let backgroundColors = this._getHexColors(prevLength, value.length, hexColors);
			console.log('PIE CHART - backgroundColors:', backgroundColors);
			let labels = this._getLabels(value, rArray);
			console.log('PIE CHART - labels:', labels);
			datasets.unshift({
				data: values,
				backgroundColor: backgroundColors,
				labels: labels
			});
			prevLength = value.length;
		});

		return {
			type: 'pie',
			data: { datasets: datasets },
			options: this._options
		}
	}

	private _getLabels(results: any[], rArray: any[]): any[] {
		let labels = [];
		for(let i=0; i<results.length; i++){
			console.log('PIE CHART - results[' + i + ']:', results[i]);
			labels.push(this._getLabelTable(results[i], rArray));
		}
		return labels;
	}

	private _getLabelTable(result: any, rArray: any[]): string[][] {
		/*console.log('PIE CHART - result.bucket.type:', result.bucket.type);
		console.log('PIE CHART - result.bucket.bucketValue:', result.bucketValue);
		console.log('PIE CHART - result.metricResult.result:', result.metricResult.result);*/
		let type = result.bucket.type;
		let bucketValue = result.bucketValue + '';
		let metricResult = result.metricResult.result + '';
		let tableStrings = [
			['field', 'value', 'Sum of age']
		];
		let rows = this._getLabelRows(result, rArray);
		console.log('PIE CHART - tableStrings:', _.concat(tableStrings, rows));
		return _.concat(tableStrings, rows);
	}

	private _getLabelRows(result: any, rArray: any[]): any[] {
		let type = result.bucket.type;
		let bucketValue = result.bucketValue + '';
		let metricResult = result.metricResult.result + '';
		let rows = [
			[type, bucketValue, metricResult]
		];
		console.log('PIE CHART - result.parentResultId:', result.parentResultId);
		let parentResultId = result.parentResultId;
		let filteredResults = _.filter(rArray, (r) => r.id===parentResultId);
		console.log('PIE CHART - filteredResults:', filteredResults);
		let parentRows = (filteredResults.length===1) ? this._getLabelRows(filteredResults[0], rArray) : [];
		console.log('PIE CHART - parentRows:', parentRows);
		return _.concat(rows, parentRows);
	}

	private _getHexColors(prevLength: number, currLength: number, hexColors: string[]): string[] {
		console.log('DATA TABLE - _getHexColors()');
		console.log('DATA TABLE - hexColors:', hexColors);
		let numOfColors = (prevLength) ? currLength/prevLength: currLength;
		let colors = [];
		for(let i=0; i<numOfColors; i++){
			let hexColor = this._getHexColor(hexColors);
			console.log('DATA TABLE - hexColor:', hexColor);
			if(hexColor){
				colors.push('#' + hexColor);
				hexColors.push(hexColor);
			}
		}

		let concatColors = (prevLength) ? []: colors;
		if(prevLength){
			for(let i=0; i<prevLength; i++){
				concatColors = _.concat(concatColors, colors);
			}
		}

		return concatColors;
	}

	private _getHexColor(hexColors: string[]): string {
		console.log('DATA TABLE - _getHexColor()');
		let color = null;
		let colorFound = false;
		let j = 0;
		while(!colorFound && j<50){
			color = VisualizationTools.getRandomHexColor();
			let colorConflicts = _.filter(hexColors, (o) => {
				let decColor = parseInt(color, 16);
				let currDecColor = parseInt(o, 16);
				return (Math.abs(decColor-currDecColor)<559240);
			});
			if(colorConflicts.length===0) colorFound = true;
			j++;
		}

		return color;
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
			visualizationState.type = 'pie';
			visualizationState.aggs = allAggs;
			console.log('PIE CHART - visualizationState:', visualizationState);

			console.log('PIE CHART - index:', this.index);
			var searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			var visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this._pieChartService.savePieChart(visualizationObject);
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

	private _guidGenerator(): string {
			let S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	debug(){
		console.log('PIE CHART - index:', this.index);
	}
}
