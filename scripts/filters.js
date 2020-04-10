function init_filters(){
    var width = d3.select("div.filter_div").node().clientWidth
    for(filter_key in filters){
        var filter = filters[filter_key]
        var selector = "div#"+filter.div_id

        d3.select(selector).html("")
        var svg = d3
            .select(selector)
            .append('svg')

            sliderRange = init_slider(filter_key).width(0.8*width)
                            
            var gRange = svg
                .attr('width', width)
                .attr('height', 100)
                .append('g')
                .attr('transform', "translate("+0.1*width+",30)");
            
            gRange.call(sliderRange);
    }
}

function init_slider(key){
    return sliderRange = d3
        .sliderBottom()
        .min(filters[key].range[0])
        .max(filters[key].range[1])
        .tickFormat(d3.format(filters[key].format))
        .ticks(filters[key].ticks)
        .handle(
            d3
            .symbol()
            .type(d3.symbolCircle)
            .size(200)()
        )
        .default(filters[key].vals)
        .fill('#2196f3')
        .on('onchange', range => { 
            filters[key].vals = range
            update_topic_graph() });
}