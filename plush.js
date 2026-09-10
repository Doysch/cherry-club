/* Cherry Club – plushie collection, bows and shelf */
'use strict';

// Original plush characters. Drop a PNG at images/<id>.png to replace the emoji with your own picture.
const PLUSH = [
  { id:'bunny',    name:'Bramble Bunny',    emoji:'🐰', cost:0,   table:3 },
  { id:'bear',     name:'Barnaby Bear',     emoji:'🐻', cost:0,   table:4 },
  { id:'octopus',  name:'Ottilie Octopus',  emoji:'🐙', cost:0,   table:6 },
  { id:'avocado',  name:'Ava Avocado',      emoji:'🥑', cost:0,   table:7 },
  { id:'cherries', name:'The Cherry Twins', emoji:'🍒', cost:0,   table:12 },
  { id:'frog',     name:'Fig the Frog',     emoji:'🐸', cost:40 },
  { id:'sheep',    name:'Sorrel Sheep',     emoji:'🐑', cost:45 },
  { id:'penguin',  name:'Pip Penguin',      emoji:'🐧', cost:50 },
  { id:'puppy',    name:'Poppy Puppy',      emoji:'🐶', cost:55 },
  { id:'kitten',   name:'Clementine Cat',   emoji:'🐱', cost:55 },
  { id:'strawberry',name:'Sunny Strawberry',emoji:'🍓', cost:60 },
  { id:'croissant',name:'Crumbs Croissant', emoji:'🥐', cost:60 },
  { id:'koala',    name:'Kit Koala',        emoji:'🐨', cost:70 },
  { id:'fox',      name:'Fern Fox',         emoji:'🦊', cost:75 },
  { id:'turtle',   name:'Tilly Turtle',     emoji:'🐢', cost:80 },
  { id:'cactus',   name:'Cosmo Cactus',     emoji:'🌵', cost:85 },
  { id:'moon',     name:'Luna Moon',        emoji:'🌙', cost:90 },
  { id:'dino',     name:'Dotty Dino',       emoji:'🦕', cost:100 },
  { id:'elephant', name:'Elsie Elephant',   emoji:'🐘', cost:110 },
  { id:'mushroom', name:'Maple Mushroom',   emoji:'🍄', cost:120 },
  { id:'whale',    name:'Winnie Whale',     emoji:'🐳', cost:140 },
  { id:'peach',    name:'Pippa Peach',      emoji:'🍑', cost:150 },
];

const BOWS = [
  { id:'none',    name:'No bow',        cost:0,  colour:null },
  { id:'red',     name:'Cherry red',    cost:0,  colour:'#e63950' },
  { id:'pink',    name:'Blush pink',    cost:15, colour:'#ff9fbf' },
  { id:'cream',   name:'Cream',         cost:15, colour:'#fff1cf' },
  { id:'sage',    name:'Sage',          cost:20, colour:'#9fc9a3' },
  { id:'sky',     name:'Sky blue',      cost:20, colour:'#8fd0ff' },
  { id:'lilac',   name:'Lilac',         cost:20, colour:'#c9a7ff' },
  { id:'gingham', name:'Gingham',       cost:35, colour:'gingham' },
  { id:'polka',   name:'Polka dot',     cost:35, colour:'polka' },
  { id:'gold',    name:'Golden bow',    cost:0,  colour:'#f2c14e', locked:'Complete a whole table to unlock' },
];

function bowSVG(bow, size = 28) {
  if (!bow || !bow.colour) return '';
  const uid = 'b' + Math.floor(Math.random() * 1e9);
  let fill = bow.colour, defs = '';
  if (bow.colour === 'gingham') {
    defs = `<pattern id="${uid}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><rect width="3" height="3" fill="#e63950"/><rect x="3" y="3" width="3" height="3" fill="#e63950"/><rect x="3" width="3" height="3" fill="#f7a3b0"/><rect y="3" width="3" height="3" fill="#f7a3b0"/></pattern>`;
    fill = `url(#${uid})`;
  } else if (bow.colour === 'polka') {
    defs = `<pattern id="${uid}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e63950"/><circle cx="3" cy="3" r="1.3" fill="#fff"/></pattern>`;
    fill = `url(#${uid})`;
  }
  return `<svg class="bow" width="${size}" height="${size * 0.7}" viewBox="0 0 40 28"><defs>${defs}</defs>
    <path d="M20 14 C14 4 2 2 2 10 C2 18 14 22 20 14 Z" fill="${fill}" stroke="#a82238" stroke-width="1.2"/>
    <path d="M20 14 C26 4 38 2 38 10 C38 18 26 22 20 14 Z" fill="${fill}" stroke="#a82238" stroke-width="1.2"/>
    <path d="M17 15 L13 27 L18 24 Z M23 15 L27 27 L22 24 Z" fill="${fill}" stroke="#a82238" stroke-width="1"/>
    <circle cx="20" cy="14" r="3.5" fill="${fill}" stroke="#a82238" stroke-width="1.2"/></svg>`;
}

function plushArt(p, cls = '') {
  // <img> with emoji fallback if images/<id>.png is missing
  return `<span class="plush-art ${cls}"><img src="images/${p.id}.png" alt="" onerror="this.remove()"><span class="emoji">${p.emoji}</span></span>`;
}

function renderShelf(ownedIds, bowsById, selectedId) {
  const owned = PLUSH.filter(p => ownedIds.includes(p.id));
  if (!owned.length) return '<div class="shelf-empty">Your shelf is empty – earn cherries to adopt a plushie!</div>';
  const rows = [];
  for (let i = 0; i < owned.length; i += 4) {
    const items = owned.slice(i, i + 4).map(p => {
      const bow = BOWS.find(b => b.id === (bowsById[p.id] || 'none'));
      return `<button class="shelf-plush ${p.id === selectedId ? 'selected' : ''}" data-plush="${p.id}" title="${p.name}">${plushArt(p)}${bowSVG(bow)}<span class="plush-name">${p.name}</span></button>`;
    }).join('');
    rows.push(`<div class="shelf-row"><div class="shelf-items">${items}</div><div class="shelf-board"></div></div>`);
  }
  return rows.join('');
}
