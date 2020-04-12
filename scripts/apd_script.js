window.onload = load_data;
full_loc = window.location.search;
params = new URLSearchParams(full_loc);
topics = params.get("topics");
topics = topics.split("").map((a) => parseInt(a));
topics_dict = {
  0: "Millenial",
  1: "Foodie",
  2: "Parent",
  3: "Rural",
  4: "non-Minnesotan",
};
topics_str = "";
topics.forEach((element) => (topics_str += topics_dict[element] + ", "));
topics_str = topics_str.substring(0, topics_str.length - 2);
topics_str += ".";

function load_data() {
  parseTime = d3.timeParse("%m/%d/%Y");
  var promises = [get_posts_csv()];
  Promise.all(promises).then(ready);
}

function get_posts_csv() {
  var id = -1;
  return d3
    .csv("./data/posts_graph.csv", function (d) {
      //d["yn"] = YNNYN par exemple
      var all_in = true;
      topics.forEach((element) => {
        if (d["yn"][element] != "Y") all_in = false;
      });
      if (all_in) {
        id++;
        return {
          mediaid: id,
          postdate: parseTime(d["postdate"]),
          post_likes: parseInt(d["post_likes"]),
          influencer: d["influencer"],
          shortcode: d["shortcode"],
          username: d["username"],
          followers: parseInt(d["followers"]),
          engagement: parseFloat(d["engagement_score"]),
          compound: parseFloat(d["compound"]),
          sentiment: d["sentiment"],
          influential: d["influential"],
        };
      }
    })
    .then(function (data, err) {
      if (err) {
        console.log(error);
      } else {
        return data;
      }
    });
}

function ready(data) {
  draw_posts_graph(data[0]);
}

