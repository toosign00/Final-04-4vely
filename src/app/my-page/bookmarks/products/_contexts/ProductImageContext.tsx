'use client';

/**
 * @fileoverview 상품 이미지 처리를 위한 React Context
 * @description 상품 이미지 URL을 서버에서 처리하는 기능을 제공하는 Context
 */

import { Product } from '@/types/product.types';
import { createContext, useContext, ReactNode } from 'react';

/**
 * 처리된 상품 이미지 데이터 타입
 * @description 서버에서 이미지 URL이 처리된 상품 데이터
 * @extends Product 기본 상품 타입을 확장
 */
export interface ProcessedProduct extends Product {
  /** 처리된 메인 이미지 URL 배열 */
  mainImages: string[];
}

/**
 * 상품 이미지 처리 함수 타입
 * @description 원본 상품 데이터를 받아 이미지 URL을 처리하여 ProcessedProduct를 반환하는 비동기 함수
 * @param productData - 원본 상품 데이터
 * @returns Promise<ProcessedProduct> - 이미지가 처리된 상품 데이터
 */
export type ProcessProductImagesFunction = (productData: Product) => Promise<ProcessedProduct>;

/**
 * ProductImageContext 타입 정의
 * @description Context를 통해 제공되는 상품 이미지 처리 기능
 */
interface ProductImageContextType {
  /** 상품 이미지를 처리하는 함수 */
  processProductImages: ProcessProductImagesFunction;
}

/**
 * ProductImageContext 생성
 * @description 상품 이미지 처리 기능을 제공하는 React Context
 * @default undefined - Context Provider로 감싸지지 않은 경우 undefined
 */
const ProductImageContext = createContext<ProductImageContextType | undefined>(undefined);

/**
 * ProductImageProvider Props 타입
 * @description Provider 컴포넌트에 전달되는 속성들
 */
interface ProductImageProviderProps {
  /** Provider로 감싸질 자식 컴포넌트들 */
  children: ReactNode;
  /** 상품 이미지 처리 함수 */
  processProductImages: ProcessProductImagesFunction;
}

/**
 * ProductImageProvider 컴포넌트
 * @description 상품 이미지 처리 기능을 하위 컴포넌트에 제공하는 Context Provider
 * @param {ProductImageProviderProps} props - Provider에 전달되는 속성
 * @param {ReactNode} props.children - Provider로 감싸질 자식 컴포넌트들
 * @param {ProcessProductImagesFunction} props.processProductImages - 상품 이미지 처리 함수
 * @returns {JSX.Element} Context Provider 컴포넌트
 *
 * @example
 * ```tsx
 * <ProductImageProvider processProductImages={processImages}>
 *   <ProductList />
 * </ProductImageProvider>
 * ```
 */
export function ProductImageProvider({ children, processProductImages }: ProductImageProviderProps) {
  // Context에 제공할 값 객체 생성
  const contextValue = { processProductImages };

  return <ProductImageContext.Provider value={contextValue}>{children}</ProductImageContext.Provider>;
}

/**
 * useProductImageContext 커스텀 훅
 * @description ProductImageProvider 내에서 상품 이미지 처리 기능에 접근하기 위한 Hook
 * @returns {ProductImageContextType} 상품 이미지 처리 기능을 포함한 Context 값
 * @throws {Error} ProductImageProvider 내에서 사용되지 않은 경우 오류 발생
 *
 * @example
 * ```tsx
 * function ProductComponent() {
 *   const { processProductImages } = useProductImageContext();
 *   // 상품 이미지 처리 로직
 * }
 * ```
 */
export function useProductImageContext(): ProductImageContextType {
  const context = useContext(ProductImageContext);

  // Context Provider 내에서 사용되지 않은 경우 오류 발생
  if (context === undefined) {
    throw new Error('useProductImageContext must be used within a ProductImageProvider. ' + 'Make sure to wrap your component with <ProductImageProvider>.');
  }

  return context;
}
