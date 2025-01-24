document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");

  // 로그인 상태 확인
  if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html"; // 로그인 페이지로 리디렉션
      return;
  }


function playAudio(audioFile) {
  if (!audioFile) {
    console.error("오디오 파일 경로가 제공되지 않았습니다.");
    return;
  }
  const audio = new Audio(audioFile);
  audio.play().catch((error) => {
    console.error("오디오 재생 중 오류가 발생했습니다:", error);
  });
}

let currentAudio = null; // 현재 재생 중인 오디오
let currentThumbnail = null; // 현재 재생 중인 썸네일

function toggleAudio(audioFile, thumbnailElement) {
  if (!thumbnailElement.classList.contains("thumbnail")) {
    console.error("썸네일 요소가 아닙니다.");
    return;
  }

  // 기존 오디오 초기화
  if (currentAudio && currentAudio !== thumbnailElement.audio) {
    currentAudio.pause();
    if (currentThumbnail) {
      const playIcon = currentThumbnail.querySelector(".play-icon");
      playIcon.classList.remove("pause");
      playIcon.classList.add("play");
    }
  }

  // 새 오디오 재생/일시정지
  if (!thumbnailElement.audio) {
    thumbnailElement.audio = new Audio(audioFile);
    thumbnailElement.audio.addEventListener("ended", () => {
      const playIcon = thumbnailElement.querySelector(".play-icon");
      playIcon.classList.remove("pause");
      playIcon.classList.add("play");
    });
  }

  const playIcon = thumbnailElement.querySelector(".play-icon");

  if (thumbnailElement.audio.paused) {
    thumbnailElement.audio.play();
    playIcon.classList.remove("play");
    playIcon.classList.add("pause");
    currentAudio = thumbnailElement.audio;
    currentThumbnail = thumbnailElement;
  } else {
    thumbnailElement.audio.pause();
    playIcon.classList.remove("pause");
    playIcon.classList.add("play");
    currentAudio = null;
    currentThumbnail = null;
  }
}

const audioElements = document.querySelectorAll("audio");

    audioElements.forEach(audio => {
        audio.addEventListener("ended", () => {
            const duration = Math.floor(audio.duration); // 재생 시간 (초 단위)
            const audioFile = audio.getAttribute("src");

            fetch("http://localhost:3001/audio-played", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: parseJwt(token).userId, // 토큰에서 userId 추출
                    audioFile,
                    duration,
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("오디오 재생 로그 저장 실패");
                    }
                    return response.text();
                })
                .then(data => console.log(data))
                .catch(err => console.error(err));
        });
    });
});

// 토큰에서 userId 추출 (예시 함수)
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
      atob(base64)
          .split("")
          .map(c => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
  );
  return JSON.parse(jsonPayload);
}