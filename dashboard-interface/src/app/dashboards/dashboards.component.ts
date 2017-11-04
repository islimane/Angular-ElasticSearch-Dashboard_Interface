import { Component, OnInit, ViewChild } from '@angular/core';

import { DashboardComponent } from './dashboard/dashboard.component';

import { Elasticsearch } from '../elasticsearch';

@Component({
	selector: 'dashboards',
	templateUrl: './dashboards.component.html',
	styleUrls: ['./dashboards.component.scss']
})

export class DashboardsComponent {
	@ViewChild(DashboardComponent)
	private dashboardComponent: DashboardComponent;

	private _displaySavedDash: boolean = false;
	private _savedDashboards: any[] = [];

	constructor(
		public _elasticsearch: Elasticsearch
	) { }

	ngOnInit(): void {
		console.log('DASHBOARDS COMPONENT - ngOnInit()');
		this._setSavedDashboards();
	}

	private _setSavedDashboards(): void {
		console.log('DASHBOARDS COMPONENT - _setSavedVisualizations()');
		this._savedDashboards = [];
		this._elasticsearch.getSavedDashboards().then(hits => {
			for(let i=0; i<hits.length; i++){
				this._savedDashboards.push(hits[i]);
			}
			console.log('DASHBOARDS COMPONENT - _savedDashboards', this._savedDashboards);
		});
	}

	private _loadDashboard(dashboard: any): void {
		console.log('DASHBOARDS COMPONENT - _loadDashboard()');
		console.log('DASHBOARDS COMPONENT - dashboard', dashboard);
		let widgets = JSON.parse(dashboard._source.widgetsJSON);
		console.log('DASHBOARDS COMPONENT - widgets', widgets);
		this.dashboardComponent.widgets = widgets;
	}

	private _deleteDashboard(title: string): void {
		this._elasticsearch.deleteDoc('dashboard', title).then(() => this._setSavedDashboards());
	}
}
