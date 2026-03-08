const fetch = require('node-fetch');
(async () => {
  const res = await fetch('http://localhost:5173/hf/models/black-forest-labs/FLUX.1-schnell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.VITE_HUGGING_FACE_API_KEY },
    body: JSON.stringify({ inputs: 'car' })
  });
  console.log(res.status);
  console.log(res.headers.get('content-type'));
})();
