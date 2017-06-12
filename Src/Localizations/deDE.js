"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     11.06.2017
 * Time     14:56
 */

// The translation was made by Yvonne Limbach

var g_oLocalization_deDE = {

	locale : "de-DE",

	loginScreen : {

		login    : "Nutzername",
		password : "Passwort",
		connect  : "Auf KGS spielen",
		remember : "Passwort merken",

		about : "About"
	},

	mainRoom : {
		roomsButton : "Räume",
		playButton  : "Spielen",
		exitButton  : "Logout",

		playMenu : {
			createChallenge      : "Neue Partie",
			yourChallenge        : "Deine offene Partie",
			cancelAutomatch      : "Automatch abbrechen",
			startAutomatch       : "Automatch starten",
			automatchPreferences : "Automatch Einstellungen",
			startDemonstration   : "Demonstration starten",
			loadFile             : "Datei laden"
		},

		findPlayer : "Spieler suchen",

		search             : "Suche",
		searchRoom         : "Raum suchen",
		searchRoomHint     : "In der gesamten Raumliste suchen",
		chatWithPlayer     : "Chat starten",
		chatWithPlayerHint : "Privaten Chat starten",

		gamesTabs : {
			games            : "Aktive Partien",
			challenges       : "Offene Partien",
			challengesNoBots : "Offene Partien (ohne Bots)",
			room             : "Raum",
			followed         : "Fanpartien"
		},

		statistics : {
			label      : "Raumstatistik",
			users      : "Spieler",
			games      : "Aktive Partien",
			challenges : "Offene Partien"
		},

		gamesList : {
			contextMenuJoin     : "Partie Beitreten",
			contextMenuObserve  : "Zuschauen",
			contextMenuCopyLink : "Link in den Chat kopieren",

			listHeaderType      : "Art",
			listHeaderWhiteRank : "WR",
			listHeaderBlackRank : "SR",
			listHeaderWhiteName : "Weiß",
			listHeaderBlackName : "Schwarz",
			listHeaderSize      : "Brettgröße",
			listHeaderRules     : "Regeln",
			listHeaderRoom      : "Raum",
			listHeaderObservers : "Zuschauer",
			listHeaderMove      : "Zug",
			listHeaderComment   : "Kommentar",
			listHeaderRank      : "Rang",
			listHeaderName      : "Name",
			listHeaderTime      : "Zeit",
			listHeaderKomi      : "Komi",
			listHeaderResult    : "Ergebnis",
			listHeaderDate      : "Datum",

			listAdditionalRobot : "Bot"
		},

		playersList : {
			contextMenuTalkTo      : "Reden mit...",
			contextMenuViewInfo    : "Spielerprofil ansehen",
			contextMenuFriend      : "Freund",
			contextMenuCensored    : "Zensiert",
			contextMenuFollow      : "Fan",
			contextMenuCopyLink    : "Link in den Chat kopieren",
			contextMenuGiveControl : "Kontrolle übergeben",

			listHeaderName : "Name",
			listHeaderRank : "Rang"
		},

		roomsTabs : {
			hint : {
				close          : "Raum verlassen",
				moveTabToStart : "Raum an den Anfang der Liste verschieben",
				userInfo       : "Spielerprofil",
				roomInfo       : "Rauminfo",
				soundOn        : "Benachrichtigung an",
				soundOff       : "Benachrichtigung aus"
			}
		},

		closeGameRoomHint : "Raum verlassen"
	},

	gameRoom : {

		gameStart : "Partie gestartet",
		gameOver  : "Partie beendet",
		move      : "Zug",
		pass      : "Passen",

		points   : "Punkte",
		captures : "Gefangene",

		blackToPlay : "Schwarz am Zug",
		whiteToPlay : "Weiß am Zug",

		backToGame       : "Zurück zum Spiel",
		removeOwnChanges : "Eigene Änderungen rückgängig machen",
		returnControl    : "Kontrolle zurückgeben",
		editorControl    : "Reviewkontrolle",

		addMinute1 : "1 Minute hinzufügen",
		addMinute5 : "5 Minuten hinzufügen",

		startReview : "Partie analysieren",

		labelPlaceholder : "Text...",

		button : {
			undo    : "Zug zurücknehmen",
			resign  : "Aufgeben",
			pass    : "Passen",
			analyze : "Analysieren",

			hint : {
				forward1      : "Nächster Zug",
				forward5      : "5 Züge vorwärts",
				forwardEnd    : "Zum Ende der Partie",
				backward1     : "Letzter Zug",
				backward5     : "5 Züge zurück",
				backwardStart : "Zurück zum Anfang",
				nextVariant   : "Nächste Variante",
				prevVariant   : "Vorherige Variante",

				editMode          : "Reviewtools",
				editModeMoves     : "Züge",
				editModeScores    : "Auszählen",
				editModeEditor    : "Steine entfernen/hinzufügen",
				editModeTriangles : "Dreiecke",
				editModeSquares   : "Quadrate",
				editModeCircles   : "Kreise",
				editModeXMarks    : "X-Markierungen",
				editModeText      : "Textmarkierungen",
				editModeNumbers   : "Zahlenmarkierungen",
				editModeColors    : "Farbmarkierungen",

				startAutoplay : "Autoplay atarten",
				stopAutoplay  : "Autoplay stoppen",

				gameInfo : "Partieinfo",

				showKifu       : "Kifu anzeigen",
				toggleKifuMode : "Den nächsten Zug raten"
			}
		},

		countingScores : {
			header  : "Gefangene markieren",
			message : "Die Spieler markieren die aus ihrer Sicht toten Steine. Nachdem beide Seiten der Markierung zugestimmt haben steht der Gewinner fest.",

			buttonAccept : "OK",
			buttonResume : "Zurück zum Spiel"
		},

		toolbarCustomization : {
			mainNavigation : "Hauptnavigation",
			treeNavigation : "Variante wechseln",
			generalToolbar : "Reviewfunktionen",
			autoplay       : "Autoplay",
			timelinePanel  : "Zeitleiste",
			kifuMode       : "Kifu-Optionen"
		},

		menu : {

			hint : "Menü",

			downloadSGF           : "Partie als SGF herunterladen",
			createSnapshot        : "Screenshot vom Brett aufnehmen",
			exportToGif           : "Als GIF exportieren",
			convertToASCIIDiagram : "In ASCII-Diagramm konvertieren",
			scoreEstimator        : "Ergebnis schätzen",
			toggleCoordinates     : "Brettkoordinaten",
			createNew             : "Neu",
			loadFile              : "Von der Festplatte laden",
			loadFileFromClipboard : "Aus der Zwischenablage laden",
			gameInfo              : "Partieinfo",
			cropBoard             : "Brettausschnitt wählen"
		},

		window : {
			gameInfo : {
				caption : "Partieinfo",

				gameName     : "Name der Partie",
				result       : "Ergebnis",
				rules        : "Regeln",
				komi         : "Komi",
				handicap     : "Vorgabe",
				timeSettings : "Zeiteinstellungen",
				black        : "Schwarz",
				blackRank    : "Rang Schwarz",
				white        : "Weiß",
				whiteRank    : "Rang Weiß",
				copyright    : "Copyright",
				date         : "Datum",
				event        : "Event",
				round        : "Runde",
				place        : "Ort",
				annotator    : "Kommentator",
				fuseki       : "Fuseki",
				source       : "Quelle",
				transcriber  : "Mitschreiber",
				gameInfo     : "Partieinfo"
			},

			colorsCounter : {
				caption : "Farbauswahl",
				red     : "Rot",
				blue    : "Blau",
				green   : "Grün",
				gray    : "Grau"
			},

			creatingGIF : {
				caption : "GIF wird erzeugt..."
			},

			asciiDiagram : {
				caption : "ASCII-Diagramm"
			},

			boardCropping : {
				caption      : "Brettausschnitt wählen",
				errorMessage : "Der gewählte Brettausschnitt ist zu klein.",
				buttonReset  : "Zurücksetzen"
			},

			error : {
				caption : "Fehler"
			},

			kifu : {
				caption : "Kifu",
				end     : "Ende",
				next    : "Weiter"
			}

		}
	},

	common : {

		gameResult : {
			resign  : "Aufgabe",
			time    : "Zeit",
			forfeit : "Verwirkt",
			even    : "Jigo"
		},

		black      : "Schwarz",
		white      : "Weiß",
		shortBlack : "S",
		shortWhite : "W",

		button : {
			ok     : "OK",
			cancel : "Abbrechen",
			create : "Erstellen",
			close  : "Schließen",
			submit : "Absenden",
			edit   : "Bearbeiten",
			save   : "Speichern",
			add    : "Hinzufügen",
			remove : "Entfernen",
			change : "Ändern"
		},

		timeSystem : {
			absolute : "Absolut",
			byoYomi  : "Byoyomi",
			canadian : "Kanadisch",
			none     : "Ohne Zeitlimit"
		},

		rules : {
			japanese   : "Japanisch",
			chinese    : "Chinesisch",
			aga        : "AGA",
			newZealand : "Neuseeländisch"
		},

		connectionStatus : {
			online     : "Online",
			secondsAgo : function(nSeconds)
			{
				return "vor " + nSeconds + " Sekunde(n)";
			},
			minutesAgo : function(nMinutes)
			{
				return "vor " + nMinutes + " Minute(n)";
			},
			hoursAgo   : function(nHours)
			{
				return "vor " + nHours + " Stunde(n)";
			},
			daysAgo    : function(nDays)
			{
				return "vor " + nDays + " Tag(en)";
			}
		},

		months : {
			Jan : "Jan",
			Feb : "Feb",
			Mar : "Mrz",
			Apr : "Apr",
			May : "Mai",
			Jun : "Jun",
			Jul : "Jul",
			Aug : "Aug",
			Sep : "Sep",
			Oct : "Okt",
			Nov : "Nov",
			Dec : "Dez"
		},

		privateFlag : "Privat",

		about : {
			caption          : "About",
			version          : "Version",
			visitMessage     : "Hinterlasse Feedback oder Fehlermeldungen beim Github-Projekt:",
			allRightReserved : "Alle Rechte vorbehalten.",
			translatedBy     : "Übersetzt von Yvonne Limbach."
		},

		minimizeButtonHint : "Minimieren",

		window : {
			captionError   : "Fehler",
			captionWarning : "Warnung",

			messageNoUserWithName    : function(sUserName)
			{
				return "Es gibt keinen User mit dem Namen \"" + sUserName + "\" auf diesem Server.";
			},
			messageNoUser            : "Dieser User existiert nicht.",
			messageRoomIsPrivate     : function(sRoomName)
			{
				return "Der Raum " + sRoomName + " ist privat. Du kannst ihn nicht betreten.";
			},
			messageAlreadyPlaying    : "Du spielst bereits eine Partie. Du musst du die aktuelle Partie beenden bevor du eine Neue starten kannst.",
			messageChallengeDeclined : "Deine Herausforderung wurde abgelehnt."
		}

	},

	KGS : {

		gameType : {
			free          : "Frei",
			ranked        : "Gewertet",
			teaching      : "Lehrpartie",
			simulation    : "Simultan",
			demonstration : "Demonstration",
			rengo         : "Rengo"
		},

		window : {

			common : {
				captionGameWarning : "Warnung"
			},

			roomsList : {
				caption             : "Raumliste",
				searchPlaceholder   : "Raumnamen hier eingeben",
				listHeaderName      : "Name",
				listHeaderCategory  : "Kategorie",
				categoryMain        : "Haupträume",
				categoryClubs       : "Clubs",
				categoryNational    : "Nationale Räume",
				categoryNewRooms    : "Neue Räume",
				categoryLessons     : "Lektionen",
				categorySocial      : "Gesellschaftliche Räume",
				categoryTournaments : "Turniere"
			},

			automatchSetup : {
				caption       : "Automatch Einstellungen",
				estimatedRank : "Rang",
				human         : "Mensch",
				robot         : "Bot",
				unranked      : "Gegner ohne Rang",
				maxHandicap   : "Maximale Vorgabe",
				ranked        : "Gewertete Partie",
				free          : "Freie Partie",
				medium        : "Mittel",
				fast          : "Schnell",
				blitz         : "Blitz"
			},

			challenge : {

				captionNewChallenge   : "Neue Partie",
				captionNewDemo        : "Neue Demonstration",
				captionYourChallenge  : "Deine offene Partie",
				captionNewGameVs      : "Neue Partie gegen...",
				captionNewGame        : "Neue Partie",
				captionPressOkToStart : "Klicke auf OK um die Partie zu starten.",
				captionWaiting        : "Warte auf Rückmeldung des Gegners...",

				privateFlag        : "Privat",
				commentPlaceHolder : "Kein Kommentar",
				switchColorsHint   : "Farben wechseln",
				fieldRoom          : "Raum",
				fieldRules         : "Regeln",
				fieldBorderSize    : "Brettgröße",
				fieldHandicap      : "Vorgabe",
				fieldKomi          : "Komi",
				fieldTimeSystem    : "Zeitsystem",
				fieldMainTime      : "Grundbedenkzeit",
				fieldByoYomiTime   : "Byoyomi",
				fieldPeriods       : "Perioden",
				fieldStones        : "Züge",

				buttonRetry     : "Abbrechen",
				buttonRetryHint : "Aktuelle Anfrage abbrechen",

				challengerHint : "Spielerprofil ansehen",

				buttonDecline     : "Ablehnen",
				buttonDeclineHint : "Diesen Spieler ablehnen"
			},

			roomInfo : {
				caption : "Rauminfo"
			},

			undoRequest : {
				buttonNeverUndo : "Rücknahme generell ablehnen",
				message         : "Dein Gegner hat um die Rücknahme seines letzten Zuges gebeten. Soll der letzte Zug rückgängig gemacht werden?"
			},

			userInfo : {
				tabInfo     : "Profil",
				tabGames    : "Partien",
				tabRank     : "Rang",
				tabFriends  : "Freunde",
				tabCensored : "Zensiert",
				tabFuns     : "Fans",

				rankGraphReplacementText : "Kein Ranggraph verfügbar",

				fieldUserName     : "Spielername",
				fieldRealName     : "Richtiger Name",
				fieldRank         : "Rang",
				fieldLastOn       : "Zuletzt online",
				fieldRegisteredOn : "Registriert am",
				fieldLocale       : "Clientsprache",
				fieldEmail        : "E-Mail",
				fieldGames        : "Partien",
				fieldRecentGames  : "Letzte Partien",

				flagPrivateEmail         : "E-Mailadresse vor anderen Usern verbergen?",
				flagReceiveAnnouncements : "Nachrichten von KGS erhalten?",
				flagOnlyRanked           : "Nur gewertete Partien",

				emailPrivate : "Privat",

				userslistNamePlaceholder  : "Spielername",
				userslistNotesPlaceholder : "Text",

				gamesArchive : {
					contextMenu : {
						observe  : "Live zuschauen",
						view     : "Anschauen",
						download : "Speichern",
						loadIn   : "Ladend in...",
						loadPIn  : "Privat laden in..."
					}
				}
			}

		}
	}
};