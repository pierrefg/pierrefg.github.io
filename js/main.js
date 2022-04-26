$(function(){
    $("#leftColContent").load("leftColContent.html"); 
    $("#rightColTab1").load("rightColTab1.html");

    const promesseA = new Promise((resolve, reject) => {
        $("#rightColTab2").load("rightColTab2.html", function() {
            resolve( "Load was performed." );
        });
    });
    promesseA.then(function(a){
        graphics_images = [
            "OSIU-1",
            "OSIU-2",
            "OSIU-3",
            "2019_osiu1",
            "2019_IF2",
            "2018_IF1",
            "2019_AEDI",
            "2019_aedi_bbq",
            "2018_mouette2",
            "2017_mouette1",
            "2016_logo_mouette",
            "2018_ami2",
            "2017_ami1",
            "2016_montage_folklo",
        ];
        graphics_images.forEach(
            function(image){
                $("#swiper-graphics .swiper-wrapper").append(
                    "<img class='swiper-slide swiper-image' src='img/graphics/thumbnails/"+image+".jpg' class='carrousel-image'>"
                );
            }
        );
        for(var i = 46; i > 0; i--){
            $("#swiper-photos .swiper-wrapper").append(
                // "<div>"+
                // "<a href='img/photography/fullsize/p-"+(i+1)+".jpg' target='_blank'>"+
                "<img class='swiper-slide swiper-image' src='img/photography/thumbnails/p-"+i+".jpg' />"
                // "</div>"
            );
        }

        const swiper = new Swiper('.swiper', {
            cssMode: true,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            mousewheel: true,
            keyboard: true,
            spaceBetween: 30,
            centeredSlides: true,
        });
    });
});
  