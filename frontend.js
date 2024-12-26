// frontend.js
import { submitForm } from "./backend.js";

window.onload = function () {
  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordMessage = document.getElementById("password-message");

  // 연도 추가 (2023 ~ 1900)
  for (let i = 2023; i >= 1900; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}년`;
    yearSelect.appendChild(option);
  }

  // 월 추가 (1월 ~ 12월)
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}월`;
    monthSelect.appendChild(option);
  }

  // 일 추가 (1 ~ 31)
  for (let i = 1; i <= 31; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i}일`;
    daySelect.appendChild(option);
  }

  // 중복 확인 버튼 클릭 이벤트 등록
  const checkEmailButton = document.getElementById("check-email");
  checkEmailButton.addEventListener("click", function () {
    const emailInput = document.getElementById("email").value.trim();
    const emailProvider = document.getElementById("email-provider").value;
    
    if (!emailInput) {
      alert("이메일을 입력해 주세요.");
      return;
    }
    
    const emailUsernameRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/;

    if (!emailUsernameRegex.test(emailInput)) {
      alert("이메일 아이디는 영문과 숫자 조합이어야 합니다.");
      return;
    }

    const email = `${emailInput}@${emailProvider}`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("유효하지 않은 이메일 형식입니다.");
      return;
    }

    // 서버로 이메일 중복 확인 요청
    fetch(`http://localhost:3001/check-email?email=${email}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.available) {
          alert("이미 사용 중인 이메일입니다.");
        } else {
          alert("사용 가능한 이메일입니다.");
        }
      })
      .catch((error) => console.error("이메일 중복 확인 오류:", error));
  });

  function checkPasswordMatch() {
    if (passwordInput.value === "") {
      passwordMessage.textContent = ""; // 비어 있으면 메시지를 숨김
    } else if (passwordInput.value === confirmPasswordInput.value) {
      passwordMessage.textContent = "비밀번호가 일치합니다.";
      passwordMessage.style.color = "green"; // 일치할 경우 녹색 메시지
    } else {
      passwordMessage.textContent = "비밀번호가 일치하지 않습니다.";
      passwordMessage.style.color = "red"; // 일치하지 않을 경우 빨간 메시지
    }
  }

  // 비밀번호 필드에 입력이 있을 때마다 확인
  passwordInput.addEventListener("input", checkPasswordMatch);
  confirmPasswordInput.addEventListener("input", checkPasswordMatch);

  // 휴대폰 번호 입력 시 자동 하이픈 추가
  phoneInput.addEventListener("input", function () {
    let phone = phoneInput.value.replace(/\D/g, ""); // 숫자만 남김
    if (phone.length > 3 && phone.length <= 7) {
      phone = phone.replace(/(\d{3})(\d+)/, "$1-$2");
    } else if (phone.length > 7) {
      phone = phone.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    }
    phoneInput.value = phone;
  });

  // 라디오 버튼 상태 변경 시 빨간 테두리 제거
  const radioGroups = document.querySelectorAll('input[type="radio"]');
  radioGroups.forEach(function (radio) {
    radio.addEventListener("change", function () {
      const groupName = radio.name;
      const radiosInGroup = document.querySelectorAll(
        `input[name="${groupName}"]`
      );
      radiosInGroup.forEach(function (radioInGroup) {
        radioInGroup.classList.remove("radio-error");
      });
    });
  });
  // 폼 제출 시 비밀번호 형식 검증
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // 폼 제출 중지

    const password = passwordInput.value;

    // 비밀번호 형식 검증 (영문, 숫자, 특수문자 포함)
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#\+])[A-Za-z\d@$!%*?&#\+]{8,}$/;

    if (!passwordRegex.test(password)) {
      // 경고창 표시
      alert(
        "비밀번호는 영문, 숫자, 특수문자를 포함해야 하며, 최소 8자 이상이어야 합니다."
      );

      // 비밀번호 초기화
      passwordInput.value = "";
      confirmPasswordInput.value = "";
      passwordInput.focus(); // 비밀번호 입력 칸에 다시 포커스 설정
      return; // 폼 제출 중지
    }

    // 비밀번호가 유효한 경우 폼 제출
    submitForm(); // backend.js의 함수 호출
  });
};
