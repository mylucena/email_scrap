require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// scrap de dados no G1
async function fetchData() {
  try {
    // Faz requisição para a página principal do G1
    const { data } = await axios.get('https://g1.globo.com/');
    const $ = cheerio.load(data);

    // Coleta os principais assuntos 
    let headlines = [];
    $('a.feed-post-link').each((index, element) => {
      const headline = $(element).text().trim();
      headlines.push(headline);
    });

    // Formata as manchetes para envio no e-mail
    return `Principais Assuntos do G1:\n\n${headlines.join('\n')}`;
  } catch (error) {
    console.error('Erro no scrap:', error);
    return null;
  }
}

//enviar e-mail com os dados coletados
async function sendEmail(content) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: 'Principais Assuntos do G1',
    text: content,
  };
 
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar email:', error);
  }
}

// processo de scrap e envio de e-mail
async function main() {
  const content = await fetchData();
  if (content) await sendEmail(content);
}

main();
