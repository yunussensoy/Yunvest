export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteklerine izin verilir.' });
  }

  const { hisse, filename, content } = req.body; 
  
  if (!hisse || !filename || !content) {
    return res.status(400).json({ error: 'Gerekli parametreler eksik (Hisse, Dosya Adı veya Dosya İçeriği).' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Sunucu hatası: GITHUB_TOKEN ortam değişkeni bulunamadı. Lütfen Vercel panelinden ekleyin.' });
  }

  const owner = 'yunussensoy';
  const repo = 'Yunvest';
  // GitHub dosya yolu (Boşlukları vs formatlanmış hali filename içinden geliyor)
  const filePath = `Hisseler/${hisse}/${filename}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  try {
    // 1. Önce dosya zaten var mı diye kontrol edelim (Üzerine yazmak için SHA gerekir)
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

    // Base64 içeriğin başındaki 'data:application/pdf;base64,' kısmını atalım
    const base64Content = content.includes(',') ? content.split(',')[1] : content;

    const body = {
      message: `API Upload: ${hisse} için yeni rapor eklendi (${filename})`,
      content: base64Content,
      branch: 'main'
    };

    if (sha) {
      body.sha = sha;
    }

    // 2. Dosyayı GitHub'a pushla
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

    return res.status(200).json({ success: true, message: 'Rapor başarıyla GitHub deponuza yüklendi! Vercel 1-2 dakika içinde güncelleyecektir.' });

  } catch (error) {
    console.error('API Sunucu Hatası:', error);
    return res.status(500).json({ error: 'Sunucuda beklenmeyen bir hata oluştu.' });
  }
}
