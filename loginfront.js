const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 제출 방지

    // 입력 데이터 수집
    const email = `${document.getElementById("email").value.trim()}@${
        document.getElementById("email-provider").value
    }`;
    const passwordInput = document.getElementById("password");
    const password = document.getElementById("password").value.trim();

    // 간단한 클라이언트 측 유효성 검사
    if (!email || !password) {
        alert("이메일과 비밀번호를 모두 입력해주세요.");
        return;
    }

    try {
        // 서버에 로그인 요청
        const response = await fetch("https://localhost:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
            
        }

        const data = await response.json();
        localStorage.setItem("authToken", data.token);
        alert("로그인 성공!"); // 성공 메시지 표시
        window.location.href = "dashboard.html"; // 대시보드로 이동
    } catch (error) {
        console.error("로그인 오류:", error.message);
        alert("로그인 실패: " + error.message);
        passwordInput.value = "";
    }
    
});

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("authToken");
    if (token) {
        // 이미 로그인된 상태라면 대시보드로 리디렉션
        window.location.href = "dashboard.html";
    }
});

