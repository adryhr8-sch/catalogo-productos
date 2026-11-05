import { Service } from '@angular/core';
import productos from './productos.json';
import Producto from '../../../interfaces/Producto';

@Service()
export class ProductosService {
    async getProductos(): Promise<Producto[]> {
        return productos;
    }
}

export default ProductosService;
