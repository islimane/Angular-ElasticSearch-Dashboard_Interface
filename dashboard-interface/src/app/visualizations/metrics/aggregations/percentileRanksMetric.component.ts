import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from '../metrics.service';

import { maxValidator } from '../../../shared/validators.directive';

@Component({
	selector: 'percentileRanks-metric',
	templateUrl: './percentileRanksMetric.component.html',
	providers: [ MetricsService ]
})

export class PercentileRanksMetricComponent {
	@Input() numField: string = '';
	@Input() savedData: any = null;
	@Output() resultsEvent = new EventEmitter<number[]>();

	form: FormGroup;
	formErrors = {
		'percentileRanks': ''
	};
	validationMessages = {
		'percentileRanks': {}
	};

	percentileRankValues: number[] = [];

	constructor(
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		console.log(this.metricsService);
		this.buildForm();
		if(this.savedData && this.savedData.params){
			this.loadSavedData();
		}
	}

	loadSavedData(): void {
		this.percentileRankValues = this.savedData.params.values;
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
	}

}
