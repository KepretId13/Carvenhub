// 1. Page elements and state: these references are shared by the handlers below.
const grid = document.querySelector('#template-grid');
const overviewView = document.querySelector('#overview-view');
const catalogSection = document.querySelector('#catalog');
const viewLinks = [...document.querySelectorAll('[data-page-view]')];
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
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
		category: '',
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
		const assignments = Object.fromEntries(builtInCards.filter((card) => card.dataset.category).map((card) => [card.dataset.id, card.dataset.category]));
		localStorage.setItem(storageKey, JSON.stringify({ templates, favorites, links, assignments, categories: customCategories }));
	} catch { showToast('Browser storage is unavailable for this page.'); }
}

const savedLibrary = readLibrary();
const customCategories = Array.isArray(savedLibrary.categories) ? savedLibrary.categories : [];

function categoryLabel(categoryId) {
	return customCategories.find((category) => category.id === categoryId)?.name || 'Uncategorized';
}

// Build the same card structure for every template added through the form.
function createTemplateCard(template) {
	const safeName = template.name.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
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
	card.innerHTML = `<button class="favorite-button${template.favorite ? ' is-favorite' : ''}" aria-label="${template.favorite ? 'Remove' : 'Add'} ${safeName} ${template.favorite ? 'from' : 'to'} favorites" aria-pressed="${Boolean(template.favorite)}">${template.favorite ? '♥' : '♡'}</button><button class="preview-button new-preview" aria-label="Preview ${safeName}"><span class="new-preview-label">NEW IN YOUR<br>LIBRARY<span>✳</span></span></button><div class="template-meta"><div><span class="template-category"></span><h3></h3></div><button class="more-button" aria-label="More options for ${safeName}">···</button></div><div class="template-footer"><span class="file-type"><i class="type-dot ${typeClass}"></i>${template.format}</span><span>Added to library</span></div>`;
	card.querySelector('h3').textContent = template.name;
	card.querySelector('.template-category').textContent = categoryLabel(template.category).toUpperCase();
	return card;
}

// Local artwork cards use the source image as their preview and load lazily.
function createVisualAssetCard(asset) {
	const card = document.createElement('article');
	card.className = 'template-card asset-template-card';
	card.dataset.id = asset.id;
	card.dataset.category = asset.category || '';
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
	meta.innerHTML = '<div><span class="template-category"></span><h3></h3></div><button class="more-button" type="button" aria-label="More options">···</button>';
	meta.querySelector('h3').textContent = asset.name;
	meta.querySelector('.template-category').textContent = categoryLabel(asset.category).toUpperCase();
	meta.querySelector('.more-button').setAttribute('aria-label', `More options for ${asset.name}`);
	const footer = document.createElement('div');
	footer.className = 'template-footer';
	footer.innerHTML = '<span class="file-type"><i class="type-dot type-pdf"></i>WebP</span><span>Carvenhub asset</span>';
	card.append(favoriteButton, previewButton, meta, footer);
	return card;
}

// Build the catalog only when a visitor opens All Templates or Favorites.
function loadCatalog() {
	if (catalogLoaded) return;
	(savedLibrary.templates || []).forEach((template) => grid.append(createTemplateCard(template)));
	visualAssets.forEach((asset) => grid.append(createVisualAssetCard(asset)));
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
	Object.entries(savedLibrary.assignments || {}).forEach(([id, categoryId]) => {
		const card = grid.querySelector(`[data-id="${CSS.escape(id)}"]`);
		if (card) {
			card.dataset.category = categoryId;
			card.querySelector('.template-category').textContent = categoryLabel(categoryId).toUpperCase();
		}
	});
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
	const cards = catalogLoaded ? [...grid.querySelectorAll('.template-card')] : [];
	const savedTemplates = catalogLoaded ? [] : savedLibrary.templates || [];
	const count = catalogLoaded ? cards.length : visualAssets.length + savedTemplates.length;
	const favorites = catalogLoaded
		? cards.filter((card) => card.dataset.favorite === 'true').length
		: visualAssets.filter((asset) => savedLibrary.favorites && savedLibrary.favorites[asset.id] === true).length + savedTemplates.filter((template) => template.favorite).length;
	document.querySelector('#sidebar-count').textContent = String(count).padStart(2, '0');
	document.querySelector('#total-stat').textContent = String(count).padStart(2, '0');
	document.querySelector('#favorite-stat').textContent = String(favorites).padStart(2, '0');
	document.querySelector('#category-stat').textContent = String(customCategories.length).padStart(2, '0');
	document.querySelector('#catalog-count').textContent = `(${String(count).padStart(2, '0')})`;
	document.querySelectorAll('.filter-chip').forEach((button) => {
		const category = button.dataset.filter;
		if (category === 'all') button.querySelector('span').textContent = String(count).padStart(2, '0');
		else if (category === 'favorites') button.textContent = `♡ Favorites ${favorites ? `(${favorites})` : ''}`;
		else {
			const categoryCount = catalogLoaded
				? cards.filter((card) => card.dataset.category === category).length
				: visualAssets.filter((asset) => (savedLibrary.assignments || {})[asset.id] === category).length + savedTemplates.filter((template) => template.category === category).length;
			button.querySelector('span').textContent = String(categoryCount).padStart(2, '0');
		}
	});
}

