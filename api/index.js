const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.url.includes('favicon.ico')) {
    res.status(204).end();
    return;
  }

  try {
    const url = new URL(req.url, \`http://\${req.headers.host}\`);
    
    const getParam = (key, defaultValue) => {
      const val = url.searchParams.get(key) || defaultValue;
      return val.replace(/_/g, ' ');
    };

    const room = getParam('room', '열람실 알 수 없음'); 
    const turn = getParam('turn', '0');     
    const cgt = getParam('cgt', '0');     
    const attitude = getParam('att', '평온');     
    const progress = getParam('prog', '0');     

    // 1. 폰트 파일 안전하게 읽기 (경로 문제 해결)
    const fontPath = path.resolve(__dirname, '../fonts/NotoSerifKR-Regular.ttf');
    const fontData = fs.readFileSync(fontPath);

    // 2. 외부 배경 이미지(ink.png)를 버퍼로 가져와서 base64로 변환
    const imageUrl = 'https://project-episod.com/ink.png'; 
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error('배경 이미지를 가져오는 데 실패했습니다.');
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
    const backgroundImage = \`url(data:image/png;base64,\${imageBase64})\`;

    // 3. Satori를 이용해 SVG 생성
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { 
            display: 'flex', 
            width: '1024px', 
            height: '512px', 
            backgroundImage: backgroundImage, // 변환된 base64 이미지 사용
            backgroundSize: '1024px 512px'
          },
          children: [
            { type: 'div', props: { style: { position: 'absolute', top: '106px', left: '285px', fontSize: '30px', color: '#e8d9a8' }, children: room } },
            { type: 'div', props: { style: { position: 'absolute', top: '220px', left: '280px', fontSize: '26px', color: '#e8d9a8' }, children: turn } },
            { type: 'div', props: { style: { position: 'absolute', top: '282px', left: '324px', fontSize: '22px', color: '#e8d9a8' }, children: \`\${cgt}%\` } },
            { type: 'div', props: { style: { position: 'absolute', top: '338px', left: '405px', fontSize: '22px', color: '#e8d9a8' }, children: attitude } },
            { type: 'div', props: { style: { position: 'absolute', top: '406px', left: '300px', fontSize: '22px', color: '#e8d9a8' }, children: \`열람한 책 [ \${progress} ] 권\` } },
          ]
        }
      },
      {
        width: 1024,
        height: 512,
        fonts: [
          {
            name: 'Noto Serif KR',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );

    // 4. SVG를 PNG로 변환
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // 5. 결과 전송
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(pngBuffer);

  } catch (error) {
    console.error("이미지 생성 에러 상세:", error);
    res.status(500).send('서버 에러 발생: ' + error.message);
  }
};
