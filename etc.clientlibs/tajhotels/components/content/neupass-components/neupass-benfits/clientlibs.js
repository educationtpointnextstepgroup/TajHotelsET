$(document).ready(function() {
    showNeupassStrip('guest');
    if ($('.banner-container .search-and-suggestions-wrapper').length && $(window).width() < 480) {
        var topVar = $('.banner-container .search-and-suggestions-wrapper').height();
        $('.neupass-benfits').css('margin-top', (topVar - 3) + 'px');
    }

    $('.guest-wrapper .active-inactive-cont').on('click', function() {
        $('.sign-in-btn').length ? $('.sign-in-btn a')[0].click() : '';
    });

    /*$('.guest-wrapper .neupass-banner').on('click', function(){
         $('.sign-in-btn').length ? $('.sign-in-btn a')[0].click() : '';
     });

     $('.guest-wrapper .neupass-mobile-banner').on('click', function(){
         $('.sign-in-btn').length ? $('.sign-in-btn a')[0].click() : '';
     });*/

    setTimeout(function() {
        if ($('.guest-wrapper').css('display') != 'none') {
            $('.content-wrapper-neupass').addClass('has-guest-user');
        }
    }, 500);

    /*if($('.guest-wrapper').css('display')!='none') {
		$('.neupass-benfits').addClass('has-guest-user');
    }*/

});

function showNeupassStrip(customerFlag) {
    $('.neupass-strip-wrapper').show();
    $('.neupass-benfits').show();
    if (customerFlag == "NeupassActive" && $('.neupass-strip-wrapper') && $('.neupass-strip-wrapper').length) {
        $('.active-user').show();
        $('.inactive-user').hide();
        $('.guest-wrapper').hide();
        $('.cm-page-container .content-wrapper').addClass('content-wrapper-neupass');
    } else if (customerFlag == "NeupassInactive") {
        $('.active-user').hide();
        $('.inactive-user').show();
        $('.guest-wrapper').hide();
        $('.cm-page-container .content-wrapper').addClass('content-wrapper-neupass');
        openModal(1);

    } else if (customerFlag == "guest") {
        $('.active-user').hide();
        $('.inactive-user').hide();
        $('.guest-wrapper').show();
        $('.cm-page-container .content-wrapper').addClass('content-wrapper-neupass');

    } else {
        $('.neupass-benfits') && $('.neupass-benfits').length ? $('.neupass-benfits').hide() : '';
    }

}


function openModal(num) {

    /* showWarningMessage();
     $('.cm-warning-box-main').html('<div class="modal-container neu-pass-benfit-content" id="myModal-container" >'+
                                      $(".modal-container").html()+ '</div>');*/
    document.getElementsByClassName("modal-container")[0].style.display = 'block';
    var modals = Array.from(document.getElementsByClassName('modal-content'));
    modals.forEach((modal, index) => {
        if (num - 1 === index) {
            modal.style.display = 'block';
        } else {
            modal.style.display = 'none';
        }
    });

    $('.neupass-benfits').css('z-index', 100);

}

function closeAllModal() {
    document.getElementsByClassName("modal-container")[0].style.display = 'none';
    $('.neupass-benfits').css('z-index', 5);
}

function closeModal() {
    openModal(3)
}

function signOut() {
    if (sessionStorage.getItem('source') == 'tcp') {
        if (window.location.href.includes('dev65') || window.location.href.includes('stage65')) {
            window.location.href = "https://aem-sit-r2.tatadigital.com/getbacktohomepage";
        }
        window.location.href = "https://www.tatadigital.com/getbacktohomepage";
    } else {
        tdlsignOut();
    }
}

function updatingProfile() {
    updateProfile();
}

function redirectUrl() {
    window.location.href = "https://www.tajhotels.com/en-in/neupass/";
}

function updateProfile() {
    var req_data = {
        "isGdprCustomer": false
    };
    var accesstkn = localStorage.getItem("access_token");;
    $('body').showLoader(true);
    $.ajax({
        method: 'POST',
        url: '/bin/tdl/updateprofile',
        data: {
            req_data: JSON.stringify(req_data),
            authToken: accesstkn
        },
        dataType: "json",
    }).done(function(data) {
        $('body').hideLoader(true);
        openModal(2);
    });
}