> 
> 
> 
> **8반 P244 권예리**
> 

---

## 1. 기획 배경 및 핵심 가치

- **서비스명 (가칭)**: 내자리 어딨냐
- **한줄 정의**: 경기장·콘서트장 등 특정 일시에 주차 수요가 폭증하는 장소 인근의 개인·상가 유휴 주차면을 해당 행사 일시에 한정해 사전 매칭해주는 초단기 주차 공유 플랫폼

### 추진 배경

- **스파이크성 수요 집중**: 대형 스포츠 경기, 콘서트, 페스티벌 등은 특정 시간대에 주차 수요가 폭증하며 공식 주차장 조기 만차 및 주변 사설 주차장의 바가지 요금(평소 대비 3~5배) 문제가 만성적으로 발생합니다.
- **인근 유휴 사유지 존재**: 행사장 도보 5~15분 거리의 단독주택 마당, 빌라 전면 주차면, 주말 미운영 상가 주차면 등은 해당 시간대(3~4시간)에 비어있는 경우가 많으나, 기존 플랫폼은 '월 단위/상시 등록' 구조여서 진입 장벽이 높습니다.

### 타겟별 제공 가치

- **공간 제공자 (Host)**: 복잡한 약정 없이 비워두는 몇 시간 동안 유휴 공간 즉시 수익화.
- **이용자 (Guest)**: 바가지 요금 없는 사전 확정가로 행사장 도보권 주차 공간 100% 선점.
- **주최측 및 지자체**: 행사장 인근 고질적인 불법 주정차 분산 및 교통 정체 완화.

> **파일럿 검증 핵심 가설**
> 
> 1. 행사장 도보권 주민·상가가 3~4시간 동안 본인 사유지 주차면을 실제로 개방할 의향이 있는가?
> 2. 행사 참석자가 도보권 단기 주차면에 사전 고정 패키지가로 결제할 의향이 있는가?
> 3. 차량번호 육안 대조와 원터치 입·출차 확인만으로 현장 분쟁 없이 운영 통제가 가능한가?

---

## 2. Pain Point → Solution

| 대상 | Pain Point (기존 문제) | Phase 0 Solution (해결 방안) | 구현 및 운영 방식 (초경량화 규약) |
| --- | --- | --- | --- |
| **게스트** | 당일 현장 주차난 (예측 불가) | 행사 선택 기반 사전 예약 및 도보 소요 시간순 탐색 | 무거운 지도 SDK 없이 호스트가 입력한 예상 도보 시간(`walking_minutes`) 기준 오름차순 정렬 제공 |
| **게스트** | 인근 주차장의 바가지 요금 및 복잡한 과금 | 호스트 자율 고정가 설정 및 선착순 즉시 확정 | 분/시간 단위 과금 없이 **'행사 타임 단일 패키지 요금'** 적용, 결제 완료 시 즉시 확정 (`status = CONFIRMED`) |
| **게스트** | 현장 진입 불가 / 무단 점유 피해 | 관리자 직통 유선 개입 및 100% 전액 환불 | 시스템 자동 재배정 대신 관리자가 전화/카카오톡으로 즉시 개입해 대체지 안내 또는 수동 계좌 전액 환불 |
| **호스트** | 상시 등록 및 캘린더 관리의 번거로움 | 참여 행사 기반 1회성 오픈 | 캘린더 설정 없이 선택한 행사의 일시(`start_datetime` ~ `end_datetime`)에 자동 종속 |
| **호스트** | 승인/거절 요청 대응 피로도 | 100% 선착순 즉시 확정 | 호스트 응답 대기 타이머(2시간) 및 거절 분기를 전면 제거하고 결제 완료 즉시 예약 확정 |
| **공통** | 본인인증 단계에서의 유저 이탈 | 인증 모듈 없는 간이 입력 | 통신사 PASS 인증 없이 이름·전화번호·차량번호 직접 입력 + 가상 결제 스냅샷 처리 |
| **공통** | 공간 훼손 및 입출차 신뢰 문제 | 차량번호 대조 + 원터치 체크 + 수동/단축 폴링 동기화 | • **대조**: 예약 즉시 호스트 화면에 게스트 차량번호 노출<br/>• **상태 반영**: 게스트 버튼 조작 시 호스트 화면에서 **수동 새로고침 및 30초 주기 Polling**으로 최신 상태 갱신<br/>• **훼손 방어**: 사진 서버 구축 없이 카카오톡 현장 사진 전송 규칙 적용 |

