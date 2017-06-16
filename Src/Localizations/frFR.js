"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     07.06.2017
 * Time     20:28
 */

var g_oLocalization_frFR = {

	locale : "fr-FR",

	loginScreen : {

		login    : "Pseudo",
		password : "Mot de passe",
		connect  : "Jouer sur KGS",
		remember : "Enregistrer mon mot de passe",

		about : "A propos"
	},

	mainRoom : {
		roomsButton : "Salles",
		playButton  : "Jouer",
		exitButton  : "Quitter",

		playMenu : {
			createChallenge      : "Créer nouvelle partie",
			yourChallenge        : "Votre partie",
			cancelAutomatch      : "Annuler l'automatch",
			startAutomatch       : "Commencer l'automatch",
			automatchPreferences : "Préférences de l'automatch",
			startDemonstration   : "Débuter démonstration",
			loadFile             : "Charger le fichier"
		},

		findPlayer : "Trouver un joueur",

		search             : "Rechercher",
		searchRoom         : "Rechercher une salle",
		searchRoomHint     : "Rechercher dans la liste de toutes les salles",
		chatWithPlayer     : "Parler au joueur",
		chatWithPlayerHint : "Commencer à parler en privé avec le joueur",

		gamesTabs : {
			games            : "Jeux",
			challenges       : "Parties",
			challengesNoBots : "Parties (pas de robots)",
			room             : "Salle",
			followed         : "Suivi"
		},

		statistics : {
			label      : "Statistiques de la salle",
			users      : "Utilisateurs",
			games      : "Jeux",
			challenges : "Parties"
		},

		gamesList : {
			contextMenuJoin     : "Rejoindre",
			contextMenuObserve  : "Observer",
			contextMenuCopyLink : "Copier le lien dans le chat",

			listHeaderType      : "Type",
			listHeaderWhiteRank : "wr",
			listHeaderBlackRank : "br",
			listHeaderWhiteName : "Blanc",
			listHeaderBlackName : "Noir",
			listHeaderSize      : "Taille",
			listHeaderRules     : "Règles",
			listHeaderRoom      : "Salle",
			listHeaderObservers : "Observateurs",
			listHeaderMove      : "Coup",
			listHeaderComment   : "Commentaire",
			listHeaderRank      : "Rang",
			listHeaderName      : "Nom",
			listHeaderTime      : "Temps",
			listHeaderKomi      : "Komi",
			listHeaderResult    : "Résultat",
			listHeaderDate      : "Date",

			listAdditionalRobot : "robot"
		},

		playersList : {
			contextMenuTalkTo      : "Parler à...",
			contextMenuViewInfo    : "Voir les infos",
			contextMenuFriend      : "Amis",
			contextMenuCensored    : "Bloqué",
			contextMenuFollow      : "Suivi",
			contextMenuCopyLink    : "Copier le lien dans le chat",
			contextMenuGiveControl : "Donner le contrôle",

			listHeaderName : "Nom",
			listHeaderRank : "Rang"
		},

		roomsTabs : {
			hint : {
				close          : "Fermer la salle",
				moveTabToStart : "Déplacer au début de la liste",
				userInfo       : "Information de l'utilisateur",
				roomInfo       : "Information de la salle",
				soundOn        : "Le son est activé",
				soundOff       : "Le son est désactivé"
			}
		},

		closeGameRoomHint : "Fermer la salle"
	},

	gameRoom : {

		gameStart : "Début de la partie",
		gameOver  : "Fin de la partie",
		move      : "Coup",
		pass      : "Passer",

		points   : "Points",
		captures : "Captures",

		blackToPlay : "A noir de jouer",
		whiteToPlay : "A blanc de jouer",

		backToGame       : "Retour à la partie",
		removeOwnChanges : "Supprimer vos propres modifications",
		returnControl    : "Rendre contrôle",
		editorControl    : "Editer contrôle",

		addMinute1 : "Ajouter 1 minute",
		addMinute5 : "Ajouter 5 minutes",

		startReview : "Commencer la revue",

		labelPlaceholder : "Label...",

		button : {
			undo    : "Refaire",
			resign  : "Abandonner",
			pass    : "Passer",
			analyze : "Analyser",

			hint : {
				forward1      : "En avant",
				forward5      : "En avant de 5 coups",
				forwardEnd    : "Aller à la fin",
				backward1     : "En arrière",
				backward5     : "En arrière de 5 coups",
				backwardStart : "Retour au début",
				nextVariant   : "Prochaine variation",
				prevVariant   : "Précédente variation",

				editMode          : "Sélectionner mode d'édition",
				editModeMoves     : "Coup",
				editModeScores    : "Compter score",
				editModeEditor    : "Editer",
				editModeTriangles : "Triangles",
				editModeSquares   : "Carrés",
				editModeCircles   : "Cercles",
				editModeXMarks    : "X marques",
				editModeText      : "Label textuel",
				editModeNumbers   : "Label numérique",
				editModeColors    : "Couleurs",

				startAutoplay : "Commencer autoplay",
				stopAutoplay  : "Stopper autoplay",

				gameInfo : "Information de la partie",

				showKifu       : "Montrer kifu",
				toggleKifuMode : "Basculer en mode kifu"
			}
		},

		countingScores : {
			header  : "Phase de comptage",
			message : "Les deux joueurs déterminent maintenant quels groupes sont morts.",

			buttonAccept : "Accepter",
			buttonResume : "Annuler et résumer la partie"
		},

		toolbarCustomization : {
			mainNavigation : "Menu principal",
			treeNavigation : "Menu arborescent",
			generalToolbar : "Barre d'outil principale",
			autoplay       : "Autoplay",
			timelinePanel  : "Ecran temporel",
			kifuMode       : "Mode kifu"
		},

		menu : {

			hint : "Menu",

			downloadSGF           : "Télécharger en SGF",
			createSnapshot        : "Créer capture d'écran",
			exportToGif           : "Exporter en gif",
			convertToASCIIDiagram : "Convertir en diagramme ASCII",
			scoreEstimator        : "Estimation du score",
			toggleCoordinates     : "Changer les coordonnées",
			createNew             : "Créer nouveau",
			loadFile              : "Charger depuis le disque",
			loadFileFromClipboard : "Charger depuis le presse-papier",
			gameInfo              : "Information de la partie",
			cropBoard             : "Recadrer le tableau"
		},

		window : {
			gameInfo : {
				caption : "Information de la partie",

				gameName     : "Nom de la partie",
				result       : "Résultat",
				rules        : "Règles",
				komi         : "Komi",
				handicap     : "Handicap",
				timeSettings : "Paramètres de temps",
				black        : "Noir",
				blackRank    : "Rang de noir",
				white        : "Blanc",
				whiteRank    : "Rang de blanc",
				copyright    : "Copyright",
				date         : "Date",
				event        : "Evènement",
				round        : "Rond",
				place        : "Place",
				annotator    : "Annotation",
				fuseki       : "Fuseki",
				source       : "Source",
				transcriber  : "Transcripteur",
				gameInfo     : "Information de la partie"
			},

			colorsCounter : {
				caption : "Jetor de couleur",
				red     : "Rouge",
				blue    : "Bleu",
				green   : "Vert",
				gray    : "Gris"
			},

			creatingGIF : {
				caption : "Création d'un fichier GIF..."
			},

			asciiDiagram : {
				caption : "Diagramme ASCII"
			},

			boardCropping : {
				caption      : "Recadrer le tableau...",
				errorMessage : "Désolé, la cellule ne peut pas être si petite.",
				buttonReset  : "Réinitialiser"
			},

			error : {
				caption : "Erreur"
			},

			kifu : {
				caption : "Kifu",
				end     : "Fin",
				next    : "Suivant"
			}

		}
	},

	common : {

		gameResult : {
			resign  : "Abandonner",
			time    : "Temps",
			forfeit : "Défaite",
			even    : "Egalité"
		},

		black      : "Noir",
		white      : "BLanc",
		shortBlack : "N",
		shortWhite : "B",

		button : {
			ok     : "OK",
			cancel : "Annuler",
			create : "Créer",
			close  : "Fermer",
			submit : "Envoyer",
			edit   : "Editer",
			save   : "Sauvegarder",
			add    : "Ajouter",
			remove : "Enlever",
			change : "Changer"
		},

		timeSystem : {
			absolute : "Absolue",
			byoYomi  : "Byo-Yomi",
			canadian : "Canadien",
			none     : "Pas de temps limite"
		},

		rules : {
			japanese   : "Japonnais",
			chinese    : "Chinois",
			aga        : "AGA",
			newZealand : "Nouvelle-Zélande"
		},

		connectionStatus : {
			online     : "En ligne",
			secondsAgo : function (nSeconds)
			{
				return "Il y a " + nSeconds + " secondes";
			},
			minutesAgo : function (nMinutes)
			{
				return "Il y a " + nMinutes + " minutes";
			},
			hoursAgo   : function (nHours)
			{
				return "Il y a " + nHours + " heures";
			},
			daysAgo    : function (nDays)
			{
				return "Il y a " + nDays + " jours";
			}
		},

		months : {
			Jan : "Jan",
			Feb : "Fév",
			Mar : "Mar",
			Apr : "Avr",
			May : "Mai",
			Jun : "Juin",
			Jul : "Juil",
			Aug : "Aoû",
			Sep : "Sep",
			Oct : "Oct",
			Nov : "Nov",
			Dec : "Déc"
		},

		privateFlag : "Privé",

		about : {
			caption          : "A propos",
			version          : "Version",
			visitMessage     : "Visiter la page github de notre projet pour donner vos retours:",
			allRightReserved : "Tous droits réservés.",
			translatedBy     : "Traduit par Christopher Long."
		},

		minimizeButtonHint : "Minimiser",

		window : {
			captionError   : "Erreur",
			captionWarning : "Attention",

			messageNoUserWithName    : function(sUserName)
			{
				return "Il n'y a pas d'utilisateur \"" + sUserName + "\" dans ce système.";
			},
			messageNoUser            : "Il n'y a pas de tel utilisateur.",
			messageRoomIsPrivate     : function(sRoomName)
			{
				return "Désolé, " + sRoomName + " est privé. Vous ne pouvez pas entrer.";
			},
			messageAlreadyPlaying    : "Désolé, vous êtes déjà en train de jouer une partie, vous ne pouvez pas en commencer une autre.",
			messageChallengeDeclined : "Votre offre de partie a été décliné."
		}

	},

	KGS : {

		gameType : {
			free          : "Libre",
			ranked        : "Comptabilisé",
			teaching      : "Enseigner",
			simulation    : "Simulation",
			demonstration : "Démonstration",
			rengo         : "Rengo"
		},

		window : {

			common : {
				captionGameWarning : "Avertissement de partie"
			},

			roomsList : {
				caption             : "Liste des salles",
				searchPlaceholder   : "Enter un nom de salle ici",
				listHeaderName      : "Nom",
				listHeaderCategory  : "Categorie",
				categoryMain        : "Principale",
				categoryClubs       : "Clubs",
				categoryNational    : "National",
				categoryNewRooms    : "Nouvelles salles",
				categoryLessons     : "Leçons",
				categorySocial      : "Social",
				categoryTournaments : "Tournois"
			},

			automatchSetup : {
				caption       : "Installer automatch",
				estimatedRank : "Rang",
				human         : "Humain",
				robot         : "Robot",
				unranked      : "Adversaire non classé",
				maxHandicap   : "Handicap maximum",
				ranked        : "Partie classée",
				free          : "Partie libre",
				medium        : "Moyen",
				fast          : "Rapide",
				blitz         : "Blitz"
			},

			challenge : {

				captionNewChallenge   : "Créer nouvelle partie",
				captionNewDemo        : "Créer nouvelle démonstration",
				captionYourChallenge  : "Votre partie",
				captionNewGameVs      : "Nouvelle partie contre.",
				captionNewGame        : "Nouvelle partie",
				captionPressOkToStart : "Appuyer sur OK pour commencer la partie",
				captionWaiting        : "En attente...",

				privateFlag        : "Privé",
				commentPlaceHolder : "Sans commentaire",
				switchColorsHint   : "Changer les couleurs",
				fieldRoom          : "Salle",
				fieldRules         : "Règles",
				fieldBorderSize    : "Taille du goban",
				fieldHandicap      : "Handicap",
				fieldKomi          : "Komi",
				fieldTimeSystem    : "Système de temps",
				fieldMainTime      : "Temps principal",
				fieldByoYomiTime   : "Byo-yomi",
				fieldPeriods       : "Périodes",
				fieldStones        : "Pierres",

				buttonRetry     : "Réessayer",
				buttonRetryHint : "Annuler proposition actuelle",

				challengerHint : "Voir les informations",

				buttonDecline     : "Refuser",
				buttonDeclineHint : "Refuser ce joueur"
			},

			roomInfo : {
				caption : "Information de la salle"
			},

			undoRequest : {
				buttonNeverUndo : "Jamais refaire",
				message         : "L'adversaire a demandé à reprendre son dernier coup. Voulez-vous l'autoriser ?"
			},

			userInfo : {
				tabInfo     : "Info",
				tabGames    : "Parties",
				tabRank     : "Rang",
				tabFriends  : "Amis",
				tabCensored : "Bloqués",
				tabFuns     : "Funs",

				rankGraphReplacementText : "Aucune donnée de rang disponible",

				fieldUserName     : "Pseudo",
				fieldRealName     : "Nom réel",
				fieldRank         : "Rang",
				fieldLastOn       : "Dernière sur",
				fieldRegisteredOn : "Enregistré sur",
				fieldLocale       : "Lieu",
				fieldEmail        : "Email",
				fieldGames        : "Parties",
				fieldRecentGames  : "Parties récentes",

				flagPrivateEmail         : "Cacher l'adresse aux autres utilisateurs ?",
				flagReceiveAnnouncements : "Recevoir les annonces de KGS ?",
				flagOnlyRanked           : "Seulement des parties comptabilisées",

				emailPrivate : "privé",

				userslistNamePlaceholder  : "Nom utilisateur",
				userslistNotesPlaceholder : "Notes",

				gamesArchive : {
					contextMenu : {
						observe  : "Observer",
						view     : "Voir",
						download : "Télécharger",
						loadIn   : "Charger dans...",
						loadPIn  : "Charger (P) dans..."
					}
				}
			}

		}
	}
};

ExtendLocalization(g_oLocalization_frFR, g_oDefaultLocalization);