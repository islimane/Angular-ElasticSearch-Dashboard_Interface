import { Component, Input, Output, ViewChild, EventEmitter, HostListener } from '@angular/core';
import { MetricComponent } from './metric.component';
import { DynamicComponent } from '../../shared/dynamicComponent.component';

import { VisualizationState } from '../../object-classes/visualizationState';
import { AggregationData } from '../../object-classes/aggregationData';
import { SearchSourceJSON } from '../../object-classes/searchSourceJSON';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { Elasticsearch } from '../../elasticsearch';
import { MetricsService } from './metrics.service';
import { VisualizationsService } from '../visualizations.service';

import { Subscription } from 'rxjs/Subscription';

declare var $: any;

@Component({
	selector: 'metrics',
	templateUrl: './metrics.component.html',
	styleUrls: ['./metrics.component.scss'],
	providers: [ MetricsService ]
})


export class MetricsComponent {
	@ViewChild(DynamicComponent) dynamicComponents;

	// This is necessary for recalculation on windows resize
	@HostListener('window:resize', ['$event']) onResize(event) {}

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() dashMode: boolean = false;
	@Input() widgetMode: boolean = false;
	@Input() index: string;
	// This fields come from _visualizationsService
	private _numFields: string[];
	private _textFields: string[];

	private _subscriptions: Subscription[] = [];

	metricEvents: Array<string> = [ 'remove', 'dataChange' ];
	metricsMap: Map<string, AggregationData> = new Map<string, AggregationData>();

	results: any = [];

	private _resultsContainerId: string = this._guidGenerator();

	constructor(
		private _metricsService: MetricsService,
		private _visualizationsService: VisualizationsService,
		private _elasticCli: Elasticsearch
	) {
		this._subscribeToVisService();
	}

	ngOnInit(): void {
		console.log('METRICS - ngOnInit()');
		console.log('METRICS - this._numFields:', this._numFields);
		this.init.emit();
	}

	onEvent(event): void {
		console.log('event:', event);
		switch(event.name){
			case 'dataChange':
				this.onDataChange(event.uniqueId, event.data);
				break;
			case 'remove':
				this._removeMetric(event.uniqueId);
				break;
			default:
				console.error('ERROR: event name [' + event.name + '] not found.');
		}
	}

	onDataChange(uniqueId: string, data: any): void {
		console.log('DATA CHANGE FOR METRIC:', uniqueId);
		console.log('DATA:', data);

		this.metricsMap.set(uniqueId, data);
	}

	ngOnDestroy() {
		for(let i=0; i<this._subscriptions.length; i++){
			// prevent memory leak when component destroyed
			this._subscriptions[i].unsubscribe();
		}
	}

	private _getResults(): any[] {
		//console.log('METRICS - this.results:', this.results);
		let unwrappedResults = [];
		for(let i=0; i<this.results.length; i++){
			for(let j=0; j<this.results[i].length; j++){
				unwrappedResults.push(this.results[i][j]);
			}
		}
		//console.log('METRICS - unwrappedResults:', unwrappedResults);
		return unwrappedResults;
	}

	private _getResultsContainerId(): string {
		console.log('METTRICS - _getResultsContainerId()');
		console.log('METTRICS - _resultsContainerId:', this._resultsContainerId);
		return this._resultsContainerId;
	}

	private _getHeight(elemId: string): Number {
		console.log('METRICS - _getHeight()');
		console.log('METRICS - elemId:', elemId);
		let configHeight = ($(window).height() - $('#' + elemId).position().top);
		//console.log('METRICS - config height:', configHeight);
		return configHeight;
	}

	private _getDisplayStyle(): string {
		if(this.dashMode) return 'none';
		return '';
	}