---

## 3. 비즈니스 정책 및 Phase 0 의도적 제외 항목

### (1) 비즈니스 의사결정 합의 사항: 취소 및 환불 정책

> **단순 변심 취소/환불 불가 (No Refund)**
> 
> - 행사 한정 단기 패키지 상품이므로, **예약 및 결제 완료 후 단순 변심에 의한 취소 및 환불은 전면 불가**합니다.
> - 게스트의 노쇼 및 잦은 취소로부터 호스트의 공간 독점권을 보호하고, Phase 0에서 복잡한 시간대별 취소 수수료 계산 엔진을 배제하기 위함입니다.

> **현장 결함 시 100% 전액 환불 (수동 처리)**
> 
> - 타 차량 무단 점유, 진입로 폐쇄 등 **호스트/현장 귀책으로 주차가 불가능한 경우에 한해 관리자가 유선 확인 후 100% 전액 환불**합니다.
> - PG 연동이 아닌 **관리자가 게스트 계좌로 직접 송금**하며, 시스템에는 `is_refunded = true` 플래그만 기록합니다.

### (2) Phase 0 의도적 제외 항목 (Out of Scope)

- **단순 변심 취소 접수 파이프라인**: `request-cancel` 엔드포인트 및 취소 수수료 정산 엔진 일체 배제
- **실제 PG사 결제 연동**: 가상 결제 플래그 및 예약 시점 결제 금액 스냅샷(`payment_amount`)으로 대체
- **호스트 승인 대기 타이머**: 신청 즉시 선착순 확정
- **지도 SDK 및 좌표 연동**: 주소 텍스트 및 도보 소요 시간(분) 정렬로 대체
- **웹소켓(WebSocket) 및 푸시 알림(FCM)**: 수동 새로고침, 30초 단축 폴링, 긴급 상황 시 관리자 직통 유선 전화로 대체
- **자동 펌뱅킹 정산**: 행사 종료 후 호스트 대상 수동 계좌 이체로 운영

---

## 4. 액터 및 보안/인가 정책

### (1) 액터 정의

- **USER**: 기본 가입 계정. 단일 사용자가 특정 행사에서는 호스트(공간 등록), 다른 행사에서는 게스트(공간 예약) 역할을 모두 수행 가능.
- **ADMIN**: 플랫폼 총괄 운영자. **계정 생성 API 없음** — `/auth/signup`은 항상 `role_type='USER'`로 생성되며, Phase 0에서는 ADMIN 계정을 DB 직접 시딩(seed script)으로만 생성.

### (2) 인가(Authorization) 및 접근 통제 규칙

1. **Admin 엔드포인트 통제**:
    - 토큰 누락 또는 만료: `401 Unauthorized`
    - 토큰은 유효하나 `role_type != 'ADMIN'`: `403 Forbidden` (`{"success": false, "message": "관리자 권한이 필요합니다."}`)
2. **리소스 소유권(Ownership) 검증**:
    - **게스트 액션 API** (`check-in`, `check-out`, `report-issue`): 요청자의 `user_id`가 `reservation.guest_id`와 일치하지 않을 경우 `403 Forbidden` 반환.
    - **공간 삭제 API** (`DELETE /spaces/{space_id}`): 요청자의 `user_id`가 `space.host_id`와 일치하지 않을 경우 `403 Forbidden` 반환.
3. **공간 삭제 보호 규칙 (외래키 무결성 보호)**:
    - 호스트가 공간 삭제를 시도할 때, 해당 공간에 연결된 예약 레코드(`Reservation`)가 **상태를 불문하고 1건이라도 존재하면 삭제 불가 (`400 Bad Request`)**.
    - 에러 메시지: `"예약 이력이 존재하는 주차공간은 삭제할 수 없습니다. 관리자에게 문의하세요."`

---

## 5. 상세 요구사항 정의

### (1) 제공자 (Host)

