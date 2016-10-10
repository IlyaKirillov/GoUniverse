"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     30.06.2016
 * Time     0:27
 */

function CGoUniverseTime()
{
	this.m_nSeconds    = 0;
	this.m_nCurSeconds = 0;

	this.m_nStartTime = 0;
	this.m_nTimerId   = null;

	this.m_fOnTick    = null;
	this.m_fOnEnd     = null;
}
CGoUniverseTime.prototype.SetHandler = function(fOnTick, fOnEnd)
{
	this.m_fOnTick = fOnTick;
	this.m_fOnEnd  = fOnEnd;
};
CGoUniverseTime.prototype.Start = function(s)
{
	this.m_nSeconds = s;

	if (null !== this.m_nTimerId)
		clearTimeout(this.m_nTimerId);

	this.m_nStartTime = new Date().getTime();

	var oThis = this;
	this.m_nTimerId = setTimeout(function(){oThis.private_Tick();}, 50);
};
CGoUniverseTime.prototype.private_Tick = function()
{
	if (null === this.m_nTimerId)
		return;

	var oThis = this;
	this.m_nTimerId = setTimeout(function(){oThis.private_Tick();}, 50);

	var nCurTime = new Date().getTime();

	var nDiffTime = (nCurTime - this.m_nStartTime) / 1000;

	this.m_nCurSeconds = this.m_nSeconds - nDiffTime;

	if (this.m_nCurSeconds < 0.1)
	{
		this.Stop();
		this.m_fOnEnd();
	}

	if (this.m_fOnTick)
		this.m_fOnTick(this.m_nCurSeconds);
};
CGoUniverseTime.prototype.Stop = function()
{
	if (null !== this.m_nTimerId)
		clearTimeout(this.m_nTimerId);

	this.m_nTimerId = null;
};
CGoUniverseTime.prototype.IsTick = function()
{
	return (this.m_nTimerId === null ? false : true);
};

