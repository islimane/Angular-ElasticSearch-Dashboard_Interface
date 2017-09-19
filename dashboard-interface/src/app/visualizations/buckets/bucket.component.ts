import { Component, Input, Output, SimpleChange, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { AggregationData } from '../../object-classes/aggregationData';

import { minValidator } from '../../shared/validators.directive';

@Component({
	selector: 'bucket',
	templateUrl: './bucket.component.html',
	styleUrls: ['./bucket.component.scss']
})

export class BucketComponent {
	@Output() dataChange = new EventEmitter<AggregationData>();
	@Output() remove = new EventEmitter<any>();

	private _numFields: string[] = [];
	@Input() set numFields(numFields: string[]) {
		console.log('BUCKET - numFields:', numFields);
		this._numFields = numFields;
		if(numFields && numFields.length>0)
			this._selectedNumField = numFields[0];
	};
	private _selectedNumField: string;

	private _savedData: any = null;
	@Input() set savedData(savedData: any) {
		console.log('METRIC - SET - savedData');
		this._savedData = savedData;
		if(savedData) this._loadSavedBucket(savedData);
	};

	private _aggregations: any[] = [
		//{ label: 'Date Histogram', value: 'date_histogram'},
		{ label: 'Histogram', value: 'histogram'},
		{ label: 'Range', value: 'range'},
		//{ label: 'Date Range', value: 'date_range'},
		//{ label: 'IPv4 Range', value: 'ipv4_range'},
		//{ label: 'Terms', value: 'terms'},
		//{ label: 'Filters', value: 'filters'},
		//{ label: 'Significant Terms', value: 'sig_terms'},
		//{ label: 'Geohash', value: 'geo'}
	];
	private _selectedAgg: string = this._aggregations[0].value;

	interval: number = null;
	ranges: any[] = [];

	form: FormGroup;
	formErrors = {
		'naturalNumber': ''
	};
	validationMessages = {
		'naturalNumber': {
			'minValue': 'Percentile value can\'t be lower than 0.'
		}
	};


	constructor( private fb: FormBuilder ) {}

	ngOnInit(): void{
		console.log('BUCKET - ngOnInit()');
		this.buildForm();
	}

	triggerRemoveEvent(): void {
		this.remove.emit();
	}

	dataChangeEvent(): void {
		console.log('BUCKET - dataChangeEvent()');
		let aggregationData = this.getAggregationData();
		console.log('BUCKET - aggregationData:', aggregationData);
		if(aggregationData.params){
			this.dataChange.emit(aggregationData);
		}
	}

	private _loadSavedBucket(bucket: AggregationData): void {
		console.log('BUCKET - _loadSavedBucket():', bucket);
		this._selectedAgg = bucket.type;
		this._selectedNumField = bucket.params.field;
		this.interval = bucket.params.interval || null;
		this.ranges = bucket.params.ranges || [];
	}

	getAggregationData(): AggregationData {
		var aggregationData = new AggregationData();
		aggregationData.enabled = true;
		aggregationData.type = this._selectedAgg;
		aggregationData.schema = 'metric';
		aggregationData.params = this.getAggParams();

		return aggregationData;
	}

	getAggParams(): any {
		switch (this._selectedAgg){
			case 'histogram':
				return {
					field: this._selectedNumField,
					interval: this.interval
				};
			case 'range':
				return {
					field: this._selectedNumField,
					ranges: this.ranges
				};
			default:
				return null;
		}
	}

	// AGGREGATIONS CODE
	addRange(): void {
		this.ranges.push({
			from: 0,
			to: 0
		});
	}

	removeRange(index: number): void {
		this.ranges.splice(index, 1);
	}

	// FORM CODE

	buildForm(): void {
		this.form = this.fb.group({
			'naturalNumber': ['', [
					minValidator(0)
				]
			]
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
}
