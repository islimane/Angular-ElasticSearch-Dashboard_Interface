import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from '../metrics.service';

import { maxValidator } from '../shared/validators.directive';

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
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		console.log(this.metricsService);
		this.buildForm();
		console.log(1);
		console.log('savedData:', this.savedData);
		if(this.savedData!==null){
			console.log(2);
			this.loadSavedData();
		}
	}

	loadSavedData(): void {
		console.log(3);
		this.percentileValues = this.savedData.params.percents;
		this.calculate(null);
	}

	buildForm(): void {
		this.form = this.fb.group({
			'percentileBox': ['', [
					maxValidator(100)
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

	addPercentile(value: string): void{
		console.log(value);
		var percentile = parseInt(value);
		if(!isNaN(percentile)){
			this.percentileValues = Array.from(
				new Set(this.percentileValues).add(percentile)
			).sort((a,b) => a - b);
		}
	}

	calculate(dataTableData: any): void {
		if(this.percentileValues.length>0 && this.index && this.numField)
			this.metricsService.percentiles(
				this.index,
				this.numField,
				this.percentileValues,
				dataTableData
			).then(results => {
				this.resultsEvent.emit(results);
			});
		}

}
