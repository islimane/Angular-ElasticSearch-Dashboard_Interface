import { Component, OnInit, ViewChild } from '@angular/core';
import { GridsterComponent } from './gridster/gridster.component';
import { GridsterItemComponent } from './gridster/gridster-item/gridster-item.component';
import { IGridsterOptions } from './gridster/IGridsterOptions';
import { IGridsterDraggableOptions } from './gridster/IGridsterDraggableOptions';
import { DynamicComponent } from '../../shared/dynamicComponent.component';

import { Elasticsearch } from '../../elasticsearch';

declare var $: any;

@Component({
	selector: 'dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent {
	@ViewChild(GridsterComponent) gridster: GridsterComponent;
	@ViewChild(DynamicComponent) private _dynamicComponents;

	private _itemOptions = {
		maxWidth: 20,
		maxHeight: 20
	};

	gridsterOptions: IGridsterOptions = {
		// core configuration is default one - for smallest view. It has hidden minWidth: 0.
		lanes: 20, // amount of lanes (cells) in the grid
		direction: 'vertical', // floating top - vertical, left - horizontal
		dragAndDrop: true, // enable/disable drag and drop for all items in grid
		resizable: true, // enable/disable resizing by drag and drop for all items in grid
		widthHeightRatio: 1.2, // proportion between item width and height
		shrink: true,
		useCSSTransforms: true,
		responsiveView: false, // turn on adopting items sizes on window resize and enable responsiveOptions
		//responsiveDebounce: 500, // window resize debounce time
		// List of different gridster configurations for different breakpoints.
		// Each breakpoint is defined by name stored in "breakpoint" property. There is fixed set of breakpoints
		// available to use with default minWidth assign to each.
		// - sm: 576 - Small devices
		// - md: 768 - Medium devices
		// - lg: 992 - Large devices
		// - xl: 1200 - Extra large
		// MinWidth for each breakpoint can be overwritten like it's visible below.
		// ResponsiveOptions can overwrite default configuration with any option available.
		/*responsiveOptions: [
			{
				breakpoint: 'sm',
				// minWidth: 480,
				lanes: 3
			},
			{
				breakpoint: 'md',
				minWidth: 768,
				lanes: 4
			},
			{
				breakpoint: 'lg',
				minWidth: 1250,
				lanes: 6
			},
			{
				breakpoint: 'xl',
				minWidth: 1800,
				lanes: 8
			}
		]*/
	};

	gridsterDraggableOptions: IGridsterDraggableOptions = {
		handlerClass: 'panel-heading'
	};

	title = 'Angular2Gridster';

	widgets: Array<any> = [];

	private _savedVisualizations: any[] = [];
	private _displaySavedVis = false;

	constructor(
		public _elasticsearch: Elasticsearch
	) { }

	ngOnInit(): any {
		console.log('DASHBOARD COMPONENT - ngOnInit()');
		this._setSavedVisualizations();
	}

	private _deleteVis(title: string): void {
		this._elasticsearch.deleteDoc('visualization', title).then(() => this._setSavedVisualizations());
	}

	private _save(dashTitle: string): void {
		console.log('DASHBOARD COMPONENT - _save()');
		if(dashTitle!=='' && this.widgets.length>0){
			var dashboardObj = {
				title: dashTitle,
				widgetsJSON: JSON.stringify(this.widgets)
			};

			console.log('DASHBOARD COMPONENT - dashboardObj:', dashboardObj);
			this._elasticsearch.saveDashboard(dashboardObj);
		}
	}

	private _pushGridItem(vis: any): void {
		this.widgets.push({
			title: vis._source.title,
			w: 10,
			h: 6,
			dragAndDrop: true,
			resizable: true,
			visualization: vis
		});

		this._displaySavedVis = !this._displaySavedVis;
	}

	private _getWidget(vis: any) {
		return {
			title: vis._source.title,
			w: 3,
			h: 3,
			dragAndDrop: true,
			resizable: true,
			visualization: vis
		};
	}

	private _setSavedVisualizations(): void {
		console.log('DASHBOARD COMPONENT - _setSavedVisualizations()');
		this._elasticsearch.getSavedVisualizations().then(hits => {
			this._savedVisualizations = [];
			for(let i=0; i<hits.length; i++){
				this._savedVisualizations.push(hits[i]);
			}
			console.log('DASHBOARD COMPONENT - _savedVisualizations', this._savedVisualizations);
		});
	}

	private _selectVisModal(){
		console.log('DASHBOARD COMPONENT - gridsterOptions', this.gridsterOptions);
		console.log('DASHBOARD COMPONENT - widgets', this.widgets);
		//this.addWidgetWithoutData();
	}

	private _itemChange($event: any) {
		console.log('DASHBOARD COMPONENT - item change:', $event);
	}

	removeLine(gridster: GridsterComponent) {
		gridster.setOption('lanes', --this.gridsterOptions.lanes)
			.reload();
	}

	getTitle() {
		return this.title;
	}

	addLine(gridster: GridsterComponent) {
		gridster.setOption('lanes', ++this.gridsterOptions.lanes)
			.reload();
	}

	setWidth(widget: any, size: number, e: MouseEvent, gridster) {
		e.stopPropagation();
		e.preventDefault();
		if (size < 1) {
			size = 1;
		}
		widget.w = size;

		gridster.reload();

		return false;
	}

	setHeight(widget: any, size: number, e: MouseEvent, gridster) {
		e.stopPropagation();
		e.preventDefault();
		if (size < 1) {
			size = 1;
		}
		widget.h = size;

		gridster.reload();

		return false;
	}

	optionsChange(options: IGridsterOptions) {
		this.gridsterOptions = options;
		console.log('options change:', options);
	}

	swap() {
		this.widgets[0].x = 3;
		this.widgets[3].x = 0;
	}

	addWidgetFromDrag(gridster: GridsterComponent, event: any) {
		const item = event.item;
		this.widgets.push({
			x: item.x, y: item.y, w: item.w, h: item.h,
			dragAndDrop: true,
			resizable: true,
			title: 'Basic form inputs 5'
		});

		console.log('add widget from drag to:', gridster);
	}

	over(event) {
		const size = event.item.calculateSize(event.gridster);

		event.item.itemPrototype.$element.querySelector('.gridster-item-inner').style.width = size.width + 'px';
		event.item.itemPrototype.$element.querySelector('.gridster-item-inner').style.height = size.height + 'px';
		event.item.itemPrototype.$element.classList.add('is-over');
	}

	out(event) {
		event.item.itemPrototype.$element.querySelector('.gridster-item-inner').style.width = '';
		event.item.itemPrototype.$element.querySelector('.gridster-item-inner').style.height = '';
		event.item.itemPrototype.$element.classList.remove('is-over');
	}

	addWidgetWithoutData() {
		this.widgets.push({
			title: 'Basic form inputs X',
			dragAndDrop: true,
			resizable: true,
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
			'dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
			'commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ' +
			'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est ' +
			'laborum.'
		});
	}

	addWidget(gridster: GridsterComponent) {
		this.widgets.push({
			x: 4, y: 0, w: 1, h: 1,
			dragAndDrop: true,
			resizable: true,
			title: 'Basic form inputs 5',
			content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
			'dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea ' +
			'commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ' +
			'pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est ' +
			'laborum.'
		});
		console.log('widget push', this.widgets[this.widgets.length - 1]);
	}

	private _remove($event, index: number, gridster: GridsterComponent) {
		$event.preventDefault();
		this.widgets.splice(index, 1);
		console.log('widget remove', index);
	}

	private _getHeight(elemId: string): Number {
		//console.log('BAR CHART - elemId:', elemId);
		let configHeight = ($(window).height() - $('#' + elemId).position().top);
		//console.log('BAR CHART - config height:', configHeight);
		return configHeight;
	}

	private _guidGenerator(): string {
			let S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	private _debug(box: any): any {
		console.log('DASHBOARD COMPONENT - widgets', this.widgets);
	}
}
