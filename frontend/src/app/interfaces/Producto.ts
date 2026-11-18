export interface Producto {
    id: number,
    nombre: string,
    categoria: string,
    precio: number,
    existencias: number,
    imagen: File | null,
}

export type NuevoProducto = Omit<Producto, 'id'>
