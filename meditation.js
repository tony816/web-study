let currentAudio = null; // 현재 재생 중인 오디오
let currentThumbnail = null; // 현재 재생 중인 썸네일

function toggleAudio(thumbnailElement) {
  const audioFile = thumbnailElement.getAttribute("data-audio");
  if (!audioFile) {
    console.error("❌ 오디오 파일 경로가 제공되지 않았습니다.");
    return;
  }

  const playIcon = thumbnailElement.querySelector(".play-icon");

  // 기존 오디오 중지
  if (currentAudio && currentAudio !== thumbnailElement.audio) {
    currentAudio.pause();
    if (currentThumbnail) {
      const prevPlayIcon = currentThumbnail.querySelector(".play-icon");
      prevPlayIcon.classList.remove("pause");
      prevPlayIcon.classList.add("play");
    }
  }

  // 새로운 오디오 객체 생성
  if (!thumbnailElement.audio) {
    thumbnailElement.audio = new Audio(audioFile);

    thumbnailElement.audio.addEventListener("ended", () => {
      console.log("📌 오디오 재생 완료. 서버에 로그 저장 요청.");

      saveAudioLog(audioFile, thumbnailElement.audio.duration);

      playIcon.classList.remove("pause");
      playIcon.classList.add("play");
      currentAudio = null;
      currentThumbnail = null;
    });
  }

  if (thumbnailElement.audio.paused) {
    thumbnailElement.audio.play();
    playIcon.classList.remove("play");
    playIcon.classList.add("pause");
    currentAudio = thumbnailElement.audio;
    currentThumbnail = thumbnailElement;
    console.log("📌 오디오 재생 시작:", audioFile);
  } else {
    thumbnailElement.audio.pause();
    playIcon.classList.remove("pause");
    playIcon.classList.add("play");
    currentAudio = null;
    currentThumbnail = null;
    console.log("📌 오디오 재생 중지:", audioFile);
  }
}

// JWT를 디코딩하는 함수 추가
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ JWT 디코딩 실패:", error);
    return null;
  }
}

//서버 전송

function saveAudioLog(audioFile, duration) {
  console.log("📌 `saveAudioLog()` 실행됨");

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("❌ 로그인 토큰이 없습니다.");
    return;
  }

  const decodedToken = parseJwt(token);
  if (!decodedToken || !decodedToken.userId) {
    console.error("❌ 토큰에서 userId를 추출할 수 없습니다.");
    return;
  }

  const userId = decodedToken.userId;

  console.log("📌 서버로 전송할 데이터:", { userId, audioFile, duration });

  fetch("https://localhost:3001/audio-played", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      audioFile,
      duration: Math.floor(duration),
    }),
  })
    .then((response) => {
      console.log("📌 서버 응답 상태 코드:", response.status);
      return response.text();
    })
    .then((data) => console.log("✅ 서버 응답:", data))
    .catch((err) => console.error("❌ 오류 발생:", err));
}
