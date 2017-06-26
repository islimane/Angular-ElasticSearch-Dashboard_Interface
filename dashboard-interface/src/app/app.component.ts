import { Component, ViewChild } from '@angular/core';

import { MetricsComponent } from './metrics.component';

import { DataService } from './data.service';
import { Elasticsearch } from './elasticsearch';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {
	@ViewChild(MetricsComponent)
	private metricsComponent: MetricsComponent

	title: string = '';
	visualizations: string[] = ['Metric', 'Data Table'];
	selectedVisualization: string = this.visualizations[1];
	savedVisualizations: any[] = [];

	indexes: string[] = [];
	selectedIndex: string = '';
	numFields: string[] = [];
	textFields: string[] = [];

	visualizationObj: any = null;

	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();
		this.setIndexes();
		this.setSavedVisualizations();
	}

	onIndexChange(newIndex): void {
		this.setAllFields();
	}

	setSavedVisualizations(): void {
		var that = this;
		this.elasticsearch.getSavedVisualizations().then(function(hits){
			for(let i=0; i<hits.length; i++){
				that.savedVisualizations.push(hits[i]);
			}
			console.log('savedVisualizations', that.savedVisualizations);
		});
	}

	setIndexes(): void {
		var that = this;
		this.elasticsearch.getIndices().then(function(indices){
			that.indexes = indices;
			that.selectedIndex = (that.indexes.length>0) ? that.indexes[0] : '';
			that.setAllFields();
		});
	}

	setAllFields(): PromiseLike<void> {
		var that = this;
		return this.elasticsearch.getAllFields(this.selectedIndex)
		.then(function(fields){
			var numFields = [];
			var textFields = [];
			for(var field in fields){
				if(['text'].indexOf(fields[field].type)>=0){
					textFields.push(field);
				}else if(['integer', 'long'].indexOf(fields[field].type)>=0){
					numFields.push(field);
				}
			}
			that.textFields = textFields;
			that.numFields = numFields;
		});
	}

	loadVis(visualization: any): void {
		this.visualizationObj = visualization;
		console.log('visualization', visualization);
		var source = visualization._source;
		var searchSource = JSON.parse(source.kibanaSavedObjectMeta.searchSourceJSON);
		var visState = JSON.parse(source.visState);
		this.setVisType(visState.type);
		this.selectedIndex = searchSource.index;
		this.setAllFields().then(
			() => this.metricsComponent.loadSavedMetric(visualization)
		);
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

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}

}
