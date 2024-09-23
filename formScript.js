// 연도 및 일 옵션 추가 함수
window.onload = function() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
  
    // 연도 추가 (2023 ~ 1900)
    for (let i = 2023; i >= 1900; i--) {
      const option = document.createElement('option');
      option.value = i;
      option.text = `${i}년`;
      yearSelect.appendChild(option);
    }
  
    // 월 추가 (1월 ~ 12월)
    for (let i = 1; i <= 12; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = `${i}월`;
      monthSelect.appendChild(option);
    }
  
    // 일 추가 (1 ~ 31)
    for (let i = 1; i <= 31; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = `${i}일`;
      daySelect.appendChild(option);
    }
  
    // 휴대폰 번호 입력 시 자동 하이픈 추가
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
      let phone = phoneInput.value.replace(/\D/g, ''); // 숫자만 남김
      if (phone.length > 3 && phone.length <= 7) {
        phone = phone.replace(/(\d{3})(\d+)/, '$1-$2');
      } else if (phone.length > 7) {
        phone = phone.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
      }
      phoneInput.value = phone;
    });
  };
  