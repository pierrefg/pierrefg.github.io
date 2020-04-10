function init_filters(){
    d3.select("div#sentiment_range").html("")
    var width = d3.select("div#sentiment_range").node().clientWidth
    var height = d3.select("div#sentiment_range").node().clientHeight

    var svg = d3
        .select('div#sentiment_range')
        .append('svg')
    var sliderRange = d3
        .sliderBottom()
        .min(params.sentiment[0])
        .max(params.sentiment[1])
        .width(0.8*width)
        .tickFormat(d3.format('.2%'))
        .ticks(5)
        .handle(
            d3
              .symbol()
              .type(d3.symbolCircle)
              .size(200)()
        )
        .default([0, 1])
        .fill('#2196f3')
        .on('onchange', val => { 
            params.sentiment = val
            update_topic_graph() });
    var gRange = svg
        .attr('width', width)
        .attr('height', 100)
        .append('g')
        .attr('transform', "translate("+0.1*width+",30)");

    gRange.call(sliderRange);
}