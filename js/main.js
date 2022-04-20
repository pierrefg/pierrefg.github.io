$(function() {
    graphics_images = [
        "2019_IF2",
        "2018_IF1",
        "2019_osiu1",
        "2019_aedi_bbq",
        "2018_mouette2",
        "2017_mouette1",
        "2018_ami2",
        "2017_ami1",
        "2016_montage_folklo",
    ];
    graphics_images.forEach(
        function(image, i){
            $("#graphics-slider .slider-container").append(
                "<li>"+
                "<img src='img/graphics/"+image+".png' class='carrousel-image'>"+
                "</li>" 
            );
            if(i==0) {
                $("#graphics-slider .slider-indicators").append(
                        "<button class='active'></button>"
                );
            } else {
                $("#graphics-slider .slider-indicators").append(
                    "<button></button>"
                );
            }
        }
    )
})

$(function() {
    for(var i = 0; i < 44; i++){
        $("#photography-slider .slider-container").append(
            "<li>"+
            "<img src='img/photography/thumbnails/p-"+(i+1)+".jpg' class='carrousel-image'>"+
            "</li>" 
        );
        if(i==0) {
            $("#photography-slider .slider-indicators").append(
                    "<button class='active'></button>"
            );
        } else {
            $("#photography-slider .slider-indicators").append(
                "<button></button>"
            );
        }
    }
})