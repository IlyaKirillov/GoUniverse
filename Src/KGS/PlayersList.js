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
        if (true === oRecord1.m_bFriend && true !== oRecord2.m_bFriend)
            return -1;

        if (true !== oRecord1.m_bFriend && true === oRecord2.m_bFriend)
            return 1;

        var SortType = g_oPlayersList.SortType;
        if (EPlayersListRecord.Name === SortType)
        {
            if (oRecord1.m_sName < oRecord2.m_sName)
                return -1;
            else if (oRecord1.m_sName > oRecord2.m_sName)
                return 1;
        }
        else if (-EPlayersListRecord.Name === SortType)
        {
            if (oRecord1.m_sName < oRecord2.m_sName)
                return 1;
            else if (oRecord1.m_sName > oRecord2.m_sName)
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

        return 0;
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
        var oRecord = new CPlayersListRecord();
        oRecord.Update(aLine);
        return oRecord;
    },

    Get_Key : function(aLine)
    {
        return aLine[1];
    },

    Handle_DoubleClick : function(Record)
    {
        if (oClient)
        {
            oClient.LoadUserInfo(Record.m_sName);
        }
    }
};

function CPlayersListRecord(sName, nRank)
{
    this.m_sName   = sName;
    this.m_nRank   = nRank;
    this.m_bFriend = false;
}

CPlayersListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
    var sFont = oContext.font;
    if (true === this.m_bFriend)
        oContext.font = "bold " + sFont;

    oContext.fillStyle = "#000000";

    var sString = "";
    switch(eType)
    {
        case EPlayersListRecord.Name : sString += this.m_sName; break;
        case EPlayersListRecord.Rank : sString += this.private_GetRank(this.m_nRank); break;
    }

    oContext.fillText(sString, dX, dY);

    if (true === this.m_bFriend)
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
    this.m_bFriend = aLine[3];
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