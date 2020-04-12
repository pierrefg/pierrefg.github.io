function draw_legend(){
    d3.select("div#symbols_legend").html("")
    
    var factor = 0.3
    var circle_radi = factor*100
    var square_size= factor*200
    var icon_size = factor*150
    var text_padding = factor*320
    var stroke = factor*8
    var font_size = factor*100

    var legend_viewbox = get_viewbox("symbols_legend")
    var legend_container = legend_viewbox.append("g")
        .attr("transform", "translate(0, -10)")

    // Init tip
    d3.select("div#circle_legend_tooltip").remove()
    circle_tip = d3.tip()
        .attr("id", "circle_legend_tooltip")
        .style("z_index", 20000)
        .direction('e')
        .html("<div id='circle_tooltip_svg'></div>");
    legend_viewbox.call(circle_tip)

    // drawing line
    legend_container.append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", stroke)
        .attr("x1", circle_radi+stroke)
        .attr("y1", viewbox_h(legend_viewbox)/2)
        .attr("x2", viewbox_w(legend_viewbox)-square_size/2-stroke)
        .attr("y2", viewbox_h(legend_viewbox)/2)
    legend_container.append("image")
        .attr("xlink:href","./img/question.svg")
        .attr("width", icon_size)
        .attr("height", icon_size)
        .attr("x", viewbox_w(legend_viewbox)/2-icon_size/2)
        .attr("y", viewbox_h(legend_viewbox)/2-icon_size/2)
        .style("cursor", "pointer")
        .on("mouseover", function(d){ circle_tip_handle("line") })
        .on("mouseout", circle_tip.hide);
    

    var circle_container = legend_container.append("g")
        .attr("transform", "translate("+(circle_radi+stroke)+","+viewbox_h(legend_viewbox)/2+")")
    circle_container.append("circle")
        .attr("r", circle_radi)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", "white")
        .attr("stroke", "#aaa")
        .attr("stroke-width", stroke)
    circle_container.append("image")
        .attr("xlink:href","./img/question.svg")
        .attr("width", icon_size)
        .attr("height", icon_size)
        .attr("x", -icon_size/2)
        .attr("y", -icon_size/2)
        .style("cursor", "pointer")
        .on("mouseover", function(d){ circle_tip_handle("circle") })
        .on("mouseout", circle_tip.hide);
    
    var square_container = legend_container.append("g")
        .attr("transform", "translate("+(viewbox_w(legend_viewbox))+","+(viewbox_h(legend_viewbox)/2)+")")
    square_container.append("rect")
    .attr("width", square_size)
    .attr("height", square_size)
    .attr("x", -square_size/2-stroke)
    .attr("y", 0)
    .attr("transform", function(d){ return "translate("+(-square_size/2)+","+(-square_size/2)+")";})
    .attr("stroke-width", stroke)
    .attr("stroke", "black")
    .attr("fill", "white")
    square_container.append("image")
        .attr("xlink:href","./img/question.svg")
        .attr("width", icon_size)
        .attr("height", icon_size)
        .attr("x", -square_size/2-stroke-icon_size/2)
        .attr("y", -icon_size/2)
        .style("cursor", "pointer")
        .on("mouseover", function(d){ circle_tip_handle("square") })
        .on("mouseout", circle_tip.hide);

    // TEXT
    legend_container.append("text")
        .text("posts")
        .style("font-size", font_size)
        .attr("y", text_padding)
        .attr("x", 0)
        .style("text-anchor", "start")
    legend_container.append("text")
        .text("concern")
        .style("font-size", font_size)
        .attr("y", text_padding)
        .attr("x", viewbox_w(legend_viewbox)/2)
        .style("text-anchor", "middle")
    legend_container.append("text")
        .text("topic")
        .style("font-size", font_size)
        .attr("y", text_padding)
        .attr("x", viewbox_w(legend_viewbox))
        .style("text-anchor", "end")

}

