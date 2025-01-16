export const functionError = (error) => {

  if (error.response) {
    const { status, data, headers } = error.response;

    if (status === 500) {
      alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } else if(status === 404) {
    } else {
      alert(`요청 중 문제가 발생했습니다. 상태 코드: ${status}`);
    }

  } else if (error.request) {
    alert("서버에서 응답이 없습니다. 네트워크 상태를 확인해주세요.");
  } else {
    alert("요청 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
  }

  throw error; // 에러를 다시 던져서 호출한 쪽에서 추가 처리를 할 수 있게 함
};

