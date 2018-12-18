/**
 * Removing point state
 * @extends State
 */
class RmvPointState extends State{
    constructor(geometryService){
        super(geometryService);
        $("#rmvDel").html("<i class='fas fa-ban'></i>").addClass("btn-danger").removeClass("btn-warning");
        disableButtons(["#undo", "#redo", "#loadDel", "#loadRounds", "#loadMap", "#addDel", "#mapSelector", "#delSelector"]);
        console.log("Etat rmvPointState");
        $("#delCollapse").collapse('hide');
    }
    
    /**
     * Handle the user scrolling
     * @param {event} evt Event to handle.
     */
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
            console.log("CANVAS");
            let ratio = this.geometry.Canvas.ratio;
            var nodeId = View.Map.findBestNode(ratio*(evt.offsetX-this.geometry.Canvas.html.offsetTop), ratio*(evt.offsetY-this.geometry.Canvas.html.offsetLeft));
            View.Deliveries.rmvUserDelivery(parseInt(nodeId));
            View.update();
            a = true;
        }
        super.MouseUp(evt);
        if(a) Ctrl.state = new CalcState();
    }

    handleKeyPress(evt){
        
    }
}