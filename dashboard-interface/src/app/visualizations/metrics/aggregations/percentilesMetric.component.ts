import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from '../metrics.service';

import { maxValidator } from '../../../shared/validators.directive';

@Component({
	selector: 'percentiles-metric',
	templateUrl: './percentilesMetric.component.html',
	providers: [ MetricsService ]
})

export class PercentilesMetricComponent {
	@Input() index: string;
	@Input() numField: string = '';
	@Input() savedData: any = null;
	@Output() resultsEvent = new EventEmitter<number[]>();

	form: FormGroup;
	formErrors = {
		'percentileBox': ''
	};
	validationMessages = {
		'percentileBox': {
			'maxValue': 'Percentile value can\'t be greater tha 100.'
		}
	};

	percentileValues: number[] = [];

	constructor(
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		this.buildForm();
		console.log('savedData:', this.savedData);
		if(this.savedData && this.savedData.params){
			this.loadSavedData();
		}
	}

	loadSavedData(): void {
		console.log(3);
		this.percentileValues = this.savedData.params.percents;
	}

	buildForm(): void {
		this.form = this.fb.group({
			'percentileBox': ['', [ maxValidator(100) ] ]
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

	addPercentile(value: string): void{
		console.log(value);
		var percentile = parseInt(value);
		if(!isNaN(percentile)){
			this.percentileValues = Array.from(
				new Set(this.percentileValues).add(percentile)
			).sort((a,b) => a - b);
		}
	}

}
