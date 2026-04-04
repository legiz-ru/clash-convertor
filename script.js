document.getElementById('warpButton').onclick = function() {
    window.location.href = 'https://github.com/legiz-ru/';
}

const configToggle = document.getElementById('config');
const configModal = document.getElementById('configModal');
const warpToggle = document.getElementById('warp');
const warpModal = document.getElementById('warpModal');
const closeModal = document.querySelector('.close');
const rulesToggle = document.getElementById('rules');
const rulesOptions = document.getElementById('rulesOptions');
const rulePresets = {
    'ru-bundle': `rule-providers:
  skrepysh-proxy:
    type: http
    url: https://github.com/Skrepysh/mihomo-rulesets/raw/refs/heads/main/skrepysh-rulesets/skrepysh-proxy.yaml
    interval: 86400
    proxy: DIRECT
    behavior: classical
    format: yaml
  ru-bundle:
    type: http
    url: https://github.com/legiz-ru/mihomo-rule-sets/raw/main/ru-bundle/rule.yaml
    interval: 86400
    proxy: DIRECT
    behavior: domain
    format: yaml
  torrent-clients:
    type: http
    url: 'https://raw.githubusercontent.com/legiz-ru/mihomo-rule-sets/refs/heads/main/other/torrent-clients.yaml'
    interval: 86400
    proxy: DIRECT
    behavior: classical
    format: yaml
  torrent-trackers:
    type: http
    behavior: domain
    format: mrs
    url: https://github.com/legiz-ru/mihomo-rule-sets/raw/main/other/torrent-trackers.mrs
    path: ./rule-sets/torrent-trackers.mrs
    interval: 86400

rules:
  - RULE-SET,torrent-clients,DIRECT
  - RULE-SET,torrent-trackers,DIRECT
  - RULE-SET,skrepysh-proxy,PROXY
  - RULE-SET,ru-bundle,PROXY
  - MATCH,DIRECT`,
    'xkeen-mihomo': `log-level: silent
allow-lan: true
tproxy-port: 5000
ipv6: true
mode: rule
external-controller: 0.0.0.0:9090
external-ui: zashboard
external-ui-url: https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip
profile:
  store-selected: true

sniffer:
  enable: true
  sniff:
    HTTP:
    TLS:
    QUIC:

rule-providers:

  ru-bundle:
    type: http
    url: https://github.com/legiz-ru/mihomo-rule-sets/raw/main/ru-bundle/rule.yaml
    interval: 86400
    proxy: DIRECT
    behavior: domain
    format: yaml
  torrent-clients:
    type: http
    url: 'https://raw.githubusercontent.com/legiz-ru/mihomo-rule-sets/refs/heads/main/other/torrent-clients.yaml'
    interval: 86400
    proxy: DIRECT
    behavior: classical
    format: yaml
  torrent-trackers:
    type: http
    behavior: domain
    format: mrs
    url: https://github.com/legiz-ru/mihomo-rule-sets/raw/main/other/torrent-trackers.mrs
    path: ./rule-sets/torrent-trackers.mrs
    interval: 86400
  cloudflare-domains:
    type: http
    behavior: domain
    format: mrs
    url: https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/cloudflare.mrs
    path: ./rule-sets/cloudflare-domains.mrs
    interval: 86400
  cloudflare-ips:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/cloudflare.mrs
    path: ./rule-sets/cloudflare-ips.mrs
    interval: 86400
  telegram-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/telegram.mrs
    path: ./rule-sets/telegram-domain.mrs
    interval: 86400
  telegram-ips:
    type: http
    behavior: ipcidr
    format: yaml
    url: https://raw.githubusercontent.com/OMchik33/custom-rules/refs/heads/main/mihomo/telegram-ips.yaml
    path: ./rule-sets/telegram-ips.yaml
    interval: 86400
  whatsapp-domain:
    type: http
    behavior: domain
    format: mrs
    url: https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/whatsapp.mrs
    path: ./rule-sets/whatsapp-domain.mrs
    interval: 86400
  discord_domains:
    type: http
    behavior: domain
    format: mrs
    url: https://github.com/MetaCubeX/meta-rules-dat/raw/meta/geo/geosite/discord.mrs
    path: ./rule-sets/discord_domains.mrs
    interval: 86400
  discord_voiceips:
    type: http
    behavior: ipcidr
    format: mrs
    url: https://github.com/legiz-ru/mihomo-rule-sets/raw/main/other/discord-voice-ip-list.mrs
    path: ./rule-sets/discord_voiceips.mrs
    interval: 86400

rules:
  - OR,((DOMAIN,ipwho.is),(DOMAIN,api.ip.sb),(DOMAIN,ipapi.co),(DOMAIN,ipinfo.io)),PROXY
  - OR,((RULE-SET,telegram-domain),(RULE-SET,telegram-ips)),PROXY
  - OR,((RULE-SET,whatsapp-domain)),PROXY
  - OR,((RULE-SET,discord_domains),(RULE-SET,discord_voiceips)),PROXY
  - RULE-SET,torrent-trackers,DIRECT
  - OR,((RULE-SET,cloudflare-domains),(RULE-SET,cloudflare-ips)),PROXY
  - RULE-SET,ru-bundle,PROXY
  - MATCH,DIRECT`
};
let selectedRulesPreset = 'ru-bundle';
const rulesPresetInputs = document.querySelectorAll('input[name="rulesPreset"]');
let warpProxies = '';
let warpProxyGroups = '';

rulesToggle.addEventListener('change', function() {
    const outputElement = document.getElementById('yamlOutput');
    const output = outputElement.value.trimEnd();

    if (this.checked) {
        rulesOptions.classList.remove('hidden');
        outputElement.value = addOrReplaceRulesContent(output, selectedRulesPreset);
    } else {
        rulesOptions.classList.add('hidden');
        outputElement.value = removeRulesContent(output);
    }
});

rulesPresetInputs.forEach((input) => {
    input.addEventListener('change', function() {
        if (!this.checked) {
            return;
        }

        selectedRulesPreset = this.value;

        if (rulesToggle.checked) {
            const outputElement = document.getElementById('yamlOutput');
            const output = outputElement.value.trimEnd();
            outputElement.value = addOrReplaceRulesContent(output, selectedRulesPreset);
        }
    });
});

function removeRulesContent(output) {
    if (!output.includes('rule-providers:')) {
        return output;
    }

    const rulesStartIndex = output.indexOf('rule-providers:');
    return output.substring(0, rulesStartIndex).trimEnd();
}

function addOrReplaceRulesContent(output, presetKey) {
    const presetContent = rulePresets[presetKey];

    if (!presetContent) {
        return output;
    }

    const baseOutput = removeRulesContent(output).trimEnd();

    if (baseOutput) {
        return baseOutput + '\n\n' + presetContent;
    }

    return presetContent;
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rules').disabled = true;
    document.getElementById('warp').disabled = true;
    document.getElementById('config').disabled = true;
});

warpToggle.addEventListener('change', function() {
  if (this.checked) {
    warpModal.style.display = 'block';
  }
});
closeModal.addEventListener('click', function() {
  warpModal.style.display = 'none';
  warpToggle.checked = false;
});
window.addEventListener('click', function(event) {
  if (event.target === warpModal) {
    warpModal.style.display = 'none';
    warpToggle.checked = false;
  }
});

