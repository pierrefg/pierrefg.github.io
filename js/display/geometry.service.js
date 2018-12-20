class Geometry{
    constructor(){
        this.latRange = null;
        this.longRange = null;

        this.Canvas = {
            ratio:null,
            html:null,
            ctx:null,
            width:0,
            height:0,
            range:null
        };

        this.zoomLevel = 1;
        this.deltaX =0;
        this.deltaY=0;
    }

    norm(value, state){
        if(state){
            var temp = (value-this.longRange[0])/(this.longRange[1]-this.longRange[0]);
        }else{
            //vertical
            var temp = (value-this.latRange[0])/(this.latRange[1]-this.latRange[0]);
        }
        var canvas = $("#map").get(0);
        
        temp = this.Canvas.range[0]+(this.Canvas.range[1]-this.Canvas.range[0])*temp;
        temp = this.zoomLevel*temp;
        if(state){
            //horizontal
            return temp+this.deltaX;
        }else{
            //vertical
            return canvas.height-temp+this.deltaY;
        }
    }

    distance(Xa, Ya, Xb, Yb){
        let tempLat = Yb-Ya;
        let tempLong = Xb-Xa;
        let temp = tempLat*tempLat + tempLong*tempLong;
        return Math.sqrt(temp);
    }

    /**
     * @desc reset the zoom and pan back to their original values
    */
    reset(){
        this.zoomLevel = 1;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    zoom(rate){
        var temp = this.zoomLevel + rate;
        if(temp>=0.9 && temp<3){
            this.zoomLevel = temp;
            this.deltaY += (this.Canvas.height/2)*rate;
            this.deltaX -= (this.Canvas.width/2)*rate; 
        }
    }

    clear(){
        this.Canvas.ctx.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
    }

    initLine(color, opacity, lineWidth, lineDash){
        this.Canvas.ctx.beginPath();
        this.Canvas.ctx.globalAlpha = opacity;
        this.Canvas.ctx.strokeStyle = color;
        this.Canvas.ctx.setLineDash(lineDash || []);
        this.Canvas.ctx.lineWidth = lineWidth*this.Canvas.ratio*(this.zoomLevel/2 +1);
    }

    initShape(color, opacity){
        this.Canvas.ctx.beginPath();        
        this.Canvas.ctx.fillStyle = color || "purple";
        this.Canvas.ctx.globalAlpha = opacity;
    }

    circle(X, Y, R){
        R = this.Canvas.ratio*R*(this.zoomLevel/2 +1);
        this.Canvas.ctx.arc(this.norm(X, true), this.norm(Y, false), R, 0, 2 * Math.PI, false);
    }

    square(X, Y, L){
        X = this.norm(X, true);
        Y = this.norm(Y, false);
        let L1 = this.Canvas.ratio*L*(this.zoomLevel/2 +1);
        this.Canvas.ctx.fillRect(X-L1/2,Y-L1/2,L1,L1);
    }

    line(X1, Y1, X2, Y2){
        this.Canvas.ctx.moveTo(this.norm(X1, true),this.norm(Y1, false));
        this.Canvas.ctx.lineTo(this.norm(X2, true),this.norm(Y2, false));
    }

    drawLine(){
        this.Canvas.ctx.stroke();
    }

    drawShape(){
        this.Canvas.ctx.fill();
    }

    imageDirect(img, X,Y, multiplier, opacity){
        let imgH = multiplier*this.Canvas.ratio*img.height;
        let imgW = multiplier*this.Canvas.ratio*img.width;
        this.Canvas.ctx.globalAlpha = opacity;
        this.Canvas.ctx.drawImage(img, this.norm(X, true)-imgW/2,this.norm(Y, false)-imgH/2, imgW, imgH);
        this.Canvas.ctx.beginPath(); 
    }
}