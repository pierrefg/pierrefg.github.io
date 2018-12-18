/**
 * Loaded deliveries state
 * @extends State
 */
class DelState extends State{
    constructor(geometryService){
        super(geometryService);

        enableButtons(["#loadDel", "#loadRounds", "#loadMap", "#mapSelector", "#delSelector"]);
        disableButtons(["#undo", "#redo", "#addDel", "#rmvDel"]);
        console.log("Etat delState"); 
        $("#snoInfoBox").hide();
        $("#pathMenu").hide();
        $("#timeline").hide();
        $("#delCollapse").collapse('hide');
        
        $("#loadRounds").html("Calculer itinéraires").addClass("btn-warning").removeClass("btn-danger");
        
        $("#addDel").html("<i class='fas fa-plus'></i>").addClass("btn-warning").removeClass("btn-success");
        $("#rmvDel").html("<i class='fas fa-minus'></i>").addClass("btn-warning").removeClass("btn-success");
    }
    
    handleScroll(evt){
        super.scroll(event);
    };
    
    
    handleMouseDown(evt){
        super.MouseDown(evt);
    }
    
    handleMouseMove(evt){
        super.MouseMove(evt);
    }
    
    handleMouseUp(evt){
        /*let View = Ctrl.View;
        if(Ctrl.dragged===false  && evt.srcElement.tagName==="CANVAS"){
            let ratio = View.Canvas.ratio;
            var node = View.Map.findBestNode(ratio*(evt.offsetX-View.Canvas.html.offsetTop), ratio*(evt.offsetY-View.Canvas.html.offsetLeft));
            View.Deliveries.nodeInfos(node);
            View.update();
        }*/
        
        super.MouseUp(evt);
    }

    handleKeyPress(evt){
        
    }
}