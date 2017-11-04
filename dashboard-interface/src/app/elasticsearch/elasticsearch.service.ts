import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { AggregationData } from '../object-classes/aggregationData';
import { VisualizationObj } from '../object-classes/visualizationObj';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/do';	// for debugging

import 'rxjs/add/operator/toPromise';

import { Client, SearchResponse, CountResponse } from 'elasticsearch';

//import { bodybuilder } from "bodybuilder";

declare let bodybuilder: any;

@Injectable()
export class Elasticsearch {

	public cli: Client;

	constructor() {
		this.cli = new Client({
			host: 'localhost:9200',
			log: 'trace'
		});
	}

	//request(index: string, aggs: AggregationData[], buckets: AggregationData[]): PromiseLike<any> {
	request(index: string, body: any): PromiseLike<any> {
		console.log('METRICS SERVICE - request()');
		console.log('METRICS SERVICE - body:', body);
		/*let body = this._buildAggsBody(aggs);

		// If there is some bucket
		if(buckets) body = this._buildBucketsBody(buckets, body);

		console.log('ELASTICSEARCH - request() - body:', body.build());*/

		return this.cli.search({
				"index": index,
				"body": body.size(0).build()
		}).then(
			response => response,
			this.handleError
		);
	}

	getAggsBody(aggs: AggregationData[]): any{
		return this._getAggsBody(aggs);
	}

	private _getAggsBody(aggs: AggregationData[]): any{
		let body = bodybuilder();
		for(let i=0; i<aggs.length; i++){
			if(aggs[i].type!='count'){
					body = body.aggregation(
						this._getAggType(aggs[i]),
						null,
						aggs[i].id,
						this._getAggParams(aggs[i])
				);
			}
		}
		return body;
	}

	getAggType(agg: AggregationData): any {
		return this._getAggType(agg);
	}

	private _getAggType(agg: AggregationData): any {
		if(agg.type=='median'){
			return 'percentiles';
		}else{
			return agg.type;
		}
	}

	getAggParams(agg: AggregationData): any {
		return this._getAggParams(agg);
	}

	private _getAggParams(agg: AggregationData): any {
		if(agg.type=='top_hits'){
			let params = {
				_source: agg.params.field,
				size: agg.params.size,
				sort: []
			}
			let sort = {};
			sort[agg.params.sortField] = {
				"order": agg.params.sortOrder
			}
			params.sort.push(sort);
			return params;
		}else{
			return agg.params;
		}
	}

	getSavedDashboards(): PromiseLike<any> {
		return this.cli.search({
				"index": '.sakura',
				"type": 'dashboard',
				"body": {
					"query": {
						"match_all": {}
					}
				}
		}).then(
			response => response.hits.hits,
			this.handleError
		);
	}

	getSavedVisualizations(): PromiseLike<any> {
		return this.cli.search({
				"index": '.sakura',
				"type": 'visualization',
				"body": {
					"query": {
						"match_all": {}
					}
				}
		}).then(
			response => response.hits.hits,
			this.handleError
		);
	}

	saveDashboard(dashboardObj: any): PromiseLike<any>{
		console.log('ELASTICSEARCH - SERVICE - saveDashboard()');
		return this._isNewDocument('dashboard', dashboardObj.title).then(isNew => {
			console.log('ELASTICSEARCH - SERVICE - isNew:', isNew);
			if(isNew)
				return this._createDoc('dashboard', dashboardObj.title, dashboardObj);
			else
				return this._updateDoc('dashboard', dashboardObj.title, dashboardObj);
		});
	}

	saveVisualization(visualizationObj: VisualizationObj): PromiseLike<any>{
		console.log('ELASTICSEARCH - SERVICE - saveVisualization()');
		return this._isNewDocument('visualization', visualizationObj.title).then(isNew => {
			console.log('ELASTICSEARCH - SERVICE - isNew:', isNew);
			if(isNew)
				return this._createDoc('visualization', visualizationObj.title, visualizationObj);
			else
				return this._updateDoc('visualization', visualizationObj.title, visualizationObj);
		});
	}

	private _createDoc(type: string, id: string, body: any): PromiseLike<any>{
		console.log('ELASTICSEARCH - SERVICE - _createDoc()');
		console.log('ELASTICSEARCH - SERVICE - type:', type);
		console.log('ELASTICSEARCH - SERVICE - id:', id);
		console.log('ELASTICSEARCH - SERVICE - body:', body);
		let index = '.sakura';
		return this.cli.create({
			index: index,
			type: type,
			id: id,
			body: body
		}).then(
			response => console.log('ELASTICSEARCH - SERVICE - CREATE SUCCESS'),
			this.handleError
		);
	}

