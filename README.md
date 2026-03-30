# RPG_IDLE

GitHub Pages에 바로 올릴 수 있는 방치형 RPG 프로토타입입니다.

## 현재 포함된 루프

- `100 x 100` 구조의 월드 / 세부 스테이지 진행
- 일정 월드 도달 시 던전 해금
- `Gold`, `Diamond`, `Essence` 3종 재화
- `Diamond` 기반 장비 뽑기와 자동 장착
- 장비 인벤토리와 스테이터스 창
- 업그레이드 / 축복 설명 UI
- 로컬 저장과 오프라인 보상

## 구조

- 원본 소스: `src/app.ts`
- 브라우저 실행 파일: `app.js`
- 스타일: `styles.css`
- 정적 진입점: `index.html`

현재 작업 환경에는 `node`와 `tsc`가 없어서 배포용 `app.js`도 저장소에 함께 포함했습니다.

## 저장 방식

플레이 데이터는 브라우저의 `localStorage`에 저장됩니다.

- 같은 브라우저와 같은 기기에서는 유지됩니다.
- 다른 기기와 동기화되지는 않습니다.
- 로그인, 클라우드 저장, 랭킹이 필요해지면 이후에 백엔드를 붙이면 됩니다.

## GitHub Pages

`Settings > Pages > Build and deployment` 에서 소스를 `GitHub Actions` 로 설정해야 첫 배포가 정상 동작합니다.

배포 주소:

`https://casing1.github.io/RPG_IDLE/`
