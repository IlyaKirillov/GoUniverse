"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     20.08.2016
 * Time     8:24
 */

(function()
{
	var EPSILON = 1.0e-5;

	function CPoint(x, y)
	{
		this.x = undefined !== x ? x : 0;
		this.y = undefined !== y ? y : 0;
	}
	CPoint.prototype.Normalize = function()
	{
		var dNorma = Math.sqrt(this.x * this.x + this.y * this.y);
		if (dNorma < EPSILON)
			return;

		this.x /= dNorma;
		this.y /= dNorma;
	};
	function pointMinus(l, r)
	{
		return new CPoint(l.x - r.x, l.y - r.y);
	}
	function pointPlus(l, r)
	{
		return new CPoint(l.x + r.x, l.y + r.y);
	}
	function pointMult(p, k)
	{
		return new CPoint(p.x * k, p.y * k);
	}

	function CSegment()
	{
		this.points = [new CPoint(), new CPoint(), new CPoint(), new CPoint()];
	}

	function GetSpline(values)
	{
		var bezier = [];

		var n = values.length - 1;

		if (1 === n)
		{
			bezier[0]           = new CSegment();
			bezier[0].points[0] = bezier[0].points[1] = values[0];
			bezier[0].points[2] = bezier[0].points[3] = values[1];
			return bezier;
		}
		else if (0 === n)
		{
			bezier[0]           = new CSegment();
			bezier[0].points[0] = bezier[0].points[1] = values[0];
			bezier[0].points[2] = bezier[0].points[3] = values[0];
			return bezier;
		}
		else if (n < 0)
		{
			return [];
		}

		var tgL  = new CPoint();
		var tgR  = new CPoint();
		var cur  = new CPoint();
		var next = pointMinus(values[1], values[0]);
		next.Normalize();

		var l1, l2, tmp, x;

		--n;
		for (var i = 0; i < n; ++i)
		{
			bezier[i] = new CSegment();

			bezier[i].points[0] = bezier[i].points[1] = values[i];
			bezier[i].points[2] = bezier[i].points[3] = values[i + 1];

			cur  = next;
			next = pointMinus(values[i + 2], values[i + 1]);
			next.Normalize();

			tgL = tgR;

			tgR = pointPlus(cur, next);
			tgR.Normalize();

			if (Math.abs(values[i + 1].y - values[i].y) < EPSILON)
			{
				l1 = l2 = 0.0;
			}
			else
			{
				tmp = values[i + 1].x - values[i].x;
				l1  = Math.abs(tgL.x) > EPSILON ? tmp / (2.0 * tgL.x) : 1.0;
				l2  = Math.abs(tgR.x) > EPSILON ? tmp / (2.0 * tgR.x) : 1.0;
			}

			if (Math.abs(tgL.x) > EPSILON && Math.abs(tgR.x) > EPSILON)
			{
				tmp = tgL.y / tgL.x - tgR.y / tgR.x;
				if (Math.abs(tmp) > EPSILON)
				{
					x = (values[i + 1].y - tgR.y / tgR.x * values[i + 1].x - values[i].y + tgL.y / tgL.x * values[i].x) / tmp;
					if (x > values[i].x && x < values[i + 1].x)
					{
						if (tgL.y > 0.0)
						{
							if (l1 > l2)
								l1 = 0.0;
							else
								l2 = 0.0;
						}
						else
						{
							if (l1 < l2)
								l1 = 0.0;
							else
								l2 = 0.0;
						}
					}
				}
			}

			bezier[i].points[1] = pointPlus(bezier[i].points[1], pointMult(tgL, l1));
			bezier[i].points[2] = pointMinus(bezier[i].points[2], pointMult(tgR, l2));
		}

		l1 = Math.abs(tgL.x) > EPSILON ? (values[n + 1].x - values[n].x) / (2.0 * tgL.x) : 1.0;

		bezier[n] = new CSegment();
		bezier[n].points[0] = bezier[n].points[1] = values[n];
		bezier[n].points[2] = bezier[n].points[3] = values[n + 1];
		bezier[n].points[1] = pointPlus(bezier[n].points[1], pointMult(tgR, l1));

		return bezier;
	}

	window["GetSpline"] = GetSpline;
}());