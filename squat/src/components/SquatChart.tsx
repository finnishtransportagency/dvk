import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { calculateDraughtDuringTurn, calculateHeelDuringTurn, calculateSquatHG, calculateFroudeNumber } from '../utils/calculations';
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
    const calculateSquat = (speed: number, C0Coefficient: number) => {
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

    const buildGraph = () => {
      const height = Math.round(width / 2);
      const marginLeft = 50;
      const marginRight = 30;
      const marginTop = 30;
      const marginBottom = 50;

      const squat20Color = '#0000ff';
      const squat24Color = '#ff0000';

      let minSpeed = state.environment.vessel.vesselSpeed;

      if (!minSpeed) {
        minSpeed = 0;
      }

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

      const yDomainSweptDepth = state.environment.fairway.sweptDepth + state.environment.fairway.waterLevel - state.vessel.general.draught;

      /* TODO: Use water depth in state when available */
      const yDomainWaterDepth = yDomainSweptDepth;

      let yDomainOtherMovementHeight = state.calculations.squat.correctedDraughtDuringTurn - state.vessel.general.draught;

      if (Number.isNaN(yDomainOtherMovementHeight) || yDomainOtherMovementHeight < 0.5) {
        yDomainOtherMovementHeight = 0.5;
      }

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

      /* Add legends */
      const legend20 = container.append('g').attr('transform', `translate(${marginLeft}, 10)`);
      legend20.append('rect').attr('width', 10).attr('height', 10).attr('fill', squat20Color);
      legend20
        .append('text')
        .text(t('homePage.squatChart.legends.squat20'))
        .attr('text-anchor', 'left')
        .attr('dominant-baseline', 'middle')
        .attr('x', 15)
        .attr('y', 10 / 2)
        .attr('font-size', '10px')
        .attr('fill', '#000000');

      const box = legend20.node()?.getBBox();
      const legend20Width = box ? box.width : 0;

      const legend24 = container.append('g').attr('transform', `translate(${marginLeft + legend20Width + 15}, 10)`);
      legend24.append('rect').attr('width', 10).attr('height', 10).attr('fill', squat24Color);
      legend24
        .append('text')
        .text(t('homePage.squatChart.legends.squat24'))
        .attr('text-anchor', 'left')
        .attr('dominant-baseline', 'middle')
        .attr('x', 15)
        .attr('y', 10 / 2)
        .attr('font-size', '10px')
        .attr('fill', '#000000');

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

      addChartLayer({
        y: marginTop + yScale(yDomainWaterDepth),
        height: 20,
        fillColor: '#000000',
        label: t('homePage.squatChart.levels.bottom'),
        labelColor: '#ffffff',
      });

      if (yDomainWaterDepth > yDomainSweptDepth) {
        addChartLayer({
          y: marginTop + yScale(yDomainSweptDepth),
          height: yScale(yDomainWaterDepth - yDomainSweptDepth),
          fillColor: '#ffcccc',
          label: t('homePage.squatChart.levels.underSweptDepth'),
          labelColor: '#000000',
        });
      }

      addChartLayer({
        y: marginTop + yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC),
        height: yScale(state.environment.attribute.requiredUKC),
        fillColor: '#99ccff',
        label: t('homePage.squatChart.levels.netUKC'),
        labelColor: '#000000',
      });

      addChartLayer({
        y: marginTop + yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - yDomainOtherMovementHeight),
        height: yScale(yDomainOtherMovementHeight),
        fillColor: '#cc99ff',
        label: t('homePage.squatChart.levels.otherMovement'),
        labelColor: '#000000',
      });

      addChartLayer({
        y: marginTop,
        height: yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - yDomainOtherMovementHeight),
        fillColor: '#ccffff',
        label: t('homePage.squatChart.levels.squat'),
        labelColor: '#000000',
      });

      /* Add axis */

      xAxisGenerator.tickFormat(d3.format('.1f'));
      xAxisGenerator.tickSize(0 - (height - marginTop - marginBottom));
      const xAxis = container.append('g').call(xAxisGenerator);
      xAxis.attr('transform', `translate(${marginLeft}, ${height - marginBottom})`);
      xAxis.select('.domain').remove();
      xAxis.selectAll('.tick line').attr('stroke-width', '.2');

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

      /* Add squat lines */

      const addSquatLine = (C0Coefficient: number, color: string) => {
        const data: Array<[number, number]> = [];

        for (let i = minSpeed; i < maxSpeed; i += 0.1) {
          data.push([i, calculateSquat(i, C0Coefficient)]);
        }

        data.push([maxSpeed, calculateSquat(maxSpeed, C0Coefficient)]);

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

      if (paramsValid) {
        addSquatLine(2.0, squat20Color);
        addSquatLine(2.4, squat24Color);
      }
    };

    buildGraph();
  }, [state, width, t]);

  return (
    <>
      <h4 className="squatChartTitle">{t('homePage.squatChart.heading')}</h4>
      <svg ref={ref} viewBox={`0 0 1000 500`} width="100%" />
    </>
  );
};

export default SquatChart;
