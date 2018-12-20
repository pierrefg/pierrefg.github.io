/**
 * Calculating rounds state
 * @extends State
 */
class CalculatingState extends State{
    constructor(geometryService){
        super(geometryService);
        $("#loadRounds").html("Annuler").addClass("btn-danger").removeClass("btn-warning");
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
        super.MouseUp(evt);
    }

    handleKeyPress(evt){
        
    }
}