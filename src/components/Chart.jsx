import { useEffect, useRef } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

import colors from "../data/color";

function Chart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    const width = window.innerWidth * 0.98;
    const height = window.innerHeight * 0.8;
    const chartPadding = { top: 40, right: 40, bottom: 120, left: 80 };

    const variance = data.monthlyVariance.map((d) => d.variance);
    const minTemp = data.baseTemperature + Math.min.apply(null, variance);
    const maxTemp = data.baseTemperature + Math.max.apply(null, variance);

    const tooltip = d3.select("#tooltip").style("visibility", "hidden");

    const svg = d3.select(chartRef.current);

    const legendColors = colors.RdYlBu[11].reverse();
    const legendThreshold = d3
      .scaleThreshold()
      .domain(
        ((min, max, count) => {
          const array = [];
          const step = (max - min) / count;
          const base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }

          return array;
        })(minTemp, maxTemp, legendColors.length)
      )
      .range(legendColors);

    const legendX = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([chartPadding.left, width - chartPadding.right]);

    const legendXAxis = d3
      .axisBottom()
      .scale(legendX)
      .tickSize(10, 0)
      .tickValues(legendThreshold.domain())
      .tickFormat(d3.format(".1f"));

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(0, ${height - chartPadding.bottom + chartPadding.top})`
      );

    const legendRect = legend.append("g");

    legendRect
      .selectAll("rect")
      .data(
        legendThreshold.range().map((color) => {
          const d = legendThreshold.invertExtent(color);
          if (d[0] === null) {
            console.log("hai1");
            d[0] = legendX.domain()[0];
          }
          if (d[1] === null) {
            console.log("hai2");
            d[1] = legendX.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append("rect")
      .attr("width", (d) =>
        d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
      )
      .attr("height", 20)
      .style("fill", (d) => legendThreshold(d[0]))
      .attr("x", (d) => legendX(d[0]))
      .attr("y", 0);

    legend.append("g").attr("transform", `translate(0, 20)`).call(legendXAxis);

    const x = d3
      .scaleBand()
      .domain(data.monthlyVariance.map((d) => d.year))
      .range([chartPadding.left, width - chartPadding.right]);

    const y = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .rangeRound([chartPadding.top, height - chartPadding.bottom]);

    const xAxis = d3
      .axisBottom()
      .scale(x)
      .tickValues(x.domain().filter((year) => year % 10 === 0))
      .tickFormat((year) => {
        const date = new Date().setUTCFullYear(year);
        const format = d3.utcFormat("%Y");

        return format(date);
      })
      .tickSize(10, 1);

    const yAxis = d3
      .axisLeft()
      .scale(y)
      .tickValues(y.domain())
      .tickFormat((month) => {
        const date = new Date().setUTCMonth(month - 1);
        const format = d3.utcFormat("%B");

        return format(date);
      });

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - chartPadding.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${chartPadding.left}, 0)`)
      .call(yAxis);

    const map = svg.append("g").classed("map", true);

    map
      .selectAll("rect")
      .data(data.monthlyVariance)
      .join(
        (enter) => enter.append("rect"),
        (update) => update.classed("cell", true),
        (exit) => exit.remove()
      )
      .classed("cell", true)
      .attr("id", (d, id) => `rect$-${id}`)
      .attr("data-year", (d) => d.year)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-temp", (d) => data.baseTemperature + d.variance)
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.month))
      .attr("width", (d) => x.bandwidth(d.year))
      .attr("height", (d) => y.bandwidth(d.month))
      .attr("fill", (d) => legendThreshold(data.baseTemperature + d.variance))
      .on("mouseover", (e, d) => {
        const element = document.getElementById(e.target.id);
        element.style.opacity = 0.4;

        const date = new Date(d.year, d.month);

        tooltip.transition().duration(200).style("visibility", "visible");
        tooltip
          .html(
            `
                <span>${d3.utcFormat("%Y - %B")(date)}</span>
                <span>
                    ${d3.format(".1f")(data.baseTemperature + d.variance)}°C
                </span>
                <span>
                    <b>
                        ${d3.format("+.1f")(d.variance)}°C
                    </b>
                </span>
            `
          )
          .attr("data-year", d.year)
          .style("left", `${e.clientX + chartPadding.right}px`)
          .style("top", `${e.clientY - chartPadding.top}px`);
      })
      .on("mouseout", (e) => {
        const element = document.getElementById(e.target.id);
        element.style.opacity = 1;

        tooltip.transition().duration(200).style("visibility", "hidden");
      });
  }, [data]);
  return <svg ref={chartRef} className="w-[98vw] h-[80vh]"></svg>;
}

Chart.propTypes = {
  data: PropTypes.object.isRequired,
};

export default Chart;
