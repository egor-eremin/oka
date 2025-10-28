function media(mediaQueryString, action) {
	const mql = window.matchMedia(mediaQueryString);

	// вызывать только когда условие совпадает (как и раньше)
	const handle = (e) => {
		const mq = e && e.matches !== undefined ? e : mql; // поддержка начального вызова
		if (mq.matches && typeof action === 'function') {
			action();
		}
	};

	// начальный прогон
	handle(mql);

	// подписка на изменения (новый API + fallback)
	if (mql.addEventListener) {
		mql.addEventListener('change', handle);
	} else if (mql.addListener) {
		// старые браузеры
		mql.addListener(handle);
	}
}

function openFormSearch() {
	const openBtn = document.querySelector('.js-open-search');
	const formWrapper = document.querySelector('.page-header__search');
	const nav = document.querySelector('.page-header__nav');
	const btnClose = document.querySelector('.js-close-search');

	if (openBtn === null) return;

	function resetClasses() {
		formWrapper.classList.remove('page-header__search_opened');
		nav.classList.remove('page-header__nav_hide');
		openBtn.classList.remove('active');
	}

	function handleClickOutside(event) {
		// Проверяем, что клик был вне формы поиска и не по кнопке открытия
		if (!formWrapper.contains(event.target) && event.target !== openBtn) {
			resetClasses();
		}
	}

	openBtn.addEventListener('click', () => {
		formWrapper.classList.toggle('page-header__search_opened');
		nav.classList.toggle('page-header__nav_hide');
		openBtn.classList.toggle('active');
	});

	if (btnClose !== null) {
		btnClose.addEventListener('click', resetClasses);
	}

	// Добавляем обработчик клика по документу
	document.addEventListener('click', handleClickOutside);

	// Сброс классов на разрешении max-width 1024px
	media('(max-width: 1024px)', resetClasses);
}

function validateSearchForm() {
	const form = $('.js-search-form');

	// Проверка на присутствие формы на странице
	if (!form.length) {
		return;
	}

	form.validate({
		errorClass: 'error',
		validClass: 'success',
		highlight: function(element, errorClass, validClass) {
			// При ошибке добавляем класс к родителю формы
			form.closest('.page-header__search-wrapper').addClass('has-error');
		},
		unhighlight: function(element, errorClass, validClass) {
			// При исправлении ошибки убираем класс у родителя формы
			form.closest('.page-header__search-wrapper').removeClass('has-error');
		},
		invalidHandler: function(event, validator) {
			// Обработчик при попытке отправки невалидной формы
			form.closest('.page-header__search-wrapper').addClass('has-error');
		},
		submitHandler: (form) => {
			// Убираем класс при успешной отправке
			$(form).closest('.page-header__search-wrapper').removeClass('has-error');
			HTMLFormElement.prototype.submit.call(form);
		},
	});
}

function initLanguageDropdown() {
	const languageToggle = document.querySelector('.js-language-toggle');
	const languageDropdown = document.querySelector('.page-header__language-dropdown');

	if (!languageToggle || !languageDropdown) return;

	function closeDropdown() {
		languageToggle.setAttribute('aria-expanded', 'false');
		languageDropdown.classList.remove('open');
		languageToggle.classList.remove('active');
	}

	function openDropdown() {
		languageToggle.setAttribute('aria-expanded', 'true');
		languageDropdown.classList.add('open');
		languageToggle.classList.add('active');
	}

	function toggleDropdown() {
		const isExpanded = languageToggle.getAttribute('aria-expanded') === 'true';
		if (isExpanded) {
			closeDropdown();
		} else {
			openDropdown();
		}
	}

	// Только переключение меню по клику на кнопку
	languageToggle.addEventListener('click', function(e) {
		e.stopPropagation();
		toggleDropdown();
	});

	// Автоматическое закрытие при клике вне меню
	document.addEventListener('click', function(e) {
		if (!languageToggle.contains(e.target) && !languageDropdown.contains(e.target)) {
			closeDropdown();
		}
	});

	// Закрытие по Escape
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') {
			closeDropdown();
		}
	});

	media('(max-width: 1024px)', closeDropdown);
}

