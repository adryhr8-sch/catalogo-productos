import { Component, input, output } from '@angular/core';
import { Producto } from '../../interfaces/Producto';
import { CommonModule } from '@angular/common';
import DisponibilidadPipe from '../../pipes/disponibilidad/disponibilidad-pipe';

@Component({
  imports: [CommonModule, DisponibilidadPipe],
  selector: 'app-producto-comp',
  styleUrl: './producto-comp.css',
  templateUrl: './producto-comp.html',
})
export class ProductoComp {
  readonly producto = input.required<Producto>();
  readonly seleccionado = input<boolean>(false);
  readonly seleccionar = output<Producto>();
  readonly eliminar = output<number>();
}
