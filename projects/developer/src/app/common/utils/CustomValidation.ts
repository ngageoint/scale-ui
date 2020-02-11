import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';

export interface ValidationMessages {
    'name': string;
    [key: string]: string;
}

export class FormControlWarn extends FormControl { warnings: any; }

export function multipleInputWarning(c: FormControlWarn): { [key: string]: boolean } | null {
    if (!c.value) { return null; }
    c.warnings = { multipleInput: true };
    return null;
}

export function priorityRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
        return { priorityRange: true };
      }
      return null;
    };
  }
