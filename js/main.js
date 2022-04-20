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
            $("#swiper-graphics .swiper-wrapper").append(
                "<img class='swiper-slide swiper-image' src='img/graphics/"+image+".png' class='carrousel-image'>"
            );
        }
    )
})

$(function() {
    for(var i = 0; i < 44; i++){
        $("#swiper-photos .swiper-wrapper").append(
            "<img class='swiper-slide swiper-image' src='img/photography/thumbnails/p-"+(i+1)+".jpg'>"
        );
    }
})

const swiper = new Swiper('.swiper', {
    cssMode: true,
    loop:true,
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
    // autoplay: {
    //     delay: 2500,
    //     disableOnInteraction: true,
    // },
});