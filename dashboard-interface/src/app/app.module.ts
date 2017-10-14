import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { VisualizationsComponent } from './visualizations/visualizations.component';
import { MetricsComponent } from './visualizations/metrics/metrics.component';
import { MetricComponent } from './visualizations/metrics/metric.component';
import { PercentilesMetricComponent } from './visualizations/metrics/aggregations/percentilesMetric.component';
import { PercentileRanksMetricComponent } from './visualizations/metrics/aggregations/percentileRanksMetric.component';
import { TopHitMetricComponent } from './visualizations/metrics/aggregations/topHitMetric.component';
import { DataTableComponent } from './visualizations/data-table/dataTable.component';
import { TableComponent } from './visualizations/data-table/table.component';
import { BucketsComponent } from './visualizations/buckets/buckets.component';
import { BucketComponent } from './visualizations/buckets/bucket.component';
import { PieChartComponent } from './visualizations/pie-chart/pieChart.component';
import { BarChartComponent } from './visualizations/bar-chart/bar-chart.component';
import { DynamicComponent } from './shared/dynamicComponent.component';

import { DataService } from './data.service';
import { MetricsService } from './visualizations/metrics/metrics.service';
import { VisualizationsService } from './visualizations/visualizations.service';

import { HiddenDirective } from './shared/hidden.directive';

import { Elasticsearch } from './elasticsearch';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { Collapse } from './shared/collapse.directive';

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
		PieChartComponent,
		BarChartComponent,
		DynamicComponent,
		HiddenDirective,
		BucketsComponent,
		BucketComponent,
		Collapse
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		ChartsModule,
		FlexLayoutModule,
		AppRoutingModule
	],
	providers: [
		DataService,
		Elasticsearch,
		MetricsService,
		VisualizationsService
	],
	bootstrap: [
		AppComponent
	],
	entryComponents: [
		MetricsComponent,
		DataTableComponent,
		MetricComponent,
		BucketComponent,
		PieChartComponent,
		BarChartComponent
	]
})
export class AppModule { }
