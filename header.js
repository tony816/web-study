function loadHeaderJS() {
  const authToken = localStorage.getItem("authToken");
  const authButtonsContainer = document.querySelector(".auth-buttons");

  // 아이콘 요소는 유지하고 버튼만 동적으로 변경
  const iconHTML = `
        <a href="dashboard.html" class="profile-icon-button" aria-label="내 정보">
            <div class="profile-icon-css"></div>
        </a>
    `;

  const buttonsHTML = authToken
    ? `<button id="logout-button" class="logout-button">로그아웃</button>`
    : `<a href="login.html" class="btn-login">로그인</a>
           <a href="apply.html" class="btn btn-primary">가입 신청하기</a>`;

  authButtonsContainer.innerHTML = iconHTML + buttonsHTML;

  if (authToken) {
    document.getElementById("logout-button").addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    });
  }

  authButtonsContainer.classList.add("visible");
}
