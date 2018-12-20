class Viewer{
    constructor(geometryService){
        this.Map;
        this.Deliveries;
        this.Round;

        this.time = {hours:19, minutes:59, seconds:59};
        this.geometry = geometryService;
    }

    /**
     * @desc Create a new map and load the data
     * @param string $mapFile - file to load
    */
    loadMap(mapFile){
        delete this.Deliveries;
        delete this.Round;

        this.Map = new Map(this.geometry);
        this.Map.load(mapFile);
    }

    /**
     * @desc Create a new Delivery object and load the data
     * @param string $mapFile - file to load
    */
    loadDeliveries(delFile){
        delete this.Round;

        this.Deliveries = new Deliveries(this.geometry);
        this.Deliveries.load(delFile);
    }

    /**
     * @desc Create and new Round object and load the data
     * @param string $mapFile - file to load
    */
    loadRound(num){
        this.Round = new Round(this.geometry);
        this.Round.load("init",num);
    }

    update(){
        this.geometry.clear();
        if(this.Map != null){
            this.Map.display();
            if(this.Round != null){
                this.Round.display(this.time);
            }
    
            if(this.Deliveries != null){
                this.Deliveries.display(this.time);
            }
        }
    }

    setupCanvas(){
        let width = $("#mapCol").width();
        let height = $("#mapCol").height();
    
        let ratio = this.getRetinaRatio();
        let scaledWidth = width * ratio;
        let scaledHeight = height * ratio;
        this.geometry.Canvas.ratio = ratio;

        $('#map')
            .attr('width', scaledWidth)
            .attr('id', "map")
            .attr('height', scaledHeight)
            .css('width', width + 'px')
            .css('height', height + 'px');
    
        var canvas = $("#map").get(0);
        this.geometry.Canvas.ctx = canvas.getContext("2d");
        this.geometry.Canvas.range = [0,canvas.height];
        this.geometry.Canvas.width = canvas.width;
        this.geometry.Canvas.height = canvas.height;
        this.geometry.Canvas.html = canvas;   
    }

    getRetinaRatio() {
        var devicePixelRatio = window.devicePixelRatio || 1
        var c = document.createElement('canvas').getContext('2d')
        var backingStoreRatio = [
            c.webkitBackingStorePixelRatio,
            c.mozBackingStorePixelRatio,
            c.msBackingStorePixelRatio,
            c.oBackingStorePixelRatio,
            c.backingStorePixelRatio,
            1
        ].reduce(function(a, b) { return a || b })

        return devicePixelRatio / backingStoreRatio
    }
}