closeModal.addEventListener('click', function() {
  warpModal.style.display = 'none';
  warpToggle.checked = false;
});
window.addEventListener('click', function(event) {
  if (event.target === warpModal) {
    warpModal.style.display = 'none';
    warpToggle.checked = false;
  }
});

// Выбор конфига WARP
document.getElementById('selectWarpConfig').addEventListener('click', function() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.yaml,.yml';
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const content = e.target.result;
        // Разделяем конфиг на части
        const proxyGroupsIndex = content.indexOf('proxy-groups:');
        if (proxyGroupsIndex !== -1) {
          // Получаем секцию proxies
          const proxiesEndIndex = proxyGroupsIndex;
          const proxiesStartIndex = content.indexOf('proxies:');
          if (proxiesStartIndex !== -1) {
            warpProxies = content.substring(proxiesStartIndex, proxiesEndIndex).trim();
          }
          
          // Получаем секцию proxy-groups
          warpProxyGroups = content.substring(proxyGroupsIndex).trim();
          
          // Закрываем модальное окно
          warpModal.style.display = 'none';
          
          // Если есть контент в output, обновляем его
          const output = document.getElementById('yamlOutput').value;
          if (output) {
            updateOutputWithWarp(output);
          }
        } else {
          showError('Неверный формат WARP конфига: отсутствует секция proxy-groups');
        }
      };
      
      reader.readAsText(file);
    }
  });
  
  fileInput.click();
});

function updateOutputWithWarp(output) {
    // Проверяем, есть ли в output секция proxy-providers (HTTP/HTTPS подписка)
    const hasProxyProviders = output.includes('proxy-providers:');
    
    // Разделяем текущий output на части
    const proxyGroupsIndex = output.indexOf('proxy-groups:');
    
    if (proxyGroupsIndex !== -1) {
        // Получаем секцию proxies из текущего output
        const proxiesStartIndex = output.indexOf('proxies:');
        
        if (proxiesStartIndex !== -1) {
            // Находим конец секции proxies (до proxy-groups)
            const proxiesEndIndex = proxyGroupsIndex;
            const currentProxies = output.substring(proxiesStartIndex + 'proxies:'.length, proxiesEndIndex).trim();
            
            // Получаем секцию proxy-groups из текущего output
            let currentProxyGroups = output.substring(proxyGroupsIndex).trim();
            
            // Создаем PROXY+WARP на основе WARP in WARP
            let warpInWarpConfig = '';
                const start = warpProxies.indexOf('- name: "WARP in WARP"');
                const end = warpProxies.indexOf('\n\n', start);
                warpInWarpConfig = warpProxies.substring(start, end !== -1 ? end : warpProxies.length);
                warpInWarpConfig = warpInWarpConfig
                    .replace('name: "WARP in WARP"', 'name: "PROXY+WARP"')
                    .replace('dialer-proxy: WARP', 'dialer-proxy: PROXY');

            
            // Добавляем PROXY+WARP в группу Cloudflare
            if (warpProxyGroups.includes('name: Cloudflare')) {
                const cloudflareGroupStart = warpProxyGroups.indexOf('name: Cloudflare');
                const cloudflareGroupEnd = warpProxyGroups.indexOf('\n\n', cloudflareGroupStart);
                let cloudflareGroup = warpProxyGroups.substring(cloudflareGroupStart, cloudflareGroupEnd !== -1 ? cloudflareGroupEnd : warpProxyGroups.length);
                
                // Добавляем PROXY+WARP в список прокси, если его там еще нет
                if (!cloudflareGroup.includes('PROXY+WARP')) {
                    cloudflareGroup = cloudflareGroup.replace(
                        /proxies:\n((?:\s*-\s*[^\n]+\n)*)/,
                        `proxies:\n$1    - PROXY+WARP\n`
                    );
                }
                
                // Обновляем warpProxyGroups с измененной группой Cloudflare
                warpProxyGroups = warpProxyGroups.substring(0, cloudflareGroupStart) + 
                                 cloudflareGroup + 
                                 warpProxyGroups.substring(cloudflareGroupEnd !== -1 ? cloudflareGroupEnd : warpProxyGroups.length);
            }
            
            // Для HTTP/HTTPS подписок сохраняем только proxy-providers и связанные группы
            if (hasProxyProviders) {
                const providersIndex = output.indexOf('proxy-providers:');
                const currentProxyGroups = output.substring(proxyGroupsIndex, providersIndex).trim();
                const proxyProviders = output.substring(providersIndex).trim();
                
                // Объединяем все части
                const newOutput = warpProxies + '\n\n' + warpInWarpConfig + '\n\n' +
                                 warpProxyGroups + '\n\n' +
                                 currentProxyGroups.replace('proxy-groups:', '').trim() + '\n\n' +
                                 proxyProviders;
                
                document.getElementById('yamlOutput').value = newOutput;
                return;
            }
            
            // Для обычных конфигов просто объединяем proxies и добавляем все группы
            const mergedProxies = warpProxies + '\n\n' + warpInWarpConfig + '\n\n' + currentProxies;
            const mergedProxyGroups = warpProxyGroups + '\n\n' + currentProxyGroups.replace('proxy-groups:', '').trim();
            
            const newOutput = mergedProxies + '\n\n' + mergedProxyGroups;
            document.getElementById('yamlOutput').value = newOutput;
            return;
        }
    }
    
    // Если в output нет стандартных секций, просто добавляем обе секции WARP
    const newOutput = output + '\n\n' + warpProxies + '\n' + warpInWarpConfig + '\n\n' + warpProxyGroups;
    document.getElementById('yamlOutput').value = newOutput;
}
configToggle.addEventListener('change', function() {
  if (this.checked) {
    configModal.style.display = 'block';
  }
});
function closeConfigModal() {
  configModal.style.display = 'none';
  configToggle.checked = false;
}
window.addEventListener('click', function(event) {
  if (event.target === configModal) {
    closeConfigModal();
  }
});

// Обработчик для кнопки выбора другого конфига
document.getElementById('selectConfig').addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.yaml,.yml';
    
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const selectedConfig = e.target.result;
                let currentConfig = document.getElementById('yamlOutput').value;
                
                // Извлекаем нужные секции из текущего конфига
                const sections = extractSections(currentConfig);
                
                // Сначала копируем весь выбранный конфиг
                let mergedConfig = selectedConfig;
                
                // Для proxy-groups - добавляем наши группы к существующим
                if (sections.proxyGroups) {
                    const groupsIndex = mergedConfig.indexOf('proxy-groups:');
                    if (groupsIndex !== -1) {
                        // Находим конец секции proxy-groups в выбранном конфиге
                        const nextSectionIndex = findNextSectionIndex(mergedConfig, groupsIndex);
                        const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : mergedConfig.length;
                        
                        // Вставляем наши группы перед закрывающим символом секции
                        const originalGroups = mergedConfig.substring(groupsIndex, endIndex).trim();
                        const ourGroups = sections.proxyGroups.replace('proxy-groups:', '').trim();
                        
                        // Объединяем группы с двумя переносами строк между ними
                        mergedConfig = mergedConfig.substring(0, groupsIndex) + 
                                     'proxy-groups:\n' + 
                                     originalGroups.replace('proxy-groups:', '').trim() + 
                                     '\n\n' + ourGroups + 
                                     mergedConfig.substring(endIndex);
						mergedConfig = mergedConfig.replace(/(proxy-groups:[^\n]*[\s\S]*?)(proxy-providers:)/g, '$1\n\n$2');
                    } else {
                        // Добавляем в конец с двумя переносами строк
                        mergedConfig += '\n\n' + sections.proxyGroups;
                    }
                }
                
