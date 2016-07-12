"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     06.07.2016
 * Time     1:06
 */

var EKGSInGamePlayersListRecord = {
	Type : 1,
	Name : 2,
	Rank : 3
};

function CKGSInGamePlayersList(oApp)
{
	CKGSInGamePlayersList.superclass.constructor.call(this);

	this.m_oApp = oApp;

	this.m_oHeaders = {
		Sizes : [0, 20, 125],
		Count : 3,
		1     : "",
		2     : "Name",
		3     : "Rank"
	};

	this.m_nSortType = -EKGSInGamePlayersListRecord.Rank;

	this.m_oBlack = null;
	this.m_oWhite = null;
}

CommonExtend(CKGSInGamePlayersList, CListBase);

CKGSInGamePlayersList.prototype.private_PreSort = function(oRecord1, oRecord2)
{
	if (true === oRecord1.IsGameParticipant() && true !== oRecord2.IsGameParticipant())
		return -1;
	if (true !== oRecord1.IsGameParticipant() && true === oRecord2.IsGameParticipant())
		return 1;

	if (true === oRecord1.IsFriend() && true !== oRecord2.IsFriend())
		return -1;

	if (true !== oRecord1.IsFriend() && true === oRecord2.IsFriend())
		return 1;

	return 0;
};
CKGSInGamePlayersList.prototype.private_PostSort = function(oRecord1, oRecord2)
{
	// Сортируем по рейтингу, потом по имени
	if (oRecord1.m_nRank < oRecord2.m_nRank)
		return 1;
	else if (oRecord1.m_nRank > oRecord2.m_nRank)
		return -1;

	if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
		return -1;
	else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
		return 1;

	// Сюда мы уже не должны попадать, потому что имена игроков не должны совпадать
	return 0;
};
CKGSInGamePlayersList.prototype.private_Sort = function(oRecord1, oRecord2)
{
	var nSortType = this.m_nSortType;
	if (EKGSInGamePlayersListRecord.Name === nSortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
			return 1;
	}
	else if (-EKGSInGamePlayersListRecord.Name === nSortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
			return -1;
	}
	else if (EKGSInGamePlayersListRecord.Rank === nSortType)
	{
		if (oRecord1.m_nRank < oRecord2.m_nRank)
			return -1;
		else if (oRecord1.m_nRank > oRecord2.m_nRank)
			return 1;
	}
	else if (-EKGSInGamePlayersListRecord.Rank === nSortType)
	{
		if (oRecord1.m_nRank < oRecord2.m_nRank)
			return 1;
		else if (oRecord1.m_nRank > oRecord2.m_nRank)
			return -1;
	}

	return 0;
};
CKGSInGamePlayersList.prototype.Is_Sortable = function(nColNum)
{
	if (0 !== nColNum)
		return true;

	return false;
};
CKGSInGamePlayersList.prototype.Get_Record = function(aLine)
{
	var oRecord = new CKGSInGamePlayersListRecord(this, this.m_oApp.GetClient());
	oRecord.Update(aLine);
	return oRecord;
};
CKGSInGamePlayersList.prototype.Handle_DoubleClick = function(Record)
{
	if (this.m_oApp && this.m_oApp.GetClient())
	{
		this.m_oApp.GetClient().EnterPrivateChat(Record.m_sName);
	}
};
CKGSInGamePlayersList.prototype.Handle_RightClick = function(Record, e)
{
	if (this.m_oApp && Record)
	{
		this.m_oApp.ShowUserContextMenu(e.pageX, e.pageY, Record.m_sName);
	}
};
CKGSInGamePlayersList.prototype.SetBlack = function(oUser)
{
	this.m_oBlack = oUser;
};
CKGSInGamePlayersList.prototype.SetWhite = function(oUser)
{
	this.m_oWhite = oUser;
};
CKGSInGamePlayersList.prototype.IsBlack = function(sUserName)
{
	if (this.m_oBlack && sUserName === this.m_oBlack.GetName())
		return true;

	return false;
};
CKGSInGamePlayersList.prototype.IsWhite = function(sUserName)
{
	if (this.m_oWhite && sUserName === this.m_oWhite.GetName())
		return true;

	return false;
};
CKGSInGamePlayersList.prototype.GetVerLinesPositions = function()
{
	return [2];
};


