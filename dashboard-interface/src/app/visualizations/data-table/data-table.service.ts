import { Injectable } from '@angular/core';

import { Elasticsearch } from '../../elasticsearch';

import { VisualizationObj } from '../../object-classes/visualizationObj';

@Injectable()
export class DataTableService {
	private getDataTableAggregation(aggregationData: any): any {
		var aggregation = aggregationData.name;
		if(aggregation==='Histogram'){
			return {
				"result": {
					"histogram": {
						"field": aggregationData.field,
						"interval": aggregationData.interval
					}
				}
			}
		}else if(aggregation==='Range'){
			return {
				"result": {
					"range" : {
						"field" : aggregationData.field,
						"ranges" : aggregationData.ranges/*[
							{ "from" : 0, "to" : 20 },
							{ "from" : 20, "to" : 25 },
							{ "from" : 25, "to" : 40 }
						]*/
					}
				}
			}
		}else{
			return null;
		}
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
