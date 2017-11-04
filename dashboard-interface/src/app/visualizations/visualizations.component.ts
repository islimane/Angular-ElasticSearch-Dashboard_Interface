import { Component, ViewChild, Input } from '@angular/core';
import { DynamicComponent } from '../shared/dynamicComponent.component';

import { MetricsComponent } from './metrics/metrics.component';
import { DataTableComponent } from './data-table/dataTable.component';
import { PieChartComponent } from './pie-chart/pieChart.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';

import { Elasticsearch } from '../elasticsearch';
import { VisualizationsService } from './visualizations.service';

import { AggregationData } from '../object-classes/aggregationData';
import { VisualizationState } from '../object-classes/visualizationState';

import { Collapse } from '../shared/collapse.directive';

@Component({
	selector: 'visualizations',
	templateUrl: './visualizations.component.html',
	styleUrls: ['./visualizations.component.scss']
})

export class VisualizationsComponent {
	@ViewChild(DynamicComponent) private _dynamicComponent;
	//@ViewChild(MetricsComponent) private _metricsComponent: MetricsComponent;
	//@ViewChild(DataTableComponent) private _dataTableComponent: DataTableComponent;

	@Input() dashMode: boolean = false;
	@Input() savedVis: any = null;

	visualizations: string[] = ['Metric', 'Data Table', 'Pie Chart', 'Bar Chart'];
	private _selectedVisualization: string = '';
	savedVisualizations: any[] = [];
	private _cmpType: any = null;
	// This variable will be a pair <cmpId, cmp>
	private _visCmp: any = null;
	private _visEvents: string[] = [ 'init' ];

	indexes: string[] = [];
	private _selectedIndex: string = '';
	numFields: string[] = [];
	textFields: string[] = [];

	visualizationObj: any = null;

	private _panelStates: string[] = ['', ''];

	private _displaySavedVis = false;
	private _displayVisOpt = false;

	constructor(
		public _elasticsearch: Elasticsearch,
		private _visualizationsService: VisualizationsService
	) { }

	ngOnInit(): void {
		console.log('VISUALIZATIONS - ngOnInit()');
		if(!this.dashMode){
			this._setSavedVisualizations();
			this._setIndexes();
		}else{
			if(this.savedVis) this._loadVis(this.savedVis);
		}
	}

	onIndexChange(newIndex): void {
		console.log('VISUALIZATIONS - onIndexChange() - newIndex:', newIndex);
		this._setAllFields().then(() => {
			this._updateVisCmpInputs();
			this._sendFields()
		});
	}

	onVisChange(): void {
		console.log('VISULIZATIONS - onVisChange()');
		if(this._selectedVisualization) this._displayVis();
	}

	onDynCmpInit(): void {
		//this._displayVis();
	}

	onEvent(event): void {
		console.log('event:', event);
		switch(event.name){
			case 'init':
				this._sendFields();
				break;
			default:
				console.error('ERROR: event name [' + event.name + '] not found.');
		}
	}

	private _deleteVis(title: string): void {
		this._elasticsearch.deleteDoc('visualization', title).then(() => this._setSavedVisualizations());
	}

	private _destroyVis(): void {
		if(this._visCmp){
			this._dynamicComponent.destroyCmp(this._visCmp.guid);
		}
	}

	private _updateVisCmpInputs(){
		if(this._visCmp){
			let inputs = { index: this._selectedIndex };
			this._dynamicComponent.setInputs(this._visCmp.guid, inputs);
		}
	}

	private _displayVis(): void {
		this._destroyVis();
		this._setVisCmpType();
		if(this._cmpType){
			console.log('VISUALIZATIONS - _selectedIndex:', this._selectedIndex);
			let inputs: any = {
				index: this._selectedIndex
			};

			if(this.dashMode) inputs.dashMode = true;

			let uniqueId = this._guidGenerator();

			console.log('VISUALIZATIONS - _dynamicComponent:', this._dynamicComponent);

			let visCmp = this._dynamicComponent.addComponent(
				uniqueId,
				inputs,
				this._visEvents,
				this._cmpType
			);

			this._visCmp = {guid: uniqueId, cmp: visCmp};
		}
	}

	private _guidGenerator(): string {
			let S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	private _setVisCmpType(): any {
		switch(this._selectedVisualization){
			case 'Metric':
				console.log('IS METRIC');
				this._cmpType = MetricsComponent;
				break;
			case 'Data Table':
				console.log('IS DATA TABLE');
				this._cmpType = DataTableComponent;
				break;
			case 'Pie Chart':
				console.log('IS PIE CHART');
					this._cmpType = PieChartComponent;
					break;
				case 'Bar Chart':
					console.log('IS BAR CHART');
						this._cmpType = BarChartComponent;
						break;
			default:
				console.error('Error: visualization [' + this._selectedVisualization + '] not found.');
				return null;
		}
	}

	private _setSavedVisualizations(): void {
		this._elasticsearch.getSavedVisualizations().then(hits => {
			this.savedVisualizations = [];
			for(let i=0; i<hits.length; i++){
				this.savedVisualizations.push(hits[i]);
			}
			console.log('savedVisualizations', this.savedVisualizations);
		});
	}

	private _setIndexes(): PromiseLike<any> {
		return this._elasticsearch.getIndices().then(indices => {
			this.indexes = indices;
			this._selectedIndex = (this.indexes.length>0) ? this.indexes[0] : '';
			this._setAllFields().then(() => this._sendFields());
		});
	}

	private _setAllFields(): PromiseLike<void> {
		return this._elasticsearch.getAllFields(this._selectedIndex)
		.then((fields) => {
			console.log('VISUALIZATIONS - SETTED FIELDS:', fields);
			let numFields = [];
			let textFields = [];
			for(let field in fields){
				if(['text'].indexOf(fields[field].type)>=0){
					textFields.push(field);
				}else if(['integer', 'long'].indexOf(fields[field].type)>=0){
					numFields.push(field);
				}
			}
			this.textFields = textFields;
			this.numFields = numFields;
		});
	}

	private _loadVis(visualization: any): void {
		this.visualizationObj = visualization;
		console.log('visualization', visualization);
		let source = visualization._source;
		let searchSource = JSON.parse(source.kibanaSavedObjectMeta.searchSourceJSON);
		let visState = JSON.parse(source.visState);
		if(searchSource.index!==this._selectedIndex){
			this._selectedIndex = searchSource.index;
		}
		this._processVisType(visState.type, visState.aggs);
	}

	private _processVisType(type: string, aggs: AggregationData[]): void {
		console.log('VISUALIZATIONS - TYPE:', type);
		switch(type){
			case 'metric':{
				this._selectedVisualization = 'Metric';
				break;
			}case 'table':{
				this._selectedVisualization = 'Data Table';
				break;
			}case 'pie':{
				this._selectedVisualization = 'Pie Chart';
				break;
			}case 'bar':{
				this._selectedVisualization = 'Bar Chart';
				break;
			}default:{
				console.error('Error - Visualization type not found.');
			}
		}

		this._setAllFields().then(() => {
				this._sendFields();
				this._displayVis();
				this._visCmp.cmp.loadVis(aggs);
		});
	}

	// Service communication methods
	private _sendFields(): void {
		console.log('VISUALIZATIONS - sendFields()');
		this._sendNumFields();
		this._sendTextFields();
	}

	private _sendNumFields(): void {
		this._visualizationsService.sendNumFields(this.numFields);
	}

	private _sendTextFields(): void {
		this._visualizationsService.sendTextFields(this.textFields);
	}
}
