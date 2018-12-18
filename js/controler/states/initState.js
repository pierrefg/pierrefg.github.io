/**
 * Primary state, nothing loaded
 * @extends State
 */
class InitState extends State{
    constructor(geometryService){
        super(geometryService);
        disableButtons(["#undo", "#redo", "#loadDel", "#loadRounds", "#rmvDel", "#addDel", "#delSelector"]); 
        console.log("Etat init"); 
        $("#pathMenu").hide();
        $("#timeline").hide();
        $("#delCollapse").collapse('hide');
    }
    
    handleScroll(evt){
    };
    
    handleMouseDown(evt){
    }
    
    handleMouseMove(evt){
    }
    
    handleMouseUp(evt){
    }

    handleWindowResize(evt){
    }
}