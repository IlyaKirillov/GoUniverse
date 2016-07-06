"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 26.09.14
 * Time: 18:03
 */

var EPlayersListRecord =
{
    Name      : 1,
    Rank      : 2
};

var g_oPlayersList =
{
    Headers :
    {
        Sizes : [0, 105],
        Count : 2,
        1  : "Name",
        2  : "Rank"
    },

    SortType : -EPlayersListRecord.Rank,

    Set_SortType : function(nColNum, Direction)
    {
        if (Direction > 0)
            g_oPlayersList.SortType = nColNum + 1;
        else
            g_oPlayersList.SortType = -(nColNum + 1);
    },

    SortFunction : function (oRecord1, oRecord2)
    {
		var nPreSortResult = g_oPlayersList.private_PreSort(oRecord1, oRecord2);
		if (0 !== nPreSortResult)
			return nPreSortResult;

        var SortType = g_oPlayersList.SortType;
        if (EPlayersListRecord.Name === SortType)
        {
			if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
				return -1;
			else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
				return 1;
        }
        else if (-EPlayersListRecord.Name === SortType)
        {
			if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) < 0)
				return 1;
			else if (Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName) > 0)
				return -1;
        }
        else if (EPlayersListRecord.Rank === SortType)
        {
            if (oRecord1.m_nRank < oRecord2.m_nRank)
                return -1;
            else if (oRecord1.m_nRank > oRecord2.m_nRank)
                return 1;

            return g_oPlayersList.private_SortByName(oRecord1, oRecord2);
        }
        else if (-EPlayersListRecord.Rank === SortType)
        {
            if (oRecord1.m_nRank < oRecord2.m_nRank)
                return 1;
            else if (oRecord1.m_nRank > oRecord2.m_nRank)
                return -1;

            return g_oPlayersList.private_SortByName(oRecord1, oRecord2);
        }

		return g_oPlayersList.private_PostSort(oRecord1, oRecord2);
    },

    Is_Sortable : function (nColNum)
    {
        return true;
    },

    Draw_Header : function(dX, dY, oContext, nColNum)
    {
        var eType = nColNum + 1;
        var SortType = g_oPlayersList.SortType;

        var sHeaderText;
        if (eType === SortType)
            sHeaderText = g_oPlayersList.Headers[eType] + String.fromCharCode(0x25B2);
        else if (eType === -SortType)
            sHeaderText = g_oPlayersList.Headers[eType] + String.fromCharCode(0x25BC);
        else
            sHeaderText = g_oPlayersList.Headers[eType];

        oContext.fillStyle = "#000000";
        oContext.fillText(sHeaderText, dX, dY);
    },

    Draw_Record : function(dX, dY, oContext, oRecord, nColNum)
    {
        var eType = nColNum + 1;
        oRecord.Draw(oContext, dX, dY, eType);
    },

	private_PreSort : function(oRecord1, oRecord2)
	{
		if (true === oRecord1.IsFriend() && true !== oRecord2.IsFriend())
			return -1;

		if (true !== oRecord1.IsFriend() && true === oRecord2.IsFriend())
			return 1;

		return 0;
	},

	private_PostSort : function(oRecord1, oRecord2)
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
	},

    private_SortByName : function(oRecord1, oRecord2)
    {
        if (oRecord1.m_sName < oRecord2.m_sName)
            return -1;
        else if (oRecord1.m_sName > oRecord2.m_sName)
            return 1;

        return 0;
    },

    Get_Record : function(aLine)
    {
        var oRecord = new CPlayersListRecord(oApp.GetClient());
        oRecord.Update(aLine);
        return oRecord;
    },

    Get_Key : function(aLine)
    {
        return aLine[1];
    },

    Handle_DoubleClick : function(Record)
    {
        if (oApp && oApp.GetClient())
        {
            oApp.GetClient().EnterPrivateChat(Record.m_sName);
        }
    },

    Handle_RightClick : function(Record, e)
    {
        if (oApp)
        {
            oApp.ShowUserContextMenu(e.pageX, e.pageY, Record.m_sName);
        }
    },

	GetHeadersCount : function()
	{
		return g_oPlayersList.Headers.Count;
	},

	GetHeadersSize : function(nColNum)
	{
		return g_oPlayersList.Headers.Sizes[nColNum];
	}
};

function CPlayersListRecord(oClient)
{
	this.m_oClient = oClient;
    this.m_sName   = "";
    this.m_nRank   = 0;
	this.m_oUser   = null;
}

CPlayersListRecord.prototype.Draw = function(oContext, dX, dY, eType)
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
        case EPlayersListRecord.Name : sString += this.m_sName; break;
        case EPlayersListRecord.Rank : sString += this.private_GetRank(this.m_nRank); break;
    }

    oContext.fillText(sString, dX, dY);

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

CPlayersListRecord.prototype.Get_Key = function()
{
    return this.m_sName;
};

CPlayersListRecord.prototype.Update = function(aLine)
{
    this.m_sName   = aLine[1];
    this.m_nRank   = aLine[2] | 0;
	this.m_oUser   = aLine[4];
};

CPlayersListRecord.prototype.Compare = function(sName)
{
    if (this.m_sName === sName)
        return true;

    return false;
};

CPlayersListRecord.prototype.private_GetRank = function(nRank)
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

CPlayersListRecord.prototype.IsFriend = function()
{
	if (oApp && oApp.GetClient())
		return oApp.GetClient().IsUserInFriendList(this.m_sName);

	return false;
};