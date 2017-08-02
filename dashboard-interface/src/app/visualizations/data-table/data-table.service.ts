import { Injectable } from '@angular/core';

import { Elasticsearch } from '../../elasticsearch';
import { MetricsService } from '../metrics/metrics.service';

import { AggregationData } from '../../object-classes/aggregationData';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import * as _ from "lodash";
declare let bodybuilder: any;

@Injectable()
export class DataTableService {

	constructor(
		private _elasticCli: Elasticsearch,
		private _metricsService: MetricsService
	) { }

	saveDataTable(visualizationObj: VisualizationObj): void {
		this._elasticCli.saveVisualization(visualizationObj);
	}

	getResults(index: string, metrics: AggregationData[], buckets: AggregationData[]): PromiseLike<any> {
		let body = this._getRequestBody(buckets, metrics);
		return this._elasticCli.request(index, body).then(response =>
			this._processResultsResponse(response, _.concat(metrics, buckets))
		);
	}

	private _getRequestBody(buckets: AggregationData[], metrics: AggregationData[]): any {
		let metricsBody = this._elasticCli.getAggsBody(metrics);
		let body = metricsBody;
		for(let i=0; i<buckets.length; i++){
			body = bodybuilder().aggregation(
				this._elasticCli.getAggType(buckets[i]),
				null,
				buckets[i].id,
				this._elasticCli.getAggParams(buckets[i]),
				(a) => body
			);
		}
		return body;
	}

	private _processResultsResponse(response: any, aggs: AggregationData[]): any {
		console.log('DATA TABLE SERVICE - response:', response);
		let aggByIdMap = this._getAggByIdMap(aggs);
		let rows = this._getRows(response, aggByIdMap);
		console.log('DATA TABLE SERVICE - rows:', rows);
		let columnsHeaders = this._getColumnsHeaders(rows, aggByIdMap);
		console.log('DATA TABLE SERVICE - columnsHeaders:', columnsHeaders);
		return {
			rows: rows,
			columnsHeaders: columnsHeaders
		}
	}

	private _getColumnsHeaders(rows: any[], aggByIdMap: Map<string, AggregationData>): string[] {
		let columnsHeaders = [];
		if(rows.length>0){
			console.log('DATA TABLE SERVICE - rows[0]:', rows[0]);
			for(let i=0; i<rows[0].length; i++){
				console.log('DATA TABLE SERVICE - rows[0][' + i + '].id:', rows[0][i].id);
				if(rows[0][i].id){ // It is a bucket
					columnsHeaders.push(this._getBucketHeader(rows[0][i], aggByIdMap));
				}else if(rows[0][i].label){
					columnsHeaders.push(rows[0][i].label);
				}else{
					console.error('ERROR: Couldn\'t find header.');
					columnsHeaders.push(null);
				}
			}
		}
		return columnsHeaders;
	}

	private _getBucketHeader(bucket: any, aggByIdMap: Map<string, AggregationData>): string {
		let savedBucketData = aggByIdMap.get(bucket.id);
		console.log('DATA TABLE SERVICE - savedBucketData:', savedBucketData);
		if(savedBucketData){
			switch(savedBucketData.type){
				case 'histogram':
					return savedBucketData.params.field;
				case 'range':
					return savedBucketData.params.field + ' ranges';
				default:
					console.error('ERROR: type [' + savedBucketData.type + '] not found.');
					return null;
			}
		}
		return null;
	}

	private _getRows(response: any, aggByIdMap: Map<string, AggregationData>): any[] {
		let aggsResponse = response.aggregations;
		let rows = null;
		if(!aggsResponse){ // Could be just count metrics without buckets
			return this._getRowMetricsResults(response, Array.from(aggByIdMap.values()));
		}
		console.log('DATA TABLE SERVICE - aggByIdMap:', aggByIdMap);
		for(let aggId in aggsResponse){
			if(aggsResponse[aggId].buckets)
				rows = this._processBucketResponse(aggId, aggsResponse[aggId].buckets, aggByIdMap);
			else{ // Could be just metrics without buckets
				rows = this._getRowMetricsResults(response, Array.from(aggByIdMap.values()));
			}
		}
		return rows;
	}

