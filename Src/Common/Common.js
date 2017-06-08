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


function DecodeSurrogateChar(nLeadingChar, nTrailingChar)
{
	if (nLeadingChar < 0xDC00 && nTrailingChar >= 0xDC00 && nTrailingChar <= 0xDFFF)
		return 0x10000 + ((nLeadingChar & 0x3FF) << 10) | (nTrailingChar & 0x3FF);
	else
		return null;
}
function EncodeSurrogateChar(nUnicode)
{
	if (nUnicode < 0x10000)
	{
		return String.fromCharCode(nUnicode);
	}
	else
	{
		nUnicode          = nUnicode - 0x10000;
		var nLeadingChar  = 0xD800 | (nUnicode >> 10);
		var nTrailingChar = 0xDC00 | (nUnicode & 0x3FF);
		return String.fromCharCode(nLeadingChar) + String.fromCharCode(nTrailingChar);
	}
}

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\-\!\/\\\w]*))?)/g;
var userRegEx = /(\\user=)([A-Za-z0-9]+)(;)/g;
var gameRegEx = /(\\game=)([0-9]*)(;)([^(;)]+)(;)/g;

var smileRoflRegEx = /(:D)/g;

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
			sTimeString = oDate.toLocaleString(g_oLocalization.locale);

			aLines[nIndex] = aLines[nIndex].splice(nPos, nEndPos + 6 - nPos, sTimeString);

			nPos = nPos + sTimeString.length;
		}

		aLines[nIndex] = aLines[nIndex].replace("&", "&amp;");
		aLines[nIndex] = aLines[nIndex].replace("<", "&lt;");
		aLines[nIndex] = aLines[nIndex].replace(">", "&gt;");
		aLines[nIndex] = aLines[nIndex].replace("\"", "&quot;");
		aLines[nIndex] = aLines[nIndex].replace("\'", "&apos;");

		aLines[nIndex] = aLines[nIndex].replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");
		aLines[nIndex] = aLines[nIndex].replace(userRegEx, "<span class='UserLink'>$2</span>");
		aLines[nIndex] = aLines[nIndex].replace(gameRegEx, "<span class='GameLink'><span style='display: none'>$2</span>$4</span>");

		//aLines[nIndex] = aLines[nIndex].replace(smileRoflRegEx, "<img src='./Files/Smiles/ag.gif' alt=':D'>");
	}

	return aLines;
}

