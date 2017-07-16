import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { VisualizationsComponent } from './visualizations/visualizations.component';
import { MetricsComponent } from './visualizations/metrics/metrics.component';
import { MetricComponent } from './visualizations/metrics/metric.component';
import { PercentilesMetricComponent } from './visualizations/metrics/aggregations/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './visualizations/metrics/aggregations/percentileRanksMetric.component';
import { TopHitMetricComponent } from './visualizations/metrics/aggregations/topHitMetric.component';
import { DataTableComponent } from './visualizations/data-table/dataTable.component';
import { TableComponent } from './visualizations/data-table/table.component';
import { DynamicComponent } from './shared/dynamicComponent.component';

import { DataService } from './data.service';
import { MetricsService } from './visualizations/metrics/metrics.service';
import { VisualizationsService } from './visualizations/visualizations.service';

import { HiddenDirective } from './shared/hidden.directive';

import { Elasticsearch } from './elasticsearch';

import { MissionControlComponent } from './example/missioncontrol.component';
import { AstronautComponent } from './example/astronaut.component';
import { MissionService } from './example/mission.service';

@NgModule({
	declarations: [
		AppComponent,
		VisualizationsComponent,
		MetricsComponent,
		MetricComponent,
		DataTableComponent,
		PercentilesMetricComponent,
		PercentileRanksMetricComponent,
		TopHitMetricComponent,
		TableComponent,
		DynamicComponent,
		HiddenDirective,
		MissionControlComponent,
		AstronautComponent
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
		MetricsService,
		VisualizationsService,
		MissionService
	],
	bootstrap: [AppComponent],
	entryComponents: [ MetricComponent ]
})
export class AppModule { }