- **간이 회원가입**: 이름, 전화번호, 비밀번호 직접 입력.
- **공간 등록**: 행사가 `UPCOMING` 상태일 때만 등록 가능. 상세 주소, 현장 사진 URL, 예상 도보 시간(분 단위 정수), 진입 유의사항, 패키지 대여 요금 입력.
- **내 공간 및 예약 현황 조회**: 본인이 등록한 공간 목록 및 각 공간의 현재 활성 예약 정보(예약자 차량번호, 입차 여부, 출차 여부)를 한 화면에서 확인.
- **상태 갱신**: 수동 새로고침 버튼 지원 및 30초 주기 백그라운드 폴링 적용.
- **공간 삭제**: 예약 이력이 전혀 없는 공간에 한해 삭제 가능.

### (2) 이용자 (Guest)

- **간이 회원가입 및 차량 등록**: 이름, 전화번호, 비밀번호, 차량번호, 차종 직접 입력.
- **행사 및 공간 탐색**: 진행 예정 행사 목록 조회 후, 행사장 인근의 승인된(`APPROVED`) 빈 공간 목록을 도보 시간순(`sort=distance`)으로 조회.
- **예약 신청 및 즉시 확정**:
    - 상세 화면에서 **"단순 변심 취소 불가, 현장 진입 불가 시 전액 환불"** 정책 필수 확인 및 동의 체크.
    - 신청 즉시 확정 (`status = CONFIRMED`). 행사가 `UPCOMING` 상태일 때만 가능.
- **내 예약 내역 확인**: 본인이 확정한 예약 상세 정보(주소, 유의사항, 차량번호, 현재 상태) 조회.
- **원터치 입·출차 체크 (상태 가드 적용)**:
    - 입차 완료: 현장 도착 시 체크 (`is_checked_in = true`). 단, `status == 'CONFIRMED'` 상태에서만 허용.
    - 출차 완료: 출차 시 체크 (`is_checked_out = true`, `status = 'COMPLETED'` 자동 전이). 단, `is_checked_in == true` 상태에서만 허용.
- **현장 이슈 신고**: 무단 점유/진입 불가 발생 시 접수(`report-issue`) 후 노출되는 관리자 직통 유선 번호로 즉시 통화.

### (3) 행사 관리자 (Event Admin)

- **행사 생애주기 운영**:
    - 행사 등록 (`POST /admin/events`): 초기 상태 `UPCOMING`.
    - 메타정보 수정 (`PATCH /admin/events/{id}`): 명칭, 장소, 일시 수정 가능 (`status` 수정 불가).
    - **신규 예약 강제 마감 (`POST /admin/events/{id}/block-reservations`)**: 행사 시작 직전 상태를 `ONGOING`으로 전이. 신규 예약 및 공간 등록만 차단하고 기존 예약 진행은 유지.
    - **행사 공식 종료 (`POST /admin/events/{id}/close`)**: 행사 종료 후 상태를 `CLOSED`로 전이하고, 출차 미체크된 잔여 `CONFIRMED` 건을 `COMPLETED`로 일괄 강제 전이.
- **공간 등록 심사**: 대기 큐(`GET /admin/spaces/pending`) 조회 후 승인(`approve`) 또는 반려(`reject`).
- **현장 모니터링**: 행사별 전체 예약 및 입출차 현황 실시간 모니터링.
- **현장 이슈 수동 종결 (`resolve`)**: 사실관계 확인 후 최종 상태를 `CANCELLED` 또는 `COMPLETED`로 지정. 환불 송금 완료 시 `is_refunded = true` 기록.
- **호스트 정산 이체 체크**: 수동 계좌 송금 완료 후 `is_payout_done = true` 기록.

---

## 6. 상태 머신 및 전이 규칙

### (1) Event 상태 전이

!image.png

### (2) Reservation 상태 전이 및 가드 로직

!image.png

 **전이 조건 및 가드**

1. `check-in`: `status == 'CONFIRMED'` AND `is_checked_in == false` 일 때만 호출 가능 (위반 시 400).
2. `check-out`: `is_checked_in == true` AND `is_checked_out == false` 일 때만 호출 가능 (위반 시 400).
3. `report-issue`: `status == 'CONFIRMED'` 일 때만 호출 가능 (즉시 `status = 'ISSUE_REPORTED'` 전환 및 `issue_detail` 누적).
4. `ISSUE_REPORTED` 상태에서는 게스트의 `check-in`, `check-out` 버튼이 비활성화됨.
5. `resolve`: 관리자가 `status`를 `CANCELLED` 또는 `COMPLETED`로만 변경 가능.

