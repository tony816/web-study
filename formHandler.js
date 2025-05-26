// formHandler.js

import {
  validateFormFields,
  validateRadioGroup,
  validatePasswordMatch,
} from "./formValidator.js";

import {
  checkEmailAvailability,
  checkUserDuplicate,
  submitRegistration,
} from "./api.js";

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const checkEmailBtn = document.getElementById("check-email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const phoneInput = document.getElementById("phone");

  // 날짜 선택 초기화
  populateDateSelectors();

  // 비밀번호 실시간 검증
  passwordInput.addEventListener("input", () => {
    validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
  });
  confirmPasswordInput.addEventListener("input", () => {
    validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
  });

  // 휴대폰 하이픈 자동 입력
  phoneInput.addEventListener("input", () => {
    let phone = phoneInput.value.replace(/\D/g, "");
    if (phone.length > 3 && phone.length <= 7) {
      phone = phone.replace(/(\d{3})(\d+)/, "$1-$2");
    } else if (phone.length > 7) {
      phone = phone.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    }
    phoneInput.value = phone;
  });

  // 이메일 중복 확인 버튼
  checkEmailBtn.addEventListener("click", async () => {
    const emailId = document.getElementById("email").value.trim();
    const emailProvider = document.getElementById("email-provider").value;
    const email = `${emailId}@${emailProvider}`;

    try {
      const available = await checkEmailAvailability(email);
      alert(
        available ? "사용 가능한 이메일입니다." : "이미 등록된 이메일입니다."
      );
    } catch (err) {
      console.error(err);
      alert("이메일 중복 확인 중 오류가 발생했습니다.");
    }
  });

  // 가입 폼 제출
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 기본 필드 확인
    const fieldsValid = validateFormFields();
    const genderValid = validateRadioGroup("gender");
    const subValid = validateRadioGroup("subscription");
    const passwordsMatch = validatePasswordMatch(password, confirmPassword);

    if (!fieldsValid || !genderValid || !subValid || !passwordsMatch) {
      alert("필드를 확인해 주세요.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = phoneInput.value.trim();

    // 사용자 중복 확인
    try {
      const userAvailable = await checkUserDuplicate(name, phone);
      if (!userAvailable) {
        alert("이미 가입된 사용자입니다.");
        return;
      }
    } catch (err) {
      alert("사용자 중복 확인 중 오류 발생");
      return;
    }

    // 서버 전송 데이터 구성
    const email = `${document.getElementById("email").value}@${
      document.getElementById("email-provider").value
    }`;
    const birthdate = `${document.getElementById("year").value}-${String(
      document.getElementById("month").value
    ).padStart(2, "0")}-${String(document.getElementById("day").value).padStart(
      2,
      "0"
    )}`;

    const formData = {
      name,
      gender: document.querySelector('input[name="gender"]:checked').value,
      birthdate,
      email,
      password,
      phone,
      subscription_period: document.querySelector(
        'input[name="subscription"]:checked'
      ).value,
    };

    // 서버 요청
    try {
      const response = await submitRegistration(formData);
      if (response.success) {
        alert("가입이 완료되었습니다.");
        form.reset();
      } else {
        alert(response.message || "가입 실패");
      }
    } catch (err) {
      console.error(err);
      alert("가입 요청 중 오류가 발생했습니다.");
    }
  });
});

// 날짜 셀렉터 자동 생성
function populateDateSelectors() {
  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");

  for (let y = 2023; y >= 1900; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.text = `${y}년`;
    yearSelect.appendChild(opt);
  }
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.text = `${m}월`;
    monthSelect.appendChild(opt);
  }
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.text = `${d}일`;
    daySelect.appendChild(opt);
  }
}
