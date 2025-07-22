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

    /* 상품 카테고리
    1~65 : 식물 / 66~77 : 원예 용품

    < 식물 >
    '소형', '중형', '대형', ---> 크기
    '쉬움', '보통', '어려움', ---> 난이도
    '음지', '간접광', '직사광', ---> 빛 조건
    '실외', '거실', '침실', '욕실', '주방', '사무실', ---> 공간
    '봄', '여름', '가을', '겨울' ---> 계절

    < 원예 용품 >
    '화분', '도구', '조명' */

    /* 상품 태그
    태그명 - 태그설명

    < 식물 >
    // 물 주기 빈도
    매일 물주기 - 매일
    주 1회 물주기 - 일주일에 한 번
    월 1회 물주기 - 한 달에 한 번

    // 습도 관련
    다습 식물 - 높은 습도 필요
    보통 습도 - 일반 실내 습도 적응
    건조 식물 - 건조한 환경 적응

    // 온도/계절 관련
    따뜻함 선호 - 따뜻한 온도 선호
    서늘함 선호 - 서늘한 온도 선호
    봄이 좋아요 - 봄철 활발한 성장
    더위 내성 - 여름 더위 잘 견딤
    겨울잠 - 겨울철 휴면기 
    
    < 원예 용품 >
    신상품, 베스트, 초보자, 관리 쉬움 */
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
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/hoya_heart_black.webp`, `/files/${clientId}/hoya_heart_brown.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>통통한 하트모양의 잎이 사랑스러운 하트호야는 예쁜 생김새는 물론이고 키우기도 까다롭지 않아 식물을 처음 키우는 초보 식집사에게 선물하기 좋은 식물입니다. 그 사랑스러운 생김새 떄문에 서양에서는 연인에게 발렌타인 데이에 하트호야를 선물한다고 해요. 그래서 'Sweetheart Vine', 'Valentine's Hoya'라고도 불리운답니다.</p>
            <p>통통한 잎에는 수분을 많이 머금고 있어 물을 자주 주지 않아도 되고, 평균 실내 습도에서도 잘 자라 대표적인 순둥이 식물이랍니다. 식물 가게에서 하트모양의 잎만 뿅 심겨져 있는 하트호야도 많이 보셨을텐데, 이 잎꽂이 하트호야는 생장점 없이 뿌리만 발달되어 새 잎이 나거나 꽃이 피지 않고 그 모양 그대로 유지된다고 해요.</p>
            <p>원래의 하트호야는 줄기를 늘어뜨리며 자라는 덩굴식물이에요. 밝은 빛을 충분히 받고 자라면 아름다운 꽃도 보실 수 있답니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '가을',
          ],
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
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/Spathiphyllum_black.webp`, `/files/${clientId}/Spathiphyllum_brown.webp`, `/files/${clientId}/Spathiphyllum_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>스파티필름은 공기 정화 능력이 매우 뛰어난 식물이에요. 게다가 빛이 많이 들지 않는 환경에서도 잘 견디고 꽃도 피우기 때문에 초보가드너도 쉽게 키울 수 있는 실내 공기정화 식물이랍니다.</p>
            <p>스파티필름(Spathiphyllum)은 ‘포엽(leaf spathe)’을 뜻하는 말로, 꽃처럼 보이는 하얀 잎이 바로 '포엽'이랍니다. 잎에는 독성이 있어 반려동물이 있는 집에서는 주의해서 키워야 해요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '음지',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '가을',
          ],
          sort: 2, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '몬스테라 아단소니', // 상품명
        price: 24000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 10, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/monstera_adansonii_black.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>몬스테라 아단소니는 관리가 쉬운 식물로, 잎에 구멍이 나 있는 듯한 화려한 무늬가 특징입니다. 덩굴식물이기 때문에 화분 위로 뻗으며, 말뚝이나 격자를 따라 기어오를 수 있습니다.</p>
            <p>중남미 전역에서 흔히 발견되는 몬스테라 아단소니는 열대우림의 우림 아래 큰 나무 줄기에서 자랍니다. 따라서 이 식물은 간접적인 햇빛과 높은 습도를 선호합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '욕실',
            '주방',
            '봄',
            '여름',
          ],
          sort: 3, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '옥잠화', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 35, // 상품 재고
        buyQuantity: 11, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/ocjamhwa_gray.webp`, `/files/${clientId}/ocjamhwa_brown.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>옥잠화는 가장 사랑받는 다육식물 중 하나입니다. 관리가 쉽고 오래가는 이 식물은 대대로 물려줄 수 있어 가족의 가보가 될 수 있습니다.</p>
            <p>간접광으로 밝은 곳에 두고 흙이 완전히 말랐을 때만 물을 주세요. 둥근 잎에 해충이 없도록 정기적으로 먼지를 털어주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '건조 식물', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 4, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '나비란', // 상품명
        price: 19000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 13, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/nabiran_black.webp`, `/files/${clientId}/nabiran_brown.webp`, `/files/${clientId}/nabiran_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>나비란은 실내 식물 중 적응력이 가장 뛰어나며 키우기도 매우 쉽습니다. 이 우아한 식물은 테이블 위부터 벽난로까지, 또는 아름다운 아치형 잎으로 매달아 두는 식물까지 어디에서나 돋보입니다.</p>
            <p>반려동물과 함께 키우기 좋은 나비란은 공기 정화 효과로도 유명하여 집안에 건강한 분위기를 더해줍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '봄이 좋아요'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 5, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '팔러 팜', // 상품명
        price: 29000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 20, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/parlor_palm_black.webp`, `/files/${clientId}/parlor_palm_brown.webp`, `/files/${clientId}/parlor_palm_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>느리게 자라는 이 소형 야자나무는 다양한 조명 환경과 좁은 공간에서 잘 자랍니다. 짙은 녹색 잎은 무성하고 풍성한 식물로, 탁상, 책상, 선반에 놓으면 더욱 아름답습니다.</p>
            <p>팔러 팜은 밝고 여과된 빛에서 가장 잘 자라지만, 어두운 곳에서도 잘 적응합니다. 관리가 거의 필요 없으며, 뛰어난 공기 청정 효과를 자랑합니다.</p>
            <p>적응력이 뛰어난 실내 식물로, 재배 환경이 좋지 않은 사무실이나 사업장에 적합합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 6, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '드라세나 골든 하트', // 상품명
        price: 28000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 19, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/dracaena_black.webp`, `/files/${clientId}/dracaena_brown.webp`, `/files/${clientId}/dracaena_blue.webp`, `/files/${clientId}/dracaena_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>드라세나 골든 하트는 실내에서 키우기 가장 쉬운 식물 중 하나입니다. 밝은 줄무늬 잎은 거의 모든 실내 환경에 잘 적응하며 잘 자랍니다.</p>
            <p>윤기 나는 녹색에서 노란색 잎을 가진 이 열대 식물은 직립형으로 빛이 적은 실내 식물로 잘 자라며 형광등에도 잘 적응합니다. 간접적인 밝은 빛에서도 잘 자라며 잎의 색이 밝아집니다.</p>
            <p>드라세나 골든 하트는 아프리카 열대 지역이 원산지입니다. 다양한 환경에 잘 견디기 때문에 식물을 처음 키우는 사람에게도 훌륭한 선택입니다.</p>
            <p>흙이 거의 마르면 물을 주세요. 잎 끝이 갈색으로 변하면 날카로운 전정 가위를 사용하면 잎이 아름답게 유지됩니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
          ],
          sort: 7, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '브로멜리아드', // 상품명
        price: 22000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/bromeliad_black.webp`, `/files/${clientId}/bromeliad_brown.webp`, `/files/${clientId}/bromeliad_gray.webp`, `/files/${clientId}/bromeliad_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>화려하고 관리가 쉬운 브로멜리아드는 집안에 따스함을 더하는 매력적인 실내 식물입니다.</p>
            <p>밝고 화사한 자홍색 꽃을 자랑하는 이 브로멜리아드는 반려동물과 함께 키우기 좋으며, 식물 애호가나 식물 초보자에게 훌륭한 선물이 됩니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '실외',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 8, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 버킨', // 상품명
        price: 29000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 11, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_birkin_black.webp`, `/files/${clientId}/philodendron_birkin_brown.webp`, `/files/${clientId}/philodendron_birkin_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>필로덴드론 버킨은 윤기 있고 두꺼운 잎에 섬세한 흰색 핀스트라이프 무늬가 있는 순한 식물입니다. 다양한 실내 환경에 잘 적응하는 버킨은 어떤 집에서든 시선을 사로잡는 식물입니다.</p>
            <p>오랜 식물 애호가든, 이제 막 친환경 생활을 시작하든, 버킨의 순한 성격 덕분에 특별한 식물에 대한 지식 없이도 아름다운 자태를 즐길 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 9, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 문라이트', // 상품명
        price: 32000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 35, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '흰색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_moonlight_black.webp`, `/files/${clientId}/philodendron_moonlight_white.webp`, `/files/${clientId}/philodendron_moonlight_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>네온 옐로우 색상의 새 잎이 밝고 윤기 나는 녹색으로 자라는 필로덴드론 문라이트로 집안에 생기를 더하세요. 이 간편한 식물은 밝은 간접광에서 잘 자라며 어떤 실내 공간에도 열대적인 분위기를 더합니다.</p>
            <p>식물을 처음 키우는 초보자와 경험 많은 애호가 모두에게 적합한 문라이트는 오랫동안 어떤 집이든 밝게 빛내줄 사려 깊고 오래가는 선물이 될 것입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 10, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '알로카시아 폴리', // 상품명
        price: 32000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 18, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/alocasia_polly_black.webp`, `/files/${clientId}/alocasia_polly_brown.webp`, `/files/${clientId}/alocasia_polly_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>알로카시아 폴리는 은빛 잎맥이 반짝이는 짙은 화살촉 모양의 잎을 가진 아름다운 식물입니다. 집안에서 따뜻하고 밝은 곳에 이 아름다운 식물을 두면 잘 자랄 것입니다.</p>
            <p>남태평양 섬의 열대 지방, 특히 필리핀이 원산지인 알로카시아 폴리는 주방이나 욕실의 습도를 좋아합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '간접광',
            '직사광',
            '욕실',
            '주방',
            '봄',
            '여름',
          ],
          sort: 11, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '칼라테아 프레디', // 상품명
        price: 27000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 55, // 상품 재고
        buyQuantity: 16, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['남색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/calathea_freddie_blue.webp`, `/files/${clientId}/calathea_freddie_brown.webp`, `/files/${clientId}/calathea_freddie_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>칼라테아 프레디는 칼라테아의 작은 품종으로, 잎이 식물 중앙에서 로제트 모양으로 자랍니다. 섬세하고 물결치는 깃털 모양의 잎은 연녹색에 짙은 녹색 줄무늬가 있습니다.</p>
            <p>낮에는 잎이 중앙에서 바깥쪽으로 벌어지고, 저녁에는 기도하는 손처럼 오므라들어 "기도하는 식물"이라는 별명이 붙었습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '어려움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 12, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '골든 포토스', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 32, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/golden_pothos_black.webp`, `/files/${clientId}/golden_pothos_brown.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>골든 포토스는 선반이나 창틀에 꽂아두면 아름다운 폭포처럼 흘러내리는 매력적이고 관리가 쉬운 식물입니다. 하트 모양의 잎에 녹색에서 황금빛 노란색까지 다양한 줄무늬가 있는 이 식물은 시선을 사로잡을 준비가 되어 있습니다.</p>
            <p>포토스는 약한 빛이나 간접광에 두면 잘 자라며, 물을 주는 사이사이에 말리는 것을 좋아합니다. 마디 근처에서 가지치기를 하면 무성하게 자라도록 할 수 있으며, 물에 꽂아 번식시키기도 쉽습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 13, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '버건디 고무나무', // 상품명
        price: 22000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 28, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/burgundy_rubber_tree_black.webp`, `/files/${clientId}/burgundy_rubber_tree_brown.webp`, `/files/${clientId}/burgundy_rubber_tree_white.webp`, `/files/${clientId}/burgundy_rubber_tree_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>강인하고 드라마틱한 버건디 고무나무는 튼튼하고 곧은 줄기에 크고 윤기 나는 잎을 자랑합니다.</p>
            <p>짙은 숲의 녹색부터 풍부한 버건디 레드까지, 어둡고 무드 있는 색상 팔레트로 집안 분위기를 한층 더 돋보이게 할 이 매력적인 식물은 관리가 쉽습니다.</p>
            <p>밝은 간접광이 드는 곳에서 가장 잘 자랍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '간접광',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 14, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '피쿠스 티네케', // 상품명
        price: 24000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/ficus_tineke_black.webp`, `/files/${clientId}/ficus_tineke_brown.webp`, `/files/${clientId}/ficus_tineke_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>인기 있는 버건디 고무나무의 생기 넘치는 동생, 피쿠스 티네케입니다.</p>
            <p>크림색, 노란색, 초록색 등 다채로운 색상의 잎을 자랑하는 이 고무나무는 단독으로 심거나 여러 그루의 나무와 함께 심어도 어떤 인테리어에도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '직사광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 15, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 로호 콩고', // 상품명
        price: 19000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 14, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_congo_rojo_black.webp`, `/files/${clientId}/philodendron_congo_rojo_white.webp`, `/files/${clientId}/philodendron_congo_rojo_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>선명한 붉은색에서 짙은 녹색으로 변하는 눈부시고 윤기 나는 잎으로 유명한 필로덴드론 로호 콩고로 공간을 더욱 돋보이게 하세요.</p>
            <p>관리가 쉽고 곧게 자라는 이 식물은 어떤 실내 공간에도 싱그러운 열대 분위기를 더하는 동시에 공기를 정화합니다.</p>
            <p>식물 초보자와 숙련된 애호가 모두에게 적합한 로호 콩고는 밝은 간접광에서 잘 자라며 일반적인 실내 습도에도 잘 적응합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 16, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '캥거루 고사리', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 17, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/kangaroo_fern_black.webp`, `/files/${clientId}/kangaroo_fern_brown.webp`, `/files/${clientId}/kangaroo_fern_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 활기차고 반려동물 친화적인 고사리는 독특한 짙은 녹색 잎을 가지고 있습니다.</p>
            <p>캥거루 고사리는 뿌리줄기라고 불리는 길고 솜털 같은 뿌리가 자랍니다. 자연 서식지에서는 이 뿌리를 이용하여 숲 바닥으로 뻗어 나갑니다.</p>
            <p>고사리의 습한 자연 환경을 재현하려면 자주 분무해 주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '침실',
            '욕실',
            '주방',
            '봄',
            '여름',
          ],
          sort: 17, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '포니테일 팜', // 상품명
        price: 33000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/ponytail_palm_black.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>포니테일 팜은 가뭄에 강한 관엽식물로, 굵은 잎사귀가 어떤 공간에도 이국적인 분위기를 더합니다.</p>
            <p>멕시코 남동부 건조한 지역이 원산지인 이 아가베과 다육식물은 구근 모양의 줄기에 수분을 저장하기 때문에 관리가 쉽고, 모든 연령대의 사람들이 쉽게 키울 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '직사광',
            '실외',
            '거실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 18, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '얼룩무늬 셰플레라', // 상품명
        price: 37000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 35, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/variegated_schefflera_black.webp`, `/files/${clientId}/variegated_schefflera_brown.webp`, `/files/${clientId}/variegated_schefflera_white.webp`, `/files/${clientId}/variegated_schefflera_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>우산 모양의 잎을 가진 장난기 넘치는 관엽식물, 얼룩무늬 셰플레라는 집 안에서 키우기 딱 좋은 식물입니다.</p>
            <p>크림색과 짙은 녹색이 어우러진 이 식물은 아담한 모양, 대담한 무늬, 그리고 온화한 성격 덕분에 처음 식물을 키우는 사람에게 선물하기에도 좋습니다.</p>
            <p>이 식물은 약한 간접광에서 밝은 간접광까지 좋아하며, 물을 자주 주지 않아도 됩니다. 잎에 먼지를 자주 털어주면 깨끗하게 유지할 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 19, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '발틱 블루 포토스', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 14, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/baltic_blue_pothos_black.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>길고 윤기 나는 잎에 자라면서 '창문'이라고 불리는 흥미로운 구멍이 생깁니다. 덩굴성으로 자라는 이 식물은 선반, 창틀 또는 행잉 플랜트로 사용하기에 안성맞춤입니다.</p>
            <p>짙은 녹색 잎은 자라면서 청록색으로 변합니다. 밝은 직사광선에서 잘 자라는 이 인기 있는 간편 식물은 여러분의 컬렉션에 꼭 필요한 식물입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '직사광',
            '실외',
            '거실',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 20, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '극락조', // 상품명
        price: 36000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 32, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/geokrak_black.webp`, `/files/${clientId}/geokrak_brown.webp`, `/files/${clientId}/geokrak_white.webp`, `/files/${clientId}/geokrak_blue.webp`, `/files/${clientId}/geokrak_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>극락조는 실내 식물계의 여왕으로 여겨집니다. 이 크고 곧은 식물은 윤기 나는 바나나 모양의 잎이 퍼져 나가 공간에 풍부한 열대 분위기를 더합니다.</p>
            <p>비교적 강건하며 직사광선부터 간접광까지 다양한 빛 조건에 적응하지만, 햇볕이 잘 드는 곳에서 잘 자랍니다.</p>
            <p>극락조를 건강하게 유지하려면 물과 습도가 중요합니다. 흙이 촉촉하게 유지되도록 꾸준히 물을 주어야 하지만, 젖거나 질척거리지 않도록 주의해야 합니다.</p>
            <p>물을 꼼꼼히 주는 것 외에도 습도를 높이기 위해 정기적으로 분무해 주는 것이 좋습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '대형', // 크기
            '보통',
            '간접광',
            '직사광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 21, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 선 레드', // 상품명
        price: 30000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 27, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '흰색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_sun_red_black.webp`, `/files/${clientId}/philodendron_sun_red_gray.webp`, `/files/${clientId}/philodendron_sun_red_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>필로덴드론 선 레드는 생동감 넘치고 윤기 나는 잎이 붉은색과 주황색으로 변하며, 짙은 녹색으로 자라는 아름다운 관엽식물입니다.</p>
            <p>시각적으로 아름다운 필로덴드론은 장식용 식물로도, 사려 깊은 선물로도 훌륭한 선택이며, 실내 공간에 생기를 더합니다.</p>
            <p>잘 자라려면 밝은 간접광과 정기적인 물주기가 필요하며, 물주기 사이에 흙이 살짝 마르도록 해야 합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 22, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '올리브 나무', // 상품명
        price: 27000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 16, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/olive_tree_black.webp`, `/files/${clientId}/olive_tree_brown.webp`, `/files/${clientId}/olive_tree_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>은은하게 빛나는 세이지 그린 잎을 가진 올리브 나무는 당신의 집 인테리어에 섬세한 색감과 질감을 더할 준비가 되었습니다.</p>
            <p>지중해가 원산지인 이 우아한 식물은 잘 자라려면 밝고 직사광선이 충분히 필요합니다 (햇살이 잘 드는 남향 창문을 추천합니다).</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '직사광',
            '실외',
            '거실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 23, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '백색 난초', // 상품명
        price: 30000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 33, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/white_orchid_black.webp`, `/files/${clientId}/white_orchid_brown.webp`, `/files/${clientId}/white_orchid_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>우아하고 아담한 실내 식물로, 어떤 공간에도 시대를 초월하는 우아함을 선사합니다.</p>
            <p>맑고 깨끗한 하얀 꽃과 부드럽게 휘어진 줄기가 특징인 이 식물은 책상, 선반, 선물용으로 손질이 간편하면서도 아름다운 선택입니다.</p>
            <p>동남아시아가 원산지인 이 난초는 오래가는 꽃을 피우고 일 년 내내 다시 피어나는 것으로 유명합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '보통',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 24, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '머니 트리', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 37, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/money_tree_black.webp`, `/files/${clientId}/money_tree_brown.webp`, `/files/${clientId}/money_tree_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>머니 트리는 열대적인 분위기와 행운을 동시에 선사하는 완벽한 실내 식물로, 관리가 간편합니다.</p>
            <p>정교하게 엮인 줄기와 야자나무처럼 밝은 녹색 잎을 가진 머니 트리는 나무와 야자나무를 동시에 닮았습니다.</p>
            <p>머니 트리라는 이름은 이 식물이 주는 자연적인 풍수에서 유래했습니다. 머니 트리는 주인에게 긍정적인 에너지와 행운을 가져다준다고 알려져 있습니다.</p>
            <p>아름다운 머니 트리는 의미 있는 선물이나 행운의 부적으로도 활용할 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 25, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '실버 포토스', // 상품명
        price: 22000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 18, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/silver_pothos_brown.webp`, `/files/${clientId}/silver_pothos_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>실버 포토스 잎은 녹색 바탕에 빛을 반사하며 반짝이는 메탈릭 실버 무늬가 마치 이 세상 것이 아닌 듯 신비로운 분위기를 자아냅니다.</p>
            <p>눈길을 사로잡는 잎을 가진 이 식물은 신답수스(Scindapsus) 속의 식물로, 포토스과는 다른 모습을 하고 있습니다.</p>
            <p>덩굴식물로 빽빽하게 자라고 관리가 쉬워 벽난로, 선반, 행잉 화분에 심기에 좋습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 26, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '유레카 레몬 트리', // 상품명
        price: 38000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 15, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/eureka_lemon_tree_black.webp`, `/files/${clientId}/eureka_lemon_tree_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>정원사와 인테리어 디자이너들에게 인기 있는 이 인기 과일나무는 키우는 재미가 쏠쏠하며, 새로운 녹색 감각을 시도하고 싶은 분들에게 안성맞춤입니다.</p>
            <p>적절한 환경과 적절한 관리만 있다면, 이 생기 넘치는 나무는 생후 몇 년 안에 선명한 노란색 과일을 맺을 수 있습니다.</p>
            <p>일 년 내내 충분한 햇빛을 쬐어 주세요. 추운 기후에 거주하시는 분들은 여름철에는 테라스에 두고 가을이나 겨울에는 실내에서 키우시는 것을 추천합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '어려움',
            '직사광', // 빛 조건
            '실외',
            '거실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 27, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '산세베리아 문샤인', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/sansevieria_moonshine_black.webp`, `/files/${clientId}/sansevieria_moonshine_brown.webp`, `/files/${clientId}/sansevieria_moonshine_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>식물을 처음 키우거나 관리하기 쉬운 실내 식물을 찾고 있다면 산세베리아가 정답입니다.</p>
            <p>이 강인한 식물은 다양한 재배 환경에 적응력이 뛰어나 꾸준히 인기를 얻고 있습니다. 직사광선은 물론 약한 빛도 잘 견뎌내지만, 간접광에서 가장 잘 자랍니다.</p>
            <p>산세베리아는 서아프리카의 건조한 사막이 원산지이기 때문에, 특히 겨울에는 물을 많이 줄 필요가 없습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움', // 난이도
            '음지',
            '간접광',
            '직사광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 28, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '아프리칸 바이올렛', // 상품명
        price: 28000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 20, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/african_violet_black.webp`, `/files/${clientId}/african_violet_brown.webp`, `/files/${clientId}/african_violet_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>다채로운 꽃 색깔을 자랑하는 빈티지한 아름다움을 지닌 식물입니다.</p>
            <p>선명한 꽃뿐만 아니라, 아프리칸 바이올렛은 부드럽고 솜털 같은 잎을 가지고 있어 독특한 아름다움을 선사합니다.</p>
            <p>적절한 물과 조명만 잘 관리한다면 오랫동안 꽃을 피울 수 있습니다. 흙이 마르기 시작하면 바닥에 물을 주고 간접적인 밝은 빛에 두세요. 아프리칸 바이올렛을 깔끔하게 유지하려면 시든 꽃은 잘라내 주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '어려움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '가을',
            '겨울',
          ],
          sort: 29, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '브로멜리아드 구즈마니아', // 상품명
        price: 29000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/bromeliad_guzmania_black.webp`, `/files/${clientId}/bromeliad_guzmania_brown.webp`, `/files/${clientId}/bromeliad_guzmania_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>브로멜리아드 구즈마니아는 푸른 바다 속에 강렬한 색감을 더합니다. 보기 드물게 오래가는 꽃을 가진 브로멜리아드는 밝은 꽃을 피우는 새싹을 자연스럽게 키우기 때문에 끊임없이 선물하는 식물입니다.</p>
            <p>이는 꽃봉오리가 언젠가 시들고 새싹들이 그 자리를 대신한다는 것을 의미하기도 하므로, 몇 달 후에 꽃 색깔이 바래도 걱정하지 마세요! 자연스러운 현상입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '보통',
            '음지',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
          ],
          sort: 30, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '고양이 야자수', // 상품명
        price: 24000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 34, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/cat_palm_black.webp`, `/files/${clientId}/cat_palm_brown.webp`, `/files/${clientId}/cat_palm_gray.webp`, `/files/${clientId}/cat_palm_white.webp`, `/files/${clientId}/cat_palm_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>고양이 야자수의 푹신한 잎과 짧은 줄기는 마치 오아시스에 온 듯한 느낌을 선사합니다.</p>
            <p>가장 풍성한 식물 중 하나로, 시선을 사로잡을 준비가 되어 있습니다. 고양이 야자수는 관리가 쉽고 간접적인 밝은 빛을 선호합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '대형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 31, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '핑크 얼룩 레몬 트리', // 상품명
        price: 39000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 11, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/variegated_pink_lemon_tree_black.webp`, `/files/${clientId}/variegated_pink_lemon_tree_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>흔하지 않은 과일 덕분에 정원사들에게, 그리고 햇볕이 잘 드는 성격 덕분에 인테리어 디자이너들에게 사랑받는 이 인기 과일나무는 키우는 재미가 쏠쏠하며, 새로운 녹색 감각을 시도하고 싶은 분들에게 안성맞춤입니다.</p>
            <p>적절한 환경과 적절한 관리만 있다면, 이 장난기 넘치는 나무는 선명한 노란색과 녹색 줄무늬가 있는 과일을 맺고, 과육은 분홍색으로 물들어 핑크 레모네이드를 만들기에 안성맞춤입니다!</p>
            <p>일 년 내내 충분한 햇빛을 쬐어 주세요. 추운 기후에 사는 분들은 여름철에는 테라스에 두고 가을이나 겨울에는 실내에서 키우는 것을 추천합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '어려움',
            '직사광',
            '실외',
            '거실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 32, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '커피 나무', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 23, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/coffee_plant_black.webp`, `/files/${clientId}/coffee_plant_brown.webp`, `/files/${clientId}/coffee_plant_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>커피 나무로 식물 컬렉션에 활기를 더하세요. 이 잎이 많은 식물은 윤기 나는 녹색 잎을 자랑하며 밝은 간접 햇빛 아래에서 잘 자랍니다.</p>
            <p>아침 커피를 준비하는 것보다 관리가 간편하여 관리가 쉽고 생활 공간에 아름다운 분위기를 더해줍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '보통',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 33, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '히비스커스', // 상품명
        price: 31000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흰색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/hibiscus_white.webp`, `/files/${clientId}/hibiscus_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>최고의 열대 분위기를 원하신다면 히비스커스만 한 게 없죠. 큼직한 꽃들이 형광빛으로 빛나며 여름 내내 피어납니다.</p>
            <p>햇볕이 잘 드는 야외 공간에 가장 적합하며, 테이블 위에 놓기에도 적당한 크기라 밖으로 나갈 때마다 마치 휴가를 온 듯한 기분을 느낄 수 있습니다.</p>
            <p>꽃 색깔은 식물마다 분홍색, 주황색, 노란색 등 다양합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '보통 습도', '더위 내성'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '직사광',
            '실외',
            '거실',
            '여름',
          ],
          sort: 34, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '산세베리아', // 상품명
        price: 22000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 35, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/sansevieria_black.webp`, `/files/${clientId}/sansevieria_brown.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>실내 식물을 처음 키우거나 관리하기 쉬운 실내 식물을 찾고 있다면 산세베리아가 딱입니다.</p>
            <p>이 강인한 식물은 적응력이 뛰어나고 칼날처럼 날카로운 잎을 가진 것으로 유명합니다. 직사광선은 물론 약한 빛도 잘 견뎌내지만, 밝은 간접광에서 가장 잘 자랍니다.</p>
            <p>산세베리아는 가뭄에도 강해서 조금만 신경 써도 잘 자랍니다. 튼튼한 잎은 정기적으로 닦아 먼지가 쌓이지 않도록 관리해 주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 35, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '아글라오네마 시암', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 25, // 상품 재고
        buyQuantity: 18, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/aglaonema_siam_black.webp`, `/files/${clientId}/aglaonema_siam_brown.webp`, `/files/${clientId}/aglaonema_siam_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>강인하고 아름다운 식물인 아글라오네마 시암은 연분홍색 줄기와 붉은색, 분홍색, 녹색이 어우러진 윤기 나는 잎을 자랑합니다.</p>
            <p>이 아름다운 색상은 햇빛의 양에 따라 다양하게 변합니다. 다양한 조명 조건에 적응할 수 있어 집안 거의 모든 곳에서 잘 자랍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 36, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '칼라테아 핀스트라이프', // 상품명
        price: 27000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 22, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/calathea_pinstripe_black.webp`, `/files/${clientId}/calathea_pinstripe_brown.webp`, `/files/${clientId}/calathea_pinstripe_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 칼라테아 핀스트라이프는 짙은 녹색 잎에 얇은 분홍색 줄무늬가 그려져 있어 어떤 컬렉션에서든 돋보일 것입니다.</p>
            <p>"기도하는 식물"에 속하는 이 식물은 밤에는 잎을 올리고 낮에는 빛에 반응하여 다시 펴집니다.</p>
            <p>칼라테아는 따뜻하고 습한 곳에 두어 흙이 골고루 촉촉하게 유지되도록 관리해 주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '어려움',
            '간접광',
            '침실',
            '욕실',
            '주방',
            '봄',
            '여름',
          ],
          sort: 37, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '드라세나 마지나타', // 상품명
        price: 37000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 19, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색', '남색'],
          },
        ],
        mainImages: [
          `/files/${clientId}/dracaena_marginata_black.webp`,
          `/files/${clientId}/dracaena_marginata_brown.webp`,
          `/files/${clientId}/dracaena_marginata_gray.webp`,
          `/files/${clientId}/dracaena_marginata_white.webp`,
          `/files/${clientId}/dracaena_marginata_blue.webp`,
        ], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>드라세나 품종으로, 얽히고설킨 줄기와 뾰족하고 곧은 잎을 가진 재미있고 대담한 품종입니다.</p>
            <p>마다가스카르 드래곤 트리라고도 불리는 이 화분 나무는 키가 1.2~1.5미터에 달하며, 공기 정화 효과로 잘 알려져 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '대형', // 크기
            '쉬움',
            '음지',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 38, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '금전수', // 상품명
        price: 38000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 32, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/geumjeunsu_black.webp`, `/files/${clientId}/geumjeunsu_brown.webp`, `/files/${clientId}/geumjeunsu_gray.webp`, `/files/${clientId}/geumjeunsu_white.webp`, `/files/${clientId}/geumjeunsu_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 실내 식물은 회복력이 강해 건망증이 있는 식물 주인에게 안성맞춤입니다. 관리가 간편한 금전수는 물 없이도 몇 주 동안 생존할 수 있으며 직사광선을 제외한 모든 빛에서 잘 자랍니다.</p>
            <p>우아한 지팡이 모양의 줄기가 끝으로 갈수록 가늘어지는 이 관엽식물은 윤기 나는 타원형 잎을 가지고 있어 독특한 깃털 모양을 자랑합니다.</p>
            <p>공기 청정기 역할도 하며, 집이나 사무실 공기에서 포름알데히드와 같은 유해 화학 물질을 제거합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '대형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 39, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '붉은 안스리움', // 상품명
        price: 28000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 27, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/red_anthurium_black.webp`, `/files/${clientId}/red_anthurium_brown.webp`, `/files/${clientId}/red_anthurium_gray.webp`, `/files/${clientId}/red_anthurium_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>크고 굵은 하트 모양의 꽃을 피우는 레드 안스리움은 환대, 행운, 그리고 끈끈한 관계를 상징하며, 어떤 집에든 행복과 풍요로움을 가져다줍니다.</p>
            <p>소중한 사람에게 선물하거나, 나만의 특별한 컬렉션에 추가하여 화사한 색감을 더할 수 있습니다.</p>
            <p>이 열대 식물은 따뜻하고 밝은 곳에서 일 년 내내 잘 자랍니다. 잎이 최상의 상태를 유지하도록 분무기로 습도를 충분히 유지해 주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 40, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '인삼', // 상품명
        price: 30000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/insam_black.webp`, `/files/${clientId}/insam_brown.webp`, `/files/${clientId}/insam_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>초보자도 쉽게 키울 수 있는 이 인기 있는 나무는 다른 분재에 비해 관리가 훨씬 쉽습니다.</p>
            <p>푸르고 윤기 나는 잎으로 둘러싸인 재미있고 극적인 모양의 줄기가 인상적인 이 식물은 집안 분위기를 한층 돋보이게 해 줄 것입니다.</p>
            <p>습도가 높고 밝은 간접광이 드는 환경에서 키우고, 작은 형태를 유지하려면 식물 가위로 가끔씩 가지치기를 해주세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '보통',
            '간접광',
            '침실',
            '욕실',
            '주방',
            '봄',
            '여름',
            '가을',
          ],
          sort: 41, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '몬스테라 델리시오사', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 21, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/monstera_deliciosa_black.webp`, `/files/${clientId}/monstera_deliciosa_brown.webp`, `/files/${clientId}/monstera_deliciosa_white.webp`, `/files/${clientId}/monstera_deliciosa_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>몬스테라 델리시오사(Monstera deliciosa)는 스위스 치즈 플랜트라고도 불리는 매력적인 열대 식물로, 멕시코 남부 열대우림이 원산지입니다.</p>
            <p>크고 열대적인 잎을 가진 생동감 넘치는 야생 식물로, 넓은 장소에 심기에 적합합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '간접광',
            '거실',
            '사무실',
            '봄',
            '여름',
          ],
          sort: 42, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '얼룩무늬 크로톤', // 상품명
        price: 27000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 18, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/variegated_croton_black.webp`, `/files/${clientId}/variegated_croton_brown.webp`, `/files/${clientId}/variegated_croton_white.webp`, `/files/${clientId}/variegated_croton_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>집에 포인트 컬러를 원하신다면, 얼룩무늬 크로톤이 제격입니다! 이 화사한 색상의 식물은 강렬한 붉은색, 주황색, 노란색에 더해 짙은 버건디와 녹색의 색조를 자랑합니다.</p>
            <p>말린 잎은 식물에 독특한 구조적 요소를 더해주며, 집안의 햇살이 잘 드는 곳에서 아름답게 자랄 것입니다.</p>
            <p>이 크로톤은 직사광선이나 간접광에서 잘 자라며 관리도 비교적 쉽습니다. 정기적으로 관리하여 최상의 상태를 유지하세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '어려움',
            '간접광',
            '직사광',
            '거실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 43, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '미니 머니 트리', // 상품명
        price: 20000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 31, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/mini_money_tree_black.webp`, `/files/${clientId}/mini_money_tree_brown.webp`, `/files/${clientId}/mini_money_tree_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>굵은 줄기 위에 손바닥 모양의 잎이 얹힌 생기 넘치는 반려동물 친화적인 식물입니다.</p>
            <p>모두에게 많이 사랑받는 머니 트리의 미니 버전입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 44, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '플라밍고', // 상품명
        price: 20000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 15, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/flamingo_flower.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>화려한 플라밍고 플라워로 집안에 색감을 더하세요! 일 년 내내 피어나는 이 꽃은 열대 지방의 보물로, 대담한 꽃으로 휴가 분위기를 즉시 집에 선사합니다.</p>
            <p>플라밍고 플라워는 선명한 주홍색부터 예쁜 분홍색과 진한 보라색까지 일 년 내내 색이 변합니다.</p>
            <p>저조도에서도 생존할 수 있지만 중간에서 밝은 간접 햇빛이 가장 행복하게 유지해줍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 45, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '수박 페페로미아', // 상품명
        price: 23000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/watermelon_peperomia.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>그야말로 실내 식물 컬렉션에 완벽한 추가 아이템입니다. 작은 수박을 닮은 독특한 잎을 가진 멋진 수박 페페로미아를 만나보세요.</p>
            <p>활기찬 잎은 짧고 붉은 보라색 줄기에 녹색, 은색 줄무늬 잎이 붙어 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '침실',
            '욕실',
            '주방',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 46, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '마란타 레우코네우라', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 16, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/maranta_leuconeura.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>마란타 붉은 기도 식물(마란타 류코네우라)은 마치 우리가 쓰는 시계와 같이 행동합니다. 저녁에는 잎을 들어 올리고, 아침에는 기도하듯이 들어올린 잎을 내립니다.</p>
            <p>넓고 타원형인 잎은 윗면이 빨간색, 아랫면이 붉은 색을 띠는 두 가지 색의 잡색 반점이 있어 집이나 사무실 어디에서나 어울리는 인테리어 식물이 될 수 있습니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 47, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '칼라테아 란시폴리아', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 13, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/calathea_lancifolia.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>칼라테아는 잎에 칠해진 것처럼 어두운 붓질로 눈에 띄고 독특한 라임라이트 그린 무늬를 자랑합니다.</p>
            <p>저녁이 되고 황혼이 가까워지면 잎이 똑바로 서서 숨겨진 버건디 잎 밑면을 드러냅니다. 마치 하나에 두 개의 식물이 있는 것 같습니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 48, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '몬스테라 타이 컨스텔레이션', // 상품명
        price: 32000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 22, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/monstera_thai_constellation.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>희귀하고 탐나는 몬스테라 타이 컨스텔레이션이 드디어 도착했습니다!</p>
            <p>고전 몬스테라 델리시오사의 독특한 친척인 각 잎은 반짝이는 별들로 가득 찬 밤하늘을 닮은 크리미한 흰색과 무성한 녹색이 뿌려진 예술 작품입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 49, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '크라슐라 오바타', // 상품명
        price: 23000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 15, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/crashula_obata.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>매혹적인 제이드 식물(크라슐라 오바타)로 공간을 변신시키세요. 이 견고하고 탄력 있는 자연의 보석은 광택이 나는 활기찬 잎으로 장식된 두껍고 상록적인 가지를 자랑하며 풍성한 디스플레이를 만들어냅니다.</p>
            <p>최대 5피트 높이에 도달하고 최대 3피트 너비까지 펼쳐진 제이드 식물은 어떤 환경에서도 눈에 띄는 존재감을 선사합니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '거실',
            '침실',
            '욕실',
            '주방',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 50, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 핑크 공주', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 17, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/princess_philodendron_pink.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>핑크 프린세스 필로덴드론(필로덴드론 에루베센스)은 식물 애호가에게는 드물게 볼 수 있는 하트 모양의 잎 미인입니다.</p>
            <p>그녀는 엔도르핀을 활성화하여 분홍색과 녹색의 다양한 색상으로 시선의 중심이 되어 다채로운 잎의 균형을 맞출 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '간접광',
            '거실',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 51, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 지니', // 상품명
        price: 21000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 35, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_genie(mini monstera).webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>필로덴드론 지니라고 불리는 이 식물은 마치 몬스테라 델리시오사의 작은 버전처럼 보입니다.</p>
            <p>이 식물은 밝고 간접적인 빛의 공급에 따라 최대 6인치까지 갈라진 잎의 형태로 자랍니다.</p>
            <p>사실은 국화과에 속하며, 매달리기보다는 오르기를 선호합니다. 벽이나 책장을 따라 구불구불하게 올라갈 때 이끼 기둥이나 식물 테이프를 제공하여 지지하면 됩니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '중형',
            '보통',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 52, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '녹영', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 31, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/nokyong.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>사방에서 흘러나오는 이 특이한 아름다움을 가진 다육식물을 좋아하지 않는 사람이 있을까요?</p>
            <p>진주줄 식물은 밝은 간접광과 낮은 습도에서 번성합니다. 이 독특한 다육식물을 당신의 컬렉션에 추가하세요!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 53, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '핑크 난초', // 상품명
        price: 29000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 16, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['회색'],
          },
        ],
        mainImages: [`/files/${clientId}/pink_palenopsis_orchid.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 아름다움을 보세요... 이 아름다운 난초는 하나가 아닌 두 개의 멋진 꽃봉오리를 자랑하며 항상 눈길을 사로 잡습니다.</p>
            <p>가장 좋은 점은 이 꽃들이 최대 3개월까지 지속될 수 있다는 것입니다! 즉, 특별한 사람을 위한 완벽한 선물입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 54, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '보스턴 고사리', // 상품명
        price: 20000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 12, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/nephropis_scotch.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>아름다운 이 식물은 집에 숲의 매력을 더해줄 것입니다. 게다가 공기 중의 포름알데히드와 같은 화학 물질을 제거하는 데 매우 효율적입니다.</p>
            <p>간접 조명과 습도 의존성이 높아 욕실에서 키우시는 게 좋은 선택입니다. 걸이 바구니에 넣고 섬세한 잎사귀가 옆으로 흘러내리도록 두세요.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '욕실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 55, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '보라 난초', // 상품명
        price: 28000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 21, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['회색'],
          },
        ],
        mainImages: [`/files/${clientId}/purple_palenopsis_orchid.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>난초계의 스타일리시한 록스타 보라색 난초에게 인사하세요! 선명한 보라색 꽃이 피어나는 이 아름다움은 어떤 공간에도 색을 더해줍니다.</p>
            <p>이 디바는 하나가 아닌 두 개의 인상적인 꽃봉오리를 자랑합니다. 가장 좋은 점은 꽃이 피면 최대 3개월 동안 계속 지속된다는 것입니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 56, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 레몬 라임', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 22, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_vine_lemon-lime.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>중저광에 내성이 있지만 밝은 간접광을 받는 것을 선호합니다. 잎 색깔은 분홍~노랑을 띠며, 처음엔 깊은 레몬색으로 발달하고 시간이 지나면서 마지막으로 라임 그린색으로 변합니다.</p>
            <p>다양한 빛 조건에 내성이 있는 이 식물은 바닥에 쉽게 닿는 긴 계단식 덩굴을 만들어 냅니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '주방',
            '사무실',
            '봄',
            '가을',
            '겨울',
          ],
          sort: 57, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '레몬 버튼', // 상품명
        price: 21000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 11, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/Lemon-Button.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>보스턴 고사리의 작은 버전인 이 귀여운 레몬 버튼을 컬렉션에 추가하세요.</p>
            <p>약 30cm만 자라면 다른 열대 식물과 아름다운 조화를 이룰 수 있습니다.</p>
            <p>작은 잎과 미세한 질감의 잎을 가지고 있어 큰 잎 열대 식물과 좋은 대조를 이룹니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 58, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '하이포테스', // 상품명
        price: 26000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 31, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/hippoesthes_philostakia.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>놀라운 아름다움을 가진 멋진 실내 식물이지만, 온대 지역의 야외에서 매년 재배할 수도 있습니다.</p>
            <p>잎은 밝은 색의 다년생 꽃이 매력적으로 섞여 매력적인 덤불로 자랍니다.</p>
            <p>이 사랑스러운 식물은 녹색을 띠는 다른 식물과 놀라운 대조를 이룹니다. 높이와 너비가 약 1m까지 자랍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '보통 습도', '더위 내성'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '직사광',
            '실외',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 59, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '엽란', // 상품명
        price: 23000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 16, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['갈색'],
          },
        ],
        mainImages: [`/files/${clientId}/Yublan.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>유지 관리 필요도가 매우 낮으며 저조도, 불규칙한 물 공급, 다양한 습도 변화 등 다양한 조건을 견딜 수 있습니다.</p>
            <p>즉, 물을 주는 것을 자주 까먹는 식물 집사에게도 완벽한 식물입니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '주방',
            '욕실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 60, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '아카디아 난초', // 상품명
        price: 28000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 32, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['회색'],
          },
        ],
        mainImages: [`/files/${clientId}/acadia_palenopsis_orchid.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>자연이 직접 만든 걸작인 아카디아 난초의 아름다움을 보세요! 이 이국적인 난초는 하나가 아닌 두 개의 멋진 꽃봉오리를 자랑하여 항상 사람들의 눈길을 훔칩니다.</p>
            <p>가장 좋은 점은 이 꽃들이 최대 3개월까지 지속될 수 있다는 것입니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 61, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '공작 나무', // 상품명
        price: 30000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 27, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/gogzak_tree.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>공작 나무는 왕립 원예 협회에서 필수 식물로 명성을 얻기도 했습니다.</p>
            <p>양쪽에 녹색 얼룩덜룩한 상록수 조각이 있는 칼라테아 마코야나의 스테인드글라스 모습이 당신을 매료시킬 것입니다.</p>
            <p>저녁에 잎이 접히면 짙은 보라색 속이 드러납니다. 이건 마치 하나에 두 개의 다른 식물이 있는 것 같아요!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['매일 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 62, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '마블 퀸 포토스', // 상품명
        price: 25000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 20, // 상품 재고
        buyQuantity: 61, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/marvel_queen_photos.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>마블 퀸 포토스는 의심할 여지 없는 베스트셀러 식물입니다!</p>
            <p>노란색, 크림색 흰색, 녹색 잎으로 이루어진 길고 계단식 다양한 덩굴식물로 장식된 하트 모양으로 여러분의 관심을 요구합니다.</p>
            <p>이 식물은 일주일에 물을 한 번 주면 충분하고 적당한 습도와 온도에서 자라기 때문에, 관리가 매우 쉽습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '거실',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 63, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '잉글리시 아이비', // 상품명
        price: 23000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 22, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색'],
          },
        ],
        mainImages: [`/files/${clientId}/english_ivy.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>튼튼하지만 예쁘고 일 년 내내 녹색을 유지하며, 그늘진 곳에서 꽤 행복해합니다.</p>
            <p>3m까지 자라며 위로 뻗어나가는 자연 등반가입니다. 관리도 쉬워서 최소한의 노력으로도 시골 저택 분위기를 느낄 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '보통 습도', '서늘함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '음지',
            '간접광',
            '침실',
            '주방',
            '사무실',
            '봄',
            '여름',
            '가을',
          ],
          sort: 64, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '필로덴드론 불의 고리', // 상품명
        price: 33000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 29, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/philodendron_fire.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>희귀하고 눈에 띄는 필로덴드론의 불의 고리가 도착했습니다.</p>
            <p>이 활기찬 식물은 오렌지, 레드, 크림, 푸르스름한 녹색의 불타는 혼합이 특징인 들쭉날쭉한 톱니 모양의 잎으로 유명합니다. 모든 잎은 독특한 걸작으로 식물 컬렉션 계의 보석과 같은 존재입니다.</p>
            <p>관리가 쉽고 천천히 자라는 이 식물은 밝고 간접적인 빛 속에서 번성하며 공간에 이국적인 감각을 더해줍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['주 1회 물주기', '다습 식물', '따뜻함 선호'],
          category: [
            // 상품 카테고리(array)
            '식물',
            '소형',
            '쉬움',
            '간접광',
            '침실',
            '사무실',
            '봄',
            '여름',
            '가을',
            '겨울',
          ],
          sort: 65, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '에코팟 원형 화분 - 10인치', // 상품명
        price: 12000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 28, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/eco_pot_10_black.webp`, `/files/${clientId}/eco_pot_10_brown.webp`, `/files/${clientId}/eco_pot_10_white.webp`, `/files/${clientId}/eco_pot_10_blue.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>미니멀한 디자인의 10인치 원형 에코팟 화분은 시선을 빼앗지 않으면서도 식물과 잘 어울립니다.</p>
            <p>80% 재활용 플라스틱으로 제작된 이 원형 화분은 다양한 색상으로 출시되며, 각 색상에는 분리형 받침과 배수구가 포함되어 있습니다.</p>
            <p>심플하고 시대를 초월하는 디자인으로 어떤 인테리어에도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '화분',
          ],
          sort: 66, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '에코팟 원형 화분 - 6인치', // 상품명
        price: 10000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 38, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색'],
          },
        ],
        mainImages: [`/files/${clientId}/eco_pot_6_black.webp`, `/files/${clientId}/eco_pot_6_brown.webp`, `/files/${clientId}/eco_pot_6_gray.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>미니멀한 디자인의 6인치 원형 에코팟 화분은 시선을 빼앗지 않으면서도 식물과 잘 어울립니다.</p>
            <p>80% 재활용 플라스틱으로 제작된 이 원형 화분은 다양한 색상으로 출시되며, 각 색상에는 분리형 받침과 배수구가 포함되어 있습니다.</p>
            <p>심플하고 시대를 초월하는 디자인으로 어떤 인테리어에도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['베스트', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '화분',
          ],
          sort: 67, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '에코팟 원형 화분 - 12인치', // 상품명
        price: 14000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 18, // 판매된 수량
        options: [
          // 옵션 : 화분 색상
          {
            name: '화분 색상',
            values: ['흑색', '갈색', '회색', '흰색', '남색'],
          },
        ],
        mainImages: [`/files/${clientId}/eco_pot_12_black.webp`, `/files/${clientId}/eco_pot_12_brown.webp`, `/files/${clientId}/eco_pot_12_gray.webp`, `/files/${clientId}/eco_pot_12_blue.webp`, `/files/${clientId}/eco_pot_12_white.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>미니멀한 디자인의 12인치 원형 에코팟 화분은 시선을 빼앗지 않으면서도 식물과 잘 어울립니다.</p>
            <p>80% 재활용 플라스틱으로 제작된 이 원형 화분은 다양한 색상으로 출시되며, 각 색상에는 분리형 받침과 배수구가 포함되어 있습니다.</p>
            <p>심플하고 시대를 초월하는 디자인으로 어떤 인테리어에도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['신상품', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '화분',
          ],
          sort: 68, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '화분용 흙', // 상품명
        price: 6000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 80, // 상품 재고
        buyQuantity: 48, // 판매된 수량
        mainImages: [`/files/${clientId}/dirt.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 화분용 흙은 모든 화분 관리에 필요한 것을 제공합니다.</p>
            <p>최적의 식물 건강을 위해 pH 균형을 맞춘 이 화분용 흙은 캐나다산 피트모스, 펄라이트, 히드라파이버로 만들어졌으며 실내외 모두에 적합합니다.</p>
            <p>식물이 수분을 유지하고 적절한 배수를 통해 뿌리가 더욱 건강하고 건강하게 자랄 수 있도록 도와줍니다.</p>
            <p>8쿼트(약 23.6L) 한 봉지로 8인치(약 20cm) 화분 두 개를 채울 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['베스트', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 69, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '다목적 비료(20‑20‑20)', // 상품명
        price: 10000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 38, // 판매된 수량
        mainImages: [`/files/${clientId}/202020_fertilizer.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>관엽식물에 안성맞춤인 이 믿을 수 있는 다용도 비료는 당신의 식물이 풍성하고 튼튼하며 건강하게 자라도록 도와줍니다!</p>
            <p>균형 잡힌 성분 배합 덕분에 몬스테라, 필로덴드론, 포토스, 디펜바키아 등 다양한 식물은 물론, 실외 식물에도 사용할 수 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 70, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '절삭 공구', // 상품명
        price: 8000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 28, // 판매된 수량
        mainImages: [`/files/${clientId}/cutting_tool.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 양날 절단 도구는 분갈이, 이식, 잡초 제거 및 정원 관리에 유용합니다.</p>
            <p>날카로운 날로 정밀하게 구멍을 파거나 잡초를 쉽게 뽑아낼 수 있습니다. 또, 톱니 모양의 면으로 엉킨 뿌리나 엉킨 줄기를 잘라낼 수 있습니다. 게다가, 칼날에 깊이 표시가 있어 정확한 심기가 가능합니다.</p>
            <p>이 다재다능한 절단 도구는 모든 정원사에게 강력 추천하는 제품입니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 71, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '모종삽', // 상품명
        price: 5000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 40, // 상품 재고
        buyQuantity: 31, // 판매된 수량
        mainImages: [`/files/${clientId}/hand_trowel.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 다재다능한 모종삽은 실내외 모두에서 분갈이와 심기에 유용합니다.</p>
            <p>넓고 깊은 접시와 좁은 팁을 갖춘 이 도구는 땅을 파고, 옮겨 심고, 흙을 퍼올리는 작업을 손쉽게 해줍니다.</p>
            <p>작은 식물과 화분뿐 아니라 야외 정원 가꾸기에도 탁월한 이 고품질 스테인리스 스틸 소재의 모종삽은 모든 정원 가꾸기에 필요한 것을 손쉽게 준비해 두기에 좋습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 72, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: 'Sowvital 하우스 플랜트 도구 세트', // 상품명
        price: 18000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 30, // 상품 재고
        buyQuantity: 15, // 판매된 수량
        mainImages: [`/files/${clientId}/sowvital_set.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>Sowvital 하우스 플랜트 도구 세트는 모든 정원사에게 필수적인 프리미엄 원예 도구 세트입니다.</p>
            <p>이 도구들은 분갈이, 테라리움 관리, 씨앗 파종 등 다양한 식물 관리 활동에 적합합니다. 스테인리스 스틸 소재로 제작되어 오랫동안 사용할 수 있습니다!</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 73, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '물뿌리개', // 상품명
        price: 6000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 38, // 판매된 수량
        mainImages: [`/files/${clientId}/watering_can.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 매력적인 물뿌리개는 식물 관리 용품에 없어서는 안 될 필수품입니다.</p>
            <p>아름다운 짙은 녹색으로 출시되었으며, 개당 1.5리터의 물을 담을 수 있고 100% 재활용 가능한 플라스틱으로 제작되었습니다.</p>
            <p>탈착식 빗물받이와 전통적인 디자인이 돋보이는 이 클래식한 물뿌리개는 정원 용품에 형태와 기능을 모두 더해줍니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['베스트', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 74, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '이끼 기둥', // 상품명
        price: 7000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 22, // 판매된 수량
        mainImages: [`/files/${clientId}/moss_pole.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>이 독특한 약 75cm 길이의 구부러지는 이끼 기둥으로 자연의 아름다움을 기념해 보세요.</p>
            <p>기울기를 조절 가능한 디자인으로, 덩굴식물을 원하는 방향으로 재배할 수 있으며, 안정적인 제어와 안정적인 지지력을 제공합니다.</p>
            <p>이끼 기둥은 식물이 다양한 방향으로 자유롭게 자랄 수 있도록 도와줍니다. 몬스테라, 필로덴드론, 포토스 등 다양한 덩굴식물에 적합합니다. 핀이 포함되어 있습니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '도구',
          ],
          sort: 75, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '소형 간접 조명', // 상품명
        price: 10000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 60, // 상품 재고
        buyQuantity: 48, // 판매된 수량
        options: [
          // 옵션 : 조명 색상
          {
            name: '조명 색상',
            values: ['흑색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/little_light_white.webp`, `/files/${clientId}/little_light_black.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>식물이 잘 자라는 데 필요한 빛이 부족한가요? 이 세련된 소형 성장 조명으로 실내 식물에 최적의 조명 환경을 만들어 보세요.</p>
            <p>20W의 이 성장 조명은 중소형 식물이나 크고 어두운 식물과도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: false, // 신상품 여부(boolean)
          isBest: true, // 베스트 상품 여부(boolean)
          tags: ['베스트', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '조명',
          ],
          sort: 76, // 상품 정렬 순서(number)
        },
      },
      {
        _id: await nextSeq('product'), // 상품 고유 ID
        seller_id: 1, // 판매자 ID (user 테이블 참조), 1번 유저인 관리자가 판매자
        name: '중형 간접 조명', // 상품명
        price: 13000, // 상품 가격
        shippingFees: 3000, // 배송비
        show: true, // 상품 표시 여부
        active: true, // 상품 활성화 여부
        quantity: 50, // 상품 재고
        buyQuantity: 25, // 판매된 수량
        options: [
          // 옵션 : 조명 색상
          {
            name: '조명 색상',
            values: ['흑색', '흰색'],
          },
        ],
        mainImages: [`/files/${clientId}/middle_light_white.webp`, `/files/${clientId}/middle_light_black.webp`], // 상품 메인 이미지
        content: `
          <div class="product-detail">
            <p>대형 식물이 잘 자라는 데 필요한 빛이 부족한가요? 소형 조명 가지고는 부족하다고요? 그렇다면 새로 나온 이 세련된 대형 성장 조명으로 실내 식물에 최적의 조명 환경을 만들어 보세요!</p>
            <p>40W의 이 성장 조명은 대형부터 XXL까지의 식물이나 여러 개의 작은 식물과도 잘 어울립니다.</p>
          </div>
        `,
        createdAt: getTime(),
        updatedAt: getTime(),
        extra: {
          isNew: true, // 신상품 여부(boolean)
          isBest: false, // 베스트 상품 여부(boolean)
          tags: ['신상품', '초보자', '관리 쉬움'],
          category: [
            // 상품 카테고리(array)
            '원예 용품',
            '조명',
          ],
          sort: 77, // 상품 정렬 순서(number)
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
