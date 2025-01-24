function loadHeaderJS() {
    const authToken = localStorage.getItem("authToken");
    const authButtonsContainer = document.querySelector(".auth-buttons");

    authButtonsContainer.innerHTML = authToken
        ? `<button id="logout-button" class="logout-button">로그아웃</button>`
        : `<a href="login.html" class="btn-login">로그인</a>
           <a href="apply.html" class="btn btn-primary">가입 신청하기</a>`;

    if (authToken) {
        document.getElementById("logout-button").addEventListener("click", () => {
            localStorage.removeItem("authToken");
            window.location.href = "login.html";
        });
    }

    authButtonsContainer.classList.add("visible");
};
