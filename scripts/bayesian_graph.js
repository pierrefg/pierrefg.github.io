once = false;

function load_data_bayesian() {
  if (!once) {
    once = true;
    var promises_bayesian = [get_bayesian_csv()];
    Promise.all(promises_bayesian).then(ready_bayesian);
  }
}

function get_bayesian_csv() {
  return d3
    .csv("./data/bayesian_graph.csv", function (d) {
      return {
        min_s: parseFloat(d["min_sentiment"]),
        max_s: parseFloat(d["max_sentiment"]),
        str_s: (
          (parseFloat(d["min_sentiment"]) + parseFloat(d["max_sentiment"])) /
          2.0
        ).toFixed(2),
        avg_likes: parseFloat(d["avg_likes"]),
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

function ready_bayesian(data) {
  draw_bayesian_graph(data[0]);
}

function draw_bayesian_graph(data) {
  (dataset_bayesian = data),
    (xScaleBayesian = d3.scaleBand()),
    (yScaleBayesian = d3.scaleLinear()),
    (colorScaleBayesian = d3.scaleLinear()),
    (xAxisBayesian = d3.axisBottom()),
    (yAxisBayesian = d3.axisLeft()),
    (widthBayesian = document
      .getElementById("bayesian_graph")
      .getBoundingClientRect().width),
    (heightBayesian = document
      .getElementById("bayesian_graph")
      .getBoundingClientRect().height),
    (marginsBayesian = { right: 50, left: 50, top: 50, bottom: 50 });

  svgBayesian = d3
    .select("div#bayesian_graph")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("viewBox", "0 0 " + widthBayesian + " " + heightBayesian)
    .attr("width", widthBayesian + marginsBayesian.left + marginsBayesian.right)
    .attr(
      "height",
      heightBayesian + marginsBayesian.top + marginsBayesian.bottom
    )
    .attr("class", "svg-content");

  svgBayesian
    .append("text")
    .attr("class", "titleBayesian")
    .attr(
      "transform",
      `translate(${2 * marginsBayesian.left},${
        heightBayesian - 1.5 * marginsBayesian.bottom
      })`
    )
    .attr("font-size", "25px")
    .attr("font-weight", "bold");

  updateScalesBayesian();
  updateAxisBayesian();
  updateChartBayesian();
  appendLabelsBayesian();
  updateTitleBayesian();

  svgBayesian
    .append("g")
    .attr(
      "transform",
      `translate(${0},${heightBayesian - 3 * marginsBayesian.bottom})`
    )
    .attr("class", "x-axis")
    .call(xAxisBayesian);

  svgBayesian
    .append("g")
    .attr("transform", `translate(${2 * marginsBayesian.left},${0})`)
    .attr("class", "y-axis")
    .call(yAxisBayesian);
}

function updateScalesBayesian() {
  xScaleBayesian
    .domain(
      dataset_bayesian.map(function (d) {
        return d["str_s"];
      })
    )
    .range([
      2 * marginsBayesian.left,
      widthBayesian - 2 * marginsBayesian.right,
    ]);

  yScaleBayesian
    .domain([
      0,
      d3.max(dataset_bayesian, function (d) {
        return d["avg_likes"];
      }),
    ])
    .range([
      heightBayesian - 3 * marginsBayesian.top,
      3 * marginsBayesian.bottom,
    ]);

  colorScaleBayesian.domain([-1, 0, 1]).range(["red", "white", "green"]);
}

function updateAxisBayesian() {
  xAxisBayesian.scale(xScaleBayesian);
  yAxisBayesian.scale(yScaleBayesian);
}

function updateChartBayesian() {
  svgBayesian
    .selectAll(".bar")
    .data(dataset_bayesian)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return xScaleBayesian(d["str_s"]);
    })
    .attr("y", function (d) {
      return yScaleBayesian(d["avg_likes"]);
    })
    .attr("width", xScaleBayesian.bandwidth() - 10)
    .attr("height", function (d) {
      return (
        heightBayesian -
        3 * marginsBayesian.bottom -
        yScaleBayesian(d["avg_likes"])
      );
    })
    .attr("fill", function (d) {
      return colorScaleBayesian((d["min_s"] + d["max_s"]) / 2);
    });

  svgBayesian
    .selectAll("text.bar")
    .data(dataset_bayesian)
    .enter()
    .append("text")
    .attr("class", "bar")
    .attr("text-anchor", "middle")
    .attr("font-weight", "bold")
    .attr("x", function (d) {
      return xScaleBayesian(d["str_s"]) + marginsBayesian.left;
    })
    .attr("y", function (d) {
      return yScaleBayesian(d["avg_likes"]) - 10;
    })
    .text(function (d) {
      return d["avg_likes"].toFixed(2);
    });
}

function appendLabelsBayesian() {
  svgBayesian
    .append("text")
    .attr(
      "transform",
      `translate(${widthBayesian - 4 * marginsBayesian.right},${
        heightBayesian - 2 * marginsBayesian.bottom
      })`
    )
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Sentiment groups (middle value given)");

  svgBayesian
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", marginsBayesian.left / 2)
    .attr("x", 0 - heightBayesian / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Number of likes (on average)");

  // Sentiment legend
  var normal_text_size = 15;
  var viewbox = get_viewbox("sentiment_legend_bayesian");
  init_gradient(viewbox, "sentiment_grad2");
  var gradient_padding = 20;
  var gradient_height = 40;
  var gradient_radi = 10;
  var text_padding = 25;
  viewbox
    .append("rect")
    .attr("width", viewbox_w(viewbox) - marginsBayesian.left)
    .attr("height", gradient_height)
    .attr("rx", gradient_radi)
    .attr("ry", gradient_radi)
    .attr("x", 0)
    .attr("y", gradient_padding)
    .attr("stroke-width", "1.5px")
    .attr("stroke", "black")
    .style("fill", "url(#sentiment_grad2)");
  viewbox
    .append("text")
    .text("bad")
    .attr("x", 0)
    .attr("y", gradient_padding + gradient_height + text_padding)
    .attr("text-anchor", "start")
    .attr("font-size", normal_text_size);
  viewbox
    .append("text")
    .text("neutral")
    .attr("x", viewbox_w(viewbox) / 2 - marginsBayesian.left / 2)
    .attr("y", gradient_padding + gradient_height + text_padding)
    .attr("text-anchor", "middle")
    .attr("font-size", normal_text_size);
  viewbox
    .append("text")
    .text("good")
    .attr("x", viewbox_w(viewbox) - marginsBayesian.left)
    .attr("y", gradient_padding + gradient_height + text_padding)
    .attr("text-anchor", "end")
    .attr("font-size", normal_text_size);
}

function updateTitleBayesian() {
  d3.select(".titleBayesian").text(
    `Influence as a function of sentiment of the post`
  );
}
