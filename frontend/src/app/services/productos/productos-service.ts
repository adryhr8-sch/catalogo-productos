import { inject, Service } from '@angular/core';
import { NuevoProducto, Producto } from '../../interfaces/Producto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import objectToFormData from '../../utils/form-to-data';

@Service()
export default class ProductosService {
  private baseUrl = 'http://127.0.0.1:8000/api/v1/productos/';
  private http = inject(HttpClient);

  listaProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  postProducto(nuevoProducto: NuevoProducto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, objectToFormData(nuevoProducto));
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  editarProducto(id: number, producto: NuevoProducto): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}${id}/`, objectToFormData(producto));
  }
}
