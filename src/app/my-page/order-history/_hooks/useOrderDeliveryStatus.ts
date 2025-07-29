import { useMemo } from 'react';

export const useOrderDeliveryStatus = (deliveryStatus: string) => {
  const getProgressStep = (status: string) => {
    switch (status) {
      case 'preparing':
        return 1;
      case 'shipping':
        return 2;
      case 'completed':
        return 3;
      default:
        return 1;
    }
  };

  const getStepColor = (step: number, currentStep: number) => {
    if (currentStep >= step) {
      switch (step) {
        case 1:
          return 'bg-orange-500';
        case 2:
          return 'bg-blue-500';
        case 3:
          return 'bg-green-500';
        default:
          return 'bg-gray-300';
      }
    }
    return 'bg-gray-300';
  };

  const getCurrentStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return '준비 중';
      case 'shipping':
        return '배송 중';
      case 'completed':
        return '배송 완료';
      default:
        return '준비 중';
    }
  };

  const currentStep = useMemo(() => getProgressStep(deliveryStatus), [deliveryStatus]);
  const statusText = useMemo(() => getCurrentStatusText(deliveryStatus), [deliveryStatus]);

  return {
    currentStep,
    statusText,
    getStepColor,
  };
};