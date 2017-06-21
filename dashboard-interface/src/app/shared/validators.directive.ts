import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxValidator(maxValue: number): ValidatorFn {
	return (control: AbstractControl): {[key: string]: any} => {
		const value = control.value;
		console.log('value', value);
		return (value!==null && (value>maxValue)) ? {'maxValue': {name}} : null;
	};
}

export function minValidator(minValue: number): ValidatorFn {
	return (control: AbstractControl): {[key: string]: any} => {
		const value = control.value;
		console.log('value', value);
		return (value!==null && (value<minValue)) ? {'minValue': {name}} : null;
	};
}
