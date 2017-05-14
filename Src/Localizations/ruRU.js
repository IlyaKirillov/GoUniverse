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

	common : {

		gameResult : {
			resign  : "Сдача",
			time    : "Время",
			forfeit : "Штраф"
		},

		black      : "Черные",
		white      : "Белые",
		shortBlack : "Ч",
		shortWhite : "Б",

		button : {
			ok     : "OK",
			canel  : "Отмена",
			create : "Создать",
			close  : "Закрыть",
			submit : "Отправить"
		},

		timeSystem : {
			absolute : "Абсолют",
			byoYomi  : "Беёми",
			canadian : "Канадский",
			none     : "Без лимита"
		},

		rules : {
			japanese  : "Японские",
			chinese   : "Китайские",
			aga       : "АГА",
			newZeland : "Новозеландские"
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
			}
		}
	}
};

ExtendLocalization(g_oLocalization_ruRU, g_oDefaultLocalization);
