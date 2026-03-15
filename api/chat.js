export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').end();
    }

    if (req.method !== 'POST') {
      return res.status(405).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Method not allowed' });
    }

    if (!req.body || !req.body.prompt) {
      return res.status(400).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Invalid request body' });
    }

    const { prompt, type } = req.body;
    const systemPrompt = `Generate a ${type === 'story' ? 'short story' : 'poem'} based on the following prompt: ${prompt}. Make it unique and engaging.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Groq API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).setHeader('Access-Control-Allow-Origin', '*').setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS').json({ error: 'Internal server error' });
  }
}