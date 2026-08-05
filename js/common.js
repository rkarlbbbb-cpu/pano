// =====================================================
// 🎛️ 버튼 활성화 제어 (불 켜기)
// =====================================================
function setActiveButton(id){
  document.querySelectorAll('.left-buttons .btn')
    .forEach(btn => btn.classList.remove('active'));

  const el = document.getElementById(id);
  if(el) el.classList.add('active');
}

// =====================================================
// 🎯 VR 투어 구동 및 창 닫힘 실시간 감지 감시자
// =====================================================
function openVR(url){
  setActiveButton('vrBtn');

  // 가상현실 전용 새 창 열기 (가로 1200, 세로 800 크기 제한)
  const vrWindow = window.open(url, "_blank", "width=1200,height=800");

  // 사용자가 VR 창을 닫았는지 0.5초마다 실시간 감시하는 타이머 가동
  const checkClose = setInterval(() => {
    if (!vrWindow || vrWindow.closed) {
      clearInterval(checkClose); // 감시 타이머 종료
      
      // VR 버튼의 불빛(.active 클래스)을 지워 원래 디자인으로 복원
      const btn = document.getElementById('vrBtn');
      if (btn) btn.classList.remove('active');
    }
  }, 500);
}

// =====================================================
// 🎬 동영상 팝업 열기 / 닫기 자동화 (✕ 버튼 기능 삭제 버전)
// =====================================================
function openVideo(){
  // 1. 내부영상 버튼 불 확실하게 켜기
  setActiveButton('videoBtn');

  const popup = document.getElementById("videoPopup");
  const video = document.getElementById("videoFrame");

  if(!popup) return;

  // 2. 동영상 팝업창 활성화
  popup.classList.add("active");

  // 3. Vercel Blob 원본 영상 로드 및 즉시 재생 시작
  if(video) {
    video.load();
    video.play().catch(error => {
      console.log("자동재생 차단 방지용: ", error);
    });
  }

  // 4. 닫기 공통 처리 함수 (검은 배경 클릭 전용)
  const closeVideoPopup = () => {
    popup.classList.remove("active"); // 팝업창 끄기
    
    // 영상을 즉시 정지하고 처음 위치로 리셋하여 소리 찌꺼기 완벽 차단
    if(video) {
      video.pause();
      video.currentTime = 0; 
    }
    
    // 내부영상 버튼의 불빛(.active 클래스)을 완벽하게 삭제하여 복원
    document.querySelectorAll('.left-buttons .btn')
      .forEach(btn => btn.classList.remove('active'));
  };

  // 💡 오직 검은색 배경(팝업 장막)을 클릭했을 때만 안전하게 닫히고 불이 꺼집니다
  popup.onclick = (e) => {
    if(e.target === popup) {
      closeVideoPopup();
    }
  };
}

// =====================================================
// 갤러리 (상태 변경 및 노출)
// =====================================================
function openGallery(){
  const grid = document.querySelector(".gallery-grid");
  if(!grid) return;
  grid.style.display = "grid";
}

// =====================================================
// 메인화면 복귀 버튼 자동화
// =====================================================
function initCloseButton(){
  const btn = document.getElementById("closeBtn");
  if(!btn) return;

  btn.innerText = "메인화면";
  btn.onclick = () => {
    window.location.href = "../index.html";
  };
}

// =====================================================
// 전체화면 토글 제어
// =====================================================
function toggleFullScreen(){
  const btn = document.getElementById("fullscreenBtn");

  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen();
    if(btn) btn.innerText = "전체화면 해제";
  } else {
    document.exitFullscreen();
    if(btn) btn.innerText = "전체화면";
  }
}

// =====================================================
// 🖼️ 카드 클릭 시 짤림 없는 원본 비율 대형 확대 뷰어 (버그 완벽 수정)
// =====================================================
document.addEventListener("click", e => {
  if(!e.target.matches(".gallery-grid img")) return;

  const img = e.target;
  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.85); /* 💡 어두운 톤을 높여 사진 몰입감 유도 */
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;
    cursor:zoom-out;
  `;

  const clone = document.createElement("img");
  clone.src = img.src;

  // 💡 수정 핵심: 강제 고정 크기 배수(*3.0)와 object-fit:cover를 전량 폐기했습니다.
  // 💡 모니터 및 노트북 기기 해상도에 맞추어 짤림 현상이 0%도 없도록 원본 스케일 자동 정렬을 부여합니다.
  clone.style.cssText = `
    max-width: 90%;
    max-height: 85%;
    object-fit: contain; /* 💡 핵심: 사진의 상하좌우를 자르지 않고 원본 비율 원복 */
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,.5);
  `;

  overlay.onclick = () => overlay.remove();
  overlay.appendChild(clone);
  document.body.appendChild(overlay);
});

// =====================================================
// 로드시 초기 실행 트리거 (VR 닫힘 자동 감지 기능 보존)
// =====================================================
window.onload = () => {
  initCloseButton();

  const origWindowOpen = window.open;
  let activeVRWindow = null;

  window.open = function(...args) {
    const newWin = origWindowOpen.apply(this, args);
    if (newWin && args && args.toString().includes('vercel.app')) {
      activeVRWindow = newWin;
    }
    return newWin;
  };

  setInterval(() => {
    if (activeVRWindow && activeVRWindow.closed) {
      activeVRWindow = null; 
      const btn = document.getElementById('vrBtn');
      if (btn) btn.classList.remove('active');
    }
  }, 400);
};
