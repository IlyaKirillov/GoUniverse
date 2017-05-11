"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 26.09.14
 * Time: 17:40
 */

var EKGSGameListRecord = {
	Type      : 1,
	WRank     : 2,
	WName     : 3,
	Vs        : 4,
	BRank     : 5,
	BName     : 6,
	SizeHandi : 7,
	Observers : 8,
	Move      : 9,
	Place     : 10,
	Info      : 11
};

function CKGSGamesList(oApp)
{
	CKGSGamesList.superclass.constructor.call(this);

	this.m_oHeaders = {
		Sizes : [0, 16, 46, 186, 211, 241, 361, 430, 495, 589, 764],
		Count : 11,
		1     : g_oTranslation.GetMainRoomGamesListHeaderType(),
		2     : g_oTranslation.GetMainRoomGamesListHeaderWhiteRank(),
		3     : g_oTranslation.GetMainRoomGamesListHeaderWhiteName(),
		4     : "",
		5     : g_oTranslation.GetMainRoomGamesListHeaderBlackRank(),
		6     : g_oTranslation.GetMainRoomGamesListHeaderBlackName(),
		7     : "",
		8     : g_oTranslation.GetMainRoomGamesListHeaderObservers(),
		9     : g_oTranslation.GetMainRoomGamesListHeaderMove(),
		10    : g_oTranslation.GetMainRoomGamesListHeaderRoom(),
		11    : g_oTranslation.GetMainRoomGamesListHeaderComment()
	};

	this.m_nSortType = -EKGSGameListRecord.Vs;

	this.m_oApp = oApp;
}

CommonExtend(CKGSGamesList, CListBase);

