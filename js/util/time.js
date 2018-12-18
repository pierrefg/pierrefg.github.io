var maxSliderValue = 1800;
var minsliderValue = 800;
var sliderHour = 100;

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function timeToSlider(time){
    let minutes = time.minutes/60*sliderHour;
    let hours = time.hours*sliderHour;
    return hours + minutes;
}

function sliderToTime(value){
    var hour = Math.floor(value/sliderHour);
    var rawMinutes = value-hour*sliderHour;
    var minutes = Math.floor((rawMinutes/sliderHour)*60);
    return {hours:hour, minutes:minutes, seconds:0};
}

function compareTime(time1, time2){
    if(time1.hours>time2.hours){
        return 1;
    }else if(time1.hours === time2.hours){
        if(time1.minutes > time2.minutes){
            return 1;
        }else if(time1.minutes === time2.minutes){
            return 0;
        }else{
            return -1;
        }
    }else{
        return -1;
    }
}

function timeToString(time){
    return pad(time.hours,2)+":"+pad(time.minutes,2);
}

function initSlider(ticks1){
    if($("#timelineIn").length != 0){
        $("#sliderInit").slider('destroy');
    }

    let ticks = "["+minsliderValue+",";
    for(var j in ticks1){
        ticks += timeToSlider(ticks1[j]) + ",";
    }
    ticks += maxSliderValue+"]";

    $("#sliderInit").attr('data-slider-ticks', ticks);
    $("#sliderInit").attr('data-slider-ticks-snap-bounds', 1);
    $("#sliderInit").slider({
        formatter: function(value) {
            var time = sliderToTime(value);
            return pad(time.hours,2)+":"+pad(time.minutes,2);
        }
    }).on('slide', function(val){
        Ctrl.changeTime(val.value, true);
    });
}

function secondsToMS(seconds1){
    let minutes = Math.floor(seconds1/60);
    let seconds = seconds1 - minutes*60;
    return minutes+"\'"+seconds+"\'\'";
}