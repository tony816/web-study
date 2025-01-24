document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("로그인이 필요합니다.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("https://localhost:3001/dashboard", {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("인증 실패. 다시 로그인 해주세요.");
        }

        const data = await response.json();
        // 대시보드 데이터를 화면에 표시
        document.getElementById("user-info").innerText = JSON.stringify(data.user, null, 2);
    } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error.message);
        localStorage.removeItem("authToken");
        alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
        window.location.href = "login.html";
    }


    const userId = parseJwt(token).userId;

    // 서버에 사용자 로그 요청
    fetch(`http://localhost:3001/user-audio-logs/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("로그 데이터를 불러오는 데 실패했습니다.");
            }
            return response.json();
        })
        .then(logs => {
            const logsList = document.getElementById("audio-logs-list");
            logs.forEach(log => {
                const listItem = document.createElement("li");
                listItem.textContent = `${log.audio_file} - ${log.duration}초 재생 - ${new Date(log.played_at).toLocaleString()}`;
                logsList.appendChild(listItem);
            });
        })
        .catch(err => console.error("에러:", err));

});

// parseJwt 함수는 JWT에서 userId를 추출
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