// Фиксация шапки: guard + addEventListener + rAF-троттлинг
function fixedMenu() {
	const headerElement = document.querySelector('.page-header__head');
	if (!headerElement) return; // страница без шапки

	let prevScrollPos = window.pageYOffset;
	const scrollThreshold = 0;
	let ticking = false;

	function onScroll() {
		if (ticking) return;
		ticking = true;

		requestAnimationFrame(() => {
			const currentScrollPos = window.pageYOffset;

			if (currentScrollPos > scrollThreshold) {
				headerElement.classList.add('fixed');

				if (prevScrollPos > currentScrollPos) {
					headerElement.classList.remove('page-header__head_hide'); // прокрутка вверх — показываем
				} else {
					headerElement.classList.add('page-header__head_hide');   // прокрутка вниз — прячем
				}
			} else {
				headerElement.classList.remove('fixed', 'page-header__head_hide');
			}

			prevScrollPos = currentScrollPos;
			ticking = false;
		});
	}

	window.addEventListener('scroll', onScroll, { passive: true });
}

function initBurgerMenu() {
	const burgerButton = document.querySelector('.js-open-menu');
	const menu = document.querySelector('.page-header__nav');
	const htmlElement = document.documentElement;

	if (!burgerButton || !menu) {
		console.warn('Элементы меню не найдены');
		return;
	}

	burgerButton.addEventListener('click', function() {
		// Переключаем класс на меню
		menu.classList.toggle('open');

		// Переключаем класс на html
		htmlElement.classList.toggle('page_overflow-hidden');

		// Переключаем класс на самой кнопке
		this.classList.toggle('active');
	});

	// Очищаем классы на разрешении min-width: 1025px
	media('(min-width: 1025px)', () => {
		menu.classList.remove('open');
		htmlElement.classList.remove('page_overflow-hidden');
		burgerButton.classList.remove('active');
	});
}

function initPromoSlider() {
	const promoSliderEl = document.querySelector('.js-promo-slider');

	if (!promoSliderEl) return; // если слайдер отсутствует на странице

	new Swiper(promoSliderEl, {
		loop: true,
		speed: 500,
		spaceBetween: 0,
		slidesPerView: 1,
		effect: 'fade',
		watchOverflow: true,
		fadeEffect: {
			crossFade: true
		},
		autoplay: {
			delay: 7000,
			disableOnInteraction: false
		},
		pagination: {
			el: '.promo-slider__pagination',
			clickable: true,
			bulletClass: 'pagination__item pagination__item_white',
			bulletActiveClass: 'is-active',
		},
	});
}

function initMainServicesSlider() {
	const slider = document.querySelector('.js-main-services');
	if (!slider) return;

	new Swiper(slider, {
		speed: 600,
		slidesPerView: 1,
		loop: false,
		grabCursor: true,
		watchOverflow: true,

		navigation: {
			nextEl: '.main-services__nav_next',
			prevEl: '.main-services__nav_prev',
		},

		pagination: {
			el: '.main-services__pagination',
			clickable: true,
			bulletClass: 'pagination__item pagination__item_green',
			bulletActiveClass: 'is-active',
		},

		breakpoints: {
			1025: {
				slidesPerView: 2,
			},
		},
	});
}

function initMainAdvantagesSlider() {
	const el = document.querySelector('.js-main-advantages');
	if (!el) return;

	new Swiper(el, {
		grabCursor: true,
		slidesPerView: 'auto',
		centeredSlides: true,
		loop: true,
		effect: 'creative',
		slideToClickedSlide: true,

		creativeEffect: {
			prev: {
				translate: ['-40%', 0, -360],
			},
			next: {
				translate: ['40%', 0, -360],
			},
		},

		keyboard: {
			enabled: true,
			onlyInViewport: true,
		},

		navigation: {
			prevEl: '.main-advantages__nav_prev',
			nextEl: '.main-advantages__nav_next',
		},

		pagination: {
			el: '.main-advantages__pagination',
			clickable: true,
			bulletClass: 'pagination__item pagination__item_green',
			bulletActiveClass: 'is-active',
		},

		breakpoints: {
			1025: {
				creativeEffect: {
					prev: {
						translate: ['-80%', 0, -360],
					},
					next: {
						translate: ['80%', 0, -360],
					},
				},
			},
		},
	});
}

