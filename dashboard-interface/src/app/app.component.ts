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
	result: number = 0;
	indexes: string[] = [];
	selectedIndex: string = '';
	values: string[] = [];
	numFields: string[] = [];
	selectedNumField: string = '';


	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();
		console.log(this.elasticsearch);
		var that = this;
		this.elasticsearch.getIndices().then(function(indices){
			that.indexes = indices;
			that.selectedIndex = (that.indexes.length>0) ? that.indexes[0] : '';

			that.setNumFields();
		});
	}

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}

	displayData(): void {
		this.elasticsearch.count(this.selectedIndex)
		.then(count => this.result = count);
	}

	avg(): void {
		if(this.selectedIndex && this.selectedNumField){
			this.elasticsearch.avg(this.selectedIndex, this.selectedNumField)
			.then(avg => this.result = avg);
		}
	}

	setNumFields(): void {
		this.elasticsearch.getIndexNumFields(this.selectedIndex)
		.then(numFields => {
			console.log(numFields);
			this.numFields = numFields;
			this.selectedNumField = this.numFields[0];
		});
	}

	onChange(value): void{
		this.setNumFields();
	}
}
