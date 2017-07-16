import { Directive, ElementRef, Input, Renderer } from '@angular/core';

@Directive({ selector: '[hidden]' })
export class HiddenDirective {

		constructor(public el: ElementRef, public renderer: Renderer) {}

		@Input() hidden: boolean;

		ngOnInit(){
				// Use renderer to render the emelemt with styles
				console.log(this.hidden)
				if(this.hidden) {
						this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
				}
		}
}