---

## 7. UI 흐름도 및 필수 화면 요소

### (A) Host 흐름

!image.png

**[화면 1] 공간 등록 화면**: 행사명 헤더, 상세 주소 입력창, 현장 사진 URL 입력, 예상 도보 시간(분 단위 정수), 진입 유의사항, 패키지 대여 요금, 등록 신청 버튼.

!image.png

1. **`GET /api/events/{event_id}`** — 진입 시 헤더에 행사명 표시용
2. **`POST /api/events/{event_id}/spaces`** — 등록 신청 버튼 클릭 시 (`address`, `photo_url`, `walking_minutes`, `entry_notes`, `price` 전송, 행사가 `UPCOMING` 아니면 `400`)

**[화면 2] 내 공간 및 예약 모니터링 화면**:

!image.png

**`GET /api/spaces/mine`**

- 화면 진입, 수동 새로고침, 30초 주기 폴링 시 호출
- 내가 등록한 공간 목록 + 각 공간의 `active_reservation`(차량번호, 입차/출차 O·X) 임베딩 조회
- 등록 공간 요약(주소, 심사 상태)도 이 응답으로 표시

### (B) Guest 흐름

!image.png

- **[화면 3] 공간 목록 화면**: 행사명 및 일시 헤더, 거리순 정렬 및 공간 요약

!image.png

!image.png

1. **`GET /api/events/{event_id}`**
    - 화면 진입 시 헤더의 행사명·일시(`name`, `start_datetime`, `end_datetime`) 표시용
2. **`GET /api/events/{event_id}/spaces?sort=distance`**
    - 승인된(`APPROVED`) 공간 목록을 `walking_minutes` 오름차순으로 조회
    - 공간 카드(사진, 도보 N분 뱃지, 고정 요금, 주소 요약)에 필요한 `photo_url`, `walking_minutes`, `price`, `address` 등을 제공
    - 대상 행사가 `UPCOMING` 상태가 아니면 `400 Bad Request` 반환

**[화면 4] 공간 상세 및 결제 화면**:

!image.png

!image.png

**[화면 4] 공간 상세 및 결제 화면 사용 API**

1. **`GET /api/events/{event_id}/spaces`** (또는 화면3에서 넘어온 데이터 재사용)
    - 상세 화면 진입 시 해당 공간의 `photo_url`, `walking_minutes`, `address`, `entry_notes`, `price` 표시
    - api.yaml에 단건 조회(`GET /spaces/{space_id}`) 엔드포인트가 별도로 없어, 화면3의 목록 응답에서 해당 공간 데이터를 그대로 넘겨받아 쓰는 구조로 보임
2. **`POST /api/reservations`**
    - "취소/환불 불가 동의" 체크 + 예약 차량번호 확인 후 결제 버튼 클릭 시 호출
    - Request Body: `space_id`, `vehicle_plate_number`
    - 서버 검증: 행사 `UPCOMING`, 공간 `APPROVED`, 중복 예약(선점) 여부
    - 성공 시 `status: 'CONFIRMED'`로 즉시 확정된 `Reservation` 객체 반환

**[화면 5] 내 예약 상세 화면**: 

!image.png

1. **`GET /api/reservations/mine`**
    - 화면 진입 시 내 예약 목록을 조회하고, 그중 해당 예약의 상세 정보(주소, 유의사항, 차량번호, 현재 상태) 표시
    - 응답의 `space.address`, `space.entry_notes`, `vehicle_plate_number`, `status` 등을 사용
    - api.yaml에 단건 조회(`GET /reservations/{reservation_id}`)는 별도로 없어, 목록에서 필터링해 쓰는 구조로 보임
2. **`POST /api/reservations/{reservation_id}/check-in`**
    - [입차 완료] 버튼 클릭 시 호출
    - 가드: `status=='CONFIRMED' AND is_checked_in==false`, 위반 시 `400`
    - 소유권 불일치 시 `403`