// Для proxy-providers - добавляем с правильными переносами строк
if (sections.proxyProviders) {
    const providersIndex = mergedConfig.indexOf('proxy-providers:');
    if (providersIndex !== -1) {
        // Находим конец секции proxy-providers в выбранном конфиге
        const nextSectionIndex = findNextSectionIndex(mergedConfig, providersIndex);
        const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : mergedConfig.length;
        
		const originalProxies1 = mergedConfig.substring(providersIndex, endIndex).trim();
        // Сохраняем все что идет ПОСЛЕ секции proxy-providers в оригинальном конфиге
        const afterProviders = mergedConfig.substring(endIndex);
        
        // Собираем новый конфиг: все до providers + наши providers + все после
        mergedConfig = mergedConfig.substring(0, providersIndex).trim() +  
                     '\n\n' + sections.proxyProviders + 
					 '\n\n  ' + originalProxies1.replace('proxy-providers:', '').trim() +
                     '\n\n' + afterProviders.trim();
    } else {
        // Добавляем в конец с двумя переносами строк
        mergedConfig += '\n\n' + sections.proxyProviders;
    }
}
                
                // Для proxies - добавляем наши прокси к существующим
                if (sections.proxies) {
                    const proxiesIndex = mergedConfig.indexOf('proxies:\n- name:');
                    if (proxiesIndex !== -1) {
                        // Находим конец секции proxies в выбранном конфиге
                        const nextSectionIndex = findNextSectionIndex(mergedConfig, proxiesIndex);
                        const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : mergedConfig.length;
                        
                        // Вставляем наши прокси перед закрывающим символом секции
                        const originalProxies = mergedConfig.substring(proxiesIndex, endIndex).trim();
                        const ourProxies = sections.proxies.replace('proxies:', '').trim();
                        
                        // Объединяем прокси с двумя переносами строк между ними
                        mergedConfig = mergedConfig.substring(0, proxiesIndex) + 
                                     'proxies:\n' + 
                                     originalProxies.replace('proxies:', '').trim() + 
                                     '\n\n' + ourProxies + 
                                     mergedConfig.substring(endIndex);
						mergedConfig = mergedConfig.replace(/(proxies:[^\n]*[\s\S]*?)(proxy-groups:)/g, '$1\n\n$2');
                    } else {
                        // Добавляем в конец с двумя переносами строк
                        mergedConfig += '\n\n' + sections.proxies;
                    }
                }
                       
                mergedConfig = mergedConfig.replace(/(\n\s*\n)(?=\s+-)/g, '\n');
                mergedConfig = mergedConfig.trim();
                document.getElementById('yamlOutput').value = mergedConfig;
                configModal.style.display = 'none';
            };
            
            reader.readAsText(file);
        }
    });
    
    fileInput.click();
});

function extractSections(config) {
    const sections = {
        proxyProviders: '',
        proxyGroups: '',
        proxies: ''
    };

    // Извлекаем proxy-providers
    const proxyProvidersIndex = config.indexOf('proxy-providers:');
    if (proxyProvidersIndex !== -1) {
        let endIndex = config.length;
        // Ищем следующий раздел или конец файла
        const nextSectionIndex = findNextSectionIndex(config, proxyProvidersIndex);
        if (nextSectionIndex !== -1) {
            endIndex = nextSectionIndex;
        }
        sections.proxyProviders = config.substring(
            proxyProvidersIndex, 
            endIndex
        ).trim();
    }

    // Извлекаем proxy-groups
    const proxyGroupsIndex = config.indexOf('proxy-groups:');
    if (proxyGroupsIndex !== -1) {
        let endIndex = config.length;
        const nextSectionIndex = findNextSectionIndex(config, proxyGroupsIndex);
        if (nextSectionIndex !== -1) {
            endIndex = nextSectionIndex;
        }
        sections.proxyGroups = config.substring(
            proxyGroupsIndex, 
            endIndex
        ).trim();
    }

    // Извлекаем proxies
    const proxiesIndex = config.indexOf('proxies:\n- name:');
    if (proxiesIndex !== -1) {
        let endIndex = config.length;
        const nextSectionIndex = findNextSectionIndex(config, proxiesIndex);
        if (nextSectionIndex !== -1) {
            endIndex = nextSectionIndex;
        }
        sections.proxies = config.substring(
            proxiesIndex, 
            endIndex
        ).trim();
    }

    return sections;
}

function findNextSectionIndex(config, currentIndex) {
    const sections = ['proxy-providers:', 'proxy-groups:', 'proxies:\n- name:', 'rule-providers:', 'rules:', 'sniffer:', 'dns:', 'tun:'];
    let nextIndex = -1;
    
    for (const section of sections) {
        if (section === config.substring(currentIndex, currentIndex + section.length)) {
            continue; // Пропускаем текущий раздел
        }
        
        const index = config.indexOf(section, currentIndex + 1);
        if (index !== -1 && (nextIndex === -1 || index < nextIndex)) {
            nextIndex = index;
        }
    }
    
    return nextIndex;
}

var textarea = document.getElementsByTagName('textarea')[0];
textarea.addEventListener('input', resize); 
function resize() {
    const maxLines = 20; // Максимальное количество строк перед появлением скролла
    const lineHeight = 20; // Высота одной строки в пикселях
    const maxHeight = maxLines * lineHeight;
    this.style.height = 'auto'; 
    const newHeight = Math.min(this.scrollHeight, maxHeight);
    this.style.height = newHeight + 'px';
    this.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
}

resize.call(textarea);

// Окно для ошибок
const modal = document.createElement('div');
modal.id = 'errorModal';
modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,.78);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 2000;
`;

const modalContent = document.createElement('div');
modalContent.style.cssText = `
    background: #16161f;
    border: 1px solid rgba(248,113,113,.25);
    padding: 28px 28px 24px;
    border-radius: 20px;
    max-width: 90%;
    width: 420px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,.65);
