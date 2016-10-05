"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     01.06.2016
 * Time     23:30
 */

var EKGSGamesListType = {
	AllGames      : 0,
	Room          : 1,
	Follower      : 2,
	AllChallenges : 3,

	Min : 0,
	Max : 3
};

function CKGSClient(oApp)
{
	this.m_oApp            = oApp;
	this.m_oGlobalSettings = oApp.GetGlobalSettings();
	this.m_bLoggedIn       = false;
	this.m_aGames          = {};
	this.m_oFriendList     = [];
	this.m_oBlackList      = {};
	this.m_oFollowerList   = {};
	this.m_aRooms          = {};
	this.m_nChatChannelId  = -1;
	this.m_aAllRooms       = {};
	this.m_oAllUsers       = {};
	this.m_oAllGames       = {};
	this.m_oGameNotify     = {};
	this.m_oRoomCategory   = {};
	this.m_oUserInfo       = {}; // Список открытых окон с информацией пользователя
	this.m_oCurrentUser    = new CKGSUser(this);
	this.m_oChallenges     = {};

	this.m_oPrivateChats           = {};
	this.m_oPrivateChatsByUserName = {};

	this.m_oPlayersListView = oApp.GetPlayersListView();
	this.m_oGamesListView   = oApp.GetGamesListView();

	this.m_eGamesListType           = EKGSGamesListType.AllGames;
	this.m_nGlobalGamesChannelId    = -1;
	this.m_nFollowersGamesChannelId = -1;
	this.m_oFollowersGames          = {};

	this.m_oEnterChatRoomRequest = {}; // Список комнат, в которые мы сделали запрос на вход, нужно для определения RoomJoin начальный или по запросу

	this.m_nCallbackCounter = 1;
	this.m_oSync            = {};
}
CKGSClient.prototype.Clear = function()
{
	for (var nChannelId in this.m_aGames)
	{
		var oGame = this.m_aGames[nChannelId];
		oGame.StopClocks();
	}

	this.m_bLoggedIn      = false;
	this.m_aGames         = {};
	this.m_oFriendList    = [];
	this.m_oBlackList     = {};
	this.m_oFollowerList  = {};
	this.m_aRooms         = {};
	this.m_nChatChannelId = -1;
	this.m_aAllRooms      = {};
	this.m_oAllUsers      = {};
	this.m_oAllGames      = {};
	this.m_oRoomCategory  = {};
	this.m_oUserInfo      = {};
	this.m_oCurrentUser   = new CKGSUser(this);

	this.m_oPrivateChats           = {};
	this.m_oPrivateChatsByUserName = {};

	this.m_eGamesListType             = EKGSGamesListType.AllGames;
	this.m_nGlobalGamesChannelId      = -1;
	this.m_nGlobalChallengesChannelId = -1;
	this.m_nFollowersGamesChannelId   = -1;
	this.m_oFollowersGames            = {};
};
CKGSClient.prototype.GetUserName = function()
{
	return this.m_oCurrentUser.GetName();
};
CKGSClient.prototype.Connect = function(sLogin, sPassword, sLocale)
{
	this.private_SendMessage({
		"type"     : "LOGIN",
		"name"     : sLogin,
		"password" : sPassword,
		"locale"   : sLocale ? sLocale : "en-US"
	});
};
CKGSClient.prototype.ConnectAsGuest = function()
{

};
CKGSClient.prototype.Disconnect = function()
{
	this.private_SendMessage({
		"type" : "LOGOUT"
	});
};
CKGSClient.prototype.EnterToGameRoom = function(nGameRoomId)
{
	this.private_SendMessage({
		"type"      : "JOIN_REQUEST",
		"channelId" : nGameRoomId
	});
};
CKGSClient.prototype.LeaveGameRoom = function(nGameRoomId)
{
	if (this.m_aGames[nGameRoomId])
	{
		var oGame = this.m_aGames[nGameRoomId];
		oGame.StopClocks();
		delete this.m_aGames[nGameRoomId];
	}

	this.private_SendMessage({
		"type"      : "UNJOIN_REQUEST",
		"channelId" : nGameRoomId
	});
};
CKGSClient.prototype.EnterGameRoomByTimeStamp = function(sTimeStamp)
{
	this.private_SendMessage({
		"type"      : "JOIN_GAME_BY_ID",
		"timestamp" : sTimeStamp
	});
};
CKGSClient.prototype.LoadGameInRoom = function(sTimeStamp, nRoomId, isPrivate)
{
	if (true === isPrivate)
	{
		this.private_SendMessage({
			"type"      : "ROOM_LOAD_GAME",
			"timestamp" : sTimeStamp,
			"private"   : true,
			"channelId" : nRoomId
		});
	}
	else
	{
		this.private_SendMessage({
			"type"      : "ROOM_LOAD_GAME",
			"timestamp" : sTimeStamp,
			"channelId" : nRoomId
		});
	}
};
CKGSClient.prototype.EnterChatRoom = function(nChatRoomId)
{
	this.private_SendMessage({
		"type"      : "ROOM_DESC_REQUEST",
		"channelId" : nChatRoomId
	});

	this.private_SendMessage({
		"type"      : "JOIN_REQUEST",
		"channelId" : nChatRoomId
	});

	this.m_oEnterChatRoomRequest[nChatRoomId] = nChatRoomId;
};
CKGSClient.prototype.LeaveChatRoom = function(nChatRoomId)
{
	if (this.m_oPrivateChats[nChatRoomId])
	{
		var sName = this.m_oPrivateChats[nChatRoomId].Name;
		delete this.m_oPrivateChatsByUserName[sName];
		delete this.m_oPrivateChats[nChatRoomId];
	}

	if (this.m_aRooms[nChatRoomId])
		delete this.m_aRooms[nChatRoomId];

	this.private_SendMessage({
		"type"      : "UNJOIN_REQUEST",
		"channelId" : nChatRoomId
	});
};
CKGSClient.prototype.SendChatMessage = function(sText)
{
	var bAnnounce = false;
	if (sText && sText.length > 1 && '!' === sText.charAt(0))
	{

		var sUserName = this.GetUserName();
		var arrOwners = this.GetRoomOwners(this.m_nChatChannelId);

		for (var nIndex = 0, nCount = arrOwners.length; nIndex < nCount; ++nIndex)
		{
			var oUser = arrOwners[nIndex];
			if (sUserName === oUser.GetName())
			{
				bAnnounce = true;
				sText     = sText.substr(1);
				break;
			}
		}
	}

	if (sText.length >= 1000)
		sText = sText.substr(0, 999);

	this.private_SendMessage({
		"type"      : true === bAnnounce ? "ANNOUNCE" : "CHAT",
		"channelId" : this.m_nChatChannelId,
		"text"      : sText
	});
};
CKGSClient.prototype.SendChatMessageInGameRoom = function(nGameRoomId, sText)
{
	if (sText.length >= 1000)
		sText = sText.substr(0, 999);

	this.private_SendMessage({
		"type"      : "CHAT",
		"channelId" : nGameRoomId,
		"text"      : sText
	});
};
CKGSClient.prototype.LoadUserInfo = function(sUserName)
{
	var sUserName = sUserName.toLowerCase();

	if (this.m_oUserInfo[sUserName])
		return;

	var oWindow = CreateKGSWindow(EKGSWindowType.UserInfo, {UserName : sUserName, Client : this, App: this.m_oApp});
	oWindow.Hide();

	this.m_oUserInfo[sUserName] = {
		Window         : oWindow,
		UserName       : sUserName,
		DetailsChannel : -1,
		ArchiveChannel : -1
	};

	this.private_SendMessage({
		"type" : "DETAILS_JOIN_REQUEST",
		"name" : sUserName
	});

	this.private_SendMessage({
		"type" : "JOIN_ARCHIVE_REQUEST",
		"name" : sUserName
	});
};
CKGSClient.prototype.CloseUserInfo = function(sUserName)
{
	var sUserName = sUserName.toLowerCase();
	if (this.m_oUserInfo[sUserName])
	{

		if (-1 !== this.m_oUserInfo[sUserName].DetailsChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : this.m_oUserInfo[sUserName].DetailsChannel
			});
		}

		if (-1 !== this.m_oUserInfo[sUserName].ArchiveChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : this.m_oUserInfo[sUserName].ArchiveChannel
			});
		}

		if (this.m_oUserInfo[sUserName].Window)
		{
			RemoveWindow(this.m_oUserInfo[sUserName].Window);
		}

		delete this.m_oUserInfo[sUserName];
	}
};
CKGSClient.prototype.CloseChallenge = function(nChannelId)
{
	if (this.m_oChallenges[nChannelId])
	{
		this.private_SendMessage({
			"type"     : "UNJOIN_REQUEST",
			"channelId": nChannelId
		});

		RemoveWindow(this.m_oChallenges[nChannelId]);
		delete this.m_oChallenges[nChannelId];
	}
};
CKGSClient.prototype.SetCurrentChatRoom = function(nChatRoomId)
{
	this.m_nChatChannelId = nChatRoomId;

	if (true !== this.IsPrivateChat(nChatRoomId))
		this.m_oGlobalSettings.SetKGSChatRoomId(nChatRoomId);

	this.private_UpdatePlayersList();

	if (EKGSGamesListType.Room === this.m_eGamesListType)
		this.private_UpdateGamesList();
};
CKGSClient.prototype.EnterPrivateChat = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "CONVO_REQUEST",
		"callbackKey" : 12345,
		"name"        : sUserName
	});
};
CKGSClient.prototype.GetRoomName = function(nRoomId)
{
	if (this.m_aAllRooms[nRoomId] && "" !== this.m_aAllRooms[nRoomId].Name)
		return this.m_aAllRooms[nRoomId].Name;

	return "Global";
};
CKGSClient.prototype.GetAllRooms = function()
{
	return this.m_aAllRooms;
};
CKGSClient.prototype.GetRooms = function()
{
	var arrRooms = [];
	for (var nChannelId in this.m_aRooms)
	{
		var oRoom = this.m_aAllRooms[nChannelId];
		if (!oRoom)
			continue;

		arrRooms.push(oRoom);
	}

	return arrRooms;
};
CKGSClient.prototype.GetCategoryName = function(nCategoryId)
{
	return this.m_oRoomCategory[nCategoryId];
};
CKGSClient.prototype.GetRoomGreetingMessage = function(nRoomId)
{
	if (this.m_aAllRooms[nRoomId] && "" !== this.m_aAllRooms[nRoomId].Name)
		return this.m_aAllRooms[nRoomId].GreetingMessage;

	return "";
};
CKGSClient.prototype.GetRoomOwners = function(nRoomId)
{
	if (this.m_aAllRooms[nRoomId] && "" !== this.m_aAllRooms[nRoomId].Name)
		return this.m_aAllRooms[nRoomId].Owners;

	return [];
};
CKGSClient.prototype.IsPrivateChat = function(nRoomId)
{
	if (undefined !== this.m_oPrivateChats[nRoomId])
		return true;

	return false;
};
CKGSClient.prototype.GetPrivateChat = function(nRoomId)
{
	return this.m_oPrivateChats[nRoomId];
};
CKGSClient.prototype.IsChatRoom = function(nRoomId)
{
	if (undefined !== this.m_aAllRooms[nRoomId])
		return true;

	return false;
};
CKGSClient.prototype.IsUserInFriendList = function(sUserName)
{
	return this.private_IsFriend(sUserName);
};
CKGSClient.prototype.IsUserInBlackList = function(sUserName)
{
	if (undefined !== this.m_oBlackList[sUserName])
		return true;

	return false;
};
CKGSClient.prototype.IsUserInFollowerList = function(sUserName)
{
	if (undefined !== this.m_oFollowerList[sUserName])
		return true;

	return false;
};
CKGSClient.prototype.AddToFriendList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_ADD",
		"callbackKey" : 12345,
		"friendType"  : "buddy",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.RemoveFromFriendList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_REMOVE",
		"callbackKey" : 12345,
		"friendType"  : "buddy",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.AddToBlackList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_ADD",
		"callbackKey" : 12345,
		"friendType"  : "censored",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.RemoveFromBlackList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_REMOVE",
		"callbackKey" : 12345,
		"friendType"  : "censored",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.AddToFollowerList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_ADD",
		"callbackKey" : 12345,
		"friendType"  : "fan",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.RemoveFromFollowerList = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "FRIEND_REMOVE",
		"callbackKey" : 12345,
		"friendType"  : "fan",
		"name"        : sUserName,
		"text"        : ""
	});
};
CKGSClient.prototype.WakeUp = function()
{
	this.private_SendMessage({
		"type" : "WAKE_UP"
	});
};
CKGSClient.prototype.SleepOn = function()
{
	this.private_SendMessage({
		"type" : "IDLE_ON"
	});
};
CKGSClient.prototype.GiveGameControl = function(nGameId, sUserName)
{
	this.private_SendMessage({
		"channelId": nGameId,
		"type"     : "GAME_SET_ROLES",
		"owner"    : sUserName
	});
};
CKGSClient.prototype.CreateChallenge = function()
{
	var nCallBackKey = -1;

	if (this.m_oChallenges[nCallBackKey])
	{
		// TODO: Вывести ошибку, что вызов уже существует
		return;
	}

	var nChannelId = this.m_nChatChannelId;

	if (this.m_oPrivateChats[nChannelId] || !this.m_aAllRooms[nChannelId])
		return;

	var oGameRecord = new CKGSGameListRecord(this);
	oGameRecord.Update({
		gameType        : "challenge",
		channelId       : -1,
		roomId          : nChannelId,
		private         : false,
		players         : {
			challengeCreator : {
				name : this.m_oCurrentUser.GetName(),
				rank : this.m_oCurrentUser.GetStringRank()
			}
		},
		name            : "",
		initialProposal : {
			gameType : "free",
			rules    : {
				rules          : "japanese",
				komi           : "6.5",
				size           : 19,
				timeSystem     : "byo_yomi",
				mainTime       : 600,
				byoYomiTime    : 30,
				byoYomiPeriods : 5
			}
		}
	});

	var oWindow = CreateKGSWindow(EKGSWindowType.Challenge, {GameRecord : oGameRecord, Client : this, App: this.m_oApp, Create : true, ChannelId : nCallBackKey, RoomId : this.m_nChatChannelId});
	this.m_oChallenges[nCallBackKey] = oWindow;
};
CKGSClient.prototype.SendCreateChallenge = function(nChannelId, nCallBackKey, nGameType, sComment, nRules, nSize, oTimeSettings)
{
	var oRules = {
		"rules"      : KGSCommon.GameRulesToString(nRules),
		"size"       : nSize,
		"komi"       : 6.5,
		"timeSystem" : oTimeSettings.GetTypeInKGSString(),
		"mainTime"   : oTimeSettings.GetMainTime()
	};

	if (oTimeSettings.IsByoYomi())
	{
		oRules["byoYomiTime"]    = oTimeSettings.GetOverTime();
		oRules["byoYomiPeriods"] = oTimeSettings.GetOverCount();
	}
	else if (oTimeSettings.IsCanadian())
	{
		oRules["byoYomiTime"]   = oTimeSettings.GetOverTime();
		oRules["byoYomiStones"] = oTimeSettings.GetOverCount();
	}

	this.private_SendMessage({
		"channelId"   : nChannelId,
		"type"        : "CHALLENGE_CREATE",
		"callbackKey" : nCallBackKey,
		"text"        : sComment,
		"global"      : true,

		"proposal" : {

			"gameType" : KGSCommon.GameTypeToString(nGameType),
			"nigiri"   : true,

			"rules" : oRules,

			"players" : [{
				"role" : "white",
				"name" : this.m_oCurrentUser.GetName()
			}, {
				"role" : "black"
			}]
		}
	});
};
CKGSClient.prototype.SendSubmitChallenge = function(nChannelId, nGameType, oRules, bNigiri, bCreatorBlack, sCreator)
{
	this.private_SendMessage({
		"channelId" : nChannelId,
		"type"      : "CHALLENGE_SUBMIT",
		"gameType"  : KGSCommon.GameTypeToString(nGameType),
		"nigiri"    : bNigiri,
		"rules"     : oRules,
		"players"   : [{
			"role" : bCreatorBlack ? "black" : "white",
			"name" : sCreator
		}, {
			"role" : bCreatorBlack ? "white" : "black",
			"name" : this.GetUserName()
		}]
	});
};
CKGSClient.prototype.SendChallengeProposal = function(nChannelId, nGameType, oRules, bNigiri, bCreatorBlack, sCreator, sChallenger)
{
	this.private_SendMessage({
		"channelId" : nChannelId,
		"type"      : "CHALLENGE_PROPOSAL",
		"gameType"  : KGSCommon.GameTypeToString(nGameType),
		"nigiri"    : bNigiri,
		"rules"     : oRules,
		"players"   : [{
			"role" : bCreatorBlack ? "black" : "white",
			"name" : sCreator
		}, {
			"role" : bCreatorBlack ? "white" : "black",
			"name" : sChallenger
		}]
	});
};
CKGSClient.prototype.SendAcceptChallenge = function(nChannelId, nGameType, oRules, bNigiri, bCreatorBlack, sCreator, sChallenger)
{
	this.private_SendMessage({
		"channelId" : nChannelId,
		"type"      : "CHALLENGE_ACCEPT",
		"gameType"  : KGSCommon.GameTypeToString(nGameType),
		"nigiri"    : bNigiri,
		"rules"     : oRules,
		"players"   : [{
			"role" : bCreatorBlack ? "black" : "white",
			"name" : sCreator
		}, {
			"role" : bCreatorBlack ? "white" : "black",
			"name" : sChallenger
		}]
	});
};
CKGSClient.prototype.RetryChallenge = function(nChannelId)
{
	this.private_SendMessage({
		"channelId" : nChannelId,
		"type"      : "CHALLENGE_RETRY"
	});
};
CKGSClient.prototype.DeclineChallenge = function(nChannelId, sUserName)
{
	this.private_SendMessage({
		"channelId": nChannelId,
		"type"     : "CHALLENGE_DECLINE",
		"name"     : sUserName
	});
};
CKGSClient.prototype.SendSync = function(oClass)
{
	var nCallbackKey = this.GetNewCallbackKey();
	this.private_SendMessage({
		"type"       : "SYNC_REQUEST",
		"callbackKey": nCallbackKey
	});

	this.m_oSync[nCallbackKey] = oClass;
};
CKGSClient.prototype.private_SendMessage = function(oMessage)
{
	// console.log("Send:");
	// console.log(oMessage);
	// console.log(new Date().toString());

	var oThis = this;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		if (req.readyState == 4)
		{
			if (req.status == 200)
			{
				console.log("Upload success: type = " + oMessage.type);
				if (oMessage.type == "LOGIN")
				{
					// After our login message has been sent, we kick off the first download operation to see the result.
					// After this first download call, each download will automatically trigger the next,
					// so we won't need to call this again.
					oThis.m_bLoggedIn = true;
					oThis.private_RecieveMessage();
				}
			}
			else
			{
				var errorText = req.responseText;
				var matcher = /:KGS: (.*?) :KGS:/.exec(errorText);
				if (matcher)
				{
					errorText = matcher[1];
				}
				console.log("Error : " + errorText);

				if (oMessage.type == "LOGIN")
				{
					oThis.m_bLoggedIn = false;
					oThis.m_oApp.Logout("Server is unavaliable. Try again later.");
				}
			}
		}
	};
	req.open("POST", "http://metakgs.org/api/access", true);
	req.setRequestHeader("content-type", "application/json;charset=UTF-8"); // Make sure Unicode is used.
	req.send(this.private_TranslateUnicodeMessage(JSON.stringify(oMessage)));
};
CKGSClient.prototype.private_RecieveMessage = function()
{
	var oThis = this;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		if (req.readyState == 4)
		{
			if (req.status == 200)
			{
				// We have a valid response! Turn it into a javascript object.
				var response = JSON.parse(req.responseText);
				if (response.messages)
				{
					// After 1 minute with no message, we'll time out and get an "empty" response. We only want to do the
					// forEach here if the response has content.
					for (var nIndex = 0, nCount = response.messages.length; nIndex < nCount; ++nIndex)
					{
						oThis.private_HandleMessage(response.messages[nIndex]);
					}
				}

				if (oThis.m_bLoggedIn)
				{
					oThis.private_RecieveMessage();
				}
			}
			else
			{
				console.log("Download failure: Status = " + req.status + ", response text = " + req.responseText);
				oThis.m_bLoggedIn = false;
				oThis.m_oApp.Logout("Server is unavaliable. Try again later.");
			}
		}
	};
	req.open("GET", "http://metakgs.org/api/access", true);
	req.send();
};
CKGSClient.prototype.private_HandleMessage = function(oMessage)
{
	// console.log("Receive:");
	// console.log(oMessage);
	// console.log(new Date().toString());

	if (oMessage.type == "LOGOUT")
	{
		this.private_HandleLogout(oMessage);
	}
	else if ("HELLO" === oMessage.type)
	{
		this.private_HandleHello(oMessage);
	}
	else if ("LOGIN_SUCCESS" === oMessage.type)
	{
		this.private_HandleLoginSuccess(oMessage);
	}
	else if ("ROOM_NAMES" === oMessage.type)
	{
		this.private_HandleRoomNames(oMessage);
	}
	else if ("ROOM_JOIN" === oMessage.type)
	{
		this.private_HandleRoomJoin(oMessage);
	}
	else if ("GAME_JOIN" === oMessage.type)
	{
		this.private_HandleGameJoin(oMessage);
	}
	else if ("GAME_UPDATE" === oMessage.type)
	{
		this.private_HandleGameUpdate(oMessage);
	}
	else if ("CHAT" === oMessage.type)
	{
		this.private_HandleChat(oMessage);
	}
	else if ("USER_ADDED" === oMessage.type)
	{
		this.private_HandleUserAdded(oMessage);
	}
	else if ("USER_REMOVED" === oMessage.type)
	{
		this.private_HandleUserRemoved(oMessage);
	}
	else if ("GAME_CONTAINER_REMOVE_GAME" === oMessage.type)
	{
		this.private_HandleGameContainerRemoveGame(oMessage);
	}
	else if ("GAME_LIST" === oMessage.type)
	{
		this.private_HandleGameList(oMessage);
	}
	else if ("USER_UPDATE" === oMessage.type)
	{
		this.private_HandleUserUpdate(oMessage);
	}
	else if ("JOIN_COMPLETE" === oMessage.type)
	{
		this.private_HandleJoinComplete(oMessage);
	}
	else if ("DETAILS_JOIN" === oMessage.type)
	{
		this.private_HandleDetailsJoin(oMessage);
	}
	else if ("UNJOIN" === oMessage.type)
	{
		this.private_HandleUnjoin(oMessage);
	}
	else if ("ROOM_DESC" === oMessage.type)
	{
		this.private_HandleRoomDesc(oMessage);
	}
	else if ("GLOBAL_GAMES_JOIN" === oMessage.type)
	{
		this.private_HandleGlobalGamesJoin(oMessage);
	}
	else if ("LOGIN_FAILED_BAD_PASSWORD" === oMessage.type)
	{
		this.private_HandleLoginFailedBadPassword(oMessage);
	}
	else if ("LOGIN_FAILED_NO_SUCH_USER" === oMessage.type)
	{
		this.private_HandleLoginFailedNoSuchUser(oMessage);
	}
	else if ("CONVO_JOIN" === oMessage.type)
	{
		this.private_HandleConvoJoin(oMessage);
	}
	else if ("ARCHIVE_JOIN" === oMessage.type)
	{
		this.private_HandleArchiveJoin(oMessage);
	}
	else if ("GAME_STATE" === oMessage.type)
	{
		this.private_HandleGameState(oMessage);
	}
	else if ("FRIEND_ADD_SUCCESS" === oMessage.type)
	{
		this.private_HandleFriendAddSuccess(oMessage);
	}
	else if ("FRIEND_REMOVE_SUCCESS" === oMessage.type)
	{
		this.private_HandleFriendRemoveSuccess(oMessage);
	}
	else if ("FRIEND_CHANGE_NO_USER" === oMessage.type)
	{
		this.private_HandleFriendChangeNoUser(oMessage);
	}
	else if ("DETAILS_NONEXISTANT" === oMessage.type)
	{
		this.private_HandleDetailsNonExistant(oMessage);
	}
	else if ("ARCHIVE_NONEXISTANT" === oMessage.type)
	{
		this.private_HandleArchiveNonExistant(oMessage);
	}
	else if ("CONVO_NO_CHATS" === oMessage.type)
	{
		this.private_HandleConvoNoChats(oMessage);
	}
	else if ("ANNOUNCE" === oMessage.type)
	{
		this.private_HandleAnnounce(oMessage);
	}
	else if ("PRIVATE_KEEP_OUT" === oMessage.type)
	{
		this.private_HandlePrivateKeepOut(oMessage);
	}
	else if ("IDLE_WARNING" === oMessage.type)
	{
		this.private_HandleIdleWarning(oMessage);
	}
	else if ("GAME_REVIEW" === oMessage.type)
	{
		this.private_HandleGameReview(oMessage);
	}
	else if ("CLOSE" === oMessage.type)
	{
		this.private_HandleClose(oMessage);
	}
	else if ("GAME_OVER" === oMessage.type)
	{
		this.private_HandleGameOver(oMessage);
	}
	else if ("DETAILS_RANK_GRAPH" === oMessage.type)
	{
		this.private_HandleDetailsRankGraph(oMessage);
	}
	else if ("CHANNEL_AUDIO" === oMessage.type)
	{
		this.private_HandleChannelAudio(oMessage);
	}
	else if ("ARCHIVE_GAMES_CHANGED" === oMessage.type)
	{
		this.private_HandleArchiveGamesChanged(oMessage);
	}
	else if ("GAME_NOTIFY" === oMessage.type)
	{
		this.private_HandleGameNotify(oMessage);
	}
	else if ("ARCHIVE_GAME_REMOVED" === oMessage.type)
	{
		this.private_HandleArchiveGameRemoved(oMessage);
	}
	else if ("DETAILS_UPDATE" === oMessage.type)
	{
		this.private_HandleDetailsUpdate(oMessage);
	}
	else if ("CHALLENGE_JOIN" === oMessage.type)
	{
		this.private_HandleChallengeJoin(oMessage);
	}
	else if ("CHALLENGE_SUBMIT" === oMessage.type)
	{
		this.private_HandleChallengeSubmit(oMessage);
	}
	else if ("CHALLENGE_CREATED" === oMessage.type)
	{
		this.private_HandleChallengeCreated(oMessage);
	}
	else if ("CHALLENGE_DECLINE" === oMessage.type)
	{
		this.private_HandleChallengeDecline(oMessage);
	}
	else if ("CHALLENGE_PROPOSAL" === oMessage.type)
	{
		this.private_HandleChallengeProposal(oMessage);
	}
	else if ("GAME_TIME_EXPIRED" === oMessage.type)
	{
		this.private_HandleGameTimeExpired(oMessage);
	}
	else if ("GAME_UNDO_REQUEST" === oMessage.type)
	{
		this.private_HandleGameUndoRequest(oMessage);
	}
	else if ("SYNC" === oMessage.type)
	{
		this.private_HandleSync(oMessage);
	}
	else
	{
		console.log(oMessage);
	}
};
CKGSClient.prototype.private_HandleLogout = function(oMessage)
{
	this.m_bLoggedIn = false;
	this.m_oApp.Logout(oMessage.text);
	console.log(oMessage);
};
CKGSClient.prototype.private_HandleHello = function(oMessage)
{
	// Ничего не делаем
};
CKGSClient.prototype.private_HandleRoomNames = function(oMessage)
{
	if (!oMessage.rooms || oMessage.rooms.length <= 0)
		return;

	for (var nIndex = 0, nCount = oMessage.rooms.length; nIndex < nCount; ++nIndex)
	{
		var oRoom = this.m_aAllRooms[oMessage.rooms[nIndex].channelId];
		if (undefined !== oRoom)
		{
			oRoom.Name            = oMessage.rooms[nIndex].name;
			oRoom.Private         = undefined !== oMessage.rooms[nIndex].private ? oMessage.rooms[nIndex].private : false;
			oRoom.TournamentOnly  = undefined !== oMessage.rooms[nIndex].tournOnly ? oMessage.rooms[nIndex].tournOnly : false;
			oRoom.GlobalGamesOnly = undefined !== oMessage.rooms[nIndex].globalGamesOnly ? oMessage.rooms[nIndex].globalGamesOnly : false;
		}
	}

	this.m_oGamesListView.Update();
};
CKGSClient.prototype.private_HandleRoomJoin = function(oMessage)
{
	this.m_aRooms[oMessage.channelId] = 1;

	this.m_oApp.AddChatRoom(oMessage.channelId, this.m_aAllRooms[oMessage.channelId].Name, false);

	if (this.m_oEnterChatRoomRequest[oMessage.channelId])
	{
		this.m_nChatChannelId = oMessage.channelId;
		this.m_oApp.SetCurrentChatRoomTab(oMessage.channelId);
		delete this.m_oEnterChatRoomRequest[oMessage.channelId];
	}
	else if (-1 === this.m_nChatChannelId || this.m_oGlobalSettings.GetKGSChatRoomId() === oMessage.channelId)
	{
		// Здесь не портим сохраненный идентефикатор чата
		var nOldSavedId = this.m_oGlobalSettings.GetKGSChatRoomId();
		this.m_nChatChannelId = oMessage.channelId;
		this.m_oApp.SetCurrentChatRoomTab(oMessage.channelId);
		this.m_oGlobalSettings.SetKGSChatRoomId(nOldSavedId);
	}
	else
	{
		this.m_oApp.ScrollChatTabsToCurrent();
	}

	var Games = oMessage.games;
	if (Games && Games.length > 0)
	{
		for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
		{
			var oEntry = Games[Pos];
			this.private_OnAddGameListRecord(oMessage.channelId, oEntry);
		}
	}

	var oRoom = this.m_aAllRooms[oMessage.channelId];
	if (oRoom)
	{
		oRoom.Users = {};

		var Users = oMessage.users;
		if (Users && Users.length > 0)
		{
			for (var Pos = 0, Count = oMessage.users.length; Pos < Count; ++Pos)
			{
				var oUserRecord = Users[Pos];
				this.private_AddUserToRoom(this.private_HandleUserRecord(oUserRecord, true), oRoom);
			}
		}
	}

	if (oMessage.channelId == this.m_nChatChannelId)
		this.private_UpdatePlayersList();

	if (EKGSGamesListType.AllGames === this.m_eGamesListType || EKGSGamesListType.AllChallenges === this.m_eGamesListType ||  (EKGSGamesListType.Room === this.m_eGamesListType && oMessage.channelId == this.m_nChatChannelId))
		this.private_UpdateGamesList();
};
CKGSClient.prototype.private_HandleLoginSuccess = function(oMessage)
{
	this.m_oCurrentUser = this.private_HandleUserRecord(oMessage.you, true);

	var Friends = oMessage.friends;
	if (Friends)
	{
		for (var Pos = 0, Count = Friends.length; Pos < Count; ++Pos)
		{
			var oFriend   = Friends[Pos];
			var sUserName = oFriend.user.name;
			if ("buddy" === oFriend["friendType"])
			{
				this.m_oFriendList[sUserName] = {
					Name : sUserName
				};
			}
			else if ("censored" === oFriend["friendType"])
			{
				this.m_oBlackList[sUserName] = {
					Name : sUserName
				};
			}
			else if ("fan" === oFriend["friendType"])
			{
				this.m_oFollowerList[sUserName] = {
					Name : sUserName
				};
			}
		}
	}

	this.private_SendMessage({
		"type" : "GLOBAL_LIST_JOIN_REQUEST",
		"list" : "ACTIVES"
	});

	this.private_SendMessage({
		"type" : "GLOBAL_LIST_JOIN_REQUEST",
		"list" : "FANS"
	});

	this.private_SendMessage({
		"type" : "GLOBAL_LIST_JOIN_REQUEST",
		"list" : "CHALLENGES"
	});

	var oRoomCategoryId = oMessage.roomCategoryChannelIds;
	for (var sCategoryId in oRoomCategoryId)
	{
		this.m_oRoomCategory[oRoomCategoryId[sCategoryId]] = sCategoryId;
	}

	var arrAllRoomChannelIds = [];
	var arrRooms = oMessage.rooms;
	for (var nIndex = 0, nCount = arrRooms.length; nIndex < nCount; ++nIndex)
	{
		var nChannelId  = arrRooms[nIndex].channelId;
		var sCategory   = arrRooms[nIndex].category;
		var nCategoryId = oRoomCategoryId[sCategory] ? oRoomCategoryId[sCategory] : -1;

		this.m_aAllRooms[nChannelId] = {
			ChannelId       : nChannelId,
			Category        : nCategoryId,
			CategoryName    : sCategory,
			Name            : "",
			GreetingMessage : "",
			PrivateChat     : false,
			Private         : false,
			TournamentOnly  : false,
			GlobalGamesOnly : false,
			Users           : [],
			Games           : []
		};

		arrAllRoomChannelIds.push(nChannelId);
	}

	this.private_SendMessage({
		"type"  : "ROOM_NAMES_REQUEST",
		"rooms" : arrAllRoomChannelIds
	});

	this.m_oApp.OnConnect();

	this.SetGamesListType(this.m_oGlobalSettings.GetKGSGamesListType());
};
CKGSClient.prototype.private_HandleGameRecord = function(oGameRecord, bAdd)
{
	var nGameType = oGameRecord.GetGameType();

	var nGameId     = oGameRecord.GetGameId();
	var sGameType   = "";
	var nMoveNumber = oGameRecord.GetMoveNum();
	var nObservers  = oGameRecord.GetObservers();
	var sComment    = oGameRecord.GetScore();
	var nAdd        = true === bAdd ? 0 : 1;
	var oBlack      = oGameRecord.GetBlack();
	var oWhite      = oGameRecord.GetWhite();
	var oOwner      = oGameRecord.GetOwner();

	var sBlack      = oBlack ? oBlack.GetName() : "";
	var nBlackR     = oBlack ? oBlack.GetRank() : -3;
	var sWhite      = oWhite ? oWhite.GetName() : "";
	var nWhiteR     = oWhite ? oWhite.GetRank() : -3;
	var bPrivate    = oGameRecord.IsPrivate();
	var nRoomId     = oGameRecord.GetRoomId();
	var bAdjourned  = oGameRecord.IsAdjourned();
	var bEvent      = oGameRecord.IsEvent();
	var bDemo       = false;
	var nSize       = oGameRecord.GetBoardSize();
	var nHandi      = oGameRecord.GetHandicap();
	var bChallenge  = false;
	var sGameName   = "";
	var sTime       = "";
	var sSizeHandi  = nSize + "x" + nSize + (0 !== nHandi ? " H" + nHandi : "");

	if (EKGSGameType.Challenge === nGameType)
	{
		bChallenge = true;

		var oProposal = oGameRecord.GetProposal();

		nGameType = oProposal.GetGameType();
		bDemo = false;
		
		var nBoardSize = oProposal.GetBoardSize();

		var oCreator = oGameRecord.GetChallengeCreator();
		sWhite       = oCreator ? oCreator.GetName() : "";
		nWhiteR      = oCreator ? oCreator.GetRank() : -3;
		sBlack       = "";
		nBlackR      = -3;
		sGameName    = oGameRecord.GetComment();
		sSizeHandi   = nBoardSize + "x" + nBoardSize + ",   "  + oProposal.GetKomi() + ",   " + KGSCommon.GameRulesToRedableString(oProposal.GetRules());
		sTime        = oProposal.GetTimeSettingsString();

		if (oCreator && oCreator.IsRobot())
			sWhite += "(robot)";
	}

	if (EKGSGameType.Demonstration === nGameType)
	{
		sGameType = "D";
		sComment  = "";
		bDemo     = true;

		if (oOwner)
		{
			sWhite  = oOwner.GetName();
			nWhiteR = oOwner.GetRank();
		}
		else
		{
			sWhite  = "";
			nWhiteR = -3;
		}
	}
	else if (EKGSGameType.Review === nGameType || EKGSGameType.RengoReview === nGameType)
	{
		sGameType = "D";
		sComment  = "";
		bDemo     = true;
		
		if (oOwner)
		{
			sWhite  = oOwner.GetName();
			nWhiteR = oOwner.GetRank();
		}
		else
		{
			sWhite  = "";
			nWhiteR = -3;
		}

		if (oBlack && oWhite)
			sWhite += " review (" + oWhite.GetName() + " vs. " + oBlack.GetName() + ")";
	}
	else if (EKGSGameType.Free === nGameType)
		sGameType = "F";
	else if (EKGSGameType.Ranked === nGameType)
		sGameType = "R";
	else if (EKGSGameType.Teaching === nGameType)
		sGameType = "T";
	else if (EKGSGameType.Simul === nGameType)
		sGameType = "S";
	else if (EKGSGameType.Rengo === nGameType)
		sGameType = "2";
	else if (EKGSGameType.Tournament === nGameType)
		sGameType = "*";

	if (true === bPrivate)
		sGameType = "P";

	this.m_oGamesListView.Handle_Record([nAdd, nGameId, sGameType, nObservers, "", sWhite, nWhiteR, "", sBlack, nBlackR, sComment, nMoveNumber, bPrivate, nRoomId, bAdjourned, bEvent, bDemo, sSizeHandi, bChallenge, sGameName, sTime]);
};
CKGSClient.prototype.private_HandleUserRecord = function(oUserRecord, bUpdateUserInfo)
{
	var sName = oUserRecord.name.toLowerCase();

	var oUser = null;
	if (this.m_oAllUsers[sName])
	{
		oUser = this.m_oAllUsers[sName];
		if (true === bUpdateUserInfo)
			oUser.Update(oUserRecord);
	}
	else
	{
		oUser = new CKGSUser(this);
		oUser.Update(oUserRecord);
		this.m_oAllUsers[sName] = oUser;
	}

	return oUser;
};
CKGSClient.prototype.private_HandleGameJoin = function(oMessage)
{
	var nGameRoomId = oMessage.channelId;

	if (this.m_aGames[nGameRoomId])
		return;

	var oGame = new CKGSGameRoom(this, nGameRoomId);
	this.m_aGames[nGameRoomId] = oGame;

	var oGameRecord;
	if (this.m_oAllGames[nGameRoomId])
	{
		oGameRecord = this.m_oAllGames[nGameRoomId];
	}
	else if (this.m_oGameNotify[nGameRoomId])
	{
		oGameRecord = this.m_oGameNotify[nGameRoomId];
		delete this.m_oGameNotify[nGameRoomId];
	}

	oGame.InitGameTree(oMessage.gameSummary);
	oGame.SetPlayers(oGameRecord);

	this.m_oApp.AddGameRoom(oGame);
	this.m_oApp.SetCurrentGameRoomTab(nGameRoomId);

	oGame.ReadSgfEvents(oMessage["sgfEvents"], true);
	oGame.UpdateClocks(oMessage["clocks"], true);
	oGame.HandleGameActions(oMessage["actions"]);
	oGame.HandleScore(oMessage["score"] ? this.private_ParseScore(oMessage["score"]) : null);
	oGame.UpdatePlayersList(oMessage["users"]);
};
CKGSClient.prototype.private_HandleGameUpdate = function(oMessage)
{
	var GameRoomId = oMessage.channelId;
	var oGame = this.m_aGames[GameRoomId];
	if (!oGame)
		return;

	oGame.ReadSgfEvents(oMessage["sgfEvents"], false);
};
CKGSClient.prototype.private_HandleChat = function(oMessage)
{
	var oUser = this.private_HandleUserRecord(oMessage.user, false);

	// TODO: Обычный клиент позволяет писать в приват, даже если пользователь в черном списке. Можно это изменить,
	// но тогда нужно выдавать сообщение при попытке зайти в приватный чат.
	if (true !== this.IsPrivateChat(oMessage.channelId) && true === this.IsUserInBlackList(oUser.GetName()))
		return;

	var oPrivateChat = this.m_oPrivateChats[oMessage.channelId];
	if (undefined !== oPrivateChat && true === oPrivateChat.Disabled)
	{
		if (oUser.GetName() === this.m_oCurrentUser.GetName())
			return;
		else
			oPrivateChat.Disabled = false;
	}

	this.m_oApp.OnAddChatMessage(oMessage.channelId, oUser.GetName(), oMessage.text);
};
CKGSClient.prototype.private_HandleUserAdded = function(oMessage)
{
	var oUser = this.private_HandleUserRecord(oMessage.user, true);
	var oRoom = this.m_aAllRooms[oMessage.channelId];
	var oGame = this.m_aGames[oMessage.channelId];
	if (oRoom)
	{
		this.private_AddUserToRoom(oUser, oRoom);
		if (oMessage.channelId === this.m_nChatChannelId)
		{
			this.m_oPlayersListView.Handle_Record([0, oUser.GetName(), oUser.GetRank(), oUser.IsFriend(), oUser]);
			this.m_oPlayersListView.Update_Size();
		}
	}
	else if (oGame)
	{
		oGame.HandleUserAdded(oUser);
	}
};
CKGSClient.prototype.private_HandleUserRemoved = function(oMessage)
{
	if (!oMessage || !oMessage.user)
		return;

	var oUser      = this.private_HandleUserRecord(oMessage.user, false);
	var oRoom      = this.m_aAllRooms[oMessage.channelId];
	var oGame      = this.m_aGames[oMessage.channelId];
	var oChallenge = this.m_oChallenges[oMessage.channelId];
	if (oRoom)
	{
		delete oRoom.Users[oUser.GetName()];

		if (oMessage.channelId === this.m_nChatChannelId)
		{
			this.m_oPlayersListView.Handle_Record([1, oUser.GetName(), -2, false, oUser]);
			this.m_oPlayersListView.Update_Size();
		}
	}
	else if (oGame)
	{
		oGame.HandleUserRemoved(oUser);
	}
	else if (oChallenge)
	{
		oChallenge.OnUserRemoved(oUser);
	}
};
CKGSClient.prototype.private_HandleGameList = function(oMessage)
{
	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];

		var oGameRecord = this.private_OnAddGameListRecord(oMessage.channelId, oEntry);
		var bChallenge = oGameRecord.IsChallenge();

		if ((EKGSGamesListType.AllGames === this.m_eGamesListType && true !== bChallenge)
			|| (EKGSGamesListType.AllChallenges === this.m_eGamesListType && true === bChallenge)
			|| (EKGSGamesListType.Room === this.m_eGamesListType && oMessage.channelId == this.m_nChatChannelId)
			|| (EKGSGamesListType.Follower === this.m_eGamesListType && oMessage.channelId === this.m_nFollowersGamesChannelId))
			this.private_HandleGameRecord(oGameRecord, true);
	}
	this.m_oGamesListView.Update_Size();
};
CKGSClient.prototype.private_HandleGameContainerRemoveGame = function(oMessage)
{
	var oGameRecord = this.private_OnRemoveGameListRecord(oMessage.channelId, oMessage.gameId);
	if (!oGameRecord)
		return;

	var bIsChallenge = oGameRecord.IsChallenge();

	if ((EKGSGamesListType.AllGames === this.m_eGamesListType && !this.m_oAllGames[oMessage.gameId] && true !== bIsChallenge)
		|| (EKGSGamesListType.AllChallenges === this.m_eGamesListType && !this.m_oAllGames[oMessage.gameId] && true === bIsChallenge)
		|| (EKGSGamesListType.Room === this.m_eGamesListType && oMessage.channelId === this.m_nChatChannelId)
		|| (EKGSGamesListType.Follower === this.m_eGamesListType && oMessage.channelId === this.m_nFollowersGamesChannelId))
	{
		this.m_oGamesListView.Handle_Record([1, oMessage.gameId]);
		this.m_oGamesListView.Update_Size();
	}
};
CKGSClient.prototype.private_HandleUserUpdate = function(oMessage)
{
	var oUser = this.private_HandleUserRecord(oMessage.user, true);
	var sUserName = oUser.GetName();

	// Если у нас есть приватный чат с пользователем, который ушел с сервера, сообщаем об этом.
	var oPrivateChat = this.m_oPrivateChatsByUserName[sUserName];
	if (undefined !== oPrivateChat)
	{
		var nChannelId = oPrivateChat.ChannelId;
		if (false === oUser.IsOnline())
		{
			this.m_oApp.OnAddChatMessage(nChannelId, null, sUserName + " has left the server");
			delete oPrivateChat.Users[sUserName];

			if (nChannelId === this.m_nChatChannelId)
			{
				this.m_oPlayersListView.Handle_Record([1, oUser.GetName(), -2, false, oUser]);
				this.m_oPlayersListView.Update_Size();
			}
		}
		else if (undefined === oPrivateChat.Users[sUserName])
		{
			this.m_oApp.OnAddChatMessage(nChannelId, null, sUserName + " is back to the server");
			oPrivateChat.Users[sUserName] = oUser;
			if (nChannelId === this.m_nChatChannelId)
			{
				this.m_oPlayersListView.Handle_Record([0, oUser.GetName(), oUser.GetRank(), oUser.IsFriend(), oUser]);
				this.m_oPlayersListView.Update_Size();
			}
		}
	}
};
CKGSClient.prototype.private_HandleJoinComplete = function(oMessage)
{
	if (this.m_aRooms[oMessage.channelId])
	{
		var oRoom = this.m_aAllRooms[oMessage.channelId];
		this.m_oApp.AddRoomGreetingMessage(oMessage.channelId, oRoom.GreetingMessage);
	}
};
CKGSClient.prototype.private_HandleDetailsJoin = function(oMessage)
{
	var sUserName = oMessage.user.name.toLowerCase();
	if (this.m_oUserInfo[sUserName])
	{
		this.m_oUserInfo[sUserName].Window.OnUserDetails(oMessage);
		this.m_oUserInfo[sUserName].Window.Show();
		this.m_oUserInfo[sUserName].DetailsChannel = oMessage.channelId;

		this.private_SendMessage({
			"type"      : "DETAILS_RANK_GRAPH_REQUEST",
			"channelId" : oMessage.channelId
		});
	}
	else
	{
		// Окно закрыли до того, как пришла информация
		this.private_SendMessage({
			"type"      : "UNJOIN_REQUEST",
			"channelId" : oMessage.channelId
		});
	}
};
CKGSClient.prototype.private_HandleUnjoin = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oRoom = this.m_aAllRooms[nChannelId];
	if (oRoom)
	{
		for (var nGameId in this.m_oAllGames)
		{
			var oGameRecord = this.m_oAllGames[nGameId];

			if (oGameRecord.RemoveRoom(nChannelId))
				delete this.m_oAllGames[nGameId];
		}

		oRoom.Games = [];
		oRoom.Users = [];

		this.private_UpdateGamesList();
		this.private_UpdatePlayersList();
	}
};
CKGSClient.prototype.private_HandleRoomDesc = function(oMessage)
{
	if (this.m_aAllRooms[oMessage.channelId])
	{
		var oRoom = this.m_aAllRooms[oMessage.channelId];
		oRoom.GreetingMessage = oMessage.description;
		oRoom.Owners = [];

		for (var nIndex = 0, nCount = oMessage.owners.length; nIndex < nCount; ++nIndex)
		{
			oRoom.Owners.push(this.private_HandleUserRecord(oMessage.owners[nIndex], true));
		}

		if (this.m_aRooms[oMessage.channelId])
		{
			var oRoom = this.m_aAllRooms[oMessage.channelId];
			this.m_oApp.AddRoomGreetingMessage(oMessage.channelId, oRoom.GreetingMessage);
		}
	}
};
CKGSClient.prototype.private_HandleGlobalGamesJoin = function(oMessage)
{
	if ("CHALLENGES" === oMessage.containerType)
		this.m_nGlobalChallengesChannelId = oMessage.channelId;
	if ("ACTIVES" === oMessage.containerType)
		this.m_nGlobalGamesChannelId = oMessage.channelId;
	else if ("FANS" === oMessage.containerType)
		this.m_nFollowersGamesChannelId = oMessage.channelId;

	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];
		this.private_OnAddGameListRecord(oMessage.channelId, oEntry);
	}

	if (EKGSGamesListType.AllGames === this.m_eGamesListType
		|| (EKGSGamesListType.AllChallenges === this.m_eGamesListType && "CHALLENGES" === oMessage.containerType)
		|| (EKGSGamesListType.Follower === this.m_eGamesListType && "FANS" === oMessage.containerType))
		this.private_UpdateGamesList();
};
CKGSClient.prototype.private_HandleLoginFailedBadPassword = function(oMessage)
{
	this.m_bLoggedIn = false;
	this.m_oApp.Logout("Login or password is incorrect.");
};
CKGSClient.prototype.private_HandleLoginFailedNoSuchUser = function(oMessage)
{
	this.m_bLoggedIn = false;
	this.m_oApp.Logout("Login or password is incorrect.");
};
CKGSClient.prototype.private_HandleConvoJoin = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oUser = this.private_HandleUserRecord(oMessage.user, true);
	var sUserName  = oUser.GetName();

	this.m_oPrivateChats[nChannelId] = {
		ChannelId       : nChannelId,
		Name            : sUserName,
		Users           : {},
		Disabled        : false
	};

	this.m_oPrivateChatsByUserName[sUserName] = this.m_oPrivateChats[nChannelId];
	
	this.m_oApp.AddChatRoom(nChannelId, sUserName, true);

	this.private_AddUserToRoom(this.private_GetCurrentUser(), this.m_oPrivateChats[nChannelId]);

	if (oUser.IsOnline())
		this.private_AddUserToRoom(oUser, this.m_oPrivateChats[nChannelId]);
	else
		this.m_oApp.OnAddChatMessage(nChannelId, null, sUserName + " is offline");

	if (true !== this.m_oApp.IsTypingChatMessage())
	{
		this.m_nChatChannelId = nChannelId;
		this.m_oApp.SetCurrentChatRoomTab(nChannelId);
	}
};
CKGSClient.prototype.private_HandleArchiveJoin = function(oMessage)
{
	var sUserName = oMessage.user.name.toLowerCase();
	if (this.m_oUserInfo[sUserName])
	{
		this.m_oUserInfo[sUserName].ArchiveChannel = oMessage.channelId;
		this.m_oUserInfo[sUserName].Window.OnUserGameArchive(oMessage);
	}
	else
	{
		// Окно закрыли до того, как пришла информация
		this.private_SendMessage({
			"type"      : "UNJOIN_REQUEST",
			"channelId" : oMessage.channelId
		});
	}
};
CKGSClient.prototype.private_HandleGameState = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oGame = this.m_aGames[nChannelId];
	if (!oGame)
		return;

	oGame.HandleGameActions(oMessage["actions"]);
	oGame.UpdateClocks(oMessage["clocks"], false);
	oGame.UpdateScores(oMessage);
};
CKGSClient.prototype.private_HandleFriendAddSuccess = function(oMessage)
{
	var sUserName = oMessage["user"]["name"];
	var sFriendType = oMessage["friendType"];
	if ("buddy" === sFriendType)
	{
		this.m_oFriendList[sUserName] = {
			Name : sUserName
		};
	}
	else if ("censored" === sFriendType)
	{
		this.m_oBlackList[sUserName] = {
			Name : sUserName
		};
	}
	else if ("fan" === sFriendType)
	{
		this.m_oFollowerList[sUserName] = {
			Name : sUserName
		};

		this.m_oGamesListView.Update_Size();
	}

	this.m_oPlayersListView.Update_Size();
};
CKGSClient.prototype.private_HandleFriendRemoveSuccess = function(oMessage)
{
	var sUserName = oMessage["user"]["name"];
	var sFriendType = oMessage["friendType"];
	if ("buddy" === sFriendType)
	{
		if (undefined !== this.m_oFriendList[sUserName])
			delete this.m_oFriendList[sUserName];
	}
	else if ("censored" === sFriendType)
	{
		if (undefined !== this.m_oBlackList[sUserName])
			delete this.m_oBlackList[sUserName];
	}
	else if ("fan" === sFriendType)
	{
		if (undefined !== this.m_oFollowerList[sUserName])
			delete this.m_oFollowerList[sUserName];

		this.m_oGamesListView.Update_Size();
	}

	this.m_oPlayersListView.Update_Size();
};
CKGSClient.prototype.private_HandleFriendChangeNoUser = function(oMessage)
{
	console.log("Bad user friend change request");
};
CKGSClient.prototype.private_HandleDetailsNonExistant = function(oMessage)
{
	var sUserName = oMessage.name.toLowerCase();
	if (this.m_oUserInfo[sUserName])
	{
		var oUser = this.m_oUserInfo[sUserName];
		if (oUser.Window)
			oUser.Window.Close();
	}
	
	CreateKGSWindow(EKGSWindowType.Information, {Client : this, App : this.m_oApp, Caption : "Error", Text : "There is no user account named \"" + oMessage.name + "\" on this system.", Image : "WarningSpanWarning", W : 347, H : 144});
};
CKGSClient.prototype.private_HandleArchiveNonExistant = function(oMessage)
{
	var sUserName = oMessage.name.toLowerCase();
	if (this.m_oUserInfo[sUserName])
	{
		var oUser = this.m_oUserInfo[sUserName];
		if (oUser.Window)
			oUser.Window.Close();
	}
};
CKGSClient.prototype.private_HandleConvoNoChats = function(oMessage)
{
	var oPrivateChat = this.m_oPrivateChats[oMessage.channelId];
	if (undefined !== oPrivateChat)
	{
		if (true !== oPrivateChat.Disabled)
		{
			this.m_oApp.OnAddChatMessage(oPrivateChat.ChannelId, null, oPrivateChat.Name + " has disabled chats");
			oPrivateChat.Disabled = true;
		}
	}
};
CKGSClient.prototype.private_HandleAnnounce = function(oMessage)
{
	var oUser = this.private_HandleUserRecord(oMessage.user, false);
	this.m_oApp.OnAddChatMessage(oMessage.channelId, oUser.GetName(), oMessage.text, {Announce : true});
};
CKGSClient.prototype.private_HandlePrivateKeepOut = function(oMessage)
{
	var nChannelId = oMessage.channelId;

	var sRoomName = "this room", oRecord;
	if (undefined !== this.m_aAllRooms[nChannelId])
	{
		sRoomName = "\"" + this.m_aAllRooms[nChannelId].Name + "\"";
		if (undefined !== this.m_oEnterChatRoomRequest[nChannelId])
			delete this.m_oEnterChatRoomRequest[nChannelId];
	}
	else if (null !== (oRecord = this.m_oGamesListView.Get_RecordById(nChannelId)))
	{
		if (true === oRecord.m_bDemo)
			sRoomName = "\"" + oRecord.m_sWhiteName + "\"";
		else
			sRoomName = "\"" + oRecord.m_sWhiteName + " vs. " + oRecord.m_sBlackName + "\"";
	}
	else if (undefined !== this.m_oGameNotify[nChannelId])
	{
		delete this.m_oGameNotify[nChannelId];
	}

	CreateKGSWindow(EKGSWindowType.Information, {Client : this, App : this.m_oApp, Caption : "Error", Text : "Sorry, " + sRoomName + " is private. You cannot enter.", Image : "WarningSpanNoEntry", W : 485, H : 144});
};
CKGSClient.prototype.private_HandleIdleWarning = function(oMessage)
{
	CreateKGSWindow(EKGSWindowType.Idle, {Client : this, App : this.m_oApp});
};
CKGSClient.prototype.private_HandleGameReview = function(oMessage)
{
	var nChannelId = oMessage.originalId;
	var oGame = this.m_aGames[nChannelId];
	if (undefined === oGame)
		return;

	var nNewChannelId = oMessage.review.channelId;

	oGame.OnStartReview(nNewChannelId, GetKGSUser(oMessage["review"]["players"]["owner"]));

	this.m_aGames[nNewChannelId] = oGame;
	delete this.m_aGames[nChannelId];

	this.m_oApp.ModifyGameRoom(nChannelId, nNewChannelId, true);
};
CKGSClient.prototype.private_HandleClose = function(oMessage)
{
	// Если данное сообщение приходит из GAME_REVIEW, вся обработка происходит там
	// Кроме того данное сообщение происходит, если создатель вызова закрывает вызов.
	var nChannelId = oMessage.channelId;
	if (this.m_oChallenges[nChannelId])
	{
		RemoveWindow(this.m_oChallenges[nChannelId]);
		delete this.m_oChallenges[nChannelId];
	}
};
CKGSClient.prototype.private_HandleGameOver = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oGame = this.m_aGames[nChannelId];
	if (!oGame)
		return;

	oGame.HandleScore(oMessage["score"] ? this.private_ParseScore(oMessage["score"]) : null);
	// TODO: Добавить окно с окончанием партии
};
CKGSClient.prototype.private_HandleDetailsRankGraph = function(oMessage)
{
	for (var sUserName in this.m_oUserInfo)
	{
		var oInfo = this.m_oUserInfo[sUserName];
		if (oInfo.DetailsChannel === oMessage.channelId && oInfo.Window)
		{
			oInfo.Window.OnRankGraph(oMessage.data);
		}
	}
};
CKGSClient.prototype.private_HandleChannelAudio = function(oMessage)
{
	//var srcAudio = Common.Decode_Base64(oMessage.audio);
	//var srcAudio = atob(oMessage.audio);

	//this.m_oApp.m_oSound.PlayLecture("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=");
	//this.m_oApp.m_oSound.PlayLecture("data:audio/ogg;base64," + oMessage.audio);

	// var audio = new Audio();
	// audio.src = "data:audio/ogg;base64," + oMessage.audio;
	// //audio.addEventListener('MozAudioAvailable', someFunction, false);
	// audio.play();
};
CKGSClient.prototype.private_HandleArchiveGamesChanged = function(oMessage)
{
	for (var sUserName in this.m_oUserInfo)
	{
		var oInfo = this.m_oUserInfo[sUserName];
		if (oInfo.ArchiveChannel === oMessage.channelId && oInfo.Window)
		{
			oInfo.Window.OnUserGameArchiveUpdate(oMessage);
		}
	}
};
CKGSClient.prototype.private_HandleGameNotify = function(oMessage)
{
	var oRecord = oMessage.game;
	if (!oRecord)
		return;

	var nGameId = oRecord.channelId;

	var oGameRecord = new CKGSGameListRecord(this);
	oGameRecord.Update(oRecord);
	this.m_oGameNotify[nGameId] = oGameRecord;
};
CKGSClient.prototype.private_HandleArchiveGameRemoved = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	for (var sUserName in this.m_oUserInfo)
	{
		var oInfo = this.m_oUserInfo[sUserName];
		if (oInfo.ArchiveChannel === nChannelId && oInfo.Window)
		{
			oInfo.Window.OnUserArchiveGameRemove(oMessage);
		}
	}
};
CKGSClient.prototype.private_HandleDetailsUpdate = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	for (var sUserName in this.m_oUserInfo)
	{
		var oInfo = this.m_oUserInfo[sUserName];
		if (oInfo.DetailsChannel === nChannelId && oInfo.Window)
		{
			oInfo.Window.OnDetailsUpdate(oMessage);
		}
	}
};
CKGSClient.prototype.private_HandleChallengeJoin = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oGameRecord = this.m_oAllGames[nChannelId];
	if (this.m_oChallenges[nChannelId] || !oGameRecord)
		return;

	var oWindow = CreateKGSWindow(EKGSWindowType.Challenge, {ChannelId : nChannelId, GameRecord : oGameRecord, Client : this, App: this.m_oApp});
	this.m_oChallenges[nChannelId] = oWindow;
};
CKGSClient.prototype.private_HandleChallengeSubmit = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oUser      = new GetKGSUser(oMessage.user, this);
	var oProposal  = new CKGSChallengeProposal(oMessage.proposal);

	var oWindow = this.m_oChallenges[nChannelId];
	if (!oWindow)
		return;

	oWindow.OnSubmit(oUser, oProposal);
};
CKGSClient.prototype.private_HandleChallengeCreated = function(oMessage)
{
	var oWindow = this.m_oChallenges[-1];
	if (oWindow)
	{
		var nChannelId = oMessage.game.channelId;

		// Если так случилось, что сообщение ChallengeJoin пришло раньше, и мы создали второе окно, то его просто убираем
		if (this.m_oChallenges[nChannelId])
		{
			RemoveWindow(this.m_oChallenges[nChannelId]);
			delete this.m_oChallenges[nChannelId];
		}

		oWindow.OnChallengeCreated(nChannelId);
		this.m_oChallenges[nChannelId] = oWindow;
		delete this.m_oChallenges[-1];
	}
};
CKGSClient.prototype.private_HandleChallengeDecline = function(oMessage)
{
	var nChannelId = oMessage.channelId;

	var oWindow = this.m_oChallenges[nChannelId];
	if (!oWindow)
		return;

	oWindow.OnDecline();
};
CKGSClient.prototype.private_HandleChallengeProposal = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oWindow = this.m_oChallenges[nChannelId];
	if (!oWindow)
		return;

	var oProposal = new CKGSChallengeProposal(oMessage.proposal);
	oWindow.OnProposal(oProposal);
};
CKGSClient.prototype.private_HandleGameTimeExpired = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	this.private_SendMessage({
		"type"     : "GAME_TIME_EXPIRED",
		"channelId": nChannelId
	});
};
CKGSClient.prototype.private_HandleGameUndoRequest = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var oGame = this.m_aGames[nChannelId];
	if (oGame && true !== oGame.IsUndoForbidden())
	{
		CreateKGSWindow(EKGSWindowType.UndoRequest, {
			App        : this.m_oApp,
			Client     : this,
			Text       : "The opponent has requested an undo for their last move. Do you want to perform an undo?",
			WindowId   : nChannelId,
			GameRoom   : oGame,
			W          : 320,
			H          : 140,
			Resizeable : false,
			OkHandler  : function()
			{
				oGame.AcceptUndo();
			}
		});
	}
};
CKGSClient.prototype.private_HandleSync = function(oMessage)
{
	var nCallbackKey = oMessage["callbackKey"];
	var oClass = this.m_oSync[nCallbackKey];
	if (oClass)
	{
		delete this.m_oSync[nCallbackKey];
		oClass.OnSync();
	}
};
CKGSClient.prototype.private_AddUserToRoom = function(oUser, oRoom)
{
	oRoom.Users[oUser.GetName()] = oUser;
};
CKGSClient.prototype.GetRank = function(sRank)
{
	return this.private_GetRank(sRank);
};
CKGSClient.prototype.private_GetRank = function(sRank)
{
	if (!sRank)
		return -1;

	if (-1 !== sRank.indexOf("k"))
	{
		var nValue = Math.max(1, Math.min(30, parseInt(sRank)));
		return 30 - nValue;
	}
	else if (-1 !== sRank.indexOf("d"))
	{
		var nValue = Math.max(1, Math.min(20, parseInt(sRank)));
		return nValue + 29;
	}
	else if (-1 !== sRank.indexOf("p"))
	{
		var nValue = Math.max(1, parseInt(sRank));
		return nValue + 49;
	}
	else if (-1 !== sRank.indexOf("-"))
	{
		return -1;
	}

	return -2;
};
CKGSClient.prototype.GetStringRank = function(nRank)
{
	if (nRank <= -2)
		return "?";
	else if (nRank === -1)
		return "-";
	else if (nRank <= 29)
		return (30 - nRank) + "k";
	else if (nRank <= 49)
		return (nRank - 29) + "d";
	else
		return (nRank - 49) + "p";
};
CKGSClient.prototype.private_IsFriend = function(sUserName)
{
	if (undefined !== this.m_oFriendList[sUserName])
		return true;

	return false;
};
CKGSClient.prototype.private_TranslateUnicodeMessage = function(sMessage)
{
	var sUnicode = "";
	for (var nCharIndex = 0, nCount = sMessage.length; nCharIndex < nCount; ++nCharIndex)
	{
		var nCharCode = sMessage.charCodeAt(nCharIndex);
		if (nCharCode < 128)
			sUnicode += sMessage.charAt(nCharIndex);
		else
			sUnicode += "\\u" + ("0000" + nCharCode.toString(16)).substr(-4);
	}
	return sUnicode;
};
CKGSClient.prototype.private_UpdatePlayersList = function()
{
	this.m_oPlayersListView.Clear();

	var oChatRoom    = this.m_aAllRooms[this.m_nChatChannelId];
	var oPrivateChat = this.m_oPrivateChats[this.m_nChatChannelId];

	var oRoom = null;

	if (oChatRoom)
		oRoom = oChatRoom;
	else if (oPrivateChat)
		oRoom = oPrivateChat;

	if (oRoom)
	{
		for (var sUserName in oRoom.Users)
		{
			var oUser = oRoom.Users[sUserName];
			this.m_oPlayersListView.Handle_Record([0, oUser.GetName(), oUser.GetRank(), oUser.IsFriend(), oUser]);
		}
	}

	this.m_oPlayersListView.Update_Size();
};
CKGSClient.prototype.private_GetCurrentUser = function()
{
	return this.m_oCurrentUser;
};
CKGSClient.prototype.private_ParseScore = function(sScore)
{
	var sResult = "";
	if ("UNKNOWN" === sScore || "UNFINISHED" === sScore || "NO_RESULT" === sScore)
		sResult = "-";
	else if ("B+RESIGN" === sScore)
		sResult = "B+Resign";
	else if ("W+RESIGN" === sScore)
		sResult = "W+Resign";
	else if ("B+FORFEIT" === sScore)
		sResult = "B+Forfeit";
	else if ("W+FORFEIT" === sScore)
		sResult = "W+Forfeit";
	else if ("B+TIME" === sScore)
		sResult = "B+Time";
	else if ("W+TIME" === sScore)
		sResult = "W+Time";
	else
	{
		var dScore = parseFloat(sScore);
		if (dScore < 0)
			sResult = "W+" + Math.abs(dScore);
		else
			sResult = "B+" + Math.abs(dScore);
	}

	return sResult;
};
CKGSClient.prototype.private_OnAddGameListRecord = function(nRoomId, oRecord)
{
	var nGameId = oRecord.channelId;
	var oGameRecord;
	if (this.m_oAllGames[nGameId])
	{
		oGameRecord = this.m_oAllGames[nGameId];
	}
	else
	{
		oGameRecord = new CKGSGameListRecord(this);
		this.m_oAllGames[nGameId] = oGameRecord;
	}

	var oRoom = this.m_aAllRooms[nRoomId];
	if (oRoom)
	{
		oRoom.Games[nGameId] = oGameRecord;
	}
	else if (nRoomId === this.m_nFollowersGamesChannelId)
	{
		this.m_oFollowersGames[nGameId] = oGameRecord;
	}

	oGameRecord.Update(oRecord);
	oGameRecord.AddRoom(nRoomId);

	return oGameRecord;
};
CKGSClient.prototype.private_OnRemoveGameListRecord = function(nRoomId, nGameId)
{
	var oGameRecord = this.m_oAllGames[nGameId];
	if (oGameRecord)
	{
		if (oGameRecord.RemoveRoom(nRoomId))
			delete this.m_oAllGames[nGameId];

		var oRoom = this.m_aAllRooms[nRoomId];
		if (oRoom)
			delete oRoom.Games[nGameId];
		else if (nRoomId === this.m_nFollowersGamesChannelId)
			delete this.m_oFollowersGames[nGameId];
	}

	return oGameRecord;
};
CKGSClient.prototype.GetGamesListType = function()
{
	return this.m_eGamesListType;
};
CKGSClient.prototype.SetGamesListType = function(eType)
{
	if (eType !== this.m_eGamesListType)
	{
		if (eType === EKGSGamesListType.AllChallenges)
		{
			this.m_oGamesListView.GetListObject().ResetToChallangesList();
		}
		else if (this.m_eGamesListType === EKGSGamesListType.AllChallenges)
		{
			this.m_oGamesListView.GetListObject().ResetToGamesList();
		}

		this.m_eGamesListType = eType;
		this.m_oApp.GetGlobalSettings().SetKGSGamesListType(eType);
		this.private_UpdateGamesList();
	}
};
CKGSClient.prototype.private_UpdateGamesList = function()
{
	this.m_oGamesListView.Clear();

	if (EKGSGamesListType.AllGames === this.m_eGamesListType)
	{
		for (var nGameId in this.m_oAllGames)
		{
			var oGameRecord = this.m_oAllGames[nGameId];
			if (!oGameRecord.IsChallenge())
				this.private_HandleGameRecord(oGameRecord, true);
		}
	}
	else if (EKGSGamesListType.AllChallenges === this.m_eGamesListType)
	{
		for (var nGameId in this.m_oAllGames)
		{
			var oGameRecord = this.m_oAllGames[nGameId];
			if (oGameRecord.IsChallenge())
				this.private_HandleGameRecord(oGameRecord, true);
		}
	}
	else if (EKGSGamesListType.Room === this.m_eGamesListType)
	{
		var oRoom = this.m_aAllRooms[this.m_nChatChannelId];
		if (oRoom)
		{
			for (var nGameId in oRoom.Games)
			{
				var oGameRecord = oRoom.Games[nGameId];
				this.private_HandleGameRecord(oGameRecord, true);
			}
		}
	}
	else if (EKGSGamesListType.Follower === this.m_eGamesListType)
	{
		for (var nGameId in this.m_oFollowersGames)
		{
			var oGameRecord = this.m_oFollowersGames[nGameId];
			this.private_HandleGameRecord(oGameRecord, true);
		}
	}

	this.m_oGamesListView.Update_Size();
};
CKGSClient.prototype.GetGame = function(nGameId)
{
	if (!this.m_oAllGames[nGameId])
		return null;

	return this.m_oAllGames[nGameId];

};
CKGSClient.prototype.GetCurrentUser = function()
{
	return this.m_oCurrentUser;
};
CKGSClient.prototype.GetNewCallbackKey = function()
{
	this.m_nCallbackCounter++;
	if (this.m_nCallbackCounter >= 65536)
		this.m_nCallbackCounter = 0;

	return this.m_nCallbackCounter;
};
CKGSClient.prototype.GetOwnChallenge = function()
{
	var sUserName = this.GetUserName();
	for (var nChannelId in this.m_oChallenges)
	{
		var oWindow = this.m_oChallenges[nChannelId];
		var oChallengeCreator = oWindow.GetChallengeCreator();
		if (oChallengeCreator && sUserName.toLowerCase() === oChallengeCreator.GetName().toLowerCase())
			return oWindow;
	}

	return null;
};
CKGSClient.prototype.GetAllChallenges = function()
{
	var arrChallenges = [];
	for (var nChannelId in this.m_oChallenges)
	{
		arrChallenges.push(this.m_oChallenges[nChannelId]);
	}
	return arrChallenges;
};

