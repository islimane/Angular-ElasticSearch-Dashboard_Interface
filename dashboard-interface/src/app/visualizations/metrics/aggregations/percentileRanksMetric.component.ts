import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { maxValidator } from '../../../shared/validators.directive';

@Component({
	selector: 'percentileRanks-metric',
	templateUrl: './percentileRanksMetric.component.html',
	styleUrls: ['./percentileRanksMetric.component.scss']
})

export class PercentileRanksMetricComponent {
	@Output() dataChange = new EventEmitter<any>();

	private _savedData: any = null;
	@Input() set savedData(savedData: any) {
		console.log('PERCENTILERANKS - SET savedData:', savedData);
		this._savedData = savedData;
		if(this._savedData && savedData.type==='percentile_ranks'){
			this.percentileRankValues = this._savedData.params.values;
		}
	}

	form: FormGroup;
	formErrors = {
		'percentileRanks': ''
	};
	validationMessages = {
		'percentileRanks': {}
	};

	percentileRankValues: number[] = [];

	constructor( private fb: FormBuilder ) { }

	ngOnInit(): void {
		console.log('PERCENTILE RANKS - ngOnInit()');
		this.buildForm();
		if(!this._savedData)
			this.dataChange.emit();
	}

	dataChangeEvent(): void {
		this.dataChange.emit();
	}

	buildForm(): void {
		this.form = this.fb.group({
			'percentileRanks': ['', []]
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

	addPercentileRank(value: string): void{
		console.log(value);
		var percentile = parseInt(value);
		if(!isNaN(percentile)){
			this.percentileRankValues = Array.from(
				new Set(this.percentileRankValues).add(percentile)
			).sort((a,b) => a - b);
		}
		this.dataChangeEvent();
	}

}
