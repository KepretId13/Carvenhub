// 1. Page elements and state: these references are shared by the handlers below.
const grid = document.querySelector('#template-grid');
const starterTemplates = document.querySelector('#starter-templates');
const overviewView = document.querySelector('#overview-view');
const catalogSection = document.querySelector('#catalog');
const viewLinks = [...document.querySelectorAll('[data-page-view]')];
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const storageKey = 'forma-library-templates-v1';
const appearanceStorageKey = 'forma-library-appearance-v1';
const defaultAppearance = { mode: 'dark', start: '#a8ed72', end: '#f18472' };
const visualAssetFiles = [
	'Blue_Mist.webp', 'Blue_Quiet.webp', 'Candy_Sweet.webp', 'Cappucino_Cream.webp', 'Cozy_Pastel.webp',
	'DeepSleep.webp', 'Desert_Ember.webp', 'Do_Green_Ever.webp', 'Frostline_Dare.webp', 'Green_Valor.webp',
	'Greenary_Fields.webp', 'Lime_White.webp', 'Midnight_Ruins.webp', 'Mint_Frost.webp', 'Mint_Horizon.webp',
	'Ocean_Drift.webp', 'Orange_Dark_Red.webp', 'Pink_Yellow.webp', 'Pixel_Valor.webp', 'River_Shine.webp',
	'Sakura_Breeze.webp', 'Sand_Natural.webp', 'Soft_Lilac.webp'
];
const visualAssets = visualAssetFiles.map((filename, index) => {
	const baseName = filename.replace(/\.webp$/i, '');
	return {
		id: `visual-${baseName}`,
		filename,
		name: baseName.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2'),
		category: 'visual',
		date: String(-index)
	};
});
let activeFilter = 'all';
let toastTimer;
let catalogLoaded = false;

function readAppearance() {
	try {
		const saved = JSON.parse(localStorage.getItem(appearanceStorageKey) || '{}');
		return {
			mode: saved.mode === 'light' ? 'light' : 'dark',
			start: /^#[0-9a-f]{6}$/i.test(saved.start) ? saved.start : defaultAppearance.start,
			end: /^#[0-9a-f]{6}$/i.test(saved.end) ? saved.end : defaultAppearance.end
		};
	} catch { return { ...defaultAppearance }; }
}

function applyAppearance(appearance) {
	document.body.dataset.theme = appearance.mode;
	document.documentElement.style.setProperty('--theme-start', appearance.start);
	document.documentElement.style.setProperty('--theme-end', appearance.end);
}

let currentAppearance = readAppearance();
applyAppearance(currentAppearance);

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

// Local artwork cards use the source image as their preview and load lazily.
function createVisualAssetCard(asset) {
	const card = document.createElement('article');
	card.className = 'template-card asset-template-card';
	card.dataset.id = asset.id;
	card.dataset.category = asset.category;
	card.dataset.name = asset.name;
	card.dataset.date = asset.date;
	card.dataset.favorite = String(Boolean(savedLibrary.favorites && savedLibrary.favorites[asset.id]));
	const favoriteButton = document.createElement('button');
	favoriteButton.className = `favorite-button${card.dataset.favorite === 'true' ? ' is-favorite' : ''}`;
	favoriteButton.textContent = card.dataset.favorite === 'true' ? '♥' : '♡';
	favoriteButton.setAttribute('aria-pressed', card.dataset.favorite);
	favoriteButton.setAttribute('aria-label', `${card.dataset.favorite === 'true' ? 'Remove' : 'Add'} ${asset.name} ${card.dataset.favorite === 'true' ? 'from' : 'to'} favorites`);
	const previewButton = document.createElement('button');
	previewButton.className = 'preview-button';
	previewButton.setAttribute('aria-label', `Preview ${asset.name}`);
	const preview = document.createElement('div');
	preview.className = 'preview preview-asset';
	const image = document.createElement('img');
	image.src = `assets/${encodeURIComponent(asset.filename)}`;
	image.alt = `${asset.name} artwork`;
	image.loading = 'lazy';
	image.decoding = 'async';
	preview.append(image);
	previewButton.append(preview);
	const meta = document.createElement('div');
	meta.className = 'template-meta';
	meta.innerHTML = '<div><span class="template-category">VISUALS</span><h3></h3></div><button class="more-button" type="button" aria-label="More visual options">···</button>';
	meta.querySelector('h3').textContent = asset.name;
	meta.querySelector('.more-button').setAttribute('aria-label', `More options for ${asset.name}`);
	const footer = document.createElement('div');
	footer.className = 'template-footer';
	footer.innerHTML = '<span class="file-type"><i class="type-dot type-pdf"></i>WebP</span><span>Carvenhub asset</span>';
	card.append(favoriteButton, previewButton, meta, footer);
	return card;
}

