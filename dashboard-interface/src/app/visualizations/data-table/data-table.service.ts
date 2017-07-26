import { Injectable } from '@angular/core';

import { Elasticsearch } from '../../elasticsearch';
import { MetricsService } from '../metrics/metrics.service';

import { AggregationData } from '../../object-classes/aggregationData';
import { VisualizationObj } from '../../object-classes/visualizationObj';

import * as _ from "lodash";

@Injectable()
export class DataTableService {

	constructor(
		private _elasticCli: Elasticsearch,
		private _metricsService: MetricsService
	) { }

	getResults(index: string, metrics: AggregationData[], buckets: AggregationData[]): PromiseLike<any> {
		return this._elasticCli.request(index, metrics, buckets).then(response =>
			this._processResultsResponse(response, _.concat(metrics, buckets))
		);
	}

	private _processResultsResponse(response: any, aggs: AggregationData[]): any {
		console.log('DATA TABLE SERVICE - response:', response);
		let aggByIdMap = this._getAggByIdMap(aggs);
		let rows = this._getRows(response.aggregations, aggByIdMap);
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

	private _getRows(aggsResponse: any, aggByIdMap: Map<string, AggregationData>): any[] {
		let rows = null;
		console.log('DATA TABLE SERVICE - aggByIdMap:', aggByIdMap);
		for(let aggId in aggsResponse){
			rows = this._processBucketResponse(aggId, aggsResponse[aggId].buckets, aggByIdMap);
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
			let allResults = this._metricsService.getAggResults(bucket, this._getMetrics(aggs))
			return [this._getConcatenatedResults(allResults)];
		}
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

	saveDataTable(visualizationObj: VisualizationObj): void {
		this._elasticCli.saveVisualization(visualizationObj);
	}



	/*count(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		console.log('dataTableData', dataTableData);

		if(dataTableData!==null){
			var dataTableAggregation = this.getDataTableAggregation(dataTableData);
			return this._elasticCli.numFieldCalculation(index, dataTableAggregation)
			.then(function(aggregations){
				var columns = [dataTableData.field, 'Count'];
				var rows = [];
				var tableData = {
					columns: columns,
					rows: rows
				};

				for(var i=0; i<aggregations.result.buckets.length; i++){
					rows.push([
						aggregations.result.buckets[i].key,
						aggregations.result.buckets[i].doc_count
					]);
				}
				return tableData;
			});
		}else{
			return this._elasticCli.count(index)
			.then(count => [{
					label: 'Count',
					result: count
			}]);
		}
	}*/

	getDataTableResults(dataTableData: any, aggregations: any, label: string): any {
		var columns = [dataTableData.field, label];
		var rows = [];
		var tableData = {
			columns: columns,
			rows: rows
		};

		for(var i=0; i<aggregations.result.buckets.length; i++){
			rows.push([
				aggregations.result.buckets[i].key,
				Math.round(aggregations.result.buckets[i].result.value*100)/100
			]);
		}

		return tableData;
	}

	/*avg(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var avgAgg = {
				'result': {
					'avg': {'field':selectedNumField}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = avgAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(aggregations =>
					this.getDataTableResults(
						dataTableData,
						aggregations,
						('Average' + dataTableData.field))
				);
			}else{
				return this._elasticCli.numFieldCalculation(index, avgAgg)
				.then(aggregations => [{
						label: ('Average ' + selectedNumField),
						result: [aggregations.result.value]
				}]);
			}

		}
	}

	sum(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var sumAgg = {
				'result': {
					'sum': {'field': selectedNumField}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = sumAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(aggregations =>
					this.getDataTableResults(
						dataTableData,
						aggregations,
						('Sum of' + dataTableData.field))
					);
			}else{
				return this._elasticCli.numFieldCalculation(index, sumAgg)
				.then(aggregations => [{
						label: ('Sum of ' + selectedNumField),
						result: [aggregations.result.value]
				}]);
			}
		}
	}

	min(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var minAgg = {
				'result': {
					'min': {'field': selectedNumField}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = minAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(aggregations =>
					this.getDataTableResults(
						dataTableData,
						aggregations,
						('Min ' + selectedNumField)
					)
				);
			}else{
				return this._elasticCli.numFieldCalculation(index, minAgg)
				.then(aggregations => [{
							label: ('Min ' + selectedNumField),
							result: [aggregations.result.value]
				}]);
			}
		}
	}

	max(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var maxAgg = {
				'result': {
					'max': {'field': selectedNumField}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = maxAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(aggregations =>
					this.getDataTableResults(
						dataTableData,
						aggregations,
						('Max ' + selectedNumField)
					)
				);
			}else{
				return this._elasticCli.numFieldCalculation(index, maxAgg)
				.then(aggregations => [{
							label: ('Max ' + selectedNumField),
							result: [aggregations.result.value]
				}]);
			}
		}
	}

	median(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var medianAgg = {
				'result': {
					'percentiles': {
						'field':selectedNumField,
						'percents': [50]
					}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = medianAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(function(aggregations) {
					var columns = [
						dataTableData.field,
						('50th percentile of ' + selectedNumField)
					]
					var rows = []
					var tableData = {
						columns: columns,
						rows: rows
					}

					for(var i=0; i<aggregations.result.buckets.length; i++){
						rows.push([
							aggregations.result.buckets[i].key,
							aggregations.result.buckets[i].result.values['50.0']
						]);
					}

					return tableData;
				});
			}else{
				return this._elasticCli.numFieldCalculation(index, medianAgg)
				.then(aggregations => [{
							label: ('50th percentile of ' + selectedNumField),
							result: [aggregations.result.values['50.0']]
				}]);
			}
		}
	}

	stdDeviation(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var medianAgg = {
				'result': {
					'extended_stats': {
						'field':selectedNumField,
						'sigma': 2
					}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = medianAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(function(aggregations) {
					var columns = [
						dataTableData.field,
						('Lower Standard Deviation of ' + selectedNumField),
						('Upper Standard Deviation of ' + selectedNumField)
					]
					var rows = []
					var tableData = {
						columns: columns,
						rows: rows
					}

					for(var i=0; i<aggregations.result.buckets.length; i++){
						rows.push([
							aggregations.result.buckets[i].key,
							aggregations.result.buckets[i].result.std_deviation_bounds.lower,
							aggregations.result.buckets[i].result.std_deviation_bounds.upper
						]);
					}

					return tableData;
				});
			}else{
				return this._elasticCli.numFieldCalculation(index, medianAgg)
				.then(aggregations =>
					[
						{
							label: ('Lower Standard Deviation of ' + selectedNumField),
							result: [aggregations.result.std_deviation_bounds.lower]
						},
						{
							label: ('Upper Standard Deviation of ' + selectedNumField),
							result: [aggregations.result.std_deviation_bounds.upper]
						}
					]
				);
			}
		}
	}

	uniqueCount(index: string, selectedNumField: string, dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var uniqueCountAgg = {
				'result': {
					'cardinality': {'field': selectedNumField}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = uniqueCountAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(aggregations =>
					this.getDataTableResults(
						dataTableData,
						aggregations,
						('Unique count of ' + selectedNumField)
					)
				);
			}else{
				return this._elasticCli.numFieldCalculation(index, uniqueCountAgg)
				.then(aggregations => [{
							label: ('Unique count of ' + selectedNumField),
							result: [aggregations.result.value]
				}]);
			}
		}
	}

	percentiles(
		index: string,
		selectedNumField: string,
		percentileValues: number[],
		dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var percentilesAgg = {
				'result': {
					'percentiles': {
						'field': selectedNumField,
						'percents': percentileValues
					}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = percentilesAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(function(aggregations) {
					var columns = new Set([dataTableData.field]);
					var rows = []
					var tableData = {
						columns: columns,
						rows: rows
					}

					for(var i=0; i<aggregations.result.buckets.length; i++){
						var key = aggregations.result.buckets[i].key;
						var row = [key];
						for(var percentile in aggregations.result.buckets[i].result.values){
							columns.add(percentile + 'th percentile of ' + selectedNumField);
							row.push(Math.round(aggregations.result.buckets[i].result.values[percentile]*100)/100);
						}
						rows.push(row);
					}

					return tableData;
				});
			}else{
				return this._elasticCli.numFieldCalculation(index, percentilesAgg)
				.then(function(aggregations){
					var results = [];
					for(var percentile in aggregations.result.values){
						results.push(
							{
								label: (percentile + 'th percentile of ' + selectedNumField),
								result: [Math.round(aggregations.result.values[percentile]*100)/100]
							}
						);
					}
					return results;
				});
			}
		}
	}

	percentileRanks(
		index: string,
		selectedNumField: string,
		percentileValues: number[],
		dataTableData: any): PromiseLike<any> {
		if(index && selectedNumField){
			var percentileRanksAgg = {
				'result': {
					'percentile_ranks': {
						'field': selectedNumField,
						'values': percentileValues
					}
				}
			};

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = percentileRanksAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(function(aggregations) {
					var columns = new Set([dataTableData.field]);
					var rows = []
					var tableData = {
						columns: columns,
						rows: rows
					}

					for(var i=0; i<aggregations.result.buckets.length; i++){
						var key = aggregations.result.buckets[i].key;
						var row = [key];
						for(var percentile in aggregations.result.buckets[i].result.values){
							columns.add('Percentile rank ' + percentile + ' of "' + selectedNumField + '"');
							row.push(Math.round(aggregations.result.buckets[i].result.values[percentile]*100)/100);
						}
						rows.push(row);
					}

					return tableData;
				});
			}else{
				return this._elasticCli.numFieldCalculation(index, percentileRanksAgg)
				.then(function(aggregations){
					var results = [];
					for(var percentile in aggregations.result.values){
						results.push({
							label: (
								'Percentile rank ' +
								percentile + ' of "' + selectedNumField + '"'
							),
							result: [Math.round(aggregations.result.values[percentile]*100)/100]
						});
					}
					return results;
				});
			}
		}
	}

	topHits(
		index: string,
		selectedField: string,
		sortOn: string,
		size: number,
		order: string,
		aggType: string,
		dataTableData: any): PromiseLike<any> {

		var sortOnObj = {};
		sortOnObj[sortOn] = {
			'order': order
		}

		if(index && selectedField){
			var topHitsAgg = {
				'result': {
					'top_hits': {
						"sort": [ sortOnObj ],
						"_source": {
							"includes": [ selectedField ]
						},
						"size" : size
					}
				}
			};

			var orderLabel = (order==='asc') ? 'First' : 'Last';

			var that = this;

			if(dataTableData){
				var dataTableAggregation = this.getDataTableAggregation(dataTableData);

				var aggs = {
					"result": {}
				}
				aggs.result = dataTableAggregation.result;
				aggs.result["aggs"] = topHitsAgg;

				return this._elasticCli.numFieldCalculation(index, aggs)
				.then(function(aggregations) {
					var columns = [
						dataTableData.field,
						(orderLabel + ' ' + size + ' ' + selectedField)
					];
					var rows = []
					var tableData = {
						columns: columns,
						rows: rows
					}

					for(var i=0; i<aggregations.result.buckets.length; i++){
						var hitsArr = aggregations.result.buckets[i].result.hits.hits;
						rows.push([
							aggregations.result.buckets[i].key,
							that.getTopHitsResut(hitsArr, selectedField, aggType)
						]);
					}

					return tableData;
				});
			}else{
				return this._elasticCli.numFieldCalculation(index, topHitsAgg)
				.then(function(aggregations){
					var results = [];
					var hitsArr = aggregations.result.hits.hits;

					results.push({
						label: (orderLabel + ' ' + size + ' ' + selectedField),
						result: [that.getTopHitsResut(hitsArr, selectedField, aggType)]
					});

					return results;
				});
			}
		}
	}*/
}
