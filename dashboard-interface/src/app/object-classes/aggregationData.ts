export class AggregationData {
	id: string;
	enabled: true;
	type: string;
	schema: string;
	params: any

	constructor (aggData?: AggregationData){
		this.id = aggData && aggData.id || '';
		this.enabled = aggData && aggData.enabled || true;
		this.type = aggData && aggData.type || '';
		this.schema = aggData && aggData.schema || '';
		this.params = aggData && aggData.params || '';
	}
}
