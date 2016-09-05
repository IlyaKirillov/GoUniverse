"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     09.06.2016
 * Time     1:24
 */

if (!String.prototype.splice)
{
	String.prototype.splice = function(nStart, nDelCount, sNewSubStr)
	{
		return this.slice(0, nStart) + sNewSubStr + this.slice(nStart + Math.abs(nDelCount));
	};
}

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
function SplitTextToLines(sText)
{
	var aLines = [];

	var nBreakPos = -1;
	var nCurPos   = 0;

	for (var nCount = sText.length; nBreakPos < nCount; ++nBreakPos)
	{
		var nCharCode = sText.charCodeAt(nBreakPos);
		if (0x000A === nCharCode || 0xFF0A === nCharCode)
		{
			aLines.push(sText.substr(nCurPos, nBreakPos - nCurPos));
			nCurPos = nBreakPos + 1;
		}
	}

	if (nCurPos < sText.length)
		aLines.push(sText.substr(nCurPos, sText.length - nCurPos));

	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		aLines[nIndex] = aLines[nIndex].replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");

		var nPos = 0;
		while (nPos < aLines[nIndex].length && -1 !== nPos)
		{
			nPos = aLines[nIndex].indexOf("\<gmt\>", nPos);
			if (-1 === nPos)
				break;

			var nEndPos = aLines[nIndex].indexOf("\<\/gmt\>", nPos);
			if (-1 === nEndPos)
				break;

			// На КГС <gmt> идет в одном из форматов
			// <gmt>YYYY-MM-DD</gmt> или <gmt>YYYY-MM-DD HH:MM</gmt>

			//YYYY-MM-DDTHH:MM:SS.sssZ
			var sTimeString = aLines[nIndex].substr(nPos + 5, nEndPos - nPos - 5);
			if (10 === sTimeString.length)
			{
				sTimeString += "T00:00:00.000Z";
			}
			else if (16 === sTimeString.length)
			{
				sTimeString = sTimeString.splice(10, 1, 'T');
				sTimeString += ":00.000Z";
			}
			else
			{
				// Ничего не делаем
			}
			var oDate = new Date(sTimeString);
			// TODO: Когда сделаем выбор языка тут надо будет сделать меняющуюся локаль
			sTimeString = oDate.toLocaleString();

			aLines[nIndex] = aLines[nIndex].splice(nPos, nEndPos + 6 - nPos, sTimeString);

			nPos = nPos + sTimeString.length;
		}
	}

	return aLines;
}

function CFadeEffect()
{
	this.m_oElements = [];
}
CFadeEffect.prototype.In = function(oElement, nTime, fOnDisplay)
{
	if (!oElement)
		return;

	if (parseFloat(oElement.style.opacity) > 0.99 && "none" !== oElement.style.display)
		return;

	var nOldDirection = this.private_CheckElement(oElement);
	if (-1 === nOldDirection)
		this.private_RemoveElement(oElement);
	else if (1 === nOldDirection)
		return;

	oElement.style.opacity    = 0;
	oElement.style.filter     = "alpha(opacity=0)";
	oElement.style.display    = "inline-block";
	oElement.style.visibility = "visible";

	if (fOnDisplay)
		fOnDisplay();

	if (nTime > 0)
	{
		var oThis    = this;
		var dOpacity = 0;
		var nTimerId = setInterval(function()
		{
			dOpacity += 50 / nTime;
			if (dOpacity >= 1)
			{
				oThis.private_RemoveElement(oElement);
				dOpacity = 1;
			}
			oElement.style.opacity = dOpacity;
			oElement.style.filter  = "alpha(opacity=" + dOpacity * 100 + ")";
		}, 50);

		this.private_AddElement(oElement, nTimerId, 1);
	}
	else
	{
		oElement.style.opacity = 1;
		oElement.style.filter  = "alpha(opacity=1)";
	}
};
CFadeEffect.prototype.Out = function(oElement, nTime, fOnHidden)
{
	if (!oElement)
		return;

	if (parseFloat(oElement.style.opacity) < 0.01 && "none" === oElement.style.display)
		return;

	var nOldDirection = this.private_CheckElement(oElement);
	if (1 === nOldDirection)
		this.private_RemoveElement(oElement);
	else if (-1 === nOldDirection)
		return;

	if (nTime > 0)
	{
		var dOpacity = 1;
		var oThis = this;
		var nTimerId = setInterval(function()
		{
			dOpacity -= 50 / nTime;
			if (dOpacity <= 0)
			{
				oThis.private_RemoveElement(oElement);
				dOpacity                  = 0;
				oElement.style.display    = "none";
				oElement.style.visibility = "hidden";

				if (fOnHidden)
					fOnHidden();
			}
			oElement.style.opacity = dOpacity;
			oElement.style.filter  = "alpha(opacity=" + dOpacity * 100 + ")";
		}, 50);

		this.private_AddElement(oElement, nTimerId, -1);
	}
	else
	{
		oElement.style.opacity    = 0;
		oElement.style.filter     = "alpha(opacity=0)";
		oElement.style.display    = "none";
		oElement.style.visibility = "hidden";
	}
};
CFadeEffect.prototype.private_RemoveElement = function(oElement)
{
	for (var nIndex = 0, nCount = this.m_oElements.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_oElements[nIndex].Element === oElement)
		{
			clearInterval(this.m_oElements[nIndex].TimerId);
			this.m_oElements.splice(nIndex, 1);
			return;
		}
	}
};
CFadeEffect.prototype.private_AddElement = function(oElement, nTimerId, nDirection)
{
	this.m_oElements.push({
		Element   : oElement,
		TimerId   : nTimerId,
		Direction : nDirection
	});
};
CFadeEffect.prototype.private_CheckElement = function(oElement)
{
	for (var nIndex = 0, nCount = this.m_oElements.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_oElements[nIndex].Element === oElement)
			return this.m_oElements[nIndex].Direction;
	}

	return 0;
};