function circle_tip_handle(type){
    if (type != "line"){
        d3.select("#circle_legend_tooltip")
            .style("width", 600+"px")
            .style("height", 300+"px")        
    }else{
        d3.select("#circle_legend_tooltip")
            .style("width", 400+"px")
            .style("height", 170+"px")
    }
    d3.select("#circle_tooltip_svg").html("")

    circle_tip.show()
    var viewbox = get_viewbox("circle_tooltip_svg")
    var container = viewbox.append("g")

    var normal_text_size = 15
    var title_text_size = 25
    var side_margin = 20

    if(type!="line"){
        // NUMBER OF POSTS
        var n_posts_container = container
            .append("g")
            .attr("transform", "translate(" + 0 + "," + 40 + ")");
        if(type=="circle") {
            var n_posts_values = legend_data["nodes_n_posts"].px_values.map(function(x) { return  x*topic_graph_zoom.k; });
            var n_post_x = n_posts_values[0]+side_margin
            var step = (viewbox_w(viewbox)-n_posts_values[2]-n_post_x-side_margin)/2
            n_posts_container.selectAll(".n_posts_circles")
                .data(n_posts_values).enter()
                .append("circle")
                .attr("class", "n_posts_circles")
                .attr("cx", function(d){
                    tmp=n_post_x; 
                    n_post_x+=step; 
                    return tmp;})
                .attr("cy", 60)
                .attr("r", function(d){ return d })
                .attr("fill", "white")
                .attr("stroke", "#aaa")
                .attr("stroke-width", 1.5)
            n_post_x = n_posts_values[0]+20
            n_posts_container.selectAll(".n_posts_circles_labels")
                .data(legend_data["nodes_n_posts"].values).enter()
                .append("text")
                .attr("class", "n_posts_circles_labels")
                .text(function(d){ return Math.round(d); })
                .attr("x", function(d){
                    tmp=n_post_x; 
                    n_post_x+=step; 
                    return tmp;})
                .attr("y", function(d, i){ return 80+n_posts_values[i] })
                .attr("text-anchor", "middle")
                .attr("font-size", normal_text_size)
            n_posts_container.append("text")
                .text("Number of aggregated posts")
                .attr("font-size", title_text_size)
        }else{
            square_margin = 5
            var n_posts_values = legend_data["topics_n_total"].px_values.map(function(x) { return  x*topic_graph_zoom.k; });
            var n_post_x = n_posts_values[0]/2+square_margin
            var step = (viewbox_w(viewbox)-n_posts_values[2]/2-n_post_x-square_margin)/2
            n_posts_container.selectAll(".n_posts_circles")
                .data(n_posts_values).enter()
                .append("rect")
                .attr("class", "n_posts_circles")
                .attr("width", function(d){return d})
                .attr("height", function(d){return d })
                .attr("transform", function(d){ 
                    tmp=n_post_x; 
                    n_post_x+=step; 
                    return "translate("+(tmp-d/2)+","+(60-d/2)+")";})
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
            var n_post_x = n_posts_values[0]/2+square_margin
            n_posts_container.selectAll(".n_posts_circles_labels")
                .data(legend_data["topics_n_total"].values).enter()
                .append("text")
                .attr("class", "n_posts_circles_labels")
                .text(function(d){ return Math.round(d); })
                .attr("x", function(d){
                    tmp=n_post_x; 
                    n_post_x+=step; 
                    return tmp;})
                .attr("y", function(d, i){ return 65 })
                .attr("text-anchor", "middle")
                .attr("font-size", normal_text_size)
            n_posts_container.append("text")
                .text("Total number of posts on this topic")
                .attr("font-size", title_text_size)
        }


        // OVERALL SENTIMENT
        var sentiment_container = container
            .append("g")
            .attr("transform", "translate(" + 0 + "," + 180 + ")");
        sentiment_container.append("text")
            .text("Overall sentiment")
            .attr("font-size", title_text_size)
        init_gradient(viewbox, "sentiment_grad")
        var gradient_padding = 20
        var gradient_height = 40
        var gradient_radi = 10
        var text_padding = 25
        sentiment_container.append("rect")
            .attr("width", viewbox_w(viewbox)-2*side_margin)
            .attr("height", gradient_height)
            .attr("rx", gradient_radi)	
            .attr("ry", gradient_radi)	
            .attr("x", side_margin)
            .attr("y", gradient_padding)
            .attr("stroke-width","1.5px")
            .attr("stroke", "black")
            .style("fill", "url(#sentiment_grad)");
        sentiment_container.append("text")
            .text("bad")
            .attr("x", side_margin)
            .attr("y", gradient_padding+gradient_height+text_padding)
            .attr("text-anchor", "start")
            .attr("font-size", normal_text_size)
        sentiment_container.append("text")
            .text("neutral")
            .attr("x", viewbox_w(viewbox)/2)
            .attr("y", gradient_padding+gradient_height+text_padding)
            .attr("text-anchor", "middle")
            .attr("font-size", normal_text_size)
        sentiment_container.append("text")
            .text("good")
            .attr("x", viewbox_w(viewbox)-side_margin)
            .attr("y", gradient_padding+gradient_height+text_padding)
            .attr("text-anchor", "end")
            .attr("font-size", normal_text_size)
    }else{
        var probability_container = container
            .append("g")
            .attr("transform", "translate(" + 0 + "," + 40 + ")");
        probability_container.append("text")
            .text("Topic strenght level")
            .attr("font-size", title_text_size)
        strengths = legend_data["links"].px_values.map(function(x) { return  x*topic_graph_zoom.k; });
        var y = 30
        var y_step = 30
        probability_container.selectAll(".line_strengh")
            .data(strengths).enter()
            .append("line")
            .attr("class", "line_strengh")
            .attr("x1", side_margin)
            .attr("y1",  function(d) {
                var tmp = y;
                y = y+y_step;
                return tmp;})
            .attr("x2", viewbox_w(viewbox)-side_margin-10)
            .attr("y2", function(d) { return d3.select(this).attr("y1") })
            .attr("stroke", "#aaa")
            .attr("stroke-width", function(d) { return d; });
        var y = 30
        probability_container.selectAll(".line_strengh_text")
            .data(legend_data["links"].values).enter()
            .append("text")
            .attr("class", "line_strengh_text")
            .text(function(d) { return d })
            .attr("x", viewbox_w(viewbox)-side_margin)
            .attr("y", function(d) {
                var tmp = y;
                y = y+y_step;
                return tmp;})
            .attr("font-size", normal_text_size)
    }
}
