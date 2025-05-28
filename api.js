// api.js

const BASE_URL = "http://localhost:3001"; // TODO: 배포 시 환경변수 처리 가능

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(BASE_URL + endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? data.message || "서버 오류 발생" : data;
    throw new Error(message);
  }

  return data;
}

export async function checkEmailAvailability(email) {
  if (!email || email.trim() === "") {
    console.warn("checkEmailAvailability: 빈 이메일");
    return false;
  }

  const result = await fetchJson("/check-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  return result.available;
}

export async function checkUserDuplicate(name, phone) {
  if (!name || !phone) {
    console.warn("checkUserDuplicate: 이름 또는 전화번호 누락");
    return false;
  }

  const result = await fetchJson("/check-user", {
    method: "POST",
    body: JSON.stringify({ name, phone }),
  });

  return result.duplicate;
}

export async function submitRegistration(formData) {
  if (!formData || typeof formData !== "object") {
    throw new Error("유효하지 않은 등록 데이터입니다.");
  }

  const result = await fetchJson("/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });

  return result;
}
