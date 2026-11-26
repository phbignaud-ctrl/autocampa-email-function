const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.post('/enviarEmail', async (req, res) => {
  const {pdfBase64, nombreArchivo, tipodoc, referencia, fecha, campa} = req.body;
  if (!pdfBase64 || !nombreArchivo) return res.status(400).json({error: 'Faltan parámetros'});
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS}
    });
    await transporter.sendMail({
      from: '"AutoCampa" <' + process.env.GMAIL_USER + '>',
      to: 'philippe.bignaud@motorpacificopremium.es',
      subject: 'Pacífico Ocasión — ' + tipodoc + ' ' + referencia,
      html: '<p>Nuevo documento en AutoCampa:</p><ul><li><b>Tipo:</b> ' + tipodoc + '</li><li><b>Referencia:</b> ' + referencia + '</li><li><b>Fecha:</b> ' + fecha + '</li><li><b>Campa:</b> ' + (campa||'—') + '</li></ul>',
      attachments: [{filename: nombreArchivo, content: (pdfBase64.split('base64,')[1]||pdfBase64), encoding: 'base64'}]
    });
    res.json({ok: true});
  } catch(err) {
    console.error(err);
    res.status(500).json({error: err.message});
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));