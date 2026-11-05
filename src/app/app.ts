import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, startWith, Subject } from 'rxjs';
import Producto from '../interfaces/Producto';
import DisponibilidadPipe from './pipes/disponibilidad/disponibilidad-pipe';
import ProductosService from './services/productos/productos-service';

type RangoPrecio = 'todos' | 'economico' | 'medio' | 'alto';

@Component({
  imports: [CommonModule, DisponibilidadPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly busqueda$ = new Subject<string>();
  private readonly categoria$ = new BehaviorSubject<string>('todas');
  private readonly rangoPrecio$ = new BehaviorSubject<RangoPrecio>('todos');
  private readonly listaProductos$ = new BehaviorSubject<Producto[]>([]);

  readonly mostrarProductos = signal<Producto[]>([]);
  readonly categorias = signal<string[]>([]);
  readonly totalProductos = computed<number>(() => this.mostrarProductos().length);
  readonly errorCarga = signal<string>('');

  ngOnInit(): void {
    const termino$: Observable<string> = this.busqueda$.pipe(
      debounceTime(300),
      map((termino) => termino.trim().toLocaleLowerCase()),
      distinctUntilChanged(),
      startWith(''),
    );

    combineLatest([this.listaProductos$, termino$, this.categoria$, this.rangoPrecio$])
      .pipe(
        map(([productos, termino, categoria, rangoPrecio]) =>
          productos.filter((producto) => {
            const coincideNombre = producto.nombre.toLocaleLowerCase().includes(termino);
            const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
            const coincidePrecio = this.coincideRangoPrecio(producto.precio, rangoPrecio);
            return coincideNombre && coincideCategoria && coincidePrecio;
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((productos) => {
        this.mostrarProductos.set(productos);
      });

    void this.refrescar();
  }

  buscar(termino: string): void {
    this.busqueda$.next(termino);
  }

  filtrarCategoria(categoria: string): void {
    this.categoria$.next(categoria);
  }

  filtrarPrecio(rangoPrecio: string): void {
    if (rangoPrecio === 'todos' || rangoPrecio === 'economico' || rangoPrecio === 'medio' || rangoPrecio === 'alto') {
      this.rangoPrecio$.next(rangoPrecio);
    }
  }

  async refrescar(): Promise<void> {
    this.errorCarga.set('');

    try {
      const productos = await this.productosService.getProductos();
      this.categorias.set([...new Set(productos.map((producto) => producto.categoria))]);
      this.listaProductos$.next(productos);
    } catch (error) {
      console.error('No fue posible cargar los productos.', error);
      this.errorCarga.set('No fue posible cargar los productos. Intenta actualizar.');
    }
  }

  private coincideRangoPrecio(precio: number, rangoPrecio: RangoPrecio): boolean {
    switch (rangoPrecio) {
      case 'economico':
        return precio <= 200;
      case 'medio':
        return precio > 200 && precio <= 400;
      case 'alto':
        return precio > 400;
      case 'todos':
        return true;
    }
  }
}
