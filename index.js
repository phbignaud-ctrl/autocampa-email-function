const express = require('express');
const app = express();

app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/enviarEmail', async (req, res) => {
  const { pdfBase64, nombreArchivo, tipodoc, referencia, fecha, campa } = req.body;

  if (!pdfBase64 || !nombreArchivo) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const pdfContent = pdfBase64.split('base64,')[1] || pdfBase64;

    const payload = {
      from: 'AutoCampa <onboarding@resend.dev>',
      to: ['phbignaud@gmail.com'],
      subject: `Pacífico Ocasión — ${tipodoc} ${referencia}`,
      html: `
        <p>Nuevo documento generado en AutoCampa:</p>
        <ul>
          <li><strong>Tipo:</strong> ${tipodoc}</li>
          <li><strong>Referencia:</strong> ${referencia}</li>
          <li><strong>Fecha:</strong> ${fecha}</li>
          <li><strong>Campa:</strong> ${campa || '—'}</li>
        </ul>
      `,
      attachments: [
        {
          filename: nombreArchivo,
          content: pdfContent,
        },
      ],
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: data.message || 'Error Resend' });
    }

    console.log('Email enviado OK:', data.id);
    res.json({ ok: true, id: data.id });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
