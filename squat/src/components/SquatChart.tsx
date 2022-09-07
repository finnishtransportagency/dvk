import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IonGrid, IonRow, IonCol } from '@ionic/react';
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

const SquatChart: React.FC = () => {
  const { t } = useTranslation();
  const ref = useRef<SVGSVGElement>(null);
  const { state } = useSquatContext();
  const [width, setWidth] = useState(1000);

  useEffect(() => {
    const handleResize = () => {
      let resize = true;
      return () => {
        if (resize) {
          resize = false;
          setTimeout(() => {
            resize = true;
            if (ref != null && ref.current != null) {
              setWidth(ref.current.clientWidth);
            }
          }, 500);
        }
      };
    };
    window.addEventListener('resize', handleResize());
    if (ref != null && ref.current != null) {
      setWidth(ref.current.clientWidth);
    }
  }, []);

  useLayoutEffect(() => {
    const calculateHGSquat = (speed: number, C0Coefficient: number) => {
      const constantHeelDuringTurn = calculateHeelDuringTurn(
        state.environment.vessel.vesselSpeed,
        state.environment.vessel.turningRadius,
        state.vessel.stability.KG,
        state.vessel.stability.GM,
        state.vessel.stability.KB
      );

      const correctedDraughtDuringTurn = calculateDraughtDuringTurn(
        state.vessel.general.breadth,
        state.vessel.general.draught,
        constantHeelDuringTurn
      );

      const [squatHG] = calculateSquatHG(
        state.vessel.general.lengthBPP,
        state.vessel.general.breadth,
        state.vessel.general.draught,
        state.vessel.general.blockCoefficient,
        state.environment.fairway.sweptDepth,
        state.environment.fairway.waterLevel,
        state.environment.fairway.fairwayForm.id - 1,
        state.environment.fairway.channelWidth,
        state.environment.fairway.slopeScale,
        state.environment.fairway.slopeHeight,
        speed,
        correctedDraughtDuringTurn,
        C0Coefficient
      );

      return squatHG;
    };

    const calculateBarrassSquat = (speed: number) => {
      return calculateSquatBarrass(state.vessel.general.draught, state.vessel.general.blockCoefficient, state.environment.fairway.sweptDepth, speed);
    };

    const buildGraph = () => {
      const height = Math.round(width / 2);
      const marginLeft = 50;
      const marginRight = 30;
      const marginTop = 30;
      const marginBottom = 50;

      const squatHG20Color = '#0000ff';
      const squatHG24Color = '#ff0000';
      const squatBarrassColor = '#ffa500';

      const minSpeed = state.environment.vessel.vesselSpeed > 5 ? state.environment.vessel.vesselSpeed - 5 : 0;
      const maxSpeed = minSpeed + 10;

      const paramsValid = (() => {
        const isBetween = (value: number, min: number, max: number) => {
          return value >= min && value <= max;
        };
        if (state.vessel.general.lengthBPP <= 0) return false;
        if (state.vessel.general.breadth <= 0) return false;
        if (state.vessel.general.draught <= 0) return false;
        if (state.environment.vessel.vesselSpeed < 0) return false;
        if (state.environment.fairway.sweptDepth <= state.vessel.general.draught) return false;
        if (state.status.showBarrass) return true;
        if (!isBetween(state.vessel.general.blockCoefficient, 0.6, 0.8)) return false;
        if (!isBetween(state.vessel.general.breadth / state.vessel.general.draught, 2.19, 3.5)) return false;
        if (!isBetween(state.vessel.general.lengthBPP / state.vessel.general.breadth, 5.5, 8.5)) return false;
        const fn = calculateFroudeNumber(
          state.environment.vessel.vesselSpeed,
          state.environment.fairway.sweptDepth,
          state.environment.fairway.waterLevel
        );
        if (fn > 0.7) return false;
        return true;
      })();

      const yDomainSweptDepth = state.environment.fairway.sweptDepth + state.environment.fairway.waterLevel / 100 - state.vessel.general.draught;

      let yDomainWaterDepth = state.environment.fairway.waterDepth - state.vessel.general.draught;

      if (Number.isNaN(yDomainWaterDepth) || yDomainWaterDepth < yDomainSweptDepth) {
        yDomainWaterDepth = yDomainSweptDepth;
      }

      const yDomainOtherMovementHeight = state.environment.attribute.motionClearance;

      const bottomLayerHeightPx = 20;

      const xScale = d3
        .scaleLinear()
        .domain([minSpeed, maxSpeed])
        .range([0, width - marginLeft - marginRight]);
      const xAxisGenerator = d3.axisBottom(xScale);

      const yScale = d3
        .scaleLinear()
        .domain([0, yDomainWaterDepth])
        .range([0, height - marginTop - marginBottom - bottomLayerHeightPx]);
      const yAxisGenerator = d3.axisLeft(yScale);

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
          .append('text')
          .text(attr.label)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('x', (width - marginLeft - marginRight) / 2)
          .attr('y', attr.height / 2)
          .attr('font-size', '0.8em')
          .attr('fill', attr.labelColor);
      };

      if (yDomainWaterDepth > 0 || yDomainSweptDepth > 0) {
        addChartLayer({
          y: marginTop + yScale(yDomainWaterDepth),
          height: 20,
          fillColor: '#000000',
          label: t('homePage.squatChart.levels.bottom'),
          labelColor: '#ffffff',
        });
      }

      if (yDomainWaterDepth > yDomainSweptDepth) {
        addChartLayer({
          y: marginTop + yScale(yDomainSweptDepth),
          height: yScale(yDomainWaterDepth - yDomainSweptDepth),
          fillColor: '#ffcccc',
          label: t('homePage.squatChart.levels.underSweptDepth'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth > 0) {
        const yDomainUKCh = Math.min(yDomainSweptDepth, state.environment.attribute.requiredUKC);
        const yDomainUKCy = Math.max(0, yDomainSweptDepth - state.environment.attribute.requiredUKC);
        addChartLayer({
          y: marginTop + yScale(yDomainUKCy),
          height: yScale(yDomainUKCh),
          fillColor: '#99ccff',
          label: t('homePage.squatChart.levels.netUKC'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth - state.environment.attribute.requiredUKC > 0) {
        const yDomainOMh = Math.min(yDomainOtherMovementHeight, yDomainSweptDepth - state.environment.attribute.requiredUKC);
        const yDomainOMy = Math.max(0, yDomainSweptDepth - state.environment.attribute.requiredUKC - yDomainOtherMovementHeight);
        addChartLayer({
          y: marginTop + yScale(yDomainOMy),
          height: yScale(yDomainOMh),
          fillColor: '#cc99ff',
          label: t('homePage.squatChart.levels.otherMovement'),
          labelColor: '#000000',
        });
      }

      if (yDomainSweptDepth - state.environment.attribute.requiredUKC - yDomainOtherMovementHeight > 0) {
        addChartLayer({
          y: marginTop,
          height: yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - yDomainOtherMovementHeight),
          fillColor: '#ccffff',
          label: t('homePage.squatChart.levels.squat'),
          labelColor: '#000000',
        });
      }

      /* Add axis */

      xAxisGenerator.tickFormat(d3.format('.1f'));
      xAxisGenerator.tickSize(0 - (height - marginTop - marginBottom));
      const xAxis = container.append('g').call(xAxisGenerator);
      xAxis.attr('transform', `translate(${marginLeft}, ${height - marginBottom})`);
      xAxis.select('.domain').remove();
      xAxis.selectAll('.tick line').attr('stroke-width', '.2');
      xAxis
        .selectAll('.tick')
        // eslint-disable-next-line
        .filter((elem: any) => {
          return elem === state.environment.vessel.vesselSpeed;
        })
        .attr('font-weight', 'bold')
        .attr('font-style', 'italic');

      container
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
        .attr('y', height - 20)
        .text(`${t('homePage.squatChart.xAxisLabel')}`);

      yAxisGenerator.tickFormat(d3.format('.1f'));
      const yAxis = container.append('g').call(yAxisGenerator);
      yAxis.attr('transform', `translate(${marginLeft}, ${marginTop})`);

      container
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(marginTop + (height - marginTop - marginBottom) / 2))
        .attr('y', 20)
        .text(`${t('homePage.squatChart.yAxisLabel')}`);

      /* Add legends */

      const addHGLegend = () => {
        const legend20 = container.append('g').attr('transform', `translate(${marginLeft}, 10)`);
        legend20.append('rect').attr('width', 10).attr('height', 10).attr('fill', squatHG20Color);
        legend20
          .append('text')
          .text(t('homePage.squatChart.legends.squatHG20'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', 10 / 2)
          .attr('font-size', '10px')
          .attr('fill', '#000000');

        const box = legend20.node()?.getBBox();
        const legend20Width = box ? box.width : 0;

        const legend24 = container.append('g').attr('transform', `translate(${marginLeft + legend20Width + 15}, 10)`);
        legend24.append('rect').attr('width', 10).attr('height', 10).attr('fill', squatHG24Color);
        legend24
          .append('text')
          .text(t('homePage.squatChart.legends.squatHG24'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', 10 / 2)
          .attr('font-size', '10px')
          .attr('fill', '#000000');
      };

      const addBarrassLegend = () => {
        const legend = container.append('g').attr('transform', `translate(${marginLeft}, 10)`);
        legend.append('rect').attr('width', 10).attr('height', 10).attr('fill', squatBarrassColor);
        legend
          .append('text')
          .text(t('homePage.squatChart.legends.squatBarrass'))
          .attr('text-anchor', 'left')
          .attr('dominant-baseline', 'middle')
          .attr('x', 15)
          .attr('y', 10 / 2)
          .attr('font-size', '10px')
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
      };

      if (state.status.showBarrass) {
        addBarrassLegend();
        if (paramsValid) {
          addSquatLine(calculateBarrassSquat, squatBarrassColor);
        }
      } else {
        addHGLegend();
        if (paramsValid) {
          const getHGSquatFunc = (C0Coefficient: number) => {
            return (speed: number) => {
              return calculateHGSquat(speed, C0Coefficient);
            };
          };

          addSquatLine(getHGSquatFunc(2.0), squatHG20Color);
          addSquatLine(getHGSquatFunc(2.4), squatHG24Color);
        }
      }
    };

    buildGraph();
  }, [state, width, t]);

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <h4 className="squatChartTitle">{t('homePage.squatChart.heading')}</h4>
          <svg ref={ref} viewBox={`0 0 1000 500`} width="100%" />
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default SquatChart;
