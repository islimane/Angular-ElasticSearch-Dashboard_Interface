import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';

import { MetricsService } from './metrics.service';

import { maxValidator } from './shared/validators.directive';


@Component({
	selector: 'metrics',
	templateUrl: './metrics.html',
	providers: [ MetricsService ]
})

export class MetricsComponent implements OnChanges{
	@Input() index: string;

	form: FormGroup;
	formErrors = {
		'percentileBox': '',
		'percentileRanks': '',
		'topHits': ''
	};
	validationMessages = {
		'percentileBox': {
			'maxValue': 'Percentile value can\'t be greater tha 100.'
		},
		'percentileRanks': {},
		'topHits': {}
	};

	percentileValues: number[] = [];

	percentileRankValues: number[] = [];

	topHitAggregations: string[] = [
		'Concatenate',
		'Average',
		'Max',
		'Min',
		'Sum'
	];
	topHitFilteredAggregations: string[] = this.topHitAggregations;
	selectedTopHitAgg: string = this.topHitAggregations[0];
	selectedSortField: string = '';
	selectedTopHitField: string = '';
	hitsSize: number = 1;
	orders: string[] = ['desc', 'asc'];
	selectedOrder: string = this.orders[0];

	numFields: string[] = [];
	selectedNumField: string = '';

	textFields: string[] = [];
	selectedTextField: string = '';

	aggregationsArr: string[] = [
		'Count',
		'Average',
		'Sum',
		'Min',
		'Max',
		'Median',
		'Standard Deviation',
		'Unique Count',
		'Percentiles',
		'Percentile Ranks',
		'Top Hit'
	];
	selectedAggregation: string = this.aggregationsArr[0];
	numFieldAgg: string[] = [
		'Average', 'Sum', 'Min', 'Max', 'Median', 'Standard Deviation',
		'Unique Count', 'Percentiles', 'Percentile Ranks', 'Top Hit'
	];

	results: number[] = [0];

	constructor(
		public metricsService: MetricsService,
		private fb: FormBuilder
	) { }

	ngOnInit(): void{
		this.buildForm();
	}

	ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
		var previousValue = changes.index.previousValue;
		var currentValue = changes.index.currentValue;
		if(currentValue && previousValue!==currentValue){
			this.metricsService.getNumFields(this.index).then(numFields => {
				this.numFields = numFields;
				this.selectedNumField = this.numFields[0];
				this.selectedTopHitField = this.numFields[0];
			});

			this.metricsService.getTextFields(this.index).then(textFields => {
				this.textFields = textFields;
				this.selectedTextField = this.textFields[0];
				this.selectedSortField = this.textFields[0];
			});
		}
	}

	buildForm(): void {
		this.form = this.fb.group({
			'percentileBox': ['', [
					maxValidator(100)
				]
			],
			'percentileRanks': ['', []],
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

		if(this.textFields.indexOf(this.selectedTopHitField)!==-1){
			aggregations.push(this.topHitAggregations[0]);
		}else{
			for(var i=0; i<this.topHitAggregations.length; i++){
				aggregations.push(this.topHitAggregations[i]);
			}
		}

		this.topHitFilteredAggregations = aggregations;
		this.selectedTopHitAgg = this.topHitAggregations[0];
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

	addPercentileRank(value: string): void{
		console.log(value);
		var percentile = parseInt(value);
		if(!isNaN(percentile)){
			this.percentileRankValues = Array.from(
				new Set(this.percentileRankValues).add(percentile)
			).sort((a,b) => a - b);
		}
	}

	processCalculation(value): void{
		switch(this.selectedAggregation){
			case 'Count': {
				this.metricsService.count(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Average': {
				this.metricsService.avg(this.index, this.selectedNumField)
				.then();
				break;
			}
			case 'Sum': {
				this.metricsService.sum(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Min': {
				this.metricsService.min(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Max': {
				this.metricsService.max(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Median': {
				this.metricsService.median(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Standard Deviation': {
				this.metricsService.stdDeviation(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Unique Count': {
				this.metricsService.uniqueCount(this.index, this.selectedNumField)
				.then(results => this.results = results);
				break;
			}
			case 'Percentiles': {
				if(this.percentileValues.length>0)
					this.metricsService.percentiles(
						this.index,
						this.selectedNumField,
						this.percentileValues
					).then(results => this.results = results);
				break;
			}case 'Percentile Ranks':{
				if(this.percentileRankValues.length>0)
					this.metricsService.percentileRanks(
						this.index,
						this.selectedNumField,
						this.percentileRankValues
					).then(results => this.results = results);
				break;
			}case 'Top Hit':{
				if(this.hitsSize && this.hitsSize>0)
					this.metricsService.topHits(
						this.index,
						this.selectedTopHitField,
						this.selectedSortField,
						this.hitsSize,
						this.selectedOrder,
						this.selectedTopHitAgg
					).then(results => this.results = results);
				break;
			}
			default: {
				console.error('Error: aggeregation not found.');
				break;
			}
		}
	}

	isNumFieldAgg(): Boolean{
		//console.log(this.selectedAggregation);
		return (this.numFieldAgg.indexOf(this.selectedAggregation)>=0);
	}
}
