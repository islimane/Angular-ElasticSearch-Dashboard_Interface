import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { Elasticsearch } from './elasticsearch';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule
	],
	providers: [
		DataService,
		Elasticsearch
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
