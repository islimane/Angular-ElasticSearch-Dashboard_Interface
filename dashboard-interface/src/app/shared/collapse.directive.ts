import { Directive, Input, HostBinding, ElementRef, Renderer } from '@angular/core'

@Directive(
	{selector: '[collapse]'}
)

export class Collapse {

	@HostBinding('class.collapsing')
	private isCollapsing:boolean

	// style
	@HostBinding('style.height')
	private height: string;
	private h: any = null;

	@Input()

	private set collapse(value:boolean) {
		if(value!==undefined){
			if(value){
				this.hide();
			}else {
				this.show();
			}
		}
	}

	constructor(public el: ElementRef) {
		console.log('COLLAPSE DIRECTIVE - el:' + el.nativeElement.scrollHeight);
		this.measureHeight();
	}

	measureHeight() {
		let elem = this.el.nativeElement;
		console.log('COLLAPSE DIRECTIVE - elem:', elem);
		//lets be sure the element has display:block style
		elem.className = elem.className.replace('collapse', '');
		//this.h = elem.scrollHeight;

		console.log('COLLAPSE DIRECTIVE - offsetHeight:' + elem.offsetHeight);
		console.log('COLLAPSE DIRECTIVE - h:', this.h);
	}

	hide(){
		if(this.h===null) this.h = this.el.nativeElement.scrollHeight;
		this.height = this.h +'px'
		console.log('COLLAPSE DIRECTIVE - h:', this.h);
		setTimeout(() => {
				this.height = '0px';
				this.isCollapsing = true;//apply 'collapsing' class
		},1);
	}

	show() {
		this.height = '0px'
		setTimeout(() => {
				this.height = this.h + 'px';
				console.log('COLLAPSE DIRECTIVE - h:', this.h);
				this.isCollapsing = true;//apply 'collapsing' class
		},1);
	}
}
