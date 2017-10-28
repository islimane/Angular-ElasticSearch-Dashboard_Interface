import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';

import { MetricsComponent } from '../metrics/metrics.component';
import { BucketsComponent } from '../buckets/buckets.component';

import { BarChartService } from './bar-chart.service';

import { VisualizationState } from '../../object-classes/visualizationState';
import { AggregationData } from '../../object-classes/aggregationData';
import { SearchSourceJSON } from '../../object-classes/searchSourceJSON';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { VisualizationTools } from "../../shared/visualization-tools";

import * as _ from "lodash";
import Chart from "chart.js";
declare var $: any;

@Component({
	selector: 'pie-chart',
	templateUrl: './bar-chart.component.html',
	styleUrls: ['./bar-chart.component.scss'],
	providers: [ BarChartService ]
})

export class BarChartComponent {
	@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	@ViewChild(BucketsComponent) private _bucketsComponent: BucketsComponent;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() index: string;
	@Input() dashMode: boolean = false;

	private _numFields: string[];
	private _textFields: string[];

	private _chart: Chart = null;

	private _options: any = {
		responsive: true,
		maintainAspectRatio: false,
		legend: {
			display: true,
		},
		fullWidth: true,
		tooltipFontSize: 10,
		scales: {
			xAxes: [{
				stacked: true
			}],
			yAxes: [{
				stacked: true
			}]
		}
	}
	private _canvasId: string = 'myChart';

	constructor( private _barChartService: BarChartService ) {}

	ngOnInit(): void {
		console.log('BAR CHART - ngOnInit()');
		console.log('this._numFields:', this._numFields);
		this.init.emit();
		this._setCanvasId();
	}

	calculate(): void{
		console.log('BAR CHART- calculate()');
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		if(metricAggs.length>0 && bucketAggs.length>0){
			let resultsObj = this._barChartService.getResults(this.index, metricAggs, bucketAggs).then(
				results => {
					let chartObj = this._getChartObj(results);
					this._renderChart(chartObj);
				}
			);
		}
	}

	private _getHeight(elemId: string): Number {
		//console.log('BAR CHART - elemId:', elemId);
		let configHeight = ($(window).height() - $('#' + elemId).position().top);
		//console.log('BAR CHART - config height:', configHeight);
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
		console.log('BAR CHART - _renderChart()');
		console.log('BAR CHART - chartObj:', chartObj);
		if(this._chart) this._chart.destroy();
		var ctx = $("#" + this._canvasId);
		this._chart= new Chart(ctx, chartObj);
	}

	private _getChartObj(results: any): any {
		console.log('BAR CHART - _getChartObj()');
		let rMap: Map<string, any[]> = results.rMap;
		let rArray: any[] = results.rArray;
		console.log('BAR CHART - rMap:', rMap);
		console.log('BAR CHART - rArray:', rArray);
		let datasets = [];
		let hexColors = [];
		let prevLength = null;
		rMap.forEach((value, key, map) => {
			console.log('BAR CHART - key:', key);
			console.log('BAR CHART - value:', value);
			let hexColor = this._getHexColor(hexColors);
			console.log('BAR CHART - hexColor:', hexColor);
			if(hexColor) hexColors.push(hexColor);
			let values = value.map((r) => r.metricResult.result);
			console.log('BAR CHART - values:', values);
			datasets.push({
				type: 'bar',
				label: key,
				backgroundColor: '#' + hexColor,
				data: values
			});
			prevLength = value.length;
		});

		return {
			type: 'bar',
			data: {
				labels: results.xAxisLabels,
				datasets: datasets
			},
			options: this._options
		}
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

	private _save(visTitle: string): void {
		let allAggs = this._getAllAggs();
		if(visTitle !== ''){
			var visualizationState = new VisualizationState();
			visualizationState.title = visTitle;
			visualizationState.type = 'bar';
			visualizationState.aggs = allAggs;
			console.log('BAR CHART - visualizationState:', visualizationState);

			console.log('BAR CHART - index:', this.index);
			var searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			var visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this._barChartService.saveBarChart(visualizationObject);
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
		console.log('BAR CHART - index:', this.index);
	}
}