function initStagesSliders() {
	const headerEl = document.querySelector('.js-stages-header-slider');
	const stepsEl  = document.querySelector('.js-steps-header-slider');
	if (!headerEl || !stepsEl) return;

	let headerSwiper = null;
	let stepsSwiper  = null;

	const enable = () => {
		if (headerSwiper || stepsSwiper) return; // уже инициализировано

		headerSwiper = new Swiper(headerEl, {
			slidesPerView: 1,
			loop: false,
			speed: 500,
			effect: 'fade',
			fadeEffect: { crossFade: true },
			allowTouchMove: false,
			simulateTouch: false,
			keyboard: false,
			mousewheel: false,
			watchOverflow: true,
		});

		stepsSwiper = new Swiper(stepsEl, {
			slidesPerView: 1,
			loop: false,
			speed: 600,
			spaceBetween: 30,
			autoHeight: true,
			grabCursor: true,
			watchOverflow: true,
			navigation: {
				nextEl: '.main-stages__nav_next',
				prevEl: '.main-stages__nav_prev',
			},
		});

		// связываем: второй управляет первым
		stepsSwiper.controller.control = headerSwiper;
	};

	const disable = () => {
		if (stepsSwiper)  { stepsSwiper.destroy(true, true);  stepsSwiper  = null; }
		if (headerSwiper) { headerSwiper.destroy(true, true); headerSwiper = null; }
	};

	const mq = window.matchMedia('(min-width: 1025px)');
	const apply = (e) => (e.matches ? enable() : disable());

	// начальное состояние + подписка на изменения
	apply(mq);
	if (mq.addEventListener) mq.addEventListener('change', apply);
	else mq.addListener(apply); // fallback для старых браузеров
}

function initAiHelperStick() {
	const helper = document.querySelector('.ai-helper');
	const footer = document.querySelector('footer'); // или .page-footer
	if (!helper || !footer) return;

	let baseBottomPx = 0; // "чистый" bottom из CSS (media-правила)

	function readBaseBottomFromCSS() {
		// убираем инлайн-стиль, чтобы не мешал media-правилам
		helper.style.bottom = '';
		baseBottomPx = parseFloat(getComputedStyle(helper).bottom) || 0;
	}

	function pxToRem(px) {
		const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		return px / root;
	}

	function updatePosition() {
		const vh = window.innerHeight;
		const footerTop = footer.getBoundingClientRect().top;
		const overlapPx = Math.max(0, vh - footerTop);

		if (overlapPx <= 0) {
			// нет пересечения — отдаём контроль CSS (media-правилам)
			helper.style.bottom = '';
			return;
		}

		// есть пересечение: поднимаем на величину overlap, прибавляя к CSS-базе
		const totalRem = pxToRem(baseBottomPx + overlapPx);
		helper.style.bottom = `${totalRem}rem`;
	}

	// старт
	readBaseBottomFromCSS();
	updatePosition();

	// оптимизируем скролл
	let ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			updatePosition();
			ticking = false;
		});
	}

	// при ресайзе: заново читаем базовый bottom из CSS и обновляем позицию
	function onResize() {
		readBaseBottomFromCSS();
		updatePosition();
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onResize);
}

function initCustomSlider({
							  sliderSelector,
							  prevArrowSelector,
							  nextArrowSelector,
							  paginationSelector,
							  slideToShow = 4,
							  slideToShowLaptop = 3,
							  slideToShowTablet = 2,
							  slideToShowMobile = 1
						  }) {
	const $slider = $(sliderSelector);
	if (!$slider.length) return;

	const slidesCount = $slider.children().length;

	// Если слайдов меньше, чем нужно — не инициализируем
	if (slidesCount <= slideToShow) {
		$slider.addClass('is-static');
		$(prevArrowSelector).closest('.slider-nav').hide();
		$(paginationSelector).hide();
		return;
	}

	$slider.slick({
		slidesToShow: slideToShow,
		slidesToScroll: 1,
		infinite: true,
		speed: 600,
		arrows: true,
		dots: true,
		touchThreshold: 12,
		appendArrows: $(prevArrowSelector).closest('.slider-nav'),
		prevArrow: $(prevArrowSelector),
		nextArrow: $(nextArrowSelector),
		appendDots: $(paginationSelector),
		dotsClass: 'pagination',
		customPaging: function () {
			return '<button type="button" class="pagination__item pagination__item_green"></button>';
		},
		responsive: [
			{
				breakpoint: 1025,
				settings: {
					slidesToShow: slideToShowLaptop
				}
			},
			{
				breakpoint: 901,
				settings: {
					slidesToShow: slideToShowTablet
				}
			},
			{
				breakpoint: 651,
				settings: {
					slidesToShow: slideToShowMobile
				}
			}
		]
	});
}

