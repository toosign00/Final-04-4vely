import dayjs from 'dayjs';

function getTime(day = 0, second = 0) {
  return dayjs().add(day, 'days').add(second, 'seconds').format('YYYY.MM.DD HH:mm:ss');
}

export const initData = async (clientId, nextSeq) => {
  return {
    // 회원
    user: [
      {
        _id: await nextSeq('user'),
        email: 'admin@market.com',
        password: '$2a$10$Xlj.lkOmtXCch8UhtCuZAuFl1vTgTvmNQwYVfMSMr5GvgV6gmJV46',
        name: '테스트 관리자',
        phone: '01011112222',
        address: '테스트시 테스트구 관리자동 123',
        type: 'admin',
        loginType: 'email',
        image: `/files/${clientId}/user_admin.png`,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          birthday: '11-07',
        },
      },
      {
        _id: await nextSeq('user'),
        email: 'test@test.com',
        password: '$2a$10$I/Mi2LNNyS7/Jf6buPzJK.01XUWXd3QefUGl2uodoH9TA4YhOhIhW',
        name: '테스트 유저 1',
        phone: '01012345678',
        address: '테스트시 테스트구 테스트동 123',
        type: 'user',
        loginType: 'email',
        image: `/files/${clientId}/user-test1.png`,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          birthday: '01-01',
        },
      },
      {
        _id: await nextSeq('user'),
        email: 'test2@test.com',
        password: '$2a$10$I/Mi2LNNyS7/Jf6buPzJK.01XUWXd3QefUGl2uodoH9TA4YhOhIhW',
        name: '테스트 유저 2',
        phone: '01012345678',
        address: '테스트시 테스트구 테스트동 456',
        type: 'user',
        loginType: 'email',
        image: `/files/${clientId}/user-test2.png`,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          birthday: '01-02',
        },
      },
    ],

    // 상품
    product: [
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '하트 호야', // 상품명
        price: 18000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 12, // 판매된 수량
        mainImages: [`/files/${clientId}/hoya_heart_black.webp`, `/files/${clientId}/hoya_heart_brown.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>통통한 하트모양의 잎이 사랑스러운 하트호야는 예쁜 생김새는 물론이고 키우기도 까다롭지 않아 식물을 처음 키우는 초보 식집사에게 선물하기 좋은 식물입니다. 그 사랑스러운 생김새 떄문에 서양에서는 연인에게 발렌타인 데이에 하트호야를 선물한다고 해요. 그래서 'Sweetheart Vine', 'Valentine's Hoya'라고도 불리운답니다. 통통한 잎에는 수분을 많이 머금고 있어 물을 자주 주지 않아도 되고, 평균 실내 습도에서도 잘 자라 대표적인 순둥이 식물이랍니다. 식물 가게에서 하트모양의 잎만 뿅 심겨져 있는 하트호야도 많이 보셨을텐데, 이 잎꽂이 하트호야는 생장점 없이 뿌리만 발달되어 새 잎이 나거나 꽃이 피지 않고 그 모양 그대로 유지된다고 해요. 원래의 하트호야는 줄기를 늘어뜨리며 자라는 덩굴식물이에요. 밝은 빛을 충분히 받고 자라면 아름다운 꽃도 보실 수 있답니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          category: ['식물', '소형', '쉬움'], // 상품 카테고리(array)
          sort: 1, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '스파티필름', // 상품명
        price: 20000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 15, // 판매된 수량
        mainImages: [`/files/${clientId}/Spathiphyllum_black.webp`, `/files/${clientId}/Spathiphyllum_brown.webp`, `/files/${clientId}/Spathiphyllum_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>스파티필름은 공기 정화 능력이 매우 뛰어난 식물이에요. 게다가 빛이 많이 들지 않는 환경에서도 잘 견디고 꽃도 피우기 때문에 초보가드너도 쉽게 키울 수 있는 실내 공기정화 식물이랍니다. 스파티필름(Spathiphyllum)은 ‘포엽(leaf spathe)’을 뜻하는 말로, 꽃처럼 보이는 하얀 잎이 바로 '포엽'이랍니다. 잎에는 독성이 있어 반려동물이 있는 집에서는 주의해서 키워야 해요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          category: ['식물', '중형', '보통'], // 상품 카테고리(array)
          sort: 2, // 상품 정렬 순서(number)
        },
      },
    ],

    // 주문
    order: [],

    // 후기
    review: [],

    // 장바구니
    cart: [],

    // 즐겨찾기/북마크
    bookmark: [],

    // QnA, 공지사항 등의 게시판
    post: [
      {
        _id: await nextSeq('post'),
        type: 'community',
        views: 23,
        user: {
          _id: 2,
          name: '네오',
          image: `/files/${clientId}/user-neo.png`,
        },
        title: '회원 가입했어요.',
        content: '잘 부탁드려요.',
        createdAt: getTime(-1, -60 * 60 * 14),
        updatedAt: getTime(-1, -60 * 60 * 2),
      },
    ],

    // 코드
    code: [],

    // 설정
    config: [],
  };
};
