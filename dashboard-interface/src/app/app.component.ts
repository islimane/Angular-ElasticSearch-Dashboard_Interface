import { Component, ViewChild } from '@angular/core';

import { VisualizationsComponent } from './visualizations/visualizations.component';

import { DataService } from './data.service';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})

export class AppComponent {
	title: string = '';

	constructor(
		private dataService: DataService
	) { }

	ngOnInit(): void {
		this.getTitle();
	}

	getTitle(): void {
		this.title = this.dataService.getTitle();
	}
}