var ETimeSettings = {
	None     : 0,
	Absolute : 1,
	ByoYomi  : 2,
	Canadian : 3
};
function CTimeSettings()
{
	this.m_nType         = ETimeSettings.None;
	this.m_nMainTime     = 0;
	this.m_nOverTime     = 0;
	this.m_nOverTimeCur  = 0;
	this.m_nOverCount    = 1;
	this.m_nOverCountCur = 1;
	this.m_oTimer        = new CGoUniverseTime();
	this.m_bEnd          = false;

	this.m_fOnTick = null;

	var oThis = this;
	this.m_oTimer.SetHandler(function(s)
	{
		oThis.private_OnTickTimer(s);
	}, function()
	{
		oThis.private_OnStopTimer();
	});
}
CTimeSettings.prototype.SetOnTick = function(fOnTick)
{
	this.m_fOnTick = fOnTick;
};
CTimeSettings.prototype.SetOnStop = function(fOnStop)
{
	this.m_fOnStop = fOnStop;
};
CTimeSettings.prototype.SetNone = function()
{
	this.m_nType      = ETimeSettings.None;
	this.m_nMainTime  = 0;
	this.m_nOverTime  = 0;
	this.m_nOverCount = 1;
};
CTimeSettings.prototype.SetAbsolute = function(nTime)
{
	this.m_nType     = ETimeSettings.Absolute;
	this.m_nMainTime = nTime ? nTime : 0;
};
CTimeSettings.prototype.SetByoYomi = function(nMainTime, nByoyomiTime, nByoyomiCount)
{
	this.m_nType         = ETimeSettings.ByoYomi;
	this.m_nMainTime     = nMainTime ? nMainTime : 0;
	this.m_nOverTime     = nByoyomiTime ? nByoyomiTime : 0;
	this.m_nOverCount    = nByoyomiCount ? nByoyomiCount : 1;
	this.m_nOverTimeCur  = this.m_nOverTime;
	this.m_nOverCountCur = this.m_nOverCount;
};
CTimeSettings.prototype.SetCanadian = function(nMainTime, nOverTime, nMovesCount)
{
	this.m_nType         = ETimeSettings.Canadian;
	this.m_nMainTime     = nMainTime ? nMainTime : 0;
	this.m_nOverTime     = nOverTime ? nOverTime : 0;
	this.m_nOverCount    = nMovesCount ? nMovesCount : 1;
	this.m_nOverTimeCur  = this.m_nOverTime;
	this.m_nOverCountCur = this.m_nOverCount;
};
CTimeSettings.prototype.CorrectMainTime = function(nTime)
{
	this.m_nMainTime = nTime;
};
CTimeSettings.prototype.CorrectOverTime = function(nOverTime, nOverCount)
{
	this.m_nOverTimeCur  = nOverTime;
	this.m_nOverCountCur = nOverCount;
};
CTimeSettings.prototype.Start = function()
{
	if (true === this.m_bEnd || this.m_oTimer.IsTick())
		return;

	if (this.m_fOnTick)
		this.m_fOnTick(this.ToString());

	switch (this.m_nType)
	{
	case ETimeSettings.None:
	{
		break;
	}
	case ETimeSettings.Absolute:
	{
		this.m_oTimer.Start(this.m_nMainTime);
		break;
	}
	case ETimeSettings.ByoYomi:
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
			this.m_oTimer.Start(this.m_nMainTime);
		else
			this.m_oTimer.Start(this.m_nOverTimeCur);
		break;
	}
	}
};
CTimeSettings.prototype.Stop = function(bEnd)
{
	if (true === this.m_bEnd)
		return;

	if (this.m_fOnTick)
		this.m_fOnTick(this.ToString());

	this.m_oTimer.Stop();

	if (true === bEnd)
		this.m_bEnd = true;
};
CTimeSettings.prototype.private_OnTickTimer = function(nSecondsLeft)
{
	switch (this.m_nType)
	{
	case ETimeSettings.Absolute:
	{
		this.m_nMainTime = Math.max(0, nSecondsLeft);

		if (this.m_fOnTick)
			this.m_fOnTick(this.private_SecondsToString(this.m_nMainTime) + " SD");

		break;
	}
	case ETimeSettings.ByoYomi:
	{

		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.private_SecondsToString(this.m_nMainTime));
		}
		else
		{
			this.m_nOverTimeCur = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.private_SecondsToString(nSecondsLeft) + " (" + this.m_nOverCountCur + ")");
		}

		break;
	}
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.private_SecondsToString(this.m_nMainTime));
		}
		else
		{
			this.m_nOverTimeCur = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.private_SecondsToString(nSecondsLeft) + "/" + this.m_nOverCountCur);
		}
		break;
	}
	}
};
CTimeSettings.prototype.private_OnStopTimer = function()
{
	switch (this.m_nType)
	{
	case ETimeSettings.Absolute:
	{
		this.m_nMainTime = 0;

		if (this.m_fOnStop)
			this.m_fOnStop();

		break;
	}
	case ETimeSettings.ByoYomi:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = 0;
			this.m_oTimer.Stop();
			this.m_oTimer.Start(this.m_nOverTime);
		}
		else
		{
			if (this.m_nOverCountCur > 1)
			{
				this.m_nOverCountCur--;
				this.m_oTimer.Stop();
				this.m_oTimer.Start(this.m_nOverTime);
			}
			else
			{
				if (this.m_fOnStop)
					this.m_fOnStop();
			}
		}

		break;
	}
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = 0;
			this.m_nOverTimeCur = this.m_nOverTime;
			this.m_oTimer.Stop();
			this.m_oTimer.Start(this.m_nOverTimeCur);
		}
		else
		{
			if (this.m_fOnStop)
				this.m_fOnStop();
		}
		break;
	}
	}
};
CTimeSettings.prototype.IsNone = function()
{
	return (this.m_nType === ETimeSettings.None ? true : false);
};
CTimeSettings.prototype.IsAbsolute = function()
{
	return (this.m_nType === ETimeSettings.Absolute ? true : false);
};
CTimeSettings.prototype.IsByoYomi = function()
{
	return (this.m_nType === ETimeSettings.ByoYomi ? true : false);
};
CTimeSettings.prototype.IsCanadian = function()
{
	return (this.m_nType === ETimeSettings.Canadian ? true : false);
};
CTimeSettings.prototype.private_SecondsToString = function(_seconds)
{
	var nHours    = Math.floor(_seconds / 3600);
	var nMinutes  = Math.floor((_seconds - (nHours * 3600)) / 60);
	var nSeconds  = Math.floor(_seconds - (nHours * 3600) - (nMinutes * 60));
	var nMSeconds = (_seconds - (nSeconds + (nHours * 3600) + (nMinutes * 60))) * 10 | 0;

	var sHours    = "" + nHours;
	var sMinutes  = (nHours > 0 && nMinutes < 10 ? "0" + nMinutes : "" + nMinutes);
	var sSeconds  = ((nHours > 0 || nMinutes > 0) && nSeconds < 10 ? "0" + nSeconds : "" + nSeconds);
	var sMSeconds = "" + nMSeconds;

	if (nHours > 0)
		return sHours + ':' + sMinutes + ':' + sSeconds + "." + sMSeconds;
	else if (nMinutes > 0)
		return sMinutes + ':' + sSeconds + "." + sMSeconds;
	else
		return sSeconds + "." + sMSeconds;
};
CTimeSettings.prototype.private_SecondsToString2 = function(_seconds)
{
	var nHours    = Math.floor(_seconds / 3600);
	var nMinutes  = Math.floor((_seconds - (nHours * 3600)) / 60);
	var nSeconds  = Math.floor(_seconds - (nHours * 3600) - (nMinutes * 60));
	var sHours    = "" + nHours;
	var sMinutes  = (nMinutes < 10 ? "0" + nMinutes : "" + nMinutes);
	var sSeconds  = (nSeconds < 10 ? "0" + nSeconds : "" + nSeconds);

	if (nHours > 0)
		return sHours + ':' + sMinutes + ':' + sSeconds;
	else
		return sMinutes + ':' + sSeconds;
};
CTimeSettings.prototype.private_SecondsToString3 = function(_seconds)
{
	var nMinutes  = Math.floor(_seconds / 60);
	var nSeconds  = Math.floor(_seconds - (nMinutes * 60));
	var sMinutes  = "" + nMinutes;
	var sSeconds  = (nSeconds < 10 ? "0" + nSeconds : "" + nSeconds);

	if (nMinutes > 0)
		return sMinutes + ':' + sSeconds;
	else
		return sSeconds;
};
CTimeSettings.prototype.ToString = function()
{
	switch (this.m_nType)
	{
	case ETimeSettings.None:
	{
		return "--:--";
		break;
	}
	case ETimeSettings.Absolute:
	{
		return (this.private_SecondsToString(this.m_nMainTime) + " SD");
		break;
	}
	case ETimeSettings.ByoYomi:
	{
		if (this.m_nMainTime > 0)
		{
			return this.private_SecondsToString(this.m_nMainTime);
		}
		else
		{
			return (this.private_SecondsToString(this.m_nOverTimeCur) + " (" + this.m_nOverCountCur + ")");
		}

		break;
	}
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
		{
			return this.private_SecondsToString(this.m_nMainTime);
		}
		else
		{
			return (this.private_SecondsToString(this.m_nOverTimeCur) + "/" + this.m_nOverCountCur);
		}
		break;
	}
	}

	return "--:--";
};
CTimeSettings.prototype.GetTimeSystemString = function()
{
	switch (this.m_nType)
	{
		case ETimeSettings.None:
		{
			return "no time limit";
		}
		case ETimeSettings.Absolute:
		{
			return this.private_SecondsToString2(this.m_nMainTime) + " absolute";
		}
		case ETimeSettings.ByoYomi:
		{
			return this.private_SecondsToString2(this.m_nMainTime) + ", " + (this.private_SecondsToString3(this.m_nOverTimeCur) + " (" + this.m_nOverCountCur + ")");
		}
		case ETimeSettings.Canadian:
		{
			return this.private_SecondsToString2(this.m_nMainTime) + ", " + (this.private_SecondsToString3(this.m_nOverTimeCur) + "/" + this.m_nOverCountCur);
		}
	}

	return "No time limit";
};
CTimeSettings.prototype.GetMainTimeString = function()
{
	return this.private_SecondsToString2(this.m_nMainTime);
};
CTimeSettings.prototype.GetByoYomiTimeString = function()
{
	return this.private_SecondsToString2(this.m_nOverTimeCur);
};
CTimeSettings.prototype.GetTypeInKGSString = function()
{
	return KGSCommon.TimeSystemToString(this);
};
CTimeSettings.prototype.GetMainTime = function()
{
	return this.m_nMainTime;
};
CTimeSettings.prototype.GetOverTime = function()
{
	return this.m_nOverTime;
};
CTimeSettings.prototype.GetOverCount = function()
{
	return this.m_nOverCount;
};
CTimeSettings.prototype.GetCurrentOverTime = function()
{
	return this.m_nOverTimeCur;
};
CTimeSettings.prototype.GetCurrentMainTime = function()
{
	return this.m_nMainTime;
};
CTimeSettings.prototype.IsCountDown = function()
{
	if ((this.IsAbsolute() && this.GetCurrentMainTime() < 60 + 0.05)
		|| (this.IsByoYomi() && this.GetCurrentMainTime() <= 0 && this.GetCurrentOverTime() < 10 + 0.05)
		|| (this.IsCanadian() && this.GetCurrentMainTime() <= 0 && this.GetCurrentOverTime() < 60 + 0.05))
			return true;

	return false;
};
CTimeSettings.prototype.GetCountDownTime = function()
{
	if (this.IsAbsolute())
		return this.GetCurrentMainTime();
	else if (this.IsByoYomi() || this.IsCanadian())
		return this.GetCurrentOverTime();

	return 0;
};
CTimeSettings.prototype.GetCountDownLimit = function()
{
	if (this.IsAbsolute() || this.IsCanadian())
		return 60;
	else (this.IsByoYomi())
		return 10;

	return 0;
};