function ProcessUserLinks(oDiv, oClient)
{
	function privateProcess(oSpan, oClient)
	{
		var sUserName = oSpan.innerText;
		oSpan.addEventListener("click", function()
		{
			oClient.LoadUserInfo(sUserName);
		}, false);
		oSpan.addEventListener("contextmenu", function(e)
		{
			if (oApp)
				oApp.ShowUserContextMenu(e.pageX - 2, e.pageY + 2, sUserName);
			e.preventDefault();
			return false;
		}, false);
	}

	var arrUsers = oDiv.getElementsByClassName("UserLink");
	for (var nIndex = 0, nCount = arrUsers.length; nIndex < nCount; ++nIndex)
	{
		privateProcess(arrUsers[nIndex], oClient);
	}
}
function ProcessGameLinks(oDiv, oClient)
{
	function privateProcess(oSpan, oClient)
	{
		var oChild = oSpan.children[0];
		if (!oChild)
			return;

		var nGameId = parseInt(oChild.innerText);
		oSpan.onclick = function()
		{
			oClient.EnterToGameRoom(nGameId);
		}
	}


	var arrGames = oDiv.getElementsByClassName("GameLink");
	for (var nIndex = 0, nCount = arrGames.length; nIndex < nCount; ++nIndex)
	{
		privateProcess(arrGames[nIndex], oClient);
	}
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
	return this.m_oDate.toLocaleString(g_oLocalization.locale);
};
CTimeStamp.prototype.ToLocaleDate = function()
{
	return this.m_oDate.toLocaleDateString(g_oLocalization.locale);
};
CTimeStamp.prototype.GetDifferenceString = function()
{
	var nTime = this.m_oDate.getTime();
	var nCurTime = (new Date()).getTime();

	var nDiffTime = nCurTime - nTime;

	var nSeconds = parseInt(nDiffTime / 1000);

	if (nSeconds <= 60 * 2)
	{
		return g_oLocalization.common.connectionStatus.secondsAgo(nSeconds);
	}
	else if (nSeconds <= 3600 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		return g_oLocalization.common.connectionStatus.minutesAgo(nMinutes);
	}
	else if (nSeconds <= 3600 * 24 * 2)
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		return g_oLocalization.common.connectionStatus.hoursAgo(nHours);
	}
	else
	{
		var nMinutes = Math.floor(nSeconds / 60);
		var nHours   = Math.floor(nMinutes / 60);
		var nDays    = Math.floor(nHours / 24);
		return g_oLocalization.common.connectionStatus.daysAgo(nDays);
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

function CGoUniverseAnimatedLogo(oCanvas)
{
	this.m_oCanvas   = oCanvas;
	this.m_nState    = 0;
	this.m_nTimerId  = null;
	this.m_sStrokeStyle = "rgb(0, 0, 0)";
}
CGoUniverseAnimatedLogo.prototype.SetInverted = function(bValue)
{
	if (false === bValue)
		this.m_sStrokeStyle = "rgb(0, 0, 0)";
	else
		this.m_sStrokeStyle = "rgb(255, 255, 255)";
};
CGoUniverseAnimatedLogo.prototype.Start = function()
{
	var oCanvas  = this.m_oCanvas;
	var oContext = oCanvas.getContext("2d");

	var nW = oCanvas.width;
	var nH = oCanvas.height;

	var nRad = Math.min(nW, nH) * 0.4;

	oContext.clearRect(0, 0, nW, nH);

	oContext.lineWidth = 2;

	oContext.save();
	oContext.translate(nW / 2, nH / 2);

	if (this.m_nState < 100)
	{
		oContext.strokeStyle = this.m_sStrokeStyle;
		oContext.fillStyle   = "rgb(255, 255, 255)";
		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";

		oContext.beginPath();
		oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
		oContext.scale(1 - this.m_nState / 100, 1);
		oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

		oContext.stroke();
		oContext.fill();
	}
	else if (this.m_nState < 200)
	{
		oContext.strokeStyle = this.m_sStrokeStyle;
		oContext.fillStyle   = "rgb(0, 0, 0)";
		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(255, 255, 255)";

		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

		if (100 !== this.m_nState)
		{
			oContext.scale(this.m_nState / 100 - 1, 1);
			oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
		}
		else
		{
			oContext.closePath();
		}

		oContext.stroke();
		oContext.fill();
	}
	else if (this.m_nState < 300)
	{
		oContext.strokeStyle = this.m_sStrokeStyle;
		oContext.fillStyle   = "rgb(0, 0, 0)";
		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(255, 255, 255)";

		oContext.beginPath();
		oContext.arc(0, 0, nRad, 1.5 * Math.PI, 0.5 * Math.PI, false);
		oContext.scale(3 - this.m_nState / 100, 1);
		oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

		oContext.stroke();
		oContext.fill();
	}
	else if (this.m_nState < 400)
	{
		oContext.strokeStyle = this.m_sStrokeStyle;
		oContext.fillStyle   = "rgb(255, 255, 255)";
		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";

		oContext.beginPath();
		oContext.arc(0, 0, nRad, 0.5 * Math.PI, 1.5 * Math.PI, false);

		if (300 !== this.m_nState)
		{
			oContext.scale(this.m_nState / 100 - 3, 1);
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

	this.m_nState++;
	if (this.m_nState >= 400)
		this.m_nState = 0;

	var oThis = this;
	this.m_nTimerId = Common_RequestAnimationFrame(function()
	{
		oThis.Start();
	});
};
CGoUniverseAnimatedLogo.prototype.Stop = function()
{
	if (null !== this.m_nTimerId)
	{
		Common_CancelAnimationFrame(this.m_nTimerId);
		this.m_nTimerId = null;
		this.m_nState   = 0;
	}
};
CGoUniverseAnimatedLogo.prototype.Show = function()
{
	this.m_oCanvas.style.display = "block";
	this.Start();
};
CGoUniverseAnimatedLogo.prototype.Hide = function()
{
	this.m_oCanvas.style.display = "none";
	this.Stop();
};

/**
 * Convert string hh:mm:ss or mm:ss or ss into a seconds.
 * @param {string} sString
 * @return {number}
 */
function StringToSeconds(sString)
{
	var nPos1 = sString.indexOf(":");
	var nPos2 = sString.indexOf(":", nPos1 + 1);

	var sHours = "0", sMinutes = "0", sSeconds = "0";
	if (-1 === nPos1)
	{
		sSeconds = sString;
	}
	else if (-1 === nPos2)
	{
		sMinutes = sString.substr(0, nPos1);
		sSeconds = sString.substr(nPos1 + 1);
	}
	else
	{
		sHours   = sString.substr(0, nPos1);
		sMinutes = sString.substr(nPos1 + 1, nPos2 - nPos1 - 1);
		sSeconds = sString.substr(nPos2 + 1);
	}

	var nHours   = parseInt(sHours);
	var nMinutes = parseInt(sMinutes);
	var nSeconds = parseInt(sSeconds);

	if (isNaN(nHours))
		nHours = 0;

	if (isNaN(sMinutes))
		nMinutes = 0;

	if (isNaN(sSeconds))
		nSeconds = 0;

	return (nSeconds + 60 * nMinutes + 3600 * nHours);
}