3. **`POST /api/reservations/{reservation_id}/check-out`**
    - [출차 완료] 버튼 클릭 시 호출
    - 가드: `is_checked_in==true AND is_checked_out==false`, 위반 시 `400`
    - 성공 시 `status`가 `COMPLETED`로 자동 전이
4. **`POST /api/reservations/{reservation_id}/report-issue`**
    - [현장 문제 신고] 버튼 클릭 시 호출 (화면6 팝업으로 이어짐)
    - Request Body: `issue_detail` (필수)
    - 가드: `status=='CONFIRMED'`일 때만 허용, 호출 즉시 `status='ISSUE_REPORTED'`로 전이

**[화면 6] 현장 이슈 신고 팝업**:

!image.png

!image.png

**`POST /api/reservations/{reservation_id}/report-issue`**

- 신고 사유(`issue_detail`) 입력 후 접수 버튼 클릭 시 호출
- 가드: `status=='CONFIRMED'`일 때만 허용 (아니면 `400`), 소유권 불일치 시 `403`
- 성공 시 `status='ISSUE_REPORTED'`로 전이되고 `issue_note`에 사유 누적

### (C) Event Admin 흐름

**[화면 7] 공간 등록 심사 화면**

!image.png

1. **`GET /api/admin/spaces/pending`**
    - 화면 진입 시 심사 대기(`PENDING`) 상태인 주차공간 목록 조회
    - 테이블 표시 항목: 주소, 사진, 도보 분, 요금 등
2. **`PATCH /api/admin/spaces/{space_id}/approve`**
    - [승인] 버튼 클릭 시 호출
    - 성공 시 해당 공간 `status: 'APPROVED'`로 전이
3. **`PATCH /api/admin/spaces/{space_id}/reject`**
    - [반려] 버튼 클릭 시 호출
    - 성공 시 해당 공간 `status: 'REJECTED'`로 전이

**[화면 8] 전체 예약 및 현장 현황 화면**

!image.png

!image.png

1. **`GET /api/admin/events/{event_id}/reservations?status={status}`**
    - 화면 진입 시 해당 행사의 전체 예약 및 현장 진행 현황 조회
    - `status` 쿼리 파라미터로 `CONFIRMED`/`ISSUE_REPORTED`/`CANCELLED`/`COMPLETED` 필터링 (미지정 시 전체)
    - 응답에 `event_parking_spaces.host_id` → `users` 조인된 호스트 정보(이름/전화번호), 공간 주소, 예약자 차량번호, 입/출차 O·X 포함
    - 이슈 발생 행(`ISSUE_REPORTED`) 하이라이트 표시용 데이터도 이 응답으로 판단
2. **`PATCH /api/admin/reservations/{reservation_id}/resolve`**
    - 행 클릭 → 관리자 수동 조치 팝업에서 [resolve] 처리 시 호출
    - Request Body: `status`(`CANCELLED`/`COMPLETED` 중 택1), `is_refunded`, `note`
    - 가드: 관리자만 가능(`403`), 상태 위반 시 `400`
3. **`PATCH /api/admin/reservations/{reservation_id}/confirm-payout`**
    - 팝업에서 [정산 이체 완료] 체크 시 호출
    - 가드: `status=='COMPLETED' AND is_refunded==false AND is_payout_done==false`일 때만 허용 (위반 시 `400`, 이중 손실 방지)
    - 성공 시 `is_payout_done: true`로 갱신

---

## 8. 데이터 모델 : ERD 및 제약조건

### (1) users

| 필드명 | 타입 | 제약조건 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `user_id` | UUID | PK | `gen_random_uuid()` | 사용자 고유 식별자 |
| `name` | VARCHAR | NOT NULL | - | 사용자 실명/닉네임 |
| `phone_number` | VARCHAR | NOT NULL | - | 연락처 (마스킹 없는 평문) |
| `password_hash` | VARCHAR | NOT NULL | - | 로그인 비밀번호 (해시 저장) |
| `vehicle_plate_number` | VARCHAR | NULL | - | 등록 차량번호 (예: 12가 3456) |
| `vehicle_model` | VARCHAR | NULL | - | 차종 (예: 아반떼) |
| `role_type` | VARCHAR | NOT NULL | `'USER'` | `'USER'`, `'ADMIN'` |
| `created_at` | TIMESTAMP | NOT NULL | `now()` | 가입 일시 |

