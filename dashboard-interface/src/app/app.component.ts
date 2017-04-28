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

	constructor(
		private dataService: DataService,
		public elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		this.getTitle();
		/*this.elasticsearch
			.test_search()
			.subscribe((results) => {
				console.log(results);
			});*/
		console.log(this.elasticsearch);
		this.elasticsearch.ping();
	}

	getTitle(): void {
		console.log('HOLA!');
		this.title = this.dataService.getTitle();
	}
}
