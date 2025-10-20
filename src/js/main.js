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
							  slideToShow = 4
						  }) {
	const $slider = $(sliderSelector);
	if (!$slider.length) return;

	const slidesCount = $slider.children().length;

	// Аналог watchOverflow — если слайдов меньше, чем нужно, не инициализируем
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
		customPaging: function() {
			return '<button type="button" class="pagination__item pagination__item_green"></button>';
		},
		responsive: [
			{
				breakpoint: 1025,
				settings: {
					slidesToShow: 3
				}
			},
			{
				breakpoint: 901,
				settings: {
					slidesToShow: 2
				}
			},
			{
				breakpoint: 651,
				settings: {
					slidesToShow: 1
				}
			},
		]
	});

}

function aosInit() {
	AOS.init({
		// duration: 500,
	});
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
	aosInit();
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
});
