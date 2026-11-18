'use strict';
const items=[
{id:'cocktail',name:'Mesas altas y butacas',cat:'Mobiliario',desc:'Conjuntos para zonas cocktail. Confirmá la combinación que necesitás.'},
{id:'lounge',name:'Juegos lounge',cat:'Mobiliario',desc:'Un espacio de conversación y descanso para tu encuentro.'},
{id:'sillas',name:'Sillas para eventos',cat:'Mobiliario',desc:'Disposición para reuniones y auditorios. Consultá los modelos.'},
{id:'mesas',name:'Mesas para eventos',cat:'Mobiliario',desc:'Mesas para reuniones y banquetes. Indicá las medidas que buscás.'},
{id:'stands',name:'Stands',cat:'Stands',desc:'Espacios de presencia de marca. El alcance se evalúa por proyecto.'},
{id:'tecnica',name:'Pantallas LED',cat:'Producción',desc:'Consultá tamaños, contenidos y condiciones técnicas.'},
{id:'sonido',image:'tecnica',name:'Sonido para eventos',cat:'Producción',desc:'La configuración se evalúa según el lugar y los asistentes.'},
{id:'tarimas',image:'tecnica',name:'Tarimas',cat:'Producción',desc:'Indicá dimensiones y uso para consultar por el montaje.'}
];
const key='ralquileres-seleccion-v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cart={};
try{const saved=JSON.parse(localStorage.getItem(key));for(const item of items){const n=Number(saved?.[item.id]);if(Number.isInteger(n)&&n>0&&n<=999)cart[item.id]=n;}}catch{}
let selectedFilter=new URLSearchParams(location.search).get('categoria')||'';
if(!['Mobiliario','Stands','Producción'].includes(selectedFilter))selectedFilter='';
let timer;
function notify(message){clearTimeout(timer);$('#toast').textContent=message;$('#toast').hidden=false;timer=setTimeout(()=>$('#toast').hidden=true,2600);}
function persist(){
try{localStorage.setItem(key,JSON.stringify(cart));}catch{notify('La selección se conserva durante esta visita.');}
renderSelection();if($('#message-preview'))$('#message-preview').hidden=true;
}
function renderSelection(){
$('#count').textContent=Object.values(cart).reduce((a,b)=>a+b,0);
const box=$('#selection');if(!box)return;
box.innerHTML=Object.keys(cart).length?items.filter(i=>cart[i.id]).map(i=>`<div class="selected-item"><strong>${i.name}</strong><div class="selected-controls"><button type="button" data-minus="${i.id}" aria-label="Quitar una unidad de ${i.name}">−</button><span>${cart[i.id]}</span><button type="button" data-plus="${i.id}" aria-label="Sumar una unidad de ${i.name}">+</button><button class="remove" type="button" data-remove="${i.id}" aria-label="Eliminar ${i.name}">Quitar</button></div></div>`).join(''):'<p class="selection-empty">Tu selección está vacía. Podés elegir piezas del catálogo o consultar directamente por tu evento.</p>';
}
function renderProducts(){
if(!$('#products'))return;
const term=($('#search').value||'').toLocaleLowerCase('es');
const visible=items.filter(i=>(!selectedFilter||i.cat===selectedFilter)&&(i.name+' '+i.desc).toLocaleLowerCase('es').includes(term));
$('#products').innerHTML=visible.map(i=>`<article class="product"><div class="product-image"><img src="${i.image||i.id}.webp" alt="Imagen ilustrativa de ${i.name.toLowerCase()}" loading="lazy"><span class="product-type">${i.cat}</span></div><div class="product-copy"><h3>${i.name}</h3><p>${i.desc}</p><div class="product-bottom"><label><span class="sr">Cantidad de ${i.name}</span><input class="qty" id="qty-${i.id}" type="number" min="1" max="999" step="1" value="1"></label><button class="button dark" type="button" data-add="${i.id}">Agregar <span>+</span></button></div></div></article>`).join('');
$('#empty-products').hidden=Boolean(visible.length);
document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(selectedFilter===b.dataset.filter)));
}
document.addEventListener('click',e=>{
const button=e.target.closest('button');if(!button)return;
const {add,minus,plus,remove,filter}=button.dataset;
if(filter!==undefined){selectedFilter=filter;renderProducts();}
if(add){
const input=$('#qty-'+add);input.setCustomValidity('');
const count=Number(input.value);
if(!Number.isInteger(count)||count<1||count>999||count+(cart[add]||0)>999){input.setCustomValidity('Usá una cantidad entre 1 y 999 por pieza.');input.reportValidity();return;}
cart[add]=(cart[add]||0)+count;persist();notify('Agregado a tu selección.');
}
if(minus){if(cart[minus]>1)cart[minus]--;else delete cart[minus];persist();}
if(plus){if(cart[plus]<999){cart[plus]++;persist();}else notify('Máximo de 999 unidades por pieza.');}
if(remove){delete cart[remove];persist();}
const photo=button.dataset.photo;if(photo){$('#lightbox-image').src=photo;$('#lightbox-image').alt=button.dataset.title;$('#lightbox-title').textContent=button.dataset.title;$('#lightbox').showModal();}
});
$('#search')?.addEventListener('input',renderProducts);
$('#products')?.addEventListener('input',e=>e.target.setCustomValidity?.(''));
const menu=$('#menu'),nav=$('#nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
$('#close-lightbox').addEventListener('click',()=>$('#lightbox').close());
const form=$('#quote-form');
if(form){
const date=form.elements.namedItem('fecha');date.min=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Asuncion'}).format(new Date());
form.addEventListener('input',()=>{$('#message-preview').hidden=true;form.elements.namedItem('nombre').setCustomValidity('');form.elements.namedItem('lugar').setCustomValidity('');});
form.addEventListener('submit',e=>{
e.preventDefault();const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,v.trim()]));
for(const field of ['nombre','lugar']){if(!data[field]){form.elements.namedItem(field).setCustomValidity('Completá este campo.');form.reportValidity();return;}}
const lines=['Hola, R’ Alquileres. Quisiera consultar por un evento.','Nombre: '+data.nombre,'Tipo de evento: '+data.tipo,'Lugar: '+data.lugar];
if(data.fecha)lines.push('Fecha: '+data.fecha.split('-').reverse().join('/'));
if(data.personas)lines.push('Invitados: '+data.personas);
const chosen=items.filter(i=>cart[i.id]);
if(chosen.length){lines.push('','Mi selección:');chosen.forEach(i=>lines.push(cart[i.id]+' × '+i.name));}else lines.push('Necesito orientación sobre mobiliario o producción.');
if(data.notas)lines.push('','Detalles: '+data.notas);
lines.push('','¿Me podrían confirmar opciones y disponibilidad? Gracias.');
const message=lines.join('\n');$('#message').textContent=message;$('#whatsapp').href='https://wa.me/595982736593?text='+encodeURIComponent(message);$('#message-preview').hidden=false;$('#message-preview').scrollIntoView({block:'nearest'});$('#whatsapp').focus({preventScroll:true});
});
}
window.addEventListener('storage',e=>{if(e.key===key)location.reload();});
renderSelection();renderProducts();
