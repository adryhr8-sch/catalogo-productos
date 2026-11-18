import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import ProductosService from '../../services/productos/productos-service';
import { NuevoProducto, Producto } from '../../interfaces/Producto';
import textoNoVacio from '../../validators/texto-no-vacio';
import enteroPositivo from '../../validators/entero-positivo';
import { CommonModule } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-formulario',
  styleUrl: './formulario.css',
  templateUrl: './formulario.html',
})
export class Formulario {
  private readonly productosapi = inject(ProductosService);

  readonly producto = input<Producto | null>(null);
  readonly guardado = output<Producto>();
  readonly guardando = signal<boolean>(false);
  readonly errorCarga = signal<string>('');

  readonly productoForm = new FormGroup({
    id: new FormControl<number | null>(null),
    nombre: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        textoNoVacio,
      ],
    }),
    categoria: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        textoNoVacio,
      ],
    }),
    precio: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    existencias: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), enteroPositivo],
    }),
    imagen: new FormControl<File | null>(null),
  });

  constructor() {
    effect(() => {
      const producto = this.producto();
      this.errorCarga.set('');
      if (producto) {
        this.productoForm.reset({
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: producto.precio,
          existencias: producto.existencias,
          imagen: null,
        });
      } else {
        this.clearForm();
      }
    });
  }

  private clearForm(): void {
    this.productoForm.reset({
      id: null,
      nombre: '',
      categoria: '',
      precio: 0,
      existencias: 0,
      imagen: null,
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.productoForm.patchValue({ imagen: file });
      this.productoForm.get('imagen')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.errorCarga.set('');
    this.guardando.set(true);

    const { id, nombre, categoria, precio, existencias, imagen } = this.productoForm.getRawValue();
    const producto: NuevoProducto = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      precio: precio,
      existencias: existencias,
      imagen: imagen,
    };
    const request =
      id === null
        ? this.productosapi.postProducto(producto)
        : this.productosapi.editarProducto(id, producto);

    request.subscribe({
      next: (guardado) => {
        this.clearForm();
        this.guardado.emit(guardado);
      },
      error: (error) => {
        console.error('Error al guardar el libro:', error);
        this.errorCarga.set('No se pudo guardar el libro. Revisa tus datos e inténtalo de nuevo.');
      },
      complete: () => {
        this.guardando.set(false);
      },
    });
  }
}