CKGSGamesList.prototype.private_Sort = function (oRecord1, oRecord2)
{
	var SortType = this.m_nSortType;
	if (EKGSGameListRecord.WRank === SortType)
	{
		if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
			return -1;
		else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
			return 1;
	}
	else if (-EKGSGameListRecord.WRank === SortType)
	{
		if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
			return 1;
		else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
			return -1;
	}
	else if (EKGSGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) > 0)
			return 1;
	}
	else if (-EKGSGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) > 0)
			return -1;
	}
	else if (EKGSGameListRecord.BRank === SortType)
	{
		if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
			return -1;
		else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
			return 1;
	}
	else if (-EKGSGameListRecord.BRank === SortType)
	{
		if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
			return 1;
		else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
			return -1;
	}
	else if (EKGSGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) > 0)
			return 1;
	}
	else if (-EKGSGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) > 0)
			return -1;
	}
	else if (EKGSGameListRecord.Observers === SortType)
	{
		if (oRecord1.m_nObserversCount < oRecord2.m_nObserversCount)
			return -1;
		else if (oRecord1.m_nObserversCount > oRecord2.m_nObserversCount)
			return 1;
	}
	else if (-EKGSGameListRecord.Observers === SortType)
	{
		if (oRecord1.m_nObserversCount < oRecord2.m_nObserversCount)
			return 1;
		else if (oRecord1.m_nObserversCount > oRecord2.m_nObserversCount)
			return -1;
	}
	else if (EKGSGameListRecord.Place === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetPlace(), oRecord2.GetPlace()) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.GetPlace(), oRecord2.GetPlace()) > 0)
			return 1;
	}
	else if (-EKGSGameListRecord.Place === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetPlace(), oRecord2.GetPlace()) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.GetPlace(), oRecord2.GetPlace()) > 0)
			return -1;
	}
	else if (EKGSGameListRecord.Vs === SortType)
	{
		var nMaxRank1 = Math.max(oRecord1.m_nWhiteRank, oRecord1.m_nBlackRank);
		var nMaxRank2 = Math.max(oRecord2.m_nWhiteRank, oRecord2.m_nBlackRank);

		if (nMaxRank1 < nMaxRank2)
		{
			return -1;
		}
		else if (nMaxRank1 > nMaxRank2)
		{
			return 1;
		}
		else
		{
			var nMinRank1 = Math.min(oRecord1.m_nWhiteRank, oRecord1.m_nBlackRank);
			var nMinRank2 = Math.min(oRecord2.m_nWhiteRank, oRecord2.m_nBlackRank);

			if (nMinRank1 < nMinRank2)
				return -1;
			else if (nMinRank1 > nMinRank2)
				return 1;
		}
	}
	else if (-EKGSGameListRecord.Vs === SortType)
	{
		var nMaxRank1 = Math.max(oRecord1.m_nWhiteRank, oRecord1.m_nBlackRank);
		var nMaxRank2 = Math.max(oRecord2.m_nWhiteRank, oRecord2.m_nBlackRank);

		if (nMaxRank1 < nMaxRank2)
		{
			return 1;
		}
		else if (nMaxRank1 > nMaxRank2)
		{
			return -1;
		}
		else
		{
			var nMinRank1 = Math.min(oRecord1.m_nWhiteRank, oRecord1.m_nBlackRank);
			var nMinRank2 = Math.min(oRecord2.m_nWhiteRank, oRecord2.m_nBlackRank);

			if (nMinRank1 < nMinRank2)
				return 1;
			else if (nMinRank1 > nMinRank2)
				return -1;
		}
	}

	return 0;
};
CKGSGamesList.prototype.private_PreSort = function(oRecord1, oRecord2)
{
	if (true === oRecord1.IsChallenge() && true !== oRecord2.IsChallenge())
		return -1;
	else if (true !== oRecord1.IsChallenge() && true === oRecord2.IsChallenge())
		return 1;

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
};
CKGSGamesList.prototype.private_PostSort = function(oRecord1, oRecord2)
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
};
CKGSGamesList.prototype.Is_Sortable = function(nColNum)
{
	var eType = nColNum + 1;
	switch (eType)
	{
		case EKGSGameListRecord.WRank    :
		case EKGSGameListRecord.WName    :
		case EKGSGameListRecord.BRank    :
		case EKGSGameListRecord.BName    :
		case EKGSGameListRecord.Observers:
		case EKGSGameListRecord.Place    :
		case EKGSGameListRecord.Vs:
			return true;
	}

	return false;
};
CKGSGamesList.prototype.Draw_Record = function(dX, dY, oContext, oRecord, nColNum, oListView)
{
	var eType = nColNum + 1;

	var nShiftX = 0;

	if ((EKGSGameListRecord.WRank === eType && true === oRecord.IsChallenge() && true === oRecord.m_bDemo)
		|| (!(true === oRecord.IsChallenge() && true === oRecord.m_bDemo) && (EKGSGameListRecord.WRank === eType || EKGSGameListRecord.BRank === eType)))
	{
		g_oTextMeasurer.SetFont(oContext.font);
		var nWidth = g_oTextMeasurer.Measure(oRecord.GetRankString(EKGSGameListRecord.BRank === eType ? true : false));

		var nSizeIndex = EKGSGameListRecord.BRank === eType ? 5 : 2;
		var nSize = this.m_oHeaders.Sizes[nSizeIndex] - this.m_oHeaders.Sizes[nSizeIndex - 1];

		nShiftX = (nSize - nWidth) / 2 - 5; // 5 - leftPadding
	}

	if (true === oRecord.IsChallenge())
	{
		if (3 === nColNum)
		{
			oListView.Start_ClipException(oContext, 3, 6);
			oRecord.Draw(oContext, dX + nShiftX, dY, eType);
			oListView.Restore_Clip(oContext, 3);
		}
		else if (6 === nColNum)
		{
			oListView.Start_ClipException(oContext, 6, 9);
			oRecord.Draw(oContext, dX + nShiftX, dY, eType);
			oListView.Restore_Clip(oContext, 6);
		}
		else
		{
			oRecord.Draw(oContext, dX + nShiftX, dY, eType);

		}
	}
	else if (true === oRecord.m_bDemo)
	{
		if (true === oRecord.m_bDemo && 2 === nColNum)
			oListView.Start_ClipException(oContext, 2, 6);

		if (3 !== nColNum && 4 !== nColNum && 5 !== nColNum)
			oRecord.Draw(oContext, dX + nShiftX, dY, eType);

		if (true === oRecord.m_bDemo && 2 === nColNum)
			oListView.Restore_Clip(oContext, 2);
	}
	else
	{

		oRecord.Draw(oContext, dX + nShiftX, dY, eType);
	}
};
CKGSGamesList.prototype.Get_Record = function(aLine)
{
	var oRecord = new CKGSGamesListRecord(this.m_oApp.GetClient());
	oRecord.Update(aLine);
	return oRecord;
};
CKGSGamesList.prototype.Handle_DoubleClick = function(Record)
{
	if (this.m_oApp)
		this.m_oApp.SetCurrentGameRoomTab(Record.m_nGameId);
};
CKGSGamesList.prototype.Handle_RightClick = function(Record, e)
{
	if (this.m_oApp)
	{
		return this.m_oApp.ShowGamesListContextMenu(e.pageX, e.pageY, Record ? Record.m_nGameId : null);
	}
};
CKGSGamesList.prototype.ResetToChallangesList = function()
{
	this.m_oHeaders[1]  = g_oTranslation.GetMainRoomGamesListHeaderType();
	this.m_oHeaders[2]  = g_oTranslation.GetMainRoomGamesListHeaderRank();
	this.m_oHeaders[3]  = g_oTranslation.GetMainRoomGamesListHeaderName();
	this.m_oHeaders[4]  = "";
	this.m_oHeaders[5]  = g_oTranslation.GetMainRoomGamesListHeaderTime();
	this.m_oHeaders[6]  = "";
	this.m_oHeaders[7]  = g_oTranslation.GetMainRoomGamesListHeaderSize();
	this.m_oHeaders[8]  = g_oTranslation.GetMainRoomGamesListHeaderRules();
	this.m_oHeaders[9]  = "";
	this.m_oHeaders[10] = g_oTranslation.GetMainRoomGamesListHeaderRoom();
	this.m_oHeaders[11] = g_oTranslation.GetMainRoomGamesListHeaderComment();
};
CKGSGamesList.prototype.ResetToGamesList = function()
{
	this.m_oHeaders[1]  = g_oTranslation.GetMainRoomGamesListHeaderType();
	this.m_oHeaders[2]  = g_oTranslation.GetMainRoomGamesListHeaderWhiteRank();
	this.m_oHeaders[3]  = g_oTranslation.GetMainRoomGamesListHeaderWhiteName();
	this.m_oHeaders[4]  = "";
	this.m_oHeaders[5]  = g_oTranslation.GetMainRoomGamesListHeaderBlackRank();
	this.m_oHeaders[6]  = g_oTranslation.GetMainRoomGamesListHeaderBlackName();
	this.m_oHeaders[7]  = "";
	this.m_oHeaders[8]  = g_oTranslation.GetMainRoomGamesListHeaderObservers();
	this.m_oHeaders[9]  = g_oTranslation.GetMainRoomGamesListHeaderMove();
	this.m_oHeaders[10] = g_oTranslation.GetMainRoomGamesListHeaderRoom();
	this.m_oHeaders[11] = g_oTranslation.GetMainRoomGamesListHeaderComment();
};



