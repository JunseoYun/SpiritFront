export const functionError = error => {
  if (error.response) {
    const {status, data, headers} = error.response;

    if (status === 500) {
      console.error(error.response);
      alert('서버에 문제가 발생했습니다. \n잠시 후 다시 시도해주세요.');
    } else if (status === 401) {
    } else if (status === 404) {
    } else {
    }
  } else if (error.request) {
  } else {
  }

  throw error; // 에러를 다시 던져서 호출한 쪽에서 추가 처리를 할 수 있게 함
};
