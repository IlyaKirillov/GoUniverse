"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     10.06.2016
 * Time     22:44
 */

function CVisualPopup(oApp, oHandler)
{
	this.m_oApp     = oApp;
	this.m_oHandler = oHandler;

	this.m_oHtmlElement   = null;
	this.m_nShowId        = null;
	this.m_nTransitionId  = null;
	this.m_bDestroyOnHide = false;
}
CVisualPopup.prototype.Create = function(bDestroyOnHide)
{
	this.m_oApp.RegisterPopup(this);

	if (undefined !== bDestroyOnHide)
		this.m_bDestroyOnHide = bDestroyOnHide;

	var oMainDiv = this.m_oApp.GetMainDiv();

	var oElement              = document.createElement("div");
	oElement.style.position   = "absolute";
	oElement.style.top        = "100px";
	oElement.style.left       = "100px";
	oElement.style.width      = "100px";
	oElement.style.height     = "100px";
	oElement.style.background = "rgb(243, 243, 243)";
	oElement.style.display    = "block";
	oElement.style.overflow   = "hidden";
	oMainDiv.appendChild(oElement);
	oElement.style.display    = "none";

	this.m_oHtmlElement  = oElement;
	this.m_nShowId       = null;
	this.m_nTransitionId = null;
};
CVisualPopup.prototype.GetHtmlElement = function()
{
	return this.m_oHtmlElement;
};
CVisualPopup.prototype.Toggle = function()
{
	var oThis    = this;
	var oHandler = this.m_oHandler;
	if ("none" === this.m_oHtmlElement.style.display)
	{
		if (null === this.m_nShowId)
		{
			if (oHandler.UpdatePopupPosition)
				oHandler.UpdatePopupPosition(oThis);

			this.m_nShowId = setTimeout(function ()
			{
				if (null !== oThis.m_nTransitionId)
				{
					clearTimeout(oThis.m_nTransitionId);
					oThis.m_nTransitionId = null;
				}

				oThis.m_oHtmlElement.style.display = "block";

				if (oHandler.OnHidePopup)
					oHandler.OnHidePopup(oThis);

				oThis.m_nTransitionId = setTimeout(function ()
				{
					if (oHandler.OnShowPopup)
						oHandler.OnShowPopup(oThis);

					oThis.m_nTransitionId = null;
					oThis.m_nShowId       = null;
				}, 20);
			}, 20);
		}
	}
	else
	{
		this.Hide(false);
	}
};
CVisualPopup.prototype.Hide = function(bFast)
{
	var oThis    = this;
	var oHandler = this.m_oHandler;
	if ("none" !== this.m_oHtmlElement.style.display)
	{
		if (oHandler.OnHidePopup)
			oHandler.OnHidePopup(oThis);

		if (true === bFast)
		{
			this.m_oHtmlElement.style.display = "none";

			if (true === this.m_bDestroyOnHide)
				this.Destroy();
		}
		else
		{
			this.m_nTransitionId = setTimeout(function()
			{
				if (true === oThis.m_bDestroyOnHide)
					oThis.Destroy();

				oThis.m_oHtmlElement.style.display = "none";
				oThis.m_nTransitionId              = null;
			}, 200);
		}
	}
};
CVisualPopup.prototype.Destroy = function()
{
	try
	{
		this.m_oApp.UnregisterPopup(this);
		var oMainDiv = this.m_oApp.GetMainDiv();
		oMainDiv.removeChild(this.m_oHtmlElement);
	}
	catch(e)
	{
	}
};
CVisualPopup.prototype.IsVisible = function()
{
	return (this.m_oHtmlElement.style.display === "block" ? true : false);
};

function CVisualContextMenu(oApp, nX, nY)
{
	this.m_oApp = oApp;
	this.m_nX   = nX;
	this.m_nY   = nY;

	this.m_oPopup = new CVisualPopup(oApp, this);
	this.m_oPopup.Create(true);


	var oHtmlElement            = this.m_oPopup.GetHtmlElement();
	oHtmlElement.style.zIndex   = 0xFFFFFFFF;
	oHtmlElement.style.position = "absolute";
	oHtmlElement.style.top      = "100px";
	oHtmlElement.style.left     = "100px";
	oHtmlElement.style.display  = "none";
	oHtmlElement.className += "ContextMenu";

	var oList = document.createElement("ul");
	oHtmlElement.appendChild(oList);
	this.m_oList = oList;

	this.m_nHeight = 12;
	this.m_nWidth  = 100;
}
CVisualContextMenu.prototype.AddListItem = function(sText, fAction)
{
	var oListEntry = document.createElement("li");
	oListEntry.className = "ContextMenuItem";
	this.m_oList.appendChild(oListEntry);

	if (sText)
		oListEntry.innerHTML = sText;

	if (fAction)
		oListEntry.addEventListener("click", fAction, false);

	this.m_nHeight += 20;
};
CVisualContextMenu.prototype.AddHorizontalLine = function()
{
	var oListEntry = document.createElement("li");
	oListEntry.className = "ContextMenuLine";
	this.m_oList.appendChild(oListEntry);

	this.m_nHeight += 6;
};
CVisualContextMenu.prototype.AddCheckBoxItem = function(bChecked, sText, fAction, isDisabled)
{
	var oListEntry = document.createElement("li");
	oListEntry.className = true === isDisabled ? "ContextMenuItemDisabled" : "ContextMenuItem";
	this.m_oList.appendChild(oListEntry);

	var oCheckItem               = document.createElement("div");
	oCheckItem.style.paddingLeft = "3px";
	oCheckItem.style.width       = "20px";
	oCheckItem.style.height      = "20px";
	oCheckItem.style['float']    = "left";
	Common.Set_InnerTextToElement(oCheckItem, bChecked ? "✔" : "");
	oListEntry.appendChild(oCheckItem);

	var oTextItem               = document.createElement("div");
	oTextItem.style.height      = "20px";
	oTextItem.style['float']    = "left";
	oTextItem.style.overflow    = "hidden";
	Common.Set_InnerTextToElement(oTextItem, sText);
	oListEntry.appendChild(oTextItem);

	g_oTextMeasurer.SetFont("16px 'Times New Roman', Times, serif");
	var nWidth = (g_oTextMeasurer.Measure(sText) | 0) + 1;

	if (this.m_nWidth < 5 + 3 + 20 + nWidth + 5)
		this.m_nWidth = 5 + 3 + 20 + nWidth + 5;

	if (fAction && true !== isDisabled)
		oListEntry.addEventListener("click", fAction, false);

	this.m_nHeight += 20;
};
CVisualContextMenu.prototype.Show = function()
{
	this.m_oPopup.Toggle();
};
CVisualContextMenu.prototype.UpdatePopupPosition = function(oPopup)
{
	var nAppHeight = this.m_oApp.GetHeight();
	if (this.m_nY + this.m_nHeight > nAppHeight)
		this.m_nY = nAppHeight - this.m_nHeight;

	var nAppWidth = this.m_oApp.GetWidth();

	if (this.m_nX + this.m_nWidth > nAppWidth)
		this.m_nX = nAppWidth - this.m_nWidth;

	var oHtmlElement        = this.m_oPopup.GetHtmlElement();
	oHtmlElement.style.left = this.m_nX + "px";
	oHtmlElement.style.top  = this.m_nY + "px";
};
CVisualContextMenu.prototype.OnHidePopup = function(oPopup)
{
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.height = "0px";
};
CVisualContextMenu.prototype.OnShowPopup = function(oPopup)
{
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.height = this.m_nHeight + "px";
	oHtmlElement.style.width  = this.m_nWidth + "px";
};

