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
            "2019_IF2",
            "2018_IF1",
            "2019_AEDI",
            "2019_osiu1",
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
        for(var i = 0; i < 44; i++){
            $("#swiper-photos .swiper-wrapper").append(
                // "<div>"+
                // "<a href='img/photography/fullsize/p-"+(i+1)+".jpg' target='_blank'>"+
                "<img class='swiper-slide swiper-image' src='img/photography/thumbnails/p-"+(i+1)+".jpg' />"
                // "</div>"
            );
        }

        const swiper = new Swiper('.swiper', {
            cssMode: true,
            // loop:true,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            pagination: {
              el: ".swiper-pagination",
            },
            mousewheel: true,
            keyboard: true,
            spaceBetween: 30,
            centeredSlides: true,
            // autoplay: {
            //     delay: 2500,
            //     disableOnInteraction: false,
            // },
        });
    });
});
  