// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  size: 'small' | 'medium' | 'large';
  difficulty: 'easy' | 'medium' | 'hard';
  light: 'low' | 'medium' | 'high';
  space: 'indoor' | 'outdoor';
  season: 'spring' | 'summer' | 'fall' | 'winter';
  isNew: boolean;
  isBookmarked: boolean;
  recommend: boolean;
}

export interface CategoryFilter {
  size: string[];
  difficulty: string[];
  light: string[];
  space: string[];
  season: string[];
}

export interface SortOption {
  value: string;
  label: string;
}
