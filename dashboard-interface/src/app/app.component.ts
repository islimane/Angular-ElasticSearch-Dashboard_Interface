import { Component } from '@angular/core';

import { DataService } from './data.service';
import { Elasticsearch } from './elasticsearch';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title: string;
	result: number = 0;
	indexes: string[] = [
		'bank',
		'shakespeare',
		'logstash-2015.05.20',
		'logstash-2015.05.18',
		'logstash-2015.05.19'
	];
	selectedIndex: string = this.indexes[0];
	values: string[];
	numFields: string[];
	selectedNumField: string;


	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();
		console.log(this.elasticsearch);
		this.setNumFields();
	}

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}

	displayData(): void {
		this.elasticsearch.count(this.selectedIndex)
		.then(count => this.result = count);
	}

	avg(): void {
		this.elasticsearch.avg(this.selectedIndex, this.selectedNumField)
		.then(avg => this.result = avg);
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
