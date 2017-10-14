import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VisualizationsComponent } from './visualizations/visualizations.component';

const routes: Routes = [
	{ path: '', redirectTo: '/visualizations', pathMatch: 'full' },
	{ path: 'visualizations',	component: VisualizationsComponent }
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})

export class AppRoutingModule {}
