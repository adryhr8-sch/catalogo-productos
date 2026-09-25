import { Injectable, Service } from '@angular/core';
import productos from './productos.json';
import Producto from '../../../interfaces/Producto';

@Service()
export default class ProductosService {
    async getProductos(): Promise<Producto[]> {
        return productos;
    }
}
