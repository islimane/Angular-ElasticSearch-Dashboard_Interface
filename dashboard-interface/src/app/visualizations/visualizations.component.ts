import { Component, ViewChild } from '@angular/core';

import { MetricsComponent } from './metrics/metrics.component';

import { Elasticsearch } from '../elasticsearch';
import { VisualizationsService } from './visualizations.service';


@Component({
	selector: 'visualizations',
	templateUrl: './visualizations.component.html'
})

export class VisualizationsComponent {
	@ViewChild(MetricsComponent) metricsComponent: MetricsComponent;

	visualizations: string[] = ['Metric', 'Data Table'];
	selectedVisualization: string = this.visualizations[1];
	savedVisualizations: any[] = [];

	indexes: string[] = [];
	selectedIndex: string = '';
	numFields: string[] = [];
	textFields: string[] = [];

	visualizationObj: any = null;

	constructor(
		public _elasticsearch: Elasticsearch,
		private _visualizationsService: VisualizationsService
	) { }

	ngOnInit(): void {
		this.setIndexes();
		this.setSavedVisualizations();
	}

	onIndexChange(newIndex): void {
		this.setAllFields();
	}

	setSavedVisualizations(): void {
		var that = this;
		this._elasticsearch.getSavedVisualizations().then(function(hits){
			for(let i=0; i<hits.length; i++){
				that.savedVisualizations.push(hits[i]);
			}
			console.log('savedVisualizations', that.savedVisualizations);
		});
	}

	setIndexes(): void {
		var that = this;
		this._elasticsearch.getIndices().then(function(indices){
			that.indexes = indices;
			that.selectedIndex = (that.indexes.length>0) ? that.indexes[0] : '';
			that.setAllFields();
		});
	}

	setAllFields(): PromiseLike<void> {
		return this._elasticsearch.getAllFields(this.selectedIndex)
		.then((fields) => {
			var numFields = [];
			var textFields = [];
			for(var field in fields){
				if(['text'].indexOf(fields[field].type)>=0){
					textFields.push(field);
				}else if(['integer', 'long'].indexOf(fields[field].type)>=0){
					numFields.push(field);
				}
			}
			this.textFields = textFields;
			this.numFields = numFields;
			console.log('SETTED FIELDS 1');
			this.sendFiedls();
		});
	}

	loadVis(visualization: any): void {
		this.visualizationObj = visualization;
		console.log('visualization', visualization);
		var source = visualization._source;
		var searchSource = JSON.parse(source.kibanaSavedObjectMeta.searchSourceJSON);
		this.selectedIndex = searchSource.index;
		var visState = JSON.parse(source.visState);
		this.setVisType(visState.type);
		console.log('visState.type', visState.type);
		this.selectedIndex = searchSource.index;
		this.setAllFields().then(() => {
				console.log('SETTED FIELDS 2');
				this.metricsComponent.loadSavedMetrics(visState.aggs)
		});
	}

	setVisType(type: string): void {
		switch(type){
			case 'metric':{
				this.selectedVisualization = 'Metric';
				break;
			}case 'table':{
				this.selectedVisualization = 'Data Table';
				break;
			}default:{
				console.error('Error - Visualization type not found.');
			}
		}
	}

	getNumFields(index: string): PromiseLike<string[]> {
		return ;
	}

	// Service communication methods

	sendFiedls(): void {
		this.sendNumFields();
		this.sendTextFields();
	}

	sendNumFields(): void {
		this._visualizationsService.sendNumFields(this.numFields);
	}

	sendTextFields(): void {
		this._visualizationsService.sendTextFields(this.textFields);
	}
}
