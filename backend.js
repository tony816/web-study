let isRequestSent = false; // 요청 중복 방지를 위한 플래그

export function submitForm() {
  const form = document.querySelector("form");
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value.padStart(2, "0"); // 두 자리 숫자
  const day = document.getElementById("day").value.padStart(2, "0"); // 두 자리 숫자
  const birthdate = `${year}-${month}-${day}`;

  // Hidden 필드에 설정
  document.getElementById("birthdate").value = birthdate;

  const formData = {
    name: document.getElementById("name").value.trim(),
    gender: document.querySelector('input[name="gender"]:checked')?.value || "",
    birthdate: birthdate,
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

  // 필드별 검증
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

  // 중복 요청 방지
  if (isRequestSent) {
    alert("요청이 이미 처리 중입니다.");
    return;
  }

  isRequestSent = true;

  fetch("https://localhost:3001/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 쿠키와 인증 정보를 포함
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`서버 오류: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert("회원가입 완료");
        form.reset(); // 모든 폼 입력값 초기화
        const radioGroups = document.querySelectorAll('input[type="radio"]');
        radioGroups.forEach((radio) => radio.classList.remove("radio-error"));
      } else {
        alert("오류 발생: " + data.message);
      }
    })
    .catch((error) => {
      isRequestSent = false; // 에러 발생 시 초기화
      console.error("전송 오류:", error);
      alert("요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    });
}
