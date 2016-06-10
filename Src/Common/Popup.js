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

	this.m_oHtmlElement  = null;
	this.m_nShowId       = null;
	this.m_nTransitionId = null;
}
CVisualPopup.prototype.Create = function()
{
	this.m_oApp.RegisterPopup(this);

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

	if (this.m_oHandler.StylizePopup)
		this.m_oHandler.StylizePopup(this);
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
		}
		else
		{
			this.m_nTransitionId = setTimeout(function()
			{
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