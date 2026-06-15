# 한잔할까 🍺

> 위치 기반 술집 탐색 및 AI 추천 서비스
>
> iOS / Android 크로스플랫폼 앱 (React Native)

**[📲 앱 다운로드](https://team-spirit.click/link/install/store)**

<br/>

## 스크린샷

| 홈 | 탐색 | 술집 상세 | 지도 | AI 챗봇 |
|:---:|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots/홈 화면.png" width="160"/> | <img src="docs/screenshots/탐색 화면.png" width="160"/> | <img src="docs/screenshots/가게 상세 화면.png" width="160"/> | <img src="docs/screenshots/맵 화면.png" width="160"/> | <img src="docs/screenshots/AI 탐색 결과 화면.png" width="160"/> |

<br/>

## 소개

**한잔할까**는 현재 위치 기반으로 주변 술집을 탐색하고, AI 챗봇이 사용자 요청에 맞는 술집을 추천해주는 모바일 앱입니다.
사용자와 사장님 모두를 위한 기능을 제공하며, 술집 등록부터 주문·결제·통계까지 풀사이클로 구성되어 있습니다.

- **버전**: v1.6.0 (빌드 78회)
- **플랫폼**: iOS / Android
- **팀 구성**: 프론트엔드 2인
- **개발 기간**: 2025.02 ~

<br/>

## 주요 기능

### 사용자
| 기능 | 설명 |
|------|------|
| 위치 기반 탐색 | 현재 위치 기반 주변 술집 지도·리스트 조회, 반경 설정 |
| AI 챗봇 추천 | 음성·텍스트 입력으로 술집 추천, 대화 문맥 유지 |
| 오늘의 추천 | 가성비·최저가·현재 영업 중 술집 큐레이션 |
| 술집 상세 | 메뉴·주종·영업시간·이벤트·리뷰 조회 |
| 커뮤니티 | 게시글 작성·댓글·좋아요·스크랩 |
| 주문·결제 | 앱 내 주문 및 카드 결제 |
| 소셜 로그인 | 카카오·구글·애플 OAuth |
| 본인인증 | SKT·KT·LGU+ 통신사 본인인증 (MOK) |

### 사장님
| 기능 | 설명 |
|------|------|
| 술집 등록·관리 | 메뉴·주종·영업시간·이벤트 관리 |
| 주문 관리 | 실시간 주문 수락·처리 |
| 방문자 통계 | 성별·연령 분포 차트, 좋아요·조회수 추이 |

<br/>

## 기술 스택

### Frontend
- **React Native** 0.76.5 — iOS / Android 크로스플랫폼
- **React Navigation** — Stack, Bottom Tab, Material Top Tab
- **React Native Reanimated** — 고성능 애니메이션
- **Lottie** — 벡터 애니메이션

### 상태 관리 / 데이터
- **Context API** — 인증, 알림, 지도 검색, 커스텀 알럿 등 전역 상태 관리
- **AsyncStorage** — 토큰, 위치, 알림 설정 로컬 저장
- **Axios** — API 통신, 인터셉터 기반 토큰 자동 갱신 및 재시도 처리

### 인증 / 외부 서비스
- **Firebase** (FCM) — 푸시 알림
- **Kakao SDK** — 소셜 로그인, 카카오 지도
- **Google Sign-in** — 소셜 로그인
- **Apple Authentication** — 소셜 로그인
- **MOK** — 통신사 본인인증

### 인프라 / 개발 환경
- **react-native-config** — dev / prod 멀티 환경 분리
- **Notifee** — 로컬 푸시 알림
- **react-native-fast-image** — 이미지 캐싱 및 성능 최적화
- **Google Mobile Ads** — 광고

<br/>

## 아키텍처

```
src/
├── api/            # Axios 인스턴스, API 모듈 (도메인별 분리)
├── context/        # 전역 상태 (Auth, Notification, Map 등)
├── screens/        # 화면 컴포넌트
│   ├── OAuth/      # 로그인·회원가입·본인인증
│   ├── BottomTab/  # 메인 탭 (탐색, 지도, 커뮤니티, 마이)
│   ├── StoreInfo/  # 술집 상세
│   ├── StoreRegister/ # 술집 등록
│   ├── Chatbot/    # AI 챗봇
│   └── TotalScreen/ # 전체보기 (추천, 최저가 등)
├── components/     # 재사용 UI 컴포넌트
├── hooks/          # 커스텀 훅
├── navigation/     # 네비게이터 정의
├── storage/        # AsyncStorage 유틸
└── utils/          # 공통 유틸
```

**주요 설계 포인트**
- Axios 인터셉터로 Access Token 만료 시 자동 재발급 및 원본 요청 재시도
- Context + 전역 함수 패턴으로 네비게이션 외부에서 logout·alert 호출 가능
- dev / prod 환경 변수 분리로 개발·운영 서버 독립 빌드

<br/>

## 트러블슈팅

### 1. Access Token 만료 시 화면 분기 처리

토큰이 만료된 상태에서 API 요청이 발생하면 Axios 인터셉터에서 Refresh Token으로 재발급을 시도하고, 원본 요청을 자동으로 재시도하도록 구현했습니다.
Refresh Token마저 만료된 경우에는 전역 logout 함수를 호출해 로그인 화면으로 분기 처리했습니다.
네비게이션 컨텍스트 외부에서도 화면 이동이 가능하도록 `NavigationService`를 통해 전역에서 네비게이션을 참조하는 구조를 적용했습니다.

### 2. 댓글 입력창 키보드 애니메이션 (iOS / Android)

iOS와 Android에서 키보드 동작 방식이 달라 플랫폼별로 분기 처리가 필요했습니다.
키보드가 올라오는 타이밍에 맞춰 댓글 입력창이 자연스럽게 따라 올라오도록 `Animated` API와 키보드 이벤트 리스너를 조합해 구현했습니다.
단순히 `KeyboardAvoidingView`만으로는 플랫폼 간 동작 차이를 해결할 수 없어 직접 애니메이션을 제어하는 방식으로 전환했습니다.

### 3. 게시글 사진 파일 크기 측정 및 최적화

사용자가 선택한 이미지를 그대로 업로드하면 파일 크기가 지나치게 커지는 문제가 있었습니다.
`react-native-fs`로 파일 크기를 측정한 뒤, 기준을 초과하는 경우 `react-native-image-crop-picker`의 압축 옵션을 적용해 업로드 전 최적화 처리를 하도록 구현했습니다.

<br/>

## 실행 방법

```bash
# 의존성 설치
npm install
cd ios && pod install && cd ..

# 개발 서버 실행 (iOS)
npm run ios-dev

# 개발 서버 실행 (Android)
npm run android
```

> `ios/GoogleService-Info.plist`, `android/app/google-services.json` 파일은 보안상 git에서 제외되어 있습니다.
> 별도 공유된 파일을 각 경로에 추가 후 빌드하세요.

<br/>

## 환경 변수

`.env` 파일을 프로젝트 루트에 생성 후 아래 항목을 설정합니다.

```
BASE_URL=
AUTH_URL=
KAKAO_APP_KEY=
KAKAO_APP_SCHEMES=
GOOGLE_WEB_CLIENT_ID=
GOOGLE_CLIENT_SCHEMES=
GOOGLE_ADS_APPID=
```
