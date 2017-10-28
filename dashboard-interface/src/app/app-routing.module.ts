import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VisualizationsComponent } from './visualizations/visualizations.component';
import { DashboardsComponent } from './dashboards/dashboards.component';

const routes: Routes = [
	{ path: '', redirectTo: '/visualizations', pathMatch: 'full' },
	{ path: 'visualizations',	component: VisualizationsComponent },
	{ path: 'dashboards',	component: DashboardsComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}
