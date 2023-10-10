$(document).ready(function() {
    setTimeout(function() {
        $('.mr-contact-us-products-container').each(function() {
            $(this).customSlide(4);

            if ($(this).children().find('.mr-contact-us-wrap').length <= 4) {
                $(this).siblings('.rightArrow').hide();
                $(this).siblings('.left-arrow').hide();
            }

        });
    }, 1500);

});
$(document).ready(function() {

    setTimeout(function() {
        var width = $(window).width();
        var marginContainer = $('.content-wrapper').css('margin-left');
        $('.marqueebrands .marque-slider').css('margin-left', '-' + (parseInt(marginContainer)) + 'px');
        $('.marqueebrands .marque-slider').css('width', width + 'px');
    }, 100);


    $('.mr-contact-us-wrap .bannerImage .card-img-top').on('mouseenter', function(e) {
        $(this).parents().closest('.mr-contact-us-products-container').find('.mr-contact-us-wrap').removeClass('active');
        $(this).parents().closest('.mr-contact-us-wrap').addClass('active');
    });

});