	deleteDoc(type: string, id: string): PromiseLike<any>{
		console.log('ELASTICSEARCH - SERVICE - _deleteDoc()');
		console.log('ELASTICSEARCH - SERVICE - type:', type);
		console.log('ELASTICSEARCH - SERVICE - id:', id);
		let index = '.sakura';
		return this.cli.delete({
			index: index,
			type: type,
			id: id,
			refresh: 'wait_for'
		}).then(
			response => console.log('ELASTICSEARCH - SERVICE - DELETE SUCCESS'),
			this.handleError
		);
	}

	private _updateDoc(type: string, id: string, doc: any): PromiseLike<any>{
		console.log('ELASTICSEARCH - SERVICE - _updateDoc()');
		console.log('ELASTICSEARCH - SERVICE - type:', type);
		console.log('ELASTICSEARCH - SERVICE - id:', id);
		console.log('ELASTICSEARCH - SERVICE - doc:', doc);
			let index= '.sakura';
		return this.cli.update({
			index: '.sakura',
			type: type,
			id: id,
			body: {
				doc: doc
			}
		}).then(
			response => console.log('SUCCESS'),
			this.handleError
		);
	}

	private _isNewDocument(type: string, title: string): PromiseLike<boolean> {
		let body = bodybuilder().filter('term', '_id', title).build();
		console.log('body:', body);

		return this.cli.search({
				"index": '.sakura',
				"type": type,
				"body": body
		}).then(function(response){
			console.log('response:', response)
			let isNew = (response.hits.hits.length===0) ? true : false;
			return isNew;
		},
			this.handleError
		);
	}

	public count(index): PromiseLike<any> {
		return this.cli.count(
			{
				index: index
			}
		)
		.then(
			response => response.count,
			this.handleError
		);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

	// avg, sum, min, max, median, std_deviation, unique_count
	public numFieldCalculation(
		index: string,
		aggs: any): PromiseLike<any>{

		return this.cli.search({
				"index": index,
				"body": {
						"size" : 0,
						"aggs" : aggs
				}
		})
		.then(
			response => response.aggregations,
			this.handleError
		);
	}

	private map(index): PromiseLike<any> {
		return this.cli.indices.getMapping(
			{
				index: index
			}
		)
		.then(
			response => response,
			this.handleError
		);
	}

	// TODO: combine all get fields functions just passing field types
	getAllFields(index): PromiseLike<any> {
		return this.map(index).then(function(response){
			var mappings = response[index].mappings;

			// this is beacause the mapping field is different for
			// each index, so we take the first field
			var props = mappings[Object.keys(mappings)[0]].properties;

			return props;
		});
	}

	public getIndexNumFields(index): PromiseLike<string[]> {
		return this.map(index).then(function(response){
			var mappings = response[index].mappings;

			// this is beacause the mapping field is different for
			// each index, so we take the first field
			var props = mappings[Object.keys(mappings)[0]].properties;

			var numProps = [];
			//console.log(props);
			console.log(mappings);
			for(var propName in props){
				if(['integer', 'long'].indexOf(props[propName].type)>=0){
					//console.log(propName);
					numProps.push(propName);
				}
			}

			return numProps;
		});
	}

	public getIndexTextFields(index): PromiseLike<string[]> {
		return this.map(index).then(function(response){
			var mappings = response[index].mappings;

			// this is beacause the mapping field is different for
			// each index, so we take the first field
			var props = mappings[Object.keys(mappings)[0]].properties;

			var textProps = [];
			//console.log(props);
			console.log(mappings);
			for(var propName in props){
				if(['text'].indexOf(props[propName].type)>=0){
					//console.log(propName);
					textProps.push(propName);
				}
			}

			console.log('textProps:', textProps);
			return textProps;
		});
	}

	public getIndices(): PromiseLike<string[]>{
		return this.cli.cat.indices({
			format: 'json'
		})
		.then(function(indexObjArray){
				var indices = []

				console.log(indexObjArray);
				for(var i=0; i<indexObjArray.length; i++){
					console.log(indexObjArray[i].index);
					indices.push(indexObjArray[i].index);
				}
				console.log('indices:', indices);

				return indices;
		});
	}

}
