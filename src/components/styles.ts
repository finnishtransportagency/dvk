import { Fill, Icon, Style } from 'ol/style';
import a from '../theme/img/safetyequipment/a.svg';
import b from '../theme/img/safetyequipment/b.svg';
import c from '../theme/img/safetyequipment/c.svg';
import d from '../theme/img/safetyequipment/d.svg';
import e from '../theme/img/safetyequipment/e.svg';
import f from '../theme/img/safetyequipment/f.svg';
import g from '../theme/img/safetyequipment/g.svg';
import h from '../theme/img/safetyequipment/h.svg';
import i from '../theme/img/safetyequipment/i.svg';
import j from '../theme/img/safetyequipment/j.svg';
import k from '../theme/img/safetyequipment/k.svg';
import l from '../theme/img/safetyequipment/l.svg';
import m from '../theme/img/safetyequipment/m.svg';
import n from '../theme/img/safetyequipment/n.svg';
import o from '../theme/img/safetyequipment/o.svg';
import p from '../theme/img/safetyequipment/p.svg';
import q from '../theme/img/safetyequipment/q.svg';
import r from '../theme/img/safetyequipment/r.svg';
import s from '../theme/img/safetyequipment/s.svg';
import t from '../theme/img/safetyequipment/t.svg';
import u from '../theme/img/safetyequipment/u.svg';
import v from '../theme/img/safetyequipment/v.svg';
import w from '../theme/img/safetyequipment/w.svg';
import n1 from '../theme/img/safetyequipment/1.svg';
import n2 from '../theme/img/safetyequipment/2.svg';
import n3 from '../theme/img/safetyequipment/3.svg';
import n4 from '../theme/img/safetyequipment/4.svg';
import n5 from '../theme/img/safetyequipment/5.svg';
import n6 from '../theme/img/safetyequipment/6.svg';
import n7 from '../theme/img/safetyequipment/7.svg';
import n8 from '../theme/img/safetyequipment/8.svg';
import n9 from '../theme/img/safetyequipment/9.svg';
import n0 from '../theme/img/safetyequipment/0.svg';
import questionmark from '../theme/img/safetyequipment/questionmark.svg';
import A from '../theme/img/safetyequipment/big/A.svg';
import B from '../theme/img/safetyequipment/big/B.svg';
import C from '../theme/img/safetyequipment/big/C.svg';
import D from '../theme/img/safetyequipment/big/D.svg';
import E from '../theme/img/safetyequipment/big/E.svg';
import F from '../theme/img/safetyequipment/big/F.svg';
import G from '../theme/img/safetyequipment/big/G.svg';
import H from '../theme/img/safetyequipment/big/H.svg';
import I from '../theme/img/safetyequipment/big/I.svg';
import J from '../theme/img/safetyequipment/big/J.svg';
import K from '../theme/img/safetyequipment/big/K.svg';
import L from '../theme/img/safetyequipment/big/L.svg';
import M from '../theme/img/safetyequipment/big/M.svg';
import N from '../theme/img/safetyequipment/big/N.svg';
import O from '../theme/img/safetyequipment/big/O.svg';
import P from '../theme/img/safetyequipment/big/P.svg';
import Q from '../theme/img/safetyequipment/big/Q.svg';
import R from '../theme/img/safetyequipment/big/R.svg';
import S from '../theme/img/safetyequipment/big/S.svg';
import T from '../theme/img/safetyequipment/big/T.svg';
import U from '../theme/img/safetyequipment/big/U.svg';
import V from '../theme/img/safetyequipment/big/V.svg';
import W from '../theme/img/safetyequipment/big/W.svg';
import X from '../theme/img/safetyequipment/big/X.svg';
import CircleStyle from 'ol/style/Circle';

const symbol2Icon = {
  a: { icon: a, center: false },
  b: { icon: b, center: false },
  c: { icon: c, center: false },
  d: { icon: d, center: false },
  e: { icon: e, center: false },
  f: { icon: f, center: false },
  g: { icon: g, center: false },
  h: { icon: h, center: false },
  i: { icon: i, center: false },
  j: { icon: j, center: false },
  k: { icon: k, center: false },
  l: { icon: l, center: false },
  m: { icon: m, center: false },
  n: { icon: n, center: false },
  o: { icon: o, center: false },
  p: { icon: p, center: false },
  q: { icon: q, center: false },
  r: { icon: r, center: false },
  s: { icon: s, center: false },
  t: { icon: t, center: true },
  u: { icon: u, center: false },
  v: { icon: v, center: false },
  w: { icon: w, center: true },
  A: { icon: A, center: false },
  B: { icon: B, center: false },
  C: { icon: C, center: false },
  D: { icon: D, center: false },
  E: { icon: E, center: false },
  F: { icon: F, center: false },
  G: { icon: G, center: false },
  H: { icon: H, center: false },
  I: { icon: I, center: false },
  J: { icon: J, center: false },
  K: { icon: K, center: false },
  L: { icon: L, center: false },
  M: { icon: M, center: false },
  N: { icon: N, center: false },
  O: { icon: O, center: false },
  P: { icon: P, center: false },
  Q: { icon: Q, center: false },
  R: { icon: R, center: false },
  S: { icon: S, center: false },
  T: { icon: T, center: false },
  U: { icon: U, center: false },
  V: { icon: V, center: false },
  W: { icon: W, center: false },
  X: { icon: X, center: false },
  Y: { icon: questionmark, center: true },
  '1': { icon: n1, center: true },
  '2': { icon: n2, center: false },
  '3': { icon: n3, center: false },
  '4': { icon: n4, center: false },
  '5': { icon: n5, center: false },
  '6': { icon: n6, center: false },
  '7': { icon: n7, center: false },
  '8': { icon: n8, center: false },
  '9': { icon: n9, center: false },
  '0': { icon: n0, center: false },
  '?': { icon: questionmark, center: true },
};

export const getSafetyEquipmentStyle = (symbol: string) => {
  const key = symbol as keyof typeof symbol2Icon;
  const opts = symbol2Icon[key];
  const icon = opts?.icon || symbol2Icon['?'].icon;
  const center = opts ? opts.center : true;
  let image: Icon;
  if (center) {
    image = new Icon({
      src: icon,
    });
  } else {
    image = new Icon({
      src: icon,
      anchor: [0.5, 24],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
    });
  }
  return [
    new Style({
      image,
    }),
    new Style({
      image: new CircleStyle({
        radius: 10,
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
      }),
    }),
  ];
};
