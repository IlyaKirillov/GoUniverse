"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 26.09.14
 * Time: 17:40
 */

var EGameListRecord =
{
    Id        : 1,
    Type      : 2,
    WRank     : 3,
    WName     : 4,
    Vs        : 5,
    BRank     : 6,
    BName     : 7,
    Observers : 8,
    Move      : 9,
    Private   : 10,
    Place     : 11,
    Info      : 12
};

var g_oGamesList =
{
    Headers :
    {
        Sizes : [0, 62, 78, 118, 258, 283, 323, 448, 508, 558, 608, 763],
        Count : 12,
        1  : "Id",
        2  : "Kind",
        3  : "wr",
        4  : "White",
        5  : "",
        6  : "br",
        7  : "Black",
        8  : "Observers",
        9  : "Move",
        10 : "",
        11 : "Room",
        12 : "Comment"
    },

    SortType : -EGameListRecord.WRank,

    Set_SortType : function(nColNum, Direction)
    {
        if (Direction > 0)
            g_oGamesList.SortType = nColNum + 1;
        else
            g_oGamesList.SortType = -(nColNum + 1);
    },

    SortFunction : function (oRecord1, oRecord2)
    {
        var nPreSortResult = g_oGamesList.private_PreSort(oRecord1, oRecord2);
        if (0 !== nPreSortResult)
            return nPreSortResult;

        var SortType = g_oGamesList.SortType;
        if (EGameListRecord.Id === SortType)
        {
            if (oRecord1.m_nGameId < oRecord2.m_nGameId)
                return -1;
            else if (oRecord1.m_nGameId > oRecord2.m_nGameId)
                return 1;
        }
        else if (-EGameListRecord.Id === SortType)
        {
            if (oRecord1.m_nGameId < oRecord2.m_nGameId)
                return 1;
            else if (oRecord1.m_nGameId > oRecord2.m_nGameId)
                return -1;
        }
        else if (EGameListRecord.WRank === SortType)
        {
            if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
                return -1;
            else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
                return 1;
        }
        else if (-EGameListRecord.WRank === SortType)
        {
            if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
                return 1;
            else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
                return -1;
        }
        else if (EGameListRecord.WName === SortType)
        {
            if (oRecord1.m_sWhiteName < oRecord2.m_sWhiteName)
                return -1;
            else if (oRecord1.m_sWhiteName > oRecord2.m_sWhiteName)
                return 1;
        }
        else if (-EGameListRecord.WName === SortType)
        {
            if (oRecord1.m_sWhiteName < oRecord2.m_sWhiteName)
                return 1;
            else if (oRecord1.m_sWhiteName > oRecord2.m_sWhiteName)
                return -1;
        }
        else if (EGameListRecord.BRank === SortType)
        {
            if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
                return -1;
            else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
                return 1;
        }
        else if (-EGameListRecord.BRank === SortType)
        {
            if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
                return 1;
            else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
                return -1;
        }
        else if (EGameListRecord.BName === SortType)
        {
            if (oRecord1.m_sBlackName < oRecord2.m_sBlackName)
                return -1;
            else if (oRecord1.m_sBlackName > oRecord2.m_sBlackName)
                return 1;
        }
        else if (-EGameListRecord.BName === SortType)
        {
            if (oRecord1.m_sBlackName < oRecord2.m_sBlackName)
                return 1;
            else if (oRecord1.m_sBlackName > oRecord2.m_sBlackName)
                return -1;
        }
        else if (EGameListRecord.Observers === SortType)
        {
            if (oRecord1.m_nObserversCount < oRecord2.m_nObserversCount)
                return -1;
            else if (oRecord1.m_nObserversCount > oRecord2.m_nObserversCount)
                return 1;
        }
        else if (-EGameListRecord.Observers === SortType)
        {
            if (oRecord1.m_nObserversCount < oRecord2.m_nObserversCount)
                return 1;
            else if (oRecord1.m_nObserversCount > oRecord2.m_nObserversCount)
                return -1;
        }
        else if (EGameListRecord.Place === SortType)
        {
            if (oRecord1.m_sPlace < oRecord2.m_sPlace)
                return -1;
            else if (oRecord1.m_sPlace > oRecord2.m_sPlace)
                return 1;
        }
        else if (-EGameListRecord.Place === SortType)
        {
            if (oRecord1.m_sPlace < oRecord2.m_sPlace)
                return 1;
            else if (oRecord1.m_sPlace > oRecord2.m_sPlace)
                return -1;
        }

        return g_oGamesList.private_PostSort(oRecord1, oRecord2);
    },

    private_PreSort : function(oRecord1, oRecord2)
    {
        // Матчи, привязанные к событию на сервере, в самом верху списка
        if (true === oRecord1.m_bEvent && true !== oRecord2.m_bEvent)
            return -1;
        else if (true !== oRecord1.m_bEvent && true === oRecord2.m_bEvent)
            return 1;

        // Все отложенные партии в самом низу списка
        if (false === oRecord1.m_bAdjourned && false !== oRecord2.m_bAdjourned)
            return -1;
        else if (false !== oRecord1.m_bAdjourned && false === oRecord2.m_bAdjourned)
            return 1;

        return 0;
    },

    private_PostSort : function(oRecord1, oRecord2)
    {
        // Сортируем по рейтингу белого, потом по рейтингу черного, потом по количесту наблюдателей, потом по id партии.

        if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
            return 1;
        else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
            return -1;

        if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
            return 1;
        else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
            return -1;

        if (oRecord1.m_nObserversCount < oRecord2.m_nObserversCount)
            return 1;
        else if (oRecord1.m_nObserversCount > oRecord2.m_nObserversCount)
            return -1;

        if (oRecord1.m_nGameId < oRecord2.m_nGameId)
            return -1;
        else if (oRecord1.m_nGameId > oRecord2.m_nGameId)
            return 1;

        // Сюда мы уже не должны попадать, потому что Id партий не должны совпадать между собой.
        return 0;
    },

    Is_Sortable : function (nColNum)
    {
        var eType = nColNum + 1;
        switch (eType)
        {
            case EGameListRecord.Id       :
            case EGameListRecord.WRank    :
            case EGameListRecord.WName    :
            case EGameListRecord.BRank    :
            case EGameListRecord.BName    :
            case EGameListRecord.Observers:
            case EGameListRecord.Place    :
                return true;
        }

        return false;
    },

    Draw_Header : function(dX, dY, oContext, nColNum)
    {
        var eType = nColNum + 1;
        var SortType = g_oGamesList.SortType;

        var sHeaderText;
        if (eType === SortType)
            sHeaderText = g_oGamesList.Headers[eType] + String.fromCharCode(0x25B2);
        else if (eType === -SortType)
            sHeaderText = g_oGamesList.Headers[eType] + String.fromCharCode(0x25BC);
        else
            sHeaderText = g_oGamesList.Headers[eType];

        oContext.fillStyle = "#000000";
        oContext.fillText(sHeaderText, dX, dY);
    },

    Draw_Record : function(dX, dY, oContext, oRecord, nColNum, oListView)
    {
        var eType = nColNum + 1;
        if (true === oRecord.m_bDemo)
        {
            if (true === oRecord.m_bDemo && 3 === nColNum)
                oListView.Start_ClipException(oContext, 3, 7);

            if (4 !== nColNum && 5 !== nColNum && 6 !== nColNum)
                oRecord.Draw(oContext, dX, dY, eType);

            if (true === oRecord.m_bDemo && 3 === nColNum)
                oListView.Restore_Clip(oContext, 3);
        }
        else
        {
            oRecord.Draw(oContext, dX, dY, eType);
        }
    },

    Get_Record : function(aLine)
    {
        var oRecord = new CGameListRecord(oApp.GetClient());
        oRecord.Update(aLine);
        return oRecord;
    },

    Get_Key : function(aLine)
    {
        return (aLine[1] | 0);
    },

    Handle_DoubleClick : function(Record)
    {
        if (oApp)
            oApp.SetCurrentGameRoomTab(Record.m_nGameId);
    }
};

