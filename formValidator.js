// formValidator.js
export function validateFormFields() {
  let isValid = true;
  const requiredFields = document.querySelectorAll(
    'input[type="text"], input[type="password"]'
  );

  requiredFields.forEach((field) => {
    if (field.value.trim() === "") {
      isValid = false;
      field.style.border = "1px solid red";
    } else {
      field.style.border = "1px solid #ccc";
    }
  });

  return isValid;
}

export function validateRadioGroup(name) {
  const radios = document.querySelectorAll(`input[name="${name}"]`);
  const isChecked = Array.from(radios).some((r) => r.checked);
  if (!isChecked) {
    radios.forEach((r) => r.classList.add("radio-error"));
  }
  return isChecked;
}

export function validatePasswordMatch(password, confirmPassword) {
  const message = document.getElementById("password-message");
  if (password === "") {
    message.textContent = "";
    return false;
  } else if (password === confirmPassword) {
    message.textContent = "비밀번호가 일치합니다.";
    message.style.color = "green";
    return true;
  } else {
    message.textContent = "비밀번호가 일치하지 않습니다.";
    message.style.color = "red";
    return false;
  }
}