function aosInit() {
	AOS.init({
		// duration: 500,
		// offset: -800,
	});
}

function initTabs(selector) {
	const tabContainers = document.querySelectorAll(selector);

	tabContainers.forEach(function(container) {
		const tabs = container.querySelectorAll('[role="tab"]');
		const panels = container.querySelectorAll('[role="tabpanel"]');

		tabs.forEach(function(tab, index) {
			tab.addEventListener('click', function() {
				activateTab(container, tabs, panels, index);
			});
		});
	});

	function activateTab(container, tabs, panels, index) {
		tabs.forEach(function(tab, i) {
			const isActive = i === index;
			tab.setAttribute('aria-selected', isActive);
			tab.setAttribute('tabindex', isActive ? '0' : '-1');
			tab.classList.toggle('tabs__tabs-btn_active', isActive);
		});

		panels.forEach(function(panel, i) {
			const isActive = i === index;
			panel.classList.toggle('is-hidden', !isActive);
			panel.setAttribute('aria-hidden', !isActive);
		});
	}

}

$.validator.addMethod('filesize', function (value, element, param) {
	let allSize = 0;

	$.each(element.files, function () {
		if (typeof this.size !== 'undefined') {
			allSize += this.size;
		}
	});

	return this.optional(element) || allSize <= param;
}, 'Размер файла не должен превышать 5 мегабайт');
$.validator.addMethod('fileType', function (value, element) {
	let allowedExtensions = ['pdf', 'pptx', 'docx', 'doc'];
	let fileName = element.files[0].name;
	let fileExtension = fileName.split('.').pop().toLowerCase();

	return this.optional(element) || $.inArray(fileExtension, allowedExtensions) !== -1;
}, 'Файл не допустимого типа. Разрешены: pdf, pptx, docx, doc');

$.validator.methods.email = function (value, element) {
	/* return this.optional(element) || /^[a-zA-Z0-9А-Яа-яёЁ.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9А-Яа-яёЁ](?:[a-zA-Z0-9А-Яа-яёЁ-]{0,61}[a-zA-Z0-9А-Яа-яёЁ])?(?:\.[a-zA-Z0-9А-Яа-яёЁ](?:[a-zA-Z0-9А-Яа-яёЁ-]{0,61}[a-zA-Z0-9А-Яа-яёЁ])?)*\.[a-zA-ZА-Яа-яёЁ]{2,}$/.test(value);*/
	let valueDecode = punycode.toUnicode(value);
	let regex = /^([A-Za-z0-9А-Яа-яёЁ_\-\.])+\@([A-Za-z0-9А-Яа-яёЁ_\-\.])+\.([A-Za-zА-Яа-яёЁ]{2,})$/;
	let arValue = valueDecode.split('@');

	if (arValue[1] && arValue[1].indexOf('..') !== -1) {
		return false;
	}

	return this.optional(element) || regex.test(valueDecode);
};

function setupValidationMessages() {
	const errorMessages = {
		en: {
			required: 'Fill in this field',
			email: 'Incorrect email',
		},
		ru: {
			required: 'Это поле обязательно для заполнения',
			email: 'Введите корректный email',
		},
		de: {
			required: 'Dieses Feld ist ein Pflichtfeld',
			email: 'Ungültige E-Mail-Adresse',
		},
		fr: {
			required: 'Ce champ est obligatoire',
			email: 'Adresse email incorrecte',
		}
	};

	const getPageLanguage = () => {
		const htmlLang = document.documentElement.getAttribute('lang');
		if (htmlLang && errorMessages[htmlLang]) return htmlLang;
	};

	const pageLang = getPageLanguage();

	$.extend($.validator.messages, errorMessages[pageLang] || errorMessages.en);
}

