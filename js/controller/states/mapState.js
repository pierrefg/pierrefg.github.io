/**
 * Map display state
 * @extends State
 */
class MapState extends State{
    constructor(geometryService){
        super(geometryService);
        enableButtons(["#loadDel", "#loadMap", "#mapSelector", "#delSelector", "#addDel"]);
        disableButtons(["#addDel", "#rmvDel", "#loadRounds", "#undo", "#redo"]);
        $("#snoInfoBox").hide();
        $("#pathMenu").hide();
        $("#timeline").hide();
        $("#delCollapse").collapse('hide');
        console.log("Etat mapState"); 
    }
    
    handleScroll(evt){
        super.scroll(evt);
    };
    
    
    handleMouseDown(evt){
        super.MouseDown(evt);
    }
    
    handleMouseMove(evt){
        super.MouseMove(evt);
    }
    
    handleMouseUp(evt){
        super.MouseUp(evt);
    }

    handleKeyPress(evt){
        
    }
}