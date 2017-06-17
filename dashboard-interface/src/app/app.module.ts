import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MetricsComponent } from './metrics.component';
import { DataTableComponent } from './dataTable.component';
import { PercentilesMetricComponent } from './metrics/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './metrics/percentileRanksMetric.component';
import { TopHitMetricComponent } from './metrics/topHitMetric.component';
import { TableComponent } from './table.component';

import { DataService } from './data.service';
import { MetricsService } from './metrics.service';

import { Elasticsearch } from './elasticsearch';

@NgModule({
	declarations: [
		AppComponent,
		MetricsComponent,
		DataTableComponent,
		PercentilesMetricComponent,
		PercentileRanksMetricComponent,
		TopHitMetricComponent,
		TableComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule
	],
	providers: [
		DataService,
		Elasticsearch,
		MetricsService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
