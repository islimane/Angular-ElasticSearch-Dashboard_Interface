import { AggregationData } from './aggregationData';

export class VisualizationState {
	title: string;
	type: string;
	params: any;
	aggs: AggregationData[];
	listeners: {}
}
