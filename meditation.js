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
