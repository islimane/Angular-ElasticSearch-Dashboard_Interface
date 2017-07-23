import { Injectable } from '@angular/core';
import { Subject }	from 'rxjs/Subject';

import { AggregationData } from '../object-classes/aggregationData';


/*
	The reason why numFieldsSent and textFieldsSent observables are necessary
	is becasuse the angular 2 livecycle hook order is problematic with fields
	update syncrhonization on visualizations children.
*/

@Injectable()
export class VisualizationsService {

	// Observable sources
	private numFieldsSource = new Subject<string[]>();
	private textFieldsSource = new Subject<string[]>();
	private aggsSource = new Subject<AggregationData[]>();

	// Observable streams
	numFieldsSent$ = this.numFieldsSource.asObservable();
	textFieldsSent$ = this.textFieldsSource.asObservable();
	aggsSent$ = this.aggsSource.asObservable();

	// Service fields commands
	sendNumFields(numFields: string[]) {
		console.log('VISUALIZATIONS SERVICE - SEND - sendNumFields:', numFields);
		this.numFieldsSource.next(numFields);
	}

	sendTextFields(textFields: string[]) {
		console.log('VISUALIZATIONS SERVICE - SEND - sendTextFiedls:', textFields);
		this.textFieldsSource.next(textFields);
	}

	loadVis(aggs: AggregationData[]) {
		console.log('VISUALIZATIONS SERVICE - SEND - loadVis:', aggs);
		this.aggsSource.next(aggs);
	}
}
