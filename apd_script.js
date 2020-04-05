window.onload = load_data;

function load_data() {
  parseTime = d3.timeParse("%m/%d/%Y %H:%M");
  var promises = [get_posts_csv()];
  Promise.all(promises).then(ready);
}

function ready(data) {
  draw_posts_graph(data[0]);
}

function draw_posts_graph(data) {
  (dataset = data),
    (curr_data = dataset),
    (count_post = curr_data.length),
    (xScale = d3.scaleTime()),
    (yScale = d3.scaleSqrt()),
    (colorScale = d3.scaleLinear()),
    (radiusScale = d3.scaleLinear()),
    (xAxis = d3.axisBottom()),
    (yAxis = d3.axisLeft()),
    (width = d3.select("div#posts_graph").node().clientWidth),
    (height = d3.select("div#posts_graph").node().clientHeight),
    (margins = { right: 50, left: 50, top: 50, bottom: 50 }),
    (speed = 750),
    (radius = 5);

  svg = d3
    .select("div#posts_graph")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", width + margins.left + margins.right)
    .attr("height", height + margins.top + margins.bottom)
    .attr("class", "svg-content");

  svg
    .append("g")
    .attr("transform", `translate(${0},${height - 3 * margins.bottom})`)
    .attr("class", "x-axis");

  svg
    .append("g")
    .attr("transform", `translate(${2 * margins.left},${0})`)
    .attr("class", "y-axis");

  svg
    .append("text")
    .attr("class", "displayInfo")
    .attr(
      "transform",
      `translate(${2 * margins.left},${height - 1.5 * margins.bottom})`
    )
    .attr("font-size", "25px")
    .attr("font-weight", "bold");

  tip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function (d) {
      if (d["username"].length == 0) name = "<i>Unknown</i>";
      else name = d["username"];
      return (
        "<strong>Post ID: </strong>" +
        d["mediaid"] +
        "<br/><strong>Post Date: </strong>" +
        d3.timeFormat("%m/%d/%Y")(d["postdate"]) +
        "<br/><strong>Post likes: </strong>" +
        d["post_likes"] +
        "<br/><strong>Posted by: </strong>" +
        name +
        "<br/><strong>User's followers: </strong>" +
        d["followers"] +
        "<br/><strong>Overall sentiment score: </strong>" +
        d["compound"] +
        "<br/><strong>Sentiment: </strong>" +
        d["sentiment"] +
        "<br/><strong>Influential post? </strong>" +
        d["influential"]
      );
    });

  svg
    .append("g")
    .selectAll("circle")
    .data(curr_data)
    .enter()
    .append("circle")
    .attr("class", "post")
    .attr("stroke-width", "1px")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
  svg.call(tip);

  updateScales(curr_data);
  updateAxis();
  updateChart();
  updateDisplayInfo();
  appendLabels();
}

function updateScales(up_data) {
  xScale
    .domain([
      d3.min(up_data, function (d) {
        return d["postdate"];
      }),
      d3.max(up_data, function (d) {
        return d["postdate"];
      }),
    ])
    .range([2 * margins.left, width - 2 * margins.right]);

  yScale
    .domain([
      d3.min(up_data, function (d) {
        return d["post_likes"];
      }),
      d3.max(up_data, function (d) {
        return d["post_likes"];
      }),
    ])
    .range([height - 3 * margins.top, margins.bottom]);

  colorScale.domain([-1, 0, 1]).range(["red", "white", "green"]);

  radiusScale
    .domain([
      d3.min(up_data, function (d) {
        return d["post_likes"];
      }),
      d3.max(up_data, function (d) {
        return d["post_likes"];
      }),
    ])
    .range([radius, radius * 10]);
}

function updateAxis() {
  // Set the transition for X axis
  xAxis.scale(xScale);
  yAxis.scale(yScale);
  svg.selectAll(".x-axis").transition().duration(speed).call(xAxis);

  // Set the transition for Y axis
  svg.selectAll(".y-axis").transition().duration(speed).call(yAxis);
}

function updateChart() {
  // remove old data, add new data
  var circles = svg.selectAll("g").selectAll("circle").data(curr_data);
  circles.exit().remove();
  circles.enter().append("circle").attr("r", 0);

  // updtate circles
  circles
    .transition()
    .duration(speed)
    .attr("cx", function (d) {
      return xScale(d["postdate"]);
    })
    .attr("cy", function (d) {
      return yScale(d["post_likes"]);
    })
    .attr("r", function (d) {
      return radiusScale(d["post_likes"]);
    })
    .style("fill", function (d) {
      return colorScale(d["compound"]);
    });
}

function appendLabels() {
  svg
    .append("text")
    .attr(
      "transform",
      `translate(${width - 2 * margins.right},${height - 2 * margins.bottom})`
    )
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Time");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margins.left / 2)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Number of post's likes");
}

function updateDisplayInfo() {
  d3.select(".displayInfo").text(
    `Displaying ${count_post} posts related to ${curr_data[0]["themes"]}`
  );
}

function handleMouseOver(d, i) {
  var coordinates = d3.mouse(this);
  if (coordinates[1] < height / 2) tip.direction("s");
  else tip.direction("n");
  tip.show(d);
  d3.select(this).attr("r", d3.select(this).attr("r") * 3);
}

function handleMouseOut(d, i) {
  tip.hide(d);
  d3.select(this).attr("r", d3.select(this).attr("r") / 3);
}

function get_posts_csv() {
  var id = -1;
  return d3
    .csv("./test_data/data_scored_minimized.csv", function (d) {
      id++;
      return {
        mediaid: id,
        themes: d["themes"],
        postdate: parseTime(d["postdate"]),
        post_likes: parseInt(d["post_likes"]),
        caption: d["caption"],
        location: d["location"],
        influencer: d["influencer"],
        username: d["username"],
        followers: parseInt(d["followers"]),
        neg: parseFloat(d["neg"]),
        neu: parseFloat(d["neu"]),
        pos: parseFloat(d["pos"]),
        compound: parseFloat(d["compound"]),
        sentiment: d["sentiment"],
        influential: d["influential"],
      };
    })
    .then(function (data, err) {
      if (err) {
        console.log(error);
      } else {
        return data;
      }
    });
}
