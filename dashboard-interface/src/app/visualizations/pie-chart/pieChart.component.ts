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
declare var $: any;

@Component({
	selector: 'pie-chart',
	templateUrl: './pieChart.component.html',
	providers: [ PieChartService ]
})

export class PieChartComponent {
	@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	@ViewChild(BucketsComponent) private _bucketsComponent: BucketsComponent;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() index: string;
	private _numFields: string[];
	private _textFields: string[];

	private _chart: Chart = null;

	private _options: any = {
		responsive: true,
		legend: {
			display: false,
		},
		tooltips: {
			callbacks: {
				label: (tooltipItem, data) => {
					var dataset = data.datasets[tooltipItem.datasetIndex];
					var index = tooltipItem.index;
					return dataset.labels[index] + ': ' + dataset.data[index];
				}
			}
		}
	}

	constructor( private _pieChartService: PieChartService ) {}

	ngOnInit(): void {
		console.log('DATA TABLE - ngOnInit()');
		console.log('this._numFields:', this._numFields);
		this.init.emit();
		// var ctx = $("#myChart");
		// var myChart = new Chart(ctx, {
		// 	type: 'pie',
		// 	data: {
		// 		datasets: [{
		// 			data: [
		// 				1232, 2373, 1476,
		// 				1427, 2906, 2205,
		// 				1682, 3086, 1743,
		// 				1588, 2246, 1752,
		// 				1597, 2986, 1872
		// 			],
		// 			backgroundColor: [
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 			],
		// 			labels: [
		// 				'green',
		// 				'yellow',
		// 				'red',
		// 			]
		// 		}, {
		// 			data: [5081, 6538, 6511, 5586, 6455],
		// 			backgroundColor: [
		// 				'#bc52bc',
		// 				'#9e3533',
		// 				'#daa05d',
		// 				'#bfaf40',
		// 				'#4050bf'
		// 			],
		// 			labels: [
		// 				'black',
		// 				'grey',
		// 				'lightgrey'
		// 			],
		// 		}, ]
		// 	}
		// });
	}

	calculate(): void{
		console.log('DATA TABLE - calculate()');
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		if(metricAggs.length>0 && bucketAggs.length>0){
			let resultsObj: any = this._pieChartService.getResults(this.index, metricAggs[0], bucketAggs).then(
				resultsObj => {
					let chartObj = this._getChartObj(resultsObj);
					this._renderChart(chartObj);
				}
			);
		}
	}

	private _renderChart(chartObj: any): void {
		console.log('DATA TABLE - _renderChart()');
		console.log('DATA TABLE - chartObj:', chartObj);
		if(this._chart) this._chart.destroy();
		var ctx = $("#myChart");
		this._chart= new Chart(ctx, chartObj);
	}

	private _getChartObj(resultsMap: Map<string, any[]>): any {
		console.log('DATA TABLE - _getChartObj()');
		let datasets = [];
		let hexColors = [];
		let prevLength = null;
		resultsMap.forEach((value, key, map) => {
			let values = value.map(resultObj => resultObj.metricResult.result);
			console.log('DATA TABLE - values:', values);
			let backgroundColors = this._getHexColors(prevLength, value.length, hexColors);
			console.log('DATA TABLE - backgroundColors:', backgroundColors);
			datasets.unshift({
				data: values,
				backgroundColor: backgroundColors
			});
			prevLength = value.length;
		});

		return {
			type: 'pie',
			data: { datasets: datasets }
		}
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
	}

	private _getAllAggs(): AggregationData[] {
		let metricAggs = this._metricsComponent.getAggs();
		let bucketAggs = this._bucketsComponent.getAggs();
		return _.concat(metricAggs, bucketAggs);
	}

	debug(){
		console.log('PIE CHART - index:', this.index);
	}
}
