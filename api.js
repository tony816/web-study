// api.js

const BASE_URL = "https://localhost:3001"; // 필요 시 공통 prefix 분리

export async function checkEmailAvailability(email) {
  const res = await fetch(
    `${BASE_URL}/check-email?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) throw new Error("이메일 확인 실패");
  const data = await res.json();
  return data.available;
}

export async function checkUserDuplicate(name, phone) {
  const res = await fetch(
    `${BASE_URL}/check-user?name=${encodeURIComponent(
      name
    )}&phone=${encodeURIComponent(phone)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) throw new Error("사용자 확인 실패");
  const data = await res.json();
  return data.available;
}

export async function submitRegistration(formData) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 쿠키 포함
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  const data = await res.json();
  return data;
}
