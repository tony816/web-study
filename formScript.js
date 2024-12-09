// 페이지가 로드된 후 실행되는 함수
window.onload = function () {
  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const phoneInput = document.getElementById("phone");
  const form = document.querySelector("form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const btnComplete = document.querySelector(".btn-complete");
  const passwordMessage = document.getElementById("password-message");

  let isRequestSent = false; // 요청 상태를 추적하는 플래그 변수

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

  // 비밀번호 확인 함수
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

  // 버튼 클릭 시 입력 검증
  btnComplete.addEventListener("click", function (event) {
    event.preventDefault(); // 기본 폼 제출 방지

    if (isRequestSent) {
      alert("요청이 이미 처리 중입니다.");
      return; // 요청 중복 방지
    }

    let isValid = true;

    // 모든 입력 필드가 채워졌는지 확인
    const requiredFields = document.querySelectorAll(
      'input[type="text"], input[type="password"]'
    );
    requiredFields.forEach(function (field) {
      if (field.value.trim() === "") {
        isValid = false;
        field.style.border = "1px solid red"; // 오류가 있는 필드에 빨간 테두리 1px 적용
      } else {
        field.style.border = "1px solid #ccc"; // 정상 입력 시 테두리 복구
      }
    });

    // 성별 라디오 버튼 그룹 검증
    const genderRadioGroup = document.querySelectorAll('input[name="gender"]');
    const genderSelected = Array.from(genderRadioGroup).some(
      (radio) => radio.checked
    );

    if (!genderSelected) {
      isValid = false;
      genderRadioGroup.forEach(function (radio) {
        radio.classList.add("radio-error"); // radio 버튼에 빨간 테두리 클래스 추가
      });
    }

    // 구독일 라디오 버튼 그룹 검증
    const subscriptionRadioGroup = document.querySelectorAll(
      'input[name="subscription_period"]'
    );
    const subscriptionSelected = Array.from(subscriptionRadioGroup).some(
      (radio) => radio.checked
    );

    if (!subscriptionSelected) {
      isValid = false;
      subscriptionRadioGroup.forEach(function (radio) {
        radio.classList.add("radio-error"); // radio 버튼에 빨간 테두리 클래스 추가
      });
    }

    // 비밀번호 일치 여부 확인
    if (passwordInput.value !== confirmPasswordInput.value) {
      isValid = false;
      confirmPasswordInput.style.border = "1px solid red"; // 빨간 테두리 1px 적용
    }

    if (!isValid) {
      alert("필드를 확인해 주세요.");
      return;
    }

    // birthdate 조합
    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value.padStart(2, "0"); // 두 자리 숫자
    const day = document.getElementById("day").value.padStart(2, "0"); // 두 자리 숫자
    const birthdate = `${year}-${month}-${day}`;

    // hidden input에 설정
    document.getElementById("birthdate").value = birthdate;

    // 알림창 표시 (한 번만 표시)
    if (!isValid) {
      alert("필드를 확인해 주세요."); // 한 번만 오류 메시지 표시
    } else {
      form.submit(); // 폼 제출
    }
  });

  // 라디오 버튼 상태 변경 시 빨간 테두리 제거 (같은 그룹 모두 제거)
  const radioGroups = document.querySelectorAll('input[type="radio"]');
  radioGroups.forEach(function (radio) {
    radio.addEventListener("change", function () {
      // 같은 name 속성을 가진 그룹의 모든 라디오 버튼에서 빨간 테두리 제거
      const groupName = radio.name;
      const radiosInGroup = document.querySelectorAll(
        `input[name="${groupName}"]`
      );
      radiosInGroup.forEach(function (radioInGroup) {
        radioInGroup.classList.remove("radio-error");
      });
    });
  });

  // 서버로 데이터 전송
  document
    .querySelector(".btn-complete")
    .addEventListener("click", function (event) {
      event.preventDefault();

      const formData = {
        name: document.getElementById("name").value.trim(),
        gender:
          document.querySelector('input[name="gender"]:checked')?.value || "",
        birthdate: birthdate, // 조합된 birthdate 사용
        email: `${document.getElementById("email").value}@${
          document.getElementById("email-provider").value
        }`,
        password: document.getElementById("password").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        subscription_period:
          document.querySelector('input[name="subscription_period"]:checked')
            ?.value || "",
      };

      let isValid = true;

      // 각 필드를 검증합니다.
      Object.entries(formData).forEach(([key, value]) => {
        if (!value || value.trim() === "") {
          isValid = false;
          console.error(`필드 ${key}가 비어있습니다.`);
        }
      });

      if (!isValid) {
        alert("모든 필드를 정확히 입력해주세요.");
        return;
      }

      console.log("폼 데이터:", formData);

      isRequestSent = true; // 요청 상태 설정

      fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          isRequestSent = false; // 요청 완료 후 플래그 초기화
          return response.text();
        })
        .then((data) => {
          console.log("서버 응답:", data);
          alert(data); // 서버로부터 받은 메시지를 사용자에게 표시
          // 필요하다면 여기에서 페이지 이동이나 추가 처리를 합니다.
        })
        .catch((error) => {
          isRequestSent = false; // 에러 발생 시 플래그 초기화
          console.error("전송 오류:", error);
          alert("요청 중 오류가 발생했습니다. 다시 시도해주세요.");
        });
    });
};
