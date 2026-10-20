#!/usr/bin/env bash
# 로컬 개발용 테스트 데이터를 넣는다. 로컬 DB가 초기화된 뒤 다시 실행하면 된다. (이미 있으면 건너뜀)
#
#   npm run seed:local
#
# 필요: 로컬 MySQL(cartmate DB), 실행 중인 BE(기본 http://localhost:8985), mysql·curl
# 계정 비밀번호는 모두 test1234 (로컬 전용 테스트 값)
#   test@naver.com        ADMIN
#   buyer@example.test    BUYER
#   seller@example.test   SELLER  (테스트 판매글의 판매자)
set -euo pipefail

API_URL="${API_URL:-http://localhost:8985}"
DB_NAME="${DB_NAME:-cartmate}"
DB_USER="${DB_USER:-cartmate}"
DB_PASSWORD="${DB_PASSWORD:-cartmate}"

# test1234 의 bcrypt 해시 (BE BCryptPasswordEncoder 로 검증 가능한 형식)
PASSWORD_HASH='$2y$10$.GdXZqlMdvdHMkGnpmi90OXD/2k5zyh3A07HHYkG0mhdir5ek2ebS'

sql() {
    MYSQL_PWD="$DB_PASSWORD" mysql --default-character-set=utf8mb4 -u"$DB_USER" "$DB_NAME" -N -e "$1"
}

# 회원가입 API는 휴대폰 인증(BE 로그에만 찍히는 인증번호)이 필요하고 비밀번호 규칙상 test1234 를 쓸 수 없어서,
# 회원과 지갑(회원가입 시 BE가 함께 만드는 행)을 DB에 직접 넣는다.
add_member() {
    local email=$1 nickname=$2 phone=$3 role=$4
    sql "INSERT INTO member (created_at, updated_at, birth_date, email, nickname, password, phone, role, status)
         SELECT NOW(6), NOW(6), '1990-01-01', '$email', '$nickname', '$PASSWORD_HASH', '$phone', '$role', 'ACTIVE'
         WHERE NOT EXISTS (SELECT 1 FROM member WHERE email = '$email');
         INSERT INTO wallet (balance, created_at, member_id, updated_at, version)
         SELECT 0, NOW(6), m.id, NOW(6), 0 FROM member m
         WHERE m.email = '$email' AND NOT EXISTS (SELECT 1 FROM wallet w WHERE w.member_id = m.id);"
    echo "회원: $email ($role)"
}

add_member 'test@naver.com' 'admin' '010-0000-0001' 'ADMIN'
add_member 'buyer@example.test' 'buyer' '010-0000-0002' 'BUYER'
add_member 'seller@example.test' 'seller' '010-0000-0003' 'SELLER'

# 구매자 기본 배송지 (주문서 자동 채움 확인용). 주소록 API가 없어 DB에 직접 넣는다.
sql "INSERT INTO member_address (created_at, updated_at, basic_address, is_default, detail_address, receiver_name, receiver_phone, zip_code, member_id)
     SELECT NOW(6), NOW(6), '서울특별시 강남구 테헤란로 123', b'1', '4층 402호', '테스트 구매자', '010-0000-0002', '06234', m.id
     FROM member m
     WHERE m.email = 'buyer@example.test'
       AND NOT EXISTS (SELECT 1 FROM member_address a WHERE a.member_id = m.id AND a.is_default = b'1');"
echo "기본 배송지: buyer@example.test"

SELLER_ID=$(sql "SELECT id FROM member WHERE email = 'seller@example.test'")
EXISTING=$(sql "SELECT COUNT(*) FROM post_sales_post WHERE seller_id = $SELLER_ID")
if [ "$EXISTING" -gt 0 ]; then
    echo "판매글: 이미 ${EXISTING}건 있음 → 건너뜀"
    exit 0
fi

# 판매글은 BE API로 만든다. (상품·이미지 테이블 동기화를 BE가 처리)
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
# 1x1 PNG
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82' > "$WORK_DIR/img.png"

post() {
    local title=$1 products=$2 image_count=$3
    printf '{"sellerId":%s,"title":"%s","content":"[테스트 데이터] %s","productList":[%s]}' \
        "$SELLER_ID" "$title" "$title" "$products" > "$WORK_DIR/req.json"
    local images=()
    for _ in $(seq 1 "$image_count"); do images+=(-F "images=@$WORK_DIR/img.png;type=image/png"); done
    curl -sf -o /dev/null -X POST "$API_URL/api/sales-posts/post" \
        -F "request=@$WORK_DIR/req.json;type=application/json" "${images[@]}"
}

product() {
    printf '{"categoryId":%s,"name":"%s","description":"%s 상세 설명","basePrice":%s,"productImageList":[{"imageSeq":1}]}' "$3" "$1" "$1" "$2"
}

i=0
while IFS='|' read -r title name price category; do
    post "$title" "$(product "$name" "$price" "$category")" 1
    i=$((i + 1))
done <<'EOF'
[테스트] 프로 에어로 축구 유니폼 세트|에어로 유니폼 상하의|31500|1
[테스트] 하이퍼비전 공인구 5호|하이퍼비전 공인구|39000|2
[테스트] 프로 터프 TF 풋살화|터프 풋살화|72980|3
[테스트] 클럽 골키퍼 장갑|골키퍼 장갑|25000|4
[테스트] 농구 팀 저지 커스텀|농구 저지|28500|1
[테스트] 러닝 경량 싱글렛|러닝 싱글렛|19900|1
[테스트] 야구 연습용 배트|연습용 배트|45000|4
[테스트] 신가드 프로텍터 세트|신가드 세트|15000|4
[테스트] 축구 트레이닝 하프집업|하프집업 탑|33000|1
[테스트] 풋살 팀 조끼 10벌 세트|팀 조끼|12000|1
EOF

# 상품이 2종인 판매글 (상세 화면의 상품 선택 확인용)
for n in 11 12 13 14 15; do
    post "[테스트] 팀 트레이닝 세트 $n" "$(product "트레이닝 상의 $n" $((n * 1000)) 1),$(product "트레이닝 하의 $n" $((n * 1500)) 1)" 2
    i=$((i + 1))
done

echo "판매글: ${i}건 생성"