function CGameListRecord(oClient)
{
    this.m_oClient         = oClient;

    this.m_nGameId         = 0;
    this.m_sGameType       = "F";
    this.m_nObserversCount = 0;
    this.m_sWhiteName      = "";
    this.m_nWhiteRank      = -3;
    this.m_sBlackName      = "";
    this.m_nBlackRank      = -3;
    this.m_sGameInfo       = "";
    this.m_nMove           = 0;
    this.m_bPrivate        = false;
    this.m_nRoomId         = -1;
    this.m_bAdjourned      = false;
    this.m_bEvent          = false;
    this.m_bDemo           = false;
}

CGameListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var sFont = oContext.font;
	var bResetFont = false;
	if ((eType === EGameListRecord.WName && this.m_oClient.IsUserInFollowerList(this.m_sWhiteName)
		|| (eType === EGameListRecord.BName && this.m_oClient.IsUserInFollowerList(this.m_sBlackName))))
	{
		oContext.font = "bold " + sFont;
		bResetFont = true;
		if (true === this.m_bAdjourned) // Отложенная игра
			oContext.fillStyle = "#C3DDDA";
		else
			oContext.fillStyle = "#008272";
	}
	else
	{
		if (true === this.m_bAdjourned) // Отложенная игра
			oContext.fillStyle = "#CCCCCC";
		else
			oContext.fillStyle = "#000000";
	}

    var sString = "";
    switch(eType)
    {
        case EGameListRecord.Id       : sString += this.m_nGameId; break;
        case EGameListRecord.Type     : sString += this.m_sGameType; break;
        case EGameListRecord.WRank    : sString += this.private_GetRank(this.m_nWhiteRank); break;
        case EGameListRecord.WName    : sString += this.m_sWhiteName; break;
        case EGameListRecord.Vs       : sString +=  ("" !== this.m_sWhiteName && "" !== this.m_sBlackName ? "vs." : ""); break;
        case EGameListRecord.BRank    : sString += this.private_GetRank(this.m_nBlackRank); break;
        case EGameListRecord.BName    : sString += this.m_sBlackName; break;
        case EGameListRecord.Observers: sString += this.m_nObserversCount; break;
        case EGameListRecord.Move     : sString += "" + this.m_nMove; break;
        case EGameListRecord.Info     : sString += this.m_sGameInfo; break;
        case EGameListRecord.Private  : sString += this.m_bPrivate ? "private" : ""; break;
        case EGameListRecord.Place    : sString += this.private_GetRoomName(this.m_nRoomId); break;
    }

    oContext.fillText(sString, dX, dY);

	if (true === bResetFont)
		oContext.font = sFont;
};

