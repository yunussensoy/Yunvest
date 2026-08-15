const fs = require('fs');
let d = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

// 1. Update form labels
d = d.replace('<label style="font-size: 0.8rem; color: #cccccc;">Başlık</label>', '<label style="font-size: 0.8rem; color: #cccccc;">Başlık (Opsiyonel)</label>');
d = d.replace('<label style="font-size: 0.8rem; color: #cccccc;">Link (Opsiyonel)</label>', '<label style="font-size: 0.8rem; color: #cccccc;">Link</label>');

// 2. Update table logic for report (PDF)
const oldPdfRow = `                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 12px;"></i>
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">
                                    <a href="\${filePath}" target="_blank" style="color:#cccccc; text-decoration: none; font-weight: normal; word-break: break-word; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#cccccc';">
                                        \${r.name !== '-' && r.name ? r.name : r.file}
                                    </a>
                                </td>`;

const newPdfRow = `                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:center !important; padding:8px 5px; vertical-align:top !important; width:1%; white-space:nowrap;">
                                    <a href="\${filePath}" target="_blank" style="text-decoration: none;" title="PDF'i Görüntüle">
                                        <i class="fas fa-file-pdf" style="color: #3b82f6; font-size: 12px; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#3b82f6';"></i>
                                    </a>
                                </td>
                                <td style="font-size:12px; font-weight:normal; color:#cccccc; text-align:left !important; padding:8px 5px; vertical-align:top !important; width:200px; max-width:200px; white-space:normal !important; word-break:break-word;">
                                    \${r.name !== '-' && r.name ? r.name : r.file}
                                </td>`;

d = d.replace(oldPdfRow, newPdfRow);

// 3. Update table logic for links (Kisisel / Analiz)
const oldLinkRow = `                                  platformIcon = \`<i class="\${iconStr}"></i>\`;
                                  titleLinkHtml = \`<a href="\${a.baglanti}" target="_blank" style="color:#cccccc; text-decoration: none; word-break: break-word; transition: color 0.2s;" onmouseover="this.style.color='#ffffff';" onmouseout="this.style.color='#cccccc';">\${titleText}</a>\`;`;

const newLinkRow = `                                  platformIcon = \`<a href="\${a.baglanti}" target="_blank" style="text-decoration: none;" title="Bağlantıya Git"><i class="\${iconStr}"></i></a>\`;
                                  titleLinkHtml = titleText;`;

d = d.replace(oldLinkRow, newLinkRow);

fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', d);
console.log('Update script finished');