function draw_posts_graph(data) {
  (dataset = data),
    (config = {
      username: "",
      min_likes: d3.min(dataset, function (d) {
        return d["post_likes"];
      }),
      max_likes: d3.max(dataset, function (d) {
        return d["post_likes"];
      }),
      min_score: d3.min(dataset, function (d) {
        return d["engagement"];
      }),
      max_score: d3.max(dataset, function (d) {
        return d["engagement"];
      }),
      yes: true,
      no: true,
    });
  (curr_data = update_dataset(0)),
    (xScale = d3.scaleSqrt()),
    (yScale = d3.scaleLinear()),
    (colorScale = d3.scaleLinear()),
    (radiusScale = d3.scaleLinear()),
    (xAxis = d3.axisBottom()),
    (yAxis = d3.axisLeft()),
    (width = d3.select("div#posts_graph").node().clientWidth),
    (height = d3.select("div#posts_graph").node().clientHeight),
    (margins = { right: 50, left: 50, top: 50, bottom: 50 }),
    (speed = 750),
    (radius = 5);

  slider = createD3RangeSlider(
    config.min_likes,
    config.max_likes,
    "#filter_likes"
  );
  d3.select("#range").text(config.min_likes + " - " + config.max_likes);
  slider.range(config.min_likes, config.max_likes);
  slider.onChange(function (newRange) {
    d3.select("#range").text(newRange.begin + " - " + newRange.end);
    update_all(3);
  });

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

      if (d["influencer"] == "TRUE") state = "Yes";
      else state = "Yes";

      return (
        "<strong>Post ID: </strong>" +
        d["mediaid"] +
        "<br/><strong>Post Date: </strong>" +
        d3.timeFormat("%m/%d/%Y")(d["postdate"]) +
        "<br/><strong>Post likes: </strong>" +
        d["post_likes"] +
        "<br/><strong>Posted by: </strong>" +
        name +
        "<br/><strong>Is the user an influencer? </strong>" +
        state +
        "<br/><strong>User's followers: </strong>" +
        d["followers"] +
        "<br/><strong>Engagement score: </strong>" +
        d["engagement"] +
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
    .attr("id", "group-chart")
    .selectAll("circle")
    .data(curr_data)
    .enter()
    .append("circle")
    .attr("class", "post")
    .attr("stroke-width", "1px")
    .attr("stroke", "black")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", redirectToPost);
  svg.call(tip);

  update_all(0);
  appendLabels();
  add_legend();
}

function update_dataset(type) {
  var data = [];
  var def = false;
  switch (type) {
    case 1:
      config["username"] = document.getElementById("user_filter").value;
      break;
    case 2:
      var min_s = document.getElementById("engagement_filter_min").value;
      var max_s = document.getElementById("engagement_filter_max").value;
      if (min_s != "" && max_s != "") {
        config["min_score"] = parseFloat(min_s);
        config["max_score"] = parseFloat(max_s);
      } else if (min_s != "") {
        config["min_score"] = parseFloat(min_s);
        config["max_score"] = d3.max(dataset, function (d) {
          return d["engagement"];
        });
      } else if (max_s != "") {
        config["max_score"] = parseFloat(max_s);
        config["min_score"] = d3.min(dataset, function (d) {
          return d["engagement"];
        });
      } else {
        config["min_score"] = d3.min(dataset, function (d) {
          return d["engagement"];
        });
        config["max_score"] = d3.max(dataset, function (d) {
          return d["engagement"];
        });
      }
      break;
    case 3:
      var min = slider.range().begin;
      var max = slider.range().end;
      config["min_likes"] = min;
      config["max_likes"] = max;
      break;
    case 4:
      config["yes"] = document.getElementById("isInfluential").checked;
      config["no"] = document.getElementById("isNotInfluential").checked;
      break;

    default:
      def = true;
      break;
  }
  if (def) {
    return dataset;
  } else {
    dataset.forEach((element) => {
      if (element["influential"] == "yes") state = true;
      else state = false;

      if (
        element["username"].includes(config["username"]) &&
        element["engagement"] >= config["min_score"] &&
        element["engagement"] <= config["max_score"] &&
        element["post_likes"] >= config["min_likes"] &&
        element["post_likes"] <= config["max_likes"] &&
        (state == config["yes"] || !state == config["no"])
      ) {
        data.push(element);
      }
    });
    return data;
  }
}

function update_all(type) {
  curr_data = update_dataset(type);
  updateScales();
  updateAxis();
  updateChart();
  updateDisplayInfo();
}

function updateScales() {
  xScale
    .domain([
      d3.min(curr_data, function (d) {
        return d["post_likes"];
      }),
      d3.max(curr_data, function (d) {
        return d["post_likes"];
      }),
    ])
    .range([2 * margins.left, width - 2 * margins.right]);

  yScale
    .domain([
      d3.min(curr_data, function (d) {
        return d["engagement"];
      }),
      d3.max(curr_data, function (d) {
        return d["engagement"];
      }),
    ])
    .range([height - 3 * margins.top, margins.bottom]);

  colorScale.domain([-1, 0, 1]).range(["red", "white", "green"]);

  radiusScale
    .domain([
      d3.min(curr_data, function (d) {
        return d["post_likes"];
      }),
      d3.max(curr_data, function (d) {
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
  var circles = svg.select("g#group-chart").selectAll("circle").data(curr_data);
  circles.exit().remove();
  circles
    .enter()
    .append("circle")
    .attr("r", 0)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", redirectToPost);

  // updtate circles
  circles
    .transition()
    .duration(speed)
    .attr("cx", function (d) {
      return xScale(d["post_likes"]);
    })
    .attr("cy", function (d) {
      return yScale(d["engagement"]);
    })
    .attr("r", function (d) {
      return radiusScale(d["post_likes"]);
    })
    .style("fill", function (d) {
      return colorScale(d["compound"]);
    })
    .attr("stroke-width", "1px")
    .attr("stroke", "black");
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
    .text("Number of likes");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margins.left / 2)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .text("Engagement score");
}

function updateDisplayInfo() {
  d3.select(".displayInfo").text(
    `Displaying ${curr_data.length} posts related to ${topics_str}`
  );
}

function add_legend() {
  // Sentiment legend
  var normal_text_size = 15;
  var viewbox = get_viewbox("sentiment_legend");
  init_gradient(viewbox, "sentiment_grad");
  var gradient_padding = 20;
  var gradient_height = 40;
  var gradient_radi = 10;
  var text_padding = 25;
  viewbox
    .append("rect")
    .attr("width", viewbox_w(viewbox) - margins.left)
    .attr("height", gradient_height)
    .attr("rx", gradient_radi)
    .attr("ry", gradient_radi)
    .attr("x", 0)
    .attr("y", gradient_padding)
    .attr("stroke-width", "1.5px")
    .attr("stroke", "black")
    .style("fill", "url(#sentiment_grad)");
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
    .attr("x", viewbox_w(viewbox) / 2 - margins.left / 2)
    .attr("y", gradient_padding + gradient_height + text_padding)
    .attr("text-anchor", "middle")
    .attr("font-size", normal_text_size);
  viewbox
    .append("text")
    .text("good")
    .attr("x", viewbox_w(viewbox) - margins.left)
    .attr("y", gradient_padding + gradient_height + text_padding)
    .attr("text-anchor", "end")
    .attr("font-size", normal_text_size);

  // Number of likes legend
  var viewbox = get_viewbox("likes_legend");
  legend_data = {};
  var min_n_likes = d3.min(dataset.map((d) => d["post_likes"]));
  var max_n_likes = d3.max(dataset.map((d) => d["post_likes"]));
  legend_data["nodes_n_likes"] = {
    px_values: [10, 20, 30],
    values: [min_n_likes, min_n_likes + max_n_likes / 2, max_n_likes],
  };
  var n_likes_values = legend_data["nodes_n_likes"].px_values.map(function (x) {
    return x;
  });
  var n_post_x = n_likes_values[0];
  var step =
    (viewbox_w(viewbox) - n_likes_values[2] - n_post_x - margins.left) / 2;
  viewbox
    .selectAll(".n_posts_circles")
    .data(n_likes_values)
    .enter()
    .append("circle")
    .attr("class", "n_posts_circles")
    .attr("cx", function (d) {
      tmp = n_post_x;
      n_post_x += step;
      return tmp;
    })
    .attr("cy", 40)
    .attr("r", function (d) {
      return d;
    })
    .attr("fill", "white")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 1.5);
  n_post_x = n_likes_values[0] + 20;
  viewbox
    .selectAll(".n_posts_circles_labels")
    .data(legend_data["nodes_n_likes"].values)
    .enter()
    .append("text")
    .attr("class", "n_posts_circles_labels")
    .text(function (d) {
      return Math.round(d);
    })
    .attr("x", function (d) {
      tmp = n_post_x;
      n_post_x += step;
      return tmp - 20;
    })
    .attr("y", function (d, i) {
      return 60 + n_likes_values[i];
    })
    .attr("text-anchor", "middle")
    .attr("font-size", normal_text_size);
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

function redirectToPost(d) {
  var url = "https://instagram.com/p/" + d["shortcode"] + "/";
  window.open(url, "_blank");
}
