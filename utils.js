export async function fetchWithToken(url, options = {}) {
  let token = localStorage.getItem("authToken");

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  options.credentials = "include"; // 쿠키 포함

  let response = await fetch(url, options);

  if (response.status === 403) {
    const refresh = await fetch("https://localhost:3001/token", {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem("authToken", data.accessToken);
      options.headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(url, options);
    } else {
      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      localStorage.removeItem("authToken");
      window.location.href = "/login.html";
    }
  }

  return response;
}
