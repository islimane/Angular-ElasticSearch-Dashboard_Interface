import { Component, Input, Output, ViewChild } from '@angular/core';
import { BucketComponent } from './bucket.component';
import { DynamicComponent } from '../../shared/dynamicComponent.component';

import { VisualizationState } from '../../object-classes/visualizationState';
import { AggregationData } from '../../object-classes/aggregationData';
import { SearchSourceJSON } from '../../object-classes/searchSourceJSON';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { VisualizationsService } from '../visualizations.service';

import { Subscription } from 'rxjs/Subscription';


@Component({
	selector: 'buckets',
	templateUrl: './buckets.component.html',
	styleUrls: ['./buckets.component.scss']
})


export class BucketsComponent {
	@ViewChild(DynamicComponent) dynamicComponents;

	@Input() index: string;

	// This fields come from _visualizationsService
	numFields: string[] = [];
	textFields: string[] = [];

	subscriptions: Subscription[] = [];

	bucketEvents: Array<string> = [ 'remove', 'dataChange' ];
	bucketsMap: Map<string, AggregationData> = new Map<string, AggregationData>();

	constructor(
		private _visualizationsService: VisualizationsService
	) {
		let sub1 = _visualizationsService.numFieldsSent$.subscribe(numFields => {
			console.log('BUCKETS - RECIEVED - numFields:', numFields);
			this.numFields = numFields;
			if(numFields) this.updateBucketsInputs();
		})

		let sub2 = _visualizationsService.textFieldsSent$.subscribe(textFields => {
			console.log('BUCKETS - RECIEVED - textFields:', textFields);
			this.textFields = textFields;
			if(textFields) this.updateBucketsInputs();
		})

		this.subscriptions.push(sub1, sub2);
	}

	onEvent(event): void {
		console.log('event:', event);
		switch(event.name){
			case 'dataChange':
				this.onDataChange(event.uniqueId, event.data);
				break;
			case 'remove':
				this._removeBucket(event.uniqueId);
				break;
			default:
				console.error('ERROR: event name [' + event.name + '] not found.');
		}
	}

	onDataChange(uniqueId: string, data: any): void {
		console.log('DATA CHANGE FOR BUCKET:', uniqueId);
		console.log('DATA:', data);

		this.bucketsMap.set(uniqueId, data);
	}

	ngOnDestroy() {
		for(let i=0; i<this.subscriptions.length; i++){
			// prevent memory leak when component destroyed
			this.subscriptions[i].unsubscribe();
		}
	}

	getAggs(): AggregationData[] {
		this._setBucketIds();
		return Array.from(this.bucketsMap.values());
	}

	updateBucketsInputs(): void {
		console.log('BUCKETS - updateBucketsInputs()');
		this.bucketsMap.forEach((value, key, map) => {
			let inputs = {
				numFields: this.numFields
			}

			this.dynamicComponents.setInputs(key, inputs);
		});
	}

	loadBuckets(aggs: AggregationData[]): void {
		console.log('BUCKETS - loadSavedBuckets():', aggs);
		this._removeAll();
		for(let i=0; i<aggs.length; i++){
			this._addBucket(aggs[i]);
		}
	}

	private _addBucket(agg: AggregationData): void {
		let inputs = {
			numFields: this.numFields
		};

		let uniqueId = this._guidGenerator();

		let newBucketCmp = this.dynamicComponents.addComponent(
			uniqueId,
			inputs,
			this.bucketEvents,
			BucketComponent
		);

		// update bucket data with saved data
		if(agg) this.dynamicComponents.setInputs(uniqueId, { savedData: agg });

		this.bucketsMap.set(uniqueId, newBucketCmp.getAggregationData());
	}

	private _removeBucket(uniqueId: string){
		console.log('REMOVE:', uniqueId);
		this.dynamicComponents.destroyCmp(uniqueId);
		this.bucketsMap.delete(uniqueId);
	}

	private _removeAll(): void {
		this.bucketsMap.forEach((value, key, map) => {
			this.dynamicComponents.destroyCmp(key);
			this.bucketsMap.delete(key);
		});
	}

	private _setBucketIds(): void {
		let i = 0;
		this.bucketsMap.forEach((value, key, map) => {
			i++;
			value.id = 'bucket_' + i;
		});
	}

	private _guidGenerator(): string {
			var S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	debug(): void {
		console.log('%c DEBUG', 'background: #222; color: #bada55');
		console.log('%c bucketsMap', 'background: #222; color: #bada55', this.bucketsMap);
		console.log('%c buckets', 'background: #222; color: #bada55', Array.from(this.bucketsMap.values()));
	}
}