function CKGSGamesListRecord(oClient)
{
	CKGSGamesListRecord.superclass.constructor.call(this);

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
	this.m_sSizeHandi      = "";
	this.m_bChallenge      = false;
	this.m_sComment        = "";
	this.m_sTime           = "";
}

CommonExtend(CKGSGamesListRecord, CListRecordBase);

CKGSGamesListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var sFont = oContext.font;
	var bResetFont = false;

	if (true === this.IsChallenge())
	{
		if (EKGSGameListRecord.Type === eType
			|| EKGSGameListRecord.WRank === eType
			|| EKGSGameListRecord.WName === eType)
		{
			oContext.font = "bold " + sFont;
			bResetFont    = true;
		}
	}
	else if ((eType === EKGSGameListRecord.WName && this.m_oClient.IsUserInFollowerList(this.m_sWhiteName)
		|| (eType === EKGSGameListRecord.BName && this.m_oClient.IsUserInFollowerList(this.m_sBlackName))))
	{
		oContext.font = "bold " + sFont;
		bResetFont = true;
		if (true === this.m_bAdjourned) // Отложенная игра
			oContext.fillStyle = "#99C9C3";
		else
			oContext.fillStyle = "#008272";
	}
	else
	{
		if (true === this.m_bAdjourned) // Отложенная игра
			oContext.fillStyle = "#AAAAAA";
		else
			oContext.fillStyle = "#000000";
	}

    var sString = "";
    switch(eType)
    {
        case EKGSGameListRecord.Type     : sString += this.m_sGameType; break;
        case EKGSGameListRecord.WRank    : sString += this.private_GetRank(this.m_nWhiteRank); break;
        case EKGSGameListRecord.WName    : sString += this.m_sWhiteName; break;
        case EKGSGameListRecord.Vs       : sString += this.private_GetVs(); break;
        case EKGSGameListRecord.BRank    : sString += this.private_GetRank(this.m_nBlackRank); break;
        case EKGSGameListRecord.BName    : sString += this.m_sBlackName; break;
        case EKGSGameListRecord.Observers: sString += this.private_GetObserversCount(); break;
        case EKGSGameListRecord.Move     : sString += this.private_GetMove(); break;
        case EKGSGameListRecord.Place    : sString += this.private_GetRoomName(this.m_nRoomId); break;
		case EKGSGameListRecord.SizeHandi: sString += this.m_sSizeHandi; break;
		case EKGSGameListRecord.Info     : sString += this.m_sComment; break;
    }

    if (EKGSGameListRecord.SizeHandi === eType && 'x' === this.m_sSizeHandi.charAt(1))
	{
		g_oTextMeasurer.SetFont(oContext.font);
		var nShiftX = g_oTextMeasurer.Measure("11");
		oContext.fillText(sString, nShiftX + dX, dY);
	}
	else
	{
		oContext.fillText(sString, dX, dY);
	}

	if (true === bResetFont)
		oContext.font = sFont;
};
CKGSGamesListRecord.prototype.Compare = function(sKey)
{
    if (this.m_nGameId === sKey)
        return true;

    return false;
};
CKGSGamesListRecord.prototype.Get_Key = function()
{
    return this.m_nGameId;
};
CKGSGamesListRecord.prototype.Update = function(aLine)
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
	this.m_sSizeHandi = aLine[17];
	this.m_bChallenge = aLine[18];
	this.m_sComment   = aLine[19];
	this.m_sTime      = aLine[20];
};
CKGSGamesListRecord.prototype.private_GetRank = function(nRank)
{
    if (nRank <= -3)
        return "";
    if (nRank === -2)
        return "?";
    else if (nRank === -1)
        return "-";
    else if (nRank <= 29)
        return "" + (30 - nRank) + "k";
    else if (nRank <= 49)
        return "" + (nRank - 29) + "d";
    else
        return "" + (nRank - 49) + "p";
};
CKGSGamesListRecord.prototype.private_GetRoomName = function(nRoomId)
{
    if (oApp && oApp.GetClient())
        return oApp.GetClient().GetRoomName(nRoomId);

    return "";
};
CKGSGamesListRecord.prototype.GetPlace = function()
{
	return this.private_GetRoomName(this.m_nRoomId);
};
CKGSGamesListRecord.prototype.IsChallenge = function()
{
	return this.m_bChallenge;
};
CKGSGamesListRecord.prototype.private_GetObserversCount = function()
{
	if (!this.m_bChallenge)
	{
		return this.m_nObserversCount;
	}
	else
	{
		return "";
	}
};
CKGSGamesListRecord.prototype.private_GetMove = function()
{
	if (!this.m_bChallenge)
	{
		return this.m_sGameInfo ? this.m_sGameInfo : "" + this.m_nMove;
	}
	else
	{
		return "";
	}
};
CKGSGamesListRecord.prototype.private_GetVs = function()
{
	if (true !== this.IsChallenge())
	{
		return ("" !== this.m_sWhiteName && "" !== this.m_sBlackName ? "vs." : "");
	}
	else
	{
		return this.m_sTime;
	}
};
CKGSGamesListRecord.prototype.GetRankString = function(bBlack)
{
	return this.private_GetRank(bBlack ? this.m_nBlackRank : this.m_nWhiteRank);
};
