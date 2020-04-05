window.onload = load_data;
dragged_state = false;
sentiment_scale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(['red','white','green']);

topics_dict = {
  0: "Millenial",
  1: "Foodie",
  2: "Parent",
  3: "Rural",
  4: "non-Minnesotan"
}

function load_data() {
    data = d3.csv("./data/topic_graph.csv").then(ready)
}

function ready(data){ 
    draw_topic_graph(data)
}

function preprocess_topic_graph(data){
    links = []
    nodes = {}
    
    data.forEach(function(row) {
      link = {}
      link.source = nodes[row.source] || (nodes[row.source] = { name: row.source, post: true});
      link.target = nodes[row.target] || (nodes[row.target] = { name: parseInt(row.target), post: false});
      link.strength = parseFloat(row.strength_of_link)
      links.push(link)
      // Filling source nodes
      nodes[row.source].n_posts = nodes[row.source].n_posts || parseInt(row.source_number_of_posts);
      nodes[row.source].av_sentiment = nodes[row.source].av_sentiment || parseFloat(row.source_sentiment);
      // Filling target nodes
      n_posts = nodes[row.source].n_posts
      nodes[row.target].n_posts_total = nodes[row.target].n_posts_total+n_posts || n_posts;
      nodes[row.target].av_sentiment_total = 
              nodes[row.target].av_sentiment_total+(n_posts*nodes[row.source].av_sentiment) 
              || (n_posts*nodes[row.source].av_sentiment);
      
    });

    for (let key in nodes) {
      console.log(key)
      nodes[key].av_sentiment_total /= nodes[key].n_posts_total
    }

    return [links, nodes]
}

function draw_topic_graph(data) {
    pdata = preprocess_topic_graph(data)
    links = pdata[0]
    nodes = pdata[1]
    
    // Init SVG
    width=d3.select("div#topic_graph").node().clientWidth
    height=d3.select("div#topic_graph").node().clientHeight
    svg = d3.select("div#topic_graph")
      .append("svg")
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("viewBox", "0 0 "+width+" "+height)
      .classed("svg-content", true)
    
    container = svg.append("g");
    
    center_ratio = 2    
    force = d3.forceSimulation()
      .nodes(d3.values(nodes))
      .force("link", d3.forceLink(links).distance(300).strength(1))
      .force('center', d3.forceCenter(svg.node().clientWidth/center_ratio, svg.node().clientHeight/center_ratio))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-2500))
      .on("tick", tick);
      
    // add the links and the arrows
    min_strength = d3.min(links.map(d=>d.strength))
    max_strength = d3.max(links.map(d=>d.strength))
    strength_scale = d3.scaleLinear()
      .domain([min_strength, max_strength])
      .range([0.5, 3]);
    path = container.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", function(d) { return strength_scale(d.strength) });

    // define the nodes
    posts = force.nodes().filter(function(node){return node.post})
    topics = force.nodes().filter(function(node){return !node.post})
    node = container.selectAll(".node")
    topic_node = node.data(topics)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    post_node = node.data(posts)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // draw the topic nodes
    square_size=120
    min_n_total = d3.min(Object.keys(nodes).map(d=>nodes[d].n_posts_total))
    max_n_total = d3.max(Object.keys(nodes).map(d=>nodes[d].n_posts_total))
    n_total_scale = d3.scaleLinear()
      .domain([min_n_total, max_n_total])
      .range([80, 130]);
    topic_node.append("rect")
        .attr("width", function(d){return n_total_scale(d.n_posts_total)})
        .attr("height", function(d){return n_total_scale(d.n_posts_total) })
        .attr("transform", function(d){ return "translate("+(-n_total_scale(d.n_posts_total)/2)+","+(-n_total_scale(d.n_posts_total)/2)+")";})
        .attr("stroke-width","1.5px")
        .attr("stroke", "black")
        .attr("fill",function(d){return sentiment_scale(d.av_sentiment_total)})
    topic_node.append("text")
        .text(function(d){return topics_dict[d.name]})
        .style("font-size", "20px")
        .style("dominant-baseline", "middle")
        .style("text-anchor", "middle")

    // draw the post nodes
    // Init tip element
    tip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        content = `
        IT'S A POST AGGREGATION FOR GOD'S SAKE!!!
        <div id="tip_arrow">&#9660</div>
        `;
      return content;
    });
    container.call(tip)

    min_n_posts = d3.min(Object.keys(nodes).map(d=>nodes[d].n_posts))
    max_n_posts = d3.max(Object.keys(nodes).map(d=>nodes[d].n_posts))
    n_posts_scale = d3.scaleLinear()
      .domain([min_n_posts, max_n_posts])
      .range([10, 45]);
    post_node.append("circle")
        .attr('class','post_node')
        .attr("r", function(d) { return n_posts_scale(d.n_posts); })
        .attr("stroke-width","1px")
        .attr("stroke", "gray")
        .attr("fill", function(d){ return sentiment_scale(d.av_sentiment)})
        .on("mouseover", handle_tip)
        .on("mouseout", tip.hide);

    svg.call(
      d3.zoom()
          .scaleExtent([.5, 3])
          .on("zoom", function() { container.attr("transform", d3.event.transform); })
    );
}

function fixna(x) {
  if (isFinite(x)) return x;
  return 0;
}

// add the curvy lines
function tick() {
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

  topic_node.attr("transform", function(d) {
    return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
  });

  post_node.attr("transform", function(d) {
    return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
  });
}

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  if (!d3.event.active) force.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  dragged_state = true;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) force.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  dragged_state = false;
}

function handle_tip(d) {
  if (dragged_state) tip.hide();
  else tip.show();
}