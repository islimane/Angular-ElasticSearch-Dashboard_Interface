import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
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


@Component({
	selector: 'metrics',
	templateUrl: './metrics.component.html',
	providers: [ MetricsService ]
})


export class MetricsComponent {
	@ViewChild(DynamicComponent) dynamicComponents;

	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	@Input() widgetMode: boolean = false;
	@Input() index: string;
	// This fields come from _visualizationsService
	private _numFields: string[];
	private _textFields: string[];

	private _subscriptions: Subscription[] = [];

	metricComponentType: any = MetricComponent;
	metricEvents: Array<string> = [ 'remove', 'dataChange' ];
	metricsMap: Map<string, AggregationData> = new Map<string, AggregationData>();

	results: any = [];


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
				this.removeMetric(event.uniqueId);
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

	calculateMetrics(): void {
		this.setMetricIds();
		this._metricsService.getAggsResults(
			this.index,
			Array.from(this.metricsMap.values())
		).then(results => {
			this.results = results;
			console.log('results:', results);
		});
	}

	getAggs(): AggregationData[] {
		return Array.from(this.metricsMap.values());
	}

	save(visTitle: string): void {
		this.setMetricIds();
		if(visTitle !== ''){
			var visualizationState = new VisualizationState();
			visualizationState.title = visTitle;
			visualizationState.type = 'metric';
			visualizationState.aggs = Array.from(this.metricsMap.values());
			console.log(visualizationState);

			var searchSourceJSON = new SearchSourceJSON(
				(this.index) ? this.index : '', {}
			);

			var visualizationObject = new VisualizationObj(
				visTitle,
				JSON.stringify(visualizationState),
				JSON.stringify(searchSourceJSON)
			);

			this._metricsService.saveMetric(visualizationObject);
		}
	}

	identify(index, metric): any {
		return (metric && metric.id) ? metric.id : metric.guid;
	}

	loadSavedMetrics(aggs: AggregationData[]): void {
		console.log('METRICS - loadSavedMetrics():', aggs);
		this.removeAll();
		for(let i=0; i<aggs.length; i++){
			console.log('METRICS - LOAD METRIC:', aggs[i]);
			this.addMetric(aggs[i]);
		}
	}

	addMetric(agg: AggregationData): void {
		let inputs = {
			index: this.index,
			numFields: this._numFields,
			textFields: this._textFields,
			widgetMode: false,
			savedData: null
		};

		let uniqueId = this.guidGenerator();

		let newMetricCmp = this.dynamicComponents.addComponent(
			uniqueId,
			inputs,
			this.metricEvents
		);

		// update metric data with saved data
		if(agg) this.dynamicComponents.setInputs(uniqueId, { savedData: agg });

		this.metricsMap.set(uniqueId, agg || newMetricCmp.getAggregationData());
	}

	guidGenerator(): string {
			var S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	removeMetric(uniqueId: string){
		console.log('REMOVE:', uniqueId);
		this.dynamicComponents.destroyCmp(uniqueId);
		this.metricsMap.delete(uniqueId);
	}

	removeAll(): void {
		this.metricsMap.forEach((value, key, map) => {
			this.dynamicComponents.destroyCmp(key);
			this.metricsMap.delete(key);
		});
	}

	setMetricIds(): void {
		let i = 0;
		this.metricsMap.forEach((value, key, map) => {
			i++;
			value.id = i + '';
		});
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
