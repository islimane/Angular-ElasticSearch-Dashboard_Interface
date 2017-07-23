import { Component, Input, Output, ViewContainerRef, ViewChild, ComponentFactoryResolver, EventEmitter } from '@angular/core';


@Component({
	selector: 'dynamic-component',
	template: `
		<div #dynamicComponentContainer></div>
	`
})


export class DynamicComponent {
	// We need to get a reference to our div element
	@ViewChild('dynamicComponentContainer', { read: ViewContainerRef }) dynamicComponentContainer: ViewContainerRef;

	// An object with key/value pairs mapped to input name/input value
	@Input() componentType: any;
	// This event will return a <string, eventData> object, with the event name
	// as a string key
	@Output() event: EventEmitter<any> = new EventEmitter<any>();
	@Output() init: EventEmitter<any> = new EventEmitter<any>();

	private _componentsMap: Map<string, any> = new Map<string, any>();

	constructor(private resolver: ComponentFactoryResolver) {}

	ngOnInit(): void {
		console.log('DYNAMIC COMPONENT - ngOnInit()');
		this.init.emit();
	}

	// Append a new component instance on the container
	addComponent(uniqueId: string, inputs: any, events: Array<string>, componentType: any): any {
		console.log('DYNAMIC COMPONENT - addComponent():', uniqueId);
		const factory = this.resolver.resolveComponentFactory(componentType);
		let componentRef: any = this.dynamicComponentContainer.createComponent(factory);
		this._componentsMap.set(uniqueId, componentRef);
		this.setInputs(uniqueId, inputs);
		this.subscribeEvents(uniqueId, events);
		componentRef.changeDetectorRef.detectChanges();
		return componentRef.instance;
	}

	setInputs(uniqueId:string, inputs: any): void{
		let componentRef = this._componentsMap.get(uniqueId);
		if(componentRef){
			for(var inputField in inputs){
				console.log('BEFORE - this.componentRef.instance[' + inputField + ']:', componentRef.instance[inputField]);
				componentRef.instance[inputField] = inputs[inputField];
				console.log('AFTER - this.componentRef.instance[' + inputField + ']:', componentRef.instance[inputField]);
			}
		}else{
			console.error('Error: unique ID not found.');
		}
	}

	subscribeEvents(uniqueId:string, events: Array<string>): void{
		//console.log('DYNAMIC COMPONENT - subscribeEvents()');
		let componentRef = this._componentsMap.get(uniqueId);
		if(componentRef){
			for(let i=0; i<events.length; i++){
				//console.log('BEFORE - this.componentRef.instance[' + events[i] + ']');
				componentRef.instance[events[i]].subscribe(event => this.event.emit({
					uniqueId: uniqueId,
					name: events[i],
					data: event
				}));
				//console.log('AFTER - this.componentRef.instance[' + events[i] + ']');
			}
		}else{
			console.error('Error: unique ID not found.');
		}
	}

	getCmp(uniqueId: string): Function {
		return this._componentsMap.get(uniqueId).instance;
	}

	destroyCmp(uniqueId: string): void {
		console.log('DYNAMIC COMPONENT - destroyCmp():', uniqueId);
		this._componentsMap.get(uniqueId).destroy();
		this._componentsMap.delete(uniqueId);
	}

	debug(): void {
		console.log('%c DEBUG', 'background: #222; color: #bada55');
		console.log('%c componentType', 'background: #222; color: #bada55', this.componentType);
		console.log('%c _componentsMap', 'background: #222; color: #bada55', this._componentsMap);
	}

}
