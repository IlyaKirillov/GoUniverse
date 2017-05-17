"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     10.05.2017
 * Time     16:35
 */

var g_oLocalization_enUS = {

	locale : "en-US",

	loginScreen : {

		login    : "Login",
		password : "Password",
		connect  : "Play on KGS",
		remember : "Remember my password",

		about : "About"
	},

	mainRoom : {
		roomsButton : "Rooms",
		playButton  : "Play",
		exitButton  : "Exit",

		playMenu : {
			createChallenge      : "Create new challenge",
			yourChallenge        : "Your challenge",
			cancelAutomatch      : "Cancel automatch",
			startAutomatch       : "Start automatch",
			automatchPreferences : "Automatch preferences",
			startDemonstration   : "Start demonstration",
			loadFile             : "Load file"
		},

		findPlayer   : "find a player",
		search       : "Search",
		searchRoom   : "Find room",
		searchPlayer : "Find player",

		gamesTabs : {
			games            : "Games",
			challenges       : "Challenges",
			challengesNoBots : "Challenges (no bots)",
			room             : "Room",
			followed         : "Followed"
		},

		statistics : {
			label      : "Statistics of the room",
			users      : "Users",
			games      : "Games",
			challenges : "Challenges"
		},

		gamesList : {
			contextMenuJoin     : "Join",
			contextMenuObserve  : "Observe",
			contextMenuCopyLink : "Copy the link to the chat",

			listHeaderType      : "Type",
			listHeaderWhiteRank : "wr",
			listHeaderBlackRank : "br",
			listHeaderWhiteName : "White",
			listHeaderBlackName : "Black",
			listHeaderSize      : "Size",
			listHeaderRules     : "Rules",
			listHeaderRoom      : "Room",
			listHeaderObservers : "Observers",
			listHeaderMove      : "Move",
			listHeaderComment   : "Comment",
			listHeaderRank      : "Rank",
			listHeaderName      : "Name",
			listHeaderTime      : "Time",
			listHeaderKomi      : "Komi",
			listHeaderResult    : "Result",
			listHeaderDate      : "Date",

			listAdditionalRobot : "robot"
		},

		playersList : {
			contextMenuTalkTo      : "Talk to...",
			contextMenuViewInfo    : "View info",
			contextMenuFriend      : "Buddy",
			contextMenuCensored    : "Censored",
			contextMenuFollow      : "Follow",
			contextMenuCopyLink    : "Copy the link to the chat",
			contextMenuGiveControl : "Give control",

			listHeaderName : "Name",
			listHeaderRank : "Rank"
		}

	},

	common : {

		gameResult : {
			resign  : "Resign",
			time    : "Time",
			forfeit : "Forfeit",
			even    : "Even"
		},

		black      : "Black",
		white      : "White",
		shortBlack : "B",
		shortWhite : "W",

		button : {
			ok     : "OK",
			cancel : "Cancel",
			create : "Create",
			close  : "Close",
			submit : "Submit",
			edit   : "Edit",
			save   : "Save",
			add    : "Add",
			remove : "Remove",
			change : "Change"
		},

		timeSystem : {
			absolute : "Absolute",
			byoYomi  : "Byo-Yomi",
			canadian : "Canadian",
			none     : "No time limit"
		},

		rules : {
			japanese   : "Japanese",
			chinese    : "Chinese",
			aga        : "AGA",
			newZealand : "New Zealand"
		},

		connectionStatus : {
			online     : "online",
			secondsAgo : "seconds ago",
			minutesAgo : "minutes ago",
			hoursAgo   : "hours ago",
			daysAgo    : "days ago"
		},

		months : {
			Jan : "Jan",
			Feb : "Feb",
			Mar : "Mar",
			Apr : "Apr",
			May : "May",
			Jun : "Jun",
			Jul : "Jul",
			Aug : "Aug",
			Sep : "Sep",
			Oct : "Oct",
			Nov : "Nov",
			Dec : "Dec"
		},

		privateFlag : "Private"
	},

	KGS : {

		gameType : {
			free          : "Free",
			ranked        : "Ranked",
			teaching      : "Teaching",
			simulation    : "Simulation",
			demonstration : "Demonstration",
			rengo         : "Rengo"
		},

		window : {

			common : {
				captionGameWarning : "Game warning"
			},

			roomsList : {
				caption             : "Room list",
				searchPlaceholder   : "Enter room name here",
				listHeaderName      : "Name",
				listHeaderCategory  : "Category",
				categoryMain        : "Main",
				categoryClubs       : "Clubs",
				categoryNational    : "National",
				categoryNewRooms    : "New rooms",
				categoryLessons     : "Lessons",
				categorySocial      : "Social",
				categoryTournaments : "Tournaments"
			},

			automatchSetup : {
				caption       : "Automatch setup",
				estimatedRank : "Rank",
				human         : "Human",
				robot         : "Robot",
				unranked      : "Unranked opponent",
				maxHandicap   : "Max handicap",
				ranked        : "Ranked game",
				free          : "Free game",
				medium        : "Medium",
				fast          : "Fast",
				blitz         : "Blitz"
			},

			challenge : {

				captionNewChallenge   : "Create new challenge",
				captionNewDemo        : "Create new demonstration",
				captionYourChallenge  : "Your challenge",
				captionNewGameVs      : "New game vs.",
				captionNewGame        : "New game",
				captionPressOkToStart : "Press OK to start the game",
				captionWaiting        : "Waiting...",

				privateFlag        : "Private",
				commentPlaceHolder : "No comment",
				switchColorsHint   : "Switch colors",
				fieldRoom          : "Room",
				fieldRules         : "Rules",
				fieldBorderSize    : "Board size",
				fieldHandicap      : "Handicap",
				fieldKomi          : "Komi",
				fieldTimeSystem    : "Time system",
				fieldMainTime      : "Main time",
				fieldByoYomiTime   : "Byo-tomi",
				fieldPeriods       : "Periods",
				fieldStones        : "Stones",

				buttonRetry     : "Retry",
				buttonRetryHint : "Cancel current proposal",

				challengerHint  : "View info"
			},

			roomInfo : {
				caption : "Room info"
			},

			undoRequest : {
				buttonNeverUndo : "Never undo",
				message         : "The opponent has requested an undo for their last move. Do you want to perform an undo?"
			},

			userInfo : {
				tabInfo     : "Info",
				tabGames    : "Games",
				tabRank     : "Rank",
				tabFriends  : "Friends",
				tabCensored : "Censored",
				tabFuns     : "Funs",

				rankGraphReplacementText : "No rank data avaliable",

				fieldUserName     : "User name",
				fieldRealName     : "Real name",
				fieldRank         : "Rank",
				fieldLastOn       : "Last on",
				fieldRegisteredOn : "Registered on",
				fieldLocale       : "Locale",
				fieldEmail        : "Email",
				fieldGames        : "Games",
				fieldRecentGames  : "Recent games",

				flagPrivateEmail         : "Hide address from other users?",
				flagReceiveAnnouncements : "Receive KGS announcements?",
				flagOnlyRanked           : "Only ranked games",

				emailPrivate : "private",

				userslistNamePlaceholder  : "User name",
				userslistNotesPlaceholder : "Notes",

				gamesArchive : {
					contextMenu : {
						observe  : "Observe",
						view     : "View",
						download : "Download to disk",
						loadIn   : "Load in...",
						loadPIn  : "Load (P) in..."
					}
				}
			}

		}
	}
};