// js/pages.js
import { State } from './state.js';
import { formatCurrency, formatPercent, formatDate, calculatePortfoy } from './utils.js';

export const renderGiris = (container) => {
    const { portfoyList } = calculatePortfoy(State.data.ekstre, (menkul) => State.getFiyat(menkul));
    
    let totalOdenen = 0;
    let totalGuncel = 0;
    let totalKar = 0;

    const tbodyHtml = portfoyList.map((p, index) => {
        if (!p.isNakit) {
            totalOdenen += p.odenenTutar;
            totalGuncel += p.guncelTutar;
            totalKar += p.kar;
        } else {
            totalGuncel += p.guncelTutar; // Nakit güncele ekleniyor mu? Kullanıcı: "Tutar ve Karın altında toplamlar neyse o yazacak." 
            // Genelde nakit kar ettirmez ama toplam portföy değerine (tutar) girer.
        }

        return `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight:600; color: #fff;">${p.menkul}</td>
                <td>${p.isNakit ? '-' : formatCurrency(p.guncelFiyat)}</td>
                <td>${p.adet.toLocaleString('tr-TR')}</td>
                <td>${p.isNakit ? '-' : formatCurrency(p.guncelMaliyet)}</td>
                <td>${p.isNakit ? '-' : formatCurrency(p.netMaliyet)}</td>
                <td>${p.isNakit ? '-' : formatCurrency(p.odenenTutar)}</td>
                <td>${formatCurrency(p.guncelTutar)}</td>
                <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}">${p.isNakit ? '-' : formatCurrency(p.kar)}</td>
                <td class="${p.kar >= 0 ? 'text-success' : 'text-danger'}">${p.isNakit ? '-' : formatPercent(p.karYuzde)}</td>
                <td>${formatPercent(p.portfoyOrani)}</td>
                <td>${formatDate(p.ilkAlimTarihi)}</td>
                <td>${p.isNakit ? '-' : p.gecenSure}</td>
            </tr>
        `;
    }).join('');

    const html = `
        <div class="page-section active" id="page-giris">
            <div class="table-container glass">
                <div class="table-header">PORTFÖY</div>
                <table>
                    <thead>
                        <tr>
                            <th>S.N.</th>
                            <th>Menkul</th>
                            <th>Güncel Fiyat</th>
                            <th>Adet</th>
                            <th>Güncel Maliyet</th>
                            <th>Net Maliyet</th>
                            <th>Ödenen Tutar</th>
                            <th>Güncel Tutar</th>
                            <th>Kar</th>
                            <th>Kar %</th>
                            <th>Portföy Oranı</th>
                            <th>İlk Alım Tarihi</th>
                            <th>Geçen Süre</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyHtml}
                        <tr class="total-row">
                            <td colspan="2">TOPLAM</td>
                            <td colspan="4"></td>
                            <td>${formatCurrency(totalOdenen)}</td>
                            <td>${formatCurrency(totalGuncel)}</td>
                            <td class="${totalKar >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(totalKar)}</td>
                            <td colspan="4"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Placeholders for other tables -->
            <div class="flex-row">
                <div class="table-container glass" style="flex:1;">
                    <div class="table-header">PORTFÖY BİLGİLERİ</div>
                    <div style="padding: 2rem; text-align:center; color: var(--text-secondary);">Detaylar yapım aşamasında...</div>
                </div>
                <div class="table-container glass" style="flex:1;">
                    <div class="table-header">ARŞİV</div>
                    <div style="padding: 2rem; text-align:center; color: var(--text-secondary);">Arşivlenmiş (0'lanmış) hisseler.</div>
                </div>
            </div>
            
            <div class="table-container glass">
                <div class="table-header">HEDEF FİYATLAR</div>
                <div style="padding: 2rem; text-align:center; color: var(--text-secondary);">Hedef fiyat verileri...</div>
            </div>
        </div>
    `;
    container.innerHTML = html;
};

