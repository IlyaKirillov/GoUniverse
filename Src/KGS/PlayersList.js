"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 26.09.14
 * Time: 18:03
 */

var EKGSPlayersListRecord = {
	Name : 1,
	Rank : 2
};

function CKGSPlayersList(oApp)
{
	CKGSPlayersList.superclass.constructor.call(this);

	this.m_oHeaders = {
		Sizes : [0, 105],
		Count : 2,
		1     : "Name",
		2     : "Rank"
	};

	this.m_nSortType = -EKGSPlayersListRecord.Rank;
	this.m_oApp      = oApp;
}

CommonExtend(CKGSPlayersList, CListBase);

CKGSPlayersList.prototype.private_Sort = function (oRecord1, oRecord2)
{
	var SortType = this.m_nSortType;
	if (EKGSPlayersListRecord.Name === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
			return 1;
	}
	else if (-EKGSPlayersListRecord.Name === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
			return -1;
	}
	else if (EKGSPlayersListRecord.Rank === SortType)
	{
		if (oRecord1.m_nRank < oRecord2.m_nRank)
			return -1;
		else if (oRecord1.m_nRank > oRecord2.m_nRank)
			return 1;
	}
	else if (-EKGSPlayersListRecord.Rank === SortType)
	{
		if (oRecord1.m_nRank < oRecord2.m_nRank)
			return 1;
		else if (oRecord1.m_nRank > oRecord2.m_nRank)
			return -1;
	}

	return 0;
};
CKGSPlayersList.prototype.private_PreSort = function(oRecord1, oRecord2)
{
	if (true === oRecord1.IsFriend() && true !== oRecord2.IsFriend())
		return -1;

	if (true !== oRecord1.IsFriend() && true === oRecord2.IsFriend())
		return 1;

	return 0;
};
CKGSPlayersList.prototype.private_PostSort = function(oRecord1, oRecord2)
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
CKGSPlayersList.prototype.Get_Record = function(aLine)
{
	var oRecord = new CKGSPlayersListRecord(this.m_oApp.GetClient());
	oRecord.Update(aLine);
	return oRecord;
};
CKGSPlayersList.prototype.Handle_DoubleClick = function(Record)
{
	if (this.m_oApp && this.m_oApp.GetClient())
	{
		this.m_oApp.GetClient().EnterPrivateChat(Record.m_sName);
	}
};
CKGSPlayersList.prototype.Handle_RightClick = function(Record, e)
{
	if (this.m_oApp && Record)
	{
		this.m_oApp.ShowUserContextMenu(e.pageX, e.pageY, Record.m_sName);
	}
};

function CKGSPlayersListRecord(oClient)
{
	CKGSPlayersListRecord.superclass.constructor.call(this);

	this.m_oClient = oClient;
    this.m_sName   = "";
    this.m_nRank   = 0;
	this.m_oUser   = null;
}

CommonExtend(CKGSPlayersListRecord, CListRecordBase);

CKGSPlayersListRecord.prototype.Draw = function(oContext, dX, dY, eType)
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
        case EKGSPlayersListRecord.Name : sString += this.m_sName; break;
        case EKGSPlayersListRecord.Rank : sString += this.private_GetRank(this.m_nRank); break;
    }

    oContext.fillText(sString, dX, dY);

	if (oClient)
	{
		if (true === oClient.IsUserInBlackList(this.m_sName) && eType === EKGSPlayersListRecord.Name)
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
CKGSPlayersListRecord.prototype.Get_Key = function()
{
    return this.m_sName;
};
CKGSPlayersListRecord.prototype.Update = function(aLine)
{
    this.m_sName   = aLine[1];
    this.m_nRank   = aLine[2] | 0;
	this.m_oUser   = aLine[4];
};
CKGSPlayersListRecord.prototype.Compare = function(sName)
{
    if (this.m_sName === sName)
        return true;

    return false;
};
CKGSPlayersListRecord.prototype.private_GetRank = function(nRank)
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
CKGSPlayersListRecord.prototype.IsFriend = function()
{
	if (oApp && oApp.GetClient())
		return oApp.GetClient().IsUserInFriendList(this.m_sName);

	return false;
};