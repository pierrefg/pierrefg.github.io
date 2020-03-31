window.onload = load_data;
var dragged_state=false;

function load_data() {
    var promises = [
        get_dummy_graph(),
        get_dummy_nodes_infos()
    ]
    Promise.all(promises).then(ready)
}

function ready(data){
    draw_topic_graph(data[0])
}

function draw_topic_graph(links) {
    nodes = {}
    links.forEach(function(link) {
        link.source = nodes[link.source] ||
            (nodes[link.source] = {name: link.source, post: true});
        link.target = nodes[link.target] ||
            (nodes[link.target] = {name: link.target, post: false});
    });

    width=d3.select("div#topic_graph").node().clientWidth
    height=d3.select("div#topic_graph").node().clientHeight
    svg = d3.select("div#topic_graph")
      .append("svg")
      //.attr("width", width)
      //.attr("height", height)
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
    path = container.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", "1px");

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
    topic_node.append("rect")
        .attr("width", function(d){return square_size})
        .attr("height", function(d){return square_size})
        .attr("transform", function(d){ return "translate("+(-square_size/2)+","+(-square_size/2)+")";})
        .attr("stroke-width","1px")
        .attr("stroke", "black")
        .attr("fill","white")
    topic_node.append("text")
        .text(function(d){return d.name})
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

    var color = d3.scaleLinear()
                  .domain([0, 0.5, 1])
                  .range(['red','white','green']);
    post_node.append("circle")
        .attr('class','post_node')
        .attr("r", function(d) { 
            d.weight = links.filter(function(l) {
            return l.source.name == d.name || l.target.name == d.name
            }).length;      
            var minRadius = 10;
            return minRadius + (d.weight * 1.8);
        })
        .attr("stroke-width","1px")
        .attr("stroke", "black")
        .attr("fill", function(d){ return color(Math.random())})
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
    path.attr("x1", function(d) { return fixna(d.source.x); })
        .attr("y1", function(d) { return fixna(d.source.y); })
        .attr("x2", function(d) { return fixna(d.target.x); })
        .attr("y2", function(d) { return fixna(d.target.y); });

    topic_node.attr("transform", function(d) {
        return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")"; 
    });

    post_node.attr("transform", function(d) {
        return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")"; 
    });
};

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
    dragged_state=true;
};

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
};

function dragended(d) {
  if (!d3.event.active) force.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  dragged_state=false;
};

function handle_tip(d) {
    if(dragged_state) tip.hide()
    else tip.show()
}

function get_dummy_graph(){
    data= [
        {
          "source": "0564",
          "target": "Sport",
        },
        {
          "source": "0564",
          "target": "Fashion"
        },
        {
          "source": "0564",
          "target": "Tech"
        },
        {
          "source": "7457",
          "target": "Sport"
        },
        {
          "source": "7457",
          "target": "Fashion"
        },
        {
          "source": "3465",
          "target": "Sport"
        },
        {
          "source": "6544",
          "target": "Fashion"
        },
        {
          "source": "4564",
          "target": "Tech"
        }
    ]
    return data
}

function get_dummy_nodes_infos(){
    data= [
        {
          "source": "0564",
          "target": "Sport",
        },
        {
          "source": "0564",
          "target": "Fashion"
        },
        {
          "source": "0564",
          "target": "Tech"
        },
        {
          "source": "7457",
          "target": "Sport"
        },
        {
          "source": "7457",
          "target": "Fashion"
        },
        {
          "source": "3465",
          "target": "Sport"
        },
        {
          "source": "6544",
          "target": "Fashion"
        },
        {
          "source": "4564",
          "target": "Tech"
        }
    ]
    return data
}