import { Injectable } from '@angular/core';

import { Elasticsearch } from './elasticsearch';

@Injectable()
export class MetricsService {

	constructor(
		public elasticsearch: Elasticsearch
	) { }

	getNumFields(index: string): PromiseLike<string[]> {
		return this.elasticsearch.getIndexNumFields(index)
		.then(numFields => numFields);
	}

	count(index: string, selectedNumField: string): PromiseLike<number[]> {
		console.log('this.elasticsearch', this.elasticsearch);
		return this.elasticsearch.count(index)
		.then(count => [count]);
	}

	avg(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'avg':{'field':selectedNumField}
				}
			})
			.then(aggregations => [aggregations.result.value]);
		}
	}

	sum(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'sum':{'field':selectedNumField}
				}
			})
			.then(aggregations => [aggregations.result.value]);
		}
	}

	min(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'min':{'field':selectedNumField}
				}
			})
			.then(aggregations => [aggregations.result.value]);
		}
	}

	max(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'max':{'field':selectedNumField}
				}
			})
			.then(aggregations => [aggregations.result.value]);
		}
	}

	median(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'percentiles':
						{
							'field':selectedNumField,
							'percents': [50]
						}
			}})
			.then(aggregations =>
				[aggregations.result.values['50.0']]
			);
		}
	}

	stdDeviation(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {
					'grades_stats': {
						'extended_stats':
							{
								'field':selectedNumField,
								'sigma': 2
							}
					}
			})
			.then(aggregations =>
				[
					aggregations.grades_stats.std_deviation_bounds.lower,
					aggregations.grades_stats.std_deviation_bounds.upper
				]
			);
		}
	}

	uniqueCount(index: string, selectedNumField: string): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {'result': {
					'cardinality':{'field':selectedNumField}
				}
			})
			.then(aggregations => [aggregations.result.value]);
		}
	}
}