function CKGSInGamePlayersListRecord(oListObject, oClient)
{
	CKGSInGamePlayersListRecord.superclass.constructor.call(this);

	this.m_oListObject = oListObject;
	this.m_oClient     = oClient;
	this.m_sName       = "";
	this.m_nRank       = 0;
	this.m_oUser       = null;
}

CommonExtend(CKGSInGamePlayersListRecord, CListRecordBase);

CKGSInGamePlayersListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var oClient = this.m_oClient;
	var sFont = oContext.font;

	if (true !== this.m_oUser.IsSleeping())
		oContext.fillStyle = "#000000";
	else
		oContext.fillStyle = "#AAAAAA";

	var bResetFont = false;
	if (oClient)
	{
		if (true === oClient.IsUserInFollowerList(this.m_sName))
		{
			if (true !== this.m_oUser.IsSleeping())
				oContext.fillStyle = "#008272";
			else
				oContext.fillStyle = "#99C9C3";

			oContext.font = "bold " + sFont;
		}
		else if (true === this.m_oUser.IsFriend())
		{
			oContext.font = "bold " + sFont;
		}

		bResetFont = true;
	}

	var sString = "";
	switch(eType)
	{
	case EKGSInGamePlayersListRecord.Type : sString += this.private_GetUserType(oContext); break;
	case EKGSInGamePlayersListRecord.Name : sString += this.m_sName; break;
	case EKGSInGamePlayersListRecord.Rank : sString += this.private_GetRank(this.m_nRank); break;
	}

	oContext.fillText(sString, dX, dY);

	if (eType === EKGSInGamePlayersListRecord.Type && "" !== sString)
		oContext.strokeText(sString, dX, dY);

	if (oClient)
	{
		if (true === oClient.IsUserInBlackList(this.m_sName) && eType === EPlayersListRecord.Name)
		{
			var dOldLineWidth   = oContext.lineWidth;
			var sOldStrokeStyle = oContext.strokeStyle;

			oContext.lineWidth   = 1;
			oContext.strokeStyle = "#000";

			var dTextW = oContext.measureText(sString).width;
			var dX0    = (dX | 0) + 0.5;
			var dY0    = ((dY - 4) | 0) + 0.5;
			var dX1    = ((dX + dTextW) | 0) + 0.5;

			oContext.beginPath();
			oContext.moveTo(dX0, dY0);
			oContext.lineTo(dX1, dY0);
			oContext.stroke();

			oContext.lineWidth   = dOldLineWidth;
			oContext.strokeStyle = sOldStrokeStyle;
		}
	}

	if (true === bResetFont)
		oContext.font = sFont;
};
CKGSInGamePlayersListRecord.prototype.Get_Key = function()
{
	return this.m_sName;
};
CKGSInGamePlayersListRecord.prototype.Update = function(aLine)
{
	this.m_sName = aLine[1];
	this.m_oUser = aLine[2];
	this.m_nRank = this.m_oUser.GetRank();
};
CKGSInGamePlayersListRecord.prototype.Compare = function(sName)
{
	if (this.m_sName === sName)
		return true;

	return false;
};
CKGSInGamePlayersListRecord.prototype.private_GetRank = function(nRank)
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
CKGSInGamePlayersListRecord.prototype.IsFriend = function()
{
	return this.m_oClient.IsUserInFriendList(this.m_sName);
};
CKGSInGamePlayersListRecord.prototype.private_GetUserType = function(oContext)
{
	if (this.m_oListObject.IsBlack(this.m_sName))
	{
		oContext.fillStyle   = "#000";
		oContext.strokeStyle = "#000";
		return String.fromCharCode(0x26AB);
	}
	else if (this.m_oListObject.IsWhite(this.m_sName))
	{
		oContext.fillStyle   = "#FFF";
		oContext.strokeStyle = "#000";
		return String.fromCharCode(0x26AB);
	}

	return "";
};
CKGSInGamePlayersListRecord.prototype.IsGameParticipant = function()
{
	if (this.m_oListObject.IsBlack(this.m_sName)
		|| this.m_oListObject.IsWhite(this.m_sName))
		return true;

	return false;
};