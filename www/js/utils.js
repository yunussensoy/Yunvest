// js/utils.js

export const formatCurrency = (val) => {
    return '₺' + new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

export const formatPercent = (val) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val * 100) + '%';
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR');
};

export const calcDaysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = date2 ? new Date(date2) : new Date();
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};

// Portföy Hesaplamaları
export const calculatePortfoy = (ekstre, getFiyat) => {
    const historyByMenkul = {};

    // İşlemleri tarihe göre sıralayalım (garanti olsun)
    const sortedEkstre = [...ekstre].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

    sortedEkstre.forEach(islem => {
        if (!historyByMenkul[islem.menkul]) {
            historyByMenkul[islem.menkul] = {
                kalanAdet: 0,
                alisToplamTutar: 0,
                alisToplamAdet: 0,
                satisToplamTutar: 0,
                ilkAlimTarihi: islem.tarih
            };
        }

        const h = historyByMenkul[islem.menkul];
        
        // Eğer daha önce sıfırlandıysa ve yeni alış gelirse sıfırla (Nakit hariç)
        if (h.kalanAdet === 0 && islem.menkul !== 'NAKİT') {
            h.alisToplamTutar = 0;
            h.alisToplamAdet = 0;
            h.satisToplamTutar = 0;
            h.ilkAlimTarihi = islem.tarih;
        }

        h.kalanAdet += islem.adet;

        if (islem.adet > 0) {
            // Alış
            h.alisToplamTutar += (islem.adet * islem.fiyat);
            h.alisToplamAdet += islem.adet;
        } else if (islem.adet < 0) {
            // Satış
            h.satisToplamTutar += (Math.abs(islem.adet) * islem.fiyat);
        }
    });

    const portfoyList = [];
    const arsicList = [];
    
    let toplamGuncelTutar = 0;
    
    // Sadece Nakit için özel hesaplama (Nakit her zaman dahil)
    if (!historyByMenkul['NAKİT']) {
        historyByMenkul['NAKİT'] = { kalanAdet: 0, alisToplamTutar: 0, alisToplamAdet: 0, satisToplamTutar: 0, ilkAlimTarihi: new Date().toISOString() };
    }

    Object.keys(historyByMenkul).forEach(menkul => {
        const h = historyByMenkul[menkul];
        const isNakit = menkul === 'NAKİT';
        
        if (h.kalanAdet <= 0 && !isNakit) {
            // Arşive gidecek (0'dan küçük olamaz hissede ama garanti olsun)
            if (h.alisToplamAdet > 0) {
                 arsicList.push({ menkul, ...h });
            }
            return;
        }

        const guncelFiyat = getFiyat(menkul);
        const guncelTutar = h.kalanAdet * guncelFiyat;
        
        if (!isNakit) {
            toplamGuncelTutar += guncelTutar;
        } else {
             toplamGuncelTutar += h.kalanAdet; // Nakit direkt eklenir
        }

        let guncelMaliyet = 0;
        let netMaliyet = 0;
        
        if (h.alisToplamAdet > 0) {
            guncelMaliyet = h.alisToplamTutar / h.alisToplamAdet;
        }
        
        if (h.kalanAdet > 0 && !isNakit) {
            netMaliyet = (h.alisToplamTutar - h.satisToplamTutar) / h.kalanAdet;
        } else if (isNakit) {
            guncelMaliyet = 1;
            netMaliyet = 1;
        }

        const odenenTutar = h.kalanAdet * guncelMaliyet;
        const kar = isNakit ? 0 : guncelTutar - odenenTutar;
        const karYuzde = isNakit ? 0 : (odenenTutar !== 0 ? kar / odenenTutar : 0);
        const gecenSure = calcDaysBetween(h.ilkAlimTarihi);

        portfoyList.push({
            menkul,
            guncelFiyat,
            adet: h.kalanAdet,
            guncelMaliyet,
            netMaliyet,
            odenenTutar,
            guncelTutar: isNakit ? h.kalanAdet : guncelTutar,
            kar,
            karYuzde,
            ilkAlimTarihi: h.ilkAlimTarihi,
            gecenSure,
            isNakit
        });
    });

    // Oranları hesapla ve sırala
    portfoyList.forEach(p => {
        p.portfoyOrani = toplamGuncelTutar > 0 ? p.guncelTutar / toplamGuncelTutar : 0;
    });

    // Sıralama: Güncel Tutara göre büyükten küçüğe, Nakit en altta
    portfoyList.sort((a, b) => {
        if (a.isNakit) return 1;
        if (b.isNakit) return -1;
        return b.guncelTutar - a.guncelTutar;
    });

    return { portfoyList, arsivList: arsicList, toplamGuncelTutar };
};