function updateCategorySelects() {
	document.querySelectorAll('#template-category, #asset-category-select').forEach((select) => {
		const selectedCategory = select.value;
		select.replaceChildren(new Option('Uncategorized', ''));
		customCategories.forEach((category) => select.add(new Option(category.name, category.id)));
		select.value = customCategories.some((category) => category.id === selectedCategory) ? selectedCategory : '';
	});
}

function renderCategoryControls() {
	const collectionNav = document.querySelector('.collection-nav');
	const filterRow = document.querySelector('.filter-row');
	const favoritesFilter = filterRow.querySelector('[data-filter="favorites"]');
	collectionNav.replaceChildren();
	filterRow.querySelectorAll('.category-filter').forEach((button) => button.remove());
	const dotColors = ['dot-coral', 'dot-blue', 'dot-green', 'dot-yellow'];
	customCategories.forEach((category, index) => {
		const link = document.createElement('a');
		link.className = 'nav-item';
		link.href = '#catalog';
		link.dataset.filter = category.id;
		const dot = document.createElement('span');
		dot.className = `collection-dot ${dotColors[index % dotColors.length]}`;
		link.append(dot, document.createTextNode(category.name));
		collectionNav.append(link);

		const chip = document.createElement('button');
		chip.className = 'filter-chip category-filter';
		chip.type = 'button';
		chip.dataset.filter = category.id;
		chip.append(document.createTextNode(category.name));
		const count = document.createElement('span');
		count.textContent = '00';
		chip.append(count);
		filterRow.insertBefore(chip, favoritesFilter);
	});
	updateCategorySelects();
	updateCounts();
}

function updateFilterSelection() {
	document.querySelectorAll('.filter-chip').forEach((button) => {
		button.classList.toggle('selected', button.dataset.filter === activeFilter);
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
	updateFilterSelection();
	renderCards();
}

// 4. Template details: load and save the destination link for the selected card.
const destinationDialog = document.querySelector('#destination-dialog');
let activeTemplateCard = null;

function openTemplateDetails(card) {
	activeTemplateCard = card;
	document.querySelector('#destination-title').innerHTML = `${card.dataset.name.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])}<span class="title-period">.</span>`;
	updateCategorySelects();
	document.querySelector('#asset-category-select').value = card.dataset.category || '';
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

document.querySelector('#category-assignment-form').addEventListener('submit', (event) => {
	event.preventDefault();
	if (!activeTemplateCard) return;
	activeTemplateCard.dataset.category = new FormData(event.currentTarget).get('category') || '';
	const categoryTag = activeTemplateCard.querySelector('.template-category');
	if (categoryTag) categoryTag.textContent = categoryLabel(activeTemplateCard.dataset.category).toUpperCase();
	writeLibrary();
	updateCounts();
	renderCards();
	showToast(activeTemplateCard.dataset.category ? 'Category saved' : 'Category removed');
});

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
	const button = event;
	if (button.dataset.filter === 'favorites') {
		setActiveView('favorites');
		return;
	}
	activeFilter = button.dataset.filter;
	updateFilterSelection();
	renderCards();
}

function handleCollectionNavigation(categoryId) {
	setActiveView('templates', categoryId);
}

viewLinks.forEach((link) => link.addEventListener('click', handleViewNavigation));
document.querySelector('.filter-row').addEventListener('click', (event) => {
	const button = event.target.closest('.filter-chip');
	if (button) handleFilterNavigation(button);
});
document.querySelector('.collection-nav').addEventListener('click', (event) => {
	const link = event.target.closest('[data-filter]');
	if (link) handleCollectionNavigation(link.dataset.filter);
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
const dialog = document.querySelector('#template-dialog');
document.querySelector('#add-template').addEventListener('click', () => dialog.showModal());
const categoryDialog = document.querySelector('#category-dialog');
document.querySelector('#new-collection').addEventListener('click', () => categoryDialog.showModal());
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
document.querySelector('#category-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const name = new FormData(event.currentTarget).get('name').trim();
	if (customCategories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
		showToast('That category already exists');
		return;
	}
	customCategories.push({ id: `category-${Date.now()}`, name });
	writeLibrary();
	renderCategoryControls();
	event.currentTarget.reset();
	categoryDialog.close();
	showToast(`${name} category created`);
});
document.addEventListener('keydown', (event) => {
	if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
		event.preventDefault();
		searchInput.focus();
	}
	if (event.key === 'Escape' && dialog.open) dialog.close();
});
renderCategoryControls();
setActiveView('overview');
updateCounts();
