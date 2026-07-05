// js/state.js

const DEFAULT_STATE = {
    ekstre: [],
    hisseFiyatlari: [
        { menkul: 'THYAO', guncelFiyat: 310.50 },
        { menkul: 'TUPRS', guncelFiyat: 185.20 },
        { menkul: 'EREGL', guncelFiyat: 51.30 },
        { menkul: 'BIST', guncelFiyat: 10500 },
        { menkul: 'Dolar', guncelFiyat: 32.50 },
        { menkul: 'Gram Altın', guncelFiyat: 2450 }
    ],
    nakitHareketleri: [],
    enflasyon: [],
    takipListesi: []
};

export const State = {
    data: null,

    init() {
        const stored = localStorage.getItem('borsa_state');
        if (stored) {
            this.data = JSON.parse(stored);
            if (!this.data.takipListesi) this.data.takipListesi = [];
        } else {
            this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.save();
        }
    },

    save() {
        localStorage.setItem('borsa_state', JSON.stringify(this.data));
    },


    // TAKİP LİSTESİ işlemleri
    addTakip(menkul) {
        if (!this.data.takipListesi.includes(menkul)) {
            this.data.takipListesi.push(menkul);
            this.save();
        }
    },
    removeTakip(menkul) {
        this.data.takipListesi = this.data.takipListesi.filter(m => m !== menkul);
        this.save();
    },
    // EKSTRE işlemleri
    addEkstre(islem) {
        // islem: { tarih, islemTip(ALIŞ/SATIŞ), menkul, adet, fiyat }
        let islemAdet = parseFloat(islem.adet);
        if (islem.islemTip === 'SATIŞ' && islem.menkul !== 'NAKİT') {
            islemAdet = -Math.abs(islemAdet); // Satış ise adeti eksi yap (Nakit hariç)
        }
        
        const tutar = Math.abs(islemAdet) * parseFloat(islem.fiyat);
        
        const yeniIslem = {
            id: Date.now().toString(),
            tarih: islem.tarih,
            islemTip: islem.islemTip,
            menkul: islem.menkul,
            adet: islemAdet,
            fiyat: parseFloat(islem.fiyat),
            tutar: tutar
        };

        this.data.ekstre.push(yeniIslem);
        
        // Nakit işlemi otomatik ekle (Hisse alış/satış ise nakit etkilenir)
        if (islem.menkul !== 'NAKİT') {
            const nakitIslemTip = islem.islemTip === 'ALIŞ' ? 'SATIŞ' : 'ALIŞ'; // Alışta nakit azalır (satış gibi eksi), Satışta nakit artar (alış gibi artı)
            const nakitAdet = islem.islemTip === 'ALIŞ' ? -tutar : tutar;
            
            this.data.ekstre.push({
                id: Date.now().toString() + '_nakit',
                tarih: islem.tarih,
                islemTip: nakitIslemTip,
                menkul: 'NAKİT',
                adet: nakitAdet,
                fiyat: 1,
                tutar: Math.abs(nakitAdet)
            });
        }
        
        this.save();
    },

    // HİSSE FİYAT GÜNCELLEME
    updateFiyat(menkul, yeniFiyat) {
        const h = this.data.hisseFiyatlari.find(x => x.menkul === menkul);
        if (h) {
            h.guncelFiyat = parseFloat(yeniFiyat);
        } else {
            this.data.hisseFiyatlari.push({ menkul, guncelFiyat: parseFloat(yeniFiyat) });
        }
        this.save();
    },

    getFiyat(menkul) {
        if (menkul === 'NAKİT') return 1;
        const h = this.data.hisseFiyatlari.find(x => x.menkul === menkul);
        return h ? h.guncelFiyat : 0;
    }

    updateEkstre(id, islem) {
        const idx = this.data.ekstre.findIndex(e => e.id === id);
        if (idx !== -1) {
            let islemAdet = parseFloat(islem.adet);
            if (islem.islemTip === 'SATIŞ' && islem.menkul !== 'NAKİT') {
                islemAdet = -Math.abs(islemAdet);
            }
            const tutar = Math.abs(islemAdet) * parseFloat(islem.fiyat);
            this.data.ekstre[idx] = {
                ...this.data.ekstre[idx],
                tarih: islem.tarih,
                islemTip: islem.islemTip,
                menkul: islem.menkul,
                adet: islemAdet,
                fiyat: parseFloat(islem.fiyat),
                tutar: tutar
            };
            this.save();
        }
    },

    deleteEkstre(id) {
        this.data.ekstre = this.data.ekstre.filter(e => e.id !== id);
        this.save();
    },

    addNakitHareket(islem) {
        if (!this.data.nakitHareketleri) this.data.nakitHareketleri = [];
        this.data.nakitHareketleri.push({
            id: Date.now().toString(),
            tarih: islem.tarih,
            tutar: parseFloat(islem.tutar),
            bist100: islem.bist100 ? parseFloat(islem.bist100) : null,
            dolar: islem.dolar ? parseFloat(islem.dolar) : null,
            gramAltin: islem.gramAltin ? parseFloat(islem.gramAltin) : null
        });
        this.save();
    },

    updateNakitHareket(id, islem) {
        if (!this.data.nakitHareketleri) return;
        const idx = this.data.nakitHareketleri.findIndex(n => n.id === id);
        if (idx !== -1) {
            this.data.nakitHareketleri[idx] = {
                ...this.data.nakitHareketleri[idx],
                tarih: islem.tarih,
                tutar: parseFloat(islem.tutar),
                bist100: islem.bist100 ? parseFloat(islem.bist100) : null,
                dolar: islem.dolar ? parseFloat(islem.dolar) : null,
                gramAltin: islem.gramAltin ? parseFloat(islem.gramAltin) : null
            };
            this.save();
        }
    },

    deleteNakitHareket(id) {
        if (!this.data.nakitHareketleri) return;
        this.data.nakitHareketleri = this.data.nakitHareketleri.filter(n => n.id !== id);
        this.save();
    },

};
