"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     10.05.2017
 * Time     16:36
 */

function CTranslationManager()
{
	this.Default = g_oTranslation_enEN;
	this.Current = g_oTranslation_ruRU;
}
CTranslationManager.prototype.GetLoginScreenLogin = function()
{
	return this.Current.loginScreen && this.Current.loginScreen.login ? this.Current.loginScreen.login : this.Default.loginScreen.login;
};
CTranslationManager.prototype.GetLoginScreenPassword = function()
{
	return this.Current.loginScreen && this.Current.loginScreen.password ? this.Current.loginScreen.password : this.Default.loginScreen.password;
};
CTranslationManager.prototype.GetLoginScreenConnect = function()
{
	return this.Current.loginScreen && this.Current.loginScreen.connect ? this.Current.loginScreen.connect : this.Default.loginScreen.connect;
};
CTranslationManager.prototype.GetLoginScreenRemember = function()
{
	return this.Current.loginScreen && this.Current.loginScreen.remember ? this.Current.loginScreen.remember : this.Default.loginScreen.remember;
};
CTranslationManager.prototype.GetLoginScreenAbout = function()
{
	return this.Current.loginScreen && this.Current.loginScreen.about ? this.Current.loginScreen.about : this.Default.loginScreen.about;
};
CTranslationManager.prototype.GetMainRoomRoomsButton = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.roomsButton ? this.Current.mainRoom.roomsButton : this.Default.mainRoom.roomsButton;
};
CTranslationManager.prototype.GetMainRoomPlayButton = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playButton ? this.Current.mainRoom.playButton : this.Default.mainRoom.playButton;
};
CTranslationManager.prototype.GetMainRoomExitButton = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.exitButton ? this.Current.mainRoom.exitButton : this.Default.mainRoom.exitButton;
};
CTranslationManager.prototype.GetMainRoomFindPlayer = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.findPlayer ? this.Current.mainRoom.findPlayer : this.Default.mainRoom.findPlayer;
};
CTranslationManager.prototype.GetMainRoomSearch = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.search ? this.Current.mainRoom.search : this.Default.mainRoom.search;
};
CTranslationManager.prototype.GetMainRoomSearchRoom = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.searchRoom ? this.Current.mainRoom.searchRoom : this.Default.mainRoom.searchRoom;
};
CTranslationManager.prototype.GetMainRoomSearchPlayer = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.searchPlayer ? this.Current.mainRoom.searchPlayer : this.Default.mainRoom.searchPlayer;
};
CTranslationManager.prototype.GetMainRoomPlayMenuCreateChallenge = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.createChallenge ? this.Current.mainRoom.playMenu.createChallenge : this.Default.mainRoom.playMenu.createChallenge;
};
CTranslationManager.prototype.GetMainRoomPlayMenuYourChallenge = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.yourChallenge ? this.Current.mainRoom.playMenu.yourChallenge : this.Default.mainRoom.playMenu.yourChallenge;
};
CTranslationManager.prototype.GetMainRoomPlayMenuCancelAutomatch = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.cancelAutomatch ? this.Current.mainRoom.playMenu.cancelAutomatch : this.Default.mainRoom.playMenu.cancelAutomatch;
};
CTranslationManager.prototype.GetMainRoomPlayMenuStartAutomatch = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.startAutomatch ? this.Current.mainRoom.playMenu.startAutomatch : this.Default.mainRoom.playMenu.startAutomatch;
};
CTranslationManager.prototype.GetMainRoomPlayMenuAutomatchPreferences = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.automatchPreferences ? this.Current.mainRoom.playMenu.automatchPreferences : this.Default.mainRoom.playMenu.automatchPreferences;
};
CTranslationManager.prototype.GetMainRoomPlayMenuStartDemonstration = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.startDemonstration ? this.Current.mainRoom.playMenu.startDemonstration : this.Default.mainRoom.playMenu.startDemonstration;
};
CTranslationManager.prototype.GetMainRoomPlayMenuLoadFile = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playMenu && this.Current.mainRoom.playMenu.loadFile ? this.Current.mainRoom.playMenu.loadFile : this.Default.mainRoom.playMenu.loadFile;
};
CTranslationManager.prototype.GetMainRoomStatisticsLabel = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.statistics && this.Current.mainRoom.statistics.label ? this.Current.mainRoom.statistics.label : this.Default.mainRoom.statistics.label;
};
CTranslationManager.prototype.GetMainRoomStatisticsUsers = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.statistics && this.Current.mainRoom.statistics.users ? this.Current.mainRoom.statistics.users : this.Default.mainRoom.statistics.users;
};
CTranslationManager.prototype.GetMainRoomStatisticsGames = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.statistics && this.Current.mainRoom.statistics.games ? this.Current.mainRoom.statistics.games : this.Default.mainRoom.statistics.games;
};
CTranslationManager.prototype.GetMainRoomStatisticsChallenges = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.statistics && this.Current.mainRoom.statistics.challenges ? this.Current.mainRoom.statistics.challenges : this.Default.mainRoom.statistics.challenges;
};
CTranslationManager.prototype.GetMainRoomGamesTabsGames = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesTabs && this.Current.mainRoom.gamesTabs.games ? this.Current.mainRoom.gamesTabs.games : this.Default.mainRoom.gamesTabs.games;
};
CTranslationManager.prototype.GetMainRoomGamesTabsChallenges = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesTabs && this.Current.mainRoom.gamesTabs.challenges ? this.Current.mainRoom.gamesTabs.challenges : this.Default.mainRoom.gamesTabs.challenges;
};
CTranslationManager.prototype.GetMainRoomGamesTabsChallengesNoBots = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesTabs && this.Current.mainRoom.gamesTabs.challengesNoBots ? this.Current.mainRoom.gamesTabs.challengesNoBots : this.Default.mainRoom.gamesTabs.challengesNoBots;
};
CTranslationManager.prototype.GetMainRoomGamesTabsRoom = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesTabs && this.Current.mainRoom.gamesTabs.room ? this.Current.mainRoom.gamesTabs.room : this.Default.mainRoom.gamesTabs.room;
};
CTranslationManager.prototype.GetMainRoomGamesTabsFollowed = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesTabs && this.Current.mainRoom.gamesTabs.followed ? this.Current.mainRoom.gamesTabs.followed : this.Default.mainRoom.gamesTabs.followed;
};
CTranslationManager.prototype.GetMainRoomGamesListContextMenuJoin = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.contextMenuJoin ? this.Current.mainRoom.gamesList.contextMenuJoin : this.Default.mainRoom.gamesList.contextMenuJoin;
};
CTranslationManager.prototype.GetMainRoomGamesListContextMenuObserve = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.contextMenuObserve ? this.Current.mainRoom.gamesList.contextMenuObserve : this.Default.mainRoom.gamesList.contextMenuObserve;
};
CTranslationManager.prototype.GetMainRoomGamesListContextMenuCopyLink = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.contextMenuCopyLink ? this.Current.mainRoom.gamesList.contextMenuCopyLink : this.Default.mainRoom.gamesList.contextMenuCopyLink;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderType = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderType ? this.Current.mainRoom.gamesList.listHeaderType : this.Default.mainRoom.gamesList.listHeaderType;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderWhiteRank = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderWhiteRank ? this.Current.mainRoom.gamesList.listHeaderWhiteRank : this.Default.mainRoom.gamesList.listHeaderWhiteRank;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderBlackRank = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderBlackRank ? this.Current.mainRoom.gamesList.listHeaderBlackRank : this.Default.mainRoom.gamesList.listHeaderBlackRank;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderWhiteName = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderWhiteName ? this.Current.mainRoom.gamesList.listHeaderWhiteName : this.Default.mainRoom.gamesList.listHeaderWhiteName;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderBlackName = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderBlackName ? this.Current.mainRoom.gamesList.listHeaderBlackName : this.Default.mainRoom.gamesList.listHeaderBlackName;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderSize = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderSize ? this.Current.mainRoom.gamesList.listHeaderSize : this.Default.mainRoom.gamesList.listHeaderSize;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderRules = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderRules ? this.Current.mainRoom.gamesList.listHeaderRules : this.Default.mainRoom.gamesList.listHeaderRules;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderRoom = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderRoom ? this.Current.mainRoom.gamesList.listHeaderRoom : this.Default.mainRoom.gamesList.listHeaderRoom;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderObservers = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderObservers ? this.Current.mainRoom.gamesList.listHeaderObservers : this.Default.mainRoom.gamesList.listHeaderObservers;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderMove = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderMove ? this.Current.mainRoom.gamesList.listHeaderMove : this.Default.mainRoom.gamesList.listHeaderMove;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderComment = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderComment ? this.Current.mainRoom.gamesList.listHeaderComment : this.Default.mainRoom.gamesList.listHeaderComment;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderRank = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderRank ? this.Current.mainRoom.gamesList.listHeaderRank : this.Default.mainRoom.gamesList.listHeaderRank;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderName = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderName ? this.Current.mainRoom.gamesList.listHeaderName : this.Default.mainRoom.gamesList.listHeaderName;
};
CTranslationManager.prototype.GetMainRoomGamesListHeaderTime = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listHeaderTime ? this.Current.mainRoom.gamesList.listHeaderTime : this.Default.mainRoom.gamesList.listHeaderTime;
};
CTranslationManager.prototype.GetMainRoomGamesListAdditionalRobot = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.gamesList && this.Current.mainRoom.gamesList.listAdditionalRobot ? this.Current.mainRoom.gamesList.listAdditionalRobot : this.Default.mainRoom.gamesList.listAdditionalRobot;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuTalkTo = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuTalkTo ? this.Current.mainRoom.playersList.contextMenuTalkTo : this.Default.mainRoom.playersList.contextMenuTalkTo;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuViewInfo = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuViewInfo ? this.Current.mainRoom.playersList.contextMenuViewInfo : this.Default.mainRoom.playersList.contextMenuViewInfo;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuFriend = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuFriend ? this.Current.mainRoom.playersList.contextMenuFriend : this.Default.mainRoom.playersList.contextMenuFriend;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuCensored = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuCensored ? this.Current.mainRoom.playersList.contextMenuCensored : this.Default.mainRoom.playersList.contextMenuCensored;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuFollow = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuFollow ? this.Current.mainRoom.playersList.contextMenuFollow : this.Default.mainRoom.playersList.contextMenuFollow;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuCopyLink = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuCopyLink ? this.Current.mainRoom.playersList.contextMenuCopyLink : this.Default.mainRoom.playersList.contextMenuCopyLink;
};
CTranslationManager.prototype.GetMainRoomPlayersListContextMenuGiveControl = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.contextMenuGiveControl ? this.Current.mainRoom.playersList.contextMenuGiveControl : this.Default.mainRoom.playersList.contextMenuGiveControl;
};
CTranslationManager.prototype.GetMainRoomPlayersListHeaderName = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.listHeaderName ? this.Current.mainRoom.playersList.listHeaderName : this.Default.mainRoom.playersList.listHeaderName;
};
CTranslationManager.prototype.GetMainRoomPlayersListHeaderRank = function()
{
	return this.Current.mainRoom && this.Current.mainRoom.playersList && this.Current.mainRoom.playersList.listHeaderRank ? this.Current.mainRoom.playersList.listHeaderRank : this.Default.mainRoom.playersList.listHeaderRank;
};

var g_oTranslation = null;

