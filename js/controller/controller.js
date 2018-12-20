/**
 * Coordinates the whole application
 * It handles the view, initiate the geometry service, change states and a displays stuff
 */
class Controller{
    constructor(){
        this.selectedMap = $("#mapSelector").val().toLowerCase();
        this.selectedDel = "grand-12";
        this.View;
        this.state = new InitState();

        //Interaction
        this.lastX; this.lastY;
        this.dragged = false;
        this.clicked = false;

        //Geometry service
        this.geometry = new Geometry();
    }

    loadDeliveries(){
        this.View.loadDeliveries(this.selectedDel);
    }

    loadRound(){
        if(this.state.constructor.name === "CalculatingState"){
            $.ajax({
                url: "http://localhost:8080/calculation/stop/",
                type:"GET"
            }).done(function(del) {
                
            }).fail(function(textStatus){
                let status = textStatus.status;
                if(status === 422){
                    alertBox("Erreur critique, resynchronisation des serveurs...");
                    Ctrl.reset();
                }else{
                    alertBox("Erreur : Le serveur n'est pas joignable !");
                    Ctrl.reset();
                }
            });
        }else{
            let value = $("#numInput").val();
            if(value === ""){
                value = 3;
            }
            if(isNaN(value) || value<=0 || value%1!=0){
                $("#numInput").removeClass("is-valid");
                $("#numInput").addClass("is-invalid");
                return false;
            }else{
                $("#numInput").removeClass("is-invalid");
                $("#numInput").addClass("is-valid");
            }

            this.View.loadRound(value);
        }
        
        return false;
    }

    changeMap(element){
        this.selectedMap = element.value.toLowerCase();
    }

    changeDel(element){
        this.selectedDel = this.selectedMap+"-"+element.value;
    }

    loadMap(){
        if(this.View != undefined){
            delete this.View;
        }
        this.View = new Viewer(this.geometry);
        this.View.setupCanvas();
        this.View.loadMap(this.selectedMap);
        switch(this.selectedMap){
            case "petit":
                $("#delSelector").html("<option>6</option><option>3</option>");
                this.selectedDel = this.selectedMap + "-6";
                break;
            case "moyen":
                $("#delSelector").html("<option>12</option><option>9</option>");
                this.selectedDel = this.selectedMap + "-12";
                break;
            case "grand":
                $("#delSelector").html("<option>20</option><option>15</option><option>12</option>");
                this.selectedDel = this.selectedMap + "-20";
                break;
        }
    }

    addPoint(){
        if(this.state.constructor.name === "AddPointState"){
            this.state = new CalcState(this.geometry);
            this.View.update();
        }else if(this.state.constructor.name === "CalcState"){
            this.state= new AddPointState(this.geometry);
            this.View.update();
        }
    }

    rmvPoint(){
        if(this.state.constructor.name === "RmvPointState"){
            this.state = new CalcState(this.geometry);
            this.View.update();
        }else if(this.state.constructor.name === "CalcState"){
            this.state= new RmvPointState(this.geometry);
            this.View.update();
        }
    }

    disableRound(el, id){
        var jel = $(el);
        if(jel.hasClass('hiddenPath')){
            jel.removeClass("hiddenPath");
            $(el).html("<i class='fas fa-eye'></i>");
            this.View.Round.switchPathDisplay(id, true);
            this.View.update();
        }else{
            jel.addClass("hiddenPath");
            $(el).html("<i class='fas fa-eye-slash eye'></i>");
            this.View.Round.switchPathDisplay(id, false);
            this.View.update();
        }
    }

    pathToForeground(num){
        let el = $("#pl"+num);
        if(el.hasClass('activeLine')){
            el.removeClass("activeLine");
            this.View.Round.pathToForeground(num);
            this.View.update();
        }else{
            let list = $(".activeLine");
            for(var i=0; i<list.length; i++){
                $(list[i]).removeClass("activeLine");
            }
            el.addClass("activeLine");
            this.View.Round.pathToForeground(num);
            this.View.update();
        }
    }

    changeTime(value, bool){
        if(bool){
            $("#sliderInit").slider('setValue', value);
        }else{
            $("#sliderInit").slider('setValue', parseInt($("#sliderInit").val())+value);
        }
        //$("#timeDisp").text(pad(time.hours,2)+":"+pad(time.minutes,2));
        
        this.View.time = sliderToTime($("#sliderInit").val());
        this.View.update();
    }

    update(){
        this.View.update();
    }

    resetView(){
        this.geometry.reset();
        this.update();
    }

    zoomView(rate){
        this.geometry.zoom(rate);
        this.update();
    }

    reset(){
        delete this.View.Map;
        this.update();
        this.state = new InitState(this.geometry);
    }

    undo(){
        this.View.Round.load("undo");
    }

    redo(){
        this.View.Round.load("redo");
    }
}
