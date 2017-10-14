import { Injectable } from '@angular/core';

import { Elasticsearch } from '../../elasticsearch';
import { MetricsService } from '../metrics/metrics.service';

import { AggregationData } from '../../object-classes/aggregationData';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { VisualizationTools } from "../../shared/visualization-tools";

import * as _ from "lodash";
declare let bodybuilder: any;

@Injectable()
export class BarChartService {

	constructor(
		private _elasticCli: Elasticsearch,
		private _metricsService: MetricsService
	) { }

	saveBarChart(visualizationObj: VisualizationObj): void {
		this._elasticCli.saveVisualization(visualizationObj);
	}

	getResults(index: string, metrics: AggregationData[], buckets: AggregationData[]): PromiseLike<any> {
		let body = this._getRequestBody(buckets, metrics);
		return this._elasticCli.request(index, body).then(response => {
			console.log('BAR CHART SERVICE - response:', response);
			return this._getFormattedResults(response, this._getAggByIdMap(_.concat(metrics, buckets)), buckets[0], metrics);
		});
	}

	private _getFormattedResults(response: any, aggsById: Map<string, AggregationData>, bucket: AggregationData, metrics: AggregationData[]): any {
		let bucketResponse = response.aggregations[bucket.id];
		if(!bucketResponse) return null;
		let buckets = bucketResponse.buckets;

		console.log('BAR CHART SERVICE - aggsById:', aggsById);

		let results = [];
		for(let i=0; i<buckets.length; i++){
			results = this._getBucketResults(
				bucket.id,
				response.aggregations[bucket.id],
				metrics,
				aggsById,
				'root'
			);
		}
		console.log('BAR CHART SERVICE - results:', results);
		let resultsMap = this._getResultsMap(results);
		console.log('BAR CHART SERVICE - resultsMap:', resultsMap);
		let xAxisLabels = this._getXAxisLabels(results);
		console.log('BAR CHART SERVICE - xAxisLabels:', xAxisLabels);
		return {
			rMap: resultsMap,
			rArray: results,
			xAxisLabels: xAxisLabels
		};
	}

	private _getXAxisLabels(results: any[]): string[] {
		console.log('BAR CHART SERVICE - _getXAxisLabels()');
		let lablesSet = new Set<string>();
		for(let i=0; i<results.length; i++){
			lablesSet.add(results[i].bucketValue + '');
		}
		return Array.from(lablesSet);
	}

	private _getResultsMap(results: any[]): Map<string, any[]> {
		console.log('BAR CHART SERVICE - _getResultsMap()');
		let resultsMap = new Map<string, any[]>();
		for(let i=0; i<results.length; i++){
			let bucketResults = resultsMap.get(results[i].metricResult.label);
			if(!bucketResults) resultsMap.set(results[i].metricResult.label, []);
			resultsMap.get(results[i].metricResult.label).push(results[i]);
		}
		return resultsMap;
	}

	private _getBucketResults(
		aggBucketId: string,
		responseBucket: any,
		metrics: AggregationData[],
		aggsById: Map<string, AggregationData>,
		parentResultId: string
	): any{
		let currentBucket = aggsById.get(aggBucketId);
		let results = [];
		for(let i in responseBucket.buckets){
			let bucketObj = responseBucket.buckets[i];
			for(let field in bucketObj){
				//console.log('BAR CHART SERVICE - field:', field);
				//console.log('BAR CHART SERVICE - obj:', bucketObj[field]);
				if(this._isMetric(field)){
					let metricId = field;
					let metricResult = this._getMetricResult(bucketObj, aggsById.get(metricId));
					//console.log('BAR CHART SERVICE - metricResult:', metricResult);
					metricResult = _.map(metricResult, (r) =>  {
						return {
							id: VisualizationTools.guidGenerator(),
							responseBucket: currentBucket,
							metricResult: r,
							bucketValue: this._getBucketValue(currentBucket.type, bucketObj),
							percent: null,
							parentResultId: parentResultId
						}
					});
					results = _.concat(results, metricResult);
				}
			}
		}
		return results;
	}

	private _getMetricResult(bucket: any, metric: AggregationData): any {
		return this._metricsService.getAggResult(bucket, metric);
	}

	private _isMetric(aggId: string): boolean {
		return aggId.split('_')[0]==='metric';
	}

	private _getBucketValue(bucketType: string, bucket: any){
		switch(bucketType){
			case 'range':
				return bucket.from + ' to ' + bucket.to;
			case 'histogram':
				return bucket.key;
			default:
				return null;
		}
	}

	private _getAggByIdMap(aggs: AggregationData[]): Map<string, AggregationData> {
		let aggByIdMap = new Map<string, AggregationData>();
		for(let i=0; i<aggs.length; i++){
			aggByIdMap.set(aggs[i].id, aggs[i]);
		}
		return aggByIdMap;
	}

	private _getRequestBody(buckets: AggregationData[], metrics: AggregationData[]): any {
		console.log('BAR CHART SERVICE - metrics:', metrics);

		let body: any = this._getMetricsBody(metrics);
		for(let i=buckets.length-1; i>=0; i--){
			console.log('BAR CHART SERVICE - bucket:', buckets[i]);
			console.log('BAR CHART SERVICE - aggType:', this._elasticCli.getAggType(buckets[i]));
			console.log('BAR CHART SERVICE - aggParams:', this._elasticCli.getAggParams(buckets[i]));
			console.log('BAR CHART SERVICE - body:', body.build());
			body = bodybuilder().aggregation(
				this._elasticCli.getAggType(buckets[i]),
				null,
				buckets[i].id,
				this._elasticCli.getAggParams(buckets[i]),
				(a) => body
			);
		}
		console.log('BAR CHART SERVICE - body:', body.build());
		return body;
	}

	private _getMetricsBody(metrics: AggregationData[]): any {
		var body = bodybuilder();

		for(let i=0; i<metrics.length; i++){
			body = body.aggregation(
				this._elasticCli.getAggType(metrics[i]),
				null,
				metrics[i].id,
				this._elasticCli.getAggParams(metrics[i])
			);
		}

		return body;
	}

}
