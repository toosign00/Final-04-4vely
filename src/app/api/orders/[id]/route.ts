import { updateOrderStatusAction } from '@/lib/actions/order/orderSchedulerActions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, message: '유효하지 않은 주문 ID입니다.' }, { status: 400 });
    }

    const body = await request.json();
    const { status, action } = body.extra || {};

    if (!status || !action) {
      return NextResponse.json({ success: false, message: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const result = await updateOrderStatusAction(orderId, status, action);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('API 요청 처리 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, message: '유효하지 않은 주문 ID입니다.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `주문 ${orderId} API 엔드포인트가 활성화되어 있습니다.`,
        orderId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('API 요청 처리 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 },
    );
  }
}
