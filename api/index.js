const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');

module.exports = async function handler(req, res) {
  // 1. URL 파라미터 가져오기
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  const getParam = (key, defaultValue) => {
    const val = url.searchParams.get(key) || defaultValue;
    return val.replace(/_/g, ' ');
  };

  const room = getParam('room', '열람실 알 수 없음'); 
  const turn = getParam('turn', '0');     
  const cgt = getParam('cgt', '0');     
  const attitude = getParam('att', '평온');     
  const progress = getParam('prog', '0');     

  // 2. SVG 생성 (Satori 사용 - 폰트는 기본 폰트 사용 또는 별도 로드 필요)
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: { display: 'flex', width: '1024px', height: '512px', backgroundImage: 'url(https://project-episod.com/ink.png)' },
        children: [
          // 여기에 글자 위치를 div와 absolute 스타일로 지정해야 해요..! (기존 SVG 문법과 약간 다름)
          // 시간상 간략화된 예시입니다.
          { type: 'div', props: { style: { position: 'absolute', top: '106px', left: '285px', fontSize: '30px', color: '#e8d9a8' }, children: room } },
          { type: 'div', props: { style: { position: 'absolute', top: '220px', left: '280px', fontSize: '26px', color: '#e8d9a8' }, children: turn } },
        ]
      }
    },
    {
      width: 1024,
      height: 512,
      fonts: [] // 주의: Satori는 폰트 파일(.ttf)이 필수적으로 필요해요!
    }
  );

  // 3. SVG를 PNG로 변환
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // 4. PNG 이미지로 응답
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(pngBuffer);
};
