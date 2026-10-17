// 1. Page elements and state: these references are shared by the handlers below.
const grid = document.querySelector('#template-grid');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const storageKey = 'forma-library-templates-v1';
let activeFilter = 'all';
let toastTimer;

// Keep the date labels current instead of baking a date into the HTML.
document.querySelector('.welcome-row .eyebrow').innerHTML = `<span class="eyebrow-line"></span>${new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()}`;
document.querySelector('.page-footer span:last-child').innerHTML = `FORMA LIBRARY <i>✳</i> ${new Date().getFullYear()}`;

// 2. Local library storage: additions, favorites, and links stay on this browser.
function readLibrary() {
	try { return JSON.parse(localStorage.getItem(storageKey) || '{"templates":[],"favorites":{}}'); }
	catch { return { templates: [], favorites: {} }; }
}

function writeLibrary() {
	try {
		const templates = [...grid.querySelectorAll('.new-template-card')].map((card) => ({
			id: card.dataset.id,
			name: card.dataset.name,
			category: card.dataset.category,
			format: card.dataset.format,
			url: card.dataset.url || '',
			date: card.dataset.date,
			favorite: card.dataset.favorite === 'true'
		}));
		const builtInCards = [...grid.querySelectorAll('.template-card:not(.new-template-card)')];
		const favorites = Object.fromEntries(builtInCards.map((card) => [card.dataset.id, card.dataset.favorite === 'true']));
		const links = Object.fromEntries(builtInCards.filter((card) => card.dataset.url).map((card) => [card.dataset.id, card.dataset.url]));
		localStorage.setItem(storageKey, JSON.stringify({ templates, favorites, links }));
	} catch { showToast('Browser storage is unavailable for this page.'); }
}

// Build the same card structure for every template added through the form.
function createTemplateCard(template) {
	const safeName = template.name.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
	const categoryNames = { social: 'SOCIAL & CONTENT', business: 'BUSINESS', lifestyle: 'LIFESTYLE', planning: 'PLANNING' };
	const typeClass = { Notion: 'type-notion', Canva: 'type-canva', Figma: 'type-figma', PDF: 'type-pdf' }[template.format] || 'type-pdf';
	const card = document.createElement('article');
	card.className = 'template-card new-template-card';
	card.dataset.id = template.id;
	card.dataset.category = template.category;
	card.dataset.name = template.name;
	card.dataset.format = template.format;
	card.dataset.url = template.url || '';
	card.dataset.date = String(template.date);
	card.dataset.favorite = String(Boolean(template.favorite));
	card.innerHTML = `<button class="favorite-button${template.favorite ? ' is-favorite' : ''}" aria-label="${template.favorite ? 'Remove' : 'Add'} ${safeName} ${template.favorite ? 'from' : 'to'} favorites" aria-pressed="${Boolean(template.favorite)}">${template.favorite ? '♥' : '♡'}</button><button class="preview-button new-preview" aria-label="Preview ${safeName}"><span class="new-preview-label">NEW IN YOUR<br>LIBRARY<span>✳</span></span></button><div class="template-meta"><div><span class="template-category">${categoryNames[template.category] || 'TEMPLATE'}</span><h3></h3></div><button class="more-button" aria-label="More options for ${safeName}">···</button></div><div class="template-footer"><span class="file-type"><i class="type-dot ${typeClass}"></i>${template.format}</span><span>Added to library</span></div>`;
	card.querySelector('h3').textContent = template.name;
	return card;
}

// Restore saved browser data before updating counts or responding to user input.
const savedLibrary = readLibrary();
Object.entries(savedLibrary.favorites || {}).forEach(([id, favorite]) => {
	const card = grid.querySelector(`[data-id="${CSS.escape(id)}"]`);
	if (!card) return;
	card.dataset.favorite = String(Boolean(favorite));
	const button = card.querySelector('.favorite-button');
	button.classList.toggle('is-favorite', Boolean(favorite));
	button.textContent = favorite ? '♥' : '♡';
	button.setAttribute('aria-pressed', String(Boolean(favorite)));
	button.setAttribute('aria-label', `${favorite ? 'Remove' : 'Add'} ${card.dataset.name} ${favorite ? 'from' : 'to'} favorites`);
});
Object.entries(savedLibrary.links || {}).forEach(([id, url]) => {
	const card = grid.querySelector(`[data-id="${CSS.escape(id)}"]`);
	if (card) card.dataset.url = url;
});
(savedLibrary.templates || []).forEach((template) => grid.append(createTemplateCard(template)));

