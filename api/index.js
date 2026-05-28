const satori = require('satori');
const { Resvg } = require('@resvg/resvg-js');

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

    // 폰트를 URL에서 바로 가져오기 (Google Fonts 등)
    // Noto Serif KR의 woff 폰트 파일 링크를 사용합니다.
    const fontUrl = 'https://fonts.gstatic.com/s/notoserifkr/v20/nwpKt62-x1bF-h7I3B7A8A3bQ4f8PjI.woff';
    const fontData = await fetch(fontUrl).then(res => res.arrayBuffer());

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: { 
            display: 'flex', 
            width: '1024px', 
            height: '512px', 
            backgroundImage: 'url(https://project-episod.com/ink.png)',
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

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(pngBuffer);

  } catch (error) {
    console.error("이미지 생성 에러:", error);
    res.status(500).send('서버 에러 발생: ' + error.message);
  }
};