### (2) events

| 필드명 | 타입 | 제약조건 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `event_id` | UUID | PK | `gen_random_uuid()` | 행사 고유 식별자 |
| `name` | VARCHAR | NOT NULL | - | 행사명 |
| `venue_name` | VARCHAR | NOT NULL | - | 행사장 명칭 |
| `address` | VARCHAR | NOT NULL | - | 행사장 주소 |
| `start_datetime` | TIMESTAMP | NOT NULL | - | 행사 시작 일시 |
| `end_datetime` | TIMESTAMP | NOT NULL | - | 행사 종료 일시 |
| `status` | VARCHAR | NOT NULL | `'UPCOMING'` | `'UPCOMING'`, `'ONGOING'`, `'CLOSED'` |
| `created_by` | UUID | FK → users | - | 등록 관리자 ID |
| `updated_at` | TIMESTAMP | NULL | - | 최근 정보 수정 일시 |

### (3) event_parking_spaces

| 필드명 | 타입 | 제약조건 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `space_id` | UUID | PK | `gen_random_uuid()` | 주차공간 고유 식별자 |
| `event_id` | UUID | FK → events | - | 종속 행사 ID |
| `host_id` | UUID | FK → users | - | 공간 제공 호스트 ID |
| `address` | VARCHAR | NOT NULL | - | 주차공간 상세 주소 |
| `photo_url` | VARCHAR | NOT NULL | - | 현장 사진 URL |
| `walking_minutes` | INTEGER | NOT NULL | - | 행사장 예상 도보 시간 (분) |
| `entry_notes` | TEXT | NULL | - | 진입 유의사항 |
| `price` | INTEGER | NOT NULL | - | 행사 타임 고정 요금 (원) |
| `status` | VARCHAR | NOT NULL | `'PENDING'` | `'PENDING'`, `'APPROVED'`, `'REJECTED'` |
| `created_at` | TIMESTAMP | NOT NULL | `now()` | 등록 일시 |

### (4) reservations

| 필드명 | 타입 | 제약조건 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `reservation_id` | UUID | PK | `gen_random_uuid()` | 예약 고유 식별자 |
| `space_id` | UUID | FK → event_parking_spaces | - | 대상 주차공간 ID |
| `guest_id` | UUID | FK → users | - | 예약 게스트 ID |
| `vehicle_plate_number` | VARCHAR | NOT NULL | - | 예약 시점 차량번호 |
| `payment_amount` | INTEGER | NOT NULL | - | 결제 금액 스냅샷 |
| `status` | VARCHAR | NOT NULL | `'CONFIRMED'` | `'CONFIRMED'`, `'ISSUE_REPORTED'`, `'CANCELLED'`, `'COMPLETED'` |
| `is_checked_in` | BOOLEAN | NOT NULL | `false` | 입차 확인 여부 (O/X) |
| `is_checked_out` | BOOLEAN | NOT NULL | `false` | 출차 확인 여부 (O/X) |
| `is_refunded` | BOOLEAN | NOT NULL | `false` | 현장 결함 시 100% 수동 환불 여부 |
| `is_payout_done` | BOOLEAN | NOT NULL | `false` | 호스트 수동 정산 완료 여부 |
| `issue_note` | TEXT | NULL | `null` | 분쟁 및 조치 내역 누적 메모 |
| `created_at` | TIMESTAMP | NOT NULL | `now()` | 예약 일시 |

```sql
-- 1공간 1활성예약 동시성 무결성 제약 (CANCELLED 제외)
CREATE UNIQUE INDEX uq_active_space_reservation
ON reservations (space_id)
WHERE status != 'CANCELLED';
```

---

## 9. API 명세 (Phase 0 완전판)

### (1) 공통 규약

- **HTTP 상태 코드**:
- `200 OK`: 모든 정상 응답
- `400 Bad Request`: 비즈니스 로직 위반 (파라미터 누락, 마감 행사, 상태 가드 위반 등)
- `401 Unauthorized`: 로그인 필요/토큰 만료
- `403 Forbidden`: 권한 없음 (관리자 권한 요구, 타인 리소스 조작 시도)
- **공통 에러 포맷**:

```json
{
  "success": false,
  "message": "예약이 마감된 행사입니다."
}
```

