import { Injectable } from '@angular/core';
//import { Headers, Http } from '@angular/http';

@Injectable()
export class DataService {
	/*var elasticsearch = require('elasticsearch');
	var client = new elasticsearch.Client({
		host: 'localhost:9200',
		log: 'trace'
	});*/

	getTitle(): string {
		return 'HI WORLD';
	}
		/*client.ping({
			requestTimeout: 30000,
		}, function (error) {
			if (error) {
				console.error('elasticsearch cluster is down!');
			} else {
				console.log('All is well');
			}
		});*/

		//retutn 'OK';
	//}

	getData(): any {

	}
}
