var Ctrl;

$( document ).ready(function() {
    console.log( "ready!" );
    init();
    Ctrl = new Controller();
    Ctrl.loadMap();
});

function init(){
    window.onresize = function() {
        Ctrl.View.setupCanvas();
        Ctrl.View.update();
    };
    
    window.addEventListener('mouseup', function(evt){
        Ctrl.clicked = false;
        Ctrl.dragged = false; //DANGEREUX
    },false);

    let map = $("#map").get(0);
    map.addEventListener('mousedown', function(evt){
        Ctrl.state.handleMouseDown(evt);
    },false);
    map.addEventListener('mousemove', function(evt){
        Ctrl.state.handleMouseMove(evt);
    },false);
    
    map.addEventListener('mouseup', function(evt){
        Ctrl.state.handleMouseUp(evt);
    },false);

    map.addEventListener('DOMMouseScroll',function(evt){
        Ctrl.state.handleScroll(evt);
    },false);
    map.addEventListener('mousewheel',function(evt){
        Ctrl.state.handleScroll(evt);
    },false);

    window.addEventListener("keydown", function(evt){
        Ctrl.state.handleKeyPress(evt);
    }, false);
}


