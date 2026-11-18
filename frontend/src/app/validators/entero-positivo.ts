import { AbstractControl, ValidationErrors } from "@angular/forms";

export default function enteroPositivo(control: AbstractControl): ValidationErrors | null {
  return Number.isInteger(control.value) && control.value > 0 ? null : { enteroPositivo: true };
}