	private _processBucketResponse(bucketId: any, buckets: any, aggByIdMap: Map<string, AggregationData>): any[] {
		console.log('DATA TABLE SERVICE - bucket:', bucketId, buckets);
		let rows = [];
		let agg = aggByIdMap.get(bucketId);
		if(!agg){
			console.error('Error: id [' + bucketId + '] not found in aggByIdMap.');
		}else{
			for(let key in buckets){
				let rowValue = this._getRowValue(agg.type, buckets[key]);
				console.log('DATA TABLE SERVICE - rowValue:', rowValue);
				let nestedBucket = this._getNestedBucket(buckets[key]);
				console.log('DATA TABLE SERVICE - nestedBucket:', nestedBucket);
				let nestedValues = this._getNestedValues(nestedBucket, buckets[key], aggByIdMap);
				console.log('DATA TABLE SERVICE - nestedValues:', nestedValues);
				let id = (bucketId) ? bucketId : 'metrics';
				for(let i=0; i<nestedValues.length; i++){
					let rowValueObj: any = {
						id: id,
						value: rowValue
					};
					rows.push(_.concat(rowValueObj, nestedValues[i]));
				}
			}
			return rows;
		}
	}

	private _getNestedValues(nestedBucket: any, bucket: any, aggByIdMap: Map<string, AggregationData>): any {
		console.log('DATA TABLE SERVICE - _getNestedValues() - bucket:', bucket);
		if(nestedBucket){
			console.log('DATA TABLE SERVICE - FOUND NESTED BUCKET');
			return this._processBucketResponse(
				nestedBucket.id,
				nestedBucket.buckets,
				aggByIdMap
			);
		}else{
			console.log('DATA TABLE SERVICE - FOUND METRICS');
			let aggs = Array.from(aggByIdMap.values());
			console.log('DATA TABLE SERVICE - metrics response:', bucket);
			return this._getRowMetricsResults(bucket, aggs);
		}
	}

	private _getRowMetricsResults(response: any, aggs: AggregationData[]): any[] {
		let allResults = this._metricsService.getAggResults(
			response,
			this._getMetrics(aggs)
		);
		return [this._getConcatenatedResults(allResults)];
	}

	private _getConcatenatedResults(allResults: any[]): any[] {
		let concatenatedResults = [];
		for(let i=0; i<allResults.length; i++){
			let results = allResults[i];
			for(let j=0; j<results.length; j++){
				concatenatedResults.push(results[j]);
			}
		}
		return concatenatedResults;
	}

	private _getMetrics(aggs: AggregationData[]): any {
		return _.filter(aggs, (agg) => agg.id.split('_')[0]==='metric');
	}

	// This function returns the newsted bucket if there is
	// a nested bucket on bucketData, otherwise returns null.
	// FORMAT: {id: string, buckets: any[]}
	private _getNestedBucket(bucketData: any): any {
		console.log('DATA TABLE SERVICE - bucketData:', bucketData);
		for(let field in bucketData){
			if(this._isBucket(field))
				return {id: field, buckets: bucketData[field].buckets};
		}
		return null;
	}

	private _getRowValue(bucketType: string, bucket: any){
		switch(bucketType){
			case 'range':
				return bucket.from + ' to ' + bucket.to;
			case 'histogram':
				return bucket.key;
			default:
				return null;
		}
	}

	private _isBucket(aggId: string): boolean {
		return aggId.split('_')[0]==='bucket';
	}

	private _isMetric(aggId: string): boolean {
		return aggId.split('_')[0]==='metric';
	}

	private _getAggByIdMap(aggs: AggregationData[]): Map<string, AggregationData> {
		let aggByIdMap = new Map<string, AggregationData>();
		for(let i=0; i<aggs.length; i++){
			aggByIdMap.set(aggs[i].id, aggs[i]);
		}
		return aggByIdMap;
	}
}
