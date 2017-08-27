import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";

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
import { DynamicComponent } from './shared/dynamicComponent.component';

import { DataService } from './data.service';
import { MetricsService } from './visualizations/metrics/metrics.service';
import { VisualizationsService } from './visualizations/visualizations.service';

import { HiddenDirective } from './shared/hidden.directive';

import { Elasticsearch } from './elasticsearch';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { MissionControlComponent } from './example/missioncontrol.component';
import { AstronautComponent } from './example/astronaut.component';
import { MissionService } from './example/mission.service';

// Angular Material
import {
	MdMenuModule,
//	CdkTableModule,
	MdAutocompleteModule,
	MdButtonModule,
	MdButtonToggleModule,
	MdCardModule,
	MdCheckboxModule,
	MdChipsModule,
	MdCoreModule,
	MdDatepickerModule,
	MdDialogModule,
	MdExpansionModule,
	MdGridListModule,
	MdIconModule,
	MdInputModule,
	MdListModule,
	MdNativeDateModule,
	MdPaginatorModule,
	MdProgressBarModule,
	MdProgressSpinnerModule,
	MdRadioModule,
	MdRippleModule,
	MdSelectModule,
	MdSidenavModule,
	MdSliderModule,
	MdSlideToggleModule,
	MdSnackBarModule,
	MdSortModule,
	MdTableModule,
	MdTabsModule,
	MdToolbarModule,
	MdTooltipModule
} from '@angular/material';

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
		DynamicComponent,
		HiddenDirective,
		MissionControlComponent,
		AstronautComponent,
		BucketsComponent,
		BucketComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		ChartsModule,
		BrowserAnimationsModule,
		MdMenuModule,
		MdAutocompleteModule,
		MdButtonModule,
		MdButtonToggleModule,
		MdCardModule,
		MdCheckboxModule,
		MdChipsModule,
		MdCoreModule,
		MdDatepickerModule,
		MdDialogModule,
		MdExpansionModule,
		MdGridListModule,
		MdIconModule,
		MdInputModule,
		MdListModule,
		MdMenuModule,
		MdNativeDateModule,
		MdPaginatorModule,
		MdProgressBarModule,
		MdProgressSpinnerModule,
		MdRadioModule,
		MdRippleModule,
		MdSelectModule,
		MdSidenavModule,
		MdSliderModule,
		MdSlideToggleModule,
		MdSnackBarModule,
		MdSortModule,
		MdTableModule,
		MdTabsModule,
		MdToolbarModule,
		MdTooltipModule,
		FlexLayoutModule
	],
	providers: [
		DataService,
		Elasticsearch,
		MetricsService,
		VisualizationsService,
		MissionService
	],
	bootstrap: [AppComponent],
	entryComponents: [
		MetricsComponent,
		DataTableComponent,
		MetricComponent,
		BucketComponent,
		PieChartComponent
	]
})
export class AppModule { }
