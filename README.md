# RPG_IDLE

GitHub Pages에 바로 배포할 수 있는 방치형 RPG 프로토타입입니다.

## 스택

- HTML
- CSS
- TypeScript

브라우저가 직접 읽는 파일은 루트의 `app.js`이고, 실제 소스는 `src/app.ts`입니다.

## 현재 구현된 내용

- 자동 전투 기반 방치형 전투 루프
- 지역 해금과 보스 진행
- 골드 업그레이드와 정수 축복
- 로컬 저장과 오프라인 보상
- GitHub Pages 배포 워크플로

## 저장 방식

현재는 `localStorage`를 사용해 브라우저에 플레이 데이터를 저장합니다.

- 같은 브라우저, 같은 기기에서는 저장이 유지됩니다.
- 다른 기기와 동기화되지는 않습니다.
- 로그인, 랭킹, 클라우드 저장이 필요해지면 그때 백엔드를 붙이면 됩니다.

## TypeScript 구조

- 소스: `src/app.ts`
- 배포용 스크립트: `app.js`
- 설정: `tsconfig.json`

현재 작업 환경에는 `node`와 `tsc`가 없어서, 배포용 `app.js`도 저장소에 함께 포함했습니다.

## 로컬 실행

`index.html`을 브라우저에서 바로 열어도 되고, 간단한 정적 서버로 실행해도 됩니다.

## 추후 빌드 예정 명령

Node.js 설치 후 아래 흐름으로 이어갈 수 있게 구성했습니다.

```bash
npm install
npm run check
npm run build
```

## GitHub Pages

저장소의 `Settings > Pages > Build and deployment`에서 소스를 `GitHub Actions`로 설정해야 첫 배포가 정상 동작합니다.

배포 주소:

`https://casing1.github.io/RPG_IDLE/`
