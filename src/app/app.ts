import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Producto from '../interfaces/Producto';
import DisponibilidadPipe from './pipes/disponibilidad/disponibilidad-pipe';
import ProductosService from './services/productos/productos-service';

@Component({
  imports: [CommonModule, FormsModule, DisponibilidadPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private productos: ProductosService = inject(ProductosService);
  private _productos_lista: Producto[] = [];
  
  mostrarProductos: Producto[] = [];
  busqueda: string = '';

  constructor() {
    this.refrescar();
  }

  filtrarProductos(): void {
    this.mostrarProductos =
      this.busqueda.trim() !== ''
        ? this._productos_lista.filter((producto) =>
            producto.nombre.toLowerCase().includes(this.busqueda.toLowerCase()),
          )
        : this._productos_lista;
  }

  refrescar(): void {
    this.productos.getProductos().then((lista) => {
      this._productos_lista = lista;
      this.filtrarProductos();
    });
  }
}
