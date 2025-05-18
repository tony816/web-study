import { fetchWithToken } from "./utils.js";

async function loadTotalPoints() {
  try {
    const [pointsRes, logsRes] = await Promise.all([
      fetchWithToken("https://localhost:3001/api/total-points"),
      fetchWithToken("https://localhost:3001/api/audio-logs"),
    ]);

    if (!pointsRes.ok || !logsRes.ok) throw new Error("데이터 조회 실패");

    const pointsData = await pointsRes.json();
    const logsData = await logsRes.json();

    const level = logsData.length > 0 ? logsData[0].level ?? "N/A" : "N/A";

    const container = document.getElementById("totalPointsContainer");
    container.innerHTML = `
      <table class="table table-bordered w-auto">
        <thead>
          <tr>
            <th>레벨</th>
            <th>총 포인트</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${level}</td>
            <td>${pointsData.totalPoints ?? 0}점</td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error("총 포인트 또는 레벨 불러오기 실패:", err);
  }
}

async function loadAudioLogs() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    document.querySelector("main").innerHTML = "<p>로그인이 필요합니다.</p>";
    return;
  }

  try {
    const response = await fetchWithToken(
      "https://localhost:3001/api/audio-logs",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("데이터 로드 실패");

    const logs = await response.json();
    renderLogs(logs);
  } catch (error) {
    document.querySelector(
      "main"
    ).innerHTML = `<p>오류 발생: ${error.message}</p>`;
  }
}

function renderLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    document.querySelector("main").innerHTML = "<p>재생 기록이 없습니다.</p>";
    return;
  }

  const main = document.querySelector("main");

  // 상단 제목 + 총 포인트 div 삽입
  main.innerHTML = `
    <h1 class='mb-4'>활동 기록</h1>
    <div id="totalPointsContainer" class="mb-4"></div>
  `;

  loadTotalPoints();

  // 로그 테이블 생성
  const table = document.createElement("table");
  table.className = "table custom-clean";
  table.innerHTML = `
    <thead>
      <tr>
        <th>음원</th>
        <th>재생횟수</th>
        <th>포인트</th>
      </tr>
    </thead>
    <tbody>
      ${logs
        .map(
          (log) => `
        <tr>
          <td>${log.title ?? "제목 없음"}</td>
          <td>${log.play_count}</td>
          <td>${log.point}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;

  // 테이블 삽입
  main.appendChild(table);
}

window.addEventListener("DOMContentLoaded", () => {
  loadAudioLogs();
});
