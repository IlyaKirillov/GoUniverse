"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     24.06.2016
 * Time     0:45
 */

function CVerticalScroll()
{
	this.m_oDiv       = null;
	this.m_oScrollDiv = null;

	this.m_sNormalClass = "";
	this.m_sActiveClass = "";

	this.m_nScrollW     = 15; // 14 + Border (1)

	this.m_nTop    = 0;
	this.m_nBottom = 0;
	this.m_nRight  = 0;

	this.m_bAddPadding = false;

	var oThis = this;
	this.m_fOnScroll = function(e)
	{
		return oThis.private_OnScroll(e);
	};

	this.m_nElementHeight   = 0;
	this.m_bStopPropagation = false;
}
CVerticalScroll.prototype.Init = function(oDiv, sNormalClass, sActiveClass, bAddPaddingsOnShow)
{
	this.m_sNormalClass = sNormalClass;
	this.m_sActiveClass = sActiveClass;
	this.m_oDiv         = oDiv;
	this.m_bAddPadding  = bAddPaddingsOnShow;

	var oParent = oDiv.parentNode;
	if (!oParent)
		return;

	var oScroll = document.createElement("div");
	oParent.insertBefore(oScroll, oDiv.nextSibling);

	oScroll.style.display  = "block";
	oScroll.style.position = "absolute";
	oScroll.style.top      = "0px";
	oScroll.style.left     = "0px";
	oScroll.style.width    = "14px";
	oScroll.style.height   = "50px";
	oScroll.className      = sNormalClass;

	this.m_oScrollDiv = oScroll;

	oScroll.style.display  = "none";
};
CVerticalScroll.prototype.SetPaddings = function(nTop, nBottom, nRight)
{
	this.m_nTop    = nTop;
	this.m_nBottom = nBottom;
	this.m_nRight  = nRight;
};
CVerticalScroll.prototype.Show = function(nElementHeight)
{
	this.m_nElementHeight = nElementHeight;

	var oDiv       = this.m_oDiv;
	var oVerScroll = this.m_oScrollDiv;

	if (true === this.m_bAddPadding)
		oDiv.style.paddingRight = this.m_nScrollW + 2;

	// sa - scroll area, va - visible area, pa - physical area
	var vaH = parseFloat(nElementHeight);
	var saY = this.m_nTop;
	var paH = parseFloat(oDiv.scrollHeight);
	var paY = parseFloat(oDiv.scrollTop);
	var saH = vaH - saY - this.m_nBottom;

	var sH = Math.max(20, ((vaH - saY) * vaH / paH)) | 0;
	var sY = Math.max(saY, Math.min(saY + saH - sH + 1, saY + paY * (saH - sH) / (paH - vaH)));
	var sX = parseFloat(oDiv.clientWidth + oDiv.offsetLeft) - this.m_nScrollW - this.m_nRight;

	oVerScroll.style.display = "block";
	oVerScroll.style.height  = sH + "px";
	oVerScroll.style.top     = (sY + oDiv.offsetTop) + "px";
	oVerScroll.style.left    = sX + "px";

	var oThis = this;
	Common_DragHandler.Init(oVerScroll, null, sX, sX, saY + oDiv.offsetTop, saY + saH - sH + oDiv.offsetTop);
	oVerScroll.onDrag = function(sX, sY)
	{
		sY -= oDiv.offsetTop;
		oDiv.scrollTop = (sY - saY) * (paH - vaH) / (saH - sH);
	};
	oVerScroll.onDragStart = function(sX, sY)
	{
		oVerScroll.className = oThis.m_sNormalClass + " " + oThis.m_sActiveClass;
	};
	oVerScroll.onDragEnd = function(sX, sY)
	{
		oVerScroll.className = oThis.m_sNormalClass;
	};
	oVerScroll.onclick = function(e)
	{
		if (oThis && oThis.m_bStopPropagation)
		{
			e.stopPropagation();
			return false;
		}
	};

	oVerScroll.addEventListener("DOMMouseScroll", this.m_fOnScroll, false);
	oVerScroll.addEventListener("mousewheel", this.m_fOnScroll, false);

	oDiv.addEventListener("DOMMouseScroll", this.m_fOnScroll, false);
	oDiv.addEventListener("mousewheel", this.m_fOnScroll, false);
};
CVerticalScroll.prototype.Hide = function()
{
	this.m_nElementHeight = 0;
	this.m_oScrollDiv.style.display = "none";

	if (true === this.m_bAddPadding)
		this.m_oDiv.style.paddingRight = 0;

	this.m_oDiv.removeEventListener("DOMMouseScroll", this.m_fOnScroll, false);
	this.m_oDiv.removeEventListener("mousewheel", this.m_fOnScroll, false);
};
CVerticalScroll.prototype.IsHidden = function()
{
	return ("none" === this.m_oScrollDiv.style.display ? true : false);
};
CVerticalScroll.prototype.CheckVisibility = function(bScrollBottomOnShow)
{
	var oDiv = this.m_oDiv;
	if (oDiv.scrollHeight > oDiv.clientHeight)
	{
		var bHidden = this.IsHidden();

		this.Show(oDiv.clientHeight);

		if (true === bHidden && true === bScrollBottomOnShow)
			this.m_oDiv.scrollTop = this.m_oDiv.clientHeight;
	}
	else
	{
		this.Hide();
	}
};
CVerticalScroll.prototype.private_OnScroll = function(e)
{
	if (this.m_nElementHeight <= 1)
	{
		if (true === this.m_bStopPropagation)
		{
			e.stopPropagation();
			return false;
		}
		return;
	}

	var delta = 0;
	if (undefined != e.wheelDelta && e.wheelDelta != 0)
	{
		delta = -45 * e.wheelDelta / 120;
	}
	else if (undefined != e.detail && e.detail != 0)
	{
		delta = 45 * e.detail / 3;
	}

	this.m_oDiv.scrollTop += delta;

	this.UpdatePosition();

	if (true === this.m_bStopPropagation)
	{
		e.stopPropagation();
		return false;
	}
};
CVerticalScroll.prototype.UpdatePosition = function()
{
	var oDiv       = this.m_oDiv;
	var oVerScroll = this.m_oScrollDiv;

	var vaH = parseFloat(this.m_nElementHeight);
	var saY = this.m_nTop;
	var paH = parseFloat(oDiv.scrollHeight);
	var paY = parseFloat(oDiv.scrollTop);
	var saH = vaH - saY - this.m_nBottom;

	var sH = Math.max(20, ((vaH - saY) * vaH / paH)) | 0;
	var sY = Math.max(saY, Math.min(saY + saH - sH + 1, saY + paY * (saH - sH) / (paH - vaH)));

	oVerScroll.style.top = (sY + oDiv.offsetTop) + "px";
};
CVerticalScroll.prototype.SetStopPropagation = function(isStop)
{
	this.m_bStopPropagation = isStop;
};