class Map{
    constructor(geometryService) {
        this.coord = new Object();
        this.graph = null;
        this.latRange = 0;
        this.longRange = 0;
        
        //dependancy injection
        this.geometry = geometryService;
    }
    
    load(mapFile){
        let object = this;
        $("#loaderEl").show();
        $.ajax({
            url: "http://localhost:8080/map/"+mapFile,
            type:"GET"
        }).done(function(map) {
            let latRange = [Number.MAX_VALUE, Number.MIN_VALUE];
            let longRange = [Number.MAX_VALUE, Number.MIN_VALUE];

            let graph = map.graph
            object.graph = graph;
            for (var seg in graph) {
                object.coord[seg]=graph[seg][0].start;
            };

            for (var seg in graph) {
                if(object.coord[graph[seg][0].end.id] === undefined){
                    object.coord[graph[seg][0].end.id] = graph[seg][0].end; 
                }
            };

            for (var node in object.coord) {
                let lat = object.coord[node].latitude;
                let long = object.coord[node].longitude;
                if(latRange[0]>lat) latRange[0]=lat;
                if(latRange[1]<lat) latRange[1]=lat;
                if(longRange[0]>long) longRange[0]=long;
                if(longRange[1]<long) longRange[1] =long;
            }

            object.geometry.latRange = latRange;
            object.geometry.longRange = longRange;

            Ctrl.View.update();
            Ctrl.state = new MapState(object.geometry);
        }).fail(function(textStatus){
            let status = textStatus.status;
            if(status === 422){
                alertBox("Erreur critique, resynchronisation des serveurs...");
                Ctrl.reset();
            }else if(status === 500){
                alertBox("Le fichier de plan est corrompu.");
                Ctrl.state = new InitState(object.geometry);
            }else{
                alertBox("Erreur : Le serveur n'est pas joignable !");
                Ctrl.state = new DelState(object.geometry);
            }
        }).always(function(){  
            $("#loaderEl").hide();
        });
    }

    display(){
        this.geometry.initLine("gray", 1, 1);
        for(var segListId in this.graph){
            let segList = this.graph[segListId];
            for(var seg in segList){
                let start = segList[seg].start;
                let end = segList[seg].end;
                this.geometry.line(start.longitude, start.latitude, end.longitude, end.latitude);
            }
        }
        this.geometry.drawLine();
    }

    highlightNode(nodeId){
        let node = this.coord[nodeId];
        this.geometry.initShape("yellow", 0.7);
        this.geometry.circle(node.longitude, node.latitude, 5);
        this.geometry.drawShape();
    }

    findBestNode(X,Y){
        let bestNode;
        let bestDistance = Number.MAX_VALUE;
        for (var prop in this.coord) {
            let node = this.coord[prop];
            let temp = this.geometry.distance(X,Y, this.geometry.norm(node.longitude, true), this.geometry.norm(node.latitude, false));
            if(temp<bestDistance){
                bestDistance = temp;
                bestNode = prop;
            }
        }
        return bestNode;
    }
}