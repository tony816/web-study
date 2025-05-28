// formValidator.js

export function validateFormFields(formData) {
  const invalidFields = [];

  // 필수 입력 필드 확인
  ["name", "phone", "email", "password", "confirm-password"].forEach((field) => {
    const value = formData.get(field);
    if (!value || value.trim() === "") {
      invalidFields.push(field);
    }
  });

  // 라디오 그룹 검사
  if (!formData.get("gender")) invalidFields.push("gender");
  if (!formData.get("subscription")) invalidFields.push("subscription");

  return {
    success: invalidFields.length === 0,
    invalidFields,
    message: invalidFields.length
      ? "필수 항목을 모두 입력해주세요."
      : "유효성 검사를 통과했습니다.",
  };
}

export function validateRadioGroup(name) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  const isChecked = Array.from(radios).some((r) => r.checked);
  if (!isChecked) {
    radios.forEach((r) => r.classList.add("radio-error"));
  } else {
    radios.forEach((r) => r.classList.remove("radio-error"));
  }
  return isChecked;
}

export function validatePasswordMatch(password, confirmPassword) {
  if (password === "") {
    return { valid: false, message: "" };
  } else if (password === confirmPassword) {
    return { valid: true, message: "비밀번호가 일치합니다." };
  } else {
    return { valid: false, message: "비밀번호가 일치하지 않습니다." };
  }
}