CGameListRecord.prototype.Compare = function(sKey)
{
    if (this.m_nGameId === sKey)
        return true;

    return false;
};

CGameListRecord.prototype.Get_Key = function()
{
    return this.m_nGameId;
};

CGameListRecord.prototype.Update = function(aLine)
{
    this.m_nGameId    = aLine[1] | 0;
    this.m_sGameType  = aLine[2];
    this.m_nObserversCount = aLine[3] | 0;
    this.m_sWhiteName = aLine[5];
    this.m_nWhiteRank = aLine[6] | 0;
    this.m_sBlackName = aLine[8];
    this.m_nBlackRank = aLine[9] | 0;
    this.m_sGameInfo  = aLine[10];
    this.m_nMove      = aLine[11] | 0;
    this.m_bPrivate   = aLine[12];
    this.m_nRoomId    = aLine[13] | 0;
    this.m_bAdjourned = aLine[14];
    this.m_bEvent     = aLine[15];
    this.m_bDemo      = aLine[16];
};

CGameListRecord.prototype.private_GetRank = function(nRank)
{
    if (nRank <= -3)
        return "";
    if (nRank === -2)
        return "[?]";
    else if (nRank === -1)
        return "[-]";
    else if (nRank <= 29)
        return "[" + (30 - nRank) + "k]";
    else if (nRank <= 49)
        return "[" + (nRank - 29) + "d]";
    else
        return "[" + (nRank - 49) + "p]";
};

CGameListRecord.prototype.private_GetRoomName = function(nRoomId)
{
    if (oApp && oApp.GetClient())
        return oApp.GetClient().GetRoomName(nRoomId);

    return "";
};