export const renderEkstre = (container, onReRender) => {
    // Veri listesi
    const ekstreRows = State.data.ekstre.map((e, index) => `
        <tr>
            <td>${index + 1}</td>
            <td style="font-weight:600; color: #fff;">${e.menkul}</td>
            <td>${e.menkul === 'NAKİT' ? '₺1,00' : formatCurrency(e.fiyat)}</td>
            <td>${e.adet}</td>
            <td>${formatCurrency(e.tutar)}</td>
            <td>${formatDate(e.tarih)}</td>
            <td class="${e.islemTip === 'ALIŞ' ? 'text-success' : (e.islemTip === 'SATIŞ' ? 'text-danger' : '')}">${e.islemTip}</td>
        </tr>
    `).join('');

    const html = `
        <div class="page-section active" id="page-ekstre">
            
            <div class="glass" style="padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--accent-color);">Yeni İşlem Ekle</h3>
                <form id="ekstre-form" class="flex-row">
                    <div class="form-group">
                        <label>Tarih</label>
                        <input type="date" id="islem-tarih" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>İşlem</label>
                        <select id="islem-tip" class="form-control" required>
                            <option value="ALIŞ">ALIŞ</option>
                            <option value="SATIŞ">SATIŞ</option>
                            <option value="YATIRMA">PARA YATIRMA</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Menkul</label>
                        <input type="text" id="islem-menkul" class="form-control" placeholder="Örn: THYAO" required>
                    </div>
                    <div class="form-group">
                        <label>Fiyat</label>
                        <input type="number" step="0.01" id="islem-fiyat" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Adet (Pozitif Giriniz)</label>
                        <input type="number" step="0.01" id="islem-adet" class="form-control" required>
                    </div>
                    <button type="submit" class="btn" style="margin-bottom: 1rem;">Ekle</button>
                </form>
            </div>

            <div class="table-container glass">
                <div class="table-header">EKSTRE</div>
                <table>
                    <thead>
                        <tr>
                            <th>S.N.</th>
                            <th>Menkul</th>
                            <th>Fiyat</th>
                            <th>Adet</th>
                            <th>Tutar</th>
                            <th>Tarih</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ekstreRows}
                    </tbody>
                </table>
            </div>

            <!-- NAKİT HAREKETLERİ ve ENFLASYON -->
            <div class="flex-row">
                <div class="table-container glass" style="flex:1;">
                    <div class="table-header">NAKİT HAREKETLERİ</div>
                    <div style="padding: 2rem; text-align:center; color: var(--text-secondary);">Tablo yapım aşamasında...</div>
                </div>
                <div class="table-container glass" style="flex:1;">
                    <div class="table-header">ENFLASYON</div>
                    <div style="padding: 2rem; text-align:center; color: var(--text-secondary);">2026 Ocak'tan itibaren...</div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;

    // Form Submit Event
    document.getElementById('ekstre-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const islem = {
            tarih: document.getElementById('islem-tarih').value,
            islemTip: document.getElementById('islem-tip').value,
            menkul: document.getElementById('islem-menkul').value.toUpperCase(),
            fiyat: document.getElementById('islem-fiyat').value,
            adet: document.getElementById('islem-adet').value
        };
        State.addEkstre(islem);
        onReRender(); // Refresh view
    });
};

export const renderGuncelFiyatlar = (container, onReRender) => {
    const rows = State.data.hisseFiyatlari.map((h, i) => `
        <tr>
            <td style="font-weight:600; color: #fff;">${h.menkul}</td>
            <td class="text-success" style="font-weight:bold;">${formatCurrency(h.guncelFiyat)}</td>
        </tr>
    `).join('');

    const html = `
        <div class="page-section active" id="page-guncel">
            <div class="glass" style="padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--accent-color);">API Verisi Simülasyonu</h3>
                <p style="color: var(--text-secondary); margin-bottom:1rem;">Canlı veriler çekiliyor... (Buradan manuel de güncelleyebilirsiniz)</p>
                <form id="fiyat-form" class="flex-row">
                    <div class="form-group">
                        <label>Menkul</label>
                        <input type="text" id="guncel-menkul" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Yeni Fiyat</label>
                        <input type="number" step="0.01" id="guncel-fiyat" class="form-control" required>
                    </div>
                    <button type="submit" class="btn" style="margin-bottom: 1rem;">Güncelle</button>
                </form>
            </div>

            <div class="table-container glass" style="max-width: 600px; margin: 0 auto;">
                <div class="table-header">GÜNCEL FİYATLAR</div>
                <table>
                    <thead>
                        <tr>
                            <th>Menkul</th>
                            <th>Güncel Fiyat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;

    document.getElementById('fiyat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const menkul = document.getElementById('guncel-menkul').value.toUpperCase();
        const fiyat = document.getElementById('guncel-fiyat').value;
        State.updateFiyat(menkul, fiyat);
        onReRender();
    });
};

export const renderHisse = (container) => {
    container.innerHTML = `
        <div class="page-section active" id="page-hisse">
            <h2 style="margin-bottom:1rem; color:var(--text-primary);">Hisse Bilgileri</h2>
            <div class="glass" style="padding: 3rem; text-align:center; color: var(--text-secondary);">
                Bu sayfada hisse özelinde detaylı grafikler ve analizler yer alacaktır.
            </div>
        </div>
    `;
};

export const renderGorunum = (container) => {
    container.innerHTML = `
        <div class="page-section active" id="page-gorunum">
            <h2 style="margin-bottom:1rem; color:var(--text-primary);">Görünüm Ayarları</h2>
            <div class="glass" style="padding: 3rem; text-align:center; color: var(--text-secondary);">
                Tema ayarları, renk şemaları ve kişiselleştirme seçenekleri.
            </div>
        </div>
    `;
};
