'use strict';
// A single rounded stroke family. Flags remain flags; animals remain illustrations.
function uiIcon(name){const paths={
home:'<path d="M3 10.5L12 3l9 7.5V21h-6v-7H9v7H3z"/>',
leaf:'<path d="M20 4C9 2 3 7 4 14c1 7 12 8 15-1 1-3 1-6 1-9Z"/><path d="M5 20L16 9M11 14V9M11 14h5"/>',
book:'<path d="M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/><path d="M12 5v15"/>',
globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
chart:'<path d="M4 4v16h17M8 15v-3M13 15V8M18 15V5"/>',
puzzle:'<path d="M4 4h5V3a3 3 0 0 1 6 0v1h5v5h-1a3 3 0 0 0 0 6h1v5h-5v-1a3 3 0 0 0-6 0v1H4v-5h1a3 3 0 0 0 0-6H4z"/>',
heart:'<path d="M12 21L3.8 13a5.5 5.5 0 0 1 8.2-7 5.5 5.5 0 0 1 8.2 7Z"/>',
star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/>',
check:'<path d="m5 12 4 4L19 6"/>',
arrow:'<path d="M4 12h16M14 6l6 6-6 6"/>',
arrowUp:'<path d="M5 19 19 5M5 5h14v14"/>',
speaker:'<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
robot:'<rect x="4" y="6" width="16" height="15" rx="5"/><path d="M12 2v4M1 11v5M23 11v5M9 16h6"/><circle cx="8" cy="11" r="1"/><circle cx="16" cy="11" r="1"/>',
trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3c0 3 2 5 5 5M17 5h4v3c0 3-2 5-5 5M12 15v6M8 21h8"/>',
light:'<path d="M9 18h6M9 21h6M8 14a7 7 0 1 1 8 0l-1 2H9Z"/>',
mountain:'<path d="M2 21 9 5l5 9 3-6 5 13ZM6 12l3 2 3-3"/>',
building:'<path d="M3 21h18M4 8h16L12 2ZM6 11v7M12 11v7M18 11v7M3 18h18"/>',
flower:'<path d="M12 22v-7M12 19c-4 0-6-1-6-4 4 0 6 1 6 4M12 21c4 0 6-1 6-4-4 0-6 1-6 4"/><path d="M9 4c-1-4 7-4 6 0 4-2 7 5 3 6 3 4-4 8-6 4-2 4-9 0-6-4C2 9 5 2 9 4Z"/>',
seed:'<path d="M12 21V9M12 14C3 15 2 10 3 6c7-1 10 2 9 8ZM12 10c0-7 5-9 9-8 0 6-3 9-9 8Z"/>',
};return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.leaf}</svg>`}
const uiSymbols={'⌂':'home','⚡':'leaf','🌍':'globe','🌎':'globe','◴':'chart','🌱':'seed','🌻':'flower','🌳':'leaf','✦':'star','✧':'star','🌟':'star','✨':'star','🧩':'puzzle','💛':'heart','❤️':'heart','♡':'heart','🎮':'robot','🤖':'robot','🔒':'lock','🔊':'speaker','♫':'speaker','♪':'speaker','⏳':'clock','🏆':'trophy','🥇':'trophy','🥈':'trophy','🥉':'trophy','💡':'light','📌':'book','✓':'check','→':'arrow','↗':'arrowUp','⛰️':'mountain','🗻':'mountain','🗼':'building','🔺':'mountain','🎭':'building','🗽':'building','🏛️':'building','🕌':'building','🕰️':'clock'};
const symbolPattern=new RegExp(Object.keys(uiSymbols).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
function polishSymbols(){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;const nodes=[];while(node=walker.nextNode()){if(node.parentElement?.closest('svg,script,style,textarea,option,input,.ui-symbol'))continue;symbolPattern.lastIndex=0;if(symbolPattern.test(node.nodeValue))nodes.push(node)}for(const n of nodes){const fragment=document.createDocumentFragment(),text=n.nodeValue;let at=0;symbolPattern.lastIndex=0;for(const m of text.matchAll(symbolPattern)){fragment.append(document.createTextNode(text.slice(at,m.index)));const span=document.createElement('span');span.className='ui-symbol';span.setAttribute('aria-hidden','true');span.innerHTML=uiIcon(uiSymbols[m[0]]);fragment.append(span);at=m.index+m[0].length}fragment.append(document.createTextNode(text.slice(at)));n.replaceWith(fragment)}}
let polishQueued=false;const polishObserver=new MutationObserver(()=>{if(polishQueued)return;polishQueued=true;queueMicrotask(()=>{polishQueued=false;polishSymbols()})});polishObserver.observe(document.body,{childList:true,subtree:true});polishSymbols();
