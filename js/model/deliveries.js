/**
 * Coordinates the delivery data
 * It can loads and displays the delivery's data
 */
class Deliveries{
    /**
     * Primary constructor
     * @param {object} $geometryService - geometry service : dependancy injection
    */
    constructor(geometryService){
        this.warehouse = null;
        this.delNodes = new Object();
        this.userDelNodes = new Object();
        this.selectedDel = null;

        //dependancy injection
        this.geometry = geometryService;


        this.imgPin = new Image();
        this.imgPin.src = 'img/pin.png';
        this.imgHome = new Image();
        this.imgHome.src = 'img/home.png';
    }

    /**
     * Loads the deliveries from the backend, set the new state depending on the return code.
     * Handles error messages
     * @param {string} $delFile1 - file to load
    */
    load(delFile1){
        let object = this;
        let delFile = delFile1;
        $("#loaderEl").show();
        $.ajax({
            url: "http://localhost:8080/deliveries/dl-"+delFile,
            type:"GET"
        }).done(function(del) {
            console.log(del);
            var tmp = [];
            for(var el in del){
               tmp.push({id:del[el].id, duration:del[el].duration, color:"blue"});
            }
            object.delNodes[-1] = tmp;
            
            $.ajax({
                url: "http://localhost:8080/warehouse",
                type:"GET"
            }).done(function( del ) {
                object.warehouse = {id:del.id, duration:null, color:"red"};
                Ctrl.state = new DelState(object.geometry);
                Ctrl.View.update();
            }).fail(function(){
                alertBox("Warehouse data not loaded !");
                Ctrl.View.update();
                Ctrl.state = new MapState(object.geometry);
            }).always(function(){    
                $("#loaderEl").hide();
            });
        }).fail(function(textStatus){
            let status = textStatus.status;
            if(status === 422){
                alertBox("Erreur critique, resynchronisation des serveurs...");
                Ctrl.reset();
            }else{
                alertBox("Erreur : Le serveur n'est pas joignable !");
                Ctrl.View.update();
                Ctrl.state = new MapState(object.geometry);
            }
        }).always(function(){    
            $("#loaderEl").hide();
        });  
    }

    /**
     * Displays the deliveries (nodes + userNodes + wharehouse + pin + update the deliveries description)
     * @param {object} $time - current time
    */
    display(time){
        let coord = Ctrl.View.Map.coord;

        for(var del in this.delNodes){
            let pathNodes = this.delNodes[del];
            for(var i = 0; i < pathNodes.length-1; i++){
                this.geometry.initShape(pathNodes[i].color, 0.7);
                let node = coord[pathNodes[i].id];
                this.geometry.circle(node.longitude, node.latitude, 4);
                this.geometry.drawShape();
            }
        }

        for(var del in this.userDelNodes){
            let pathNodes = this.userDelNodes[del];
            for(var i = 0; i < pathNodes.length-1; i++){  
                this.geometry.initShape(pathNodes[i].color, 0.7);
                let node = coord[pathNodes[i].id];
                this.geometry.square(node.longitude, node.latitude, 8);
                this.geometry.drawShape();
            }
        }

        //affichage warehouse
        let node = coord[this.warehouse.id];
        this.geometry.imageDirect(this.imgHome, node.longitude, node.latitude, 0.8, 1);

        //afficha pin
        if(this.selectedDel!=null){
            let node = coord[this.selectedDel.id];
            this.geometry.imageDirect(this.imgPin, node.longitude, node.latitude, 0.8, 0.8);
        }

        if(this.delNodes[-1] === undefined){
            this.updatePathsInfo(time);
        }
        
    }

    /**
     * Updates the path delivery infos in the right panel
     * @param {time} $time - current time
    */
    updatePathsInfo(time){
        for(var j in this.delNodes){
            $("#cl"+j+"t").html(this.collapseFiller(this.delNodes[j], time));
        }
        for(var j in this.userDelNodes){
            $("#cl"+j+"t").append(this.collapseFiller(this.userDelNodes[j], time));
        }
    }

