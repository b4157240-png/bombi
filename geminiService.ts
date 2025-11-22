// Клиентские заглушки: теперь все вызовы ИИ идут через безопасные serverless-функции.
// Это предотвращает утечку API-ключа в браузере.

export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  const res = await fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Server error: ${res.status} ${txt}`);
  }

  return res.json();
};

export const refineFoodAnalysis = async (
  base64Image: string,
  currentItems: any[],
  userPrompt: string
): Promise<{ items: any[], message: string }> => {
  const res = await fetch('/.netlify/functions/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, currentItems, userPrompt })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Server error: ${res.status} ${txt}`);
  }

  return res.json();
};