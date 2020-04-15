dragged_state = false;
oversize_circle = false;
sentiment_scale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(['red','white','green']);
faded_color = "RGB(220, 220, 220)"
faded_size = 5

topics_dict = {
  0: "Millenial",
  1: "Foodie",
  2: "Parent",
  3: "Rural",
  4: "non-Minnesotan"
}

filters = {
  sentiment: {
    range: [0, 1],
    vals: [0, 1],
    div_id: "filter_sentiment_range",
    format: '.2%',
    ticks: 5,
    key2check: "av_sentiment"
  },
  influential: {
    range: [0, 1],
    vals: [0, 1],
    div_id: "filter_influential_range",
    format: '.2%',
    ticks: 5,
    key2check: "influential"
  }
}

legend_data = {}

topic_graph_zoom = d3.zoomIdentity

function draw_topic_graph(data) {
    var pdata = preprocess_topic_graph(data)
    links = pdata[0]
    nodes = pdata[1]

    // INIT SVG AND MAIN CONTAINER
    var width=d3.select("div#topic_graph").node().clientWidth
    var height=d3.select("div#topic_graph").node().clientHeight
    svg = d3.select("div#topic_graph")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("viewBox", "0 0 "+width+" "+height)
      .classed("svg-content", true)
      .style("cursor", "cell")
    container = svg.append("g");
    zoom = d3.zoom()
      .scaleExtent([.5, 2])
      .on("zoom", function() { topic_graph_zoom = d3.event.transform; container.attr("transform", d3.event.transform); })
    zoom_call = svg.call(zoom);

    // INIT FORCE
    force = d3.forceSimulation()
      .nodes(nodes)
      .force("link", d3.forceLink(links).distance(300).strength(1))
      .force('center', d3.forceCenter(svg.node().clientWidth/2, svg.node().clientHeight/2))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-2500))
      .on("tick", tick);

    // SCALES
    const [min_strength, max_strength] = get_minmax(links, "strength")
    strength_scale = d3.scaleLinear()
      .domain([min_strength, max_strength])
      .range([0.5, 3]);
    legend_data["links"] = {
      px_values: [strength_scale(0), strength_scale(0.5), strength_scale(1)],
      values: [0, 0.5, 1]
    }

    const [min_n_total, max_n_total] = get_minmax(nodes, "n_posts_total")
    n_total_scale = d3.scaleLinear()
      .domain([min_n_total, max_n_total])
      .range([80, 130]);
    legend_data["topics_n_total"] = {
      px_values: [80, (80+130)/2, 130],
      values: [min_n_total, (min_n_total+max_n_total)/2, max_n_total]
    }
    
    const [min_n_posts, max_n_posts] = get_minmax(nodes, "n_posts")
    n_posts_scale = d3.scaleLinear()
      .domain([min_n_posts, max_n_posts])
      .range([10, 45]);
    legend_data["nodes_n_posts"] = {
      px_values: [10, (10+45)/2, 45],
      values: [min_n_posts, (min_n_posts+max_n_posts)/2, max_n_posts]
    }
    filters.n_posts = {
      range: [Math.floor(min_n_posts/500)*500, Math.ceil(max_n_posts/500)*(500)],
      vals: [Math.floor(min_n_posts/500)*500, Math.ceil(max_n_posts/500)*500],
      div_id: "filter_n_posts",
      format: ",.2r",
      ticks: 4,
      key2check: "n_posts"
    }

    // INIT TIP
    tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
      content = `
      <table style="margin-top: 2.5px;">
              <tr><td>Topics: </td><td style="text-align: right">` + d.topics.map(d=>topics_dict[d]).join(", ") + `</td></tr>
              <tr><td>Number of posts: </td><td style="text-align: right">` + String(d.n_posts) + `</td></tr>
              <tr><td>Overall sentiment: </td><td style="text-align: right">` + String(Math.round(d.av_sentiment*100)) + `%</td></tr>
              <tr><td>Probability of being influential: </td><td style="text-align: right">` + String(Math.round(d.influential*100)) + `%</td></tr>
      </table>
      `;
      return content;
    });
    container.call(tip)

    update_topic_graph()

    window.addEventListener("resize", draw_legend);
    window.addEventListener("resize", init_filters);
    draw_legend()
    init_filters()
}

