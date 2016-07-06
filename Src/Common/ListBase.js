"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     06.07.2016
 * Time     1:28
 */

function CListBase()
{
	this.m_oHeaders = {
		Sizes : [],
		Count : 0
	};

	this.m_nSortType = 0;
}
CListBase.prototype.Set_SortType = function(nColNum, nDirection)
{
	if (nDirection > 0)
		this.m_nSortType = nColNum + 1;
	else
		this.m_nSortType = -(nColNum + 1);
};
CListBase.prototype.private_PreSort = function(oRecord1, oRecord2)
{
	return 0;
};
CListBase.prototype.private_PostSort = function(oRecord1, oRecord2)
{
	return 0;
};
CListBase.prototype.private_Sort = function(oRecord1, oRecord2)
{
	return 0;
};
CListBase.prototype.SortFunction = function(oRecord1, oRecord2)
{
	var nResult = this.private_PreSort(oRecord1, oRecord2);
	if (0 !== nResult)
		return nResult;

	nResult = this.private_Sort(oRecord1, oRecord2);
	if (0 !== nResult)
		return nResult;

	return this.private_PostSort(oRecord1, oRecord2);
};
CListBase.prototype.Is_Sortable = function(nColNum)
{
	return true;
};
CListBase.prototype.Draw_Header = function(dX, dY, oContext, nColNum)
{
	var eType = nColNum + 1;
	var nSortType = this.m_nSortType;

	var sHeaderText;
	if (eType === nSortType)
		sHeaderText = this.m_oHeaders[eType] + String.fromCharCode(0x25B2);
	else if (eType === -nSortType)
		sHeaderText = this.m_oHeaders[eType] + String.fromCharCode(0x25BC);
	else
		sHeaderText = this.m_oHeaders[eType];

	oContext.fillStyle = "#000000";
	oContext.fillText(sHeaderText, dX, dY);
};
CListBase.prototype.Draw_Record = function(dX, dY, oContext, oRecord, nColNum)
{
	var eType = nColNum + 1;
	oRecord.Draw(oContext, dX, dY, eType);
};
CListBase.prototype.Get_Record = function()
{
	return new CListRecordBase();
};
CListBase.prototype.Get_Key = function(aLine)
{
	return aLine[1];
};
CListBase.prototype.Handle_DoubleClick = function(Record)
{
};
CListBase.prototype.Handle_RightClick = function(Record, e)
{
};
CListBase.prototype.GetHeadersCount = function()
{
	return this.m_oHeaders.Count;
};
CListBase.prototype.GetHeadersSize = function(nColNum)
{
	return this.m_oHeaders.Sizes[nColNum];
};
CListBase.prototype.GetVerLinesPositions = function()
{
	return [1];
};
CListBase.prototype.GetSortType = function()
{
	return this.m_nSortType;
};

function CListRecordBase()
{
}
CListRecordBase.prototype.Draw = function(oContext, dX, dY, eType)
{
};
CListRecordBase.prototype.Get_Key = function()
{
	return null;
};
CListRecordBase.prototype.Update = function(aLine)
{
};
CListRecordBase.prototype.Compare = function(sKey)
{
};