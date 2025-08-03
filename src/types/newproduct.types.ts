import { Product } from '@/types/product.types';

export type NewProduct = Pick<Product, '_id' | 'name' | 'price' | 'mainImages'> & {
  isNew?: boolean;
};