// 3. Catalog display: small shared helpers used by the filter and card handlers.
function showToast(message) {
	const toast = document.querySelector('#toast');
	toast.textContent = message;
	toast.classList.add('visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function updateCounts() {
	const count = grid.querySelectorAll('.template-card').length;
	const favorites = grid.querySelectorAll('.template-card[data-favorite="true"]').length;
	document.querySelector('#sidebar-count').textContent = String(count).padStart(2, '0');
	document.querySelector('#total-stat').textContent = String(count).padStart(2, '0');
	document.querySelector('#favorite-stat').textContent = String(favorites).padStart(2, '0');
	document.querySelector('#catalog-count').textContent = `(${String(count).padStart(2, '0')})`;
	filterButtons.forEach((button) => {
		const category = button.dataset.filter;
		if (category === 'all') button.querySelector('span').textContent = String(count).padStart(2, '0');
		else if (category === 'favorites') button.textContent = `♡ Favorites ${favorites ? `(${favorites})` : ''}`;
		else button.querySelector('span').textContent = String([...grid.querySelectorAll('.template-card')].filter((card) => card.dataset.category === category).length).padStart(2, '0');
	});
}

// Apply sort order, selected category, and search text to the existing cards.
function renderCards() {
	const query = searchInput.value.trim().toLowerCase();
	const allCards = [...grid.querySelectorAll('.template-card')];
	allCards.sort((a, b) => {
		if (sortSelect.value === 'az') return a.dataset.name.localeCompare(b.dataset.name);
		if (sortSelect.value === 'favorites') return Number(b.dataset.favorite === 'true') - Number(a.dataset.favorite === 'true');
		return Number(b.dataset.date) - Number(a.dataset.date);
	}).forEach((card) => grid.append(card));
	let visibleCount = 0;
	allCards.forEach((card) => {
		const categoryMatch = activeFilter === 'all' || (activeFilter === 'favorites' ? card.dataset.favorite === 'true' : card.dataset.category === activeFilter);
		const searchMatch = `${card.dataset.name} ${card.dataset.category} ${card.textContent}`.toLowerCase().includes(query);
		card.hidden = !(categoryMatch && searchMatch);
		if (!card.hidden) visibleCount++;
	});
	document.querySelector('#empty-state').hidden = visibleCount > 0;
}

// 4. Template details: load and save the destination link for the selected card.
const destinationDialog = document.querySelector('#destination-dialog');
let activeTemplateCard = null;

function openTemplateDetails(card) {
	activeTemplateCard = card;
	document.querySelector('#destination-title').innerHTML = `${card.dataset.name.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])}<span class="title-period">.</span>`;
	const urlInput = document.querySelector('#destination-url');
	urlInput.value = card.dataset.url || '';
	const hasUrl = Boolean(card.dataset.url);
	const openLink = document.querySelector('#open-destination');
	openLink.href = card.dataset.url || '#';
	openLink.hidden = !hasUrl;
	openLink.setAttribute('aria-disabled', String(!hasUrl));
	document.querySelector('#remove-destination').hidden = !hasUrl;
	destinationDialog.showModal();
}

document.querySelector('#destination-form').addEventListener('submit', (event) => {
	event.preventDefault();
	if (!activeTemplateCard) return;
	activeTemplateCard.dataset.url = new FormData(event.currentTarget).get('url').trim();
	writeLibrary();
	const openLink = document.querySelector('#open-destination');
	openLink.href = activeTemplateCard.dataset.url || '#';
	openLink.hidden = !activeTemplateCard.dataset.url;
	openLink.setAttribute('aria-disabled', String(!activeTemplateCard.dataset.url));
	document.querySelector('#remove-destination').hidden = !activeTemplateCard.dataset.url;
	showToast(activeTemplateCard.dataset.url ? 'Destination link saved' : 'Destination link removed');
});

document.querySelector('#remove-destination').addEventListener('click', () => {
	if (!activeTemplateCard) return;
	activeTemplateCard.dataset.url = '';
	document.querySelector('#destination-url').value = '';
	const openLink = document.querySelector('#open-destination');
	openLink.hidden = true;
	openLink.href = '#';
	openLink.setAttribute('aria-disabled', 'true');
	document.querySelector('#remove-destination').hidden = true;
	writeLibrary();
	showToast('Destination link removed');
});

// 5. Catalog controls: keep the sidebar, filter chips, search, and sort in sync.
filterButtons.forEach((button) => button.addEventListener('click', () => {
	activeFilter = button.dataset.filter;
	filterButtons.forEach((item) => item.classList.toggle('selected', item === button));
	document.querySelectorAll('[data-sidebar-filter]').forEach((item) => item.classList.toggle('active', activeFilter === 'favorites'));
	renderCards();
}));
document.querySelectorAll('.collection-nav [data-filter]').forEach((item) => item.addEventListener('click', () => {
	activeFilter = item.dataset.filter;
	filterButtons.forEach((button) => button.classList.toggle('selected', button.dataset.filter === activeFilter));
	renderCards();
}));
document.querySelector('[data-sidebar-filter="favorites"]').addEventListener('click', () => {
	activeFilter = 'favorites';
	filterButtons.forEach((button) => button.classList.toggle('selected', button.dataset.filter === activeFilter));
	renderCards();
});
searchInput.addEventListener('input', renderCards);
sortSelect.addEventListener('change', renderCards);

// Card-level actions use one listener on the grid, including cards added later.
grid.addEventListener('click', (event) => {
	const favoriteButton = event.target.closest('.favorite-button');
	if (favoriteButton) {
		const card = favoriteButton.closest('.template-card');
		const favorite = card.dataset.favorite !== 'true';
		card.dataset.favorite = String(favorite);
		favoriteButton.classList.toggle('is-favorite', favorite);
		favoriteButton.textContent = favorite ? '♥' : '♡';
		favoriteButton.setAttribute('aria-pressed', String(favorite));
		favoriteButton.setAttribute('aria-label', `${favorite ? 'Remove' : 'Add'} ${card.dataset.name} ${favorite ? 'from' : 'to'} favorites`);
		writeLibrary();
		updateCounts();
		renderCards();
		return;
	}
	if (event.target.closest('.more-button')) showToast('Template options are ready for your next edit.');
	if (event.target.closest('.preview-button')) openTemplateDetails(event.target.closest('.template-card'));
});

// 6. Page actions: featured item, add form, keyboard shortcut, and first render.
document.querySelectorAll('[data-open-template="weekly-reset"]').forEach((button) => button.addEventListener('click', () => openTemplateDetails(grid.querySelector('[data-id="weekly-reset"]'))));
const dialog = document.querySelector('#template-dialog');
document.querySelector('#add-template').addEventListener('click', () => dialog.showModal());
document.querySelector('#new-collection').addEventListener('click', () => showToast('Collection tools are ready for your next edit.'));
document.querySelector('#profile-button').addEventListener('click', () => showToast('Personal workspace settings'));
document.querySelector('#clear-filters').addEventListener('click', () => {
	searchInput.value = '';
	activeFilter = 'all';
	filterButtons.forEach((button) => button.classList.toggle('selected', button.dataset.filter === 'all'));
	renderCards();
});
document.querySelector('#template-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const form = new FormData(event.currentTarget);
	const name = form.get('name').trim();
	const category = form.get('category');
	const format = form.get('format');
	const url = form.get('url').trim();
	const card = createTemplateCard({ id: `template-${Date.now()}`, name, category, format, url, date: Date.now(), favorite: false });
	grid.prepend(card);
	event.currentTarget.reset();
	dialog.close();
	writeLibrary();
	updateCounts();
	activeFilter = 'all';
	filterButtons.forEach((button) => button.classList.toggle('selected', button.dataset.filter === 'all'));
	renderCards();
	showToast(`${name} added to your library`);
});
document.addEventListener('keydown', (event) => {
	if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
		event.preventDefault();
		searchInput.focus();
	}
	if (event.key === 'Escape' && dialog.open) dialog.close();
});
updateCounts();