function preprocess_topic_graph(data){
    links = []
    nodes = []

    nodes_dict = {}
    data.forEach(function(row) {
      link = {}
      link.source = nodes_dict[row.source] || (nodes_dict[row.source] = { name: row.source, post: true});
      link.target = nodes_dict[row.target] || (nodes_dict[row.target] = { name: parseInt(row.target), post: false});
      link.strength = parseFloat(row.strength_of_link)
      links.push(link)
      // Filling source nodes
      nodes_dict[row.source].influential = nodes_dict[row.source].influential || parseFloat(row.probability_of_post_being_influential);
      nodes_dict[row.source].fixed = nodes_dict[row.source].fixed || false;
      nodes_dict[row.source].active = nodes_dict[row.source].active || true;
      nodes_dict[row.source].name = nodes_dict[row.source].name || row.source;
      nodes_dict[row.source].n_posts = nodes_dict[row.source].n_posts || parseInt(row.source_number_of_posts);
      nodes_dict[row.source].av_sentiment = nodes_dict[row.source].av_sentiment || parseFloat(row.source_sentiment);
      nodes_dict[row.source].topics = nodes_dict[row.source].topics || [];
      nodes_dict[row.source].topics.push(parseInt(row.target));
      // Filling target nodes
      nodes_dict[row.target].fixed = nodes_dict[row.target].fixed || false;
      nodes_dict[row.target].active = nodes_dict[row.target].active || true;
      nodes_dict[row.target].name = nodes_dict[row.target].name || row.target;
      n_posts = nodes_dict[row.source].n_posts
      nodes_dict[row.target].n_posts_total = nodes_dict[row.target].n_posts_total+n_posts || n_posts;
      nodes_dict[row.target].av_sentiment_total = 
              nodes_dict[row.target].av_sentiment_total+(n_posts*nodes_dict[row.source].av_sentiment) 
              || (n_posts*nodes_dict[row.source].av_sentiment);
      
    });

    for (let key in nodes_dict) {
      nodes_dict[key].av_sentiment_total /= nodes_dict[key].n_posts_total
    }

    for (let key in nodes_dict) {
      nodes.push(nodes_dict[key])
    }

    return [links, nodes]
}

function update_topic_graph(){
  for(i in nodes){
    var node = nodes[i]
    if(node.post==true){
      var active_goal = true
      if(!check_filters(node)){
        active_goal = false
      }
      if(node.active == !active_goal){
        nodes[i].active = active_goal
        links.forEach(function(el){
          if(el.source.active.name == nodes[i].name) el.source = nodes[i]
        })
      }
    }
  }
  
  // Retrieving data
  var posts = nodes.filter(function(node){return node.post})
  var topics = nodes.filter(function(node){return !node.post})

  // Drawing links
  path = container.selectAll(".path")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "path")
    .attr("stroke", "#aaa")
    .attr("stroke-width", function(d) { return strength_scale(d.strength) });

  // Drawing post nodes
  var posts_update = container
    .selectAll(".post_node")
    .data(posts)
  posts_update
    .enter().append("g")
    .attr("class", "post_node")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("contextmenu", handle_contextmenu)
    .append("circle")
    .attr("class", "post_node_circles to_emphaze")
    .attr("original_r", function(d) { 
      if(d.active) return n_posts_scale(d.n_posts);
      else return faded_size
      })
    .attr("r", function(d) { 
      if(d.active) return n_posts_scale(d.n_posts);
      else return faded_size
      })
    .attr("stroke-width","1px")
    .attr("stroke", "gray")
    .attr("fill", function(d){ 
      console.log("ENTER"); 
      if(d.active) return sentiment_scale(d.av_sentiment)
      else return faded_color
      })
    .on("mouseover", handle_tip_open)
    .on("mouseout", handle_tip_close);

  posts_update.transition()
    .duration(30)
    .select(".post_node_circles")
    .attr("fill", function(d){
      if(d.active) return sentiment_scale(d.av_sentiment)
      else return faded_color
    })
    .attr("r", function(d) { 
      if(d.active) return n_posts_scale(d.n_posts);
      else return faded_size
      })
  

  // Drawing topic nodes
  var topics_update = container
    .selectAll(".topic_node")
    .data(topics)
  var topic_nodes_container = topics_update
    .enter().append("g")
    .attr("class", "topic_node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("contextmenu", handle_contextmenu);
  topic_nodes_container
    .append("rect")
    .attr("width", function(d){ return n_total_scale(d.n_posts_total)})
    .attr("height", function(d){ return n_total_scale(d.n_posts_total) })
    .attr("transform", function(d){ return "translate("+(-n_total_scale(d.n_posts_total)/2)+","+(-n_total_scale(d.n_posts_total)/2)+")";})
    .attr("stroke-width","1.5px")
    .attr("stroke", "black")
    .attr("class", "to_emphaze")
    .attr("fill",function(d){return sentiment_scale(d.av_sentiment_total)})  
  topic_nodes_container
    .append("text")
    .text(function(d){return topics_dict[d.name]})
    .style("font-size", "20px")
    .style("dominant-baseline", "middle")
    .style("text-anchor", "middle")

  topic_nodes = container.selectAll(".topic_node")
  post_nodes = container.selectAll(".post_node")
  path = container.selectAll(".path")
}

