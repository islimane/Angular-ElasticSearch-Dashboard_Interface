import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/do';	// for debugging

import 'rxjs/add/operator/toPromise';

import { Client, SearchResponse, CountResponse } from 'elasticsearch';

@Injectable()
export class Elasticsearch {

	public clientElasticsearch: Client;

	constructor() {
		this.clientElasticsearch = new Client({
			host: 'localhost:9200',
			log: 'trace'
		});
	}

	public test_search(): Observable<SearchResponse<{}>> {
		return Observable.fromPromise(<Promise<SearchResponse<{}>>> this.clientElasticsearch.search( {
			index: '3entreprises',
			q: `Customer:0`
		}));
	}

	public count(index): PromiseLike<number> {
		return this.clientElasticsearch.count(
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

	public avg(index: string, field: string): PromiseLike<number>{
		return this.clientElasticsearch.search({
				"index": index,
				"body": {
						"size" : 0,
						"aggs" : {
								"avg_grade" : {
										"avg" : {
												"field": field
										}
								}
						}
				}
		})
		.then(
			response => response.aggregations.avg_grade.value,
			this.handleError
		);
	}

	private map(index): PromiseLike<any> {
		return this.clientElasticsearch.indices.getMapping(
			{
				index: index
			}
		)
		.then(
			response => response,
			this.handleError
		);
	}

	public getIndexNumFields(index): PromiseLike<string[]> {
		return this.map(index).then(function(response){
			var mappings = response[index].mappings;

			// this is beacause the mapping field is different for
			// each index, so we take the first field
			var props = mappings[Object.keys(mappings)[0]].properties;

			var numProps = [];
			console.log(props);
			for(var propName in props){
				if(['integer', 'long'].indexOf(props[propName].type)>=0){
					console.log(propName);
					numProps.push(propName);
				}
			}

			return numProps;
		});

	}

	public getIndices(): PromiseLike<string[]>{
		return this.clientElasticsearch.cat.indices({
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
