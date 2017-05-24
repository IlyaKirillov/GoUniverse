"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     10.05.2017
 * Time     17:10
 */

var g_oLocalization_ruRU = {

	locale : "ru-RU",

	loginScreen : {

		login    : "Логин",
		password : "Пароль",
		connect  : "Играть на KGS",
		remember : "Запомнить мой пароль",

		about : "О программе"
	},

	mainRoom : {
		roomsButton : "Комнаты",
		playButton  : "Играть",
		exitButton  : "Выход",

		playMenu : {
			createChallenge      : "Новый вызов",
			yourChallenge        : "Ваш вызов",
			cancelAutomatch      : "Отменить автоподбор",
			startAutomatch       : "Начать автоподбор",
			automatchPreferences : "Настройки автоподбора",
			startDemonstration   : "Демонстрационная партия",
			loadFile             : "Загрузить файл"
		},

		findPlayer   : "найти игрока",
		search       : "Поиск",
		searchRoom   : "Найти комнату",
		searchPlayer : "Найти игрока",


		gamesTabs : {
			games            : "Партии",
			challenges       : "Вызовы",
			challengesNoBots : "Вызовы (без роботов)",
			room             : "Комната",
			followed         : "Наблюдаемые"
		},

		statistics : {
			label      : "Статистика комнаты",
			users      : "Пользователей",
			games      : "Партий",
			challenges : "Вызовов"
		},

		gamesList : {
			contextMenuJoin     : "Присоединиться",
			contextMenuObserve  : "Наблюдать",
			contextMenuCopyLink : "Скопировать ссылку в чат",

			listHeaderType      : "Тип",
			listHeaderWhiteRank : "рб",
			listHeaderBlackRank : "рч",
			listHeaderWhiteName : "Белые",
			listHeaderBlackName : "Черные",
			listHeaderSize      : "Размер",
			listHeaderRules     : "Правила",
			listHeaderRoom      : "Комната",
			listHeaderObservers : "Наблюдателей",
			listHeaderMove      : "Ход",
			listHeaderComment   : "Комментарий",
			listHeaderRank      : "Ранк",
			listHeaderName      : "Имя",
			listHeaderTime      : "Время",
			listHeaderKomi      : "Коми",
			listHeaderResult    : "Результат",
			listHeaderDate      : "Дата",

			listAdditionalRobot : "робот"
		},

		playersList : {
			contextMenuTalkTo      : "Говорить с...",
			contextMenuViewInfo    : "Посмотреть информацию",
			contextMenuFriend      : "Друзья",
			contextMenuCensored    : "Заглушен",
			contextMenuFollow      : "Следить",
			contextMenuCopyLink    : "Скопировать ссылку в чат",
			contextMenuGiveControl : "Передать контроль",

			listHeaderName : "Имя",
			listHeaderRank : "Рейтинг"
		}

	},

	gameRoom : {

		gameStart : "Начало партии",
		gameOver  : "Партия закончена",
		move      : "Ход",
		pass      : "Пас",
		points    : "Очки",
		captures  : "Пленники",
		blackToPlay : "Ход черных",
		whiteToPlay : "Ход белых",

		backToGame       : "Вернуться к партии",
		removeOwnChanges : "Удалить свои изменения",
		returnControl    : "Вернуть контроль",
		editorControl    : "Управление редактором",

		addMinute1 : "Добавить 1 минуту",
		addMinute5 : "Добавить 5 минут",

		startReview : "Начать разбор",

		button : {
			undo    : "Ход назад",
			resign  : "Сдаться",
			pass    : "Пас",
			analyze : "Анализировать",

			hint : {
				forward1      : "Вперед",
				forward5      : "Вперед на 5 ходов",
				forwardEnd    : "В конец",
				backward1     : "Назад",
				backward5     : "Назад на 5 ходов",
				backwardStart : "В начало",
				nextVariant   : "Следующий вариант",
				prevVariant   : "Предыдущий вариант",

				editMode          : "Выберите режим редактирования",
				editModeMoves     : "Ходы",
				editModeScores    : "Подсчет очков",
				editModeEditor    : "Добавление/удаление камней",
				editModeTriangles : "Треугольники",
				editModeSquares   : "Квадраты",
				editModeCircles   : "Окружности",
				editModeXMarks    : "Крестики",
				editModeText      : "Текстовые метки",
				editModeNumbers   : "Числовые метки",
				editModeColors    : "Цветные метки",

				startAutoplay : "Начать автопроигрывание",
				stopAutoplay  : "Остановить автопроигрывание",

				gameInfo : "Информация о партии",

				showKifu       : "Показать кифу партии",
				toggleKifuMode : "Переключить режим кифу"

			}
		},

		countingScores : {
			header  : "Стадия подсчета очков",
			message : "Оба игрока сейчас выбирают и соглашаются какие группы считаются пленными, с целью подсчета очков.",

			buttonAccept : "Согласиться",
			buttonResume : "Отменить и продолжить партию"
		},

		toolbarCustomization : {
			mainNavigation : "Основная навигация",
			treeNavigation : "Навигация по вариантам",
			generalToolbar : "Общая панель инструментов",
			autoplay       : "Автопроигрывание",
			timelinePanel  : "Слайдер по ходам",
			kifuMode       : "Режим кифу"
		},

		menu : {

			hint : "Меню",

			downloadSGF           : "Скачать SGF",
			createSnapshot        : "Сделать снимок доски",
			exportToGif           : "Экспортировать в GIF",
			convertToASCIIDiagram : "Сконвертировать в ASCII-диаграмму",
			scoreEstimator        : "Оценка счета",
			toggleCoordinates     : "Переключатель координат",
			createNew             : "Создать",
			loadFile              : "Загрузить с диска",
			loadFileFromClipboard : "Загрузить из буфера",
			gameInfo              : "Информация о партии"
		},

		window : {
			gameInfo : {
				caption : "Информация о партии",

				gameName     : "Название партии",
				result       : "Результат",
				rules        : "Правила",
				komi         : "Коми",
				handicap     : "Фора",
				timeSettings : "Регламент времени",
				black        : "Черные",
				blackRank    : "Рейтинг черных",
				white        : "Белые",
				whiteRank    : "Рейтинг белых",
				copyright    : "Авторские права",
				date         : "Дата",
				event        : "Событие",
				round        : "Раунд",
				place        : "Место",
				annotator    : "Комментатор",
				fuseki       : "Фусэки",
				source       : "Источник",
				transcriber  : "Транслятор",
				gameInfo     : "Информация"
			},

			settings : {
				caption : "Settings"
			}

		}
	},

	common : {

		gameResult : {
			resign  : "Сдача",
			time    : "Время",
			forfeit : "Штраф",
			even    : "Ничья"
		},

		black      : "Черные",
		white      : "Белые",
		shortBlack : "Ч",
		shortWhite : "Б",

		button : {
			ok     : "OK",
			cancel : "Отмена",
			create : "Создать",
			close  : "Закрыть",
			submit : "Отправить",
			edit   : "Редактировать",
			save   : "Сохранить",
			add    : "Добавить",
			remove : "Удалить",
			change : "Изменить"
		},

		timeSystem : {
			absolute : "Абсолют",
			byoYomi  : "Беёми",
			canadian : "Канадский",
			none     : "Без лимита"
		},

		rules : {
			japanese   : "Японские",
			chinese    : "Китайские",
			aga        : "АГА",
			newZealand : "Новозеландские"
		},

		connectionStatus : {
			online     : "в сети",
			secondsAgo : "секунд назад",
			minutesAgo : "минут назад",
			hoursAgo   : "часов назад",
			daysAgo    : "дней назад"
		},

		months : {
			Jan : "Янв",
			Feb : "Фев",
			Mar : "Мрт",
			Apr : "Апр",
			May : "Май",
			Jun : "Июн",
			Jul : "Июл",
			Aug : "Авг",
			Sep : "Сен",
			Oct : "Окт",
			Nov : "Нбр",
			Dec : "Дек"
		},

		privateFlag : "Приватная"
	},

	KGS : {

		gameType : {
			free          : "Свободная",
			ranked        : "Рейтинговая",
			teaching      : "Обучающая",
			simulation    : "Сеанс",
			demonstration : "Демонстрация",
			rengo         : "Ренго"
		},

		window : {

			common : {
				captionGameWarning : "Предупреждение"
			},

			roomsList : {
				caption             : "Список комнат",
				searchPlaceholder   : "Введите название комнаты",
				listHeaderName      : "Название",
				listHeaderCategory  : "Категория",
				categoryMain        : "Основные",
				categoryClubs       : "Клубы",
				categoryNational    : "Национальные",
				categoryNewRooms    : "Новые",
				categoryLessons     : "Обучающие",
				categorySocial      : "Общение",
				categoryTournaments : "Турнирные"
			},

			automatchSetup : {
				caption       : "Настройки автоподбора",
				estimatedRank : "Предполагаемый рейтинг",
				human         : "Человек",
				robot         : "Робот",
				unranked      : "Соперник без рейтинга",
				maxHandicap   : "Максимальная фора",
				ranked        : "Рейтинговая игра",
				free          : "Свободная игра",
				medium        : "Медленная",
				fast          : "Быстрая",
				blitz         : "Блиц"
			},

			challenge : {

				captionNewChallenge   : "Новая партия",
				captionNewDemo        : "Новая демонстрация",
				captionYourChallenge  : "Ваш вызов",
				captionNewGameVs      : "Новая партия против",
				captionNewGame        : "Новая партия",
				captionPressOkToStart : "Нажмите OK для начала игры",
				captionWaiting        : "Ожидание...",

				privateFlag        : "Приватная",
				commentPlaceHolder : "Без комментария",
				switchColorsHint   : "Поменяться цветами",
				fieldRoom          : "Комната",
				fieldRules         : "Правила",
				fieldBorderSize    : "Размер доски",
				fieldHandicap      : "Фора",
				fieldKomi          : "Коми",
				fieldTimeSystem    : "Регламент времени",
				fieldMainTime      : "Основное время",
				fieldByoYomiTime   : "Время беёми",
				fieldPeriods       : "Периоды беёми",
				fieldStones        : "Ходов за беёми",

				buttonRetry     : "Повтор",
				buttonRetryHint : "Отменить текущее предложение",

				challengerHint  : "Посмотреть информацию"
			},

			roomInfo : {
				caption : "Информация о комнате"
			},

			undoRequest : {
				buttonNeverUndo : "Запретить возврат хода",
				message         : "Соперник попросил взять свой последний ход назад. Разрешить взятие хода назад?"
			},

			userInfo : {
				tabInfo     : "Информация",
				tabGames    : "Партии",
				tabRank     : "Рейтинг",
				tabFriends  : "Друзья",
				tabCensored : "Заглушенные",
				tabFuns     : "Наблюдаемые",

				rankGraphReplacementText : "Нет данных",

				fieldUserName     : "Имя пользователя",
				fieldRealName     : "Настоящее имя",
				fieldRank         : "Рейтинг",
				fieldLastOn       : "Последнее посещение",
				fieldRegisteredOn : "Зарегистрирован",
				fieldLocale       : "Язык",
				fieldEmail        : "Эл. адрес",
				fieldGames        : "Статистика",
				fieldRecentGames  : "Последние игры",

				flagPrivateEmail         : "Скрывать адрес от других пользователей?",
				flagReceiveAnnouncements : "Получать рассылку KGS?",
				flagOnlyRanked           : "Только рейтинговые игры",

				emailPrivate : "скрыт",

				userslistNamePlaceholder  : "Имя пользователя",
				userslistNotesPlaceholder : "Заметки",

				gamesArchive : {
					contextMenu : {
						observe  : "Наблюдать",
						view     : "Посмотреть",
						download : "Скачать на диск",
						loadIn   : "Загрузить в...",
						loadPIn  : "Загрузить приватно в..."
					}
				}
			}
		}
	}
};

ExtendLocalization(g_oLocalization_ruRU, g_oDefaultLocalization);
