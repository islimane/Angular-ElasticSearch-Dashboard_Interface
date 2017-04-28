import {
	inject,
	TestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Elasticsearch } from './elasticsearch.service';

describe('Elasticsearch', () => {
	beforeEach(() => TestBed.configureTestingModule({
		providers: [
			Elasticsearch
		]}));

	it('should return an Observable when test_search called',
		inject([ Elasticsearch], (elasticsearch: Elasticsearch) => {
			expect(elasticsearch.test_search()).toEqual(jasmine.any(Observable));
	}));

});