    /**
     * Creates a description of the path deliveries corresponding to the id according to the time given in parameter.
     * @param {int} $id - id of the path deliveries to describe
     * @param {time} $time - current time
     * @return {string} the description of the path in html
    */
    collapseFiller(pathDel, time){
        let past = true;
        let tmp = "";
        for(var j = 0; j<pathDel.length; j++){
                let del = pathDel[j];
                tmp+="<span class='selectable' onclick='Ctrl.View.Deliveries.selectDelivery("+del.id+")'>";
                if(this.selectedDel!=null && this.selectedDel === del){
                    tmp+="<b>"+(j+1)+" - Livraison à : "+timeToString(del.timeArrival)+ ", durée : "+ secondsToMS(del.duration) + " (sélectionnée)</b>";
                }else{
                    if(del.id === this.warehouse.id){
                        tmp+="<i class='fas fa-home'></i> - Entrepot, Arrivée à "+timeToString(del.timeArrival)+"<br/>";
                        break;
                    }
                    if(past && compareTime(del.timeArrival,time)>=0){
                        past=false;
                    }
                    if(past){
                        tmp+="<i>"+(j+1)+" - Livraison à : "+timeToString(del.timeArrival)+ ", durée : "+ secondsToMS(del.duration) + "</i>";
                    }else{
                        tmp+=(j+1)+" - Livraison à : "+timeToString(del.timeArrival)+ ", durée : "+ secondsToMS(del.duration);
                    }
                }
                tmp+="</span>"
        }
        return tmp;
    }

    /**
     * Finds the closest delivery node to the coordinates given in param
     * The closest closest delivery must be less than 25 far from the cursor (this should be given as parameter)
     * @param {int} $X - X coordinate
     * @param {int} $Y - Y coordinate
     * @return returns null if no close del node was found, return the node otherwise
    */
    findBestDelivery(X,Y){
        let bestDelId = null;
        var bestDistance = Number.MAX_VALUE;
        for (var i in this.delNodes) {
            let path = this.delNodes[i];
            if(this.userDelNodes[i] != undefined){
                path = path.concat(this.userDelNodes[i]);
            }
            for(var j in path){
                let node = Ctrl.View.Map.coord[path[j].id];
                let temp = this.geometry.distance(X,Y, this.geometry.norm(node.longitude, true), this.geometry.norm(node.latitude, false));
                if(node.id != this.warehouse.id && temp<bestDistance){
                    bestDistance = temp;
                    bestDelId = node.id;
                }
            }
        }
        console.log(bestDelId);
        if(bestDistance>25){
            return null;
        }else{
            return bestDelId;
        }
    }

    /**
     * Toggles the right infos in the right section according to the node in param
     * @param {long} $nodeId - nodeId ?delivery to wich we need to display the infos
    */
    selectDelivery(nodeId){
        //lets check if it is really a delivery
        var node = null;
        for(var k in this.delNodes){
            let delPath = this.delNodes[k];
            for(var i = 0; i<delPath.length-1; i++){
                if(delPath[i].id === nodeId) node = delPath[i];
            }
        }
        for(var k in this.userDelNodes){
            let delPath = this.userDelNodes[k];
            for(var i = 0; i<delPath.length-1; i++){
                if(delPath[i].id === nodeId) node = delPath[i];
            }
        }

        //lets toggle the menus
        if(node != null){
            let time = node.timeArrival;
            Ctrl.changeTime(timeToSlider(time), true);
        }

        if(node === null){
            $(".collapse").collapse("hide");
            this.selectedDel = null;
            Ctrl.View.update();
            return;
        }

        if(this.selectedDel != null && (node.idPath != this.selectedDel.idPath)){
            Ctrl.pathToForeground(node.idPath);
            //$(".collapse").collapse("hide");
            $("#cl"+node.idPath).collapse('show');
        }else{
            $("#cl"+node.idPath).collapse('show');
        }

        this.selectedDel = node;
        Ctrl.View.update();
    }

    /**
     * Add a delivery
     * @param {nodeId} $node - node' id to remove
     * @return {boolean} true if the node was added succesfully, false otherwise
    */
   addUserDelivery(nodeId, duration){
        let good = true;
        for(var i in this.delNodes){
            let path = this.delNodes[i];
            if(this.userDelNodes[i] != undefined){
                path = path.concat(this.userDelNodes[i]);
            }
            for(var j in path){
                if(nodeId === path[j].id) good=false;
            }
        }

        if(good){
            Ctrl.View.Round.load("add",nodeId, duration);
            return true;
        }else{
            alertBox("Point already on map !");
            return false;
        }
    }

    /**
     * Remove a delivery 
     * @param nodeId $node - node' id to remove
     * @return {boolean} true if the node was removed succesfully, null otherwise
    */
    rmvUserDelivery(nodeId){
        let good = false;
        for(var i in this.delNodes){
            let path = this.delNodes[i];
            if(this.userDelNodes[i] != undefined){
                path = path.concat(this.userDelNodes[i]);
            }
            for(var j in path){
                if(nodeId === path[j].id){
                    good=true;
                } 
            }
        }

        if(good){
            $('#changePath').attr("onclick", "Ctrl.View.Round.load('remove1',"+nodeId+");");
            $('#keepPath').attr("onclick", "Ctrl.View.Round.load('remove2',"+nodeId+");");
            $('#modalRemove').modal('show');
            return true;
        }else{
            alertBox("No point found !");
            return false;
        }
    }
};