`;

const modalText = document.createElement('p');
modalText.style.cssText = 'margin-bottom: 20px; color: #e8e6f0; font-size: 14px; line-height: 1.6;';

const modalCloseBtn = document.createElement('button');
modalCloseBtn.textContent = 'Закрыть';
modalCloseBtn.style.cssText = `
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    height: 38px;
    padding: 0 24px;
    background: linear-gradient(135deg, #7c5cfc, #9b6dff);
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all .2s;
`;
modalCloseBtn.onmouseover = () => { modalCloseBtn.style.background = 'linear-gradient(135deg, #8b6cff, #a97dff)'; };
modalCloseBtn.onmouseout  = () => { modalCloseBtn.style.background = 'linear-gradient(135deg, #7c5cfc, #9b6dff)'; };
modalCloseBtn.onclick = () => modal.style.display = 'none';

modalContent.appendChild(modalText);
modalContent.appendChild(modalCloseBtn);
modal.appendChild(modalContent);
document.body.appendChild(modal);

function showError(message) {
    modalText.textContent = message;
    modal.style.display = 'flex';
}

// Функция конвертации
function convert() {
	document.getElementById('rules').checked = false;
    document.getElementById('warp').checked = false;
    document.getElementById('config').checked = false;
	
	document.getElementById('rules').disabled = false;
    document.getElementById('warp').disabled = false;
	document.getElementById('config').disabled = false;
	
    const input = document.getElementById('yamlInput').value.trim();
    const outputTextarea = document.getElementById('yamlOutput');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyBtn = document.getElementById('copyBtn');

    if (!input) {
        showError('Ошибка: Введите ссылку на подписку для конвертации');
        return;
    }

    const lines = input.split('\n').filter(line => line.trim());
    
    // Если только одна строка, обрабатываем как раньше
    if (lines.length === 1) {
        const singleLine = lines[0];
        let config;
        
        try {
            if (singleLine.startsWith('vless://')) {
                const proxy = parseVlessUri(singleLine);
                config = generateVlessConfig(proxy);
            } else if (singleLine.startsWith('vmess://')) {
                const proxy = parseVmessUri(singleLine);
                config = generateVmessConfig(proxy);
            } else if (singleLine.startsWith('ss://')) {
                const proxy = parseShadowsocksUri(singleLine);
                config = generateShadowsocksConfig(proxy);
            } else if (singleLine.startsWith('trojan://')) {
                const proxy = parseTrojanUri(singleLine);
                config = generateTrojanConfig(proxy);
            } else if (singleLine.startsWith('hysteria2://') || singleLine.startsWith('hy2://')) {
                const proxy = parseHysteria2Uri(singleLine);
                config = generateHysteria2Config(proxy);
            } else if (singleLine.startsWith('ssr://')) {
                config = "# Конфиг для SSR будет реализован позже\n# Введенная ссылка: " + singleLine;
            } else {
                if (!singleLine.startsWith('http://') && !singleLine.startsWith('https://')) {
                    showError('Внимание: Возможно вы допустили ошибку в ссылке на подписку. Она должна начинаться с http:// или https:// или названия протокола: vless:// и т.д.');
                }
                config = generateSubscriptionConfig(singleLine);
            }
        } catch (e) {
            showError('Ошибка при парсинге ссылки: ' + e.message);
            return;
        }
        
        outputTextarea.value = config;
        setupDownloadAndCopy();
        downloadBtnCT.classList.remove('hidden');
        return;
    }
    
    // Обработка множественных ссылок
    let proxies = [];
    let hasUnsupportedTypes = false;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        try {
            if (trimmedLine.startsWith('vless://')) {
                const proxy = parseVlessUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('vmess://')) {
                const proxy = parseVmessUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('ss://')) {
                const proxy = parseShadowsocksUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('trojan://')) {
                const proxy = parseTrojanUri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('hysteria2://') || trimmedLine.startsWith('hy2://')) {
                const proxy = parseHysteria2Uri(trimmedLine);
                proxies.push(proxy);
            } else if (trimmedLine.startsWith('ssr://') || trimmedLine.startsWith('hysteria://') || 
                      trimmedLine.startsWith('tuic://') || trimmedLine.startsWith('wireguard://')) {
                hasUnsupportedTypes = true;
            } else if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
                showError('Ошибка: Множественные HTTP/HTTPS подписки пока не поддерживаются');
                return;
            } else {
                showError('Неподдерживаемый формат ссылки: ' + trimmedLine);
                return;
            }
        } catch (e) {
            showError('Ошибка при парсинге ссылки: ' + trimmedLine + '\n' + e.message);
            return;
        }
    }
    
    if (hasUnsupportedTypes) {
        showError('Ошибка: Поддержка множественных ссылок пока недоступна для некоторых типов протоколов');
        return;
    }
    
    if (proxies.length === 0) {
        showError('Не найдено валидных ссылок для конвертации');
        return;
    }
    
    // Генерируем общий конфиг
    const config = generateMultiProxyConfig(proxies);
    outputTextarea.value = config;
    setupDownloadAndCopy();
    downloadBtnCT.classList.remove('hidden');
}

function generateSubscriptionConfig(url) {
    return `proxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
  use:
    - sub

- name: auto
  use:
    - sub
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true
    
proxy-providers:
  sub:
    type: http
    url: "${url}"
    path: ./proxy_providers/sub.yml
    override:
      udp: true
    health-check:
      enable: true
      url: http://cp.cloudflare.com/generate_204
      interval: 300
      timeout: 5000
      lazy: true
      expected-status: 204`;
}

function parseHysteria2Uri(line) {
    let url;
    try {
        url = new URL(line);
    } catch (e) {
        throw new Error('Invalid Hysteria2 URI format');
    }

    const server = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 443;
    const password = decodeURIComponent(url.username);
    const name = decodeURIComponent(url.hash.slice(1)).trim() || `Hysteria2 ${server}:${port}`;
    const params = url.searchParams;

    const proxy = {
        type: "hysteria2",
        name: name,
        server: server,
        port: port,
        password: password,
        sni: undefined,
        obfs: undefined,
        "obfs-password": undefined,
        "skip-cert-verify": true,
        fingerprint: undefined,
        alpn: undefined,
        up: undefined,
        down: undefined,
        ports: undefined,
        tfo: false
    };

    // Обработка obfs
    const obfs = params.get('obfs');
    if (obfs && obfs !== 'none' && obfs !== 'null' && obfs !== 'undefined') {
        proxy.obfs = obfs;
        const obfsPassword = params.get('obfs-password');
        if (obfsPassword) {
            proxy["obfs-password"] = obfsPassword;
        }
    }

    // SNI
    proxy.sni = params.get('sni') || params.get('peer') || undefined;

    // skip-cert-verify: по умолчанию true (как в moshen), переопределяем если явно задано
    if (params.has('insecure')) {
        proxy["skip-cert-verify"] = /(true)|1/i.test(params.get('insecure'));
    }

    // Fingerprint (pinSHA256)
    proxy.fingerprint = params.get('pinSHA256') || params.get('fp') || params.get('fingerprint') || undefined;

    // ALPN
    const alpn = params.get('alpn');
    if (alpn) {
        proxy.alpn = alpn.split(',');
    }

    // Up/Down bandwidth
    const up = params.get('up');
    const down = params.get('down');
    if (up) proxy.up = up;
    if (down) proxy.down = down;

    // Multi-port (mport)
    const mport = params.get('mport');
    if (mport) proxy.ports = mport;

    proxy.tfo = params.has('tfo') && /(true)|1/i.test(params.get('tfo'));

    return proxy;
}

function parseXHTTPExtra(extra, opts) {
    // xmuxToReuse converts xmux fields to mihomo reuse-settings.
    // Values may be string or number (xray-core JSON allows both).
    const xmuxToReuse = (xmux) => {
        const reuse = {};
        const fields = [
            ['maxConnections',  'max-connections'],
            ['maxConcurrency',  'max-concurrency'],
            ['cMaxReuseTimes',  'c-max-reuse-times'],
            ['hMaxRequestTimes','h-max-request-times'],
            ['hMaxReusableSecs','h-max-reusable-secs'],
        ];
        for (const [src, dst] of fields) {
            const v = xmux[src];
            if (typeof v === 'string' && v) reuse[dst] = v;
            else if (typeof v === 'number') reuse[dst] = String(Math.trunc(v));
        }
        return reuse;
    };

    if (extra.noGRPCHeader === true) opts['no-grpc-header'] = true;
    if (typeof extra.xPaddingBytes === 'string' && extra.xPaddingBytes)
        opts['x-padding-bytes'] = extra.xPaddingBytes;

    // xmux at root extra → reuse-settings
    if (extra.xmux && typeof extra.xmux === 'object') {
        const reuse = xmuxToReuse(extra.xmux);
        if (Object.keys(reuse).length > 0) opts['reuse-settings'] = reuse;
    }

    if (extra.downloadSettings && typeof extra.downloadSettings === 'object') {
        const ds = extra.downloadSettings;
        const dsOpts = {};
        if (typeof ds.address === 'string' && ds.address) dsOpts['server'] = ds.address;
        if (typeof ds.port === 'number') dsOpts['port'] = Math.trunc(ds.port);
        if (typeof ds.security === 'string' && ds.security.toLowerCase() === 'tls') dsOpts['tls'] = true;
        if (ds.tlsSettings && typeof ds.tlsSettings === 'object') {
            const tls = ds.tlsSettings;
            if (typeof tls.serverName === 'string' && tls.serverName) dsOpts['servername'] = tls.serverName;
            if (typeof tls.fingerprint === 'string' && tls.fingerprint) dsOpts['client-fingerprint'] = tls.fingerprint;
            if (Array.isArray(tls.alpn) && tls.alpn.length > 0)
                dsOpts['alpn'] = tls.alpn.filter(a => typeof a === 'string');
        }
        if (ds.xhttpSettings && typeof ds.xhttpSettings === 'object') {
            const xh = ds.xhttpSettings;
            if (typeof xh.path === 'string' && xh.path) dsOpts['path'] = xh.path;
            if (typeof xh.host === 'string' && xh.host) dsOpts['host'] = xh.host;
            if (xh.noGRPCHeader === true) dsOpts['no-grpc-header'] = true;
            if (typeof xh.xPaddingBytes === 'string' && xh.xPaddingBytes) dsOpts['x-padding-bytes'] = xh.xPaddingBytes;
            // xmux inside downloadSettings.xhttpSettings.extra → download-settings.reuse-settings
            if (xh.extra && typeof xh.extra === 'object' &&
                xh.extra.xmux && typeof xh.extra.xmux === 'object') {
                const reuse = xmuxToReuse(xh.extra.xmux);
                if (Object.keys(reuse).length > 0) dsOpts['reuse-settings'] = reuse;
            }
        }
        if (Object.keys(dsOpts).length > 0) opts['download-settings'] = dsOpts;
    }
}

function parseVlessUri(line) {
    // Поддержка Shadowrocket base64-encoded формата: vless://BASE64?params#name
    const afterScheme = line.slice('vless://'.length);
    const qIdx = afterScheme.indexOf('?');
    const hashIdx = afterScheme.indexOf('#');
    const atIdx = afterScheme.indexOf('@');
    const endOfHost = qIdx !== -1 ? qIdx : (hashIdx !== -1 ? hashIdx : afterScheme.length);

    // Если @ отсутствует или находится после ? — вероятно Shadowrocket base64
    if (atIdx === -1 || atIdx > endOfHost) {
        const base64Part = afterScheme.slice(0, endOfHost);
        const rest = afterScheme.slice(endOfHost);
        try {
            const decoded = atob(base64Part);
            // decoded: `uuid@host:port` или `cipher:uuid@host:port`
            line = 'vless://' + decoded + rest;
        } catch (e) {}
    }

    let url;
    try {
        url = new URL(line);
    } catch (e) {
        throw new Error('Invalid VLESS URI format');
    }

    const server = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 80;
    // Shadowrocket cipher:uuid → username=cipher, password=uuid; normal → username=uuid
    const uuid = url.password ? decodeURIComponent(url.password) : decodeURIComponent(url.username);
    const name = decodeURIComponent(url.hash.slice(1)).trim() || `VLESS ${server}:${port}`;
    const params = url.searchParams;

    const proxy = {
        type: "vless",
        name: name,
        server: server,
        port: port,
        uuid: uuid,
        udp: true,
        tls: false,
        network: "tcp",
        alpn: [],
        "ws-opts": {},
        "http-opts": {},
        "grpc-opts": {},
        "reality-opts": {},
        "client-fingerprint": undefined,
        sni: undefined
    };

    // Безопасность (TLS / Reality)
    const security = (params.get('security') || '').toLowerCase();
    if (security.endsWith('tls') || security === 'reality') {
        proxy.tls = true;
        proxy['client-fingerprint'] = params.get('fp') || 'chrome';
        const alpn = params.get('alpn');
        if (alpn) {
            proxy.alpn = alpn.replace(/%2C/gi, ',').split(',');
        }
        const pcs = params.get('pcs');
        if (pcs) proxy.fingerprint = pcs;
    }
    // Shadowrocket может передавать TLS через параметр tls=1
    if (!proxy.tls && /true|1/i.test(params.get('tls') || '')) {
        proxy.tls = true;
    }

    // SNI
    proxy.sni = params.get('sni') || params.get('peer') || undefined;

    // Flow (только xtls-rprx-vision поддерживается mihomo)
    const flow = (params.get('flow') || '').toLowerCase();
    if (flow === 'xtls-rprx-vision') {
        proxy.flow = 'xtls-rprx-vision';
    }

    // Encryption
    const encryption = params.get('encryption');
    if (encryption) proxy.encryption = encryption;

    // skip-cert-verify
    proxy['skip-cert-verify'] = /(true)|1/i.test(params.get('allowInsecure') || params.get('insecure') || '');

    // Reality opts
    if (security === 'reality') {
        const pbk = params.get('pbk');
        const sid = params.get('sid');
        if (pbk || sid) {
            proxy['reality-opts'] = {};
            if (pbk) proxy['reality-opts']['public-key'] = pbk;
            if (sid) proxy['reality-opts']['short-id'] = sid;
        }
    }

    // packetEncoding → packet-addr / xudp
    const packetEncoding = params.get('packetEncoding');
    if (packetEncoding === 'packet') {
        proxy['packet-addr'] = true;
    } else if (packetEncoding !== 'none') {
        proxy.xudp = true;
    }

    // Тип сети
    const rawType = (params.get('type') || 'tcp').toLowerCase();
    const headerType = (params.get('headerType') || '').toLowerCase();

    if (rawType === 'httpupgrade') {
        proxy.network = 'ws';
        proxy['ws-opts']['v2ray-http-upgrade'] = true;
        proxy['ws-opts']['v2ray-http-upgrade-fast-open'] = true;
    } else if (headerType === 'http') {
        proxy.network = 'http';
    } else {
        proxy.network = rawType;
    }

    // Параметры по типу сети
    switch (proxy.network) {
        case 'ws': {
            const path = params.get('path');
            if (path) proxy['ws-opts'].path = decodeURIComponent(path);
            const host = params.get('host') || params.get('obfsParam');
            if (host) {
                proxy['ws-opts'].headers = proxy['ws-opts'].headers || {};
                proxy['ws-opts'].headers['Host'] = host;
            }
            const ed = params.get('ed');
            if (ed) {
                const med = parseInt(ed, 10);
                if (!isNaN(med)) {
                    proxy['ws-opts']['max-early-data'] = med;
                    proxy['ws-opts']['early-data-header-name'] = 'Sec-WebSocket-Protocol';
                }
            }
            const eh = params.get('eh');
            if (eh) proxy['ws-opts']['early-data-header-name'] = eh;
            break;
        }
        case 'grpc': {
            const serviceName = params.get('serviceName');
            if (serviceName) proxy['grpc-opts']['grpc-service-name'] = decodeURIComponent(serviceName);
            break;
        }
        case 'http': {
            const path = params.get('path');
            const host = params.get('host');
            proxy['http-opts'] = { headers: {} };
            if (path) proxy['http-opts'].path = decodeURIComponent(path);
            if (host) proxy['http-opts'].headers['Host'] = host;
            break;
        }
        case 'xhttp':
        case 'splithttp': {
            proxy.network = 'xhttp';
            proxy['xhttp-opts'] = {};
            const path = params.get('path');
            if (path) proxy['xhttp-opts'].path = path;
            const host = params.get('host');
            if (host) proxy['xhttp-opts'].host = host;
            const mode = params.get('mode');
            if (mode) proxy['xhttp-opts'].mode = mode;
            const extraRaw = params.get('extra');
            if (extraRaw) {
                try {
                    const extraMap = JSON.parse(extraRaw);
                    parseXHTTPExtra(extraMap, proxy['xhttp-opts']);
                } catch (_) {}
            }
            break;
        }
    }

    return proxy;
}

function parseVmessUri(line) {
    line = line.split('vmess://')[1];
    let content = atob(line);
    let params;
    
    try {
        params = JSON.parse(content);
    } catch (e) {
        // Shadowrocket формат
        const match = /(^[^?]+?)\/?\?(.*)$/.exec(line);
        if (match) {
            let [_, base64Line, qs] = match;
            content = atob(base64Line);
            params = {};
            
            for (const addon of qs.split('&')) {
                const [key, valueRaw] = addon.split('=');
                const value = decodeURIComponent(valueRaw);
                params[key] = value;
            }
            
            const contentMatch = /(^[^:]+?):([^:]+?)@(.*):(\d+)$/.exec(content);
            if (contentMatch) {
                let [__, cipher, uuid, server, port] = contentMatch;
                params.scy = cipher;
                params.id = uuid;
                params.port = port;
                params.add = server;
            }
        } else {
            throw new Error('Неверный формат VMess ссылки');
        }
    }
    
    const server = params.add || params.address || params.host;
    const port = parseInt(params.port, 10);
    const name = params.ps || params.remarks || params.remark || `VMess ${server}:${port}`;
    
    const proxy = {
        type: "vmess",
        name: name,
        server: server,
        port: port,
        uuid: params.id,
        alterId: parseInt(params.aid || params.alterId || 0, 10),
        cipher: params.scy || "auto",
        tls: params.tls === "tls" || params.tls === "1" || params.tls === 1,
        "skip-cert-verify": params.allowInsecure === "1" || params.allowInsecure === "true",
        network: params.net || "tcp",
        "ws-opts": {
            "v2ray-http-upgrade": false,
            "v2ray-http-upgrade-fast-open": false
        },
        "http-opts": {},
        "grpc-opts": {}
    };
    
    if (params.sni) {
        proxy.servername = params.sni;
    }
    
    // Обработка типа сети
    if (params.net === "httpupgrade") {
        proxy.network = "ws";
        proxy["ws-opts"]["v2ray-http-upgrade"] = true;
        proxy["ws-opts"]["v2ray-http-upgrade-fast-open"] = true;
    } else if (proxy.network === "ws") {
        proxy["ws-opts"].path = params.path || "/";
        proxy["ws-opts"].headers = {};
        
        if (params.host) {
            try {
                proxy["ws-opts"].headers = JSON.parse(params.host);
            } catch (e) {
                proxy["ws-opts"].headers.Host = params.host;
            }
        }
    } else if (proxy.network === "http") {
        proxy["http-opts"] = {
            path: params.path ? [params.path] : ["/"],
            headers: {
                Host: params.host ? [params.host] : []
            }
        };
    } else if (proxy.network === "grpc") {
        proxy["grpc-opts"] = {
            "grpc-service-name": params.path || ""
        };
    }
    
    return proxy;
}

function parseShadowsocksUri(line) {
    line = line.split('ss://')[1];
    let [userinfo, serverInfo] = line.split('@');
    let [server, port] = serverInfo.split(':');
    port = parseInt(port, 10);
    
    // Декодируем userinfo (может быть в base64)
    try {
        userinfo = atob(userinfo);
    } catch (e) {
        // Если не base64, оставляем как есть
    }
    
    let [method, password] = userinfo.split(':');
    const name = decodeURIComponent(line.split('#')[1] || `Shadowsocks ${server}:${port}`);
    
    const proxy = {
        type: "ss",
        name: name,
        server: server,
        port: port,
        cipher: method,
        password: password
    };
    
    // Обработка параметров плагина (если есть)
    if (line.includes('?plugin=')) {
        const pluginStr = decodeURIComponent(line.split('?plugin=')[1].split('#')[0]);
        const pluginParts = pluginStr.split(';');
        
        if (pluginParts[0].includes('obfs')) {
            proxy.plugin = "obfs";
            proxy["plugin-opts"] = {
                mode: pluginParts.find(p => p.startsWith('obfs='))?.split('=')[1] || "http",
                host: pluginParts.find(p => p.startsWith('obfs-host='))?.split('=')[1] || ""
            };
        } else if (pluginParts[0].includes('v2ray-plugin')) {
            proxy.plugin = "v2ray-plugin";
            proxy["plugin-opts"] = {
                mode: "websocket",
                host: pluginParts.find(p => p.startsWith('host='))?.split('=')[1] || "",
                path: pluginParts.find(p => p.startsWith('path='))?.split('=')[1] || "/",
                tls: pluginParts.includes('tls')
            };
        }
    }
    
    return proxy;
}

function parseTrojanUri(line) {
    line = line.split('trojan://')[1];
    let [__, password, server, ___, port, ____, addons = "", name] =
        /^(.*?)@(.*?)(:(\d+))?\/?(\?(.*?))?(?:#(.*?))?$/.exec(line) || [];

    let portNum = parseInt(`${port}`, 10);
    if (isNaN(portNum)) {
        portNum = 443;
    }

    password = decodeURIComponent(password);
    const decodedName = decodeURIComponent(name || '').trim();

    const proxy = {
        type: "trojan",
        name: decodedName || `Trojan ${server}:${portNum}`,
        server: server,
        port: portNum,
        password: password,
        "skip-cert-verify": false,
        sni: "",
        alpn: [],
        network: "tcp",
        "grpc-opts": {},
        "ws-opts": {
            "v2ray-http-upgrade": false,
            "v2ray-http-upgrade-fast-open": false
        }
    };

    // Обработка параметров
    if (addons) {
        const paramsStr = addons.split('#')[0];
        for (const param of paramsStr.split('&')) {
            const [key, value] = param.split('=');
            const decodedValue = decodeURIComponent(value || '');
            
            switch (key) {
                case 'allowInsecure':
                case 'allow_insecure':
                    proxy["skip-cert-verify"] = decodedValue === '1' || decodedValue === 'true';
                    break;
                case 'sni':
                case 'peer':
                    proxy.sni = decodedValue;
                    break;
                case 'type':
                    if (decodedValue === 'httpupgrade') {
                        proxy.network = 'ws';
                        proxy["ws-opts"]["v2ray-http-upgrade"] = true;
                        proxy["ws-opts"]["v2ray-http-upgrade-fast-open"] = true;
                    } else {
                        proxy.network = decodedValue;
                    }
                    break;
                case 'host':
                    if (proxy.network === 'ws') {
                        proxy["ws-opts"].headers = proxy["ws-opts"].headers || {};
                        proxy["ws-opts"].headers.Host = decodedValue;
                    }
                    break;
                case 'path':
                    if (proxy.network === 'ws') {
                        proxy["ws-opts"].path = decodedValue;
                    }
                    break;
                case 'alpn':
                    proxy.alpn = decodedValue.split(',');
                    break;
                case 'fp':
                case 'fingerprint':
                    proxy["client-fingerprint"] = decodedValue;
                    break;
            }
        }
    }
    
    return proxy;
}

function generateHysteria2Config(proxy) {
  let config = `proxies:
- name: "${proxy.name.replace(/'/g, "''")}"
  type: ${proxy.type}
  server: '${proxy.server}'
  port: ${proxy.port}
  password: '${proxy.password}'`;

  if (proxy.sni) {
    config += `
  sni: '${proxy.sni}'`;
  }

  if (proxy.obfs) {
    config += `
  obfs: '${proxy.obfs}'`;
    if (proxy["obfs-password"]) {
      config += `
  obfs-password: '${proxy["obfs-password"]}'`;
    }
  }

  if (proxy.alpn && proxy.alpn.length > 0) {
    config += `
  alpn:`;
    proxy.alpn.forEach(a => {
      config += `
    - '${a}'`;
    });
  }

  if (proxy.up) {
    config += `
  up: '${proxy.up}'`;
  }

  if (proxy.down) {
    config += `
  down: '${proxy.down}'`;
  }

  if (proxy.ports) {
    config += `
  ports: '${proxy.ports}'`;
  }

  config += `
  skip-cert-verify: ${proxy["skip-cert-verify"] !== undefined ? proxy["skip-cert-verify"] : true}
  tfo: ${proxy.tfo || false}`;

  if (proxy.fingerprint) {
    config += `
  fingerprint: '${proxy.fingerprint}'`;
  }

  config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

  return config;
}

function generateVmessConfig(proxy) {
  let config = `proxies:
- name: "${proxy.name.replace(/'/g, "''")}"
  type: ${proxy.type}
  server: '${proxy.server}'
  port: ${proxy.port}
  uuid: '${proxy.uuid}'
  udp: true
  alterId: ${proxy.alterId || 0}
  cipher: '${proxy.cipher || "auto"}'`;

  if (proxy.tls) {
    config += `
  tls: true`;
  }
  if (proxy.servername) {
    config += `
  servername: '${proxy.servername}'`;
  }
  if (proxy["skip-cert-verify"] !== undefined) {
    config += `
  skip-cert-verify: ${proxy["skip-cert-verify"]}`;
  }
  if (proxy.network) {
    config += `
  network: '${proxy.network}'`;
  }

  // Генерация ws-opts с поддержкой http-upgrade
  if (proxy.network === 'ws' && proxy["ws-opts"]) {
    config += `
  ws-opts:`;
    if (proxy["ws-opts"].path) {
      config += `
    path: '${proxy["ws-opts"].path}'`;
    }
    if (proxy["ws-opts"].headers && Object.keys(proxy["ws-opts"].headers).length > 0) {
      config += `
    headers:`;
      for (const [key, value] of Object.entries(proxy["ws-opts"].headers)) {
        config += `
      ${key}: '${value}'`;
      }
    }
    if (proxy["ws-opts"]["v2ray-http-upgrade"]) {
      config += `
    v2ray-http-upgrade: true`;
    }
    if (proxy["ws-opts"]["v2ray-http-upgrade-fast-open"]) {
      config += `
    v2ray-http-upgrade-fast-open: true`;
    }
  } else if (proxy.network === 'grpc' && proxy["grpc-opts"]) {
    config += `
  grpc-opts:
    grpc-service-name: '${proxy["grpc-opts"]["grpc-service-name"] || ""}'`;
  }

  config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

  return config;
}

function generateShadowsocksConfig(proxy) {
  let config = `proxies:
- name: "${proxy.name.replace(/'/g, "''")}"
  type: ${proxy.type}
  server: '${proxy.server}'
  port: ${proxy.port}
  cipher: '${proxy.cipher}'
  password: '${proxy.password}'
  udp: true`;

  if (proxy.plugin) {
    config += `
  plugin: '${proxy.plugin}'`;
    if (proxy["plugin-opts"]) {
      config += `
  plugin-opts:`;
      for (const [key, value] of Object.entries(proxy["plugin-opts"])) {
        if (typeof value === 'string') {
          config += `
    ${key}: '${value}'`;
        } else if (typeof value === 'boolean') {
          config += `
    ${key}: ${value}`;
        }
      }
    }
  }

  config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

  return config;
}

function generateTrojanConfig(proxy) {
  let config = `proxies:
- name: "${proxy.name.replace(/'/g, "''")}"
  type: ${proxy.type}
  server: '${proxy.server}'
  port: ${proxy.port}
  password: '${proxy.password}'
  udp: true`;

  if (proxy.tls !== false) {
    config += `
  tls: true`;
  }
  if (proxy.sni) {
    config += `
  servername: '${proxy.sni}'`;
  }
  if (proxy["skip-cert-verify"] !== undefined) {
    config += `
  skip-cert-verify: ${proxy["skip-cert-verify"]}`;
  }
  if (proxy["client-fingerprint"]) {
    config += `
  client-fingerprint: '${proxy["client-fingerprint"]}'`;
  }
  if (proxy.alpn && proxy.alpn.length > 0) {
    config += `
  alpn:`;
    proxy.alpn.forEach(a => {
      config += `
    - '${a}'`;
    });
  }
  if (proxy.network && proxy.network !== 'tcp') {
    config += `
  network: '${proxy.network}'`;
  }

  // Генерация ws-opts с поддержкой http-upgrade
  if (proxy.network === 'ws' && proxy["ws-opts"]) {
    config += `
  ws-opts:`;
    if (proxy["ws-opts"].path) {
      config += `
    path: '${proxy["ws-opts"].path}'`;
    }
    if (proxy["ws-opts"].headers && Object.keys(proxy["ws-opts"].headers).length > 0) {
      config += `
    headers:`;
      for (const [key, value] of Object.entries(proxy["ws-opts"].headers)) {
        config += `
      ${key}: '${value}'`;
      }
    }
    if (proxy["ws-opts"]["v2ray-http-upgrade"]) {
      config += `
    v2ray-http-upgrade: true`;
    }
    if (proxy["ws-opts"]["v2ray-http-upgrade-fast-open"]) {
      config += `
    v2ray-http-upgrade-fast-open: true`;
    }
  } else if (proxy.network === 'grpc' && proxy["grpc-opts"]) {
    config += `
  grpc-opts:
    grpc-service-name: '${proxy["grpc-opts"]["grpc-service-name"] || ""}'`;
  }

  config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

  return config;
}

function generateVlessConfig(proxy) {
  let config = `proxies:
- name: "${proxy.name.replace(/'/g, "''")}"
  type: ${proxy.type}
  server: '${proxy.server}'
  port: ${proxy.port}
  uuid: '${proxy.uuid}'
  udp: true`;

  if (proxy.tls) {
    config += `
  tls: true`;
  }
  if (proxy.sni) {
    config += `
  servername: '${proxy.sni}'`;
  }
  if (proxy.flow) {
    config += `
  flow: '${proxy.flow}'`;
  }
  if (proxy.encryption) {
    config += `
  encryption: '${proxy.encryption}'`;
  }
  if (proxy['skip-cert-verify'] !== undefined) {
    config += `
  skip-cert-verify: ${proxy['skip-cert-verify']}`;
  }
  if (proxy['client-fingerprint']) {
    config += `
  client-fingerprint: '${proxy['client-fingerprint']}'`;
  }
  if (proxy.alpn && proxy.alpn.length > 0) {
    config += `
  alpn:`;
    proxy.alpn.forEach(a => {
      config += `
    - '${a}'`;
    });
  }
  if (proxy['packet-addr']) {
    config += `
  packet-addr: true`;
  } else if (proxy.xudp) {
    config += `
  xudp: true`;
  }
  if (proxy.network) {
    config += `
  network: '${proxy.network}'`;
  }

  if (proxy['reality-opts'] && (proxy['reality-opts']['public-key'] || proxy['reality-opts']['short-id'])) {
    config += `
  reality-opts:`;
    if (proxy['reality-opts']['public-key']) {
      config += `
    public-key: '${proxy['reality-opts']['public-key']}'`;
    }
    if (proxy['reality-opts']['short-id']) {
      config += `
    short-id: '${proxy['reality-opts']['short-id']}'`;
    }
  }

  // ws-opts
  if (proxy.network === 'ws' && proxy['ws-opts']) {
    config += `
  ws-opts:`;
    if (proxy['ws-opts'].path) {
      config += `
    path: '${proxy['ws-opts'].path}'`;
    }
    if (proxy['ws-opts'].headers && Object.keys(proxy['ws-opts'].headers).length > 0) {
      config += `
    headers:`;
      for (const [key, value] of Object.entries(proxy['ws-opts'].headers)) {
        config += `
      ${key}: '${value}'`;
      }
    }
    if (proxy['ws-opts']['max-early-data']) {
      config += `
    max-early-data: ${proxy['ws-opts']['max-early-data']}`;
    }
    if (proxy['ws-opts']['early-data-header-name']) {
      config += `
    early-data-header-name: '${proxy['ws-opts']['early-data-header-name']}'`;
    }
    if (proxy['ws-opts']['v2ray-http-upgrade']) {
      config += `
    v2ray-http-upgrade: true`;
    }
    if (proxy['ws-opts']['v2ray-http-upgrade-fast-open']) {
      config += `
    v2ray-http-upgrade-fast-open: true`;
    }
  }

  if (proxy.network === 'grpc' && proxy['grpc-opts'] && proxy['grpc-opts']['grpc-service-name']) {
    config += `
  grpc-opts:
    grpc-service-name: '${proxy['grpc-opts']['grpc-service-name']}'`;
  }

  // xhttp-opts
  if (proxy.network === 'xhttp' && proxy['xhttp-opts']) {
    const xo = proxy['xhttp-opts'];
    config += `\n  xhttp-opts:`;
    if (xo.path)               config += `\n    path: '${xo.path}'`;
    if (xo.host)               config += `\n    host: '${xo.host}'`;
    if (xo.mode)               config += `\n    mode: '${xo.mode}'`;
    if (xo['no-grpc-header'])  config += `\n    no-grpc-header: true`;
    if (xo['x-padding-bytes']) config += `\n    x-padding-bytes: '${xo['x-padding-bytes']}'`;
    if (xo['reuse-settings'] && typeof xo['reuse-settings'] === 'object') {
      config += `\n    reuse-settings:`;
      for (const [k, v] of Object.entries(xo['reuse-settings']))
        config += `\n      ${k}: ${v}`;
    }
    if (xo['download-settings'] && typeof xo['download-settings'] === 'object') {
      const ds = xo['download-settings'];
      config += `\n    download-settings:`;
      if (ds.server)                config += `\n      server: '${ds.server}'`;
      if (ds.port != null)          config += `\n      port: ${ds.port}`;
      if (ds.tls)                   config += `\n      tls: true`;
      if (ds.servername)            config += `\n      servername: '${ds.servername}'`;
      if (ds['client-fingerprint']) config += `\n      client-fingerprint: '${ds['client-fingerprint']}'`;
      if (Array.isArray(ds.alpn) && ds.alpn.length > 0) {
        config += `\n      alpn:`;
        for (const a of ds.alpn) config += `\n        - ${a}`;
      }
      if (ds.path)               config += `\n      path: '${ds.path}'`;
      if (ds.host)               config += `\n      host: '${ds.host}'`;
      if (ds['no-grpc-header'])  config += `\n      no-grpc-header: true`;
      if (ds['x-padding-bytes']) config += `\n      x-padding-bytes: '${ds['x-padding-bytes']}'`;
      if (ds['reuse-settings'] && typeof ds['reuse-settings'] === 'object') {
        config += `\n      reuse-settings:`;
        for (const [k, v] of Object.entries(ds['reuse-settings']))
          config += `\n        ${k}: ${v}`;
      }
    }
  }

  config += `\n\nproxy-groups:
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    - "${proxy.name.replace(/'/g, "''")}"

- name: auto
  proxies:
    - "${proxy.name.replace(/'/g, "''")}"
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true`;

  return config;
}

function generateMultiProxyConfig(proxies) {
    let config = 'proxies:';
    
    // Добавляем все прокси
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        let proxyConfig;
        switch (proxy.type) {
            case 'vless':
                proxyConfig = generateVlessConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'vmess':
                proxyConfig = generateVmessConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'ss':
                proxyConfig = generateShadowsocksConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'trojan':
                proxyConfig = generateTrojanConfig(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
            case 'hysteria2':
                proxyConfig = generateHysteria2Config(proxy).split('proxies:')[1].split('proxy-groups:')[0];
                break;
        }
        
        // Убираем только одну лишнюю пустую строку в конце
        proxyConfig = proxyConfig.replace(/\n+$/, '');
        
        // Добавляем с правильным отступом
        config += (i === 0 ? '' : '\n') + proxyConfig;
    }

    // Собираем все имена прокси для групп
    const proxyNames = proxies.map(p => p.name.replace(/'/g, "''"));
    
    // Добавляем proxy-groups с правильным форматированием
    config += `\n\nproxy-groups: 
- name: PROXY
  type: select
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  icon: https://i.imgur.com/B3HrpPC.png
  proxies:
    - auto
    ${proxyNames.map(name => `- "${name}"`).join('\n    ')}

- name: auto
  type: url-test
  url: http://cp.cloudflare.com/generate_204
  expected-status: 204
  interval: 300
  tolerance: 150
  lazy: true
  proxies:
    ${proxyNames.map(name => `- "${name}"`).join('\n    ')}`;

    return config;
