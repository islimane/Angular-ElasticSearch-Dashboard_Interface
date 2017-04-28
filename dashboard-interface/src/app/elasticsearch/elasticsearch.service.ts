import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/do';	// for debugging
import { Client, SearchResponse } from 'elasticsearch';

@Injectable()
export class Elasticsearch {
	private clientElasticsearch: Client;
	constructor() {
		this.clientElasticsearch = new Client({
				host: 'http://localhost:9200',
				log: 'trace'
			});
	}

	public test_search(): Observable<SearchResponse<{}>> {
		return Observable.fromPromise(<Promise<SearchResponse<{}>>> this.clientElasticsearch.search( {
			index: '3entreprises',
			q: `Customer:0`
		}));
	}

	public ping(): void {
		this.clientElasticsearch.ping({
			requestTimeout: 30000,
		}, function (error) {
			if (error) {
				console.error('elasticsearch cluster is down!');
			} else {
				console.log('All is well');
			}
		});
	}

}
