import { Component, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from '../metrics.service';

import { maxValidator } from '../shared/validators.directive';

@Component({
	selector: 'topHit-metric',
	templateUrl: './topHitMetric.component.html',
	providers: [ MetricsService ]
})

export class TopHitMetricComponent {
	@Input() index: string;
	@Input() numFields: string[];
	@Output() resultsEvent = new EventEmitter<number[]>();

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
	topHitFilteredAggregations: string[] = this.topHitAggregations;
	selectedTopHitAgg: string = this.topHitAggregations[0];

	hitsSize: number = 1;

	orders: string[] = ['desc', 'asc'];
	selectedOrder: string = this.orders[0];

	selectedField: string;
	selectedSortField: string = '';
	textFields: string[] = [];

	constructor(
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		console.log('numFields', this.numFields);
		this.buildForm();
	}

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		var indexPreviousValue = (changes.index) ? changes.index.previousValue : null;
		var indexCurrentValue = (changes.index) ? changes.index.currentValue : null;
		if(indexCurrentValue && indexPreviousValue!==indexCurrentValue){
			console.log('changes.index.previousValue', changes.index.previousValue);
			console.log('changes.index.currentValue', changes.index.currentValue);
			this.metricsService.getTextFields(this.index).then(textFields => {
				this.textFields = textFields;
				this.selectedField = this.textFields[0];
				this.selectedSortField = this.textFields[0];
			});
		}

		var numFieldsPreviousValue = (changes.numFields) ? changes.numFields.previousValue : null;
		var numFieldsCurrentValue = (changes.numFields) ? changes.numFields.currentValue : null;
		if(numFieldsCurrentValue && numFieldsPreviousValue!==numFieldsCurrentValue){
			console.log('changes.numFields.previousValue', changes.numFields.previousValue);
			console.log('changes.numFields.currentValue', changes.numFields.currentValue);
			this.selectedField = this.numFields[0];
		}
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

	setAggregations(): void{
		var aggregations = [];

		if(this.textFields.indexOf(this.selectedField)!==-1){
			aggregations.push(this.topHitAggregations[0]);
		}else{
			for(var i=0; i<this.topHitAggregations.length; i++){
				aggregations.push(this.topHitAggregations[i]);
			}
		}

		this.topHitFilteredAggregations = aggregations;
		this.selectedTopHitAgg = this.topHitAggregations[0];
	}

	calculate(dataTableData: any): void {
		if(this.hitsSize && this.hitsSize>0){
			this.metricsService.topHits(
				this.index,
				this.selectedField,
				this.selectedSortField,
				this.hitsSize,
				this.selectedOrder,
				this.selectedTopHitAgg,
        dataTableData
			).then(results => {
				this.resultsEvent.emit(results);
			});
		}
	}

	debug(): void{
		console.log(this.numFields);
	}

}
