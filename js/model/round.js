class Round{
    constructor(geometryService){
        this.paths = new Object();
        this.userPaths = new Object();
        this.colors = ["green", "red", "purple", "blue", "lime", "aqua", "olive", "teal", "maroon", "#E74C3C", "#9B59B6", "#2980B9", "#3498DB", "#1ABC9C", "#27AE60", "#2ECC71", "#F1C4OF", "#F39C12"];
        this.firstPath = -1;
        this.stop=null;

        //dependancy injection
        this.geometry = geometryService;
    }

    load(action, num1, num2){
        let apiUrl = "http://localhost:8080/";
        switch(action){
            case "init":
                apiUrl+="calculation/start/"+num1;
                Ctrl.state = new CalculatingState(this.geometry);
                break;
            case "add":
                apiUrl+="delivery/add/"+num1+"/"+num2;
                break;
            case "remove1":
                apiUrl+="delivery/rmv/"+num1+"/true";
                break;
            case "remove2":
                apiUrl+="delivery/rmv/"+num1+"/false";
                break;
            case "undo":
                apiUrl+="undo";
                break;
            case "redo":
                apiUrl+="redo";
                break;
        }
        
        
        let object = this;
        $("#loaderEl").show();
        let ajaxTime= new Date().getTime();
        $.ajax({
            url: apiUrl,
            type:"GET"
        }).done(function( data ) {
            console.log(data);
            var totalTime = new Date().getTime()-ajaxTime;
            alertBox("  "+totalTime/1000+"s");
  
            $("#pathMenu").html("");
            delete object.paths;
            delete object.userPaths;
            delete Ctrl.View.Deliveries.delNodes;
            delete Ctrl.View.Deliveries.userDelNodes;
            object.userPaths = new Object();
            object.paths = new Object();
            Ctrl.View.Deliveries.userDelNodes = new Object();
            Ctrl.View.Deliveries.delNodes = new Object();

            var endTimes = [];
            var cmpt = 0;
            for(var i in data){
                let color1 = object.colors[cmpt];
                for(var z = 0; z<data[i].listRound.length; z++){
                    let round = data[i].listRound[z].listPath;
                    let deliveryTemp = [];
                    let temp = {display:true, color:color1, data:[], departureTime:{hours:8, minutes:0, seconds:0}, arrivalTime:data[i].listRound[0].endTime};

                    for(var j in round){
                        let path = round[j].listSegment;
                        let roundPart = [];
                        for(var k in path){
                            var el = path[k];
                            roundPart.push({start:el.start.id, end:el.end.id, passageTime:el.passageTime});
                        }
                        let arrival = round[j].arrival;
                        temp.data.push(roundPart); //REVOIR
                        deliveryTemp.push({id:arrival.id, timeArrival:arrival.timeArrival, duration:arrival.duration, color: color1, idPath: cmpt});
                    }

                    if(z===(data[i].listRound.length-1)){
                        endTimes.push(data[i].listRound[z].endTime);
                    }

                    if(z === 0){
                        $("#pathMenu").append(object.createPathHtml(color1, data[i].listRound[0].startTime, data[i].listRound[0].endTime, cmpt));
                        
                        object.paths[cmpt] = temp;
                        Ctrl.View.Deliveries.delNodes[cmpt] = deliveryTemp;
                    }else{
                        object.userPaths[cmpt] = temp;
                        Ctrl.View.Deliveries.userDelNodes[cmpt] = deliveryTemp;
                    }
                }
                cmpt++;
            }
            console.log(endTimes);
            delete Ctrl.View.Deliveries.delNodes[-1];
            initSlider(endTimes);
            Ctrl.View.update();
            Ctrl.state = new CalcState(object.geometry);
        }).fail(function(textStatus){
            let status = textStatus.status;
            if(status === 422){
                alertBox("Erreur critique, resynchronisation des serveurs...");
                Ctrl.reset();
            }else if(status === 400){
                alertBox("Un problème est survenu, vous tentez peut-être de livrer dans une impasse ?");
            }else if(status === 401){
                switch(action){
                    case "undo":
                        alertBox("Rien à annuler.");
                        break;
                    case "redo":
                        alertBox("Rien à rétablir.");
                        break;
                }
            }else if(status === 406){
                alertBox("La requête oblige les livraisons à finir après 18h, veuillez réduire le nombre de livraisons ou augmenter le nombre de livreurs");
            }else if(status === 410){
                alertBox("Nothing to undo");
            }else if(status === 411){
                alertBox("Nothing to redo");
            }else{
                alertBox("Erreur : Le serveur n'est pas joignable !");
                Ctrl.state = new DelState(object.geometry);
            }
        }).always(function(){
            $("#loaderEl").hide();
        });
    }
    
    display(coord, time){
        for(var i in this.paths){
            if(this.paths[i].display && (this.firstPath===-1 || (i!=this.firstPath))){
                let totalPath = this.paths[i].data;
                this.drawSegment(totalPath, coord, this.paths[i].color, 1.5, time);
            }
        }

        for(var i in this.userPaths){
            if(this.userPaths[i].display && (this.firstPath===-1 || (i!=this.firstPath))){
                let totalPath = this.userPaths[i].data;
                this.drawSegment(totalPath, coord, this.userPaths[i].color, 1.5, time);
            }
        }
        
        let path = this.paths[this.firstPath];
        if(this.firstPath!=-1 && path.display){
            let totalPath = path.data;
            this.drawSegment(totalPath, coord, path.color, 2, time);
            if(this.userPaths != undefined && this.userPaths[this.firstPath] != undefined){
                let totalPath2 = this.userPaths[this.firstPath].data;
                this.drawSegment(totalPath2, coord, ctx, path.color, 2, time);
            }
        }
    }
    //[10,5]
    drawSegment(totalPath, coord, color, thickness, time){
        let present = true; //true if we are before time
        for(var j in totalPath){
            let path = totalPath[j];
            for(var j in path){
                if(compareTime(path[j].passageTime, time) > 0) present = false;
                if(present){
                    this.geometry.initLine(color, 1, thickness, []);
                }else{ 
                    this.geometry.initLine(color, 0.4, thickness, [10,5]);
                }
                let start = coord[path[j].start];
                let end = coord[path[j].end];
                this.geometry.line(start.longitude, start.latitude, end.longitude, end.latitude);
                this.geometry.drawLine();
            }
        }
    }

    switchPathDisplay(id, state){
        this.paths[id].display = state;
        if(this.userPaths[id] != undefined){
            this.userPaths[id].display = state;
        }
        return false;
    }

    createPathHtml(color, startTime, endTime, id){
        var temp =  "<div class='pathLine' id='pl"+id+"'>";
        temp += "<div id='colorSample' style='background-color:"+color+";'></div>";
        temp += "<p id='roundDes'>Départ : "+timeToString(startTime)+"<br>Arrivée : "+timeToString(endTime)+"</p>";
        temp += "<div class='delLineButtons'>";
        temp += "<button class='btn btn-warning viewButton' data-toggle='collapse' href='#cl"+id+"'><i class='fas fa-info-circle'></i></button>";
        temp += "<button class='btn btn-warning viewButton' onclick='Ctrl.pathToForeground("+id+");'><i class='fas fa-arrow-up'></i></button>";
        temp += "<button class='btn btn-warning viewButton' onclick='Ctrl.disableRound(this,"+id+")'><i class='fas fa-eye'></i></button>"
        temp += "</div></div>";
        temp += "<div class='collapse' id='cl"+id+"'><div class='card card-body' id='cl"+id+"t'></div></div>"
        return temp;
    }

    pathToForeground(id){
        this.firstPath = id;
    }
}