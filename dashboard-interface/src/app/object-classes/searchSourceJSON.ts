export class SearchSourceJSON {
	index: string;
	query: any;

	constructor(index: string, query: any){
		this.index = index;
		this.query = query;
	}
}