// add the curvy lines
function tick() {
  if(path!=undefined){
    path
      .attr("x1", function(d) {
        return fixna(d.source.x);
      })
      .attr("y1", function(d) {
        return fixna(d.source.y);
      })
      .attr("x2", function(d) {
        return fixna(d.target.x);
      })
      .attr("y2", function(d) {
        return fixna(d.target.y);
      });

    topic_nodes.attr("transform", function(d) {
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });

    post_nodes.attr("transform", function(d) {
      return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
    });
  }
}

drag_start_x = undefined
drag_start_y = undefined
drag_start_time = undefined

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  if (!d3.event.active) force.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  dragged_state = true;

  // saving infos
  drag_start_x = d.x
  drag_start_y = d.y
  drag_start_time = performance.now()
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) force.alphaTarget(0);
  if (d.fixed == true) {
      d.fx = d.x;
      d.fy = d.y;
  }
  else {
      d.fx = null;
      d.fy = null;
  }
  dragged_state = false;

  // processing infos
  var delta_x = d.x-drag_start_x
  var delta_y = d.y-drag_start_y
  var delta_time = performance.now() - drag_start_time
  if((delta_x*delta_x + delta_y*delta_y)<4 && delta_time<300){
    var win = window.open("./aggregated_posts_details.html?topics="+d.topics.join(""), '_blank');
    win.focus();
  }
}

function handle_tip_open(d) {
  if(dragged_state==false &&oversize_circle == false){
    oversize_circle = true
    var this_obj = d3.select(this)
    this_obj.transition()
      .duration(100)
      .attr("r", 1.5*this_obj.attr("original_r"))
  }
  if (dragged_state) tip.hide();
  else tip.show(d);
}

function handle_tip_close(d){
  if(dragged_state==false && oversize_circle == true){
    this_obj = d3.select(this)
    this_obj.transition()
      .duration(100)
      .attr("r", this_obj.attr("original_r"))
    oversize_circle = false
  }
  tip.hide()
}

function handle_contextmenu (d, i) {
  d3.event.preventDefault();
  d.fixed = !d.fixed
  var obj = d3.select(this).select(".to_emphaze")
  if (d.fixed == true) {
    d.fx = d.x;
    d.fy = d.y;
    obj.attr("initial-stroke-width", d3.select(this).attr("stroke-width"))
    obj.attr("stroke-width","5px")
  } else {
    d.fx = null;
    d.fy = null;
    obj.attr("stroke-width", d3.select(this).attr("initial-stroke-width"))
  }
  force.restart()
}

function update_zoom(type){
  var transition_time = 300
  switch(type) {
    case -1:
      zoom.scaleBy(svg.transition().duration(transition_time), 0.8);
      break;
    case 1:
      zoom.scaleBy(svg.transition().duration(transition_time), 1.1);
      break;
    default:
      zoom_call.transition()
        .duration(transition_time)
        .call(zoom.transform, d3.zoomIdentity);
  }
  
}