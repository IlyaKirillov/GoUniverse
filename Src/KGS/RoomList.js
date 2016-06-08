"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     01.06.2016
 * Time     22:55
 */

var EKGSRoomListRecord = {
	Name     : 1,
	Category : 2
};

var g_oKGSRoomList = {

	Headers : {
		Sizes : [0, 245],
		Count : 2,
		1     : "Name",
		2     : "Category"
	},

	SortType : EKGSRoomListRecord.Name,

	Set_SortType : function(nColNum, Direction)
	{
		if (Direction > 0)
			g_oKGSRoomList.SortType = nColNum + 1;
		else
			g_oKGSRoomList.SortType = -(nColNum + 1);
	},

	SortFunction : function(oRecord1, oRecord2)
	{
		var nRes = 0;
		var SortType = g_oKGSRoomList.SortType;

		if (EKGSRoomListRecord.Name === SortType)
			nRes = Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName);
		else if (-EKGSRoomListRecord.Name === SortType)
			nRes = Common.Compare_Strings(oRecord2.m_sName, oRecord1.m_sName);
		else if (EKGSRoomListRecord.Category === SortType)
			nRes = Common.Compare_Strings(oRecord1.m_sCategory, oRecord2.m_sCategory);
		else if (-EKGSRoomListRecord.Category === SortType)
			nRes = Common.Compare_Strings(oRecord2.m_sCategory, oRecord1.m_sCategory);

		if (0 !== nRes)
			return nRes;

		nRes = Common.Compare_Strings(oRecord1.m_sCategory, oRecord2.m_sCategory);
		if (0 !== nRes)
			return nRes;

		nRes = Common.Compare_Strings(oRecord1.m_sName, oRecord2.m_sName);
		if (0 !== nRes)
			return nRes;

		if (oRecord1.m_nRoomId < oRecord2.m_nRoomId)
			return -1;
		else
			return 1;
	},

	Is_Sortable : function(nColNum)
	{
		return true;
	},

	Draw_Header : function(dX, dY, oContext, nColNum)
	{
		var eType    = nColNum + 1;
		var SortType = g_oKGSRoomList.SortType;

		var sHeaderText;
		if (eType === SortType)
			sHeaderText = g_oKGSRoomList.Headers[eType] + String.fromCharCode(0x25B2);
		else if (eType === -SortType)
			sHeaderText = g_oKGSRoomList.Headers[eType] + String.fromCharCode(0x25BC);
		else
			sHeaderText = g_oKGSRoomList.Headers[eType];

		oContext.fillStyle = "#000000";
		oContext.fillText(sHeaderText, dX, dY);
	},

	Draw_Record : function(dX, dY, oContext, oRecord, nColNum)
	{
		var eType = nColNum + 1;
		oRecord.Draw(oContext, dX, dY, eType);
	},

	Get_Record : function(aLine)
	{
		var oRecord = new CKGSRoomListRecord();
		oRecord.Update(aLine);
		return oRecord;
	},

	Get_Key : function(aLine)
	{
		return aLine[1];
	},

	Handle_DoubleClick : function(Record)
	{
		if (oApp)
			oApp.SetCurrentChatRoomTab(Record.m_nRoomId);
	}
};

function CKGSRoomListRecord()
{
	this.m_nRoomId   = -1;
	this.m_sName     = "";
	this.m_sCategory = "";
}

CKGSRoomListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var sString = "";
	switch(eType)
	{
	case EKGSRoomListRecord.Name     : sString += this.m_sName; break;
	case EKGSRoomListRecord.Category : sString += this.m_sCategory; break;
	}

	oContext.fillText(sString, dX, dY);
};
CKGSRoomListRecord.prototype.Get_Key = function()
{
	return this.m_nRoomId;
};
CKGSRoomListRecord.prototype.Update = function(aLine)
{
	this.m_nRoomId   = aLine[1] | 0;
	this.m_sName     = aLine[2];
	this.m_sCategory = aLine[3];
};
CKGSRoomListRecord.prototype.Compare = function(nRoomId)
{
	if (this.m_nRoomId === nRoomId)
		return true;

	return false;
};