### (2) 전체 엔드포인트 목록

#### 1. 인증 및 사용자 (Auth & User)

- `POST /api/auth/signup`: 간이 회원가입 (이름, 전화번호, 비밀번호)
- `POST /api/auth/login`: 로그인 (JWT 토큰 반환)
- `GET /api/users/me`: 내 프로필 정보 조회
- `PATCH /api/users/me`: 내 차량 정보(차량번호, 차종) 등록/수정

#### 2. 행사 (Event)

- `GET /api/events`: 진행 중/예정된 행사 목록 조회 (`status=UPCOMING,ONGOING` 기본 필터)
- `GET /api/events/{event_id}`: 행사 상세 정보 조회
- `POST /api/admin/events`: 신규 행사 등록 (Admin)
- `PATCH /api/admin/events/{event_id}`: 행사 메타정보 수정 (Admin - 명칭, 장소, 일시 수정 가능, `status` 수정 불가)
- `POST /api/admin/events/{event_id}/block-reservations`: 신규 예약 강제 마감 (Admin - `status: UPCOMING -> ONGOING`)
- `POST /api/admin/events/{event_id}/close`: 행사 공식 종료 및 잔여 `CONFIRMED` 건 `COMPLETED` 일괄 전이 (Admin - `status: CLOSED`)

#### 3. 주차공간 (EventParkingSpace)

- `GET /api/events/{event_id}/spaces`: 행사 인근 예약 가능 공간 목록 (Guest - `walking_minutes` 오름차순. 행사 `UPCOMING` 아니면 400)
- `POST /api/events/{event_id}/spaces`: 특정 행사에 내 주차공간 등록 (Host - 행사 `UPCOMING` 아니면 400)
- `GET /api/spaces/mine`: 내가 등록한 주차공간 목록 및 각 공간의 **현재 활성 예약 임베딩 객체** 조회 (Host)
- `DELETE /api/spaces/{space_id}`: 등록 공간 삭제 (Host - 예약 레코드가 1건이라도 존재하면 400 에러 차단)
- `GET /api/admin/spaces/pending`: 심사 대기 주차공간 목록 조회 (Admin)
- `PATCH /api/admin/spaces/{space_id}/approve`: 주차공간 심사 승인 (Admin - `status: APPROVED`)
- `PATCH /api/admin/spaces/{space_id}/reject`: 주차공간 심사 반려 (Admin - `status: REJECTED`)

#### 4. 예약 및 현장 진행 (Reservation)

- `POST /api/reservations`: 공간 예약 신청 및 즉시 확정 (Guest - 행사 `UPCOMING`, 공간 `APPROVED`, 중복 검증)
- `GET /api/reservations/mine`: 내 예약 내역 목록 조회 (Guest)
- `POST /api/reservations/{reservation_id}/check-in`: 입차 확인 (Guest - 소유권 검증, `CONFIRMED` 가드)
- `POST /api/reservations/{reservation_id}/check-out`: 출차 확인 (Guest - 소유권 검증, `is_checked_in == true` 가드, `COMPLETED` 자동 전이)
- `POST /api/reservations/{reservation_id}/report-issue`: 현장 결함 신고 (Guest - 소유권 검증, `issue_detail` 필수, `ISSUE_REPORTED` 전이)

#### 5. 관리자 수동 처리 (Admin)

- `GET /api/admin/events/{event_id}/reservations`: 행사 전체 예약 및 현장 진행 현황 모니터링
- `PATCH /api/admin/reservations/{reservation_id}/resolve`: 현장 이슈 수동 종결 (Admin - 허용 status: `CANCELLED`, `COMPLETED`)
- `PATCH /api/admin/reservations/{reservation_id}/confirm-payout`: 호스트 수동 정산 계좌이체 완료 체크 (`is_payout_done = true`)

### (3) 주요 API 페이로드 규격

> **① GET /api/spaces/mine (호스트 내 공간 및 활성 예약 조회)**
> 

