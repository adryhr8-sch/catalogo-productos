import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'disponibilidad',
})
export default class DisponibilidadPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 0) {
      return 'Disponible';
    } else {
      return 'Agotado';
    }
  }
}
