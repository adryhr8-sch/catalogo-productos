import { AbstractControl, ValidationErrors } from "@angular/forms";

export default function textoNoVacio(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { textoNoVacio: true };
}