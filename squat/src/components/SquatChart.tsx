import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { useSquatContext } from '../hooks/squatContext';
import { calculateDraughtDuringTurn, calculateHeelDuringTurn, calculateSquatHG } from '../utils/calculations';

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
  }, []);

  useLayoutEffect(() => {
    const calculateSquat = (speed: number) => {
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
        correctedDraughtDuringTurn
      );

      return squatHG;
    };

    const buildGraph = (minSpeed: number, maxSpeed: number) => {
      const height = Math.round(width / 2);
      const marginLeft = 50;
      const marginRight = 50;
      const marginTop = 50;
      const marginBottom = 50;

      const yDomainBottom = Number(state.environment.fairway.waterLevel) - Number(state.vessel.general.draught);
      const yDomainSweptDepth = Number(state.environment.fairway.sweptDepth) - Number(state.vessel.general.draught);
      const yDomainMax = yDomainBottom + 1;

      const xScale = d3
        .scaleLinear()
        .domain([minSpeed, maxSpeed])
        .range([0, width - marginLeft - marginRight]);
      const xAxisGenerator = d3.axisBottom(xScale);

      const yScale = d3
        .scaleLinear()
        .domain([0, yDomainMax])
        .range([0, height - marginTop - marginBottom]);
      const yAxisGenerator = d3.axisLeft(yScale);

      xAxisGenerator.tickFormat(d3.format('.1f'));
      xAxisGenerator.tickSize(0 - (height - marginTop - marginBottom));

      yAxisGenerator.tickFormat(d3.format('.1f'));

      const svg = d3.select(ref.current);

      svg.attr('viewBox', `0 0 ${width} ${height}`);

      /* Clear svg */
      svg.selectAll('*').remove();

      /* Add depth levels */
      const bar1 = svg.append('g').attr('transform', `translate(${marginLeft}, ${marginTop + yScale(yDomainBottom)})`);
      bar1
        .append('rect')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', yScale(yDomainMax - yDomainBottom))
        .attr('fill', '#000000');
      bar1
        .append('text')
        .text(`${t('homePage.squatChart.levels.bottom')}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (width - marginLeft - marginRight) / 2)
        .attr('y', yScale(yDomainMax - yDomainBottom) / 2)
        .attr('font-size', '0.8em')
        .attr('fill', '#ffffff');

      const bar2 = svg.append('g').attr('transform', `translate(${marginLeft}, ${marginTop + yScale(yDomainSweptDepth)})`);
      bar2
        .append('rect')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', yScale(yDomainBottom - yDomainSweptDepth))
        .attr('fill', '#ffcccc');
      bar2
        .append('text')
        .text(`${t('homePage.squatChart.levels.underSweptDepth')}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (width - marginLeft - marginRight) / 2)
        .attr('y', yScale(yDomainBottom - yDomainSweptDepth) / 2)
        .attr('font-size', '0.8em')
        .attr('fill', '#000000');

      const bar3 = svg
        .append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop + yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC)})`);
      bar3
        .append('rect')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', yScale(state.environment.attribute.requiredUKC))
        .attr('fill', '#99ccff');
      bar3
        .append('text')
        .text(`${t('homePage.squatChart.levels.netUKC')}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (width - marginLeft - marginRight) / 2)
        .attr('y', yScale(state.environment.attribute.requiredUKC) / 2)
        .attr('font-size', '0.8em')
        .attr('fill', '#000000');

      const bar4 = svg
        .append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop + yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - 0.6)})`);
      bar4
        .append('rect')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', yScale(0.6))
        .attr('fill', '#cc99ff');
      bar4
        .append('text')
        .text(`${t('homePage.squatChart.levels.otherMovement')}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (width - marginLeft - marginRight) / 2)
        .attr('y', yScale(0.6) / 2)
        .attr('font-size', '0.8em')
        .attr('fill', '#000000');

      const bar5 = svg.append('g').attr('transform', `translate(${marginLeft}, ${marginTop})`);
      bar5
        .append('rect')
        .attr('width', width - marginLeft - marginRight)
        .attr('height', yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - 0.6))
        .attr('fill', '#ccffff');
      bar5
        .append('text')
        .text(`${t('homePage.squatChart.levels.squat')}`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('x', (width - marginLeft - marginRight) / 2)
        .attr('y', yScale(yDomainSweptDepth - state.environment.attribute.requiredUKC - 0.6) / 2)
        .attr('font-size', '0.8em')
        .attr('fill', '#000000');

      /* Add axis */
      const xAxis = svg.append('g').call(xAxisGenerator);
      const yAxis = svg.append('g').call(yAxisGenerator);

      xAxis.attr('transform', `translate(${marginLeft}, ${height - marginBottom})`);

      xAxis.select('.domain').remove();

      xAxis.selectAll('.tick line').attr('stroke-width', '.2');

      yAxis.attr('transform', `translate(${marginLeft}, ${marginTop})`);

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', marginLeft + (width - marginLeft - marginRight) / 2)
        .attr('y', height - 20)
        .text(`${t('homePage.squatChart.xAxisLabel')}`);

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(marginTop + (height - marginTop - marginBottom) / 2))
        .attr('y', 20)
        .text(`${t('homePage.squatChart.yAxisLabel')}`);

      /* Add squat line */
      const dataPoints: Array<{ speed: number; squat: number }> = [];
      const speedStep = 1;

      for (let i = minSpeed; i < maxSpeed; i += speedStep) {
        dataPoints.push({ speed: i, squat: calculateSquat(i) });
      }

      dataPoints.push({ speed: maxSpeed, squat: calculateSquat(maxSpeed) });

      /* Squat c0 = 2.4 */
      const data: Array<[number, number]> = dataPoints.map((item) => {
        return [item.speed, item.squat];
      });

      svg
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
        .attr('stroke', '#ff0000')
        .attr('stroke-width', '2px')
        .attr('fill', 'none');

      /* Squat c0 = 2.0 */
      const data20: Array<[number, number]> = dataPoints.map((item) => {
        return [item.speed, (item.squat / 2.4) * 2.0];
      });

      svg
        .append('path')
        .datum(data20)
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
        .attr('stroke', '#0000ff')
        .attr('stroke-width', '2px')
        .attr('fill', 'none');
    };

    let minSpeed = state.environment.vessel.vesselSpeed;

    if (!minSpeed) {
      minSpeed = 0;
    }

    if (
      Number(state.environment.fairway.sweptDepth) > 1 &&
      Number(state.environment.fairway.waterLevel) > Number(state.environment.fairway.sweptDepth)
    ) {
      buildGraph(minSpeed, minSpeed + 10);
    } else {
      const svg = d3.select(ref.current);
      /* Clear svg */
      svg.selectAll('*').remove();
    }
  }, [state, width, t]);

  return <svg ref={ref} viewBox={`0 0 1000 500`} width="100%" />;
};

export default SquatChart;