const savedLibrary = readLibrary();

// Build the catalog only when a visitor opens All Templates or Favorites.
function loadCatalog() {
	if (catalogLoaded) return;
	grid.append(starterTemplates.content.cloneNode(true));
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
	visualAssets.forEach((asset) => grid.append(createVisualAssetCard(asset)));
	catalogLoaded = true;
	updateCounts();
}

// 3. Catalog display: small shared helpers used by the filter and card handlers.
function showToast(message) {
	const toast = document.querySelector('#toast');
	toast.textContent = message;
	toast.classList.add('visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}

function updateCounts() {
	const cards = catalogLoaded ? [...grid.querySelectorAll('.template-card')] : [...starterTemplates.content.querySelectorAll('.template-card')];
	const savedTemplates = catalogLoaded ? [] : savedLibrary.templates || [];
	const count = cards.length + savedTemplates.length + (catalogLoaded ? 0 : visualAssets.length);
	const favorites = cards.filter((card) => {
		const savedFavorite = savedLibrary.favorites && savedLibrary.favorites[card.dataset.id];
		return typeof savedFavorite === 'boolean' ? savedFavorite : card.dataset.favorite === 'true';
	}).length + savedTemplates.filter((template) => template.favorite).length + (catalogLoaded ? 0 : visualAssets.filter((asset) => savedLibrary.favorites && savedLibrary.favorites[asset.id] === true).length);
	document.querySelector('#sidebar-count').textContent = String(count).padStart(2, '0');
	document.querySelector('#total-stat').textContent = String(count).padStart(2, '0');
	document.querySelector('#favorite-stat').textContent = String(favorites).padStart(2, '0');
	document.querySelector('#catalog-count').textContent = `(${String(count).padStart(2, '0')})`;
	filterButtons.forEach((button) => {
		const category = button.dataset.filter;
		if (category === 'all') button.querySelector('span').textContent = String(count).padStart(2, '0');
		else if (category === 'favorites') button.textContent = `♡ Favorites ${favorites ? `(${favorites})` : ''}`;
		else {
			const categoryCount = cards.filter((card) => card.dataset.category === category).length + savedTemplates.filter((template) => template.category === category).length + (!catalogLoaded && category === 'visual' ? visualAssets.length : 0);
			button.querySelector('span').textContent = String(categoryCount).padStart(2, '0');
		}
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

function setActiveView(view, category = 'all') {
	document.body.dataset.currentView = view;
	overviewView.hidden = view !== 'overview';
	catalogSection.hidden = view === 'overview';
	viewLinks.forEach((link) => {
		const isCurrent = link.dataset.pageView === view;
		link.classList.toggle('active', isCurrent);
		if (isCurrent) link.setAttribute('aria-current', 'page');
		else link.removeAttribute('aria-current');
	});
	document.querySelector('.breadcrumbs strong').textContent = view === 'overview' ? 'Overview' : view === 'favorites' ? 'Favorites' : 'All templates';
	document.querySelector('#catalog-title').textContent = view === 'favorites' ? 'Favorite templates' : 'Your templates';
	if (view === 'overview') return;
	loadCatalog();
	activeFilter = view === 'favorites' ? 'favorites' : category;
	filterButtons.forEach((button) => button.classList.toggle('selected', button.dataset.filter === activeFilter));
	renderCards();
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
function handleViewNavigation(event) {
	setActiveView(event.currentTarget.dataset.pageView);
}

function handleFilterNavigation(event) {
	const button = event.currentTarget;
	if (button.dataset.filter === 'favorites') {
		setActiveView('favorites');
		return;
	}
	activeFilter = button.dataset.filter;
	filterButtons.forEach((item) => item.classList.toggle('selected', item === button));
	renderCards();
}

function handleCollectionNavigation(event) {
	setActiveView('templates', event.currentTarget.dataset.filter);
}

viewLinks.forEach((link) => link.addEventListener('click', handleViewNavigation));
filterButtons.forEach((button) => button.addEventListener('click', handleFilterNavigation));
document.querySelectorAll('.collection-nav [data-filter]').forEach((item) => item.addEventListener('click', handleCollectionNavigation));
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
document.querySelectorAll('[data-open-template="weekly-reset"]').forEach((button) => button.addEventListener('click', () => {
	loadCatalog();
	openTemplateDetails(grid.querySelector('[data-id="weekly-reset"]'));
}));
const dialog = document.querySelector('#template-dialog');
document.querySelector('#add-template').addEventListener('click', () => dialog.showModal());
document.querySelector('#new-collection').addEventListener('click', () => showToast('Collection tools are ready for your next edit.'));
document.querySelector('#profile-button').addEventListener('click', () => showToast('Personal workspace settings'));
const appearanceDialog = document.querySelector('#appearance-dialog');
const darkModeToggle = document.querySelector('#dark-mode-toggle');
const gradientStartInput = document.querySelector('#gradient-start');
const gradientEndInput = document.querySelector('#gradient-end');

function updateGradientPreview() {
	document.querySelector('#gradient-preview').style.background = `linear-gradient(120deg, ${gradientStartInput.value}, ${gradientEndInput.value})`;
}

document.querySelector('#appearance-button').addEventListener('click', () => {
	darkModeToggle.checked = currentAppearance.mode === 'dark';
	gradientStartInput.value = currentAppearance.start;
	gradientEndInput.value = currentAppearance.end;
	updateGradientPreview();
	appearanceDialog.showModal();
});
gradientStartInput.addEventListener('input', updateGradientPreview);
gradientEndInput.addEventListener('input', updateGradientPreview);
document.querySelectorAll('.gradient-preset').forEach((button) => button.addEventListener('click', () => {
	gradientStartInput.value = button.dataset.start;
	gradientEndInput.value = button.dataset.end;
	updateGradientPreview();
}));
document.querySelector('#apply-appearance').addEventListener('click', () => {
	currentAppearance = {
		mode: darkModeToggle.checked ? 'dark' : 'light',
		start: gradientStartInput.value,
		end: gradientEndInput.value
	};
	applyAppearance(currentAppearance);
	try { localStorage.setItem(appearanceStorageKey, JSON.stringify(currentAppearance)); }
	catch { showToast('Browser storage is unavailable for this page.'); }
	appearanceDialog.close();
	showToast('Appearance saved on this device');
});
document.querySelector('#clear-filters').addEventListener('click', () => {
	searchInput.value = '';
	setActiveView('templates');
});
document.querySelector('#template-form').addEventListener('submit', (event) => {
	event.preventDefault();
	loadCatalog();
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
	setActiveView('templates');
	showToast(`${name} added to your library`);
});
document.addEventListener('keydown', (event) => {
	if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
		event.preventDefault();
		searchInput.focus();
	}
	if (event.key === 'Escape' && dialog.open) dialog.close();
});
setActiveView('overview');
updateCounts();
