import { Component, Input } from '@angular/core';

@Component({
	selector: 'dataTable-table',
	templateUrl: './table.component.html',
	styleUrls: [ './table.component.css' ]
})

export class TableComponent {

	@Input() columns: string[];
	@Input() rows: string[][];

}
