const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace('id="logout-btn"', 'id="logout-btn-sidebar"');

const topbarRegex = /<!-- Topbar -->\s*<div class="top-bar glass"[^>]*>(\s*)<!-- Ticker Bar Wrapper -->/g;
content = content.replace(topbarRegex, `<!-- Topbar -->
        <div class="top-bar glass" style="display: flex; justify-content: space-between; padding: 0.5rem 1rem; align-items: center; border-radius: 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 1rem; position: relative; z-index: 9999; width: 100%;">
            
            <!-- Logo & User Settings -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="logo" style="cursor: pointer; margin:0; display: flex; align-items: center; gap: 0.5rem;" onclick="if(window.goToAnasayfa) window.goToAnasayfa()">
                    <div style="background: linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%), linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.15) 50%), var(--accent-color); color: #fff; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3); flex-shrink: 0; font-family: 'Inter', sans-serif;">Y</div>
                </div>
                
                <div class="nav-dropdown" style="position: relative; display: block;" onmouseover="this.querySelector('.dropdown-content').style.display='flex'" onmouseleave="this.querySelector('.dropdown-content').style.display='none'">
                    <button class="nav-btn" style="color: var(--text-secondary); font-weight: 600; font-size: 14px; padding: 0.3rem;"><i class="fas fa-bars" style="font-size: 20px;"></i></button>
                    <div class="dropdown-content glass" style="display: none; position: absolute; top: 100%; left: 0; min-width: 180px; z-index: 1000; flex-direction: column; padding: 0.5rem; border-radius: var(--border-radius); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <div style="padding: 0.5rem 1rem; color: var(--accent-color); font-weight: bold; border-bottom: 1px solid var(--surface-border); margin-bottom: 0.5rem; font-size: 13px;" id="user-name">Kullanıcı</div>
                        <button class="nav-btn" style="text-align: left; width: 100%; border-radius: 4px; display: flex; align-items: center; font-size: 14px; padding: 0.8rem 1rem;" onclick="if(window.goToAyarlar) window.goToAyarlar();"><span><i class="fas fa-cog" style="width: 20px;"></i> Ayarlar</span></button>
                        
                        <div class="theme-menu-wrapper" style="position: relative;" onmouseover="this.querySelector('.theme-submenu').style.display='flex'" onmouseleave="this.querySelector('.theme-submenu').style.display='none'">
                            <button class="nav-btn" style="text-align: left; width: 100%; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 0.8rem 1rem;"><span><i class="fas fa-palette" style="width: 20px;"></i> Tema</span> <i class="fas fa-chevron-right" style="font-size: 0.7em;"></i></button>
                            <div class="theme-submenu glass" style="display: none; position: absolute; left: 100%; top: -10px; min-width: 150px; flex-direction: column; padding: 0.5rem; border-radius: var(--border-radius); box-shadow: 4px 4px 15px rgba(0,0,0,0.5);">
                                <button class="nav-btn" style="text-align: left; width: 100%; border-radius: 4px; font-size: 14px; padding: 0.8rem 1rem;" onclick="window.setTheme('light')"><i class="fas fa-sun" style="width: 20px;"></i> Açık</button>
                                <button class="nav-btn" style="text-align: left; width: 100%; border-radius: 4px; font-size: 14px; padding: 0.8rem 1rem;" onclick="window.setTheme('dark')"><i class="fas fa-moon" style="width: 20px;"></i> Koyu</button>
                            </div>
                        </div>

                        <div style="height: 1px; background: var(--surface-border); margin: 0.5rem 0;"></div>
                        <button id="logout-btn" onclick="if(window.logout) window.logout(); else if(document.getElementById('logout-btn-sidebar')) document.getElementById('logout-btn-sidebar').click();" class="nav-btn" style="color: var(--danger-color); text-align: left; width: 100%; border-radius: 4px; font-size: 14px; padding: 0.8rem 1rem;"><i class="fas fa-sign-out-alt" style="width: 20px;"></i> Çıkış</button>
                    </div>
                </div>
            </div>

            <!-- Ticker Bar Wrapper -->`);

const bottomNavRegex = /<\/main>\s*<\/div>\s*<!-- Hisse Cikar Modal -->/g;
content = content.replace(bottomNavRegex, `</main>
        
        <!-- Bottom Navigation -->
        <nav class="bottom-nav glass">
            <button class="nav-btn bottom-nav-btn active" data-target="anasayfa">
                <i class="fas fa-list"></i>
                <span>Takip</span>
            </button>
            <button class="nav-btn bottom-nav-btn" data-target="portfoy" onclick="if(window.goToPortfoyTab) window.goToPortfoyTab('bilgiler'); else document.querySelector('.nav-btn[data-target=\\'portfoy_bilgiler\\']')?.click()">
                <i class="fas fa-briefcase"></i>
                <span>Portföy</span>
            </button>
            <button class="nav-btn bottom-nav-btn" data-target="hisse_islemleri">
                <i class="fas fa-chart-line"></i>
                <span>İşlemler</span>
            </button>
            <button class="nav-btn bottom-nav-btn" data-target="nakit_islemleri">
                <i class="fas fa-wallet"></i>
                <span>Nakit</span>
            </button>
            <button class="nav-btn bottom-nav-btn" data-target="veriler">
                <i class="fas fa-database"></i>
                <span>Veriler</span>
            </button>
        </nav>
    </div>

    <!-- Hisse Cikar Modal -->`);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Patch applied successfully.');
