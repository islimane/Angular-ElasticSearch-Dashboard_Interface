import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { FormGroup, FormBuilder} from '@angular/forms';

import { maxValidator } from '../../../shared/validators.directive';

import * as _ from "lodash";

@Component({
	selector: 'topHit-metric',
	templateUrl: './topHitMetric.component.html'
})

export class TopHitMetricComponent {
	private _selectedFieldData: any = {
		field: '',
		isTextField: false
	}
	@Input() set selectedFieldData(selectedFieldData: any) {
		this._selectedFieldData = selectedFieldData;
		this._aggsToDisplay = this.topHitAggregations.filter((agg) => this.isValidAgg(agg));
		if(this._aggsToDisplay.length===1)
			this.selectedTopHitAgg = this._aggsToDisplay[0];
	};
	@Input() savedData: any = null;
	private _fields: string[] = [];
	@Input() set fields(fields: string[]) {
		if(!_.isEqual(fields,this._fields)){
			this.selectedSortField = fields[0];
		}
		this._fields = fields;
	};
	@Output() dataChange = new EventEmitter<any>();

	form: FormGroup;
	formErrors = {
		'topHits': ''
	};
	validationMessages = {
		'topHits': {}
	};

	topHitAggregations: string[] = [
		'Concatenate',
		'Average',
		'Max',
		'Min',
		'Sum'
	];
	private _aggsToDisplay: string[] = this.topHitAggregations;
	selectedTopHitAgg: string = this._aggsToDisplay[0];

	hitsSize: number = 1;

	orders: string[] = ['desc', 'asc'];
	selectedOrder: string = this.orders[0];

	selectedSortField: string = (this._fields) ? this._fields[0] : '';


	constructor(
		private fb: FormBuilder
	) {}

	ngOnInit(): void{
		console.log('TOP HIT METRIC - ngOnInit()');
		this.buildForm();
		console.log('savedData:', this.savedData);
		if(!this.savedData)
			this.dataChange.emit();
	}

	dataChangeEvent(): void {
		this.dataChange.emit();
	}

	buildForm(): void {
		this.form = this.fb.group({
			'topHits': ['', []]
		});

		this.form.valueChanges
			.subscribe(data => this.onValueChanged(data));

		this.onValueChanged(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.form) { return; }
		const form = this.form;

		for (const field in this.formErrors) {
			// clear previous error message (if any)
			this.formErrors[field] = '';
			const control = form.get(field);

			if (control && control.dirty && !control.valid) {
				const messages = this.validationMessages[field];
				for (const key in control.errors) {
					this.formErrors[field] += messages[key] + ' ';
				}
			}
		}
	}

	isValidAgg(agg: string){
		if(!this._selectedFieldData.isTextField || agg==='Concatenate')
			return true;

		return false;
	}

	debug(): void{
		console.log('selectedFieldData:', this._selectedFieldData);
	}

}
