import { Injectable } from '@angular/core';

import { Elasticsearch } from '../../elasticsearch';
import { MetricsService } from '../metrics/metrics.service';

import { AggregationData } from '../../object-classes/aggregationData';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import { VisualizationTools } from "../../shared/visualization-tools";

import * as _ from "lodash";
declare let bodybuilder: any;

@Injectable()
export class PieChartService {

	constructor(
		private _elasticCli: Elasticsearch,
		private _metricsService: MetricsService
	) { }

	savePieChart(visualizationObj: VisualizationObj): void {
		this._elasticCli.saveVisualization(visualizationObj);
	}

	getResults(index: string, metric: AggregationData, buckets: AggregationData[]): PromiseLike<any> {
		let body = this._getRequestBody(buckets, metric);
		return this._elasticCli.request(index, body).then(response => {
			console.log('PIE CHART SERVICE - response:', response);
			return this._getFormattedResults(response, this._getAggByIdMap(_.concat([metric], buckets)), metric)
		});
	}

	private _getFormattedResults(response: any, aggsById: Map<string, AggregationData>, metric: AggregationData): any {
		let aggregations = response.aggregations;
		if(!aggregations) return null;
		let results = [];
		for(let bucketId in aggregations){
			results = this._getBucketsResults(
				bucketId,
				aggregations[bucketId],
				metric,
				aggsById,
				'root'
			);
		}
		console.log('PIE CHART SERVICE - results:', results);
		let resultsMap = this._getResultsMap(results);
		console.log('PIE CHART SERVICE - resultsMap:', resultsMap);
		return {
			rMap: resultsMap,
			rArray: results
		};
	}

	private _getResultsMap(results: any[]): Map<string, any[]> {
		let resultsMap = new Map<string, any[]>();
		for(let i=0; i<results.length; i++){
			let bucketResults = resultsMap.get(results[i].bucket.id);
			if(!bucketResults) resultsMap.set(results[i].bucket.id, []);
			resultsMap.get(results[i].bucket.id).push(results[i]);
			console.log('PIE CHART SERVICE - resultsMap:', results[i]);
		}
		return resultsMap;
	}

	private _getBucketsResults(
		bucketId: string,
		bucket: any,
		metric: AggregationData,
		aggsById: Map<string, AggregationData>,
		parentResultId: string
	): any{
		let currentBucket = aggsById.get(bucketId);
		let results = [];
		for(let i in bucket.buckets){
			let bucketObj = bucket.buckets[i];
			let metricResult = this._getMetricResult(bucketObj, metric);
			metricResult = (metricResult.length>0) ? metricResult[0] : null;
			console.log('PIE CHART SERVICE - metricResult:', metricResult);
			let bucketValue = this._getBucketValue(currentBucket.type, bucketObj);
			console.log('PIE CHART SERVICE - bucketValue:', bucketValue);
			let id = VisualizationTools.guidGenerator();
			results.push({
				id: id,
				bucket: aggsById.get(bucketId),
				metricResult: metricResult,
				bucketValue: bucketValue,
				percent: null,
				parentResultId: parentResultId
			});
			let nestedResults = this._getNestedBucketResults(
				bucketId,
				bucketObj,
				metric,
				aggsById,
				id
			);
			results = (nestedResults) ? _.concat(results, nestedResults) : results;
		}
		return results;
	}

	private _getNestedBucketResults(
		bucketId: string,
		bucketObj: any,
		metric: AggregationData,
		aggsById: Map<string, AggregationData>,
		parentResultId: string
	): any{
		for(let key in bucketObj){
			if(this._isBucket(key))
				return this._getBucketsResults(key, bucketObj[key], metric, aggsById, parentResultId);
		}
		return null;
	}

	private _getMetricResult(bucket: any, metric: AggregationData): any {
		return this._metricsService.getAggResult(bucket, metric);
	}

	private _isBucket(aggId: string): boolean {
		return aggId.split('_')[0]==='bucket';
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

	private _getRequestBody(buckets: AggregationData[], metric: AggregationData): any {
		console.log('PIE CHART SERVICE - metric:', metric);

		let body: any = bodybuilder();
		for(let i=buckets.length-1; i>=0; i--){
			console.log('PIE CHART SERVICE - bucket:', buckets[i]);
			console.log('PIE CHART SERVICE - aggType:', this._elasticCli.getAggType(buckets[i]));
			console.log('PIE CHART SERVICE - aggParams:', this._elasticCli.getAggParams(buckets[i]));
			let nestedBody = body.aggregation(
				this._elasticCli.getAggType(metric),
				null,
				metric.id,
				this._elasticCli.getAggParams(metric)
			);
			console.log('PIE CHART SERVICE - nestedBody:', body.build());
			body = bodybuilder().aggregation(
				this._elasticCli.getAggType(buckets[i]),
				null,
				buckets[i].id,
				this._elasticCli.getAggParams(buckets[i]),
				(a) => nestedBody
			);
		}
		console.log('PIE CHART SERVICE - body:', body.build());
		return body;
	}

	private _getSortedAggs(buckets: AggregationData[], metrics: AggregationData[]): AggregationData[] {
		return null;
	}

}
