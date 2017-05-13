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
	data: number = 0;

	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();

		/*this.elasticsearch.clientElasticsearch.count(
			{
				index: 'bank'
			},
			function (error, response) {
				if (error) {
					console.error('elasticsearch cluster is down!');
					console.error(error);
				} else {
					console.log(response.count);
				}
			}
		);*/


	}

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}

	displayData(): void {
		this.elasticsearch.count('bank')
		.then(count => this.data = count);
	}
}
