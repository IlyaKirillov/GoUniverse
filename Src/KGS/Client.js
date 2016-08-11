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
	All      : 0,
	Room     : 1,
	Follower : 2
};

function CKGSClient(oApp)
{
	this.m_oApp           = oApp;
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
	this.m_oUserInfo      = {}; // Список открытых окон с информацией пользователя
	this.m_oCurrentUser   = new CKGSUser(this);

	this.m_oPrivateChats           = {};
	this.m_oPrivateChatsByUserName = {};

	this.m_oPlayersListView = oApp.GetPlayersListView();
	this.m_oGamesListView   = oApp.GetGamesListView();

	this.m_eGamesListType           = EKGSGamesListType.All;
	this.m_nGlobalGamesChannelId    = -1;
	this.m_nFollowersGamesChannelId = -1;
	this.m_oFollowersGames          = {};
}
CKGSClient.prototype.Clear = function()
{
	for (var nChannelId in this.m_aGames)
	{
		var oGame = this.m_aGames[nChannelId];
		oGame.BlackTime.Stop();
		oGame.WhiteTime.Stop();
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

	this.m_nGlobalGamesChannelId    = -1;
	this.m_nFollowersGamesChannelId = -1;
	this.m_oFollowersGames          = {};
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
		this.m_aGames[nGameRoomId].BlackTime.Stop(true);
		this.m_aGames[nGameRoomId].WhiteTime.Stop(true);
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
CKGSClient.prototype.LoadGameInRoom = function(sTimeStamp, nRoomId)
{
	this.private_SendMessage({
		"type"      : "ROOM_LOAD_GAME",
		"timestamp" : sTimeStamp,
		"channelId" : nRoomId
	});
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
CKGSClient.prototype.SetCurrentChatRoom = function(nChatRoomId)
{
	this.m_nChatChannelId = nChatRoomId;
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

	this.m_nChatChannelId = oMessage.channelId;
	this.m_oApp.SetCurrentChatRoomTab(oMessage.channelId);

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

	if (EKGSGamesListType.All === this.m_eGamesListType || (EKGSGamesListType.Room === this.m_eGamesListType && oMessage.channelId == this.m_nChatChannelId))
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
};
CKGSClient.prototype.private_HandleGameRecord = function(oGameRecord, bAdd)
{
	var nGameType = oGameRecord.GetGameType();
	if (EKGSGameType.Challenge === nGameType)
		return;

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

	var sSizeHandi = nSize + "x" + nSize + (0 !== nHandi ? " H" + nHandi : "");
	if (true === bPrivate)
		sGameType = "P";

	this.m_oGamesListView.Handle_Record([nAdd, nGameId, sGameType, nObservers, "", sWhite, nWhiteR, "", sBlack, nBlackR, sComment, nMoveNumber, bPrivate, nRoomId, bAdjourned, bEvent, bDemo, sSizeHandi]);
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
CKGSClient.prototype.private_HandleUserRecord2 = function(oUserRecord)
{
	var oUser = new CKGSUser(this);
	oUser.Update(oUserRecord);
	return oUser;
};
CKGSClient.prototype.private_HandleGameJoin = function(oMessage)
{
	var GameRoomId = oMessage.channelId;

	if (this.m_aGames[GameRoomId])
		return;

	var oGame = {
		GameRoomId         : GameRoomId,
		GameTree           : null,
		Nodes              : {},
		CurNode            : null,
		BlackTime          : new CTimeSettings(),
		WhiteTime          : new CTimeSettings(),
		Demo               : false,
		Result             : null,
		CommentsHandler    : null,
		StateHandler       : null,
		PlayersList        : new CListView(),
		Editor             : false,
		SgfEventInProgress : false
	};

	this.m_aGames[GameRoomId] = oGame;

	var nSize      = oMessage.gameSummary.size | 0;
	var sBlackName = oMessage.gameSummary.players.black && oMessage.gameSummary.players.black.name ? oMessage.gameSummary.players.black.name : "-";
	var sBlackRank = oMessage.gameSummary.players.black && oMessage.gameSummary.players.black.rank ? oMessage.gameSummary.players.black.rank : "-";
	var sWhiteName = oMessage.gameSummary.players.white && oMessage.gameSummary.players.white.name ? oMessage.gameSummary.players.white.name : "-";
	var sWhiteRank = oMessage.gameSummary.players.white && oMessage.gameSummary.players.white.rank ? oMessage.gameSummary.players.white.rank : "-";

	var sSGF = "(;FF[4]";
	sSGF += "SZ[" + nSize + "]";
	sSGF += "PB[" + sBlackName + "]";
	sSGF += "PW[" + sWhiteName + "]";
	sSGF += "WR[" + sWhiteRank + "]";
	sSGF += "BR[" + sBlackRank + "]";
	sSGF += ")";

	var oGameTree = new CGameTree();
	oGameTree.Set_SoundClass(null);
	oGameTree.Load_Sgf(sSGF);
	oGameTree.Set_Black(sBlackName);
	oGameTree.Set_White(sWhiteName);
	oGameTree.Set_BlackRating(sBlackRank);
	oGameTree.Set_WhiteRating(sWhiteRank);

	var bDemo = false;
	if (oMessage.gameSummary.players.owner)
	{
		bDemo = true;
		oGameTree.Set_GameTranscriber(oMessage.gameSummary.players.owner.name + (oMessage.gameSummary.players.owner.rank ? "[" + oMessage.gameSummary.players.owner.rank + "]" : ""));
	}

	var sWhiteAvatar = "Files/DefaultUserWhite.png";
	var sBlackAvatar = "Files/DefaultUserBlack.png";

	var oGameRecord = this.m_oAllGames[GameRoomId];
	if (oGameRecord)
	{
		var oBlackUser = oGameRecord.GetBlack();
		if (oBlackUser)
		{
			if (oBlackUser.HasAvatar())
				sBlackAvatar = "http://goserver.gokgs.com/avatars/" + oBlackUser.GetName() + ".jpg";
			else if (oBlackUser.IsRobot())
				sBlackAvatar = "Files/Robot.png";
			else
				sBlackAvatar = "Files/DefaultUserBlack.png";
		}

		var oWhiteUser = oGameRecord.GetWhite();
		if (oMessage.gameSummary.players.white)
		{
			if (oWhiteUser.HasAvatar())
				sWhiteAvatar = "http://goserver.gokgs.com/avatars/" + oWhiteUser.GetName() + ".jpg";
			else if (oWhiteUser.IsRobot())
				sWhiteAvatar = "Files/Robot.png";
			else
				sWhiteAvatar = "Files/DefaultUserWhite.png";
		}
	}

	oGame.GameTree = oGameTree;

	oGame.Demo = bDemo;
	this.m_oApp.AddGameRoom(GameRoomId, oGameTree, bDemo, sWhiteAvatar, sBlackAvatar, oGame.WhiteTime, oGame.BlackTime, oGame);
	this.m_oApp.SetCurrentGameRoomTab(GameRoomId);

	var oCurNode = this.private_ReadSgfEvents(oGame, oMessage.sgfEvents);
	if (!oCurNode)
		oCurNode = oGameTree.Get_FirstNode();

	if (oMessage.clocks)
	{
		this.private_HandleGameClocks(oGame, oMessage.clocks);
	}
	else
	{
		oGame.BlackTime.Stop();
		oGame.WhiteTime.Stop();
	}

	this.private_HandleGameActions(oMessage["actions"], oGame);

	var oGameTreeHandler = oGameTree.Get_Handler();
	oGameTree.Set_Handler(null);

	if (oMessage.score)
		oGame.Result = this.private_ParseScore(oMessage.score);

	if (oGame.CommentsHandler && oMessage.score)
		oGame.CommentsHandler.AddGameOver(oCurNode, this.private_ParseScore(oMessage.score));
	
	if (oGame.CommentsHandler)
		oGame.CommentsHandler.ScrollChatAreaToBottom();

	if (oGame.PlayersList)
	{
		var oGameRecord = this.m_oAllGames[GameRoomId];
		if (oGameRecord)
		{
			var oListObject = oGame.PlayersList.GetListObject();
			oListObject.SetBlack(oGameRecord.GetBlack());
			oListObject.SetWhite(oGameRecord.GetWhite());
			oListObject.SetOwner(oGameRecord.GetOwner());
		}
		
		if (oMessage.users)
		{
			var arrUsers = oMessage.users;
			for (var nIndex = 0, nCount = arrUsers.length; nIndex < nCount; ++nIndex)
			{
				var oUser = this.private_HandleUserRecord2(arrUsers[nIndex]);
				oGame.PlayersList.Handle_Record([0, oUser.GetName(), oUser]);
			}
		}

		oGame.PlayersList.Update_Size();
	}


	oGameTree.GoTo_Node(oCurNode);
	oGame.CurNode  = oCurNode;
	oGameTree.Set_GameCurNode(oCurNode);

	if (oGame.StateHandler)
		oGame.StateHandler.Update();

	if (oGameTree.m_oDrawingNavigator)
	{
		oGameTree.m_oDrawingNavigator.Create_FromGameTree();
		oGameTree.m_oDrawingNavigator.Update();
		oGameTree.m_oDrawingNavigator.Update_Current(true);
		oGameTree.m_oDrawingNavigator.Update_GameCurrent();
	}

	oGameTree.Set_Handler(oGameTreeHandler);
};
CKGSClient.prototype.private_HandleGameUpdate = function(oMessage)
{
	var GameRoomId = oMessage.channelId;
	var oGame = this.m_aGames[GameRoomId];
	if (!oGame)
		return;

	var oGameTree = oGame.GameTree;
	var oHandler  = oGameTree.Get_Handler();
	oGameTree.Set_Handler(null);

	var oCurNode = oGame.CurNode;

	var bGoToNode = oCurNode === oGameTree.Get_CurNode();

	oCurNode = this.private_ReadSgfEvents(oGame, oMessage.sgfEvents);

	if (oCurNode)
	{
		if (bGoToNode)
			oGameTree.GoTo_Node(oCurNode);

		oGame.CurNode = oCurNode;
		oGameTree.Set_GameCurNode(oCurNode);

		if (oGame.StateHandler)
			oGame.StateHandler.Update();
	}
	else
	{
		if (bGoToNode)
			oGameTree.Execute_CurNodeCommands();
	}

	if (oGameTree.m_oDrawingNavigator)
	{
		oGameTree.m_oDrawingNavigator.Create_FromGameTree();
		oGameTree.m_oDrawingNavigator.Update();
		oGameTree.m_oDrawingNavigator.Update_Current(true);
		oGameTree.m_oDrawingNavigator.Update_GameCurrent();
	}

	oGameTree.Set_Handler(oHandler);

	this.private_EndSgfEvent(GameRoomId);
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
		oGame.PlayersList.Handle_Record([0, oUser.GetName(), oUser]);
		oGame.PlayersList.Update_Size();
	}
};
CKGSClient.prototype.private_HandleUserRemoved = function(oMessage)
{
	if (!oMessage || !oMessage.user)
		return;

	var oUser = this.private_HandleUserRecord(oMessage.user, false);
	var oRoom = this.m_aAllRooms[oMessage.channelId];
	var oGame = this.m_aGames[oMessage.channelId];
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
		oGame.PlayersList.Handle_Record([1, oUser.GetName(), oUser]);
		oGame.PlayersList.Update_Size();
	}
};
CKGSClient.prototype.private_HandleGameList = function(oMessage)
{
	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];

		var oGameRecord = this.private_OnAddGameListRecord(oMessage.channelId, oEntry);

		if (EKGSGamesListType.All === this.m_eGamesListType
			|| (EKGSGamesListType.Room === this.m_eGamesListType && oMessage.channelId == this.m_nChatChannelId)
			|| (EKGSGamesListType.Follower === this.m_eGamesListType && oMessage.channelId === this.m_nFollowersGamesChannelId))
			this.private_HandleGameRecord(oGameRecord, true);
	}
	this.m_oGamesListView.Update_Size();
};
CKGSClient.prototype.private_HandleGameContainerRemoveGame = function(oMessage)
{
	this.private_OnRemoveGameListRecord(oMessage.channelId, oMessage.gameId);

	if ((EKGSGamesListType.All === this.m_eGamesListType && !this.m_oAllGames[oMessage.gameId])
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
	// Ничего не делаем
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
		return;
	else if ("ACTIVES" === oMessage.containerType)
		this.m_nGlobalGamesChannelId = oMessage.channelId;
	else if ("FANS" === oMessage.containerType)
		this.m_nFollowersGamesChannelId = oMessage.channelId;

	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];
		this.private_OnAddGameListRecord(oMessage.channelId, oEntry);
	}

	if (EKGSGamesListType.All === this.m_eGamesListType
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

	this.private_HandleGameActions(oMessage["actions"], oGame);

	if (oMessage.clocks)
		this.private_HandleGameClocks(oGame, oMessage.clocks);
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
	}
	else if (null !== (oRecord = this.m_oGamesListView.Get_RecordById(nChannelId)))
	{
		if (true === oRecord.m_bDemo)
			sRoomName = "\"" + oRecord.m_sWhiteName + "\"";
		else
			sRoomName = "\"" + oRecord.m_sWhiteName + " vs. " + oRecord.m_sBlackName + "\"";
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
	var oGameTree = oGame.GameTree;
	oGame.GameRoomId = nNewChannelId;
	oGame.Demo       = true;
	oGame.BlackTime.Stop();
	oGame.WhiteTime.Stop();
	oGame.StateHandler.Update();


	if (oMessage.review.players.owner)
	{
		oGameTree.Set_GameTranscriber(oMessage.review.players.owner.name + (oMessage.review.players.owner.rank ? "[" + oMessage.review.players.owner.rank + "]" : ""));
	}
	else
	{
		// Такого не должно быть
		oGameTree.Set_GameTranscriber("unknown");
	}

	this.m_aGames[nNewChannelId] = oGame;
	delete this.m_aGames[nChannelId];

	this.m_oApp.ModifyGameRoom(nChannelId, nNewChannelId, true);
};
CKGSClient.prototype.private_HandleClose = function(oMessage)
{
	// Ничего не делаем. Пока известно, что данное сообщение приходит после GAME_REVIEW, вся обработка происходит там
};
CKGSClient.prototype.private_HandleGameOver = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	if (this.m_aGames[nChannelId])
	{
		// TODO: Добавить окно с окончанием партии

		var oGame = this.m_aGames[nChannelId];
		oGame.Result = this.private_ParseScore(oMessage.score);
		oGame.CommentsHandler.AddGameOver(oGame.CurNode, this.private_ParseScore(oMessage.score));
		oGame.StateHandler.Update();
	}
};
CKGSClient.prototype.private_HandleDetailsRankGraph = function(oMessage)
{
	for (var sUserName in this.m_oUserInfo)
	{
		var oInfo = this.m_oUserInfo[sUserName];
		if (oInfo.DetailsChannel === oMessage.channelId && oInfo.Window)
		{
			oInfo.Window.OnRankGraph(oMessage.rankData);
		}
	}
};
CKGSClient.prototype.private_HandleChannelAudio = function(oMessage)
{
	//var srcAudio = Common.Decode_Base64(oMessage.audio);
	//var srcAudio = atob(oMessage.audio);

	//this.m_oApp.m_oSound.PlayLecture("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=");
	this.m_oApp.m_oSound.PlayLecture("data:audio/ogg;base64," + oMessage.audio);

	// var audio = new Audio();
	// audio.src = "data:audio/ogg;base64," + oMessage.audio;
	// //audio.addEventListener('MozAudioAvailable', someFunction, false);
	// audio.play();
};
CKGSClient.prototype.private_AddUserToRoom = function(oUser, oRoom)
{
	oRoom.Users[oUser.GetName()] = oUser;
};
CKGSClient.prototype.private_HandleGameClocks = function(oGame, oClocks)
{
	if (oClocks.black)
	{
		var oClock = oClocks.black;
		if (undefined !== oClock.periodsLeft)
		{
			if (0 === oClock.periodsLeft)
			{
				oGame.BlackTime.CorrectMainTime(oClock.time);
			}
			else
			{
				oGame.BlackTime.CorrectMainTime(0);
				oGame.BlackTime.CorrectOverTime(oClock.time, oClock.periodsLeft);
			}
		}
		else if (undefined !== oClock.stonesLeft)
		{
			if (0 === oClock.stonesLeft)
			{
				oGame.BlackTime.CorrectMainTime(oClock.time);
			}
			else
			{
				oGame.BlackTime.CorrectMainTime(0);
				oGame.BlackTime.CorrectOverTime(oClock.time, oClock.stonesLeft);
			}
		}
		else
		{
			oGame.BlackTime.CorrectMainTime(oClock.time);
		}

		if (true === oClock.running && true !== oClock.paused)
		{
			oGame.BlackTime.Start();
		}
		else
		{
			oGame.BlackTime.Stop();
		}
	}

	if (oClocks.white)
	{
		var oClock = oClocks.white;
		if (undefined !== oClock.periodsLeft)
		{
			if (0 === oClock.periodsLeft)
			{
				oGame.WhiteTime.CorrectMainTime(oClock.time);
			}
			else
			{
				oGame.WhiteTime.CorrectMainTime(0);
				oGame.WhiteTime.CorrectOverTime(oClock.time, oClock.periodsLeft);
			}
		}
		else if (undefined !== oClock.stonesLeft)
		{
			if (0 === oClock.stonesLeft)
			{
				oGame.WhiteTime.CorrectMainTime(oClock.time);
			}
			else
			{
				oGame.WhiteTime.CorrectMainTime(0);
				oGame.WhiteTime.CorrectOverTime(oClock.time, oClock.stonesLeft);
			}
		}
		else
		{
			oGame.WhiteTime.CorrectMainTime(oClock.time);
		}

		if (true === oClock.running && true !== oClock.paused)
		{
			oGame.WhiteTime.Start();
		}
		else
		{
			oGame.WhiteTime.Stop();
		}
	}
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
CKGSClient.prototype.private_ReadSgfEvents = function(oGame, arrSgfEvents)
{
	var oGameTree      = oGame.GameTree;
	var oNode          = null;
	var oActivatedNode = null;
	var oThis          = this;

	for (var nIndex = 0, nCount = arrSgfEvents.length; nIndex < nCount; ++nIndex)
	{
		var sgfEvent = arrSgfEvents[nIndex];

		var sNodeId = sgfEvent.nodeId;
		if (!oGame.Nodes[sNodeId])
		{
			// Сюда мы должны попадать ровно 1 раз в самом начале с самой первой нодой
			oGame.Nodes[sNodeId] = oGameTree.Get_FirstNode();
		}

		oNode = oGame.Nodes[sNodeId];
		if (!oNode)
			continue;

		if ("PROP_GROUP_ADDED" === sgfEvent.type)
		{
			var oProps = sgfEvent.props;
			for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
			{
				private_ReadProp(oProps[nPropsIndex]);
			}
		}
		else if ("PROP_ADDED" === sgfEvent.type)
		{
			private_ReadProp(sgfEvent.prop);
		}
		else if ("CHILD_ADDED" === sgfEvent.type)
		{
			var oNewNode = new CNode(oGameTree);
			oNode.Add_Next(oNewNode, true);
			oGame.Nodes[sgfEvent.childNodeId] = oNewNode;
		}
		else if ("ACTIVATED" === sgfEvent.type)
		{
			if (oGame.Nodes[sgfEvent.nodeId])
				oActivatedNode = oGame.Nodes[sgfEvent.nodeId];
		}
		else if ("PROP_CHANGED" === sgfEvent.type)
		{
			private_ReadProp(sgfEvent.prop);
		}
		else if ("PROP_REMOVED" === sgfEvent.type)
		{
			private_ReadPropRemove(sgfEvent.prop);
		}
		else if ("PROP_GROUP_REMOVED" === sgfEvent.type)
		{
			var oProps = sgfEvent.props;
			for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
			{
				private_ReadPropRemove(oProps[nPropsIndex]);
			}
		}
		else
		{
			console.log(sgfEvent);
		}
	}

	function private_ReadProp(oProp)
	{
		if ("MOVE" === oProp.name)
		{
			if ("PASS" === oProp.loc)
			{
				if ("black" === oProp.color)
					oNode.Add_Move(0, 0, BOARD_BLACK);
				else if ("white" === oProp.color)
					oNode.Add_Move(0, 0, BOARD_WHITE);
			}
			else
			{
				var nX = oProp.loc.x + 1;
				var nY = oProp.loc.y + 1;

				if ("black" === oProp.color)
					oNode.Add_Move(nX, nY, BOARD_BLACK);
				else if ("white" === oProp.color)
					oNode.Add_Move(nX, nY, BOARD_WHITE);
			}
		}
		else if ("ADDSTONE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_BLACK, [Common_XYtoValue(nX, nY)]);
			else if ("white" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_WHITE, [Common_XYtoValue(nX, nY)]);
			else if ("empty" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_EMPTY, [Common_XYtoValue(nX, nY)]);
		}
		else if ("COMMENT" === oProp.name)
		{
			oNode.Add_Comment(oProp.text);
			if (oGame.CommentsHandler)
			{
				oGameTree.Get_MovesCount();

				if (true === oGame.Demo)
					oGame.CommentsHandler.AddComment(oProp.text, oNode, "" !== oGameTree.Get_Result());
				else
					oGame.CommentsHandler.AddComment(oProp.text, oNode, false);
			}
		}
		else if ("RULES" === oProp.name)
		{
			if (oProp.size)
				oGameTree.Set_BoardSize(oProp.size, oProp.size);

			if (oProp.komi)
				oGameTree.Set_Komi(oProp.komi);

			if (oProp.rules)
				oGameTree.Set_Rules(oProp.rules);

			if (oProp.handicap)
				oGameTree.Set_Handicap(oProp.handicap);

			if (oProp.timeSystem)
			{
				var sTimeType = oProp.timeSystem;
				if ("absolute" === sTimeType)
				{
					oGame.BlackTime.SetAbsolute(oProp.mainTime);
					oGame.WhiteTime.SetAbsolute(oProp.mainTime);
				}
				else if ("byo_yomi" === sTimeType)
				{
					oGame.BlackTime.SetByoYomi(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiPeriods);
					oGame.WhiteTime.SetByoYomi(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiPeriods);
				}
				else if ("canadian" === sTimeType)
				{
					oGame.BlackTime.SetCanadian(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiStones);
					oGame.WhiteTime.SetCanadian(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiStones);
				}
			}
		}
		else if ("PLAYERNAME" === oProp.name)
		{
			if ("white" === oProp.color)
				oGameTree.Set_White(oProp.text);
			else if ("black" === oProp.color)
				oGameTree.Set_Black(oProp.text);
		}
		else if ("PLAYERRANK" === oProp.name)
		{
			if ("white" === oProp.color)
				oGameTree.Set_WhiteRating(private_GetRank(oProp.int));
			else if ("black" === oProp.color)
				oGameTree.Set_BlackRating(private_GetRank(oProp.int));
		}
		else if ("DATE" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_DateTime(oProp.text);
		}
		else if ("EVENT" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GameEvent(oProp.text);
		}
		else if ("ROUND" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GameRound(oProp.text);
		}
		else if ("PLACE" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GamePlace(oProp.text);
		}
		else if ("TIMELEFT" === oProp.name)
		{
			// В GameTree информацию не пишем.
		}
		else if ("TRIANGLE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.Tr, [Common_XYtoValue(nX, nY)]);
		}
		else if ("SQUARE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.Sq, [Common_XYtoValue(nX, nY)]);
		}
		else if ("LABEL" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_TextMark(oProp.text, Common_XYtoValue(nX, nY));
		}
		else if ("CIRCLE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.Cr, [Common_XYtoValue(nX, nY)]);
		}
		else if ("CROSS" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.X, [Common_XYtoValue(nX, nY)]);
		}
		else if ("PHANTOMCLEAR" === oProp.name)
		{
			// Нам это не нужно
		}
		else if ("GAMENAME" === oProp.name)
		{
			oGameTree.Set_GameName(oProp.text);
		}
		else if ("TERRITORY" === oProp.name)
		{
			oNode.Set_TerritoryForceUse(true);

			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_WHITE);
		}
		else if ("DEAD" === oProp.name)
		{
			// Нам это не нужно
		}
		else if ("SETWHOSEMOVE" === oProp.name)
		{
			if ("black" === oProp.color)
				oNode.Set_NextMove(BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Set_NextMove(BOARD_WHITE);
		}
		else if ("ARROW" === oProp.name || "LINE" === oProp.name)
		{
			// Ничего не делаем
		}
		else if ("RESULT" === oProp.name)
		{
			oGameTree.Set_Result(oProp.text);
		}
		else if ("TRANSCRIBER" === oProp.name)
		{
			oGameTree.Set_GameTranscriber(oProp.text);
		}
		else if ("SOURCE" === oProp.name)
		{
			oGameTree.Set_GameSource(oProp.text);
		}
		else
		{
			console.log("PROP_ADD/PROP_CHANGE");
			console.log(oProp);
		}
	}

	function private_ReadPropRemove(oProp)
	{
		if ("ADDSTONE" === oProp.name)
		{
			// Пропускаем, т.к. добавление/удаление камней полностью регулируется в PROP_ADDED/PROP_CHANGED
		}
		if ("TRIANGLE" === oProp.name || "SQUARE" === oProp.name || "LABEL" === oProp.name || "CIRCLE" === oProp.name || "CROSS" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(ECommand.RM, [Common_XYtoValue(nX, nY)]);
		}
		else if ("TERRITORY" === oProp.name)
		{
			oNode.Set_TerritoryForceUse(true);

			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color || "white" === oProp.color)
				oNode.Remove_TerritoryPoint(Common_XYtoValue(nX, nY));
		}
		else if ("ARROW" === oProp.name || "LINE" === oProp.name)
		{
			// Ничего не делаем
		}
		else if ("TRANSCRIBER" === oProp.name)
		{
			oGameTree.Set_GameTranscriber("");
		}
		else if ("SOURCE" === oProp.name)
		{
			oGameTree.Set_GameSource("");
		}
		else
		{
			console.log("PROP_REMOVE");
			console.log(oProp);
		}
	}

	function private_GetRank(nRank)
	{
		if (undefined === nRank || null === nRank)
			return "?";
		else if (nRank <= 30)
			return (31 - nRank) + "k";
		else if (nRank <= 39)
			return (nRank - 30) + "d";
		else
			return (nRank - 39) + "p";
	}

	return oActivatedNode;
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
};
CKGSClient.prototype.GetGamesListType = function()
{
	return this.m_eGamesListType;
};
CKGSClient.prototype.SetGamesListType = function(eType)
{
	if (eType !== this.m_eGamesListType)
	{
		this.m_eGamesListType = eType;
		this.private_UpdateGamesList();
	}
};
CKGSClient.prototype.private_UpdateGamesList = function()
{
	this.m_oGamesListView.Clear();

	if (EKGSGamesListType.All === this.m_eGamesListType)
	{
		for (var nGameId in this.m_oAllGames)
		{
			var oGameRecord = this.m_oAllGames[nGameId];
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
CKGSClient.prototype.private_HandleGameActions = function(arrActions, oGame)
{
	if (!arrActions || !oGame)
		return;

	for (var nIndex = 0, nCount = arrActions.length; nIndex < nCount; ++nIndex)
	{
		var oAction = arrActions[nIndex];
		var sAction = oAction["action"];
		if ("EDIT" === sAction)
		{
			var oListObject = oGame.PlayersList.GetListObject();

			var oEditor = this.private_HandleUserRecord2(oAction["user"]);
			oListObject.SetEditor(oEditor);
			oGame.PlayersList.Update_Size();

			if (oEditor.GetName() === this.GetUserName())
			{
				if (false === oGame.Editor)
				{
					oGame.Editor = true;
					this.private_EndSgfEvent(oGame.GameRoomId);
					var oGameTree = oGame.GameTree;
					var oHandler = new CKGSEditorHandler(this, oGame);
					oGameTree.Set_Handler(oHandler);
				}
			}
			else if (true === oGame.Editor)
			{
				oGame.Editor = false;
				this.private_EndSgfEvent(oGame.GameRoomId);
			}
		}
		else if ("MOVE" === sAction)
		{

		}
	}
};
CKGSClient.prototype.SendSgfEventChangeCurrentNode = function(nGameRoomId, nNodeId, nPrevNodeId)
{
	if (true !== this.private_BeginSgfEvent(nGameRoomId))
		return;

	this.private_SendMessage({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"       : "ACTIVATED",
			"nodeId"     : nNodeId,
			"prevNodeId" : nPrevNodeId
		}]
	});
};
CKGSClient.prototype.SendSgfEventNewNodeWithMove = function(nGameRoomId, nNodeId, nNewNodeId, X, Y, Value)
{
	if (true !== this.private_BeginSgfEvent(nGameRoomId))
		return;

	this.private_SendMessage({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"        : "CHILD_ADDED",
			"nodeId"      : nNodeId,
			"childNodeId" : nNewNodeId
		}, {
			"type"       : "ACTIVATED",
			"nodeId"     : nNewNodeId,
			"prevNodeId" : nNodeId
		}, {
			"type"   : "PROP_ADDED",
			"nodeId" : nNewNodeId,
			"prop"   : {
				"name"  : "MOVE",
				"color" : BOARD_BLACK === Value ? "black" : "white",
				"loc"   : {
					"x" : X - 1,
					"y" : Y - 1
				}
			}
		}]
	});
};
CKGSClient.prototype.private_IsSgfEventInProgress = function(nGameRoomId)
{
	if (!this.m_aGames[nGameRoomId])
		return true;

	return this.m_aGames[nGameRoomId].SgfEventInProgress;
};
CKGSClient.prototype.private_BeginSgfEvent = function(nGameRoomId)
{
	if (this.private_IsSgfEventInProgress(nGameRoomId))
		return false;

	this.m_aGames[nGameRoomId].SgfEventInProgress = true;

	return true;
};
CKGSClient.prototype.private_EndSgfEvent = function(nGameRoomId)
{
	if (!this.m_aGames[nGameRoomId])
		return;

	this.m_aGames[nGameRoomId].SgfEventInProgress = false;
};

