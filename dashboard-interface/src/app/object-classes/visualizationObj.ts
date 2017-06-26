import { VisualizationState } from './visualizationState';
import { SearchSourceJSON } from './searchSourceJSON';

export class VisualizationObj {
	title: string;
	visState: string;
	kibanaSavedObjectMeta: {
		searchSourceJSON: string
	};

	constructor(title: string, visState: string, searchSourceJSON: string){
		this.title = title;
		this.visState = visState;
		this.kibanaSavedObjectMeta = { searchSourceJSON: searchSourceJSON };
	}
}
