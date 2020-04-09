function get_viewbox(id){
    var width = d3.select("div#"+id).node().clientWidth
    var height = d3.select("div#"+id).node().clientHeight
    var svg = d3.select("div#"+id)
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("viewBox", "0 0 "+width+" "+height)
        .classed("svg-content", true)
    return svg
}


function viewbox_h(viewBox){
    return viewBox.node().clientHeight
}

function viewbox_w(viewBox){
    return viewBox.node().clientWidth
}

function init_gradient(viewbox, name){
    var sentiment_gradient = viewbox.append("defs").append("linearGradient")
    .attr("id", name)
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    sentiment_gradient.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "red")
    .style("stop-opacity", 1)
    sentiment_gradient.append("stop")
    .attr("offset", "50%")
    .style("stop-color", "white")
    .style("stop-opacity", 1)
    sentiment_gradient.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "green")
    .style("stop-opacity", 1)
}