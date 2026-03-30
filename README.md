# RPG_IDLE

GitHub Pages에 바로 올릴 수 있도록 만든 방치형 RPG 웹 프로토타입입니다.

## 선택한 스택

- HTML
- CSS
- Vanilla JavaScript

Node.js 없이도 바로 수정하고 배포할 수 있어서 초기 프로토타입에 가장 빠른 구성이었습니다.

## 현재 포함된 기능

- 자동 전투 기반 방치형 전투 루프
- 지역 해금과 보스 진행
- 골드 업그레이드와 정수 축복 시스템
- 전투 로그, 저장, 오프라인 보상
- GitHub Pages 자동 배포 워크플로

## 로컬 실행

`index.html`을 브라우저에서 바로 열어도 동작합니다.

## GitHub Pages 배포

저장소에 push 되면 `.github/workflows/deploy-pages.yml` 이 실행되도록 구성했습니다.

배포 주소는 보통 아래 형식입니다.

`https://casing1.github.io/RPG_IDLE/`

만약 첫 배포가 바로 시작되지 않으면 GitHub 저장소의 `Settings > Pages > Build and deployment` 에서 소스를 `GitHub Actions`로 맞춰 주세요.