```json
// Response 200 OK
{
  "success": true,
  "data": [
    {
      "space_id": "c39a6b10-67c8-4720-94d7-4b78c8942b0c",
      "address": "서울시 송파구 잠실동 123-45",
      "status": "APPROVED",
      "price": 15000,
      "walking_minutes": 6,
      "active_reservation": {
        "reservation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "vehicle_plate_number": "12가 3456",
        "status": "CONFIRMED",
        "is_checked_in": true,
        "is_checked_out": false
      }
    }
  ]
}
```

> **② DELETE /api/spaces/{space_id} (공간 삭제 시 예약 이력 방어)**
> 

```json
// Response 400 Bad Request
{
  "success": false,
  "message": "예약 이력이 존재하는 주차공간은 삭제할 수 없습니다. 관리자에게 문의하세요."
}
```

> **③ POST /api/reservations/{reservation_id}/report-issue (현장 결함 접수)**
> 

```json
// Request Body
{
  "issue_detail": "지정된 주차면에 다른 차량이 무단 주차되어 있어 진입이 불가능합니다."
}

// Response 200 OK
{
  "success": true,
  "data": {
    "reservation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "ISSUE_REPORTED"
  }
}
```

> **④ GET /api/admin/events/{event_id}/reservations (관리자 예약 모니터링)**
> 

```json
// Response 200 OK
{
  "success": true,
  "data": [
    {
      "reservation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "status": "CONFIRMED",
      "vehicle_plate_number": "12가 3456",
      "is_checked_in": true,
      "is_checked_out": false,
      "space": {
        "space_id": "c39a6b10-67c8-4720-94d7-4b78c8942b0c",
        "address": "서울시 송파구 잠실동 123-45"
      },
      "host": {
        "user_id": "b1f2a3c4-1234-5678-9abc-def012345678",
        "name": "김호스트",
        "phone_number": "010-1234-5678"
      }
    }
  ]
}
```

> **⑤ POST /api/admin/events/{event_id}/close (행사 마감 및 일괄 종결)**
> 

```json
// Response 200 OK
{
  "success": true,
  "data": {
    "event_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "CLOSED",
    "auto_completed_reservations_count": 4
  }
}
```

---

## 10. 현장 대응 및 운영 리스크 프로토콜

| 리스크 | Phase 0 대응 프로토콜 | UI 및 시스템 반영 사항 |
| --- | --- | --- |
| **청약철회 / 단순 변심 환불 분쟁** | 행사 특성상 **단순 변심 취소/환불 절대 불가** 원칙 고수 | 결제 화면(화면 4)에 정책 고지 및 필수 동의 체크박스 강제, 미동의 시 결제 버튼 비활성화 |
| **현장 무단점유 / 진입 불가** | 게스트 접수 즉시 관리자 유선 개입. 현장 해결 불가 시 관리자 폰뱅킹으로 **100% 수동 전액 환불** 송금 후 `resolve` 처리 | 이슈 신고 완료 즉시 정·부 비상 연락망 2개 바로 전화 연결 버튼 노출 |
| **출차 지연 (오버스테이)** | 플랫폼 직접 견인 불가. 관리자가 게스트에게 즉시 전화하여 자발적 이동 촉구 | 호스트 화면에 출차 현황 노출 및 미출차 시 관리자 긴급 연락 버튼 노출 |
| **관리자 통화 중 / 부재** | 주 담당자 통화 중 상황 대비를 위해 정·부 운영자 2인 체제 가동 | 모든 긴급 접수 완료 팝업에 주 담당자 및 부 담당자 전화번호 동시 병기 |

---

## Appendix. Phase 1 기능 고도화 전환 기준

**승인 프로세스 전환**: 파일럿 운영 중 노쇼율이 5%를 초과할 경우 호스트 사전 승인제 또는 예비 버퍼 공간 자동 재배정 도입.

**PG 결제 및 자동 환불 도입**: 단일 행사당 유선 이슈 대응 건수가 5건을 초과하거나 수동 계좌 이체 운영 시간이 2시간을 초과할 경우 카드사 PG 연동 및 부분 취소 엔진 구축.

**본인인증 모듈 탑재**: 허위 정보 등록이나 장난성 예약이 3건 이상 발생할 경우 통신사 PASS 본인확인 모듈 도입.

**지도 SDK 연동**: 등록 공간 수가 30면 이상으로 확대되어 텍스트 정렬만으로 탐색 피로도가 증가할 경우 카카오/네이버 지도 SDK 연동.
