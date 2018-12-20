/**
 * Adding point state
 * @extends State
 */
class AddPointState extends State{
    constructor(geometryService){
        super(geometryService);
        $("#addDel").html("<i class='fas fa-ban'></i>").addClass("btn-danger").removeClass("btn-warning");
        disableButtons(["#undo", "#redo", "#loadDel", "#loadRounds", "#loadMap", "#rmvDel", "#mapSelector", "#delSelector"]);
        console.log("Etat addPointState");
        $("#delCollapse").collapse('show');
    }
    
    handleScroll(evt){
        super.scroll(evt);
    };
    
    
    handleMouseDown(evt){
        super.MouseDown(evt);
    }
    
    handleMouseMove(evt){
        super.MouseMove(evt);       
    
        let View = Ctrl.View;
        let ratio = this.geometry.Canvas.ratio;
        let nodeId = View.Map.findBestNode(ratio*(evt.offsetX-this.geometry.Canvas.html.offsetTop), ratio*(evt.offsetY-this.geometry.Canvas.html.offsetLeft));
        Ctrl.update();
        View.Map.highlightNode(nodeId);
    }
    
    handleMouseUp(evt){
        let View = Ctrl.View;
        let a = false;
        if(!Ctrl.dragged && evt.srcElement.tagName==="CANVAS"){
            let value = $("#delDuration").val();
            if(value === ""){
                value = 200;
            }
            if(isNaN(value) || value<=0 || value%1!=0){
                $("#delDuration").removeClass("is-valid");
                $("#delDuration").addClass("is-invalid");
                return false;
            }else{
                $("#delDuration").removeClass("is-invalid");
                $("#delDuration").addClass("is-valid");
            }
            let ratio = this.geometry.Canvas.ratio;
            var nodeId = View.Map.findBestNode(ratio*(evt.offsetX-this.geometry.Canvas.html.offsetTop), ratio*(evt.offsetY-this.geometry.Canvas.html.offsetLeft));
            View.Deliveries.addUserDelivery(parseInt(nodeId), value);
            Ctrl.update();
            a = true;
        }
        super.MouseUp(evt);
        if(a) Ctrl.state = new CalcState(this.geometry);
    }

    handleKeyPress(evt){
        
    }
}