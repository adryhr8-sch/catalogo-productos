import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subject,
} from 'rxjs';
import { Producto } from './interfaces/Producto';
import ProductosService from './services/productos/productos-service';
import { ProductoComp } from './components/producto-comp/producto-comp';
import { Formulario } from './components/formulario/formulario';
import { DecimalPipe } from '@angular/common';

type RangoPrecio = 'todos' | 'economico' | 'medio' | 'alto';
type CriterioOrdenar = 'id' | 'nombre' | 'precio' | 'existencias';

@Component({
  imports: [ProductoComp, Formulario, DecimalPipe],
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
  private readonly criterioOrdenar$ = new BehaviorSubject<CriterioOrdenar>('id');
  private readonly listaProductos$ = new BehaviorSubject<Producto[]>([]);
  private readonly productosapi = inject(ProductosService);

  readonly mostrarProductos = signal<Producto[]>([]);
  readonly categorias = signal<string[]>([]);
  readonly errorCarga = signal<string>('');
  readonly productoSeleccionado = signal<Producto | null>(null);
  readonly totalProductos = computed<number>(() => this.mostrarProductos().length);
  readonly precioPromedio = computed<number>(
    () =>
      this.mostrarProductos().reduce((acc, p) => acc + Number(p.precio || 0), 0) /
      this.totalProductos(),
  );
  readonly precioMinimo = computed<number>(() => {
    if (!this.totalProductos()) return 0;
    return this.mostrarProductos().reduce(
      (min, p) => Math.min(min, Number(p.precio || 0)),
      Number.MAX_SAFE_INTEGER,
    );
  });
  readonly precioMaximo = computed<number>(() =>
    this.mostrarProductos().reduce((max, p) => Math.max(max, Number(p.precio || 0)), 0),
  );

  ngOnInit(): void {
    const termino$: Observable<string> = this.busqueda$.pipe(
      debounceTime(300),
      map((termino) => termino.trim().toLocaleLowerCase()),
      distinctUntilChanged(),
      startWith(''),
    );

    combineLatest([
      this.listaProductos$,
      termino$,
      this.categoria$,
      this.rangoPrecio$,
      this.criterioOrdenar$,
    ])
      .pipe(
        map(([productos, termino, categoria, rangoPrecio, criterioOrdenar]) =>
          productos
            .filter((producto) => {
              const coincideNombre = producto.nombre.toLocaleLowerCase().includes(termino);
              const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
              const coincidePrecio = this.coincideRangoPrecio(producto.precio, rangoPrecio);
              return coincideNombre && coincideCategoria && coincidePrecio;
            })
            .sort((a, b) => {
              switch (criterioOrdenar) {
                case 'id':
                  return a.id - b.id;
                case 'nombre':
                  return a.nombre.localeCompare(b.nombre);
                case 'precio':
                  return a.precio - b.precio;
                case 'existencias':
                  return a.existencias - b.existencias;
              }
            }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((productos) => {
        this.mostrarProductos.set(productos);
      });

    this.refrescar();
  }

  guardarProducto(producto: Producto): void {
    console.log('Producto creado: ', producto);
    this.refrescar();
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado.update((prod) => (producto === prod ? null : producto));
  }

  eliminarProducto(id: number): void {
    this.productosapi.eliminarProducto(id).subscribe({
      next: () => {
        this.refrescar();
      },
      error: (error) => {
        console.error('Error al eliminar el libro:', error);
        this.errorCarga.set('No se pudo eliminar el libro. Inténtalo de nuevo.');
      },
    });
  }

  buscar(termino: string): void {
    this.busqueda$.next(termino);
  }

  filtrarCategoria(categoria: string): void {
    this.categoria$.next(categoria);
  }

  filtrarPrecio(rangoPrecio: string): void {
    if (
      rangoPrecio === 'todos' ||
      rangoPrecio === 'economico' ||
      rangoPrecio === 'medio' ||
      rangoPrecio === 'alto'
    ) {
      this.rangoPrecio$.next(rangoPrecio);
    }
  }

  ordenarPor(criterio: string): void {
    if (
      criterio === 'id' ||
      criterio === 'nombre' ||
      criterio === 'precio' ||
      criterio === 'existencias'
    ) {
      this.criterioOrdenar$.next(criterio);
    }
  }

  refrescar(): void {
    this.errorCarga.set('');

    this.productosService.listaProductos().subscribe({
      next: (productos) => {
        this.categorias.set([...new Set(productos.map((producto) => producto.categoria))]);
        this.listaProductos$.next(productos);
      },
      error: (error) => {
        console.error('No fue posible cargar los productos.', error);
        this.errorCarga.set('No fue posible cargar los productos. Intenta actualizar.');
      },
    });
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
