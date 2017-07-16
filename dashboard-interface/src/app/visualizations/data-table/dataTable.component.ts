import { Component, Input, ViewChild, SimpleChange } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricComponent } from '../metrics/metric.component';

import { minValidator } from '../../shared/validators.directive';

@Component({
	selector: 'data-table',
	templateUrl: './dataTable.component.html'
})

export class DataTableComponent {
	@ViewChild(MetricComponent)
	private metricComponent: MetricComponent

	@Input() index: string;
	@Input() numFields: string[] = [];

	results: any[] = [];
	columns: string[] = []
	rows: string[][] = [];

	aggregations: string[] = [
		'Date Histogram',
		'Histogram',
		'Range',
		'Date Range',
		'IPv4 Range',
		'Terms',
		'Filters',
		'Significant Terms',
		'Geohash'
	];
	selectedAgg: string = this.aggregations[2];

	selectedNumField: string;

	interval: number = null;

	form: FormGroup;
	formErrors = {
		'naturalNumber': ''
	};
	validationMessages = {
		'naturalNumber': {
			'minValue': 'Percentile value can\'t be lower than 0.'
		}
	};

	ranges: any[] = [];

	constructor(
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		this.buildForm();
	}

	// onResultChange(results): void{
	// 	this.resetTable();
	// 	console.log('results:', results);
	// 	this.results = results;
	// 	for(var i=0; i<this.results.length; i++){
	// 		console.log(this.results[i]);
	// 		this.columns.push(this.results[i].label);
	// 		for(var k=0; k<this.results[i].result.length; k++){
	// 			if(!this.rows[k])
	// 				this.rows[k] = [];
	// 			this.rows[k].push(this.results[i].result[k]);
	// 		}
	// 	}
	// }

	onResultChange(tableData): void{
		this.resetTable();
		console.log('results:', tableData);
		this.columns = tableData.columns;
		this.rows = tableData.rows;
	}

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		console.log('changes.numFields:', changes.numFields);
		var oldNumFields = (changes.numFields) ? changes.numFields.previousValue : '';
		var newNumFields = (changes.numFields) ? changes.numFields.currentValue : '';
		console.log('oldNumFields:', oldNumFields);
		console.log('newNumFields:', newNumFields);
		if(newNumFields && oldNumFields!==newNumFields){
			this.selectedNumField = (this.numFields.length) ? this.numFields[0] : '';
		}
	}

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

	calculate(): void{
		console.log('CALCULATE - interval:', this.interval);
		var dataTableData = this.getDataTableData();
		this.metricComponent.processCalculation(dataTableData);
	}

	resetTable(): void{
		this.columns = [];
		this.rows = [];
	}

	onIntervalChange(value: number): void {
		this.interval = value;
		console.log(this.interval);
	}

	addRange(): void {
		this.ranges.push({
			from: 0,
			to: 0
		});
	}

	removeRange(index: number): void {
		this.ranges.splice(index, 1);
	}

	private getDataTableData(): any {
		switch (this.selectedAgg) {
			case 'Histogram':
				return {
					name: this.selectedAgg,
					field: this.selectedNumField,
					interval: this.interval
				};
			case 'Range':
				return {
					name: this.selectedAgg,
					field: this.selectedNumField,
					ranges: this.ranges
				};
			default:
				return null;
		}
	}
}
