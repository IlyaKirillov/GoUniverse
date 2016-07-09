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
	Category : 2,
	Private  : 3
};

function CKGSRoomList(oApp)
{
	CKGSRoomList.superclass.constructor.call(this);

	this.m_oHeaders = {
		Sizes : [0, 245, 365],
		Count : 3,
		1     : "Name",
		2     : "Category",
		3     : ""
	};

	this.m_nSortType = EKGSRoomListRecord.Name;
	this.m_oApp      = oApp;
}

CommonExtend(CKGSRoomList, CListBase);

CKGSRoomList.prototype.private_Sort = function(oRecord1, oRecord2)
{
	var nRes     = 0;
	var SortType = this.m_nSortType;

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
};
CKGSRoomList.prototype.Is_Sortable = function(nColNum)
{
	if (2 === nColNum)
		return false;

	return true;
};
CKGSRoomList.prototype.Get_Record = function(aLine)
{
	var oRecord = new CKGSRoomListRecord();
	oRecord.Update(aLine);
	return oRecord;
};
CKGSRoomList.prototype.Handle_DoubleClick = function(Record)
{
	if (this.m_oApp)
		this.m_oApp.SetCurrentChatRoomTab(Record.m_nRoomId);
};
CKGSRoomList.prototype.GetVerLinesPositions = function()
{
	return [1, 2];
};

function CKGSRoomListRecord()
{
	CKGSRoomListRecord.superclass.constructor.call(this);

	this.m_nRoomId   = -1;
	this.m_sName     = "";
	this.m_sCategory = "";
	this.m_bPrivate  = false;
}

CommonExtend(CKGSRoomListRecord, CListRecordBase);

CKGSRoomListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var sString = "";
	switch (eType)
	{
		case EKGSRoomListRecord.Name:
			sString += this.m_sName;
			break;
		case EKGSRoomListRecord.Category:
			sString += this.m_sCategory;
			break;
		case EKGSRoomListRecord.Private:
			if (this.m_bPrivate)
				sString += "P";
			break;
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
	this.m_bPrivate  = aLine[4];
};
CKGSRoomListRecord.prototype.Compare = function(nRoomId)
{
	if (this.m_nRoomId === nRoomId)
		return true;

	return false;
};