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

	getTextFields(index: string): PromiseLike<string[]> {
		return this.elasticsearch.getIndexTextFields(index)
		.then(textFields => textFields);
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

	percentiles(
		index: string,
		selectedNumField: string,
		percentileValues: number[]): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {
					'result': {
						'percentiles':
							{
								'field':selectedNumField,
								'percents': percentileValues
							}
					}
			})
			.then(function(aggregations){
				var results = [];
				for(var percentile in aggregations.result.values){
					results.push(
						Math.round(aggregations.result.values[percentile]*100)/100
					);
				}
				return results;
			});
		}
	}

	percentileRanks(
		index: string,
		selectedNumField: string,
		percentileValues: number[]): PromiseLike<any> {
		if(index && selectedNumField){
			return this.elasticsearch.numFieldCalculation(
				index, {
					'result': {
						'percentile_ranks':
							{
								'field':selectedNumField,
								'values': percentileValues
							}
					}
			})
			.then(function(aggregations){
				var results = [];
				for(var percentile in aggregations.result.values){
					results.push(
						Math.round(aggregations.result.values[percentile]*100)/100
					);
				}
				return results;
			});
		}
	}

	topHits(
		index: string,
		selectedField: string,
		sortOn: string,
		size: number,
		order: string,
		aggType: string): PromiseLike<any> {
		var sortOnObj = {};
		sortOnObj[sortOn] = {
			'order': order
		}

		if(index && selectedField){
			var that = this;
			return this.elasticsearch.numFieldCalculation(
				index,
				{
					'result': {
						'top_hits': {
							"sort": [ sortOnObj ],
							"_source": {
								"includes": [ selectedField ]
							},
							"size" : size
						}
					}
				}
			).then(function(aggregations){
				var hitsArr = aggregations.result.hits.hits;
				return that.getTopHitsResut(hitsArr, selectedField, aggType);
			});
		}
	}

	private getTopHitsResut(
		hits: any[],
		selectedField: string,
		aggType: string): any[]{

		var results = [];

		if(aggType==='Concatenate'){
			var concatenation = '';
			for(var i=0; i<hits.length; i++){
				concatenation += hits[i]._source[selectedField]
				if(i<(hits.length-1)) concatenation += ', '
			}
			results.push(concatenation);
		}else if(aggType==='Sum'){
			var sum = 0;
			for(var i=0; i<hits.length; i++){
				sum += hits[i]._source[selectedField];
			}
			results.push(sum);
		}else if(aggType==='Max'){
			var max = null;
			for(var i=0; i<hits.length; i++){
				var hitValue = hits[i]._source[selectedField];
				if(max===null){
					max = hits[i]._source[selectedField];
				}else if(hitValue>max){
					max = hitValue;
				}
			}
			results.push(max);
		}else if(aggType==='Min'){
			var min = null;
			for(var i=0; i<hits.length; i++){
				var hitValue = hits[i]._source[selectedField];
				if(min===null){
					min = hits[i]._source[selectedField];
				}else if(hitValue<min){
					min = hitValue;
				}
			}
			results.push(min);
		}else if(aggType==='Average'){
			var avg = null;
			var sum = 0;
			for(var i=0; i<hits.length; i++){
				sum += hits[i]._source[selectedField];
			}

			avg = (hits.length>0) ? sum/hits.length : 0;

			results.push(avg);
		}

		return results;
	}
}