var g_oFadeEffect = new CFadeEffect();

function CTimeStamp(sTimeStamp)
{
	this.m_oDate = new Date();

	if (sTimeStamp)
		this.Parse(sTimeStamp);
}
CTimeStamp.prototype.Parse = function(sTimeStamp)
{
	// <YYYY-MM-DDTHH:mm:ss.sssZ>
	this.m_oDate = new Date(Date.parse(sTimeStamp));
};
CTimeStamp.prototype.ToLocaleString = function()
{
	return this.m_oDate.toLocaleString();
};
CTimeStamp.prototype.ToLocaleDate = function()
{
	return this.m_oDate.toLocaleDateString();
};
CTimeStamp.prototype.GetDifferenceString = function()
{
	var nTime = this.m_oDate.getTime();
	var nCurTime = (new Date()).getTime();

	var nDiffTime = nCurTime - nTime;

	var nSeconds = parseInt(nDiffTime / 1000);

	if (nSeconds <= 60 * 2)
	{
		return "" + nSeconds + " seconds ago";
	}
	else if (nSeconds <= 3600 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		return nMinutes + " minutes ago";
	}
	else if (nSeconds <= 3600 * 24 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		return nHours + " hours ago";
	}
	else
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		var nDays    = Math.floor(nHours / 24);
		return nDays + " days ago";
	}
};

var g_oTextMeasurer = new CTextMeasurer();
function CTextMeasurer()
{
	this.m_oCanvas  = document.createElement("canvas");
	this.m_oContext = this.m_oCanvas.getContext("2d");
}
CTextMeasurer.prototype.SetFont = function(sFont)
{
	this.m_oContext.font = sFont;
};
CTextMeasurer.prototype.Measure = function(sText)
{
	var oMetrics = this.m_oContext.measureText(sText);
	return oMetrics.width;
};

(function()
{
	var nState   = 0;
	var nTimerId = null;

	function Animate()
	{
		var oCanvas  = document.getElementById("animatedLogoId");
		var oContext = oCanvas.getContext("2d");

		var nW = oCanvas.width;
		var nH = oCanvas.height;

		var nRad = Math.min(nW, nH) * 0.4;

		oContext.clearRect(0, 0, nW, nH);

		oContext.lineWidth = 2;

		oContext.save();
		oContext.translate(nW / 2, nH / 2);

		if (nState < 100)
		{
			oContext.strokeStyle = "rgb(0, 0, 0)";
			oContext.fillStyle   = "rgb(255, 255, 255)";
			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
			oContext.stroke();
			oContext.fill();

			oContext.fillStyle = "rgb(0, 0, 0)";

			oContext.beginPath();
			oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
			oContext.scale(1 - nState / 100, 1);
			oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

			oContext.stroke();
			oContext.fill();
		}
		else if (nState < 200)
		{
			oContext.strokeStyle = "rgb(0, 0, 0)";
			oContext.fillStyle   = "rgb(0, 0, 0)";
			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
			oContext.stroke();
			oContext.fill();

			oContext.fillStyle = "rgb(255, 255, 255)";

			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

			if (100 !== nState)
			{
				oContext.scale(nState / 100 - 1, 1);
				oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
			}
			else
			{
				oContext.closePath();
			}

			oContext.stroke();
			oContext.fill();
		}
		else if (nState < 300)
		{
			oContext.strokeStyle = "rgb(0, 0, 0)";
			oContext.fillStyle   = "rgb(0, 0, 0)";
			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
			oContext.stroke();
			oContext.fill();

			oContext.fillStyle = "rgb(255, 255, 255)";

			oContext.beginPath();
			oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
			oContext.scale(3 - nState / 100, 1);
			oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

			oContext.stroke();
			oContext.fill();
		}
		else if (nState < 400)
		{
			oContext.strokeStyle = "rgb(0, 0, 0)";
			oContext.fillStyle   = "rgb(255, 255, 255)";
			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
			oContext.stroke();
			oContext.fill();

			oContext.fillStyle = "rgb(0, 0, 0)";

			oContext.beginPath();
			oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

			if (300 !== nState)
			{
				oContext.scale(nState / 100 - 3, 1);
				oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
			}
			else
			{
				oContext.closePath();
			}

			oContext.stroke();
			oContext.fill();
		}

		oContext.restore();

		nState++;
		if (nState >= 400)
			nState = 0;

		nTimerId = Common_RequestAnimationFrame(Animate);
	}

	function StopAnimate()
	{
		if (null !== nTimerId)
		{
			Common_CancelAnimationFrame(nTimerId);
			nTimerId = null;
			nState   = 0;
		}
	}

	window["GoUniverseLogoAnimate"]     = Animate;
	window["GoUniverseLogoStopAnimate"] = StopAnimate;

})();