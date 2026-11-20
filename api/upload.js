import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const FIREBASE_WEB_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyBfGArrNWxZT02JkeWqNZ0PqqZaGTyIJjU';
const ALLOWED_EMAILS = (process.env.ALLOWED_UPLOAD_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const ALLOWED_UIDS = (process.env.ALLOWED_UPLOAD_UIDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function verifyFirebaseIdToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice(7).trim();
  if (!idToken || idToken.length > 4096) return null;

  const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(FIREBASE_WEB_API_KEY)}`;
  const res = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const user = data && Array.isArray(data.users) ? data.users[0] : null;
  if (!user || !user.localId) return null;

  if (ALLOWED_UIDS.length > 0 && !ALLOWED_UIDS.includes(user.localId)) {
    return null;
  }
  if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes((user.email || '').toLowerCase())) {
    return null;
  }
  return user;
}

const ALLOWED_ORIGINS = new Set([
  'https://yunvest.web.app',
  'https://yunvest.firebaseapp.com',
  'https://yunvest.vercel.app',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
]);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteklerine izin verilir.' });
  }

  // 1. Firebase oturum doğrulaması
  try {
    const verifiedUser = await verifyFirebaseIdToken(req.headers.authorization);
    if (!verifiedUser) {
      return res.status(401).json({ error: 'Yetkisiz istek. Lütfen tekrar giriş yapın.' });
    }
  } catch (authErr) {
    console.error('Auth doğrulama hatası:', authErr);
    return res.status(401).json({ error: 'Oturum doğrulanamadı.' });
  }

  // 2. İstek parametreleri (geri uyumlu alan adları)
  const rawHisse = req.body?.hisse;
  const rawFilename = req.body?.filename || req.body?.fileName;
  const rawContent = req.body?.content || req.body?.fileContent;

  if (!rawHisse || !rawFilename || !rawContent) {
    return res.status(400).json({ error: 'Gerekli parametreler eksik (Hisse, Dosya Adı veya Dosya İçeriği).' });
  }

  // 3. Path traversal & dosya türü koruması
  const hisse = String(rawHisse).trim().toUpperCase();
  if (!/^[A-Z0-9]{2,12}$/.test(hisse)) {
    return res.status(400).json({ error: 'Geçersiz hisse kodu.' });
  }

  const baseName = path.posix.basename(String(rawFilename).replace(/\\/g, '/')).trim();
  const safeFilename = baseName
    .replace(/[^a-zA-Z0-9._\-\s()]/g, '_')
    .replace(/\.{2,}/g, '.');

  if (!safeFilename || safeFilename.length > 140 || !/\.pdf$/i.test(safeFilename)) {
    return res.status(400).json({ error: 'Geçersiz dosya adı. Sadece PDF dosyaları yüklenebilir.' });
  }

  const base64Content = String(rawContent).includes(',')
    ? String(rawContent).split(',')[1].trim()
    : String(rawContent).trim();

  // Base64 PDF magic header (%PDF- => JVBERi0)
  if (!base64Content || !base64Content.startsWith('JVBERi0')) {
    return res.status(400).json({ error: 'Geçersiz dosya içeriği. Lütfen geçerli bir PDF dosyası seçin.' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Sunucu hatası: GITHUB_TOKEN ortam değişkeni bulunamadı. Lütfen Vercel panelinden ekleyin.' });
  }

  const owner = 'yunussensoy';
  const repo = 'Yunvest';
  const filePath = `Hisseler/${hisse}/${safeFilename}`;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(filePath)}`;

  try {
    let sha = undefined;
    const getRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Yunvest-App'
      }
    });

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    const body = {
      message: `API Upload: ${hisse} için yeni rapor eklendi (${safeFilename})`,
      content: base64Content,
      branch: 'main'
    };

    if (sha) {
      body.sha = sha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Yunvest-App'
      },
      body: JSON.stringify(body)
    });

    const putData = await putRes.json();

    if (!putRes.ok) {
      console.error('GitHub API Hatası:', putData);
      return res.status(putRes.status).json({ error: `GitHub API Hatası: ${putData.message}` });
    }

    return res.status(200).json({
      success: true,
      filename: safeFilename,
      message: 'Rapor başarıyla GitHub deponuza yüklendi! Vercel 1-2 dakika içinde güncelleyecektir.'
    });
  } catch (error) {
    console.error('API Sunucu Hatası:', error);
    return res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
  }
}
