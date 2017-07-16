import { Injectable } from '@angular/core';
import { Subject }	from 'rxjs/Subject';

/*
	The reason why numFieldsSent and textFieldsSent observables are necessary
	is becasuse the angular 2 livecycle hook order is problematic with fields
	update syncrhonization on visualizations children.
*/

@Injectable()
export class VisualizationsService {

	// Observable string sources
	private numFieldsSource = new Subject<string[]>();
	private textFieldsSource = new Subject<string[]>();

	// Observable string streams
	numFieldsSent$ = this.numFieldsSource.asObservable();
	textFieldsSent$ = this.textFieldsSource.asObservable();

	// Service fields commands
	sendNumFields(numFields: string[]) {
		console.log('SEND - sendNumFields:', numFields);
		this.numFieldsSource.next(numFields);
	}

	sendTextFields(textFields: string[]) {
		console.log('SEND - sendTextFiedls:', textFields);
		this.textFieldsSource.next(textFields);
	}
}