function updateOfficeStatus() {
	const root = document.getElementById('office-hours-widget');
	if (!root) return;

	const timeEl = document.querySelector('.contacts__time');
	const openBox = document.querySelector('.contacts__state.open');
	const closedBox = document.querySelector('.contacts__state.closed');

	const timeZone = root.dataset.timezone || 'Europe/Moscow';
	let schedule;

	try {
		schedule = JSON.parse(root.dataset.schedule || '{}');
	} catch (e) {
		console.error('Bad data-schedule JSON', e);
		schedule = {};
	}

	const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

	function nowInTZ(tz) {
		const now = new Date();

		const fmt = new Intl.DateTimeFormat('ru-RU', {
			timeZone: tz,
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		});
		const hhmm = fmt.format(now);

		const parts = new Intl.DateTimeFormat('en-CA', {
			timeZone: tz,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).formatToParts(now);

		const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
		const y = Number(map.year);
		const m = Number(map.month);
		const d = Number(map.day);
		const todayLocal = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
		const weekday = DOW[todayLocal.getUTCDay()];

		return {
			hhmm,
			y,
			m,
			d,
			weekday,
			yyyy_mm_dd: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
		};
	}

	function toMinutes(hhmm) {
		const [h, m] = hhmm.split(':').map(Number);
		return h * 60 + m;
	}

	function isOpenAt(schedule, info) {
		const exceptions = (schedule.exceptions || []).reduce((acc, [date, intervals]) => {
			acc[date] = intervals;
			return acc;
		}, {});

		let intervals = exceptions[info.yyyy_mm_dd];
		if (intervals == null) intervals = schedule[info.weekday] || [];

		const nowMin = toMinutes(info.hhmm);

		return intervals.some(([start, end]) => {
			const s = toMinutes(start);
			const e = toMinutes(end);
			if (s <= e) {
				return nowMin >= s && nowMin < e;
			} else {
				return nowMin >= s || nowMin < e;
			}
		});
	}

	const t = nowInTZ(timeZone);
	if (timeEl) timeEl.textContent = t.hhmm;

	const open = isOpenAt(schedule, t);
	if (openBox && closedBox) {
		openBox.classList.toggle('hidden', !open);
		closedBox.classList.toggle('hidden', open);
	}
}

function initFilterSort() {
	const sortBlock = document.querySelector('.filter__sort');
	if (!sortBlock) return;

	const btn = sortBlock.querySelector('.filter__sort-btn');
	const label = sortBlock.querySelector('.filter__sort-label');
	const menu = sortBlock.querySelector('.filter__sort-menu');
	const options = menu.querySelectorAll('.filter__sort-option');

	btn.addEventListener('click', () => {
		menu.classList.toggle('is-open');
	});

	menu.addEventListener('click', (e) => {
		if (e.target.matches('.filter__sort-option')) {
			const value = e.target.dataset.value;
			const text = e.target.textContent.trim();

			// Обновляем надпись в кнопке
			label.textContent = text;

			// Закрываем меню
			menu.classList.remove('is-open');

			// Поворачиваем иконку (через класс)
			btn.classList.toggle('is-reversed', value === 'old');

			// Подсветка активного пункта
			options.forEach(opt => opt.classList.remove('is-active'));
			e.target.classList.add('is-active');

			// Вызов сортировки (если нужно)
			console.log('Сортировка:', value);
		}
	});

	document.addEventListener('click', (e) => {
		if (!e.target.closest('.filter__sort')) {
			menu.classList.remove('is-open');
		}
	});
}

function initSearchClear() {
	const searchForm = document.querySelector('.search__search-form');
	const searchInput = searchForm?.querySelector('.search__search-input');
	const clearBtn = document.querySelector('.js-clear-search');

	if (clearBtn && searchInput) {
		clearBtn.addEventListener('click', (e) => {
			e.preventDefault();
			searchInput.value = '';
			searchInput.focus();
		});
	}
}

function initDatePicker() {
	const inputs = document.querySelectorAll('.js-init-datepicker');
	if (!inputs.length || typeof AirDatepicker === 'undefined') return;

	// Определяем язык сайта
	const currentLang = document.documentElement.lang || 'en';

	// Локали
	const locales = {
		ru: {
			days: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
			daysShort: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
			daysMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
			months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
			monthsShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
			today: 'Сегодня',
			clear: 'Очистить',
			dateFormat: 'dd/MM/yyyy',
			timeFormat: 'HH:mm',
			firstDay: 1
		},
		de: {
			days: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
			daysShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
			daysMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
			months: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
			monthsShort: ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
			today: 'Heute',
			clear: 'Löschen',
			dateFormat: 'dd.MM.yyyy',
			timeFormat: 'HH:mm',
			firstDay: 1
		},
		fr: {
			days: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
			daysShort: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
			daysMin: ['Di','Lu','Ma','Me','Je','Ve','Sa'],
			months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
			monthsShort: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'],
			today: 'Aujourd’hui',
			clear: 'Effacer',
			dateFormat: 'dd/MM/yyyy',
			timeFormat: 'HH:mm',
			firstDay: 1
		},
		en: {
			days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
			daysShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			daysMin: ['Su','Mo','Tu','We','Th','Fr','Sa'],
			months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
			monthsShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
			today: 'Today',
			clear: 'Clear',
			dateFormat: 'MM/dd/yyyy',
			timeFormat: 'HH:mm',
			firstDay: 0
		}
	};

	// Фолбэк, если язык не найден
	const locale = locales[currentLang] || locales.en;

	// Инициализация для всех инпутов
	inputs.forEach(input => {
		new AirDatepicker(input, {
			locale: locale,
			dateFormat: 'dd/MM/yyyy',
			autoClose: true,
			maxDate: new Date(),
			// isMobile: window.innerWidth < 650,  // ← адаптивное определение
			isMobile: false,
			position: 'bottom right',

			// Для мобильных добавляем кнопку
			// buttons: window.innerWidth < 650 ? ['clear', {
			// 	content: locale.today || 'Today',
			// 	onClick: (dp) => {
			// 		dp.hide();
			// 	}
			// }] : ['clear']
		});
	});
}

function initDateMask() {
	const $inputs = $('.js-init-datepicker');
	if (!$inputs.length || typeof $.fn.mask === 'undefined') return;

	$inputs.mask('00/00/0000');
}

// Инициализация всех кастомных селектов (Select2)
function initCustomSelects(context = document) {
	const $root = $(context);
	const $selects = $root.find('.js-custom-select select');

	if (!$selects.length || !$.fn.select2) return;

	// какие селекты чем наполнять
	const DATA_SOURCES = {
		'#native-lang': '/select-options/select-lang.json',
		'#citizenship': '/select-options/select-citizenship.json',
		'#region': '/select-options/select-region.json',
	};

	// язык из <html lang="...">
	const lang = (document.documentElement.lang || 'en').toLowerCase();

	const i18n = {
		ru: {
			errorLoading: () => 'Результаты не могут быть загружены.',
			inputTooShort: a => `Введите ещё ${a.minimum - a.input.length} символ(а)`,
			loadingMore: () => 'Загрузка…',
			maximumSelected: a => `Вы можете выбрать не более ${a.maximum} элемент(ов)`,
			noResults: () => 'Ничего не найдено',
			searching: () => 'Поиск…',
			removeAllItems: () => 'Удалить все элементы'
		},
		de: {
			errorLoading: () => 'Die Ergebnisse konnten nicht geladen werden.',
			inputTooShort: a => `Bitte ${a.minimum - a.input.length} Zeichen eingeben`,
			loadingMore: () => 'Lade mehr…',
			maximumSelected: a => `Sie können nur ${a.maximum} Element(e) auswählen`,
			noResults: () => 'Keine Ergebnisse gefunden',
			searching: () => 'Suchen…',
			removeAllItems: () => 'Alle entfernen'
		},
		fr: {
			errorLoading: () => 'Les résultats ne peuvent pas être chargés.',
			inputTooShort: a => `Saisissez encore ${a.minimum - a.input.length} caractère(s)`,
			loadingMore: () => 'Chargement…',
			maximumSelected: a => `Vous ne pouvez sélectionner que ${a.maximum} élément(s)`,
			noResults: () => 'Aucun résultat',
			searching: () => 'Recherche…',
			removeAllItems: () => 'Tout supprimer'
		},
		en: {
			errorLoading: () => 'The results could not be loaded.',
			inputTooShort: a => `Please enter ${a.minimum - a.input.length} more character(s)`,
			loadingMore: () => 'Loading more…',
			maximumSelected: a => `You can only select ${a.maximum} item(s)`,
			noResults: () => 'No results found',
			searching: () => 'Searching…',
			removeAllItems: () => 'Remove all items'
		}
	};

	const buildSelect2 = ($el) => {
		if ($el.data('select2')) $el.select2('destroy');

		const $parent = $el.closest('.form__select');
		const placeholder =
			$el.attr('data-placeholder') ||
			($el.find('option[disabled][selected]').first().text() || '');

		$el.select2({
			width: '100%',
			dropdownAutoWidth: true,
			dropdownParent: $parent.length ? $parent : $(document.body),
			placeholder: placeholder || undefined,
			allowClear: !!placeholder,
			minimumResultsForSearch: 8,  // сделай Infinity чтобы отключить поиск
			language: i18n[lang] || i18n.en,
			dropdownPosition: 'below'
		});
	};

	$selects.each(function () {
		const $el = $(this);
		const id = this.id ? ('#' + this.id) : null;
		const src = id && DATA_SOURCES[id];

		// если источника нет — просто инициализируем
		if (!src) {
			buildSelect2($el);
			return;
		}

		// сохраняем плейсхолдер
		const $ph = $el.find('option[disabled][selected]').first();
		// очищаем текущие опции, кроме плейсхолдера
		$el.find('option').not($ph).remove();

		$.getJSON(src)
			.done(function (items) {
				// ожидается массив объектов { value, label }
				const frag = document.createDocumentFragment();
				items.forEach(item => {
					const opt = new Option(item.label, item.value, false, false);
					frag.appendChild(opt);
				});
				$el.append(frag);
				buildSelect2($el);
			})
			.fail(function () {
				// даже если не загрузилось — инициализируем, чтобы не ломать UX
				buildSelect2($el);
			});
	});
}

function initFilePond() {
	if (!window.FilePond) return;

	FilePond.registerPlugin(
		FilePondPluginFileValidateType,
		FilePondPluginFileValidateSize
	);

	FilePond.setOptions({
		allowFileTypeValidation: true,
		// Разрешаем только по расширениям
		acceptedFileTypes: ['.pdf', '.doc', '.docx'],
		fileValidateTypeDetectType: (source, type) =>
			new Promise(resolve => {
				const name = (source?.name || '').toLowerCase();
				if (name.endsWith('.docx')) return resolve('.docx');
				if (name.endsWith('.doc')) return resolve('.doc');
				if (name.endsWith('.pdf')) return resolve('.pdf');
				resolve(type);
			}),

		labelIdle:
			'Перетащите файлы сюда или <span class="filepond--label-action">выберите</span>',
		labelFileTypeNotAllowed: 'Недопустимый тип файла',
		fileValidateTypeLabelExpectedTypes: 'Ожидаются PDF, DOC или DOCX',
		maxFileSize: '5MB',
		labelMaxFileSizeExceeded: 'Файл слишком большой',
		labelMaxFileSize: 'Максимальный размер: {filesize}',
	});

	const inputs = document.querySelectorAll('.js-upload input[type="file"]');
	inputs.forEach(input => {
		if (input.dataset.filepondAttached === 'true') return;
		FilePond.create(input, {
			allowMultiple: input.hasAttribute('multiple'),
			maxFiles: 5,
		});
		input.dataset.filepondAttached = 'true';
	});

	document.addEventListener('FilePond:addfile', e => {
		const file = e.detail?.file?.file;
		if (file) console.log('Добавлен файл:', file.name, 'type:', file.type);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	setupValidationMessages();
	openFormSearch();
	validateSearchForm();
	initLanguageDropdown();
	fixedMenu();
	initBurgerMenu();
	initPromoSlider();
	initMainServicesSlider();
	initMainAdvantagesSlider();
	initStagesSliders();
	// initAiHelperStick();
	initCustomSlider({
		sliderSelector: '.js-about-team',
		prevArrowSelector: '.about-team__nav_prev',
		nextArrowSelector: '.about-team__nav_next',
		paginationSelector: '.about-team__pagination',
		slideToShow: 4
	});
	initCustomSlider({
		sliderSelector: '.js-partners',
		prevArrowSelector: '.partners__nav_prev',
		nextArrowSelector: '.partners__nav_next',
		paginationSelector: '.partners__pagination',
		slideToShow: 4
	});
	initCustomSlider({
		sliderSelector: '.js-about-approach-slider',
		prevArrowSelector: '.about-approach__nav_prev',
		nextArrowSelector: '.about-approach__nav_next',
		paginationSelector: '.about-approach__pagination',
		slideToShow: 1,
		slideToShowLaptop: 1,
		slideToShowTablet: 1,
		slideToShowMobile: 1
	});
	initTabs('.js-tabs-init');
	updateOfficeStatus();
	setInterval(updateOfficeStatus, 15000);
	initFilterSort();
	initSearchClear();
	initDatePicker();
	initDateMask();
	initCustomSelects();

	setTimeout(() => {
		aosInit();
	}, 100)
});

