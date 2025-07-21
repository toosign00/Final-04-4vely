'use client';

import { StaticImageData } from 'next/image';
import { useCallback, useState } from 'react';

/**
 * 이미지 업로드 관련 커스텀 훅
 */
export const useImageUpload = (maxImages: number = 10) => {
  const [images, setImages] = useState<(string | StaticImageData)[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 추가
  const addImage = useCallback(
    (image: string | StaticImageData) => {
      if (images.length >= maxImages) {
        setError(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
        return false;
      }

      setImages((prev) => [...prev, image]);
      setError(null);
      return true;
    },
    [images.length, maxImages],
  );

  // 이미지 제거
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return null;

      // 파일 크기 검증 (5MB 제한)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('파일 크기는 5MB를 초과할 수 없습니다.');
        return null;
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('지원되는 이미지 형식: JPEG, PNG, GIF, WebP');
        return null;
      }

      try {
        setUploading(true);
        setError(null);

        // 실제 구현에서는 서버로 파일 업로드

        // 현재는 임시로 파일 이름을 URL로 사용
        const imageUrl = `/images/${file.name}`;

        // 업로드 성공 후 이미지 목록에 추가
        const added = addImage(imageUrl);
        return added ? imageUrl : null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.';
        setError(errorMessage);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [addImage],
  );

  // 여러 파일 업로드 처리
  const handleMultipleFileUpload = useCallback(
    async (files: FileList) => {
      const results = await Promise.all(Array.from(files).map((file) => handleFileUpload(file)));
      return results.filter(Boolean);
    },
    [handleFileUpload],
  );

  // 이미지 URL 직접 추가
  const addImageUrl = useCallback(
    (url: string) => {
      return addImage(url);
    },
    [addImage],
  );

  // 이미지 순서 변경
  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, []);

  // 모든 이미지 제거
  const clearImages = useCallback(() => {
    setImages([]);
    setError(null);
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 초기 이미지 설정
  const setInitialImages = useCallback((initialImages: (string | StaticImageData)[]) => {
    setImages(initialImages);
    setError(null);
  }, []);

  return {
    // 상태
    images,
    uploading,
    error,

    // 정보
    imageCount: images.length,
    canAddMore: images.length < maxImages,
    maxImages,
    remainingSlots: maxImages - images.length,

    // 액션
    addImage,
    removeImage,
    handleFileUpload,
    handleMultipleFileUpload,
    addImageUrl,
    reorderImages,
    clearImages,
    clearError,
    setError,
    setInitialImages,
  };
};
