import { FeatureLike } from 'ol/Feature';
import { Fill, Stroke } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Style from 'ol/style/Style';
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

export const getSafetyEquipmentStyle = (feature: FeatureLike) => {
  return new Style({
    image: new CircleStyle({
      radius: 8,
      stroke: new Stroke({
        color: 'black',
      }),
      fill: new Fill({
        color: 'rgba(0,0,0,0)',
      }),
    }),
  });
};
