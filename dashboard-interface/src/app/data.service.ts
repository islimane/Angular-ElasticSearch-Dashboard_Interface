import { Injectable } from '@angular/core';
//import { Headers, Http } from '@angular/http';

@Injectable()
export class DataService {

	getTitle(): string {
		return 'Elasticsearch Dashboard Interface';
	}

}
