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

export function initializeForm() {
  populateDateSelectors();
  setupPasswordValidation();
  setupPhoneAutoHyphen();
  setupEmailDomainSync();
  setupEmailDuplicationCheck();
  setupUserDuplicationCheck();
  setupFormSubmission();
  setupCheckEmailButton();
}

function populateDateSelectors() {
  const yearSelect = document.getElementById("year");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");

  for (let y = 1940; y <= 2025; y++) {
    yearSelect.appendChild(new Option(y, y));
  }
  for (let m = 1; m <= 12; m++) {
    monthSelect.appendChild(new Option(m, m));
  }
  for (let d = 1; d <= 31; d++) {
    daySelect.appendChild(new Option(d, d));
  }
}

function setupPasswordValidation() {
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const message = document.getElementById("password-match-message");

  function handleInput() {
    const result = validatePasswordMatch(password.value, confirmPassword.value);
    message.textContent = result.message;
    message.style.color = result.valid ? "green" : "red";
  }

  password.addEventListener("input", handleInput);
  confirmPassword.addEventListener("input", handleInput);
}

function setupPhoneAutoHyphen() {
  const phone = document.getElementById("phone");
  phone.addEventListener("input", function () {
    let val = this.value.replace(/\D/g, "");
    if (val.length > 3 && val.length <= 7)
      val = val.replace(/(\d{3})(\d+)/, "$1-$2");
    else if (val.length > 7)
      val = val.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    this.value = val;
  });
}

function setupEmailDomainSync() {
  const emailId = document.getElementById("email-id");
  const provider = document.getElementById("email-provider");
  const email = document.getElementById("email");

  function updateEmail() {
    email.value = `${emailId.value}@${provider.value}`;
  }

  emailId.addEventListener("input", updateEmail);
  provider.addEventListener("change", updateEmail);
}

function setupEmailDuplicationCheck() {
  const emailField = document.getElementById("email");
  emailField.addEventListener("blur", async () => {
    const email = emailField.value;
    if (!email) return;
    const available = await checkEmailAvailability(email);
    if (!available) {
      alert("이미 사용 중인 이메일입니다.");
    }
  });
}

function setupCheckEmailButton() {
  const button = document.getElementById("check-email");
  const email = document.getElementById("email");

  if (!button || !email) return;

  button.addEventListener("click", async () => {
    const isAvailable = await checkEmailAvailability(email.value);
    alert(isAvailable ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.");
  });
}

function setupUserDuplicationCheck() {
  const name = document.getElementById("name");
  const phone = document.getElementById("phone");

  async function checkDuplicate() {
    if (!name.value || !phone.value) return;
    const isDuplicate = await checkUserDuplicate(name.value, phone.value);
    if (isDuplicate) {
      alert("이미 지원한 기록이 있습니다.");
    }
  }

  name.addEventListener("blur", checkDuplicate);
  phone.addEventListener("blur", checkDuplicate);
}

function setupFormSubmission() {
  const form = document.getElementById("application-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const validation = validateFormFields(formData);

    if (!validation.success) {
      alert(validation.message);
      highlightInvalidFields(validation.invalidFields);
      return;
    }

    const jsonData = Object.fromEntries(formData.entries());
    jsonData.birthdate = `${formData.get("year")}-${formData.get("month")}-${formData.get("day")}`;
    jsonData.gender = formData.get("gender");
    jsonData.subscription = formData.get("subscription");

    try {
      const result = await submitRegistration(jsonData);
      if (result.success) {
        alert("지원이 완료되었습니다!");
        form.reset();
      } else {
        alert("제출 실패: " + result.message);
      }
    } catch (err) {
      alert("서버 오류: " + err.message);
    }
  });
}

function highlightInvalidFields(fields) {
  fields.forEach((field) => {
    const input = document.querySelector(`[name="${field}"]`);
    if (input) input.classList.add("input-error");

    if (field === "gender" || field === "subscription") {
      document
        .querySelectorAll(`input[name="${field}"]`)
        .forEach((el) => el.classList.add("radio-error"));
    }
  });
}
