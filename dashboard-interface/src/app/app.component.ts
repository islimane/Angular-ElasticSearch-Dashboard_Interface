import { Component } from '@angular/core';

import { DataService } from './data.service';
import { Elasticsearch } from './elasticsearch';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {
	title: string = '';
	visualizations: string[] = ['Metric', 'Data Table'];
	selectedVisualization: string = this.visualizations[1];

	indexes: string[] = [];
	selectedIndex: string = '';
	numFields: string[] = [];

	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();
		this.setIndexes();
	}

	onIndexChange(newIndex): void {
		this.setNumFields();
	}

	setIndexes(): void {
		var that = this;
		this.elasticsearch.getIndices().then(function(indices){
			that.indexes = indices;
			that.selectedIndex = (that.indexes.length>0) ? that.indexes[0] : '';
			that.setNumFields();
		});
	}

	setNumFields(): void {
		this.elasticsearch.getIndexNumFields(this.selectedIndex).then(
			numFields => this.numFields = numFields
		);
	}

	getNumFields(index: string): PromiseLike<string[]> {
		return ;
	}

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}

}
