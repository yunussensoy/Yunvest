// Custom Autocomplete implementation to replace native datalist
document.addEventListener('DOMContentLoaded', () => {
    // Inject custom CSS for autocomplete
    const style = document.createElement('style');
    style.textContent = `
        .custom-autocomplete-dropdown {
            display: none;
            position: absolute;
            z-index: 10000;
            background: var(--surface-color, #1e1e2d);
            border: 1px solid var(--surface-border, rgba(255,255,255,0.1));
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            max-height: 200px;
            overflow-y: auto;
            flex-direction: column;
            padding: 0.5rem 0;
            margin-top: 5px;
        }
        .custom-autocomplete-item {
            padding: 0.5rem 1rem;
            color: var(--text-primary, #fff);
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .custom-autocomplete-item:hover, .custom-autocomplete-item.active {
            background: var(--accent-color, #3498db);
        }
        .custom-autocomplete-dropdown::-webkit-scrollbar {
            width: 6px;
        }
        .custom-autocomplete-dropdown::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);

    // Create a singleton dropdown element
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-autocomplete-dropdown glass';
    document.body.appendChild(dropdown);

    let currentInput = null;
    let activeIndex = -1;
    let filteredItems = [];

    function closeDropdown() {
        dropdown.style.display = 'none';
        currentInput = null;
        activeIndex = -1;
    }

    function renderDropdown(items, val) {
        dropdown.innerHTML = '';
        filteredItems = items;
        if (items.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'custom-autocomplete-item';
            div.textContent = item;
            if (index === activeIndex) div.classList.add('active');
            
            div.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent input blur
                if (currentInput) {
                    currentInput.value = item;
                    // Trigger input and change events so the app catches it
                    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
                    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
                    closeDropdown();
                }
            });
            dropdown.appendChild(div);
        });

        // Position dropdown
        if (currentInput) {
            const rect = currentInput.getBoundingClientRect();
            dropdown.style.left = rect.left + 'px';
            dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
            dropdown.style.width = rect.width + 'px';
            dropdown.style.display = 'flex';
        }
    }

    function onInputFocus(e) {
        const target = e.target;
        if (target.tagName === 'INPUT' && (target.getAttribute('list') === 'bist-hisse-list' || target.getAttribute('data-custom-list') === 'bist-hisse-list')) {
            // Remove native datalist
            if (target.hasAttribute('list')) {
                target.setAttribute('data-custom-list', target.getAttribute('list'));
                target.removeAttribute('list');
                // Disable browser's own autocomplete memory
                target.setAttribute('autocomplete', 'off');
            }

            currentInput = target;
            activeIndex = -1;
            
            // Read options from the datalist OR window.hisseListesi
            let allItems = [];
            if (window.hisseListesi) {
                allItems = window.hisseListesi;
            } else {
                const dl = document.getElementById('bist-hisse-list');
                if (dl) {
                    allItems = Array.from(dl.options).map(opt => opt.value);
                }
            }

            const updateList = () => {
                if (target.getAttribute('data-custom-list') !== 'bist-hisse-list' && target.getAttribute('list') !== 'bist-hisse-list') {
                    closeDropdown();
                    return;
                }
                const val = target.value.trim().toUpperCase();
                if (!val) {
                    renderDropdown([], val);
                    return;
                }
                const filtered = allItems.filter(item => item.toUpperCase().startsWith(val)).slice(0, 50); // limit to 50
                renderDropdown(filtered, val);
            };

            // Remove previous listeners to avoid duplicates
            if (target._autocompleteHandler) {
                target.removeEventListener('input', target._autocompleteHandler);
                target.removeEventListener('keydown', target._autocompleteKeyHandler);
            }

            target._autocompleteHandler = updateList;
            target._autocompleteKeyHandler = (eKey) => {
                if (dropdown.style.display === 'flex') {
                    if (eKey.key === 'ArrowDown') {
                        eKey.preventDefault();
                        activeIndex = (activeIndex + 1) % filteredItems.length;
                        renderDropdown(filteredItems, target.value);
                        dropdown.children[activeIndex].scrollIntoView({ block: 'nearest' });
                    } else if (eKey.key === 'ArrowUp') {
                        eKey.preventDefault();
                        activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
                        renderDropdown(filteredItems, target.value);
                        dropdown.children[activeIndex].scrollIntoView({ block: 'nearest' });
                    } else if (eKey.key === 'Enter') {
                        if (activeIndex > -1) {
                            eKey.preventDefault();
                            target.value = filteredItems[activeIndex];
                            target.dispatchEvent(new Event('input', { bubbles: true }));
                            target.dispatchEvent(new Event('change', { bubbles: true }));
                            closeDropdown();
                        } else if (filteredItems.length === 1) {
                            eKey.preventDefault();
                            target.value = filteredItems[0];
                            target.dispatchEvent(new Event('input', { bubbles: true }));
                            target.dispatchEvent(new Event('change', { bubbles: true }));
                            closeDropdown();
                        }
                    } else if (eKey.key === 'Escape') {
                        closeDropdown();
                    }
                }
            };

            target.addEventListener('input', target._autocompleteHandler);
            target.addEventListener('keydown', target._autocompleteKeyHandler);

            // Initial render
            updateList();
        }
    }

    document.addEventListener('focusin', onInputFocus);
    
    // Global click outside to close
    document.addEventListener('click', (e) => {
        if (currentInput && e.target !== currentInput && !dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    // Close on scroll to avoid floating dropdown disconnection
    window.addEventListener('scroll', () => {
        if (currentInput) {
            closeDropdown();
        }
    }, true); // Use capture phase to catch scroll events on any element
});
