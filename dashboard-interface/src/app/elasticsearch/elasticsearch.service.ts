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

	request(index: string, aggs: AggregationData[]): PromiseLike<any> {
		console.log('METRICS SERVICE - request()');
		var body = bodybuilder().size(0);
		for(let i=0; i<aggs.length; i++){
			if(aggs[i].type!='count'){
				body = body.aggregation(
					aggs[i].type,
					null,
					aggs[i].id,
					this._getAggParams(aggs[i])
				);
			}
		}
		console.log(body.build());

		return this.cli.search({
				"index": index,
				"body": body.build()
		})
		.then(
			response => console.log(response.aggregations),
			this.handleError
		);
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

	public getSavedVisualizations(): PromiseLike<any> {
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

	public saveVisualization(visualizationObj: VisualizationObj): void{
		this._isNewVisualization(visualizationObj.title).then(isNew => {
			console.log('isNew:', isNew);
			(isNew) ? this._createVis(visualizationObj) : this._updateVis(visualizationObj);
		});
	}

	private _createVis(visualizationObj: VisualizationObj): void{
		let index= '.sakura';
		let type = 'visualization';
		let newId = visualizationObj.title;
		console.log('create:', newId)
		this.cli.create({
			index: '.sakura',
			type: 'visualization',
			id: newId,
			body: visualizationObj
		}).then(
			response => console.log('SUCCESS'),
			this.handleError
		);
	}

	private _updateVis(visualizationObj: VisualizationObj): void{
		let index= '.sakura';
		let type = 'visualization';
		let id = visualizationObj.title;
		console.log('update:', id)
		this.cli.update({
			index: '.sakura',
			type: 'visualization',
			id: id,
			body: {
				doc: visualizationObj
			}
		}).then(
			response => console.log('SUCCESS'),
			this.handleError
		);
	}

	private _isNewVisualization(title: string): PromiseLike<boolean> {
		let body = bodybuilder().filter('term', '_id', title).build();
		console.log('body:', body);

		return this.cli.search({
				"index": '.sakura',
				"type": 'visualization',
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
