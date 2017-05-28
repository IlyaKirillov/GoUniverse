"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 24.05.2017
 * Time: 16:29
 */

window.onload = OnDocumentReady;

var oGame1 = null;
var oGame2 = null;
var oGame3 = null;
var oGame4 = null;
var oGame5 = null;

function OnDocumentReady()
{
	$('#booklet').turn({gradients: true, height : 582, width : 920});
	$('#booklet').turn("resize");

	$("#booklet").bind("turned", function(event, page, view)
	{
		if (!oGame1 && (6 === page || 7 === page))
		{
			oGame1 = GoBoardApi.Embed("bookGame1", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;EV[The Future of Go Summit, Match 1]RD[2017-05-23]PB[Ke Jie]BR[9 Dan]PW[AlphaGo]KM[7.5]SZ[19]; B[qd];W[pp];B[cc];W[cp];B[nc];W[fp];B[qq];W[pq];B[qp];W[qn];B[qo];W[po];B[rn];W[qr];B[rr];W[rm];B[pr];W[or];B[pn];W[qm];B[qs];W[on];B[dj];W[nk];B[ph];W[ch];B[cf];W[eh];B[ci];W[de];B[df];W[dc];B[cd];W[dd];B[ef];W[di];B[ei];W[dh];B[cj];W[ce];B[be];W[bf];B[bg];W[bd];B[af];W[bc];B[fi];W[cm];B[hq];W[ek];B[fh];W[gq];B[hp];W[ej];B[eq];W[gr];B[cq];W[dp];B[dq];W[ep];B[bp];W[bh];B[ah];W[bo];B[bq];W[fg];B[gg];W[kp];B[ko];W[jo];B[jn];W[in];B[jp];W[io];B[lp];W[kq];B[lq];W[kr];B[lr];W[ir];B[kn];W[il];B[oq];W[pf];B[nh];W[rf];B[od];W[qi];B[qg];W[rd];B[qf];W[qe];B[pe];W[re];B[qc];W[rg];B[kh];W[ic];B[gc];W[kc];B[jd];W[id];B[ge];W[hb];B[gb];W[jf];B[je];W[ie];B[ld];W[hg];B[eg];W[lc];B[le];W[hf];B[qh];W[rh];B[pi];W[qj];B[gk];W[fd];B[gd];W[lf];B[mf];W[lg];B[gm];W[gn];B[fn];W[go];B[dl];W[mo];B[oo];W[pm];B[op];W[mg];B[nf];W[lo];B[nn];W[lm];B[pn];W[dk];B[ck];W[cl];B[el];W[bk];B[bi];W[li];B[ii];W[ds];B[dr];W[hi];B[ik];W[jk];B[ij];W[md];B[mc];W[ke];B[me];W[kd];B[om];W[ls];B[ms];W[ks];B[nr];W[ng];B[og];W[es];B[cs];W[fr];B[er];W[fs];B[bs];W[hl];B[pl];W[ql];B[rc];W[ro];B[rp];W[sn];B[hm];W[im];B[kk];W[kj];B[lk];W[jl];B[mj];W[mi];B[nj];W[pk];B[fm];W[cn];B[ol];W[ok];B[ni];W[ih];B[ji];W[mb];B[nb];W[lb];B[fe];W[cb];B[mp];W[mm];B[eb];W[na];B[oa];W[ma];B[qb];W[bj];B[ai];W[aj];B[ag];W[gl];B[fk];W[bl];B[kg];W[kf];B[ib];W[jb];B[ga];W[ha];B[ed];W[ec];B[fc];W[gf];B[ff];W[gj];B[hk];W[hh];B[fj];W[no];B[fq];W[hr];B[kl];W[km];B[mn];W[ln];B[nl];W[db];B[da];W[ca];B[ea];W[np];B[nq];W[oj];B[oi];W[en];B[em];W[eo];B[dm];W[dn];B[sp];W[so];B[hn];W[ho];B[hc];W[ia];B[ao];W[an];B[ap];W[sc];B[sb];W[sd];B[jg];W[ad];B[gh];W[ae];B[ee];W[ml];B[mk];W[pj];B[bf];W[nm];B[on];W[he];B[ig];W[ki];B[jh];W[fl];B[jj];W[fo];B[hj];W[gi];B[ll];W[jm];B[lh];W[mh];B[lj];W[if];B[hd];)",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame1, false);
			GoBoardApi.Update_Size(oGame1);
		}

		if (!oGame2 && (8 === page || 9 === page))
		{
			oGame2 = GoBoardApi.Embed("bookGame2", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;EV[The Future of Go Summit, Match 2]RD[2017-05-25]PB[AlphaGo]BR[9 Dan]PW[Ke Jie]KM[7.5]SZ[19]RE[B+R];B[qp];W[pd];B[cq];W[cd];B[ec];W[oq];B[pn];W[df];B[nc];W[qf];B[pc];W[qc];B[qb];W[oc];B[pb];W[od];B[ob];W[rc];B[nd];W[mb];B[lc];W[lb];B[qd];W[rd];B[jc];W[mc];B[pe];W[oe];B[ld];W[kp];B[iq];W[fp];B[dn];W[io];B[ch];W[cl];B[eh];W[cg];B[bg];W[bf];B[fn];W[em];B[en];W[ek];B[kq];W[lq];B[lp];W[jq];B[kr];W[jp];B[jr];W[mq];B[ip];W[ho];B[gp];W[dq];B[go];W[cp];B[lo];W[kn];B[ln];W[km];B[dp];W[hp];B[hq];W[gq];B[gr];W[fq];B[hn];W[jo];B[fr];W[do];B[co];W[ep];B[bp];W[md];B[ne];W[of];B[lm];W[le];B[kl];W[jl];B[gl];W[kk];B[ll];W[jk];B[mj];W[gj];B[pq];W[pr];B[qr];W[po];B[qo];W[on];B[op];W[np];B[pm];W[om];B[no];W[bo];B[dp];W[oo];B[pp];W[cp];B[cn];W[nl];B[lk];W[mo];B[pl];W[nj];B[ni];W[ok];B[nf];W[mi];B[li];W[mh];B[og];W[pf];B[ki];W[ij];B[lg];W[nh];B[oi];W[oh];B[pj];W[ph];B[pk];W[bq];B[dp];W[jg];B[kg];W[cp];B[jn];W[in];B[dp];W[fo];B[cp];W[gn];B[ke];W[me];B[jf];W[jb];B[ic];W[ib];B[er];W[hc];B[cc];W[bc];B[dd];W[cb];B[ce];W[dc];B[cf];W[dg];B[be])",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame2, false);
			GoBoardApi.Update_Size(oGame2);
		}

		if (!oGame3 && (10 === page || 11 === page))
		{
			oGame3 = GoBoardApi.Embed("bookGame3", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;EV[The Future of Go Summit, Pair Go]RD[2017-05-26];PB[Gu Li + AlphaGo]PW[Lian Xiao + AlphaGo]SZ[19]KM[7.5];B[pd];W[cc];B[qp];W[dq];B[co];W[oq];B[pq];W[op];B[pn];W[kp];B[ep];W[fq];B[eq];W[er];B[dp];W[cq];B[dr];W[cr];B[fr];W[ds];B[gq];W[pf];B[hn];W[nc];B[nd];W[md];B[ne];W[oc];B[pe];W[qj];B[mr];W[mq];B[lq];W[pr];B[mp];W[mo];B[lp];W[pp];B[qq];W[qo];B[po];W[qn];B[qm];W[rm];B[pm];W[rp];B[rq];W[ro];B[qr];W[or];B[rl];W[qs];B[sr];W[rs];B[sm];W[rr];B[rn];W[sq];B[lo];W[qb];B[qh];W[di];B[dd];W[dc];B[fd];W[de];B[qf];W[lj];B[kd];W[jj];B[lb];W[lc];B[kc];W[mb];B[mj];W[li];B[mi];W[mk];B[mh];W[jm];B[kl];W[jl];B[ml];W[ed];B[fe];W[hc];B[gc];W[hd];B[hf];W[gf];B[ee];W[cd];B[gg];W[ge];B[fg];W[hg];B[eg];W[hh];B[if];W[je];B[jf];W[ke];B[hi];W[gh];B[ei];W[gi];B[gj];W[fj];B[ej];W[fk];B[cf];W[hb];B[jh];W[le];B[lh];W[ii];B[ek];W[fl];B[hl];W[go];B[gn];W[el];B[dl];W[dm];B[cm];W[df];B[dg];W[fo];B[fn];W[ll];B[lm];W[en];B[dn];W[em];B[eo];W[ho];B[io];W[hp];B[ip];W[hq];B[fp];W[in];B[hr];W[cl];B[dk];W[iq];B[jn];W[im];B[jq];W[jo];B[jp];W[hm];B[ir];W[bi];B[bh];W[ch];B[cg];W[bm];B[cn];W[ck];B[bj];W[cj];B[ai];W[bk];B[ci];W[rf];B[dh];W[qg];B[qe];W[pg];B[rh];W[rg];B[ng];W[rd];B[ph];W[bp];B[re];W[se];B[eb];W[lk];B[nk];W[bn];B[bo];W[ao];B[cp];W[bq];B[db];W[ec];B[gb];W[cb];B[ce];W[be];B[bf];W[fc];B[gd];W[fb];B[fa];W[ha];B[ga];W[ae];B[id];W[ie];B[he];W[ic];B[km];W[kn];B[kk];W[kj];B[mn];W[gm];B[gp];W[sf];B[jd];W[jb];B[hj];W[hk];B[ld];W[mc];B[ik];W[jk])",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame3, false);
			GoBoardApi.Update_Size(oGame3);
		}

		if (!oGame4 && (12 === page || 13 === page))
		{
			oGame4 = GoBoardApi.Embed("bookGame4", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;EV[The Future of Go Summit, Team Go]RD[2017-05-26];PB[Chen Yaoye, Zhou Ruiyang, Mi Yuting, Shi Yue, Tang Weixing]PW[AlphaGo]SZ[19]KM[7.5];B[pd];W[dd];B[qp];W[dp];B[fq];W[oq];B[cn];W[dn];B[dm];W[en];B[cp];W[cq];B[co];W[dq];B[gp];W[po];B[qo];W[pn];B[qm];W[iq];B[ip];W[jp];B[jq];W[kq];B[jr];W[hq];B[io];W[kr];B[gn];W[do];B[dl];W[fm];B[ci];W[ej];B[di];W[hl];B[il];W[hk];B[im];W[kp];B[jj];W[qc];B[pc];W[qd];B[qf];W[qe];B[pe];W[rf];B[fc];W[hc];B[fe];W[db];B[jc];W[hh];B[eb];W[ce];B[hf];W[if];B[ie];W[id];B[ig];W[jd];B[jf];W[lc];B[rg];W[qg];B[pf];W[rh];B[cb];W[da];B[dc];W[cc];B[ec];W[bb];B[ea];W[ca];B[jb];W[nc];B[ia];W[mf];B[pg];W[sg];B[mh];W[ng];B[qh];W[nh];B[rg];W[qi];B[pi];W[qg];B[ph];W[mi];B[rg];W[ke];B[re];W[qg];B[ba];W[aa];B[rg];W[qn];B[rn];W[qg];B[ne];W[me];B[rg];W[rm];B[rl];W[qg];B[pq];W[pr];B[rg];W[pm];B[sm];W[qg];B[op];W[pp];B[qq];W[nq];B[rg];W[pb];B[ob];W[qg];B[or];W[nr];B[rg];W[qb];B[oc];W[qg];B[fl];W[gm];B[rg];W[cm];B[sf];W[cl];B[ck];W[bn];B[bk];W[bm];B[pl];W[kh];B[om];W[ji];B[li];W[lh];B[mj];W[ni];B[df];W[cf];B[dg];W[oo];B[nj];W[rd];B[pa];W[nb];B[oa];W[gb];B[lb];W[kc];B[ek];W[qr];B[rr];W[lm];B[kl];W[oj];B[oi];W[nl];B[ml];W[nm];B[no];W[np];B[on];W[op];B[ol];W[nk];B[lj];W[nn];B[ok];W[ha];B[mb];W[kb];B[mc];W[md];B[nd];W[la];B[na];W[rs];B[rq];W[bh];B[gj];W[gi];B[fi];W[fh];B[ei];W[hj];B[ln];W[kn];B[mm];W[mn];B[lo];W[mo];B[km];W[er];B[fr];W[lp];B[ll];W[jn];B[hm];W[bi];B[fg];W[gk];B[fj];W[bj];B[ka];W[ja];B[eh];W[cj];B[dj];W[al];B[ka];W[ib];B[ma];W[ic];B[gh];W[hi];B[ak];W[aj];B[ki];W[jh];B[kf];W[lf];B[fo];W[in];B[hn];W[hg];B[gg];W[ir];B[dk];W[bl];B[fs];W[mk];B[lk];W[hp];B[ho];W[gd];B[de];W[ed];B[fd];W[ge];B[gf];W[ee];B[ef];W[cd];B[br];W[bp];)",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame4, false);
			GoBoardApi.Update_Size(oGame4);
		}

		if (!oGame5 && (14 === page || 15 === page))
		{
			oGame5 = GoBoardApi.Embed("bookGame5", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;EV[The Future of Go Summit, Match 3]RD[2017-05-27]PB[AlphaGo]WR[9 Dan]PW[Ke Jie]KM[7.5]SZ[19]RE[B+R];B[pp];W[dp];B[pc];W[dd];B[fq];W[cn];B[qh];W[qn];B[qo];W[pn];B[np];W[pk];B[qj];W[eq];B[fp];W[jq];B[lq];W[hq];B[fm];W[nr];B[dm];W[dn];B[en];W[el];B[em];W[bl];B[ck];W[qq];B[pq];W[pr];B[nq];W[pd];B[oc];W[oi];B[rq];W[pg];B[qd];W[qg];B[fr];W[go];B[cq];W[cl];B[dl];W[dk];B[cj];W[dj];B[di];W[fj];B[ch];W[cp];B[dq];W[bi];B[ci];W[ep];B[er];W[bq];B[br];W[hm];B[gi];W[gj];B[hj];W[fi];B[ej];W[rr];B[rp];W[lr];B[kr];W[mr];B[kq];W[jr];B[js];W[or];B[ko];W[jn];B[kn];W[jm];B[ll];W[rm];B[om];W[on];B[nm];W[nn];B[mn];W[qe];B[pe];W[rd];B[od];W[rf];B[gk];W[fk];B[gl];W[kl];B[lk];W[kk];B[gh];W[lj];B[mj];W[kj];B[fc];W[cf];B[db];W[cc];B[fe];W[gd];B[fd];W[cb];B[df];W[gg];B[fh];W[ef];B[de];W[ce];B[jd];W[lc];B[ld];W[gc];B[fb];W[kd];B[ke];W[kc];B[ic];W[le];B[md];W[je];B[kf];W[jf];B[jg];W[kg];B[lf];W[ig];B[jh];W[ih];B[ge];W[he];B[hd];W[ie];B[jc];W[hc];B[hb];W[id];B[gb];W[mo];B[lm];W[no];B[lo];W[nk];B[ir];W[iq];B[hr];W[qb];B[qc];W[rb];B[ql];W[pl];B[pm];W[qm];B[rl];W[ri];B[qk];W[qi];B[rc];W[sc];B[cm];W[bm];B[eo];W[bp];B[rn];W[sm];B[sr];W[ls];B[ks];W[sn];B[rs];W[qr];B[ro];W[qs];B[bk];W[ar];B[cr];W[an];B[mf];W[kh];B[cg];W[pb];B[ob];W[bg];B[bh];W[bf];B[oh];W[ph];B[ni];W[oj];B[ik];W[fg];B[ji];W[ii];B[jj];W[hi];B[il];W[eh];B[ek];W[mh];B[mi];W[ij];B[jk];W[nh];B[li];W[hk];B[hl])",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame5, false);
			GoBoardApi.Update_Size(oGame5);
		}
	});

	document.getElementById("contentsAboutId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 4);
	}, false);
	document.getElementById("contentsMatchesId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 4);
	}, false);
	document.getElementById("contentsGame1Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 6);
	}, false);
	document.getElementById("contentsGame2Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 8);
	}, false);
	document.getElementById("contentsGame3Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 10);
	}, false);
	document.getElementById("contentsGame4Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 12);
	}, false);
	document.getElementById("contentsGame5Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 14);
	}, false);
	document.getElementById("contentsParticipantsId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 16);
	}, false);
	document.getElementById("contentsAlphaGoId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 18);
	}, false);
	document.getElementById("contentsKeJieId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 18);
	}, false);
	document.getElementById("contentsGuLiId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 20);
	}, false);
	document.getElementById("contentsLianXiaoId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 20);
	}, false);
	document.getElementById("contentsChenYaoyeId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 22);
	}, false);
	document.getElementById("contentsZhouRuiyangId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 22);
	}, false);
	document.getElementById("contentsMiYutingId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 24);
	}, false);
	document.getElementById("contentsShiYueId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 24);
	}, false);
	document.getElementById("contentsTangWeixingId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 26);
	}, false);
}