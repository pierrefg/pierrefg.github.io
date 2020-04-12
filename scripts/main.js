window.onload = load_data;

function load_data() {
    data = d3.csv("./data/topic_graph.csv").then(ready)
}

function ready(data){
    draw_topic_graph(data)
}