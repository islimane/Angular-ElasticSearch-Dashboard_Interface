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

}