function CKGSEditorHandler(oClient, oGame)
{
	this.m_oClient = oClient;
	this.m_oGame   = oGame;
	this.m_nGameId = oGame.GameRoomId;
}
CKGSEditorHandler.prototype.GoToNode = function(oNode)
{
	var sPrevNodeId = this.private_GetNodeId();
	var sNodeId     = this.private_GetNodeId(oNode);
	if (null === sPrevNodeId || null === sNodeId || sPrevNodeId == sNodeId)
		return;

	this.m_oClient.SendSgfEventChangeCurrentNode(this.m_nGameId, sNodeId, sPrevNodeId);
};
CKGSEditorHandler.prototype.AddNewNodeWithMove = function(oNode, X, Y, Value)
{
	var sNodeId = this.private_GetNodeId(oNode);
	if (null === sNodeId)
		return;

	this.m_oClient.SendSgfEventNewNodeWithMove(this.m_nGameId, sNodeId, this.private_GetNewNodeId(), X, Y, Value);
};
CKGSEditorHandler.prototype.RemoveNode = function(oNode)
{
};
CKGSEditorHandler.prototype.private_GetNodeId = function(oNode)
{
	if (!oNode)
		oNode = this.m_oGame.CurNode;

	for (var sNodeId in this.m_oGame.Nodes)
	{
		if (this.m_oGame.Nodes[sNodeId] === oNode)
		{
			return sNodeId;
		}
	}

	return null;
};
CKGSEditorHandler.prototype.private_GetNewNodeId = function()
{
	var nId = 1;
	while (this.m_oGame.Nodes[nId])
	{
		nId++;
	}

	return nId;
};