	private _subscribeToVisService(): void {
		console.log('METTRICS - _subscribeToVisService()');

		let sub1 = this._visualizationsService.numFieldsSent$.subscribe(numFields => {
			console.log('METRICS - RECIEVED - numFields:', numFields);
			this._numFields = numFields;
			if(numFields) this.updateMetricsInputs();
		})

		let sub2 = this._visualizationsService.textFieldsSent$.subscribe(textFields => {
			console.log('METRICS - RECIEVED - textFields:', textFields);
			this._textFields = textFields;
			if(textFields) this.updateMetricsInputs();
		})

		this._subscriptions.push(sub1, sub2);
	}

	updateMetricsInputs(): void {
		console.log('METRICS - updateMetricsInputs()');
		this.metricsMap.forEach((value, key, map) => {
			let inputs = {
				index: this.index,
				numFields: this._numFields,
				textFields: this._textFields
			}

			this.dynamicComponents.setInputs(key, inputs);
		});
	}

	private _calculateMetrics(): void {
		this._setMetricIds();
		this._metricsService.getAggsResults(
			this.index,
			Array.from(this.metricsMap.values())
		).then(results => {
			this.results = results;
			console.log('results:', results);
		});
	}

	getAggs(): AggregationData[] {
		this._setMetricIds();
		return Array.from(this.metricsMap.values());
	}

	private _save(visTitle: string): void {
		this._setMetricIds();
		if(visTitle !== ''){
			let visualizationState = new VisualizationState();
			visualizationState.title = visTitle;
			visualizationState.type = 'metric';
			visualizationState.aggs = Array.from(this.metricsMap.values());
			console.log(visualizationState);

			let searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			let visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this._metricsService.saveMetric(visualizationObject);
		}
	}

	loadVis(aggs: AggregationData[]): void {
		this.loadMetrics(aggs);
	}

	loadMetrics(aggs: AggregationData[]): void {
		console.log('METRICS - loadSavedMetrics():', aggs);
		this._removeAll();
		for(let i=0; i<aggs.length; i++){
			console.log('METRICS - LOAD METRIC:', aggs[i]);
			this._addMetric(aggs[i]);
		}
		this._calculateMetrics();
	}

	private _addMetric(agg: AggregationData): void {
		let inputs = {
			index: this.index,
			numFields: this._numFields,
			textFields: this._textFields,
			widgetMode: false,
			savedData: null
		};

		let uniqueId = this._guidGenerator();

		let newMetricCmp = this.dynamicComponents.addComponent(
			uniqueId,
			inputs,
			this.metricEvents,
			MetricComponent
		);

		// update metric data with saved data
		if(agg) this.dynamicComponents.setInputs(uniqueId, { savedData: agg });

		this.metricsMap.set(uniqueId, agg || newMetricCmp.getAggregationData());
	}

	private _guidGenerator(): string {
			let S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	private _removeMetric(uniqueId: string){
		console.log('REMOVE:', uniqueId);
		this.dynamicComponents.destroyCmp(uniqueId);
		this.metricsMap.delete(uniqueId);
	}

	private _removeAll(): void {
		this.metricsMap.forEach((value, key, map) => {
			this.dynamicComponents.destroyCmp(key);
			this.metricsMap.delete(key);
		});
	}

	private _setMetricIds(): void {
		let i = 0;
		this.metricsMap.forEach((value, key, map) => {
			i++;
			value.id = 'metric_' + i;
		});
	}

	private _formatResult(result: any): any {
		if(typeof result === 'number') return Math.round(result * 100) / 100;
		return result;
	}

	debug(): void {
		console.log('%c DEBUG', 'background: #222; color: #bada55');
		console.log('%c metricsMap', 'background: #222; color: #bada55', this.metricsMap);
		console.log('%c metrics', 'background: #222; color: #bada55', Array.from(this.metricsMap.values()));
		console.log('%c results', 'background: #222; color: #bada55', this.results);
		console.log('%c numFields', 'background: #222; color: #bada55', this._numFields);
		console.log('%c textFields', 'background: #222; color: #bada55', this._textFields);
	}
}
