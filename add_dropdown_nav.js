const fs = require('fs');

let content = fs.readFileSync('e:/Yunvest/yunvest/js/app_v53.js', 'utf8');

const targetFunctionStart = "window.setupCustomDropdown = (inputId, optionsList) => {";
const targetFunctionEnd = "    document.addEventListener('click', window['dropdown_listener_' + inputId]);\n};";

const functionStartIdx = content.indexOf(targetFunctionStart);
if (functionStartIdx === -1) {
    console.error("Function not found");
    process.exit(1);
}

// Find the end of the function
let functionEndIdx = content.indexOf(targetFunctionEnd, functionStartIdx);
if (functionEndIdx === -1) {
    console.error("Function end not found");
    process.exit(1);
}

functionEndIdx += targetFunctionEnd.length;

const originalFunction = content.substring(functionStartIdx, functionEndIdx);

const newFunction = `window.setupCustomDropdown = (inputId, optionsList) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Remove native list attribute
    input.removeAttribute('list');

    if (!input.parentNode.classList.contains('custom-dropdown-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-dropdown-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.zIndex = '9999'; // Ensure wrapper is on top
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const list = document.createElement('div');
        list.id = inputId + '-custom-list';
        list.className = 'custom-dropdown-list';
        list.style.display = 'none';
        list.style.position = 'absolute';
        list.style.top = '100%';
        list.style.left = '0';
        list.style.width = '100%';
        list.style.maxHeight = '250px';
        list.style.overflowY = 'auto';
        list.style.flexDirection = 'column';
        list.style.padding = '0.5rem 0';
        list.style.borderRadius = '12px';
        list.style.boxShadow = '0 4px 15px rgba(0,0,0,0.8)';
        list.style.marginTop = '5px';
        // Give list a massive z-index
        list.style.zIndex = '99999';
        list.style.background = '#1e1e24';
        list.style.border = '1px solid var(--surface-border)';
        wrapper.appendChild(list);
    }

    const list = document.getElementById(inputId + '-custom-list');
    const wrapper = input.parentNode;
    let activeIndex = -1;

    const handler = function () {
        let val = this.value.toUpperCase();
        list.innerHTML = '';
        activeIndex = -1;

        let matches = [];
        if (val) {
            // Only show matches
            matches = optionsList.filter(s => s && s.toUpperCase().startsWith(val));
        }

        // Find the table container and disable overflow while dropdown is open so it isn't clipped
        const tableContainer = input.closest('.table-container');
        if (tableContainer) {
            tableContainer.style.overflow = 'visible';
            tableContainer.style.overflowX = 'visible';
            tableContainer.style.overflowY = 'visible';
        }

        if (matches.length > 0) {
            matches.forEach((match, index) => {
                const item = document.createElement('div');
                item.className = 'custom-dropdown-item';
                item.style.padding = '10px 15px';
                item.style.cursor = 'pointer';
                item.style.color = '#fff';
                item.style.textAlign = 'left';
                item.style.background = 'transparent';

                if (val) {
                    item.innerHTML = \`<strong style="color: var(--accent-color);">\${match.substr(0, val.length)}</strong>\${match.substr(val.length)}\`;
                } else {
                    item.innerHTML = match;
                }

                item.addEventListener('click', (e) => {
                    if(e) e.stopPropagation();
                    input.value = match;
                    list.style.display = 'none';
                    if (tableContainer) {
                        tableContainer.style.overflow = '';
                        tableContainer.style.overflowX = 'auto';
                        tableContainer.style.overflowY = 'auto';
                    }
                });
                item.addEventListener('mouseover', () => {
                    activeIndex = index;
                    updateActiveStyle();
                });
                item.addEventListener('mouseout', () => {
                    item.style.background = 'transparent';
                });
                list.appendChild(item);
            });
            list.style.display = 'flex';
        } else {
            list.style.display = 'none';
            if (tableContainer) {
                tableContainer.style.overflow = '';
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.overflowY = 'auto';
            }
        }
    };

    const updateActiveStyle = () => {
        const items = list.querySelectorAll('.custom-dropdown-item');
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.style.background = 'rgba(255,255,255,0.1)';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = 'transparent';
            }
        });
    };

    input.addEventListener('input', handler);
    input.addEventListener('focus', handler);
    input.addEventListener('click', (e) => { e.stopPropagation(); handler.call(input); });
    
    // Add keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (list.style.display !== 'flex') return;
        
        const items = list.querySelectorAll('.custom-dropdown-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex++;
            if (activeIndex >= items.length) activeIndex = 0;
            updateActiveStyle();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex--;
            if (activeIndex < 0) activeIndex = items.length - 1;
            updateActiveStyle();
        } else if (e.key === 'Enter') {
            if (activeIndex > -1 && items[activeIndex]) {
                e.preventDefault();
                items[activeIndex].click();
            }
        }
    });

    if (window['dropdown_listener_' + inputId]) {
        document.removeEventListener('click', window['dropdown_listener_' + inputId]);
    }
    window['dropdown_listener_' + inputId] = (e) => {
        if (e.target !== input && !list.contains(e.target)) {
            list.style.display = 'none';
            const tableContainer = input.closest('.table-container');
            if (tableContainer) {
                tableContainer.style.overflow = '';
                tableContainer.style.overflowX = 'auto';
                tableContainer.style.overflowY = 'auto';
            }
        }
    };
    document.addEventListener('click', window['dropdown_listener_' + inputId]);
};`;

content = content.substring(0, functionStartIdx) + newFunction + content.substring(functionEndIdx);
fs.writeFileSync('e:/Yunvest/yunvest/js/app_v53.js', content);
console.log("Successfully replaced custom dropdown function");
