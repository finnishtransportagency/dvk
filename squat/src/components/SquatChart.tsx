import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IonGrid, IonRow, IonCol, IonText } from '@ionic/react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import {
  calculateDraughtDuringTurn,
  calculateHeelDuringTurn,
  calculateSquatHG,
  calculateFroudeNumber,
  calculateSquatBarrass,
} from '../utils/calculations';
import './SquatChart.css';
import SquatDataTable from './SquatDataTable';
import { isEmbedded } from '../pages/Home';
import SquatHeader from './SquatHeader';
import { fieldParams } from '../hooks/squatReducer';

const NARROW_WIDTH = 600;
const WIDE_WIDTH = 1000;

interface SquatChartProps {
  wideChart?: boolean;
}

const SquatChart: React.FC<SquatChartProps> = ({ wideChart }) => {
  const { t } = useTranslation('', { keyPrefix: 'homePage.squatChart' });
  const ref = useRef<SVGSVGElement>(null);
  const { state } = useSquatContext();

  const [width, setWidth] = useState(wideChart ? WIDE_WIDTH : NARROW_WIDTH);
  const [huuskaGuliev20, setHuuskaGuliev20] = useState(Array<[number, number]>);
  const [huuskaGuliev24, setHuuskaGuliev24] = useState(Array<[number, number]>);
  const [barrass, setBarrass] = useState(Array<[number, number]>);

  useEffect(() => {
    if (ref?.current) {
      setWidth(ref.current.clientWidth);
      if (window.ResizeObserver) {
        new ResizeObserver(() => {
          if (ref?.current) {
            setWidth(ref.current.clientWidth);
          }
        }).observe(ref.current);
      }
    }
  }, []);

  useLayoutEffect(() => {
    const { showLimitedView: limitedView } = state.status;

    const lengthBPP = state.vessel.general.lengthBPP;
    const breadth = state.vessel.general.breadth;
    const draught = state.vessel.general.draught;
    const blockCoefficient = state.vessel.general.blockCoefficient;
    const KG = limitedView ? fieldParams.KG.default : state.vessel.stability.KG;
    const GM = limitedView ? fieldParams.GM.default : state.vessel.stability.GM;
    const KB = limitedView ? fieldParams.KB.default : state.vessel.stability.KB;
    const sweptDepth = state.environment.fairway.sweptDepth;
    const waterLevel = state.environment.fairway.waterLevel;
    const waterDepth = limitedView ? fieldParams.waterDepth.default : state.environment.fairway.waterDepth;
    const fairwayForm = state.environment.fairway.fairwayForm;
    const channelWidth = state.environment.fairway.channelWidth;
    const slopeScale = state.environment.fairway.slopeScale;
    const slopeHeight = state.environment.fairway.slopeHeight;
    const vesselSpeed = state.environment.vessel.vesselSpeed;
    const turningRadius = limitedView ? fieldParams.turningRadius.default : state.environment.vessel.turningRadius;
    const requiredUKC = state.environment.attribute.requiredUKC;
    const motionClearance = state.environment.attribute.motionClearance;

    const calculateHGSquat = (speed: number, C0Coefficient: number) => {
      const constantHeelDuringTurn = calculateHeelDuringTurn(vesselSpeed, turningRadius, KG, GM, KB);

      const correctedDraughtDuringTurn = calculateDraughtDuringTurn(breadth, draught, constantHeelDuringTurn);

      const [squatHG] = calculateSquatHG({
        lengthBPP,
        breadth,
        draught,
        blockCoefficient,
        sweptDepth,
        waterLevel,
        fairwayFormIndex: fairwayForm.id - 1,
        channelWidth,
        slopeScale,
        slopeHeight,
        vesselSpeed: speed,
        draughtDuringTurn: correctedDraughtDuringTurn,
        C0Coefficient,
      });

      return squatHG;
    };

    const calculateBarrassSquat = (speed: number) => {
      return calculateSquatBarrass(draught, blockCoefficient, sweptDepth, speed);
    };

    const buildGraph = () => {
      const height = Math.round(wideChart ? width / 2 : width / 1.2);
      const marginLeft = 50;
      const marginRight = 30;
      const marginTop = wideChart ? 30 : 60;
      const marginBottom = 50;

      const squatHG20Color = '#0000ff';
      const squatHG24Color = '#ff0000';
      const squatBarrassColor = '#BB00BB';

      const minSpeed = vesselSpeed > 5 ? vesselSpeed - 5 : 0;
      const maxSpeed = minSpeed + 10;

      const paramsValid = (() => {
        const isBetween = (value: number, min: number, max: number) => {
          return value >= min && value <= max;
        };
        if (lengthBPP <= 0) return false;
        if (breadth <= 0) return false;
        if (draught <= 0) return false;
        if (vesselSpeed < 0) return false;
        if (sweptDepth < draught) return false;
        if (state.status.showBarrass) return true;
        if (!isBetween(blockCoefficient, 0.6, 0.8)) return false;
        if (!isBetween(breadth / draught, 2.19, 3.5)) return false;
        if (!isBetween(lengthBPP / breadth, 5.5, 8.5)) return false;
        const fn = calculateFroudeNumber(vesselSpeed, sweptDepth, waterLevel);
        if (fn > 0.7) return false;
        return true;
      })();

      const yDomainSweptDepth = sweptDepth + waterLevel / 100 - draught;

      let yDomainWaterDepth = waterDepth - draught;

      if (Number.isNaN(yDomainWaterDepth) || yDomainWaterDepth < yDomainSweptDepth) {
        yDomainWaterDepth = yDomainSweptDepth;
      }

      const yDomainOtherMovementHeight = motionClearance;

      const bottomLayerHeightPx = 20;

      const xScale = d3
        .scaleLinear()
        .domain([minSpeed, maxSpeed])
        .range([0, width - marginLeft - marginRight]);
      // approximately halving the ticks which results to even numbers showing when on mobile
      const xAxisGenerator = wideChart ? d3.axisBottom(xScale) : d3.axisBottom(xScale).ticks(maxSpeed / 2);

      const yScale = d3
        .scaleLinear()
        .domain([0, yDomainWaterDepth])
        .range([0, height - marginTop - marginBottom - bottomLayerHeightPx]);
      // approximately halving the ticks which results to even numbers showing
      const yAxisTicks = yDomainWaterDepth === 0 ? 1 : yDomainWaterDepth / 2;
      const yAxisGenerator = wideChart ? d3.axisLeft(yScale) : d3.axisLeft(yScale).ticks(yAxisTicks);

      const svg = d3.select(ref.current);
      svg.attr('viewBox', `0 0 ${width} ${height}`);

      /* Clear svg */
      svg.selectAll('*').remove();

      if (!paramsValid) {
        const gsFilter = svg.append('filter').attr('id', 'grayscale');
        gsFilter.append('feColorMatrix').attr('type', 'matrix').attr('values', '0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 1 0');
      }

      const container = svg.append('g');

      if (!paramsValid) {
        container.attr('filter', 'url(#grayscale)');
      }

      /* Add chart layers */
      const addChartLayer = (attr: { y: number; height: number; fillColor: string; label: string; labelColor: string }) => {
        const layer = container.append('g').attr('transform', `translate(${marginLeft}, ${attr.y})`);
        layer
          .append('rect')
          .attr('width', width - marginLeft - marginRight)
          .attr('height', attr.height)
          .attr('fill', attr.fillColor);
        layer
          .append('line')
          .attr('stroke', '#000000')
          .attr('stroke-width', '.5')
          .attr('x1', 0)
          .attr('y1', attr.height)
          .attr('x2', width - marginLeft - marginRight)
          .attr('y2', attr.height);
        layer
          .append('text')
          .text(attr.label)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('x', (width - marginLeft - marginRight) / 2)
          .attr('y', attr.height / 2)
          .attr('font-size', wideChart ? '0.8em' : '0.6em')
          .attr('fill', attr.labelColor);
      };

      if (yDomainWaterDepth > 0 || yDomainSweptDepth > 0) {
        addChartLayer({
          y: marginTop + yScale(yDomainWaterDepth),
          height: 20,
          fillColor: '#000000',
          label: t('levels.bottom'),
          labelColor: '#ffffff',
        });
      }

      if (yDomainWaterDepth > yDomainSweptDepth) {
        addChartLayer({
          y: marginTop + yScale(yDomainSweptDepth),
          height: yScale(yDomainWaterDepth - yDomainSweptDepth),
          fillColor: '#ffcccc',
          label: t('levels.underSweptDepth'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth > 0) {
        const yDomainUKCh = Math.min(yDomainSweptDepth, requiredUKC);
        const yDomainUKCy = Math.max(0, yDomainSweptDepth - requiredUKC);
        addChartLayer({
          y: marginTop + yScale(yDomainUKCy),
          height: yScale(yDomainUKCh),
          fillColor: '#99ccff',
          label: t('levels.netUKC'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth - requiredUKC > 0) {
        const yDomainOMh = Math.min(yDomainOtherMovementHeight, yDomainSweptDepth - requiredUKC);
        const yDomainOMy = Math.max(0, yDomainSweptDepth - requiredUKC - yDomainOtherMovementHeight);
        addChartLayer({
          y: marginTop + yScale(yDomainOMy),
          height: yScale(yDomainOMh),
          fillColor: '#cc99ff',
          label: t('levels.otherMovement'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth - requiredUKC - yDomainOtherMovementHeight > 0) {
        addChartLayer({
          y: marginTop,
          height: yScale(yDomainSweptDepth - requiredUKC - yDomainOtherMovementHeight),
          fillColor: '#ccffff',
          label: t('levels.squat'),
          labelColor: '#000000',
        });
      }

      /* Add axis */
      xAxisGenerator.tickFormat(d3.format('.1f'));
      xAxisGenerator.tickSize(0 - (height - marginTop - marginBottom));
      const xAxis = container.append('g').call(xAxisGenerator);
      xAxis.attr('transform', `translate(${marginLeft}, ${height - marginBottom})`).attr('font-size', '12px');
      xAxis.select('.domain').remove();
      xAxis.selectAll('.tick line').attr('stroke-width', '.5');
      xAxis
        .selectAll('.tick')
        // eslint-disable-next-line
        .filter((elem: any) => {
          return elem === vesselSpeed;
        })
        .attr('font-weight', 'bold')
        .attr('font-style', 'italic');

      container
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
        .attr('y', height - 20)
        .text(`${t('xAxisLabel')}`);

      yAxisGenerator.tickFormat(d3.format('.1f'));
      const yAxis = container.append('g').call(yAxisGenerator);
      yAxis.attr('transform', `translate(${marginLeft}, ${marginTop})`).attr('font-size', '12px');

      container
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('x', -(marginTop + (height - marginTop - marginBottom) / 2))
        .attr('y', 15)
        .text(`${t('yAxisLabel')}`);

      /* Add legends */

      const addHGLegend = () => {
        const legend20 = container.append('g').attr('transform', `translate(${marginLeft}, 10)`);
        legend20.append('rect').attr('width', 10).attr('height', 10).attr('fill', squatHG20Color);
        legend20
          .append('text')
          .text(t('legends.squatHG20'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', 10 / 2)
          .attr('font-size', '12px')
          .attr('fill', '#000000');

        const box = legend20.node()?.getBBox();
        const legend20Width = box ? box.width : 0;

        const legend24 = container.append('g').attr('transform', `translate(${wideChart ? marginLeft + legend20Width + 15 : marginLeft}, 10)`);
        legend24
          .append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('y', wideChart ? 0 : 25)
          .attr('fill', squatHG24Color);
        legend24
          .append('text')
          .text(t('legends.squatHG24'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', wideChart ? 10 / 2 : 30)
          .attr('font-size', '12px')
          .attr('fill', '#000000');
      };

      const addBarrassLegend = () => {
        const legend = container.append('g').attr('transform', `translate(${marginLeft}, 10)`);
        legend
          .append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('y', wideChart ? 0 : 25)
          .attr('fill', squatBarrassColor);
        legend
          .append('text')
          .text(t('legends.squatBarrass'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', wideChart ? 10 / 2 : 30)
          .attr('font-size', '12px')
          .attr('fill', '#000000');
      };

      /* Add squat lines */

      const addSquatLine = (calculateSquat: (speed: number) => number, color: string) => {
        const data: Array<[number, number]> = [];

        for (let i = minSpeed, step = 0.1; i < maxSpeed; i += step) {
          const squat = calculateSquat(i);
          if (squat >= yDomainWaterDepth) {
            i -= step;
            step /= 10;
            if (step < 0.0005) {
              data.push([i, squat]);
              break;
            }
          } else {
            data.push([i, squat]);
          }
        }
        if (data[data.length - 1][1] < yDomainWaterDepth) {
          const maxSpeedSquat = calculateSquat(maxSpeed);
          if (maxSpeedSquat < yDomainWaterDepth) {
            data.push([maxSpeed, maxSpeedSquat]);
          } else {
            for (let i = data[data.length - 1][0] + 0.001; i < maxSpeed; i += 0.001) {
              const squat = calculateSquat(i);
              if (squat >= yDomainWaterDepth) {
                data.push([i, squat]);
                break;
              }
            }
          }
        }

        container
          .append('path')
          .datum(data)
          .attr(
            'd',
            d3
              .line()
              .x((d) => {
                return xScale(d[0]);
              })
              .y((d) => {
                return yScale(d[1]);
              })
          )
          .attr('transform', `translate(${marginLeft}, ${marginTop})`)
          .attr('stroke', color)
          .attr('stroke-width', '2px')
          .attr('fill', 'none');
        return data;
      };

      if (state.status.showBarrass) {
        addBarrassLegend();
        if (paramsValid) {
          setBarrass(addSquatLine(calculateBarrassSquat, squatBarrassColor));
        }
      } else {
        addHGLegend();
        if (paramsValid) {
          const getHGSquatFunc = (C0Coefficient: number) => {
            return (speed: number) => {
              return calculateHGSquat(speed, C0Coefficient);
            };
          };

          setHuuskaGuliev20(addSquatLine(getHGSquatFunc(2.0), squatHG20Color));
          setHuuskaGuliev24(addSquatLine(getHGSquatFunc(2.4), squatHG24Color));
        }
      }
    };
    if (width > 300) {
      buildGraph();
    }
  }, [state, width, t, wideChart]);

  return (
    <>
      <IonGrid className="squatChartGrid" aria-hidden="true">
        <IonRow>
          <IonCol>
            <IonText className="squatChartTitle">
              <SquatHeader level={3} text={t('heading')} embedded={isEmbedded()}></SquatHeader>
            </IonText>
          </IonCol>
        </IonRow>
        <IonRow className="squatChartRow">
          <IonCol>
            <svg ref={ref} viewBox={`0 0 ${wideChart ? WIDE_WIDTH : NARROW_WIDTH} 500`} width="100%" />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid className="squatDataGrid" aria-hidden="true">
        <IonRow className="squatDataRow wideRow">
          <IonCol>
            <SquatDataTable huuskaGuliev20={huuskaGuliev20} huuskaGuliev24={huuskaGuliev24} barrass={barrass} />
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default SquatChart;
