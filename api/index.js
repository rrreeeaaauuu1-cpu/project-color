module.exports = async function handler(req, res) {
  // 파비콘 무시
  if (req.url.includes('favicon.ico')) {
    res.status(204).end();
    return;
  }

  try {
    // 폰트, 이미지 다 빼고 간단한 텍스트 응답 테스트
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send('서버가 정상적으로 작동하고 있습니다! 파라미터 확인: ' + req.url);

  } catch (error) {
    console.error("테스트 에러:", error);
    res.status(500).send('에러 발생: ' + error.message);
  }
};
