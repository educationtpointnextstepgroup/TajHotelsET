function gobackfunction() {
    history.back();
}
var accountType = "";
$(document).ready(function() {

    basOpenForTataNeuCheck();

    if ($(document).width() < 425) {
        if (window.location.href == 'https://www.tajhotels.com/en-in/' || window.location.href == 'https://www.tajhotels.com/' ||
            window.location.href == 'https://www.seleqtionshotels.com/en-in/' || window.location.href == 'https://www.seleqtionshotels.com/' ||
            window.location.href == 'https://www.vivantahotels.com/en-in/' || window.location.href == 'https://www.vivantahotels.com/' || window.location.href.includes('author-taj-dev65-02.adobecqms.net/content/tajhotels/en-in')) {
            $(".cm-page-container .header").css({
                "position": "fixed",
                "top": "0"
            });
            $(".banner-container-wrapper").css("margin-top", "56px");

        }
    }

    var headerDDInitCon = $('.cm-header-dd-options-con');
    var headerDropdowns = $('.header-warpper .cm-header-dropdowns');
    var headerArrows = $('.header-dropdown-image');
    profileFetchListener(showUserPoints);
    /*To display Tata Neu related header for Loyal customer*/
    displayTataNeuHeaderFooter();

    var entityLogin = $('#corporate-booking-login').attr('data-corporate-isCorporateLogin') == "true";
    var currentUrl = window.location.href;
    var encodedUri = encodeURIComponent(currentUrl);

    var clientID = document.querySelector("meta[name='tdl-sso-client_id']").getAttribute("content");
    if (isCurrencyCacheExists()) {
        var cacheObject = getCurrencyCache()
        setActiveCurrencyInDom(cacheObject.currencySymbol, cacheObject.currency, cacheObject.currencyId);
    } else {
        setActiveCurrencyWithDefaultValues();
    }
    if (window.location.href.indexOf("tajinnercircle") != -1) {
        $(".navbar-expand-lg .navbar-nav .nav-link").css("padding-left", "2.1rem");
    }

    //checkUserDetailsForHeader();

    var urlParams1 = new URLSearchParams(window.location.search);
    var src1, offer_ID, btype;
    if (urlParams1.has("source")) {
        src1 = urlParams1.get("source");
        offer_ID = urlParams1.get("offerId");
        btype = urlParams1.get("bookingType");
    }
    if (src1 != null) {
        localStorage.setItem("source", src1);
        sessionStorage.setItem("source", src1);
        localStorage.setItem("offerId", offer_ID);
        localStorage.setItem("bookingType", btype);
    } else if (localStorage.getItem("source") != null) {
        localStorage.setItem("source", localStorage.getItem("source"));
        localStorage.setItem("offerId", localStorage.getItem("offerId"));
        localStorage.setItem("bookingType", localStorage.getItem("bookingType"));
        sessionStorage.setItem("source", sessionStorage.getItem("source"));
    } else {

        localStorage.setItem("bookingType", "null");
    }

    if (urlParams1.has("utm_source") && urlParams1.has("utm_medium") && urlParams1.has("source") && urlParams1.has("pincode") &&
        urlParams1.has("city") && urlParams1.has("lat") && urlParams1.has("long")) {
        var tataNeuParams = window.location.href.substr(window.location.href.indexOf("utm_source="), window.location.href.indexOf("&long=") + 9);
        tataNeuParams = tataNeuParams.substr(0, tataNeuParams.indexOf('&authCode'));
        localStorage.setItem("tataNeuParams", tataNeuParams);
    }



    // --> tdl sso start 
    $('[data-component-id="enrol-btn"]').click(function() {
        //event.preventDefault();
        var signInLink = $('#sign-in-btn a').attr('data-component-id');
        if (signInLink != undefined || signInLink != null) {
            $('[data-component-id="enrol-btn"]').attr('href', signInLink + '?clientId=' + clientID + '&redirectURL=' + encodedUri);
        } else {
            $('[data-component-id="enrol-btn"]').attr('href', 'https://sit-account.tajhotels.com/login?clientId=' + clientID + '&redirectURL=' + encodedUri);
        }

    });
    // --> tdl sso end 
    // --> SSO
    gtmDataLayerFromHeader();

    var user = userCacheExists();
    var isCorporateLogin = false;
    var showSignIN = true;
    hideSignInAndEnroll();
    var ihclSSOToken = $.cookie($(".single-sign-on-sevlet-param-name").text() || 'ihcl-sso-token');
    if (isIHCLCBSite()) {
        console.log('isIHCLCBSite: true');
        if (user && user.isCorporateLogin) {
            isCorporateLogin = user.isCorporateLogin;
            showHeaderUserProfile(user.name);
        } else {
            console.log('user.isCorporateLogin: false');
            dataCache.local.removeData("userDetails");
            clearRoomSelections();
            showSignInAndEnroll();
        }
    } else if (user && user.authToken && !user.isCorporateLogin) {
        console.log('user.authToken: true && isCorporateLogin: false');
        if (user.authToken === ihclSSOToken) {
            console.log('user.authToken === ihclSSOToken: true');
            showHeaderUserProfile(user.name);
        } else if (ihclSSOToken) {
            console.log('ihclSSOToken: true');
            getUserDetailsUsingToken(ihclSSOToken);
        } else {
            console.log('user.authToken === ihclSSOToken: false && ihclSSOToken: false');
            dataCache.local.removeData("userDetails");
            clearSelectionAndLogout();
            showSignInAndEnroll();
        }
    } else if (ihclSSOToken) {
        console.log('ihclSSOToken: true');
        getUserDetailsUsingToken(ihclSSOToken);
    } else {
        console.log('SSO final else condition');
        showSignInAndEnroll();
    }

    function hideSignInAndEnroll() {
        $('.sign-in-btn').addClass('cm-hide');
        $('[data-component-id="enrol-btn"]').addClass('cm-hide');
    }

    function showSignInAndEnroll() {
        $('.sign-in-btn').removeClass('cm-hide');
        $('[data-component-id="enrol-btn"]').removeClass('cm-hide');
        hideProfileDetails();
    }

    function hideProfileDetails() {
        $('.header-profile').addClass('cm-hide').removeClass('cm-show');
    }

    function basOpenForTataNeuCheck() {
        var basVal = (new URLSearchParams(window.location.search)).get('bas');
        if (basVal && basVal.toLowerCase() == 'open') {
            setTimeout(function() {
                if ($('.book-stay-btn') && $($('.book-stay-btn')[0])) {
                    $($('.book-stay-btn')[0]).trigger('click');
                }
            }, 1000);

        }
    }



    function getUserDetailsUsingToken(ihclSSOToken) {
        debugger
        showLoader();
        $.ajax({
            type: "POST",
            url: "/bin/fetchUserDetails",
            data: "authToken=" + encodeURIComponent(ihclSSOToken)
        }).done(function(res) {
            res = JSON.parse(res);
            if (res.userDetails && res.userDetails.name) {
                updateLoginDetails(res);
                showSignIN = false;
            }
            hideLoader();
        }).fail(function(res) {}).always(function() {
            if (showSignIN) {
                showSignInAndEnroll();
            }
            hideLoader();
        });
    }


    function updateLoginDetails(res) {
        if (res.authToken) {
            var userDetails = res.userDetails;
            var authToken = res.authToken;
            incorrectLoginCount = 0;
            successHandler(authToken, userDetails);
        } else if (res.errorCode === "INVALID_USER_STATUS" && res.status === "504" && !entityLogin) {
            // user activation flow
            invokeActivateAccount();
        } else if (res.errorCode === "INVALID_USER_STATUS" && res.status === "506" && !entityLogin) {
            // migrated user
            var error = res.error;
            var errorCtaText = "RESET PASSWORD";
            var errorCtaCallback = invokeForgotPassword;
            $('body').trigger('taj:loginFailed', [error, errorCtaText, errorCtaCallback]);
        } else {
            if (entityLogin) {
                forgotPasswordLinkWrp.show();
                $('.ihclcb-login-error').text(res.error).show();
            }
        }
    }

    function successHandler(authToken, userDetails) {
        localUserDetails(authToken, userDetails);
        var id = userDetails.membershipId;
        var name = userDetails.name;
        $('.generic-signin-close-icon').trigger("click");
        $('body').trigger('taj:loginSuccess', [id, name]);

        if (id) {
            $('body').trigger('taj:fetch-profile-details', [true]);
        } else {
            $('body').trigger('taj:login-fetch-complete');
        }
        if (!entityLogin) { // added by sarath
            $('body').trigger('taj:tier');
        }
        dataToBot();
    }

    function localUserDetails(authToken, userDetails) {
        var user = {
            authToken: authToken,
            name: userDetails.name,
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            gender: userDetails.gender,
            email: userDetails.email,
            countryCode: userDetails.countryCode,
            mobile: userDetails.mobile,
            cdmReferenceId: userDetails.cdmReferenceId,
            membershipId: userDetails.membershipId,
            googleLinked: userDetails.googleLinked,
            facebookLinked: userDetails.facebookLinked,
            title: userDetails.title
        };
        if (entityLogin) {
            user.partyId = userDetails.cdmReferenceId
        }
        dataCache.local.setData("userDetails", user);
        if ($('.mr-contact-whole-wrapper').length > 0) {
            window.location.reload();
        }
    }

    // SSO <--

    function isCurrencyCacheExists() {
        var currencyCache = dataCache.session.getData("currencyCache");
        if (!currencyCache)
            return false;
        else
            return true;
    }

    if (deviceDetector.isIE() == "IE11") {
        $(".brand-logo-wrapper img").addClass('.ie-tajLogo-img');
    }

    scrollToViewIn();

    function setActiveCurrencyWithDefaultValues() {
        try {
            var dropDownDoms = $.find('.header-currency-options');
            var individualDropDownDoms = $(dropDownDoms).find('.cm-each-header-dd-item');
            var firstDropDownDom;
            if (individualDropDownDoms && individualDropDownDoms.length) {
                firstDropDownDom = individualDropDownDoms[0];
            }

            var currencyId = $(firstDropDownDom).data().currencyId;
            var currencySymbol = $($(firstDropDownDom).find('.header-dd-option-currency')).text();
            var currency = $($(firstDropDownDom).find('.header-dd-option-text')).text();

            if (currencySymbol != undefined && currency != undefined && currencyId != undefined) {
                setActiveCurrencyInDom(currencySymbol, currency, currencyId);
                setCurrencyCache(currencySymbol, currency, currencyId);
            }
        } catch (error) {
            console.error(error);
        }
    }

    $('.header-warpper .cm-header-dropdowns').each(function() {
        $(this).on('click', function(e) {
            e.stopPropagation();
            var arrow = $(this).closest('.nav-item').find('.header-dropdown-image');
            var target = $(this).closest('.nav-item').find('.cm-header-dd-options-con');
            if (target.hasClass('active')) {
                target.removeClass('active');
                arrow.removeClass('header-dropdown-image-selected');
                $(this).removeClass('nav-link-expanded');
                return;
            }
            headerDropdowns.removeClass('nav-link-expanded')
            headerDDInitCon.removeClass('active');
            headerArrows.removeClass('header-dropdown-image-selected');
            target.addClass('active');
            arrow.addClass('header-dropdown-image-selected');
            $(this).addClass('nav-link-expanded')
        });
    });

    $('body').on('click', function() {
        headerDDInitCon.removeClass('active');
    });

    var windowWidth = $(window).width();
    if (windowWidth < 992) {
        $('.ihcl-header .navbar-toggler').addClass('navbar-dark');
        if (windowWidth < 768) {
            var bookAStayBtn = $('.header-warpper a.book-stay-btn .book-stay-btn')
            if (bookAStayBtn.text().trim() == "Book your dream wedding") {
                bookAStayBtn.text("BOOK A VENUE");
            }
        }
    }

    $('.collapse').on('show.bs.collapse', function() {
        $(".cm-page-container").addClass('prevent-page-scroll');
    });

    $('.header-currency-options').on('click', '.cm-each-header-dd-item', function() {
        try {
            var elDDCurrencySymbol = $(this).find('.header-dd-option-currency');
            var elDDCurrency = $(this).find('.header-dd-option-text');

            var elActiveCurrSymbol = $(this).closest('.nav-item').find('.selected-currency');
            var elActiveCurrency = $(this).closest('.nav-item').find('.selected-txt');

            var currencySymbol = elDDCurrencySymbol.text();
            var currency = elDDCurrency.text();
            var currencyId = $(this).data('currency-id');

            if (currencySymbol != undefined && currency != undefined && currencyId != undefined) {
                setCurrencyCache(currencySymbol, currency, currencyId);
            }

            elActiveCurrSymbol.text(currencySymbol);
            elActiveCurrSymbol.attr("data-selected-currency", currencyId)
            elActiveCurrency.text(currency);
            $(document).trigger('currency:changed', [currency]);
        } catch (error) {
            console.error(error);
        }
    });

    $('.profile-name-wrp').click(function(e) {
        e.stopPropagation();
        $('.profile-options').toggle();
        $('.profile-name-wrp .header-dropdown-image').toggleClass('cm-rotate-show-more-icon');
    });

    $('.cm-page-container').click(function() {
        $('.profile-options').hide();
        $('.profile-name-wrp .header-dropdown-image').removeClass('cm-rotate-show-more-icon');
    });

    $('.header-mobile-back-btn').click(function() {
        $('.navbar-collapse').removeClass('show');
        $(".cm-page-container").removeClass('prevent-page-scroll');
    })

    $('.sign-in-btn').click(function() {
        var currentUrl = window.location.href;
        var encodedUri = encodeURIComponent(currentUrl);
        var signInLink = $('#sign-in-btn a').attr('data-component-id');
        var clientID = document.querySelector("meta[name='tdl-sso-client_id']").getAttribute("content");
        if (!userLoggedIn()) {
            if (signInLink != undefined || signInLink != null) {
                $('.sign-in-btn > .nav-link').attr('href', signInLink + '?clientId=' + clientID + '&redirectURL=' + encodedUri);
            } else {
                $('.sign-in-btn > .nav-link').attr('href', selectLoginUrlEnv() + '?clientId=' + clientID + '&redirectURL=' + encodedUri);
            }
        } else {
            document.location.reload();
        }
    });

    $('body').on('taj:loginSuccess', function(event, uname) {
        showHeaderUserProfile(uname);
    });

    $('body').on('taj:pointsUpdated', function(event) {
        showUserPoints();
    });

    function showHeaderUserProfile(name) {
        $('.sign-in-btn').addClass('cm-hide');
        $('.header-profile').removeClass('cm-hide').addClass('cm-show');
        $('.header-profile .profile-username, .navbar-brand .profile-username').text(name);
        showUserPoints();
    }

    function showUserPoints() {
        var userDetails = dataCache.local.getData("userDetails");
        if (userDetails && userDetails.brandData && userDetails.brandData.ticNumber && userDetails.brandData.ticNumber[0]) {
            $('.header-profile .points-cont').removeClass('d-none');
            $('[data-component-id="enrol-btn"]').remove(); // remove enrol buttons for users having
            // membership id
            $('.header-profile .edit-profile').hide();
            if (userDetails.loyaltyInfo && userDetails.loyaltyInfo[0].currentSlab) {
                $('.header-profile .tic-tier span').text(userDetails.loyaltyInfo[0].currentSlab);
                $('.header-profile .tic-tier').show();
            } else {
                $('.header-profile .tic-tier').hide();
            }
            if (userDetails.loyaltyInfo && userDetails.loyaltyInfo[0].currentSlab) {
                $('.header-profile .tic-points').text(parseInt(userDetails.loyaltyInfo[0].loyaltyPoints));
            }

            if (userDetails.brandData) {

                accountType = "tic-points";
                $('.prof-content-value').each(
                    function() {
                        $(this).attr("id") === accountType ? $(this).parent().show() : $(this)
                            .parent().hide();
                    });


                $('.prof-tic-content').show();
            } else {
                console.log("unable to retrieve user card details");
                $('.prof-tic-content').hide();
            }
        } else {
            $('.header-profile .points-cont').addClass('d-none');
        }
        if (sessionStorage.getItem("source") == 'tcp') {
            $('.header-profile #logout-btn').addClass('d-none');
        }
    }
    /*tdl sso changes start */

    $('.header-profile .logout-btn').on('click', function(event) {
        event.stopPropagation();

        checkToClearSelections();
    });


    $('body').on('taj:logout', function() {
        tajLogout();
    });
    $('body').on('taj:sessionLogout', function() {
        logoutWithoutReloding();
    });

    function checkToClearSelections() {
        var bOptions = dataCache.session.getData('bookingOptions');
        if (bOptions.selection && (bOptions.selection.length > 0)) {
            var popupParams = {
                title: $(".sign-out-clear-selections-popupMessage").text() ||
                    'Sign Out will clear room slections?',
                callBack: clearSelectionAndLogout.bind(),
                // callBackSecondary: secondaryFn.bind( _self ),
                needsCta: true,
                isWarning: true
            }
            warningBox(popupParams);
        } else {
            tajLogout();
        }
    }

    function clearSelectionAndLogout() {
        clearRoomSelections();
        tajLogout();
    }

    function clearRoomSelections() {
        var boptions = dataCache.session.getData("bookingOptions");
        if (boptions && boptions.roomOptions) {
            var rOptions = boptions.roomOptions;
            var roomOptArray = [];
            for (var d = 0; d < rOptions.length; d++) {
                var roomOpt = {
                    adults: rOptions[d].adults,
                    children: rOptions[d].children,
                    initialRoomIndex: d
                };
                roomOptArray.push(roomOpt);
            }
            boptions.previousRooms = roomOptArray
            boptions.roomOptions = roomOptArray;
            boptions.rooms = boptions.roomOptions.length;
            boptions.selection = [];
            dataCache.session.setData("bookingOptions", boptions);
        }
    }

    function tajLogout() {
        typeof tdlsignOut != 'undefined' ? tdlsignOut() : '';
        typeof logoutBot != 'undefined' ? logoutBot() : '';
        typeof facebookLogout != 'undefined' ? facebookLogout() : '';
        typeof googleLogout != 'undefined' ? googleLogout() : '';
        showSignInAndEnroll();
    }

    function googleLogout() {
        try {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function() {
                console.info('User signed out.');
            });
        } catch (error) {
            console.error("Attempt for google logout failed.")
            console.error(error);
        }
    }

    function facebookLogout() {
        try {
            FB.logout(function(response) {
                // user is now logged out
                console.info("user is now logged out");
            });
        } catch (error) {
            console.error("Attempt for facebook logout failed.")
            console.error(error);
        }
    }

    function logoutSuccess1(accessTk) {
        logoutWithoutReloding(accessTk);
        //formTheRedirectionURL(redirectUrl);
        //    document.location.reload();
    }

    function logoutWithoutReloding(accessTkn) {
        var isCorporateLogin = userCacheExists() ? userCacheExists().isCorporateLogin : false;
        showSignInAndEnroll();
        logoutBot();

        if (!isCorporateLogin) {
            /*tdl sso logout function call*/
            if (localStorage.getItem("access_token")) {
                tdlsignOut();
            }
        } else {
            dataCache.session.removeData("ihclCbBookingObject");
            dataCache.local.removeData("userDetails");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            localStorage.removeItem("auth_code");
            deleteCookiesSSO();
        }
    }


    var tdlsignOut = logoutAccessToken => {
        tdlSsoAuth.deleteSession(localStorage.getItem('access_token')).then(function(response) {
            console.log("response", response);
            if (response) {
                location.reload();
            }
        });
        dataCache.local.removeData("userDetails");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_code");
        if (window.location.href.includes('tataneu/My-Profile') || window.location.href.includes('tataneu/my-profile')) {
            window.location.href = "https://www.tajhotels.com/en-in/tataneu/";
        } else if (window.location.href.includes('neupass/my-profile')) {
            window.location.href = "https://www.tajhotels.com/en-in/neupass/";
        } else if (window.location.href.includes('tajinnercircle/My-Profile') || window.location.href.includes('tajinnercircle/my-profile')) {
            window.location.href = "https://www.tajhotels.com/en-in/tajinnercircle/";
        }
        deleteCookiesSSO();
    }
    const selectEnv = (href) => {
        href = href ? href : window.location.href;
        if (href.includes('localhost') || href.includes('0.0.0.0')) return 'http://localhost:8080/api/v1';
        if (href.includes('taj-dev65-02')) return 'https://ppapi.tatadigital.com/api/v2/sso';
        if (href.includes('dev')) return 'https://ppapi.tatadigital.com/api/v2/sso';
        if (href.includes('stage')) return 'https://sapi.tatadigital.com/api/v1/sso';
        return 'https://api.tatadigital.com/api/v2/sso';
    }



});

if (typeof selectLoginUrlEnv == 'undefined') {
    const selectLoginUrlEnv = (href) => {
        href = href ? href : window.location.href;
        if (href.includes('localhost') || href.includes('0.0.0.0')) return 'https://sit-r2-account.tatadigital.com/v2/';
        if (href.includes('taj-dev65-02')) return 'https://sit-r2-account.tatadigital.com/v2/';
        if (href.includes('dev')) return 'https://sit-r2-account.tatadigital.com/v2/';
        if (href.includes('stage')) return 'https://sit-r2-account.tatadigital.com/v2/';
        return 'https://members.tajhotels.com/v2/';
    }
}

function getSelectedCurrency() {
    return dataCache.session.getData("selctedCurrency");
}

function getCurrencyCache() {
    return dataCache.session.getData("currencyCache");
}

function setActiveCurrencyInDom(currencySymbol, currency, currencyId) {

    $($.find("[data-inject-key='currencySymbol']")[0]).text(currencySymbol);
    $($.find("[data-inject-key='currency']")[0]).text(currency);
    $($.find("[data-selected-currency]")[0]).attr("data-selected-currency", currencyId);
}

function setCurrencyCache(currencySymbol, currency, currencyId) {
    var currencyCache = {};
    currencyCache.currencySymbol = currencySymbol;
    currencyCache.currency = currency;
    currencyCache.currencyId = currencyId;
    dataCache.session.setData("currencyCache", currencyCache);
}

function setCurrencyCacheToBookingOptions() {
    var bookingOptions = getBookingOptionsSessionData();
    bookingOptions.currencySelected = dataCache.session.getData('currencyCache').currencyId;
    dataCache.session.setData("bookingOptions", bookingOptions);
}

function setActiveCurrencyWithResponseValue(currencyType) {

    var infor = false;
    var dropDownDoms = $.find('.header-currency-options');
    var individualDropDownDoms = $(dropDownDoms).find('.cm-each-header-dd-item');
    var firstDropDownDom;
    if (individualDropDownDoms && individualDropDownDoms.length) {
        for (var m = 0; m < individualDropDownDoms.length; m++) {
            if ($(individualDropDownDoms[m]).data().currencyId == currencyType) {
                firstDropDownDom = individualDropDownDoms[m];
                infor = true;
            }
        }
    }
    if (firstDropDownDom) {
        var currencyId = $(firstDropDownDom).data().currencyId;
        var currencySymbol = $($(firstDropDownDom).find('.header-dd-option-currency')).text();
        var currency = $($(firstDropDownDom).find('.header-dd-option-text')).text();

        if (currencySymbol != undefined && currency != undefined && currencyId != undefined) {
            setActiveCurrencyInDom(currencySymbol, currency, currencyId);
            setCurrencyCache(currencySymbol, currency, currencyId);
            setCurrencyCacheToBookingOptions();
        }
    }
    return infor;
}

function formTheRedirectionURL(authoredURL) {
    var url = authoredURL;
    if (!isIHCLCBSite() && !url.includes('https')) {
        var url = url + ".html"
    } else if (isIHCLCBSite()) {
        dataCache.session.removeData("ihclCbBookingObject");
    }
    window.location.href = url;
}

function stopAnchorPropNav(obj) {
    if (window.location.href.includes('en-in/taj-air')) {
        var attr = obj.text;
        prepareQuickQuoteJsonForClick(attr);
    }
    return true;
}

function scrollToViewIn() {
    console.log('binded');
    var scrollElem = $(".scrollView");
    if (scrollElem && scrollElem.length > 0) {
        $(".scrollView").each(function() {
            $(this).on('click', function() {
                var classStr = $(this).attr('class').slice(11);
                $('html, body').animate({
                    scrollTop: $('#' + classStr).offset().top
                }, 1000);
            });
        });
    }
}


//updated for global data layer.
function gtmDataLayerFromHeader() {
    $('#navbarSupportedContent .navbar-nav>.nav-item>a').each(function() {
        $(this).click(function() {
            var eventType = "";
            switch ($(this).text().toLowerCase()) {
                case 'home':
                    eventType = 'TopMenu_KnowMore_HomePage_Home';
                    break;
                case 'benefits':
                    eventType = 'TopMenu_KnowMore_HomePage_Benefits';
                    break;
                case 'epicure':
                    eventType = 'TopMenu_KnowMore_HomePage_Epicure';
                    break;
                case 'redeem':
                    eventType = 'TopMenu_KnowMore_HomePage_Redeem';
                    break;
                case 'events':
                    eventType = 'TopMenu_KnowMore_HomePage_Events';
                    break;
                case 'our hotels':
                    eventType = 'TopMenu_KnowMore_HomePage_OurHotels';
                    break;
                case 'help':
                    eventType = 'TopMenu_KnowMore_HomePage_Help';
                    break;
                case 'enrol':
                    eventType = 'TopMenu_Enrollment_HomePage_TICEnrol';
                    break;
                case 'sign in':
                    eventType = 'TopMenu_SignIn_HomePage_SignIn';
                    break;
                default:
                    eventType = '';
            }
            if (eventType) {
                addParameterToDataLayerObj(eventType, {});
            }
        });
    });
}

function displayTataNeuHeaderFooter() {
    var userDetails = getUserData();
    if (userDetails && userDetails.loyalCustomer == 'Y') {
        var tataneuText = ['NeuPass', ''];
        var tataneuLinks = ['https://www.tajhotels.com/en-in/neupass/', '']
        $('.NonloyalCustomerData li').each(function(index, value) {
            if ($(this).children().text() == 'Taj InnerCircle') {
                $(this).children().attr('href', tataneuLinks[0]);
                $(this).children().text(tataneuText[0]);
            }
            /*if (index == 0) {
            	$(this).children().attr('href', tataneuLinks[index]);
            	$(this).children().text(tataneuText[index]);
            }*/
        })
        var url = window.location.href.split('?')[0];

        if (url == "https://www.tajhotels.com/en-in/tajinnercircle/") {
            window.location.replace("https://www.tajhotels.com/en-in/neupass/");
        }
        $(".prof-content-title").text("NeuCoins")

        if (window.location.href.includes("tajhotels.com") || window.location.href.includes("seleqtionshotels.com") ||
            window.location.href.includes("vivantahotels.com") || window.location.href.includes("amastaysandtrails.com")) {
            $(".loyalCustomerData a").attr('href', 'https://www.tajhotels.com/en-in/neupass/my-profile/');
            $("#header-profile .profile-default-options a").attr('href', 'https://www.tajhotels.com/en-in/neupass/my-profile/');
        } else {
            $(".loyalCustomerData a").attr('href', '/en-in/neupass/my-profile/');
            $("#header-profile .profile-default-options a").attr('href', '/en-in/neupass/my-profile/');
        }
        // && (userDetails.neuPassInfo == null || userDetails.neuPassInfo.status == 'active')
        if (userDetails.isGdprCustomer != 'true') {
            typeof(showNeupassStrip) != 'undefined' ? showNeupassStrip('NeupassActive'): '';
        } else if (userDetails.isGdprCustomer == 'true' && (userDetails.neuPassInfo && userDetails.neuPassInfo.status != 'active')) {
            typeof(showNeupassStrip) != 'undefined' ? showNeupassStrip('NeupassInactive'): '';
        }
        if (userDetails && userDetails.neuPassInfo && userDetails.neuPassInfo.status == 'cancelled') {
            if (sessionStorage.getItem('source') == 'tcp') {
                if (window.location.href.includes('dev65') || window.location.href.includes('stage65')) {
                    tdlsignOut();
                    setTimeout(function() {
                        window.location.href = "https://aem-sit-r2.tatadigital.com/getbacktohomepage";
                    }, 500);
                    return;
                }
                tdlsignOut();
                setTimeout(function() {
                    window.location.href = "https://www.tatadigital.com/getbacktohomepage";
                }, 300);
            } else {
                typeof tdlsignOut === 'function' ? tdlsignOut() : '';
            }
        }
        if ($('.carousel-inner') && $('.carousel-inner').find('[id^="cb-"]') && !$('.carousel-inner').find('[id^="cb-"]').attr('data-context')) {
            if ($('.carousel-item[data-context]') && $('.carousel-item[data-context]').length)
                $('body').trigger('taj:update-banner-onlogin');
        }
    } else {
        if (!userDetails) {
            typeof(showNeupassStrip) != 'undefined' ? showNeupassStrip('guest'): '';
        }
    }
}


document
    .addEventListener(
        'DOMContentLoaded',
        function() {
            try {
                $('#sizeDropdown').selectBoxIt();
                $('#capacityDropdown').selectBoxIt();
                $('.events-filter-icon-mobile').on('click', function() {
                    $('.events-filter-subsection').css('display', 'block');
                })
                $('.events-filter-back-arrow .icon-prev-arrow').click(function() {
                    $('.events-filter-subsection').css('display', 'none');
                })
                $('.events-apply-btn')
                    .click(
                        function() {
                            $('.events-filter-subsection').css('display', 'none');
                            if ($('#sizeDropdown').find("option:selected").text() != 'Size' ||
                                $('#capacityDropdown').find("option:selected").text() != 'Capacity') {
                                if ($('.events-filter-icon-mobile').html() == '<img src="/content/dam/tajhotels/icons/style-icons/filter-icon.svg" alt  = "filter-icon">') {
                                    $('.events-filter-icon-mobile')
                                        .html(
                                            '<img src="/content/dam/tajhotels/icons/style-icons/filter-applied.svg" alt  = "filter-applied-icon">')
                                }
                            }
                        })
            } catch (error) {
                console.error("Error in wedding filter", error);
            }

        })

$(document).ready(function() {

    try {
        var hotelName = $(".mr-hotel-details").data("hotel-name");
        var oldUrl = $('.events-request-quote-btn').find('a').attr('href');
        var newUrl = oldUrl + "?" + "hotelName=" + hotelName;
        $('.events-request-quote-btn').find('a').attr('href', newUrl);
        $('.clear-input-icon').click(function(e) {
            $(this).prev('.hotel-search').val("");
            $('.clear-input-icon').removeClass('show-clear-input');
            clearVenueSearchResults();
            $('#wedding-check-availaility-search-results').hide();
        });

        $(".searchbar-input.hotel-search").on("keyup", function() {

            var value = $(this).val().toLowerCase();
            if (value.length > 3) {
                $('.clear-input-icon').addClass('show-clear-input');
                performSearchForVenues(value)
            } else {
                $('.clear-input-icon').removeClass('show-clear-input');
                clearVenueSearchResults();
                $('#wedding-check-availaility-search-results').hide();
            }
        });

        $('#wedding-check-availaility-search-results').on("click", '.search-result-item', function() {
            $('#search-venue-input').val($(this).text());
            $('#wedding-check-availaility-search-results').hide();
        })
        $('#wedding-check-availaility-search-results').click(function(e) {
            e.stopPropagation();
        })
        $(document).click(function(e) {
            $('#wedding-check-availaility-search-results').hide();
        });
    } catch (error) {
        console.error("Error in wedding filter", error);
    }
});

function noResultsCallback() {
    try {
        $('#ca-global-re-direct').attr('href', "#");
    } catch (error) {
        console.error("Error in noResultsCallback", error);
    }
}

function performSearchForVenues(key) {
    $.ajax({
        method: "GET",
        url: "/bin/venueSearch",
        data: {
            searchText: key,
        }
    }).success(function(response) {
        succcesCallBack(response);
    }).fail(function(error) {
        console.error("search failed : ", error);
    });
}

function succcesCallBack(response) {
    clearVenueSearchResults();
    var $hotelSearchResults = $('#check-availaility-search-results-hotels');
    $('#wedding-check-availaility-search-results').show();
    $('.search-comp-results-sub-container').show();
    resultBuilder(response, $hotelSearchResults);
    if (Object.keys(response.websites).length == 0) {
        $('.search-comp-no-results').show();
    } else {
        $('.search-comp-no-results').hide();
    }
}

function clearVenueSearchResults() {
    $('#check-availaility-search-results-hotels').empty();
    $('#check-availaility-search-results-destinations').empty();
}

function resultBuilder(results, $resultsList) {
    var websiteHotels = results.websites;
    var websiteResults = $('#check-availaility-search-results-hotels');
    var destinationResults = $('#check-availaility-search-results-destinations');
    var destinationLs = results.destination;
    if ((Object.keys(websiteHotels).length)) {
        websiteHotels.forEach(function(obj) {
            websiteResults.append('<li class="search-result-item">' + obj.title + '</li>');
        });
        destinationLs.forEach(function(obj) {
            destinationResults.append('<li class="search-result-item" >' + obj + '</li>');
        });
    } else {
        $resultsList.closest('.search-comp-results-sub-container').hide();
    }
}

function redirectToResultPage() {
    try {
        var redirectPage = $('#venue-filter-go').data('redirecturl');
        if (redirectPage) {
            var searchKey = $('#search-venue-input').val();
            var capacity = $("#capacityDropdown").val();
            var filterBy = $("#filterBy").val();
            var newRedirectUrl = redirectPage + ".html";
            if (searchKey) {
                newRedirectUrl = updateQueryString("searchKey", searchKey, newRedirectUrl)
            }
            if (filterBy && capacity) {
                if (filterBy !== "all") {
                    newRedirectUrl = updateQueryString("filterBy", filterBy, newRedirectUrl);
                }
                if (capacity !== "Capacity") {
                    newRedirectUrl = updateQueryString("filterBy", filterBy, newRedirectUrl);
                    newRedirectUrl = updateQueryString("capacity", capacity, newRedirectUrl);
                }
            }
        }
        window.location.assign(newRedirectUrl);
    } catch (error) {
        console.error("Error in redirectToResultPage function", error);
    }
}

var availabilityObj = {
    initialSelecton: '',
    isCheckParamsUpdated: false,
    isRoomTypeUpdated: false
};
var domainChangeFlag = false;
var isToDateClickedTriggered;
bookedRoomsCount = 0;
var isTajHolidays = false;
var isAmaCheckAvailability = false;
var isAmaSite = false;
var amaBookingObject = {};
var shouldInvokeCalendarApiBas = false;
$('document').ready(
    function() {
        try {
            isAmaSite = $('.cm-page-container').hasClass('ama-theme');

            dataCache.session.setData("sameDayCheckout", $('.mr-hotel-details').attr('data-samedaycheckout'));

            //                sameDayCheckout = $('.mr-hotel-details').attr('data-samedaycheckout');
            //               console.log("sameDayCheckout::::::::", sameDayCheckout);

            initializeCheckAvailability();
            initializeDatePicker();
            disableBestAvailableButton();
            // setBookAStaySessionObject();
            autoPopulateBookAStayWidget();
            if (!verifyIfRoomsPage()) {
                fetchDateOccupancyParametersFromURL();
            }

            _globalListOfPromoCode = getPromoCodeFromData();
            var url = window.location.href;
            if (($('#page-scope').attr('data-pagescope') == 'Taj Holidays') ||
                (url && url.indexOf('taj-holiday-redemption') != -1)) {
                checkHolidayScope()
                isTajHolidays = true;
            }
            if (dataCache.session.getData('bookingDetailsRequest')) {
                bookedOptions = JSON.parse(dataCache.session.getData('bookingDetailsRequest'));
                bookedCheckInDate = moment(bookedOptions.checkInDate, "YYYY-MM-DD").format("MMM Do YY");
                bookedCheckOutDate = moment(bookedOptions.checkOutDate, "YYYY-MM-DD").format("MMM Do YY");
                bookedAdultsOccupancy = bookedOptions.roomList[0].noOfAdults;
                bookedChildrenOccupancy = bookedOptions.roomList[0].noOfChilds;
                bookedRoomsCount = bookedOptions.roomList.length || 0;
            }
            if ((window.location.href.indexOf('rooms-and-suites') != -1) || isTajHolidays ||
                $('.cm-page-container').hasClass('destination-layout')) {
                dateOccupancyInfoSticky();
            }

            // [IHCL_CB START]
            initIHCLCBBookAStay();
            // [IHCL_CB ENDS]

        } catch (error) {
            console.error("Error in /apps/tajhotels/components/content/book-a-stay/clientlibs/js/book-a-stay.js ",
                error.stack);
        }


        shouldInvokeCalendarApiBas = false;
        if (document.getElementById("shouldInvokeCalendarApiBas"))
            var shouldInvokeCalendarApiBas = document.getElementById("shouldInvokeCalendarApiBas").value;
        if (shouldInvokeCalendarApiBas) {
            //***Removing Ama Calendar rates modified****///
            var getPathName = window.location.pathname;
            var getHostName = window.location.hostname;
            if (getHostName == 'www.amastaysandtrails.com' || getPathName.includes('/content/ama')) {
                return;
            } ///*** changes end ****///
            amacacalendarPricingBas();
            bindNextPrevClickAmaBas();
        }
        if ($("#hotelIdFromSearch").text() == '') {
            $('.searchbar-input').val("")
        }
    });

function initIHCLCBBookAStay() {
    if (isIHCLCBSite()) {
        fetchIHCLCBEntityDetails();
        addEntityDropDownEventsForIHCLCB();
    }
}

function fetchDateOccupancyParametersFromURL() {
    try {
        var bookingOptions = {};
        var _globalPromoCode = {
            name: null,
            value: null
        };
        var checkInDate = getQueryParameter('from');
        var checkOutDate = getQueryParameter('to');
        var rooms = getQueryParameter('rooms');
        var adults = getQueryParameter('adults');
        var children = getQueryParameter('children');
        if (checkInDate && checkOutDate) {
            var nights = moment(checkOutDate, "DD.MM.YYYY").diff(moment(checkInDate, "DD.MM.YYYY"), 'days');
            checkInDate = moment(checkInDate, 'DD/MM/YYYY').format('MMM Do YY');
            checkOutDate = moment(checkOutDate, 'DD/MM/YYYY').format('MMM Do YY');
            bookingOptions.fromDate = checkInDate;
            bookingOptions.toDate = checkOutDate;
            bookingOptions.nights = parseInt(nights)

        }
        if (rooms && adults && children) {
            if (validateRoomsQueryParams(rooms, adults, children)) {
                var roomOptions = [];
                var adultsArr = adults.split(",");
                var childArr = children.split(",");
                for (var index = 0; index < rooms; index++) {
                    roomOptions.push({
                        "adults": adultsArr[index],
                        "children": childArr[index],
                        "initialRoomIndex": index
                    });
                }
                bookingOptions.roomOptions = roomOptions;
            }
        }
        if (checkInDate && checkOutDate && rooms && adults && children) {
            bookingOptions.isAvailabilityChecked = true;
            if (bookingOptions.rooms == 0) {
                bookingOptions.rooms = 1;
            }
            bookingOptions.previousRooms = bookingOptions.roomOptions;
            bookingOptions.previousDates = {
                fromDate: bookingOptions.fromDate,
                toDate: bookingOptions.toDate
            };
            bookingOptions.selection = [];
            bookingOptions.promoCode = _globalPromoCode.value;
            bookingOptions.promoCodeName = _globalPromoCode.name;
            bookingOptions.hotelChainCode = null;
            bookingOptions.hotelId = null;
            var redirectFromAmp = getQueryParameter('redirectFromAmp');
            if (redirectFromAmp) {
                var promoCode = getQueryParameter('promoCode');
                var hotelId = getQueryParameter('hotelId');
                var targetEntity = getQueryParameter('targetEntity');
                var isAvailabilityChecked = getQueryParameter('isAvailabilityChecked');
                if (!promoCode) {
                    promoCode = "";
                }
                bookingOptions.promoCode = promoCode;
                if (!hotelId) {
                    hotelId = null;
                }
                bookingOptions.hotelId = hotelId;
                if (!targetEntity) {
                    targetEntity = null;
                }
                bookingOptions.targetEntity = targetEntity;
                if (!isAvailabilityChecked) {
                    isAvailabilityChecked = false;
                }
                bookingOptions.isAvailabilityChecked = isAvailabilityChecked;
            }
            dataCache.session.setData('bookingOptions', bookingOptions);
            updateCheckAvailability();
            removeDateOccupancyParamFromUrl();
        }
    } catch (err) {
        console.error(err);
    }
}

function validateRoomsQueryParams(rooms, adults, children) {
    var isValid = false;
    if (isInt(rooms)) {
        if (rooms > 0 && rooms <= 5) {
            if (adults.split(",").length == rooms && children.split(",").length == rooms) {
                if (isOccupantsParamValidFor(adults, 1, 7) && isOccupantsParamValidFor(children, 0, 7)) {
                    isValid = true;
                } else {
                    isValid = false;
                    console
                        .error("Non Integer parameters passed in Adults/Children or Min/Max Adults[1,7]/Childrens[0,7] occupancy validation failed");
                }
            } else {
                isValid = false;
                console.error("No of Adults and Childrens not matching with No of Rooms");
            }
        } else {
            isValid = false;
            console.error("Min/Max No of Rooms [1,5] validation failed");
        }
    } else {
        isValid = false;
        console.error("Invalid Input Parameter passed as rooms");
    }
    return isValid;
}

function isOccupantsParamValidFor(occupants, minValue, maxValue) {
    var isValid = occupants.split(",").every(function(x) {
        if (isInt(x)) {
            if (x >= minValue && x <= maxValue) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
    return isValid;
}

function verifyIfRoomsPage() {
    var presentUrl = window.location.href;
    if (presentUrl.includes("rooms-and-suites") || presentUrl.includes("accommodations") ||
        presentUrl.includes("booking-cart")) {
        return true;
    }
    return false;
}

function removeDateOccupancyParamFromUrl() {
    /*Check if not Ginger hotels*/
    if (typeof searchHotelId != 'undefined' && searchHotelId != "99999") {
        var presentUrl = window.location.href;
        var paramsToRemoveArr = ["from", "to", "rooms", "adults", "children", "overrideSessionDates"];
        var refinedUrl = '';
        paramsToRemoveArr.forEach(function(param, index) {
            presentUrl = removeURLParameter(presentUrl, param);
        });
        refinedUrl = presentUrl;
        window.history.replaceState({}, document.title, refinedUrl);
    }
}

function removeURLParameter(url, parameter) {
    var urlparts = url.split('?');
    if (urlparts.length >= 2) {

        var prefix = encodeURIComponent(parameter) + '=';
        var pars = urlparts[1].split(/[&;]/g);

        for (var i = pars.length; i-- > 0;) {
            if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                pars.splice(i, 1);
            }
        }
        return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
}

function isInt(value) {
    return !isNaN(value) && (function(x) {
        return (x | 0) === x;
    })(parseFloat(value))
}

/*
 * If query params contains redirectFromAmp, we initialize the bookingOptions from query params.
 */
function getBookAStayUrlParams() {
    try {
        if (URLSearchParams) {
            var params = new URLSearchParams(location.search);
            if (params.has("redirectFromAmp")) {
                var fromDate = checkFalseString(params.get("fromDate")) ||
                    moment(new Date()).add(1, 'days').format("MMM Do YY");
                //var toDate = checkFalseString(params.get("toDate")) || moment(new Date()).add(2, 'days').format("MMM Do YY");

                var toDate = checkFalseString(params.get("toDate")) || initialBookingSetup();

                bookingOptions = {
                    fromDate: fromDate,
                    toDate: toDate,
                    rooms: 1,
                    nights: moment(toDate, "MMM Do YY").diff(moment(fromDate, "MMM Do YY"), 'days'),
                    roomOptions: [{
                        adults: checkFalseString(params.get("adults")) || 1,
                        children: checkFalseString(params.get("children")) || 0,
                        initialRoomIndex: 0
                    }],
                    selection: [],
                    promoCode: checkFalseString(params.get("promoCode")) || "",
                    hotelId: checkFalseString(params.get("hotelId")) || null,
                    targetEntity: checkFalseString(params.get("targetName")) || null,
                    isAvailabilityChecked: false
                };

                dataCache.session.setData("bookingOptions", bookingOptions);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Value returned from URLSearchParams can be "null" so explicit check for that.
function checkFalseString(value) {
    if (value !== "null") {
        return value;
    }
    return false;
}

function getPromoCodeFromData() {
    var promoCodeList = $($.find("[data-promo-code]")[0]).data();
    if (promoCodeList) {
        return promoCodeList.promoCode.promoCodes;
    } else {
        $('.bas-specialcode-container').remove();
    }
    return null;
}

function initializeCheckAvailability() {
    $('#cmCheckAvailability, #cmCheckAvailabilitySmallDevice, .book-stay-btn ').off('click').on('click', function(e) {
        e.stopPropagation();
        dataCache.session.setData("sameDayCheckout", $('.mr-hotel-details').attr('data-samedaycheckout'));
        isAmaCheckAvailability = false;
        $('.cm-page-container').addClass("prevent-page-scroll");
        $('.cm-bas-con').addClass('active');
        $(".cm-bas-content-con").css("max-height", 0.95 * (window.innerHeight));
        autoPopulateBookAStayWidget();
        initiateCalender();
        modifyBookingState = dataCache.session.getData('modifyBookingState');
        if (modifyBookingState && modifyBookingState != 'modifyRoomType') {
            modifyBookingInBookAStay(modifyBookingState);
        }
        resetPromoCodeTab();
        if ($("#hotelIdFromSearch").text() == '') {
            $('.searchbar-input').val("")
        }
    });

    var openBookAStay = getUrlParameter("openBookAStay")
    if (openBookAStay == "true") {
        $(".book-stay-btn").click();
    }

};

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName, i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function promptToSelectDate() {
    var bookingOptions = dataCache.session.getData("bookingOptions");
    var elDatePrompt = $(".mr-checkIn-checkOut-Date .mr-checkIn-checkOut-Date-hover");
    if (!bookingOptions.isAvailabilityChecked) {
        elDatePrompt.css('display', 'block');
        elDatePrompt.addClass('cm-scale-animation');
    } else {
        elDatePrompt.css('display', 'none');
        elDatePrompt.removeClass('cm-scale-animation');
    }
}

function initializeDatePicker() {
    _globalPromoCode = {
        name: null,
        value: null
    };

    $('.bas-overlay').on('click', function(e) {
        e.stopPropagation();
        // destroyDatepicker(); 
        overlayDestroyDatepicker();
    });

    // pop up close
    $(".bas-close").click(function(e) {
        e.stopPropagation();
        destroyDatepicker();
    });

    $(".trigger-promo-code-input").on("click", function() {
        $(".promo-code-wrap").css("display", "block");
        $(this).parent().hide();
    });

    $(".close-promocode-section").on("click", function() {
        $(".promo-code-wrap").hide();
        $(".bas-have-promo-code").show();
    });

    $('.special-code-wrap .bas-aroow-btn').on('click', function() {
        $('.bas-code-wrap.clearfix').toggleClass('active');
        $(this).toggleClass('arrow-btn');
    });

    $(".input-daterange input").each(function(e) {
        $(this).focus(function(e) {
            $('.bas-calander-container').addClass('active');
            $(".bas-left-date-wrap").removeClass("active");
            $(".bas-right-date-wrap").removeClass("active");
            $(this).parent().parent().addClass("active");
        });
    });

    // adding quantity script starts
    $(".bas-room-details-container").delegate(".quantity-right-plus", "click", incrementSelectionCount);
    // adding quantity script ends

    // subtracting quantity script starts
    $(".bas-room-details-container").delegate(".quantity-left-minus", "click", decrementSelectionCount);
    // subtracting quantity script ends

    // SCRIPT for addroom button starts

    $(".bas-add-room").on('click', function() {
        addRoomModule();
        if (isIHCLCBHomePage()) {
            createguestCountContainer();
            // activate last room
            $('.bas-room-no').last().click();
        }
    });

    // SCRIPT for addroom button ends

    // adding active class when click on room no starts
    $(".bas-room-details-container").on("click", ".bas-room-no", function() {
        makeRoomActiveModule($(this));
    });
    // adding active class when click on room no ends

    // delete button script starts
    $(".bas-room-details-container").on("click", ".bas-room-delete-close", function(e) {
        e.stopPropagation();
        if ($(".bas-room-details").length > 1) {
            var roomDeleteIndex = $(this).closest('.bas-room-no').index('.bas-room-no');
            deleteRoomModule(roomDeleteIndex);
        }
    });

    // script by arvind ends
    $('.input-daterange input').blur(function(e) {
        $('.bas-hotel-details-container').removeClass('active');
    });

    $("#input-box1 , #input-box2").on('change', function(e) {
        updateFinalDatePlanModule();
        amaBookingObject.isAmaCheckAvailabilitySelected = true;
    });

    $('.active #input-box1').on('change', function(e) {
        var $nextInput = $('.input-box.date-explore').not($(this));
        var compareVal = $nextInput.val();

        var $self = $(this);
        var currVal = $(this).val();

        var bookingOptionsSelected = dataCache.session.getData("bookingOptions");
        var fromDateSelecetd = moment(bookingOptionsSelected.fromDate, "MMM Do YY").format("D MMM YY");

        if (currVal == fromDateSelecetd) {
            return;
        }

        setTimeout(function() {
            $(this).blur();
            $('.bas-calander-container').children().remove();
            $('#input-box2').focus();

            //var nextDate = moment(currVal, "D MMM YY").add(1, 'days');
            var nextDate = checkSameDayCheckout(currVal);

            if (isTajHolidays || getQueryParameter('holidaysOffer')) {
                var holidaysNights = 2;
                var holidaysCacheData = dataCache.session.getData('bookingOptions');
                if (holidaysCacheData && holidaysCacheData.nights)
                    holidaysNights = holidaysCacheData.nights;
                nextDate = moment(currVal, "D MMM YY").add(holidaysNights, 'days');
            }

            $nextInput.focus();
            $nextInput.datepicker('setDate', new Date(nextDate.toDate()));
            isToDateClickedTriggered = true;

            var $dateTable = $(".datepicker .datepicker-days table");
            updateFinalDatePlanModule();
            var shouldInvokeCalendarApi = document.getElementById("shouldInvokeCalendarApiBas").value;
            if (shouldInvokeCalendarApi) {
                //***Removing Ama Calendar rates modified****//
                var getPathName = window.location.pathname;
                var getHostName = window.location.hostname;
                if (getHostName == 'www.amastaysandtrails.com' || getPathName.includes('/content/ama')) {
                    return;
                } ///*** changes end ****///
                amacacalendarPricingBas();
                bindNextPrevClickAmaBas();
                $('#input-box2').trigger('click');
            }

        }, 100);

    });

    $('#input-box2').on('change', function(e) {
        var $self = $(this);
        var isTargetInput = $self.closest('.bas-right-date-wrap').hasClass('active');
        var $nextInput = $('.input-box.date-explore').not($self);
        var compareVal = $nextInput.val();
        var currVal = $self.val();

        var bookingOptionsSelected = dataCache.session.getData("bookingOptions");
        var toDateSelecetd = moment(bookingOptionsSelected.toDate, "MMM Do YY").format("D MMM YY");

        if (isTargetInput) {

            setTimeout(function() {
                if (!isToDateClickedTriggered) {
                    hideCalenderInBookAStayPopup()
                    $self.parent().parent().removeClass("active");
                } else {
                    isToDateClickedTriggered = false;
                }

                $self.blur();

                if ((compareVal == currVal) && (compareVal != "") && (currVal != "")) {

                    //var nextDate = moment(currVal, "D MMM YY").add(1, 'days');
                    var nextDate = checkSameDayCheckout(currVal);

                    if (isTajHolidays || getQueryParameter('holidaysOffer')) {
                        var holidaysNights = 2;
                        var holidaysCacheData = dataCache.session.getData('bookingOptions');
                        if (holidaysCacheData && holidaysCacheData.nights)
                            holidaysNights = holidaysCacheData.nights;
                        nextDate = moment(currVal, "D MMM YY").add(holidaysNights, 'days');
                    }

                    $self.datepicker('setDate', new Date(nextDate.toDate()));

                    var $dateTable = $(".datepicker .datepicker-days table");
                }


            }, 100);

            updateFinalDatePlanModule();

        }
    });

    // Click on Best available rate to proceed further
    $('.best-avail-rate').on('click', function(e) {
        var noOfNight = numberOfNightsCheck();
        var sebNights = sebNightsCheck();
        if (noOfNight == false) {
            numberOfNightsExcessWarning();
        } else if (sebNights == false) {
            numberOfSebNightsExcessWarning();
        } else
            onClickOnCheckAvailabilty();
    });

    // removing links from search suggestion within booking widget
    $('.cm-bas-content-con').find('.suggestions-wrap').find('a').each(function() {
        $(this).removeAttr('href');
    });

    $('.promo-code').on("keyup", function() {
        var promoCodeInput = $(this).val();
        if (promoCodeInput.length > 0) {
            $('.apply-promo-code-btn').show();
            $('.promo-code-clear-input').show();
        } else {
            $('.apply-promo-code-btn').hide();
            $('.promo-code-clear-input').hide();
        }
    });

    $('.apply-promo-code-btn').on("click", function() {
        validatePromocode(_globalPromoCode);
    });

    $('.promo-code-clear-input').on("click", function() {
        $('.promo-code').val("");
        $(this).hide();
        $('.apply-promo-code-btn').hide();
        $('.promocode-status-text').text("");
        _globalPromoCode.value = null;
        _globalPromoCode.name = null;
    });

    $(".cm-bas-content-con .searchbar-input").keyup(function() {
        disableBestAvailableButton();

        $(this).attr("data-selected-search-value", "");
    });

    // Event listeners ends here
}

function numberOfNightsExcessWarning() {
    var popupParams = {
        title: 'Are you sure? You have selected more than 1O night.',
        callBack: onClickOnCheckAvailabilty.bind(),
        // callBackSecondary: secondaryFn.bind( _self ),
        needsCta: true,
        isWarning: true
    }
    warningBox(popupParams);
}

function numberOfSebNightsExcessWarning() {
    var popupParams = {
        title: 'Your maximum nights limit is exceeded.',
        callBack: modifySebNights,
        // callBackSecondary: secondaryFn.bind( _self ),
        needsCta: true,
        isWarning: true
    }
    warningBox(popupParams);
}

function modifySebNights() {
    $('.book-stay-btn').trigger('click');
}

function navigateToRoomsPage(validationResult, clearExistingCart) {
    if (validationResult) {
        var nextPageHref;
        if (isAmaCheckAvailability) {
            nextPageHref = $('#checkAvailability').attr('hrefvalue');
        } else {
            nextPageHref = $('#global-re-direct').attr('hrefValue');
        }

        var bookingOptions = dataCache.session.getData("bookingOptions");
        if (clearExistingCart) {
            $(bookingOptions.roomOptions).each(function(index) {
                delete bookingOptions.roomOptions[index].userSelection;
            });
            bookingOptions.selection = [];
            $('.book-ind-container').css('display', 'none');
            $('.room-details-wrap, .bic-rooms').html('');
        }
        bookingOptions.isAvailabilityChecked = true;
        if (bookingOptions.rooms == 0) {
            bookingOptions.rooms = 1;
        }
        bookingOptions.previousRooms = bookingOptions.roomOptions;
        var BungalowType = bookingOptions.BungalowType
        if (!BungalowType) {
            BungalowType = null;
        }
        bookingOptions.previousDates = {
            fromDate: bookingOptions.fromDate,
            toDate: bookingOptions.toDate,
            BungalowType: BungalowType
        };
        dataCache.session.setData("bookingOptions", bookingOptions);
        var offerCodeIfAny = null;
        var onlyMemberRatesIfAny = null;
        var offerTitleIfAny = false;
        var holidaysOfferQueryParam = false;
        // [TIC-FLOW]
        //if (!isTicBased()) {
        //offerCodeIfAny = $('[data-offer-rate-code]').data('offer-rate-code');
        offerCodeIfAny = $('[data-offer-rate-code]:not(.tic-room-redemption-rates)').data('offer-rate-code');
        onlyMemberRatesIfAny = getQueryParameter('onlyMemberRates');
        // HolidayOfferTitle
        offerTitleIfAny = getQueryParameter('offerTitle');
        holidaysOfferQueryParam = getQueryParameter('holidaysOffer');
        //}
        var usedVoucherCode = $('#usedVoucher').text();
        if (usedVoucherCode != undefined && usedVoucherCode != "" && usedVoucherCode != " ") {
            var bookingOptionsCache = dataCache.session.getData('bookingOptions');
            if (bookingOptionsCache.usedVoucherCode == usedVoucherCode) {
                offerCodeIfAny = "X5";
            }

        }
        if ($('#page-scope').attr('data-pagescope') == 'Taj Holidays')
            dataCache.session.setData("checkHolidayAvailability", true);
        else
            dataCache.session.setData("checkHolidayAvailability", false);

        if ($('.rate-code').val() || $('.promo-code').val() || $('.agency-id').val()) {
            var bookingSessionData = dataCache.session.getData("bookingOptions");
            var checkInDate = moment(bookingSessionData.fromDate, "MMM Do YY").format("YYYY-MM-DD");
            var checkOutDate = moment(bookingSessionData.toDate, "MMM Do YY").format("YYYY-MM-DD");

            var roomOptions = bookingSessionData.roomOptions;
            var roomOptionsLength = roomOptions.length;
            var adults, children;
            var searchHotelId = $("#hotelIdFromSearch").text();
            var rateCode = $('.rate-code').val();
            var agencyId = $('.agency-id').val();
            var promoAccessCode = $('.promo-code').val();
            for (var r = 0; r < roomOptionsLength; r++) {
                var adlt = roomOptions[r].adults;
                var chldrn = roomOptions[r].children;
                if (r == 0) {
                    adults = adlt;
                    children = chldrn;
                } else {
                    adults = adults + ',' + adlt;
                    children = children + ',' + chldrn;
                }
            }
            if (!!agencyId) {
                var synxisRedirectLink = 'https://be.synxis.com/?' + 'arrive=' + checkInDate + '&depart=' + checkOutDate +
                    '&rooms=' + roomOptionsLength + '&adult=' + adults + '&child=' + children + '&hotel=' +
                    searchHotelId + '&chain=21305' + '&currency=' + '&level=chain' + '&locale=en-US' + '&sbe_ri=0';
                synxisRedirectLink = synxisRedirectLink + (!!agencyId ? '&agencyid=' + agencyId : '') +
                    (!!rateCode ? '&&rate=' + rateCode : '') + (!!promoAccessCode ? '&promo=' + promoAccessCode : '');
                nextPageHref = synxisRedirectLink;
            } else {
                nextPageHref = nextPageHref + "?" + (!!rateCode ? '&&offerRateCode=' + rateCode : '') + (!!promoAccessCode ? '&promoCode=' + promoAccessCode : '');

                /*Check if GInger hotels*/
                if (searchHotelId == "99999") {
                    nextPageHref = nextPageHref + "&from=" + checkInDate + "&to=" + checkOutDate + "&rooms=" + roomOptionsLength +
                        "&adults=" + adults + "&children=" + children;
                    var tataNeuParams = localStorage.getItem("tataNeuParams");
                    if (tataNeuParams != null) {
                        nextPageHref = nextPageHref + "&" + tataNeuParams;
                    }

                    /* commenting old code 
                    var authCode = localStorage.getItem("authCode");
                    if(authCode != null){
                    	nextPageHref = nextPageHref + "&authCode=" + authCode;
                	}
                    var codeVerifier = localStorage.getItem("codeVerifier");
                    if(codeVerifier != null){
                    	nextPageHref = nextPageHref + "&codeVerifier=" + codeVerifier;
                	}
                    */
                }
            }
        }
        if (isAmaSite) {
            var offerRateCode = $('[data-offer-rate-code]:not(.tic-room-redemption-rates)').data('offer-rate-code');
            var publicRateshide = (getQueryParameter('publicRates') ? '&publicRates=' + getQueryParameter('publicRates') : '');
            if (offerRateCode) {
                nextPageHref = nextPageHref.concat('?offerRateCode=' + offerRateCode + '&checkAvail=true' + publicRateshide);
            } else if (promoAccessCode == null || promoAccessCode == '') {
                nextPageHref = nextPageHref.concat('?checkAvail=true');
            } else {
                nextPageHref = nextPageHref.concat('&checkAvail=true');
            }
            if (nextPageHref.indexOf("?") != -1)
                nextPageHref = nextPageHref + checkandAppendOtherQueryParams();
            else
                nextPageHref = nextPageHref + "?" + checkandAppendOtherQueryParams();

            if (isAmaCheckAvailability) {
                if (isBungalowSelected()) {
                    nextPageHref += "&onlyBungalows=true";
                }
            } else {
                if ($('#onlyBungalowBtn').is(':checked')) {
                    nextPageHref += "&onlyBungalows=true";
                }
            }

        } else {
            debugger;
            var promoTabParamIfAny = getQueryParameter('promoCode');
            var rataTabParamIfAny = getQueryParameter('rateTab');
            var publicRateshide = getQueryParameter('publicRates');
            var promoCodeEnabled = $('#promoCode').val();
            if (promoCodeEnabled == 'true') {
                var pageParam = (!!offerCodeIfAny ? 'promoCode=' + offerCodeIfAny : '') +
                    (offerTitleIfAny ? '&offerTitle=' + offerTitleIfAny : '') +
                    (holidaysOfferQueryParam ? '&holidaysOffer=' + holidaysOfferQueryParam : '') +
                    (promoTabParamIfAny ? '&promoCode=' + promoTabParamIfAny : '') +
                    (rataTabParamIfAny ? '&rateTab=' + rataTabParamIfAny : '') +
                    (publicRateshide ? '&publicRates=' + publicRateshide : '');
            } else {
                var pageParam = (!!offerCodeIfAny ? 'offerRateCode=' + offerCodeIfAny : '') +
                    (onlyMemberRatesIfAny ? '&onlyMemberRates=' + onlyMemberRatesIfAny : '') +
                    (offerTitleIfAny ? '&offerTitle=' + offerTitleIfAny : '') +
                    (holidaysOfferQueryParam ? '&holidaysOffer=' + holidaysOfferQueryParam : '') +
                    (promoTabParamIfAny ? '&promoCode=' + promoTabParamIfAny : '') +
                    (rataTabParamIfAny ? '&rateTab=' + rataTabParamIfAny : '') +
                    (publicRateshide ? '&publicRates=' + publicRateshide : '');
            }

            if (pageParam) {
                nextPageHref = nextPageHref + "?" + pageParam;
            }

            if (nextPageHref.indexOf("?") != -1)
                nextPageHref = nextPageHref + checkandAppendOtherQueryParams();
            else
                nextPageHref = nextPageHref + "?" + checkandAppendOtherQueryParams();

        }
        if (nextPageHref.includes('amastaysandtrails.com')) {
            nextPageHref = nextPageHref.replace('rooms-and-suites', 'accommodations');
        }

        /*fixe for Microsite navigation in prod*/
        if (nextPageHref.includes('https://www.tajinnercircle.com')) {
            nextPageHref = nextPageHref.replace('https://www.tajinnercircle.com/en-in', '/en-in/tajinnercircle');
        }
        if (nextPageHref.includes('https:/www.tajinnercircle.com')) {
            nextPageHref = nextPageHref.replace('https:/www.tajinnercircle.com/en-in', '/en-in/tajinnercircle');
        }

        if (domainChangeFlag) {
            if (nextPageHref.includes("?")) {
                if (nextPageHref.charAt(nextPageHref.length - 1) === "?") {
                    nextPageHref += fetchDateOccupancyAsQueryString();
                } else {
                    nextPageHref += "&" + fetchDateOccupancyAsQueryString();
                }
            } else {
                nextPageHref += "?" + fetchDateOccupancyAsQueryString();
            }
        }

        // handle page refresh for voucher redemption
        var voucherRedemption = dataCache.session.getData('voucherRedemption');
        var voucherShowRates = dataCache.session.getData('voucherRedemptionShowPrice');
        if (voucherRedemption && voucherRedemption == 'true') {
            nextPageHref = nextPageHref + "&voucherRedemption=true";
            if (voucherShowRates) {
                nextPageHref = nextPageHref + "&voucherRedemption=true" + "&voucherPrice=true"
            }
        }

        if (modifyBookingState && modifyBookingState != '') {
            nextPageHref = window.location.href.split('?')[0];
        }

        if (nextPageHref.includes('/ginger/')) {

            var bookingSessionData = dataCache.session.getData("bookingOptions");
            var checkInDate = moment(bookingSessionData.fromDate, "MMM Do YY").format("YYYY-MM-DD");
            var checkOutDate = moment(bookingSessionData.toDate, "MMM Do YY").format("YYYY-MM-DD");

            var roomOptions = bookingSessionData.roomOptions;
            var roomOptionsLength = roomOptions.length;
            var adults, children;
            var searchHotelId = $("#hotelIdFromSearch").text();
            var rateCode = $('.rate-code').val();
            var agencyId = $('.agency-id').val();
            var promoAccessCode = $('.promo-code').val();
            for (var r = 0; r < roomOptionsLength; r++) {
                var adlt = roomOptions[r].adults;
                var chldrn = roomOptions[r].children;
                if (r == 0) {
                    adults = adlt;
                    children = chldrn;
                } else {
                    adults = adults + ',' + adlt;
                    children = children + ',' + chldrn;
                }
            }

            if (getParamFromURL("from", nextPageHref) == null || getParamFromURL("to", nextPageHref) == null ||
                getParamFromURL("rooms", nextPageHref) == null || getParamFromURL("adults", nextPageHref) == null ||
                getParamFromURL("children", nextPageHref) == null) {

                if (getParamFromURL("from", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&from=" + checkInDate;

                if (getParamFromURL("to", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&to=" + checkOutDate;

                if (getParamFromURL("rooms", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&rooms=" + roomOptionsLength;

                if (getParamFromURL("adults", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&adults=" + adults;

                if (getParamFromURL("children", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&children=" + children;

                if (getParamFromURL("promoCode", nextPageHref) == null)
                    nextPageHref = nextPageHref + "&promoCode=" + promoAccessCode;

                if (localStorage.getItem('tataNeuParams') != null) {
                    nextPageHref = nextPageHref + "&" + localStorage.getItem('tataNeuParams');
                }
                /*var authCode = localStorage.getItem("authCode");
                if(authCode != null){
                    nextPageHref = nextPageHref + "&authCode=" + authCode;
                }
                var codeVerifier = localStorage.getItem("codeVerifier");
                if(codeVerifier != null){
                    nextPageHref = nextPageHref + "&codeVerifier=" + codeVerifier;
                }*/
            }
        }

        if (nextPageHref.indexOf('/ginger/') != -1 && nextPageHref.indexOf("/en-in/swt/?redirectUrl=") == -1) {
            nextPageHref = "/en-in/swt/?redirectUrl=" + nextPageHref;
        }

        window.location.href = nextPageHref;

        $(".cm-bas-con").removeClass("active");
    }
    $('#book-a-stay').trigger('taj:fetchRates', [bookingOptions]);
};

function getParamFromURL(name, customUrl) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(customUrl);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function checkandAppendOtherQueryParams() {
    var queryString = ''
    queryString += (getQueryParameter('gsoCorporateBooking') ? '&gsoCorporateBooking=' + getQueryParameter('gsoCorporateBooking') : '');
    queryString += (getQueryParameter('vouchershareholderflow') ? '&vouchershareholderflow=' + getQueryParameter('vouchershareholderflow') : '');
    queryString += (getQueryParameter('rateTab') ? '&rateTab=' + getQueryParameter('rateTab') : '');
    queryString += (getQueryParameter('qcvoucherCode') ? '&qcvoucherCode=' + getQueryParameter('qcvoucherCode') : '');
    queryString += (getQueryParameter('qcvoucherpin') ? '&qcvoucherpin=' + getQueryParameter('qcvoucherpin') : '');
    //queryString += (sessionStorage.getItem('source') != null? '&&source='+sessionStorage.getItem('source') : '');
    // new changes
    queryString += (getQueryParameter('source') != null ? '&source=' + getQueryParameter('source') : '');
    queryString += (getQueryParameter('utm_source') != null ? '&utm_source=' + getQueryParameter('utm_source') : '');
    queryString += (getQueryParameter('utm_medium') != null ? '&utm_medium=' + getQueryParameter('utm_medium') : '');
    queryString += (getQueryParameter('pincode') != null ? '&pincode=' + getQueryParameter('pincode') : '');
    queryString += (getQueryParameter('city') != null ? '&city=' + getQueryParameter('city') : '');
    queryString += (getQueryParameter('lat') != null ? '&lat=' + getQueryParameter('lat') : '');
    queryString += (getQueryParameter('long') != null ? '&long=' + getQueryParameter('long') : '');

    return queryString;
}

function onClickOnCheckAvailabilty() {
    var validationResult = validateSearchInput();

    if (isIHCLCBHomePage() && !(checkboxCheckedStatus() && isEntitySelected())) {
        return;
    }

    var bookingOptions = updateBookingOptionsInStorage(_globalPromoCode);

    var getHotelId;
    getHotelId = $("#hotelIdFromSearch").text();
    var dataId = dataCheck();
    checkPreviousSelection();
    var cartCheck = cartEmptyCheck();
    var check = false;
    if (getHotelId != dataId) {
        check = true;
    }
    var _self = this;
    if (modifyBookingState == 'modifyDate') {
        var modifiedCheckInDate = moment($('#input-box1').datepicker('getDate')).format("MMM Do YY");
        var modifiedCheckOutDate = moment($('#input-box2').datepicker('getDate')).format("MMM Do YY");
        if (modifiedCheckInDate != bookedCheckInDate || modifiedCheckInDate != bookedCheckOutDate) {
            var warnMsg = 'You have changed Check-In/Check-Out date. Are you sure you want to continue?';
            showWarningMessage(_self, warnMsg, validationResult);
        } else {
            $('.bas-close').trigger('click');
            // or we will redirect to confirmation page with previous
            // booking details
        }
    } else if (modifyBookingState == 'modifyRoomOccupancy') {
        var modifiedAdultsOccupancy = $('.bas-no-of-adults input').val();
        var modifiedChildrenOccupancy = $('.bas-no-of-child input').val();
        if (modifiedAdultsOccupancy != bookedAdultsOccupancy || modifiedChildrenOccupancy != bookedChildrenOccupancy) {
            var warnMsg = 'You have changed Adult/Child occupancy. Are you sure you want to continue?';
            showWarningMessage(_self, warnMsg, validationResult);
        } else {
            $('.bas-close').trigger('click');
            // or we will redirect to confirmation page with previous
            // booking details
        }
    } else if (modifyBookingState == 'modifyAddRoom') {
        var clearExistingCart = true;
        var warnMsg = 'You have added room. Are you sure you want to continue?';
        showWarningMessage(_self, warnMsg, validationResult);
    } else if (!cartCheck && (check || availabilityObj.isCheckParamsUpdated || availabilityObj.isDatesUpdated)) {
        var clearExistingCart = true;
        var warnMsg = 'Your existing cart values, if any, will be lost because you have updated your selection. Do you want to proceed?';
        showWarningMessage(_self, warnMsg, validationResult);
    } else if (isAmaSite && availabilityObj.isRoomTypeUpdated) {
        var warnMsg = 'You have updated your room type. Do you want to proceed?';
        showWarningMessage(_self, warnMsg, validationResult);
    } else {
        navigateToRoomsPage(validationResult);
    }
}

function showWarningMessage(_self, msg, validationResult) {
    var popupParams = {
        title: msg,
        callBack: navigateToRoomsPage.bind(_self, validationResult, true),
        // callBackSecondary: secondaryFn.bind( _self ),
        needsCta: true,
        isWarning: true
    }
    warningBox(popupParams);
}

function updateRoomNumberText() {
    var room = "Room";
    if ($(".bas-room-details").length > 1)
        room = "Rooms";
    else
        room = "Room";
    $(".room-border").text($(".bas-room-details").length + " " + room);
}

function dataCheck() {
    var cartHotelId;
    var bookingData = dataCache.session.getData("bookingOptions");
    if (bookingData && bookingData.selection && (bookingData.selection.length > 0)) {
        cartHotelId = bookingData.selection[0].hotelId;
    }
    return cartHotelId;
}

// _globalListOfPromoCode=['PROMO1','PROMOX'];
function validatePromocode(_globalPromoCode) {
    var promoCodeInput = $('.promo-code').val();
    promoCodeInput = promoCodeInput.toUpperCase();
    var promoCodeStatus = true;
    if (promoCodeStatus) {
        $('.promocode-status-text').text("Promo code selected: " + promoCodeInput);
        _globalPromoCode.value = promoCodeInput;
        _globalPromoCode.name = promoCodeInput;
    } else {
        $('.promocode-status-text').text("Promo code invalid.");
        _globalPromoCode.value = null;
        _globalPromoCode.name = null;
    }
}

function cartEmptyCheck() {
    var dataa = dataCache.session.getData("bookingOptions");
    if (dataa.selection && (dataa.selection.length == 0)) {
        return true;
    } else {
        return false;
    }
}

function incrementSelectionCount(e) {
    // Stop acting like a button
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    amaBookingObject.isAmaCheckAvailabilitySelected = true;
    // Get the field name
    var $button = $(this);
    var quantity = parseInt($button.parent().parent().find("input").val());
    ++quantity;
    if (isAmaSite) {
        if ($(".ama-theme .bas-about-room-container").css("display") == "block") {
            if ($button.hasClass('quantity-right-plus1')) {
                if (quantity > 10) {
                    quantity = 10;
                }

            } else {
                if (quantity > 7) {
                    quantity = 7;
                }
            }

        } else {
            if ($button.hasClass('quantity-right-plus1')) {
                if (quantity > 16) {
                    quantity = 16;
                }
            } else {
                if (quantity > 8) {
                    quantity = 8;
                }
            }
        }
    } else {
        if (quantity > 7) {
            quantity = 7;
        }
    }
    $button.parent().parent().find("input").val(quantity);
    $button.parent().parent().find("input").text(quantity);
    var x = $button.parent().parent().parent().attr("class");
    // script for adult count starts
    updateTotalAdultsCountModule();
    // script for adult count ends
    return false;
};

function decrementSelectionCount(e) {
    // Stop acting like a button
    amaBookingObject.isAmaCheckAvailabilitySelected = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    // Get the field name
    var $button = $($(this)[0])
    var quantity = parseInt($button.parent().parent().find("input").val());
    var x = $button.parent().parent().parent().attr("class");
    if (quantity > 0) {
        if (x === "bas-no-of-adults" && quantity == 1) {
            quantity = 2;
        }
        $button.parent().parent().find("input").val(quantity - 1);
    }
    // script for adult count starts
    updateTotalAdultsCountModule();
    // script for adult count ends
};

// module to update total adults count in booking widget
function updateTotalAdultsCountModule() {
    var totalAdultsCount = 0;
    $('.bas-no-of-adults, .bas-no-of-child').find('input').each(function() {
        totalAdultsCount += parseInt($(this).val());
    });
    var guestSuffix = (totalAdultsCount > 1) ? 's' : '';
    $(".bas-count-of-adults").text(totalAdultsCount + " Guest" + guestSuffix);
}

function checkPreviousSelection() {
    var bookingOptions = dataCache.session.getData("bookingOptions");
    if (bookingOptions.isAvailabilityChecked) {
        bookingOptions.previousRooms
            .forEach(function(value, index) {
                if (bookingOptions.roomOptions[index] &&
                    ((value.adults != bookingOptions.roomOptions[index].adults) || (value.children != bookingOptions.roomOptions[index].children))) {
                    availabilityObj.isCheckParamsUpdated = true;
                }
            });

        if ((bookingOptions.fromDate != bookingOptions.previousDates.fromDate) ||
            (bookingOptions.toDate != bookingOptions.previousDates.toDate)) {
            availabilityObj.isDatesUpdated = true;
        }
        if (isAmaSite && bookingOptions.BungalowType && bookingOptions.previousDates &&
            bookingOptions.previousDates.BungalowType &&
            bookingOptions.previousDates.BungalowType != bookingOptions.BungalowType) {
            availabilityObj.isRoomTypeUpdated = true;
        }

    }
}

// module to add room
function addRoomModule() {

    var room_no = $(".bas-room-no").length + 1;
    if (room_no < 6) {
        $(".bas-add-room")
            .before(
                '<li class="bas-room-no" id=room' +
                room_no +
                '><button class="btn-only-focus" aria-label = "bas room"><span class="bas-room bas-desktop">Room &nbsp</span><span class="bas-span-room-no">' +
                room_no +
                '</span></button><div class="bas-room-delete-close"><i class="icon-close"><button class="btn-only-focus" aria-label = "close icon"></button></i></div></li>');

        $($(".bas-room-details")[0]).clone().appendTo(".bas-room-details-container").addClass("bas-hide");

        var x = room_no;
        room_no--;
        $($(".bas-room-details")[room_no]).attr("id", "room" + x + "Details");
        $($(".bas-room-details")[room_no]).find("input").val("1");
        $($($(".bas-room-details")[room_no]).find("input")[1]).val("0");
        updateTotalAdultsCountModule();

        // update text for number of rooms
        updateRoomNumberText();
        var elRoomNumber = $(".bas-about-room-container").find('.bas-room-no');
        if (elRoomNumber.length >= 5) {
            $(".bas-add-room").addClass("bas-hide");
        } else {
            $(".bas-add-room").removeClass("bas-hide");
        }
        // script to make newly added room active

        makeRoomActiveModule($('.bas-room-no').last());
        $('.bas-room-delete-close .icon-close').removeClass('cm-hide');
    }
};

function isIHCLCBHomePage() {
    var currentPage = window.location.pathname;
    return currentPage.includes('/dashboard');
}

function deleteRoomInCartAndUpdateSelectionData(deleteRoomNumber) {
    var deleteRoomIndex = deleteRoomNumber - 1;
    $($('.fc-add-package-con')[deleteRoomIndex]).find('.selection-delete').trigger('click');
    var bookingOptionsInStorage = dataCache.session.getData("bookingOptions");
    var roomOptionsModified = bookingOptionsInStorage.roomOptions;
    roomOptionsModified.splice(deleteRoomIndex, 1);
    bookingOptionsInStorage.roomOptions = roomOptionsModified;
    --bookingOptionsInStorage.rooms;
    dataCache.session.setData("bookingOptions", bookingOptionsInStorage);
    updateCheckAvailability();
    $(".fc-add-package-con").eq(deleteRoomIndex).remove();
    updateRoomIndexForSelectedPackages();
    setCartPanelRoomsConWidth();
    updateSelectionInstruction();
}

function updateRoomIndexForSelectedPackages() {
    var bookingOptionsInStorage = dataCache.session.getData("bookingOptions");
    bookingOptionsInStorage.selection.forEach(function(value, index) {
        value.roomIndex = index;
    });
    dataCache.session.setData("bookingOptions", bookingOptionsInStorage);
}

// module to delete room
function deleteRoomModule(roomDeleteIndex) {
    $('.bas-room-no').eq(roomDeleteIndex).remove();
    $('.bas-room-details').eq(roomDeleteIndex).remove();
    var totalRoomsAfterDeletion = $('.bas-room-details').length;
    if (totalRoomsAfterDeletion < 2) {
        $('.bas-room-delete-close .icon-close').addClass('cm-hide');
    }
    var roomID = 1;
    $('.bas-room-no').each(function() {
        $(this).attr('id', 'room' + roomID);
        $(this).find('.bas-span-room-no').text(roomID);
        ++roomID;
    });
    roomID = 1;
    $('.bas-room-details').each(function() {
        $(this).attr('id', 'room' + roomID + "Details");
        ++roomID;
    });

    if ($('.bas-room-no').hasClass('bas-active') == false) {
        if ($('.bas-room-no').eq(roomDeleteIndex).length > 0) {
            makeRoomActiveModule($('.bas-room-no').eq(roomDeleteIndex));
        } else {
            makeRoomActiveModule($('.bas-room-no').eq(roomDeleteIndex - 1));
        }
    }
    deleteRoomInCartAndUpdateSelectionData(roomDeleteIndex + 1);

    // update for adults count starts
    updateTotalAdultsCountModule();
    // update for adults count ends
    // update text for number of rooms
    updateRoomNumberText();
    $(".bas-add-room").removeClass("bas-hide");
};

// module to make room active
function makeRoomActiveModule(elem) {
    $(".bas-room-no").each(function() {
        $(this).removeClass("bas-active");
    });

    var new_room_no = elem.attr("id") + "Details";

    $(".bas-room-details-container").find("ul").each(function() {
        $(this).addClass("bas-hide");
    });
    $($(".bas-room-details-container").find("ul")[0]).removeClass("bas-hide");
    $(".bas-room-details-container").find("ul#" + new_room_no).removeClass("bas-hide");

    elem.addClass("bas-active");
}

// module to update final date plan
function updateFinalDatePlanModule() {

    var currentDate = moment($("#input-box1").datepicker("getDate")).format("D MMM YY");
    var nextDate = moment($("#input-box2").datepicker("getDate")).format("D MMM YY");
    var finalDatePlan = currentDate + " - " + nextDate;

    $(".final-date-plan").text(finalDatePlan);
};

// module to update booking storage data
function updateBookingOptionsInStorage(_globalPromoCode) {
    var bookingOptions = dataCache.session.getData("bookingOptions") || getInitialBookAStaySessionObject();
    bookingOptions.promoCode = _globalPromoCode.value;
    bookingOptions.promoCodeName = _globalPromoCode.name;
    var currentDate;
    var nextDate;
    var totalRoomsOpted;
    var targetEntity;
    if (isAmaCheckAvailability) {
        var roomsSelector = $('.guests-dropdown-wrap .guest-room-header');
        currentDate = parseDate($("#input-box-from").val());
        nextDate = parseDate($("#input-box-to").val());
        totalRoomsOpted = roomsSelector.length;
        targetEntity = $('.check-avblty-wrap .select-dest-placeholder').text();
        bookingOptions = fetchRoomOptionsSelected(bookingOptions);
        if (isBungalowSelected()) {
            bookingOptions["BungalowType"] = "onlyBungalow";
        } else {
            bookingOptions["BungalowType"] = "IndividualRoom";
        }
    } else {
        currentDate = parseSelectedDate($("#input-box1").datepicker("getDate"));
        nextDate = parseSelectedDate($("#input-box2").datepicker("getDate"));
        if (isIHCLCBSite()) {
            totalRoomsOpted = $('.ihclcb-bas-room-no').length;
        } else {
            totalRoomsOpted = $('.bas-room-no').length;
        }
        targetEntity = $('.searchbar-input').val();
        bookingOptions = fetchRoomOptionsSelected(bookingOptions);
        if (isAmaSite) {
            bookingOptions["BungalowType"] = fetchRadioButtonSelectedAma();
            targetEntity = $('#booking-search .dropdown-input').text();
        }
    }
    if (isAmaSite && bookingOptions.BungalowType && bookingOptions.previousDates &&
        bookingOptions.previousDates.BungalowType &&
        bookingOptions.BungalowType != bookingOptions.previousDates.BungalowType) {
        bookingOptions.selection = [];
    }
    bookingOptions.fromDate = currentDate;
    bookingOptions.toDate = nextDate;
    bookingOptions.rooms = totalRoomsOpted;
    bookingOptions.targetEntity = targetEntity;
    bookingOptions.nights = moment(nextDate, "MMM Do YY").diff(moment(currentDate, "MMM Do YY"), 'days');
    updateHotelChainCodeAndHoteID(bookingOptions);
    dataCache.session.setData("bookingOptions", bookingOptions);

    // Updates the check availability component's data
    updateCheckAvailability();

    updateFinalDatePlanModule();

    // Update the floating cart values on updation of inputs from BAS widget
    var elFloatingCart = $('.book-ind-container');

    return bookingOptions;
};

function fetchRadioButtonSelectedAma() {
    if ($('.book-stay-popup-radio-btn #onlyBungalowBtn').is(':checked')) {
        return "onlyBungalow";
    }
    return "IndividualRoom";
}

function fetchRoomOptionsSelected(bookingOptions) {
    console.log('Booking Room options ' + bookingOptions.roomOptions);
    var selectedRoomOption = bookingOptions.roomOptions ? extractObjectValues(bookingOptions.roomOptions) : [];
    bookingOptions.roomOptions = [];
    var userSelectionList = [];
    $(selectedRoomOption).each(function() {
        userSelectionList.push(this.userSelection);
    });
    if (isAmaSite && isAmaCheckAvailability) {
        return updateRoomOptionsBookAStayAma(bookingOptions, userSelectionList);
    } else {
        return updateRoomOptionsBookAStay(bookingOptions, userSelectionList);
    }


}

function updateRoomOptionsBookAStayAma(bookingOptions, userSelectionList) {
    $('.guests-dropdown-wrap .guest-room-header').each(function(index) {
        var $this = $(this);
        var adultsCount = $this.find('.adult-wrap .counter').text();
        var childrenCount = $this.find('.children-wrap .counter').text();
        var selectedObject = {
            'adults': adultsCount,
            'children': childrenCount,
            'initialRoomIndex': index,
            'userSelection': userSelectionList[index]
        };
        bookingOptions.roomOptions.push(selectedObject);
        if (bookingOptions.selection && bookingOptions.selection.length > 0 && bookingOptions.selection[index]) {
            bookingOptions.selection[index].adults = adultsCount;
            bookingOptions.selection[index].children = childrenCount;
        }
    });
    return bookingOptions;
}

function updateRoomOptionsBookAStay(bookingOptions, userSelectionList) {
    var $roomDetailsCont = $('.bas-room-details');
    if (isIHCLCBHomePage()) {
        $roomDetailsCont = $('.ihclcb-bas-room-details');
    }
    $roomDetailsCont.each(function(index) {
        var selectedHeadCount = $(this).find('.bas-quantity');
        var adultsCount = selectedHeadCount[0].value;
        var childrenCount = selectedHeadCount[1].value;
        var selectedObject = {
            'adults': adultsCount,
            'children': childrenCount,
            'initialRoomIndex': index,
            'userSelection': userSelectionList[index]
        };
        bookingOptions.roomOptions.push(selectedObject);
        if (bookingOptions.selection && bookingOptions.selection.length > 0 && bookingOptions.selection[index]) {
            bookingOptions.selection[index].adults = adultsCount;
            bookingOptions.selection[index].children = childrenCount;
        }
    });
    return bookingOptions;
}

function isBungalowSelected() {
    return $('.check-avblty-container .radio-container #onlyBungalow').is(':checked');
}

// ie fall back for object.values
function extractObjectValues(objectName) {
    return (Object.keys(objectName).map(function(objKey) {
        return objectName[objKey]
    }))
}
// changing date to "MMM Do YY" format
function parseSelectedDate(selectedDateValue) {
    var formatedDate = moment(selectedDateValue, "D MMM YY").format("MMM Do YY");
    return formatedDate;
}

function getInitialRoomOption() {
    return [{
        adults: 1,
        children: 0,
        initialRoomIndex: 0
    }];
}

// return session Object for book a stay
function getInitialBookAStaySessionObject() {
    var toDateForBooking = initialBookingSetup();
    return {
        fromDate: moment(new Date()).add(1, 'days').format("MMM Do YY"),
        toDate: toDateForBooking,
        rooms: 1,
        nights: 1,
        roomOptions: getInitialRoomOption(),
        selection: [],
        promoCode: null,
        hotelChainCode: null,
        hotelId: null,
        isAvailabilityChecked: false
    };
}

// set book a stay session data
// function setBookAStaySessionObject() {
// var bookingOptionsSelected = dataCache.session.getData("bookingOptions") || getInitialBookAStaySessionObject();
// dataCache.session.setData("bookingOptions", bookingOptionsSelected);
// }

function removePopulatedRoomsBookAStay(_this) {
    _this.each(function(i, ele) {
        if (i > 0) {
            ele.remove();
        }
    });
}

function populateAmaRoomTypeRadioButton(bookingOptionsSelected) {
    var roomType = bookingOptionsSelected.roomType || bookingOptionsSelected.BungalowType;
    if (roomType && roomType == "onlyBungalow") {
        $('#book-a-stay .radio-button #onlyBungalowBtn').click();
    } else {
        $('#book-a-stay .radio-button #onlyRoomBtn').click();
    }
}

// auto updating booking widget with respect to storage data
function autoPopulateBookAStayWidget() {
    var bookingOptionsSelected;
    if (isAmaSite && amaBookingObject.isAmaCheckAvailabilitySelected) {
        bookingOptionsSelected = Object.assign({}, amaBookingObject);
        populateAmaRoomTypeRadioButton(bookingOptionsSelected);
    } else {
        bookingOptionsSelected = dataCache.session.getData("bookingOptions") || getInitialBookAStaySessionObject();
        populateAmaRoomTypeRadioButton(bookingOptionsSelected);
        updateHotelChainCodeAndHoteID(bookingOptionsSelected);
        dataCache.session.setData("bookingOptions", bookingOptionsSelected);
    }


    // var fromDateSelecetd = moment(bookingOptionsSelected.fromDate, "MMM Do YY").format("D MMM YY");
    // var toDateSelecetd = moment(bookingOptionsSelected.toDate, "MMM Do YY").format("D MMM YY");

    // $('#input-box1').val(fromDateSelecetd);
    // $('#input-box2').val(toDateSelecetd);


    var roomOptionsSelected = bookingOptionsSelected.roomOptions;

    removePopulatedRoomsBookAStay($(".bas-room-no"));
    removePopulatedRoomsBookAStay($(".bas-room-details"));

    roomOptionsSelected.forEach(function(val, index) {
        if (index > 0) {
            addRoomModule();
        }

        var currentIndexRoom = $($('.bas-room-details')[index]);
        $(currentIndexRoom[0]).find('.bas-no-of-adults input').val(val.adults);
        $(currentIndexRoom[0]).find('.bas-child-no-container input').val(val.children);
    });

    if (bookingOptionsSelected.promoCode) {
        $('.promo-code').val(bookingOptionsSelected.promoCode);
        $('.promocode-status-text').text("Promo code selected: " + bookingOptionsSelected.promoCode);
    }

    if ($('.cm-page-container').hasClass('specific-hotels-page') ||
        $('.cm-page-container').hasClass('destination-layout')) {
        var targetEntitySelected = $('.banner-titles .cm-header-label').text();
        $('.specific-hotels-page, .destination-layout').find('.cm-bas-content-con .searchbar-input').val(
            targetEntitySelected);
        var rootPath = fetchRootPath();
        if (rootPath) {
            rootUrl = rootPath;
            if ($.find("[data-hotel-id]")[0]) {
                $('#hotelIdFromSearch').text($($.find("[data-hotel-id]")[0]).data().hotelId);
            }
            enableBestAvailableButton(rootUrl);
        }
        $('.cm-bas-content-con .searchbar-input').attr("data-selected-search-value", targetEntitySelected);
    }

    // Updates the check availability component's data
    updateCheckAvailability();

    makeRoomActiveModule($('.bas-room-no').first());
    promptToSelectDate();

    updateTotalAdultsCountModule();
}

// destroy datepicker
function destroyDatepicker() {
    $('.bas-datepicker-container .input-daterange').datepicker('destroy');
    $(".cm-bas-con").removeClass("active");
    $('.cm-page-container').removeClass("prevent-page-scroll");
    if ($('#book-a-stay').data('theme') == 'ama-theme') {
        $('.select-dest-placeholder').val('');
        $('#select-results')[0].classList.add("d-none");
    }
};

//overlay destroy datapicker
function overlayDestroyDatepicker() {
    // $('.bas-datepicker-container .input-daterange').datepicker('destroy');
    $(".cm-bas-con").removeClass("active");
    $('.cm-page-container').removeClass("prevent-page-scroll");
    if ($('#book-a-stay').data('theme') == 'ama-theme') {
        $('.select-dest-placeholder').val('');
        $('#select-results')[0].classList.add("d-none");
    }
};

// inititalize calendar
function initiateCalender() {
    availabilityObj = {};
    // calender input date
    var fromDate = dataCache.session.data.bookingOptions.fromDate;
    var toDate = dataCache.session.data.bookingOptions.toDate;
    if (isAmaSite && amaBookingObject.isAmaCheckAvailabilitySelected) {
        fromDate = amaBookingObject.fromDate;
        toDate = amaBookingObject.toDate;
    }
    var storageFromDate = moment(fromDate, "MMM Do YY").toDate() || null;
    var storageToDate = moment(toDate, "MMM Do YY").toDate() || null;

    // var tommorow = moment(new Date()).add(1, 'days')['_d'];
    var d1 = storageFromDate || moment(new Date()).add(1, 'days')['_d'];
    //var d2 = storageToDate || moment(new Date()).add(2, 'days')['_d'];

    var d2 = storageToDate || toDateForBooking();

    // const
    // monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

    var output1 = moment(d1).format("D MMM YY");
    var output2 = moment(d2).format("D MMM YY");

    initializeDatepickerForBookAStay($('.bas-datepicker-container .input-daterange'), $('.bas-calander-container'));

    $("#input-box1").datepicker("setDate", new Date(moment(output1, "D MMM YY").toDate()));
    $("#input-box2").datepicker("setDate", new Date(moment(output2, "D MMM YY").toDate()));

    setTimeout(function() {
        $("#input-box1").blur();
        $("#input-box2").blur();
    }, 105);
};

function initializeDatepickerForBookAStay(ele, container) {
    ele.datepicker({
        container: container,
        format: 'd M yy',
        startDate: new Date(),
        changeMonth: false,
        changeYear: false,
        stepMonths: 0,
        firstDay: 1,
        templates: {
            leftArrow: '<i class="icon-prev-arrow inline-block"></i>',
            rightArrow: '<i class="icon-prev-arrow inline-block cm-rotate-icon-180 v-middle"></i>'
        }
    });
}

function hideCalenderInBookAStayPopup() {
    $('.bas-calander-container').removeClass('active');
    $('.bas-calander-container>.datepicker').css('display', 'none');
    $('.bas-hotel-details-container').removeClass('active');
}

function validateSearchInput() {
    // validate using data value in searcbar input
    var searchInputValue = "";
    if ($('#book-a-stay').data('theme') == 'ama-theme') {
        var dropdownText = isAmaCheckAvailability ? $('.check-avblty-wrap .select-dest-placeholder').text() : $(
            '.cm-bas-content-con .dropdown-input').text();
        if (dropdownText != "Select Destinations/Bungalows")
            searchInputValue = dropdownText;
    } else {
        searchInputValue = $('.cm-bas-content-con .searchbar-input').attr("data-selected-search-value");
    }
    if (!searchInputValue) {
        $('.cm-bas-content-con .searchbar-input').effect('shake', {
            "distance": "5"
        });
        disableBestAvailableButton();
        return false;
    }
    return true;
}

function disableBestAvailableButton() {
    changeBookStayButtonStatus();
    $('.bas-final-detail-wrap').css("display", "none");
    $('#global-re-direct').removeAttr('hrefValue');
}

function changeBookStayButtonStatus() {
    $('.best-avail-rate ').css({
        "opacity": "0.5"
    });
    $(".best-avail-rate").toggleClass('best-avail-rate-disable', true);
    $(".best-avail-rate").toggleClass('best-avail-rate-enable', false);
}

function getHotelRoomsRootPath() {
    var hiddenDom = $.find("[data-hotel-roomspath]")[0];
    if (hiddenDom != undefined) {
        var hotelRoomspath = $(hiddenDom).data().hotelRoomspath;
        if (hotelRoomspath != undefined && hotelRoomspath.startsWith('https://www.tajhotels.com')) {
            hotelRoomspath = hotelRoomspath.substring(25)
        } else if (hotelRoomspath != undefined && hotelRoomspath.startsWith('https://www.vivantahotels.com')) {
            hotelRoomspath = hotelRoomspath.substring(29)
        } else if (hotelRoomspath != undefined && hotelRoomspath.startsWith('https://www.seleqtionshotels.com')) {
            hotelRoomspath = hotelRoomspath.substring(32)
        }

        return hotelRoomspath;
    }
}

function getDestinationRootPath() {
    var hiddenDom = $.find("[data-destination-rootpath]")[0];
    if (hiddenDom != undefined)
        return $(hiddenDom).data().destinationRootpath
}

function fetchRootPath() {
    var destinationRootPath = getDestinationRootPath();
    var hotelRoomsPath = getHotelRoomsRootPath();
    if (destinationRootPath != undefined)
        return destinationRootPath;

    return hotelRoomsPath;
}

function enableBestAvailableButton(redirectUrl, noUrlStatus) {
    if (!noUrlStatus) {
        $('#global-re-direct, #checkAvailability').attr('hrefValue', redirectUrl);
    }
    if (isAmaSite) {
        $('#checkAvailability').addClass('enabled');
    }
    if (isIHCLCBHomePage() && !(checkboxCheckedStatus() && isEntitySelected())) {
        return;
    }

    $('.best-avail-rate ').css({
        "opacity": "1",
    });

    $(".best-avail-rate").toggleClass('best-avail-rate-disable', false);
    $(".best-avail-rate").toggleClass('best-avail-rate-enable', true);
    $('.bas-final-detail-wrap').css("display", "inline-block");
    if (retainHolidaysFlow(redirectUrl)) {
        redirectUrl = redirectUrl + "?taj-holiday-redemption";
    }

}

function checkboxCheckedStatus() {
    return $('.ihclcb-checkbox-cont .mr-filter-checkbox').prop("checked");
}

function fetchDateOccupancyAsQueryString() {
    var queryString = '';
    try {
        var bookingOptions = dataCache.session.getData('bookingOptions');
        if (typeof bookingOptions !== 'undefined') {
            var from = moment(bookingOptions.fromDate, "MMM Do YY").format('DD/MM/YYYY');
            var to = moment(bookingOptions.toDate, "MMM Do YY").format('DD/MM/YYYY');
            var roomOptionArr = bookingOptions.roomOptions;
            var rooms = bookingOptions.roomOptions.length;
            var adults = '';
            var children = '';
            if (roomOptionArr) {
                roomOptionArr.forEach(function(roomObj, index) {
                    adults += roomObj.adults + ",";
                    children += roomObj.children + ",";
                });
                adults = adults.substring(0, adults.length - 1);
                children = children.substring(0, children.length - 1);
            }
            queryString = "from=" + from + "&to=" + to + "&rooms=" + rooms + "&adults=" + adults + "&children=" + children;
        }
    } catch (err) {
        console.error("Error Occured while forming query String using session data ", err);
    }
    return queryString;
}

function retainHolidaysFlow(redirectUrl) {
    var retainHolidays = false;
    var substringUrl = redirectUrl;
    if (redirectUrl && redirectUrl.endsWith(".html")) {
        substringUrl = redirectUrl.substring(0, redirectUrl.length - 5);
    }

    var currentUrl = window.location.href;
    if (currentUrl.indexOf("?taj-holiday-redemption") != -1) {
        if (currentUrl.indexOf(substringUrl) != -1) {
            retainHolidays = true;
        }
    }
    return retainHolidays;
}

function updateHotelChainCodeAndHoteID(bookingOptions) {
    var hotelIdAndChainCodeData = $($.find("[data-hotel-id]")[0]).data();
    if (hotelIdAndChainCodeData) {
        bookingOptions.hotelChainCode = hotelIdAndChainCodeData.hotelChainCode || CHAIN_ID;
        bookingOptions.hotelId = hotelIdAndChainCodeData.hotelId;
    }
}

function numberOfNightsCheck() {
    var currentDate = parseSelectedDate($("#input-box1").datepicker("getDate"));
    var nextDate = parseSelectedDate($("#input-box2").datepicker("getDate"));
    var numberOFNights = moment(nextDate, "MMM Do YY").diff(moment(currentDate, "MMM Do YY"), 'days');
    if (numberOFNights > 10 && $('.best-avail-rate ').hasClass('best-avail-rate-enable'))
        return false;
    else
        return true;

}

function checkHolidayScope() {
    if (!dataCache.session.getData("checkHolidayAvailability")) {
        var bookingOptionsHoliday = dataCache.session.getData("bookingOptions");

        var fromDate = bookingOptionsHoliday.fromDate;
        if (!fromDate || fromDate == '') {
            fromDate = moment(new Date()).add(3, 'days').format("MMM Do YY");
            bookingOptionsHoliday.fromDate = fromDate;
        }

        var toDate = bookingOptionsHoliday.toDate;
        if (!toDate || toDate == '') {
            toDate = moment(new Date()).add(5, 'days').format("MMM Do YY");
            bookingOptionsHoliday.toDate = toDate;
        }

        bookingOptionsHoliday.nights = moment(toDate, "MMM Do YY").diff(moment(fromDate, "MMM Do YY"), 'days');

        var rooms = bookingOptionsHoliday.rooms;
        if (!rooms) {
            rooms = 1;
            bookingOptionsHoliday.rooms = rooms;
        }

        if (!bookingOptionsHoliday.roomOptions) {
            bookingOptionsHoliday.roomOptions = [{
                adults: 2,
                children: 0,
                initialRoomIndex: 0
            }];
        }
        dataCache.session.setData("bookingOptions", bookingOptionsHoliday);
        updateCheckAvailability();
    }
}

function dateOccupancyInfoSticky() {
    if ($('.search-container.check-availability-main-wrap').length > 0) {
        var stickyOffset = $('.search-container.check-availability-main-wrap ').offset().top;

        $(window).scroll(function() {
            var sticky = $('.search-container.check-availability-main-wrap '),
                scroll = $(window).scrollTop();

            if (scroll >= stickyOffset)
                sticky.addClass('mr-stickyScroll');
            else
                sticky.removeClass('mr-stickyScroll');
        });

    }
}

// [TIC-FLOW]
function isTicBased() {
    // checking if any rate code is there in dom which is of TIC Room redemption
    // flow
    var userDetails = getUserData();
    if (userDetails && userDetails.loyaltyInfo && userDetails.loyaltyInfo.length > 0 && $(".tic-room-redemption-rates").length) {
        return true;
    }

    return false;
}

function resetPromoCodeTab() {
    $('.promo-code').val("");
    $('.apply-promo-code-btn').hide();
    $('.promocode-status-text').text("");
    _globalPromoCode = {
        name: null,
        value: null
    };
}

// [IHCL-FLOW]
var entityDetailsObj = new Object();

function fetchIHCLCBEntityDetails() {
    var ihclCbBookingObject = dataCache.session.getData("ihclCbBookingObject");
    if (ihclCbBookingObject && ihclCbBookingObject.isIHCLCBFlow) {
        var entityDetailsData = ihclCbBookingObject.entityDetails;
        if (!entityDetailsData) {
            return;
        }
        for (var entity = 0; entity < entityDetailsData.length; entity++) {
            var partyObj = {};
            var cityObj = {};
            var entityCity = entityDetailsData[entity].city;
            var entityType = entityDetailsData[entity].AccountType_c;
            var entityExisting = entityDetailsObj[entityType];
            if (entityExisting) {
                var exisitingEle = null; // = entityDetailsObj[entityType];
                for (var cty in entityDetailsObj[entityType]) {
                    if (Object.keys(entityDetailsObj[entityType][cty])[0] == entityCity) {
                        exisitingEle = JSON.parse(JSON.stringify(entityDetailsObj[entityType][cty][entityCity]));
                        break;
                    }
                }
            }
            partyObj['partyName'] = {
                'name': entityDetailsData[entity].partyName,
                'gstinNo': entityDetailsData[entity].gSTNTaxID_c,
                'iataNo': entityDetailsData[entity].iATANumber,
                'partyNo': entityDetailsData[entity].partyNumber
            }
            // change the names for better reference
            var newArr = [];
            if (exisitingEle) {
                newArr = exisitingEle;
            }
            newArr.push(partyObj);
            cityObj[entityCity] = newArr;
            var existingEntityDetailsObj = entityDetailsObj[entityType] ? JSON.parse(JSON
                .stringify(entityDetailsObj[entityType])) : null;
            var newEntityDetailsObj = [];
            if (existingEntityDetailsObj) {
                newEntityDetailsObj = existingEntityDetailsObj;
                for (var cty in existingEntityDetailsObj) {
                    if (Object.keys(existingEntityDetailsObj[cty])[0] == entityCity) {
                        newEntityDetailsObj.splice(cty, 1);
                    }
                }
            }
            newEntityDetailsObj.push(cityObj);
            entityDetailsObj[entityType] = newEntityDetailsObj;
        }
        // console.log(entityDetailsObj);
        populateEntityDropdown(entityDetailsObj);
    }
}

function populateEntityDropdown(entityDetailsObj) {
    var entityType = '';
    Object.keys(entityDetailsObj).forEach(function(entType) {
        entityType += createEntityDropdownList(entType);
        createEntityCityList(entType);
        // createPartyAndGSTNNoDropdown(entType);
    });
    // $('.entity-results#entityDetailsCity').html(entityCity);
    $('.entity-results#entityTypeDetails').html(entityType);
}

function createEntityDropdownList(value) {
    if (value) {
        return '<a class="individual-entity-result">' + value + '</a>';
    }
    return "";
}

function createEntityCityList(entityType, actDrpwn) {
    var entityCity = '';
    entityDetailsObj[entityType].forEach(function(cty) {
        // createEntityCityList(city);
        var extractedCity = Object.keys(cty)[0];
        entityCity += createEntityDropdownList(extractedCity);
        createPartyAndGSTNNoDropdown(cty, actDrpwn);
    });
    if (actDrpwn) {
        $('.active-dropdwn .entity-results#entityDetailsCity').html(entityCity)
    } else {
        $('.entity-results#entityDetailsCity').html(entityCity)
    }
}

function clearEntityDropdown(drpdwnSel) {
    var removableDrpdwn = drpdwnSel.closest('[data-drpdwn-target]').attr('data-drpdwn-target');
    var $caller = $('[data-drpdwn-caller = ' + removableDrpdwn + ']');
    $caller.text($caller.attr('data-entity-category').replace(/([A-Z])/g, ' $1').capitalize());
    $caller.attr('data-entity-selected', '');
    drpdwnSel.html('');
}

function createPartyAndGSTNNoDropdown(city, actDrpwn) {
    var entityPartyName = '';
    var entityGSTNNo = '';
    var entityIATANo = '';
    Object.values(city)[0].forEach(function(obj) {
        entityPartyName += createEntityDropdownList(obj.partyName.name);
        entityGSTNNo += createEntityDropdownList(obj.partyName.gstinNo);
        entityIATANo += createEntityDropdownList(obj.partyName.iataNo);
    });
    if (!actDrpwn) {
        $('.entity-results#entityDetailsPartyName').append(entityPartyName);
        $('.entity-results#entityDetailsGST').append(entityGSTNNo);
        $('.entity-results#entityDetailsIATA').append(entityIATANo);
    } else {
        $('.active-dropdwn .entity-results#entityDetailsPartyName').append(entityPartyName);
        $('.active-dropdwn .entity-results#entityDetailsGST').append(entityGSTNNo);
        $('.active-dropdwn .entity-results#entityDetailsIATA').append(entityIATANo);
    }
}

function isEntitySelected() {
    var userDetailsIHCLCB = dataCache.local.getData("userDetails");
    if (userDetailsIHCLCB &&
        ((userDetailsIHCLCB.selectedEntity && userDetailsIHCLCB.selectedEntity.partyName) || (userDetailsIHCLCB.selectedEntityAgent && userDetailsIHCLCB.selectedEntityAgent.partyName))) {
        return true;
    }
    return false;
}

function addEntityDropDownEventsForIHCLCB() {
    try {
        var $entityTypeDropdown = $('#entityTypeDropdownMenu, #entityTypeDropdownMenu1');
        var $entityNameDropdown = $('#entityNameDropdownMenu, #entityNameDropdownMenu1');
        var $entityCityDropdown = $('#entityCityDropdownMenu, #entityCityDropdownMenu1');
        var $iataDropdown = $('#iataDropdownMenu');
        var $gstinDropdown = $('#gstinDropdownMenu, #gstinDropdownMenu1');

        // open popup
        $('[data-drpdwn-caller]').click(
            function(e) {
                e.stopPropagation();
                $(this).closest('.ihclcb-book-a-stay-dropdwn-cont').addClass('active-dropdwn').siblings(
                    '.ihclcb-book-a-stay-dropdwn-cont').removeClass('active-dropdwn');
                var clickedDropdwn = $(this).attr('data-drpdwn-caller');
                var $drpdwnCont = $('[data-drpdwn-target = ' + clickedDropdwn + ']');
                $drpdwnCont.closest('.entity-dropdown-cnt-cont').addClass('active-dropdwn').siblings(
                    '.entity-dropdown-cnt-cont').removeClass('active-dropdwn');
                if ($($drpdwnCont).hasClass('show-dropdown')) {
                    $drpdwnCont.removeClass('show-dropdown');
                } else {
                    $('[data-drpdwn-target]').removeClass('show-dropdown');
                    $drpdwnCont.addClass('show-dropdown');
                }
            });

        // disable the entity dropdown for the existing book a stay
        if (!isIHCLCBHomePage()) {
            $('[data-drpdwn-caller].ihclcb-mandetory-field').addClass('entity-dropdown-disabled');
            var userDetailsIHCLCB = dataCache.local.getData('userDetails');
            var selectedEntity = userDetailsIHCLCB.selectedEntity || userDetailsIHCLCB.selectedEntityAgent;
            if (userDetailsIHCLCB && selectedEntity) {
                // var selectedEntity = userDetailsIHCLCB.selectedEntity;
                // if (userDetailsIHCLCB && selectedEntity) {
                $entityTypeDropdown.text(selectedEntity.entityType);
                $entityCityDropdown.text(selectedEntity.city);
                $entityNameDropdown.text(selectedEntity.partyName);
                $gstinDropdown.text(selectedEntity.gSTNTaxID_c);
                // $iataDropdown.text(selectedEntity.iataNumber);
                // }
            }
            return;
        }

        var currentEntityDetails = [];
        var ihclSessionData = dataCache.session.getData("ihclCbBookingObject");
        var relatedPartyNo;
        var extractedObj;
        // get the selected dropdown value
        $('.entity-dropdown-cnt-cont').on(
            'click',
            '.entity-dropdown .individual-entity-result',
            function() {
                $(this).closest('.entity-dropdown-cnt-cont').addClass('active-dropdwn').siblings(
                    '.entity-dropdown-cnt-cont').removeClass('active-dropdwn')
                var openedDrpdwn = $(this).closest('.entity-dropdown-container').removeClass('show-dropdown').attr(
                    'data-drpdwn-target');
                var $dropdwnCalledBy = $('[data-drpdwn-caller = ' + openedDrpdwn + ']');
                var selectedValue = $(this).text();
                $dropdwnCalledBy.text(selectedValue);
                $dropdwnCalledBy.attr('data-entity-selected', selectedValue);

                var $entityCity = $('.active-dropdwn #entityDetailsCity');
                var $entityPartyName = $('.active-dropdwn #entityDetailsPartyName');
                var $entityGSTNNO = $('.active-dropdwn #entityDetailsGST');
                var $entityIATA = $('.active-dropdwn #entityDetailsIATA');
                if ($dropdwnCalledBy.attr('data-entity-category') === "entityType") {
                    $entityCityDropdown.closest('.active-dropdwn').find('[data-entity-category="entityCity"]')
                        .removeClass('entity-dropdown-disabled');
                    $entityNameDropdown.closest('.active-dropdwn .ihclcb-book-a-stay-inner-wrp').nextAll().find(
                        '.ihclcb-selected-data').addClass('entity-dropdown-disabled');

                    clearEntityDropdown($entityCity);
                    clearEntityDropdown($entityPartyName);
                    clearEntityDropdown($entityGSTNNO);
                    // clearEntityDropdown($entityIATA);
                    createEntityCityList(selectedValue, true);
                } else if ($dropdwnCalledBy.attr('data-entity-category') === "entityCity") {
                    $entityNameDropdown.closest('.active-dropdwn').find('[data-entity-category="entityName"]')
                        .removeClass('entity-dropdown-disabled');
                    $entityNameDropdown.closest('.active-dropdwn .ihclcb-book-a-stay-inner-wrp').nextAll().find(
                        '.ihclcb-selected-data').addClass('entity-dropdown-disabled');
                    clearEntityDropdown($entityPartyName);
                    clearEntityDropdown($entityGSTNNO);
                    // clearEntityDropdown($entityIATA);
                    var selectedEntityType = $entityTypeDropdown.closest('.active-dropdwn').find(
                        '[data-entity-category="entityType"]').attr('data-entity-selected');
                    var selectedEntityCity = $entityCityDropdown.closest('.active-dropdwn').find(
                        '[data-entity-category="entityCity"]').attr('data-entity-selected');
                    entityDetailsObj[selectedEntityType].forEach(function(cty) {
                        var extractedCity = Object.keys(cty)[0];
                        if (extractedCity == selectedEntityCity) {
                            extractedObj = Object.assign({}, cty);
                            createPartyAndGSTNNoDropdown(cty, true);
                        }
                    });
                    // createPartyAndGSTNNoDropdown(selectedValue);

                } else if ($dropdwnCalledBy.attr('data-entity-category') === "entityName") {
                    clearEntityDropdown($entityGSTNNO);
                    // clearEntityDropdown($entityIATA);
                    var name;
                    if (extractedObj) {
                        var data = extractedObj[$entityCityDropdown.closest('.active-dropdwn').find(
                            '[data-entity-category="entityCity"]').text()];
                    }
                    var clickedEntityNameIndex = $(this).index();
                    for (name = 0; name < data.length; name++) {
                        if (data[name].partyName.name == selectedValue && name == clickedEntityNameIndex) {
                            var gstDropdownList = createEntityDropdownList(data[name].partyName.gstinNo);
                            // var iataDropdownList = createEntityDropdownList(data[name].partyName.iataNo);
                            relatedPartyNo = data[name].partyName.partyNo;
                            if (gstDropdownList) {
                                $('.entity-results#entityDetailsGST').html(gstDropdownList);
                                $gstinDropdown.closest('.active-dropdwn').find('[data-entity-category="gstinNo"]')
                                    .removeClass('entity-dropdown-disabled');
                            } else {
                                $gstinDropdown.addClass('entity-dropdown-disabled');
                            }
                            // if (iataDropdownList) {
                            // $('.entity-results#entityDetailsIATA').html(iataDropdownList);
                            // $iataDropdown.removeClass('entity-dropdown-disabled');
                            // } else {
                            // $iataDropdown.addClass('entity-dropdown-disabled');
                            // }
                            break;
                        }
                    }
                }

                var attributeID = $dropdwnCalledBy.attr("id");
                var selectedEntityType, selectedEntityCity, selectedPartyName, selectedGSTNo;
                var typeOfEntitySelection;
                if (attributeID.includes("1")) {
                    typeOfEntitySelection = "agent";
                    selectedEntityType = $('#entityTypeDropdownMenu1').attr('data-entity-selected') || '';
                    selectedEntityCity = $('#entityCityDropdownMenu1').attr('data-entity-selected') || '';
                    selectedPartyName = $('#entityNameDropdownMenu1').attr('data-entity-selected') || '';
                    selectedGSTNo = $('#gstinDropdownMenu1').attr('data-entity-selected');

                    var selectedEntityAgent = new Object();
                    selectedEntityAgent.entityType = selectedEntityType;
                    selectedEntityAgent.city = selectedEntityCity;
                    selectedEntityAgent.partyName = selectedPartyName;
                    selectedEntityAgent.gSTNTaxID_c = selectedGSTNo;
                    selectedEntityAgent.partyNumber = relatedPartyNo;
                    selectedEntityAgent.iataNumber = selectedIATA;

                    addSelectedValueToIHCLCBSession(selectedEntityAgent);
                } else {
                    typeOfEntitySelection = "corporate";
                    selectedEntityType = $('#entityTypeDropdownMenu').attr('data-entity-selected') || '';
                    selectedEntityCity = $('#entityCityDropdownMenu').attr('data-entity-selected') || '';
                    selectedPartyName = $('#entityNameDropdownMenu').attr('data-entity-selected') || '';
                    selectedGSTNo = $('#gstinDropdownMenu').attr('data-entity-selected');

                    var selectedEntity = new Object();
                    selectedEntity.entityType = selectedEntityType;
                    selectedEntity.city = selectedEntityCity;
                    selectedEntity.partyName = selectedPartyName;
                    selectedEntity.gSTNTaxID_c = selectedGSTNo;
                    selectedEntity.partyNumber = relatedPartyNo;
                    selectedEntity.iataNumber = selectedIATA;

                    addSelectedValueToIHCLCBSession(selectedEntity);
                }

                var selectedIATA;
                // var selectedIATA = $iataDropdown.attr('data-entity-selected') || $iataDropdown.text();
                // if ($entityNameDropdown.attr('data-entity-selected') ||
                // $gstinDropdown.attr('data-entity-selected')
                // || $iataDropdown.attr('data-entity-selected')) {
                if ($entityTypeDropdown.closest('.active-dropdwn').find('[data-entity-category="entityType"]')
                    .attr('data-entity-selected') &&
                    $entityCityDropdown.closest('.active-dropdwn').find(
                        '[data-entity-category="entityCity"]').attr('data-entity-selected') &&
                    $entityNameDropdown.closest('.active-dropdwn').find(
                        '[data-entity-category="entityName"]').attr('data-entity-selected')) {
                    addSelectedValueToIHCLCBSession(typeOfEntitySelection, selectedEntityType, selectedEntityCity,
                        selectedPartyName, selectedGSTNo, selectedIATA);
                    if (isEntityDropdownSelected() && checkboxCheckedStatus()) {
                        enableBestAvailableButton('', true);
                    }
                } else {
                    changeBookStayButtonStatus();
                }
            });

        // close the entity dropdown while clicking outside;
        $(window).click(function(e) {
            var container = $(".entity-dropdown-container");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                $('.show-dropdown').removeClass('show-dropdown');
            }
        });

        function addSelectedValueToIHCLCBSession(entityObject) {

            var userDetails = dataCache.local.getData("userDetails");
            if (userDetails) {
                if (entityObject.entityType === "Travel Agent") {
                    userDetails.selectedEntityAgent = entityObject;
                } else if (entityObject.entityType === "Corporate") {
                    userDetails.selectedEntity = entityObject;
                }
            }
            dataCache.local.setData("userDetails", userDetails);
        }
    } catch (error) {
        console.error("Error in /apps/tajhotels/components/content/book-a-stay/clientlibs/js/book-a-stay.js ",
            error.stack);
    }
}

function isEntityDropdownSelected() {
    var entityDrpDwn = $('.ihclcb-corporate-book-stay .active-dropdwn .ihclcb-mandetory-field');
    var i;
    for (i = 0; i < entityDrpDwn.length; i++) {
        if (!$(entityDrpDwn[i]).attr('data-entity-selected')) {
            return false;
        }
    }
    return true;
}

// [IHCL_CB ENDS]


// check for same day checkin checkout
function checkSameDayCheckout(currVal) {
    var sameDayCheckout = dataCache.session.getData("sameDayCheckout");
    if (sameDayCheckout && sameDayCheckout === "true") {
        return moment(currVal, "D MMM YY");
    } else {
        return moment(currVal, "D MMM YY").add(1, 'days');
    }
}


function initialBookingSetup() {
    var sameDayCheckout = dataCache.session.getData("sameDayCheckout");
    if (sameDayCheckout && sameDayCheckout === "true") {
        return moment(new Date()).add(1, 'days').format("MMM Do YY");
    } else {
        return moment(new Date()).add(2, 'days').format("MMM Do YY");
    }
}

function sebNightsCheck() {
    var currentDate = parseSelectedDate($("#input-box1").datepicker("getDate"));
    var nextDate = parseSelectedDate($("#input-box2").datepicker("getDate"));
    var numberOFNights = moment(nextDate, "MMM Do YY").diff(moment(currentDate, "MMM Do YY"), 'days');
    var sebObject = getQuerySebRedemption();
    if (sebObject && sebObject != null && sebObject != undefined && sebObject.sebRedemption == "true") {
        var sebNights = parseInt(sebObject.sebEntitlement);
        var rooms = $('.bas-room-no').length;
        if (parseInt(numberOFNights) * parseInt(rooms) > parseInt(sebNights))
            return false;
    } else
        return true;

}

function getQuerySebRedemption() {
    return dataCache.session.getData('sebObject');
}

var propertyArray = [];
$('document').ready(
    function() {

        try {
            if ($('#book-a-stay').data('theme') == 'ama-theme') {

                createSelectPlaceHolder();
            } else {
                createSearchPlaceHolder();
            }
        } catch (error) {
            console.error("Error in /apps/tajhotels/components/content/book-a-stay/clientlibs/js/searchBar.js ",
                error.stack);
        }

    });
var amaSearchFlag = false;

function createSelectPlaceHolder() {
    var selectInput = $('.dropdown-input');
    var SELECT_INPUT_DEBOUNCE_RATE = 1000;
    var contentRootPath = $('#contentRootPath').val();
    if ($('#book-a-stay').data('theme') == 'ama-theme' && amaSearchFlag) {
        return;
    } else {
        amaSearchFlag = true;
        $.ajax({
            method: "GET",
            url: "/bin/search.data/" + contentRootPath.replace(/\/content\//g, ":") + "//" + "/result/searchCache.json"
        }).done(function(res, count) {
            // populate search result in banner search bar
            createPropertyArray(res);
            addSelectionResultsInBanner(res);
            updateCheckAvailabilityAma();

            // populate search result in book a stay popup
            addSelectionResults(res);
            updateCheckAvailability();
        }).fail(function() {
            console.error('Ajax call failed.')
        });
    }

    function createPropertyArray(res) {
        if (Object.keys(res.destinations).length) {
            var destinationProperty = [];
            var destinations = res.destinations;
            destinations.forEach(function(destination) {
                destinationProperty.push(destination);

            });
            propertyArray.destination = destinationProperty;
        }
        var websiteHotels = res.hotels.website;
        if (Object.keys(websiteHotels).length) {
            var hotelProperty = [];
            websiteHotels.forEach(function(hotel) {
                hotelProperty.push(hotel);
            });
            propertyArray.hotel = hotelProperty;
        }
    }

    function addSelectionResults(res) {
        if ($('#select-results').is(':empty')) {
            if (Object.keys(res.destinations).length) {
                $('#select-results').append('<li class="dest-item property-heading">Destinations</li>');
                var destinations = res.destinations;
                destinations.forEach(function(destination) {
                    var destRedirectPath = destination.path;
                    var destinationString = destination.title;
                    var destHtml = createDestResult(destination.title, destRedirectPath);
                    $('#select-results').append(destHtml);

                });
            }
            var websiteHotels = res.hotels.website;
            if (Object.keys(websiteHotels).length) {
                $('#select-results').append('<li class="dest-item property-heading">Hotels</li>');
                websiteHotels.forEach(function(hotel) {
                    var hotelDestination = hotel.title.split(', ');

                    var reDirectToRoomPath = hotel.path.concat("accommodations/");
                    var hotelHtml = createHotelResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.isOnlyBungalowPage);
                    $('#select-results').append(hotelHtml);

                });
            }
        }
    }

    function updateCheckAvailability() {

        var placeHolder = $("#book-a-stay .dropdown-input").text();
        var items = $('#book-a-stay #select-results li');
        items.each(function() {
            if (placeHolder == $(this).text()) {
                updateDestination($(this).find('a'));
            }
        });
    }

    function updateCheckAvailabilityAma() {
        var amaTextItem = $('.ama-info-strip').prev();
        if (amaTextItem.hasClass("ama-text")) {
            var placeHolder = amaTextItem.text().trim();
            var parent = $('.check-avblty-wrap .dropdown');

            var items = $('.check-avblty-wrap .dropdown .dropdown-menu li');
            items.each(function() {
                var $this = $(this);
                var itemText = $this.attr('id');
                if ($this.hasClass('hotel-item')) {
                    var arr = $this.attr('id').split(',');
                    itemText = arr[0];
                }
                if (placeHolder.includes(itemText)) {
                    updateDestination($(this), parent);
                }
            });
        }
    }

    $(selectInput).on("keyup", debounce(function(e) {
        e.stopPropagation();
        $('#select-results')[0].classList.remove("d-none");
        if (selectInput.val().length > 0) {
            clearSelectResults();


            $.ajax({
                method: "GET",
                url: "/bin/search.data/" + contentRootPath.replace(/\/content\//g, ":") + "//" + selectInput.val() + "/result/searchCache.json"
            }).done(function(res, count) {
                if (Object.keys(res.destinations).length) {
                    $('#select-results').append('<li class="dest-item property-heading">Destinations</li>');
                    var destinations = res.destinations;
                    destinations.forEach(function(destination) {
                        var destRedirectPath = destination.path;
                        var destinationString = destination.title;
                        var destHtml = createDestResult(destination.title, destRedirectPath);
                        $('#select-results').append(destHtml);

                    });
                }
                var websiteHotels = res.hotels.website;
                if (Object.keys(websiteHotels).length) {
                    $('#select-results').append('<li class="dest-item property-heading">Hotels</li>');
                    websiteHotels.forEach(function(hotel) {
                        var hotelDestination = hotel.title.split(', ');

                        var reDirectToRoomPath = hotel.path.concat("accommodations/");
                        var hotelHtml = createHotelResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.isOnlyBungalowPage);
                        $('#select-results').append(hotelHtml);

                    });
                }
                if (!(Object.keys(websiteHotels).length) && !(Object.keys(res.destinations).length)) {
                    $('#select-results').append('<li>No results found. Please try another keyword</li>');
                }

            }).fail(function() {
                console.error('Ajax call failed.')
            });

        } else {

            showSelectResults();
        }


    }, SELECT_INPUT_DEBOUNCE_RATE));

    function clearSelectResults() {
        $('#select-results').empty();
        var items = $('#book-a-stay #select-results li');
        // items.each(function(item){ 
        //if(!(this.classList.contains("property-heading"))){
        //   this.classList.add("d-none");
        //}
        //});
    }

    function showSelectResults() {
        $('#select-results').empty();
        if (propertyArray.destination && propertyArray.destination.length) {
            $('#select-results').append('<li class="dest-item property-heading">Destinations</li>');
            var destinations = propertyArray.destination;
            destinations.forEach(function(destination) {
                var destRedirectPath = destination.path;
                var destinationString = destination.title;
                var destHtml = createDestResult(destination.title, destRedirectPath);
                $('#select-results').append(destHtml);

            });
        }

        if (propertyArray.hotel && propertyArray.hotel.length) {
            $('#select-results').append('<li class="dest-item property-heading">Hotels</li>');
            propertyArray.hotel.forEach(function(hotel) {
                var hotelDestination = hotel.title.split(', ');

                var reDirectToRoomPath = hotel.path.concat("accommodations/");
                var hotelHtml = createHotelResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.isOnlyBungalowPage);
                $('#select-results').append(hotelHtml);

            });
        }

    }

    function addSelectionResultsInBanner(res) {
        if (Object.keys(res.destinations).length) {
            var destArray = [];
            var countDest = 0;
            var destinations = res.destinations;
            destinations.forEach(function(destination) {

                var websiteHotels = res.hotels.website;
                if (Object.keys(websiteHotels).length) {
                    var hotelArray = [];
                    var count = 0;
                    websiteHotels.forEach(function(hotel) {

                        var hotelDestination = hotel.title.split(', ');
                        if (hotelDestination[1] == destination.title) {
                            hotelArray[count] = hotel;
                            count++;

                        }
                    });


                    hotelArray.sort(function(a, b) {
                        var nameA = a.title.toUpperCase(); // ignore upper and lowercase
                        var nameB = b.title.toUpperCase(); // ignore upper and lowercase
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }

                        return 0;
                    });
                    destination.hotelArray = hotelArray;
                    destArray[countDest] = destination;
                    countDest++;


                }
            });
            destArray.sort(function(a, b) {
                var nameA = a.title.toUpperCase(); // ignore upper and lowercase
                var nameB = b.title.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });

            destArray.forEach(function(destination) {
                var destHtml = createDestResultBanner(destination.title, destination.path);
                $('.destination-hotels').append(destHtml);
                $('#search-properties').append(destHtml);

                var hotelArr = destination.hotelArray;
                hotelArr.forEach(function(hotel) {
                    var reDirectToRoomPath = hotel.path.concat("accommodations/");
                    var hotelHtml = createHotelResultBanner(hotel.title, reDirectToRoomPath, hotel.id,
                        hotel.maxGuests, hotel.maxBeds, hotel.id);

                    $('.destination-hotels').append(hotelHtml);
                    $('#search-properties').append(hotelHtml);
                });
            });
        }
    }

    function createDestResult(title, path) {
        return '<li class="dest-item ama-dest-item"><a class="select-result-item" data-redirect-path="' + path + '">' + title +
            '</a></li>';
    }

    function createHotelResult(title, path, hotelId, isOnlyBungalow) {
        return '<li class="hotel-item"><a class="select-result-item" data-hotelId="' + hotelId +
            '"data-isOnlyBungalow="' + isOnlyBungalow + '" data-redirect-path="' + path + '">' + title + '</a></li>';
    }

    function createDestResultBanner(title, path) {
        return '<li id="' + title + '" class="dest-item" data-redirect-path="' + path + '">' + title + '</li>';
    }

    function createHotelResultBanner(title, path, hotelId, maxGuests, maxBeds, hotelId) {
        return '<li id="' + title + '" class="hotel-item" data-hotelid = "' + hotelId + '" data-max-guests="' +
            maxGuests + '" data-max-beds="' + maxBeds + '" data-redirect-path="' + path + '">' + title + '</li>';
    }

    $('.search-bar-wrapper-container').click(function() {
        $(this).toggleClass('rotate-arrow');
        if (!($('#book-a-stay .suggestions-wrap').is(':visible')))
            $('#book-a-stay .suggestions-wrap').toggle();
        if (!($('.suggestions-wrap').is(':visible')))
            $('.suggestions-wrap').toggle();
        if (!($('#select-results').is(':visible')))
            $('#select-results')[0].classList.remove("d-none");

    });
    $('window').click(function() {

        if ($('.suggestions-wrap').is(':visible'))
            $('.suggestions-wrap').toggle();
    });

    $('.bas-date-container-main-wrap, .bas-best-available-rate-container clearfix').click(function() {
        $('.suggestions-wrap').hide();
    });

    $('#bas-checkbox').click(function() {
        var $this = $(this);
        if (!$this.attr('checked')) {
            $this.attr('checked', true);
        } else {
            $this.removeAttr('checked');
        }
    });

    $('#book-a-stay').on('click', 'a.select-result-item', function() {
        updateDestination($(this));
    });
}

function updateDestination(el) {
    var amaSearchResult = $('.select-dest-placeholder');
    var selectedLocation = el.text();
    var selectedHotelId = '';
    var subtitlePlaceholder = $('#checkAvailSubtitle');
    var isOnlyBungalow = false;
    subtitlePlaceholder.text('');
    amaSearchResult.text(selectedLocation);
    amaSearchResult.val(selectedLocation);
    if (el.attr('data-hotelid')) {
        selectedHotelId = el.attr('data-hotelid');
    }

    var reDirectPath = el.data("redirect-path");
    amaSearchResult.attr('data-selected-search-value', selectedLocation);
    $("#hotelIdFromSearch").text(selectedHotelId);
    $('.suggestions-wrap').hide();
    $('.search-bar-wrapper-container').removeClass('rotate-arrow');
    if (el.data('max-guests') && el.data('max-beds')) {
        var subtitleText = el.data('max-guests') + ' | ' + el.data('max-beds');
        subtitlePlaceholder.text(subtitleText);
    }
    enableBestAvailableButton(reDirectPath);
}

function createSearchPlaceHolder() {
    var searchSelector = "#booking-search";
    var searchWidget = $(searchSelector);
    var searchInput = $(searchSelector).find(".searchbar-input");
    var searchBarWrap = searchInput.closest(".searchBar-wrap");
    var suggestionsContainer = searchBarWrap.siblings('.suggestions-wrap');
    var suggestionsWrapper = suggestionsContainer.find('.suggestions-container');
    var searchSuggestionsContainer = suggestionsWrapper.children('.search-suggestions-container');
    var trendingSuggestionsContainer = suggestionsWrapper.children('.trending-suggestions-container');
    var wholeWrapper = searchBarWrap.closest('.search-and-suggestions-wrapper');
    var closeIcon = searchInput.siblings('.close-icon');
    var hotelResultCont = searchWidget.find('#hotel-result-cont');
    var hotelResults = hotelResultCont.find('#hotel-result');
    var websiteHotelResults = hotelResultCont.find('#website-hotel-result');
    var otherHotelResults = hotelResultCont.find('#others-hotel-result');
    var destResultCont = searchWidget.find('#dest-result-cont');
    var destResults = destResultCont.find('#dest-result');
    var restaurantResultCont = searchWidget.find('#restrnt-result-cont');
    var restaurantResults = restaurantResultCont.find('#restrnt-result');
    var nosearchTextBooking = $('#booking-search').find('#NoResults');
    var isTic = $('.cm-page-container').hasClass('tic');
    var keys = {
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        32: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1
    };

    var holidayResultsCont = searchWidget.find('#holiday-result-cont');
    var holidayResults = holidayResultsCont.find('#holiday-result');
    var pageScopeData = $('#page-scope').attr('data-pagescope');

    var holidayHotelResultsCont = searchWidget.find('#holiday-hotel-result-cont');
    var holidayHotelResults = holidayHotelResultsCont.find('#holiday-hotel-result');

    var SEARCH_INPUT_DEBOUNCE_RATE = 1000;

    var preventDefault = function(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    var preventDefaultForScrollKeys = function(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function hideSuggestionsContainer() {
        if (!$(suggestionsContainer).hasClass('display-none')) {
            $(suggestionsContainer).addClass('display-none');
        }
        $(document).off("keyup", searchSelector);
        $(document).off("click", searchSelector);
    }

    function showSuggestionsContainer() {
        $(suggestionsContainer).removeClass('display-none');
        $(document).on("keyup", searchSelector, function(e) {
            // Esc pressed
            if (e.keyCode === 27) {
                $(searchInput).blur();
                hideSuggestionsContainer();
            }
        });

        $(document).on("click", searchSelector, function(e) {
            e.stopPropagation();
            hideSuggestionsContainer();
            if (!$(searchSuggestionsContainer).hasClass('display-none')) {
                $(searchSuggestionsContainer).addClass('display-none');
            }
            if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
                $(trendingSuggestionsContainer).addClass('display-none');
            }
            $(wholeWrapper).removeClass('input-scroll-top');
        });
    }

    $(suggestionsWrapper).on("click", function(event) {
        event.stopPropagation();
    });

    $(closeIcon).on("click", function(e) {
        e.stopPropagation();
        $(wholeWrapper).removeClass('input-scroll-top');
        $(closeIcon).addClass('display-none');
        $(closeIcon).css("display", "none");
        if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
            $(trendingSuggestionsContainer).addClass('display-none');
        }
        if (!$(searchSuggestionsContainer).hasClass('display-none')) {
            $(searchSuggestionsContainer).addClass('display-none');
        }
        hideSuggestionsContainer();
    });

    $(searchInput).on('click', function(e) {
        e.stopPropagation();
    });

    $(searchInput).on("keyup", debounce(function(e) {
        e.stopPropagation();
        if (e.keyCode !== 27 && e.keyCode !== 9 && e.keyCode !== 40 && e.keyCode !== 38 && e.keyCode !== 13) {
            if (searchInput.val().length > 1) {
                clearSearchResults();
                performSearch(searchInput.val()).done(function() {
                    showSuggestionsContainer();
                    if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
                        $(trendingSuggestionsContainer).addClass('display-none');
                    }
                    $(searchSuggestionsContainer).removeClass('display-none');
                });
            } else {
                nosearchTextBooking.hide();
                hideSuggestionsContainer();
                if (!$(searchSuggestionsContainer).hasClass('display-none')) {
                    $(searchSuggestionsContainer).addClass('display-none');
                }
                $(trendingSuggestionsContainer).removeClass('display-none');
            }
        } else {
            chooseDownUpEnterList(e);
        }
        if (window.matchMedia('(max-width: 767px)').matches) {
            $(closeIcon).removeClass('display-none');
            $(closeIcon).css('display', 'inline-block');
        }
    }, SEARCH_INPUT_DEBOUNCE_RATE));




    // Seach List to key up, down to show
    function chooseDownUpEnterList(e) {
        var $listItems = $('.individual-trends:visible');
        var $selected = $listItems.filter('.active');
        var $current = $selected;
        var currentIndex = 0;
        var listLength = $listItems.length;
        if (e.keyCode == 40) {
            $listItems.removeClass('active');
            if ($selected.length == 0) {
                $current = $listItems.first();
            } else {
                currentIndex = $listItems.index($current);
                currentIndex = (currentIndex + 1) % listLength;
                $current = $listItems.eq(currentIndex);
            }
            $current.addClass('active');
            $(".suggestions-container").scrollTop(0);
            $(".suggestions-container").scrollTop($($current).offset().top - $(".suggestions-container").height());
        }
        if (e.keyCode == 38) {
            $listItems.removeClass('active');
            if ($selected.length == 0) {
                $current = $listItems.last();
            } else {
                currentIndex = $listItems.index($current);
                currentIndex = (currentIndex - 1) % listLength;
                $current = $listItems.eq(currentIndex);
            }
            $current.addClass('active');
            $(".suggestions-container").scrollTop(0);
            $(".suggestions-container").scrollTop($($current).offset().top - $(".suggestions-container").height());
        }
        if (e.keyCode == 13) {
            if ($current.hasClass("active")) {
                $($current).focus().trigger('click');
                // var getText = $($current).text();
                // $(searchInput).val(getText);
            }
        }
    }

    function performSearch(key) {

        var contentRootPath = $('#contentRootPath').val();
        var otherWebsitePath = $('#basOtherWebsitePath').val();
        var appendDestName = $('#appendDestName').val();

        var ihclCbBookingObject = dataCache.session.getData("ihclCbBookingObject");
        if (ihclCbBookingObject) {
            if (ihclCbBookingObject.isIHCLCBFlow) {
                contentRootPath = '/content/ihclcb';
                otherWebsitePath = otherWebsitePath + '_:ihclcb';
            }
        }

        return $.ajax({
            method: "GET",
            url: "/bin/search.data/" + contentRootPath.replace(/\/content\//g, ":") + "/" +
                otherWebsitePath.replace(/\/content\//g, ":").replace(",", "_") + "/" + key +
                "/result/searchCache.json"
        }).done(function(res) {

            // [TIC-FLOW]
            var userDetails = getUserData();
            var bookingOptionsSessionData = dataCache.session.getData("bookingOptions");
            if (userDetails && userDetails.tier && bookingOptionsSessionData && bookingOptionsSessionData.flow) {
                bookingOptionsSessionData.flow = '';
                dataCache.session.setData("bookingOptions", bookingOptionsSessionData);
            }

            clearSearchResults();
            removeRedirectionForBestAvailableRatesButton();
            addHotelSearchResults(res.hotels, contentRootPath, otherWebsitePath);
            if (!isTic) {
                addDestSearchResults(res.destinations);
            }
            addHolidaySearchResults(res.holidays);
            addHolidayHotelSearchResults(res.holidayHotels);
            holidayFunction(res);
        }).fail(function() {
            clearSearchResults();
        });
    }

    function isHolidayResultAvailable() {
        if (holidayResults.children().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function isHolidayHotelResultAvailable() {
        if (holidayHotelResults.children().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function holidayFunction(res) {
        if (pageScopeData == "Taj Holidays") {
            // hide all tab and restaurant,experience contains in holiday page
            ifHolidayPage = true;
            if (isHolidayResultAvailable() || isHolidayHotelResultAvailable()) {
                holidayResultsCont.show();
                holidayHotelResultsCont.show();

                hotelResultCont.hide();
                destResultCont.hide();

                if (!isHolidayResultAvailable())
                    holidayResultsCont.hide();

                else if (!isHolidayHotelResultAvailable())

                    holidayHotelResultsCont.hide();

            }
            showNoResultsHoliday(res);

        } else {
            showNoResults(res);
        }
    }

    function showNoResults(res) {
        if ((Object.keys(res.hotels.website).length == 0) && (Object.keys(res.hotels.others).length == 0) &&
            (Object.keys(res.destinations).length == 0)) {
            nosearchTextBooking.show();
        } else {
            nosearchTextBooking.hide();
        }
    }

    function showNoResultsHoliday(res) {
        if ((Object.keys(res.hotels.website).length == 0) && (Object.keys(res.hotels.others).length == 0) &&
            (Object.keys(res.destinations).length == 0) && (Object.keys(res.holidays).length == 0) &&
            (Object.keys(res.holidayHotels).length == 0)) {
            nosearchTextBooking.show();
        } else {
            nosearchTextBooking.hide();
        }

    }

    function removeRedirectionForBestAvailableRatesButton() {
        return $("#global-re-direct").removeAttr("href");
    }

    function clearSearchResults() {
        hotelResultCont.hide();
        otherHotelResults.empty();
        websiteHotelResults.empty();
        destResultCont.hide();
        destResults.empty();
        restaurantResultCont.hide();
        restaurantResults.empty();
        holidayResultsCont.hide();
        holidayResults.empty();
        holidayHotelResultsCont.hide();
        holidayHotelResults.empty();
    }

    function addHotelSearchResults(hotels, contentRootPath, otherWebsitePath) {
        if (Object.keys(hotels).length) {
            var websiteHotels = hotels.website;
            var otherHotels = hotels.others;

            var websiteHotelsGrouped = brandWiseSplitOtherHotels(websiteHotels);
            hotelResultCont.find('.website-result').remove();

            if (!isIHCLCBSite()) {
                if (Object.keys(websiteHotels).length) {
                    websiteHotelsGrouped.forEach(function(group) {
                        var brandName = Object.keys(group)[0];
                        var brandArray = group[brandName];
                        websiteHotelResults.append('<p class="explore-heading website-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                            '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Hotels</span></p>');
                        brandArray.forEach(function(hotel) {
                            var ROOMS_PATH = "rooms-and-suites/";
                            var reDirectToRoomPath = hotel.path.replace(".html", "");
                            reDirectToRoomPath = reDirectToRoomPath + ROOMS_PATH;
                            if (reDirectToRoomPath != "" && reDirectToRoomPath != null && reDirectToRoomPath != undefined) {
                                reDirectToRoomPath = reDirectToRoomPath.replace("//", "/");
                            }
                            if (contentRootPath.indexOf("tajhotels") != -1 && otherWebsitePath.indexOf("taj-inner-circle") != -1) {

                                //if(hotel.path.indexOf("tajinnercircle") != -1){
                                var resultHtml = createSearchResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.sameDayCheckout);
                                websiteHotelResults.append(resultHtml);
                                //}
                            } else if (contentRootPath.indexOf("tajhotels") != -1 && !(otherWebsitePath.indexOf("taj-inner-circle") != -1)) {
                                if (!(hotel.path.indexOf("tajinnercircle") != -1)) {
                                    if (hotel.id == "99999" && window.location.href.includes('//taj-dev65-02.adobecqms.net')) {
                                        let tajhotelsDomainURL_1 = "https:/www.tajhotels.com";
                                        let tajhotelsDomainURL_2 = "https://www.tajhotels.com";
                                        if (reDirectToRoomPath.startsWith(tajhotelsDomainURL_1)) {
                                            reDirectToRoomPath = reDirectToRoomPath.substr(tajhotelsDomainURL_1.length);
                                        }
                                        if (reDirectToRoomPath.startsWith(tajhotelsDomainURL_2)) {
                                            reDirectToRoomPath = reDirectToRoomPath.substr(tajhotelsDomainURL_2.length);
                                        }
                                        reDirectToRoomPath = "/en-in/swt/?redirectUrl=" + hotel.path;
                                    }
                                    var resultHtml = createSearchResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.sameDayCheckout);
                                    websiteHotelResults.append(resultHtml);
                                }
                            } else {
                                var resultHtml = createSearchResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.sameDayCheckout);
                                websiteHotelResults.append(resultHtml);
                            }
                            hotelResultCont.find('.website-result').show();
                        });
                    });
                }
                otherHotelsGrouped = brandWiseSplitOtherHotels(otherHotels);

                if (otherHotels && Object.keys(otherHotels).length) {
                    hotelResultCont.find('.others-result').remove();
                    otherHotelsGrouped.forEach(function(group) {
                        var brandName = Object.keys(group)[0];
                        var brandArray = group[brandName];
                        otherHotelResults.append('<p class="explore-heading others-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                            '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Hotels</span></p>');
                        brandArray.forEach(function(hotel) {
                            var ROOMS_PATH = "rooms-and-suites/";
                            var reDirectToRoomPath = hotel.path.replace(".html", "");
                            reDirectToRoomPath = reDirectToRoomPath + ROOMS_PATH;
                            if (reDirectToRoomPath != "" && reDirectToRoomPath != null && reDirectToRoomPath != undefined) {
                                if (!reDirectToRoomPath.includes('https')) {
                                    reDirectToRoomPath = reDirectToRoomPath.replace("//", "/");
                                }
                            }
                            if (!(hotel.path.indexOf("tajinnercircle") != -1)) {
                                if (hotel.id == "99999" && window.location.href.includes('//taj-dev65-02.adobecqms.net')) {
                                    let tajhotelsDomainURL_1 = "https:/www.tajhotels.com";
                                    let tajhotelsDomainURL_2 = "https://www.tajhotels.com";
                                    if (hotel.path.startsWith(tajhotelsDomainURL_1)) {
                                        hotel.path = hotel.path.substr(tajhotelsDomainURL_1.length);
                                    }
                                    if (hotel.path.startsWith(tajhotelsDomainURL_2)) {
                                        hotel.path = hotel.path.substr(tajhotelsDomainURL_2.length);
                                    }
                                    hotel.path = "/en-in/swt/?redirectUrl=" + hotel.path;
                                }
                                // starts-new changes for IHCL CrossBrand
                                let seleqtionsDomainURL_1 = "https://www.seleqtionshotels.com";
                                let vivantaDomainURL_1 = "https://www.vivantahotels.com";
                                let amaDomainURL_1 = "https://www.amastaysandtrails.com";
                                let tajDomainURL_1 = "https://www.tajhotels.com";
                                if ((localStorage.getItem("access_token") != null && localStorage.getItem("access_token") != undefined) && (hotel.path.startsWith(tajDomainURL_1) || hotel.path.startsWith(seleqtionsDomainURL_1) || hotel.path.startsWith(vivantaDomainURL_1) || hotel.path.startsWith(amaDomainURL_1))) {
                                    reDirectToRoomPath = "/en-in/swt/?redirectUrl=" + reDirectToRoomPath;
                                }
                                // ends-new changes for IHCL CrossBrand
                                var resultHtml = createSearchResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.sameDayCheckout);
                                otherHotelResults.append(resultHtml);
                            }
                            hotelResultCont.find('.others-result').show();
                        });
                    });
                }
            } else if (isIHCLCBSite() && otherHotels && Object.keys(otherHotels).length) {
                // [IHCLCB]iterating over result.
                otherHotels.forEach(function(hotel) {
                    var ROOMS_PATH = "rooms-and-suites/";
                    var reDirectToRoomPath = hotel.path.replace(".html", "");
                    reDirectToRoomPath = reDirectToRoomPath + ROOMS_PATH;
                    if (reDirectToRoomPath != "" && reDirectToRoomPath != null && reDirectToRoomPath != undefined &&
                        reDirectToRoomPath.includes('/corporate-booking/') &&
                        !reDirectToRoomPath.includes('/ama-trails/')) {
                        if (!reDirectToRoomPath.includes('https')) {
                            reDirectToRoomPath = reDirectToRoomPath.replace("//", "/");
                        }
                        var resultHtml = createSearchResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.sameDayCheckout);
                        websiteHotelResults.append(resultHtml);
                        hotelResultCont.find('.website-result').show();
                    }
                    // [IHCLCB]this is intentional hide for ihclccb
                    hotelResultCont.find('.others-result').hide();
                });
            }
            if (websiteHotels && Object.keys(websiteHotels).length == 0) {
                hotelResultCont.find('.website-result').hide();
            }
            if (otherHotels && Object.keys(otherHotels).length == 0) {
                hotelResultCont.find('.others-result').hide();
            }
            hotelResultCont.show();
        }
    }

    function getBrand(hotelContentPath) {
        if (hotelContentPath.indexOf('/gateway/') != -1)
            return 'Gateway';
        if (hotelContentPath.indexOf('/ginger/') != -1)
            return 'Ginger';
        if (hotelContentPath.indexOf('tajhotels') != -1 || hotelContentPath.indexOf('taj/') != -1)
            return 'Taj';
        if (hotelContentPath.indexOf('seleqtions') != -1)
            return 'SeleQtions';
        if (hotelContentPath.indexOf('vivanta') != -1)
            return 'Vivanta';
        if (hotelContentPath.indexOf('/ama/') != -1 || hotelContentPath.indexOf('amastaysandtrails') != -1)
            return 'Ama';
    }


    function brandWiseSplitOtherHotels(otherHotels) {
        var vivantaArray = [];
        var tajArray = [];
        var seleqtionsArray = [];
        var amaArray = [];
        var gatewayArray = [];
        var gingerArray = [];
        var arraygroup = [];
        if (otherHotels && Object.keys(otherHotels).length) {
            otherHotels.forEach(function(hotel) {
                if (hotel.path.indexOf('/gateway/') != -1 || (hotel.title && hotel.title.indexOf('The Gateway') != -1))
                    gatewayArray.push(hotel);
                else if (hotel.path.indexOf('ginger') != -1 || hotel.path.indexOf('/ginger/') != -1)
                    gingerArray.push(hotel);
                else if (hotel.path.indexOf('tajhotels') != -1 || hotel.path.indexOf('/taj/') != -1)
                    tajArray.push(hotel);
                else if (hotel.path.indexOf('vivanta') != -1 || (hotel.title && hotel.title.indexOf('Vivanta') != -1))
                    vivantaArray.push(hotel);
                else if (hotel.path.indexOf('seleqtions') != -1 || (hotel.title && hotel.title.indexOf('SeleQtions') != -1))
                    seleqtionsArray.push(hotel);
                else if (hotel.path.indexOf('amastays') != -1 || hotel.path.indexOf('/ama/') != -1)
                    amaArray.push(hotel);
            });
        }
        if (tajArray.length > 0)
            arraygroup.push({
                'Taj': tajArray
            });
        if (seleqtionsArray.length > 0)
            arraygroup.push({
                'SeleQtions': seleqtionsArray
            });
        if (vivantaArray.length > 0)
            arraygroup.push({
                'Vivanta': vivantaArray
            });
        if (gingerArray.length > 0)
            arraygroup.push({
                'Ginger': gingerArray
            });
        if (gatewayArray.length > 0)
            arraygroup.push({
                'Gateway': gatewayArray
            });
        if (amaArray.length > 0)
            arraygroup.push({
                'Ama Stays & Trails': amaArray
            });

        return arraygroup;
    }


    function addDestSearchResults(dests) {
        var destinationObject = [];
        if (Object.keys(dests).length) {
            dests.forEach(function(dest) {
                var destRedirectPath = dest.path;
                console.log(dest);
                if (isIHCLCBSite() && dest && dest.ihclOurHotelsBrand) {
                    if (dest.path.includes('/corporate-booking/')) {
                        var destinationFlag = false;
                        for (var i = 0; i < destinationObject.length; i++) {
                            if (destinationObject[i] === dest.path) {
                                destinationFlag = true;
                                break;
                            }
                        }
                        if (!destinationFlag) {
                            destinationObject.push(dest.path);
                            var resultHtml = createSearchResult(dest.title, destRedirectPath);
                            destResults.append(resultHtml);
                        }
                    }
                } else {
                    if (!(dest.path.indexOf("tajinnercircle") != -1)) {
                        var resultHtml = createSearchResult(dest.title, destRedirectPath);
                        destResults.append(resultHtml);
                    }

                }
            });
            destResultCont.show();
        }
    }

    function addHolidaySearchResults(holidays) {
        if (Object.keys(holidays).length) {
            holidays.forEach(function(holidays) {
                if (holidays.title != null) {
                    var resultHtml = createSearchResult(holidays.title, holidays.path);
                    holidayResults.append(resultHtml);
                }
            });
        }
    }

    function addHolidayHotelSearchResults(holidayHotel) {
        if (Object.keys(holidayHotel).length) {
            holidayHotel.forEach(function(holidayHotel) {
                var resultHtml = createSearchResult(holidayHotel.title, holidayHotel.path);
                holidayHotelResults.append(resultHtml);
            });
        }
    }

    function createSearchResult(title, path, hotelId, sameDayCheckout) {
        /*Check if not GInger hotels*/
        if (hotelId == "99999" && window.location.href.includes('//taj-dev65-02.adobecqms.net')) {
            let tajhotelsDomainURL_1 = "https:/www.tajhotels.com";
            let tajhotelsDomainURL_2 = "https://www.tajhotels.com";
            if (path.startsWith(tajhotelsDomainURL_1)) {
                path = path.substr(tajhotelsDomainURL_1.length);
            }
            if (path.startsWith(tajhotelsDomainURL_2)) {
                path = path.substr(tajhotelsDomainURL_2.length);
            }
        }
        if (hotelId == "99999") {
            if (path.indexOf("/en-in/swt/?redirectUrl=") == -1) {
                path = "/en-in/swt/?redirectUrl=" + path;
            }
        }


        /*if(path.startsWith('/en-in/ginger/')) {
            var authCodeLocal = localStorage.getItem("authCode");
            var codeVerifierLocal = localStorage.getItem("codeVerifier");
            path = path + "?authCode=" +  authCodeLocal + "&codeVerifier=" + codeVerifierLocal;
        }*/

        return '<a class="individual-trends" data-hotelId="' + hotelId + '" data-redirect-path="' + path + '" data-sameDayCheckout="' + sameDayCheckout + '">' + title +
            '</a>';
    }

    $('#booking-search .trending-search').on("click", '.individual-trends', function() {
        hideSuggestionsContainer();
        if ($(this).parents('.trending-searches-in-taj').attr('id') == 'others-hotel-result') {
            domainChangeFlag = true;
        } else {
            domainChangeFlag = false;
        }
        var selectedLocation = $(this).text();
        var selectedHotelId = "";
        if ($(this).attr('data-hotelid') != 'undefined') {
            selectedHotelId = $(this).attr('data-hotelid');
        }
        dataCache.session.setData("sameDayCheckout", $(this).attr('data-sameDayCheckout'));
        setHotelIdFromSearch(selectedHotelId);
        setSearchBarText(selectedLocation);
        var reDirectPath = $(this).data("redirect-path");
        searchInput.attr('data-selected-search-value', selectedLocation);
        enableBestAvailableButton(reDirectPath);
    });

    function setSearchBarText(textValue) {
        return searchInput.val(textValue);

    }

    function setHotelIdFromSearch(hotelId) {
        $("#hotelIdFromSearch").text(hotelId);
    }
}

var initiateNavPreloginSearch = function() {
    var navPreloginSearch = $('.header-nav-prelogin-search');
    $('.gb-search-con').click(function() {
        navPreloginSearch.show().promise().then(function() {
            navPreloginSearch.find('.searchbar-input').click();
        });
    });
    $('.nav-prelogin-close, .closeIconImg ,.cm-overlay').click(function() {
        navPreloginSearch.hide();
    });
}

initiateNavPreloginSearch();

$('document').ready(function() {

    var spaButtons = $('.jiva-spa-details-book-btn');
    spaButtons.each(function() {
        $(this).on('click', function() {
            setSpaAndHotelDataInSession($(this));
        });
    });
    $('.events-cards-request-btn').each(function(element) {
        $(this).hide();
    });
    var requestQuote = $('.events-cards-request-btn, .meeting-request-quote-btn');
    requestQuote.each(function() {
        $(this).on('click', function() {
            setRequestQuoteDataInSession($(this));
        });
    });
    $('.meeting-card-wait-spinner').each(function(element) {
        $(this).hide();
    });
    $('.events-cards-request-btn').each(function(element) {
        $(this).show();
    });
});

function setRequestQuoteDataInSession(clickEvent) {
    var meetingRequestQuoteData = {};

    var ind = $(clickEvent).closest(".events-pg-filter-inner-wrap");

    // Hotel properties
    var requestQuoteEmailId = $(ind).find(".request-quote-email-id").text();

    meetingRequestQuoteData.requestQuoteEmailId = requestQuoteEmailId;
    dataCache.session.setData('meetingRequestQuoteData', meetingRequestQuoteData);
}

function setSpaAndHotelDataInSession(clickEvent) {
    var spaOptions = {};

    var ind = $(clickEvent).closest(".jiva-spa-card-details-wrap");
    var spaName = $(ind).find(".jiva-spa-details-heading").text();
    var spaDuration = $(ind).find(".spa-duration").text();
    var spaCurr = $(ind).find(".spaCurr").text();
    var spaAmount = $(ind).find(".spaAmount").text();
    var spaAmountDetails = spaCurr + spaAmount;

    // Hotel properties
    var hotelName = $(ind).find(".hotel-name").text();
    var hotelCity = $(ind).find(".hotel-city").text();
    var hotelEmailId = $(ind).find(".hotel-email-id").text();
    var jivaSpaEmailId = $(ind).find(".jiva-spa-email-id").text();
    var requestQuoteEmailId = $(ind).find(".request-quote-email-id").text();
    spaOptions.spaName = spaName;
    spaOptions.spaDuration = spaDuration;
    spaOptions.spaAmount = spaAmountDetails;
    spaOptions.hotelName = hotelName;
    spaOptions.hotelCity = hotelCity;
    spaOptions.hotelEmailId = hotelEmailId;
    spaOptions.jivaSpaEmailId = jivaSpaEmailId;
    spaOptions.requestQuoteEmailId = requestQuoteEmailId;
    dataCache.session.setData('spaOptions', spaOptions);
}

$(document).ready(function() {
    modifyBookingState = dataCache.session.getData('modifyBookingState');
    var modifyBookingQuery = getQueryParameter('modifyBooking');
    if (modifyBookingQuery == "true" && modifyBookingState) {
        if (modifyBookingState != 'modifyRoomType') {
            $('.book-stay-btn').trigger('click');
        }
    } else {
        console.log("Booking modification is not invoked")
    }
    if (modifyBookingState && modifyBookingState != 'modifyAddRoom') {
        $('.cart-room-delete-icon, .cart-addRoom').remove();
    }
    if (modifyBookingState && modifyBookingState == 'modifyGuest') {
        updateBookedRoom();
    }
    if (window.location.href.indexOf("en-in/booking-cart") > -1 && modifyBookingState != 'modifyAddRoom') {
        updateBookedRoom();
    }
    $('.carts-book-now').on('click', updateBookedRoom);
});

function updateBookedRoom() {
    if (modifyBookingState) {
        var bookedRoomsModify = {};
        var modifiedBookingOptions = dataCache.session.getData('bookingOptions');
        var selection = modifiedBookingOptions.selection;
        var bookedRoomsData = modifiedBookingOptions.bookedRoomsModify;
        if (modifyBookingState == 'modifyGuest') {
            bookedRoomsData = modifiedBookingOptions.roomOptions;
        }
        var modifiedCheckInDate = moment(modifiedBookingOptions.fromDate, "MMM Do YY").format("YYYY-MM-DD");
        var modifiedCheckOutDate = moment(modifiedBookingOptions.toDate, "MMM Do YY").format("YYYY-MM-DD");
        var totalAmountAfterTax = 0;
        var totalAmountBeforeTax = 0;
        $(selection).each(function(index, data) {
            var reservationNumber = bookedRoomsData[index].reservationNumber;
            var modifiedRoomData = {
                bedType: data.roomBedType,
                bookingStatus: true,
                cancellable: true,
                cancellationPolicy: "Staggered cancel policy",
                discountedNightlyRates: null,
                hotelId: data.hotelId,
                modifyRoom: false,
                nightlyRates: data.nightlyRates,
                noOfAdults: parseInt(data.adults),
                noOfChilds: parseInt(data.children),
                petPolicy: null,
                promoCode: null,
                rateDescription: data.rateDescription,
                ratePlanCode: data.ratePlanCode,
                resStatus: "Committed",
                reservationNumber: reservationNumber,
                roomCostAfterTax: data.roomTaxRate + data.roomBaseRate,
                roomCostBeforeTax: data.roomBaseRate,
                roomTypeCode: data.roomTypeCode,
                roomTypeDesc: "",
                roomTypeName: data.title
            }
            bookedRoomsModify[reservationNumber] = modifiedRoomData;
        });
        var bookingDetailsResponse = JSON.parse(dataCache.session.getData('bookingDetailsRequest'));
        bookingDetailsResponse.checkInDate = modifiedCheckInDate;
        bookingDetailsResponse.checkOutDate = modifiedCheckOutDate;
        var bookingRoomList = bookingDetailsResponse.roomList;
        //var roomListUpdated = bookingDetailsResponse.roomList;
        var ival = 0;
        $(bookingRoomList).each(function(index) {
            index = index - ival;
            var reservationNumber = this.reservationNumber;
            if (bookedRoomsModify[reservationNumber]) {
                bookingRoomList[index] = bookedRoomsModify[reservationNumber];
            } else if (bookingRoomList[index].resStatus == 'Cancelled') {
                bookingRoomList.splice(index, 1);
                ival++;
                //--index;
            }

            totalAmountBeforeTax += parseFloat(this.roomCostBeforeTax);
            totalAmountAfterTax += parseFloat(this.roomCostAfterTax);
        });
        bookingDetailsResponse.roomList = bookingRoomList;
        bookingDetailsResponse.totalAmountBeforeTax = totalAmountBeforeTax;
        bookingDetailsResponse.totalAmountAfterTax = totalAmountAfterTax;
        dataCache.session.setData('bookingDetailsRequest', JSON.stringify(bookingDetailsResponse));
    }
}

function modifyBookingInBookAStay(modifyBookingState) {
    var bookedOptions = JSON.parse(dataCache.session.getData('bookingDetailsRequest'));
    var $bookingSearchContainer = $('#booking-search');
    var $basDateOccupancyPromoWrapper = $('.bas-date-container-main-wrap');
    var $basDateContainer = $('.bas-date-container-main');
    var $basOccupancyContainer = $('.bas-hotel-details-container');
    var $basPromoCodeContainer = $('.bas-specialcode-container');
    var $basDatepickerContainer = $('.bas-date-container-main');
    var $basAddRoomOption = $('.bas-add-room');
    $basAddRoomOption.addClass('bas-hide');
    $bookingSearchContainer.addClass('modify-booking-disabled-state');
    $basDatepickerContainer.addClass('modify-booking-disabled-state');
    $basDateOccupancyPromoWrapper.children().addClass('modify-booking-disabled-state');
    if (modifyBookingState == 'modifyDate') {
        $basDateContainer.removeClass('modify-booking-disabled-state');
    } else if (modifyBookingState == 'modifyRoomOccupancy') {
        $basOccupancyContainer.removeClass('modify-booking-disabled-state');
    } else if (modifyBookingState == 'modifyAddRoom') {
        $basOccupancyContainer.removeClass('modify-booking-disabled-state');
        $basAddRoomOption.removeClass('bas-hide');
    }
}
$("document").ready(function() {
    try {
        var bungalows = getUrlParameter('onlyBungalows');
        var checkAvail = getUrlParameter('checkAvail');
        var themeAma = $('.cm-page-container').hasClass('ama-theme');
        if (themeAma) {
            /*$(".ama-theme .bas-about-room-container").css("display", "block");
            $('.cm-bas-content-con').css('height','560px');*/
            if (!bungalows && bungalows == "" && checkAvail) {
                $("#onlyRoom").trigger("click");
                $(".ama-theme .bas-about-room-container").css("display", "block");
            } else {
                $("#onlyBungalow").trigger("click");
                $(".ama-theme .bas-about-room-container").css("display", "none");
            }

            $('.ama-theme .bas-date-container-main-wrap input[type="radio"]').click(function() {

                var adultCountReset = $(".ama-theme  .bas-quantity").parent().parent().hasClass("bas-no-of-adults");
                var childCountReset = $(".ama-theme  .bas-quantity").parent().parent().hasClass("bas-no-of-child");
                if (adultCountReset) {
                    $(".ama-theme  .bas-quantity").closest(".bas-no-of-adults .bas-quantity").val(1);
                }
                if (childCountReset) {
                    $(".ama-theme  .bas-quantity").closest(".bas-no-of-child .bas-quantity").val(0);
                }
                if ($(this).hasClass("activeRadioButton")) {
                    $(".ama-theme .bas-about-room-container").css("display", "block");
                } else if (!$(this).hasClass("activeRadioButton")) {
                    $(".ama-theme .bas-about-room-container").css("display", "none");
                }

            });

            $(".ama-theme .bas-close.icon-close").click(function() {

                // if (!bungalows && bungalows == "" && checkAvail) {
                // $("#onlyRoom").trigger("click");
                // } else {
                // $("#onlyBungalow").trigger("click");
                // }

                amaBookingObject = fetchRoomOptionsSelected(amaBookingObject);
                amaBookingObject.fromDate = moment(new Date($("#input-box1").val())).format('MMM D YY');
                amaBookingObject.toDate = moment(new Date($("#input-box2").val())).format('MMM D YY');
                amaBookingObject.rooms = $('.bas-room-no').length;
                amaBookingObject.BungalowType = fetchRadioButtonSelectedAma();
                typeof autoPopulateBannerBookAStay != 'undefined' ? autoPopulateBannerBookAStay() : '';
            });
            var shouldInvokeCalendarApiBas = false;
            if (document.getElementById("shouldInvokeCalendarApiBas"))
                var shouldInvokeCalendarApiBas = document.getElementById("shouldInvokeCalendarApiBas").value;
            if (shouldInvokeCalendarApiBas) {
                amacacalendarPricingBas();
                bindNextPrevClickAmaBas();
            }
        }

        $(".ama-theme .bas-date-container-main-wrap #onlyBungalow").click(function() {
            $(".bas-room-delete-close").trigger("click");
        });

        setTimeout(updateBasPlaceholder, 1000);

        function updateBasPlaceholder() {
            var isDestinationPage = $(".cm-page-container").hasClass("destination-layout");
            var isHotelPage = $(".cm-page-container").hasClass("specific-hotels-page");
            if (themeAma & !isDestinationPage & !isHotelPage) {
                $('#book-a-stay .dropdown-input').text("Select Destinations/Bungalows");
            } else if (themeAma & (isDestinationPage || isHotelPage)) {
                var destinationName = $('.specific-hotels-breadcrumb .breadcrumb-item:last-child').text().trim();
                $('#book-a-stay .dropdown-input').text(destinationName);
                $('#global-re-direct').attr('hrefvalue', window.location.href);
            }
        }
    } catch (error) {
        console.error('Error occurred in ama-bookastay', error);
    }


    /* is only bunglow check in home page*/
    isOnlyBunglowInHome();


});


var basSelectedHotel;
var basSelectedFromdate;
var basSelectedTodate;
var ItineraryDetails;
var currentCalendarInputDate;
var monthExisting;
var monthOfferNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December", "December"
];
var monthAvailability = {};
var monthJson;

function amacacalendarPricingBas() {

    basSelectedHotel = $("#hotelIdFromSearch").text() || pageLevelData.hotelCode;

    //var isCalendarPricing = document.getElementById("isCalendarPricing").value;
    var isCalendarPricing = true;
    if (isCalendarPricing == true) {

        $('.input-box-wrapper').click(function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            //***Removing Ama Calendar rates modified****///
            var getPathName = window.location.pathname;
            var getHostName = window.location.hostname;
            if (getHostName == 'www.amastaysandtrails.com' || getPathName.includes('/content/ama')) {
                return;
            } ///*** changes end ****///
            if ($("#hotelIdFromSearch").text() == '' || basSelectedHotel == "99999") {
                return;
            }
            currentCalendarInputDate = new Date($(e.currentTarget).find('input').val());

            if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0])) {
                currentCalendarInputDate = new Date();
            }
            if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0])) {
                currentCalendarInputDate = moment($($(e.currentTarget).closest('.row').find('.enquiry-from-value')[0]).val(), "DD/MM/YYYY")._i;
            }

            var monthYearStr = $($($('.bas-calander-container').find('.datepicker-days')[$('.bas-calander-container').find('.datepicker-days').length - 1]).find('thead .datepicker-switch')[0]).html();
            if (monthYearStr) {
                var currentCalendarMonthName = monthYearStr.split(' ')[0];
                var currentCalendarYear = monthYearStr.split(' ')[1];
            } else {
                var currentCalendarMonthName = monthOfferNames[currentCalendarInputDate.getMonth()];
                var currentCalendarYear = currentCalendarInputDate.getFullYear();
            }
            var currentCalendarMonthFirstDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName), 1);
            var currentCalendarMonthLastDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName) + 1, 0);

            basSelectedHotel = $("#hotelIdFromSearch").text() || pageLevelData.hotelCode;
            basSelectedFromdate = currentCalendarMonthFirstDay;
            basSelectedTodate = new Date((basSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));
            if (!monthAvailability[basSelectedHotel]) {
                monthAvailability = {};
                //basSelectedTodate = currentCalendarMonthFirstDay;
                //basSelectedFromdate = new Date((basSelectedTodate.getTime() +  (1 * 24 * 60 * 60 * 1000)));
            }
            monthAvailability = {};
            var monthJsonCheck = monthAvailability[basSelectedHotel] && monthAvailability[basSelectedHotel][currentCalendarMonthName + currentCalendarYear];

            if ((!monthJsonCheck || (monthJsonCheck && new Date(monthJsonCheck[monthJsonCheck.length - 1].end) < currentCalendarMonthLastDay)) && basSelectedHotel != "99999") {
                $('td.day').attr('data-custom', '');
                //basSelectedFromdate = basSelectedTodate ? new Date() : new Date();
                //basSelectedTodate =  new Date((basSelectedFromdate.getTime() +  (60 * 24 * 60 * 60 * 1000)));
                var basUrl = "/bin/calendarAvailability.rates/" + basSelectedHotel + "/" + moment(basSelectedFromdate).format('YYYY-MM-DD') + "/" +
                    moment(basSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/[]//P1N/ratesCache.json';
                console.log("check availability URL", basUrl);

                monthExisting = false;
                console.log($('.datepicker-days').find('tbody'));
                $('.datepicker-loader').remove();
                addOfferCalendarLoaderBas();
                $.ajax({
                    type: "GET",
                    url: basUrl,
                    contentType: "application/json"
                }).done(addPriceDetailsBas).fail().always(function() {});

                bindNextPrevClickAmaBas();

            } else {
                monthExisting = true;
                addPriceDetailsBas(monthAvailability);
            }
            return false;
        });
    }
}

function bindNextPrevClickAmaBas() {
    setTimeout(function() {
        $('.datepicker .datepicker-days .next,.datepicker .datepicker-days .prev').click(function(e) {
            if ($("#hotelIdFromSearch").text() == '' || basSelectedHotel == "99999") {
                $('.datepicker-loader').remove();
                return;
            }
            setTimeout(function() {
                console.log("e", e);
                var currentCalendarMonthName = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[0];
                var currentCalendarYear = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[1].substring(0, 4);
                var currentCalendarMonthLastDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName) + 1, 0);
                var currentCalendarMonthFirstDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName), 1);
                console.log(currentCalendarMonthName, currentCalendarYear);

                var monthJsonCheck = monthAvailability[basSelectedHotel] && monthAvailability[basSelectedHotel][currentCalendarMonthName + currentCalendarYear];
                if (!monthJsonCheck || (monthJsonCheck && new Date(monthJsonCheck[monthJsonCheck.length - 1].end) < currentCalendarMonthLastDay)) {
                    if (basSelectedFromdate > currentCalendarMonthLastDay) {
                        basSelectedFromdate = currentCalendarMonthFirstDay;
                        basSelectedTodate = currentCalendarMonthLastDay
                    } else {
                        basSelectedFromdate = basSelectedTodate ? basSelectedTodate : new Date();
                        basSelectedTodate = new Date((basSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));

                    }

                    var basUrl = "/bin/calendarAvailability.rates/" + basSelectedHotel + "/" + moment(basSelectedFromdate).format('YYYY-MM-DD') + "/" +
                        moment(basSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/[]//P1N/ratesCache.json';
                    console.log("check availability URL", basUrl);

                    monthExisting = false;
                    $('.datepicker-loader').remove();
                    addOfferCalendarLoaderBas();

                    $.ajax({
                        type: "GET",
                        url: basUrl,
                        contentType: "application/json"
                    }).done(addPriceDetailsBas).fail().always(function() {});
                } else {
                    monthExisting = true;
                    addPriceDetailsBas(monthAvailability);
                }
            }, 500);
        });
    }, 500);
}

function processOfferRatesJSONBas(rateJson) {
    monthJson = monthJson ? monthJson : {};
    monthJson[basSelectedHotel] = monthJson[basSelectedHotel] ? monthJson[basSelectedHotel] : {};
    for (var i = 0; i < rateJson.hotelStays.length; i++) {
        var startmonth = new Date(rateJson.hotelStays[i].start).getMonth();
        var endmonth = new Date(rateJson.hotelStays[i].end).getMonth();
        var startYear = new Date(rateJson.hotelStays[i].start).getFullYear();
        var endYear = new Date(rateJson.hotelStays[i].end).getFullYear();
        if (!(monthJson[basSelectedHotel] && monthJson[basSelectedHotel][monthOfferNames[startmonth] + startYear]))
            monthJson[basSelectedHotel][monthOfferNames[startmonth] + startYear] = [];

        monthJson[basSelectedHotel][monthOfferNames[startmonth] + startYear].push(rateJson.hotelStays[i]);
        //startmonth ++;
        var arrayendmonth = endmonth;
        if (endYear > startYear) {
            arrayendmonth = startmonth + endmonth + 1
        }
        var thisYear = startYear;
        while (arrayendmonth >= startmonth) {
            if (!monthJson[basSelectedHotel][monthOfferNames[startmonth] + thisYear])
                monthJson[basSelectedHotel][monthOfferNames[startmonth] + thisYear] = [];
            monthJson[basSelectedHotel][monthOfferNames[startmonth] + thisYear].push(rateJson.hotelStays[i]);
            basSelectedTodate = new Date(rateJson.hotelStays[i].end);
            startmonth++;
            if (endYear > startYear && startmonth == 12) {
                startmonth = 0;
                thisYear = endYear;
                arrayendmonth = endmonth;
            }
        }
    }


    console.log("FINAL JSON", monthJson);
    return monthJson;
}

function showPricesBas(currentMonth) {
    var localDateTimestamp = "";
    var localDateMonth = "";
    var localDateYear = "";
    let isCheckInContainer = true;
    $(".datepicker-days td").filter(function() {

        var date = $(this).text();
        return /\d/.test(date);

    }).each(function() {
        let $currentInputElem = $(this).parents(".jiva-spa-date-section.package-input-wrp");
        if ($('.bas-right-date-wrap-ama').hasClass('active') || $('.bas-right-date-wrap').hasClass('active'))
            isCheckInContainer = false;
        localDateTimestamp = new Date(new Date($(this).data('date')).toLocaleDateString('en-US')).getTime();
        localDateMonth = monthOfferNames[new Date(localDateTimestamp).getMonth()];
        localDateYear = new Date(localDateTimestamp).getFullYear();
        pricemonth = currentMonth ? currentMonth : monthAvailability[basSelectedHotel][localDateMonth + localDateYear];

        if (pricemonth) {
            innerloopbas: for (var i = 0; i < pricemonth.length; i++) {
                if (localDateTimestamp <= new Date(pricemonth[i].end).getTime() && localDateTimestamp >= new Date(pricemonth[i].start).getTime()) {
                    if (pricemonth[i].status == 'Close') {
                        $(this).attr('data-custom', 'X').addClass("disabled");
                        if (!isCheckInContainer) {
                            $(this).removeClass("disabled");
                        }

                        break;
                    } else if (pricemonth[i].status == 'Open' || pricemonth[i].status == 'MinStay') {
                        var getPathName = window.location.pathname;
                        var getHostName = window.location.hostname;
                        if (getHostName == 'www.amastaysandtrails.com' || getPathName.includes('/content/ama')) {
                            return;
                        }
                        var priceStartDate, priceEndDate, price;
                        for (var j = 0; j < pricemonth[i].prices.length; j++) {
                            var priceItem = pricemonth[i].prices[j];
                            priceStartDate = new Date(priceItem.start).getTime();
                            priceEndDate = new Date(priceItem.end).getTime();
                            var pricevals = ((parseInt(priceItem.amountBeforeTax) / 1000) + '').split('.');
                            var decimal = pricevals[1] ? '.' + pricevals[1].substring(0, 1) : '';
                            if (priceItem.currencyCode == 'INR')
                                price = getCurrencySymbol(priceItem.currencyCode) + pricevals[0] + decimal + 'K';
                            else
                                price = '';

                            $(this).attr('data-custom', '');
                            if (localDateTimestamp >= priceStartDate && localDateTimestamp <= priceEndDate) {
                                if ($("#showPriceBas").val()) {
                                    $(this).attr('data-custom', price);
                                    break innerloopbas;
                                }
                                isCheckInContainer ? $(this).removeClass('disabled-checkIn') : $(this).removeClass('disabled-checkOut');
                            }
                        }
                    }
                }
            }
        }
    });
}

function getCurrencySymbol(inputSymbol) {
    if (inputSymbol == 'INR')
        return '₹';
    else if (inputSymbol == 'USD')
        return '$';
    else if (inputSymbol == 'MYR')
        return 'RM';
    else if (inputSymbol == 'ZAR')
        return 'R';
    else if (inputSymbol == 'AED')
        return 'AED';
    else if (inputSymbol == 'GBP')
        return '£';
    else if (inputSymbol == 'EUR')
        return '€';
    else
        return inputSymbol;
}


function addPriceDetailsBas(response) {
    $('.datepicker-loader').remove();
    var data = response;
    console.log('JSON response', response);

    if (response.errorMessage && response.errorMessage.indexOf('Invalid Promotion Code') != -1) {
        warningBox({
            title: '',
            description: 'The selected hotel is not participating in this offer.',
            callBack: null,
            needsCta: false,
            isWarning: true
        });
        return;
    }

    monthAvailability = monthExisting ? response : processOfferRatesJSONBas(response);

    var monthYearStr = $($($('.bas-calander-container').find('.datepicker-days')[$('.bas-calander-container').find('.datepicker-days').length - 1]).find('thead .datepicker-switch')[0]).html();
    if (monthYearStr) {
        var currentCalendarMonthName = monthYearStr.split(' ')[0];
        var currentCalendarYear = monthYearStr.split(' ')[1];
    } else {
        var currentCalendarMonthName = monthOfferNames[currentCalendarInputDate.getMonth()];
        var currentCalendarYear = currentCalendarInputDate.getFullYear();
    }

    if (monthAvailability[basSelectedHotel] && monthAvailability[basSelectedHotel][currentCalendarMonthName + currentCalendarYear]) {
        showPricesBas(monthAvailability[basSelectedHotel][currentCalendarMonthName + currentCalendarYear]);
    }
}

function addOfferCalendarLoaderBas() {
    var calenderText = "Finding best rates..";
    if ($("#showPriceBas").val()) {
        calenderText = "Finding best rates..";
    } else {
        calenderText = "Checking Availability..";
    }
    $('.datepicker-days').find('tbody').append('<div  class="datepicker-loader" style="left:0px;"><p>' + calenderText + '</p></div>')
    $('.datepicker-loader').css({
        'width': $('.datepicker-days tbody').width() + 'px',
        'max-width': $('.datepicker-days tbody').width() + 'px',
        'height': $('.datepicker-days tbody').height() + 'px'
    });
}

function isOnlyBunglowInHome() {
    $('#select-results').on('click', function(ev) {
        if ($(ev.target).parent('li').hasClass('hotel-item')) {
            console.log($(ev.target).attr('data-isonlybungalow'));
            var btnElem = $("#onlyRoomBtn");
            if ($(ev.target).attr('data-isonlybungalow') === "true") {
                $(btnElem).prop("disabled", true);
                $(btnElem).parent('.radio-container').css('opacity', '0.5');
                $("#onlyBungalowBtn").prop("checked", true);

            } else {
                $(btnElem).prop("disabled", false);
                $(btnElem).parent('.radio-container').css('opacity', '1');
            }

        }
    });
}

$(document).ready(function() {
    var checkitem = function() {
        var $this;
        $this = $("#bannerCarousel");
        if (window.matchMedia('(max-width: 767px)').matches) {
            $this.children(".carousel-control-prev").hide();
            $this.children(".carousel-control-next").hide();
        }
    };

    checkitem();
    $("#bannerCarousel").on("slid.bs.carousel", "", checkitem);

    $("#bannerCarousel").on("touchstart", function(event) {
        var xClick = event.originalEvent.touches[0].pageX;
        $(this).one("touchmove", function(event) {
            var xMove = event.originalEvent.touches[0].pageX;
            if (Math.floor(xClick - xMove) > 5) {
                $(this).find('.carousel-control-next').trigger('click');
            } else if (Math.floor(xClick - xMove) < -5) {
                $(this).find('.carousel-control-prev').trigger('click');
            }
        });
        $("#bannerCarousel").on("touchend", function() {
            $(this).off("touchmove");
        });
    });
    $('.carousel').each(function() {
        var carouselItemCount = $(this).find('.carousel-item').length;
        if (carouselItemCount < 2) {
            $(this).find('.carousel-control').hide();
        }
    });

    if ($('#bannerHeightAuto')) {
        var heightAuto = $('#bannerHeightAuto').val();
        if (heightAuto == 'true') {
            $('.carousel-item').find('.bannerImage img').attr("style", "height: auto !important");
        }
    }


});

/*
by Srikanta@moonraft  
open weather api to fetch weather-forcastv1.0.0

 */

$(document).ready(function() {
    setCurrentDateInBanner();
});
(function() {
    var apiKey = $('.banner-container').data('apikey');
    var lat = $('#hotel-banner-temperature').data('lat');
    var lon = $('#hotel-banner-temperature').data('lon');
    var hotellat = $('#hotel-banner-temperature').data('hotellat');
    var hotellon = $('#hotel-banner-temperature').data('hotellon');

    if (lat == undefined && hotellat != undefined) {
        lat = hotellat;
        lon = hotellon;
    }
    if (lat != undefined && lon != undefined) {
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" +
            apiKey + "&units=metric";

        $.getJSON(queryURL, function(data) {
            // var location = data.id.name; // not returned in response
            var temp = data.main.temp;

            var tempRound = parseFloat(temp).toFixed();
            if (tempRound != 'NaN') {
                $('#weather-update').append(tempRound);
            } else {
                $('.hotel-banner-temperature').hide();
                $('.hotel-banner-date').removeClass('inline-block');
            }
        });
    } else {
        console.log("Lat and long can't found")
        $('.banner-label-below-title-sm').hide();
        $('.banner-btn-con.inline-block').hide()
    }
}());

function setCurrentDateInBanner() {
    var currentDate = new Date();
    currentDate = moment(currentDate).format('Do MMM YYYY');
    console.log("Todays Date ", currentDate);
    var systemDateDom = $.find('.system-date')[0];
    if (systemDateDom) {
        $(systemDateDom).text(currentDate);
    }
}

window.addEventListener('load', function() {
    var searchSelector = "#home-search";
    var searchWidget = $(searchSelector);
    var searchPath = $('#searchPath').val();
    var otherWebsitePath = $('#searchOtherWebsitePath').val();
    var searchInput = $(searchSelector).find(".searchbar-input");
    var searchBarWrap = searchInput.closest(".searchBar-wrap");
    var wholeWrapper = searchBarWrap.closest('.search-and-suggestions-wrapper');
    var suggestionsContainer = searchBarWrap.siblings('.suggestions-wrap');
    var suggestionsWrapper = suggestionsContainer.find('.suggestions-container');
    var searchSuggestionsContainer = suggestionsWrapper.children('.search-suggestions-container');
    var trendingSuggestionsContainer = suggestionsWrapper.children('.trending-suggestions-container');
    var closeIcon = searchInput.siblings('.close-icon');
    var resultSuggestionContainer = searchWidget.find("#suggestion-cont");
    var hotelResultCont = searchWidget.find('#hotel-result-cont');
    var websiteHotelResults = hotelResultCont.find('#website-hotel-result');
    var otherHotelResults = hotelResultCont.find('#others-hotel-result');
    var destResultCont = searchWidget.find('#dest-result-cont');
    var destResults = destResultCont.find('#dest-result');
    var restaurantResultCont = searchWidget.find('#restrnt-result-cont');
    var websiteRestaurantResults = restaurantResultCont.find('#website-restrnt-result');
    var otherRestaurantResults = restaurantResultCont.find('#others-restrnt-result');
    var experienceResultsCont = searchWidget.find('#exp-result-cont');
    var websiteExperienceResults = experienceResultsCont.find('#website-exp-result');
    var otherExperienceResults = experienceResultsCont.find('#others-exp-result');

    var tabCont = searchSuggestionsContainer.find(".destination-page-nav-menu");
    var hotelTab = searchSuggestionsContainer.find("#Hotels");
    var restaurantsTab = searchSuggestionsContainer.find("#Dining");
    var experiencesTab = searchSuggestionsContainer.find("#Experiences");

    var noResultsText = searchWidget.find('#NoResults');

    var holidayResultsCont = searchWidget.find('#holiday-result-cont');
    var holidayResults = holidayResultsCont.find('#holiday-result');
    var holidayTab = searchSuggestionsContainer.find("#Holiday");
    var ifHolidayPage = false;
    var pageScopeData = $('#page-scope').attr('data-pagescope');

    var holidayHotelResultsCont = searchWidget.find('#holiday-hotel-result-cont');
    var holidayHotelResults = holidayHotelResultsCont.find('#holiday-hotel-result');

    var keys = {
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        32: 1,
        33: 1,
        34: 1,
        35: 1,
        36: 1
    };
    var SEARCH_INPUT_DEBOUNCE_RATE = 1000;

    var preventDefault = function(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    var preventDefaultForScrollKeys = function(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    searchWidget.on('click', '.individual-trends', function() {
        var bookingOptions = dataCache.session.getData("bookingOptions");
        bookingOptions.targetEntity = '';
        dataCache.session.setData("bookingOptions");
    });

    function hideSuggestionsContainer() {
        if (!$(suggestionsContainer).hasClass('display-none')) {
            $(suggestionsContainer).addClass('display-none');
        }
        // $('body').css('overflow', 'auto');

        if (deviceDetector.checkDevice() == "small") {
            $('.cm-page-container').removeClass("prevent-page-scroll");
        } else {
            $('body').css('overflow', 'auto');
        }

        $(document).off("keyup", searchSelector);
        $(document).off("click", searchSelector);
    }

    function showSuggestionsContainer() {
        $(suggestionsContainer).removeClass('display-none');
        // $('body').css('overflow', 'hidden');
        if (deviceDetector.checkDevice() == "small") {
            $('.cm-page-container').addClass("prevent-page-scroll");
        } else {
            $('body').css('overflow', 'hidden');
        }

        $(document).on("keyup", searchSelector, function(e) {
            // Esc pressed
            if (e.keyCode === 27) {
                $(searchInput).blur();
                hideSuggestionsContainer();
            }
        });

        $(document).on("click", searchSelector, function(e) {
            e.stopPropagation();
            hideSuggestionsContainer();
            if (!$(searchSuggestionsContainer).hasClass('display-none')) {
                $(searchSuggestionsContainer).addClass('display-none');
            }
            if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
                $(trendingSuggestionsContainer).addClass('display-none');
            }
            $(wholeWrapper).removeClass('input-scroll-top');
        });
    }

    $(searchInput).on('click', function(e) {
        e.stopPropagation();
        if (searchInput.val()) {
            if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
                $(trendingSuggestionsContainer).addClass('display-none');
            }
            if ($(searchSuggestionsContainer).hasClass('display-none')) {
                $(searchSuggestionsContainer).removeClass('display-none');
            }
        } else {
            if (!$(searchSuggestionsContainer).hasClass('display-none')) {
                $(searchSuggestionsContainer).addClass('display-none');
            }
            if ($(trendingSuggestionsContainer).hasClass('display-none')) {
                $(trendingSuggestionsContainer).removeClass('display-none');
            }
        }
        showSuggestionsContainer();

        if (window.matchMedia('(max-width: 767px)').matches) {
            $(closeIcon).removeClass('display-none');
            $(closeIcon).css("display", "inline-block");
            searchBarWrap.detach().prependTo(suggestionsWrapper);
            searchInput.focus();
        } else {
            var parentOffset = $('.cm-page-container').offset();
            var targetOffset = $(wholeWrapper).offset();
            $('html,body').animate({
                scrollTop: (parentOffset.top * -1) + targetOffset.top
            }, 300);
        }
    });

    $(suggestionsWrapper).on("click", function(event) {
        event.stopPropagation();
    });

    $(closeIcon).on("click", function(e) {
        e.stopPropagation();
        $(wholeWrapper).removeClass('input-scroll-top');
        $(closeIcon).addClass('display-none');
        $(closeIcon).css("display", "none");
        if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
            $(trendingSuggestionsContainer).addClass('display-none');
        }
        if (!$(searchSuggestionsContainer).hasClass('display-none')) {
            $(searchSuggestionsContainer).addClass('display-none');
        }
        searchBarWrap.detach().prependTo(wholeWrapper);
        hideSuggestionsContainer();
    });

    $(searchInput).on("keyup", debounce(function(e) {
        e.stopPropagation();
        if (e.keyCode !== 27 && e.keyCode !== 40 && e.keyCode !== 38 && e.keyCode !== 13) {
            if (searchInput.val().length > 2) {
                performSearch(searchInput.val(), searchPath).done(function() {
                    $(suggestionsContainer).removeClass('display-none');
                    if (!$(trendingSuggestionsContainer).hasClass('display-none')) {
                        $(trendingSuggestionsContainer).addClass('display-none');
                    }
                    $(searchSuggestionsContainer).removeClass('display-none');
                });
            } else {
                noResultsText.hide();
                $(suggestionsContainer).removeClass('display-none');
                if (!$(searchSuggestionsContainer).hasClass('display-none')) {
                    $(searchSuggestionsContainer).addClass('display-none');
                }
                $(trendingSuggestionsContainer).removeClass('display-none');
            }
        } else {
            chooseDownUpEnterList(e);
        }
        if (window.matchMedia('(max-width: 767px)').matches) {
            $(closeIcon).removeClass('display-none');
            $(closeIcon).css('display', 'inline-block');
        }
    }, SEARCH_INPUT_DEBOUNCE_RATE));

    // Seach List to key up, down to show
    function chooseDownUpEnterList(e) {
        var $listItems = $('.individual-trends:visible');
        var $selected = $listItems.filter('.active');
        var $current = $selected;
        var currentIndex = 0;
        var listLength = $listItems.length;
        if (e.keyCode == 40) {
            $listItems.removeClass('active');
            if ($selected.length == 0) {
                $current = $listItems.first();
            } else {
                currentIndex = $listItems.index($current);
                currentIndex = (currentIndex + 1) % listLength;
                $current = $listItems.eq(currentIndex);
            }
            $current.addClass('active');
        }
        if (e.keyCode == 38) {
            $listItems.removeClass('active');
            if ($selected.length == 0) {
                $current = $listItems.last();
            } else {
                currentIndex = $listItems.index($current);
                currentIndex = (currentIndex - 1) % listLength;
                $current = $listItems.eq(currentIndex);
            }
            $current.addClass('active');
        }
        if (e.keyCode == 13) {
            if ($current.hasClass("active")) {
                $($current).focus();
                // $($current).trigger('click');
                location.href = $($current).attr('href');
            }
        }
    }

    // // left: 37, up: 38, right: 39, down: 40,
    // // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home:
    // 36

    function performSearch(key) {
        return $.ajax({
            method: "GET",
            url: "/bin/search.data/" + searchPath.replace(/\/content\//g, ":") + "/" +
                otherWebsitePath.replace(/\/content\//g, ":").replace(",", "_") + "/" + key +
                "/result/searchCache.json"

        }).done(function(res) {
            clearSearchResults();
            addSuggestions(res.suggestions);
            addHotelSearchResults(res.hotels);
            addDestSearchResults(res.destinations);
            addRestrntSearchResults(res.restaurants);
            addExperiencesSearchResults(res.experiences);
            addHolidaySearchResults(res.holidays);
            addHolidayHotelSearchResults(res.holidayHotels);
            initiateTabs(res);
            holidayFunction(res);

        }).fail(function() {
            clearSearchResults();
        });
    }

    function isHolidayResultAvailable() {
        if (holidayResults.children().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function isHolidayHotelResultAvailable() {
        if (holidayHotelResults.children().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function holidayFunction(res) {
        if (pageScopeData == "Taj Holidays") {
            // hide all tab and restaurant,experience contains in holiday page
            ifHolidayPage = true;
            restaurantsTab.addClass('display-none');
            experiencesTab.addClass('display-none');
            hotelTab.addClass('display-none');
            holidayTab.addClass('display-none');

            restaurantResultCont.hide();
            experienceResultsCont.hide();

            if (isHolidayResultAvailable() || isHolidayHotelResultAvailable()) {
                holidayResultsCont.show();
                holidayHotelResultsCont.show();

                hotelResultCont.hide();
                destResultCont.hide();

                if (!isHolidayResultAvailable())
                    holidayResultsCont.hide();

                else if (!isHolidayHotelResultAvailable())

                    holidayHotelResultsCont.hide();

            }
            showNoResultsHoliday(res);

        } else {
            showNoResults(res);
        }
    }

    function showNoResults(res) {
        if ((Object.keys(res.hotels.website).length == 0) && (Object.keys(res.hotels.others).length == 0) &&
            (Object.keys(res.destinations).length == 0) && (Object.keys(res.restaurants.website).length == 0) &&
            (Object.keys(res.restaurants.others).length == 0) &&
            (Object.keys(res.experiences.website).length == 0) &&
            (Object.keys(res.experiences.others).length == 0))
            noResultsText.show();
        else
            noResultsText.hide();
    }

    function showNoResultsHoliday(res) {
        if ((Object.keys(res.hotels.website).length == 0) && (Object.keys(res.hotels.others).length == 0) &&
            (Object.keys(res.destinations).length == 0) && (Object.keys(res.holidays).length == 0) &&
            (Object.keys(res.holidayHotels).length == 0))
            noResultsText.show();
        else
            noResultsText.hide();
    }

    function addSuggestions(suggestions) {
        if (Object.keys(suggestions).length) {
            suggestions.forEach(function(suggestion) {
                var resultHtml = '<a class="individual-common-suggesion">' + suggestion + '</a>';
                resultSuggestionContainer.append(resultHtml);
            });
            resultSuggestionContainer.show();
        }
    }

    function clearSearchResults() {
        resultSuggestionContainer.empty().hide();
        hotelResultCont.hide();
        websiteHotelResults.empty();
        otherHotelResults.empty();
        destResultCont.hide();
        destResults.empty();
        restaurantResultCont.hide();
        websiteRestaurantResults.empty();
        otherRestaurantResults.empty();
        experienceResultsCont.hide();
        websiteExperienceResults.empty();
        otherExperienceResults.empty();
        holidayResultsCont.hide();
        holidayResults.empty();
        holidayHotelResultsCont.hide();
        holidayHotelResults.empty();
        removeAllTabs();
    }

    function addHotelSearchResults(hotels) {
        if (Object.keys(hotels).length) {
            var websiteHotels = hotels.website;
            var otherHotels = hotels.others;
            var websiteHotelsGrouped = brandWiseSplitOtherHotels(websiteHotels);
            hotelResultCont.find('.website-result').remove();
            if (Object.keys(websiteHotels).length) {
                websiteHotelsGrouped.forEach(function(group) {
                    var brandName = Object.keys(group)[0];
                    var brandArray = group[brandName];
                    websiteHotelResults.append('<p class="explore-heading website-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                        '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Hotels</span></p>');
                    brandArray.forEach(function(hotel) {
                        if (pageScopeData == "Taj Holidays") {
                            var hotelPath = hotel.path.replace(".html", "");
                            hotelPath = hotelPath + "rooms-and-suites.html";
                        } else {
                            var hotelPath = hotel.path;
                        }
                        if (hotelPath != "" && hotelPath != null && hotelPath != undefined) {
                            hotelPath = hotelPath.replace("//", "/");
                        }
                        if (!(hotel.path.indexOf("tajinnercircle") != -1)) {
                            if (hotel.id == "99999" && window.location.href.includes('//taj-dev65-02.adobecqms.net')) {
                                let tajhotelsDomainURL_1 = "https:/www.tajhotels.com";
                                let tajhotelsDomainURL_2 = "https://www.tajhotels.com";
                                if (hotel.path.startsWith(tajhotelsDomainURL_1)) {
                                    hotel.path = hotel.path.substr(tajhotelsDomainURL_1.length);
                                }
                                if (hotel.path.startsWith(tajhotelsDomainURL_2)) {
                                    hotel.path = hotel.path.substr(tajhotelsDomainURL_2.length);
                                }
                                hotel.path = "/en-in/swt/?redirectUrl=" + hotel.path;
                            }
                            var resultHtml = createSearchResult(hotel.title, hotel.path);
                            websiteHotelResults.append(resultHtml);
                        }
                        hotelResultCont.find('.website-result').show();
                    });
                });
                //var thisBrand = getBrand(websiteHotels[0].path);
                //websiteHotelResults.prev().find('.trending-search-text').text(thisBrand + " Hotels");
            }

            otherHotelsGrouped = brandWiseSplitOtherHotels(otherHotels);

            if (otherHotels && Object.keys(otherHotels).length) {
                hotelResultCont.find('.others-result').remove();
                otherHotelsGrouped.forEach(function(group) {
                    var brandName = Object.keys(group)[0];
                    var brandArray = group[brandName];
                    otherHotelResults.append('<p class="explore-heading others-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                        '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Hotels</span></p>');
                    brandArray.forEach(function(hotel) {
                        if (pageScopeData == "Taj Holidays") {
                            var hotelPath = hotel.path.replace(".html", "");
                            hotelPath = hotelPath + "rooms-and-suites.html";
                        } else {
                            var hotelPath = hotel.path;
                        }
                        if (hotelPath != "" && hotelPath != null && hotelPath != undefined) {
                            if (!hotelPath.includes('https')) {
                                hotelPath = hotelPath.replace("//", "/");
                            }
                        }
                        if (!(hotel.path.indexOf("tajinnercircle") != -1)) {
                            if (hotel.id == "99999" && window.location.href.includes('//taj-dev65-02.adobecqms.net')) {
                                let tajhotelsDomainURL_1 = "https:/www.tajhotels.com";
                                let tajhotelsDomainURL_2 = "https://www.tajhotels.com";
                                if (hotel.path.startsWith(tajhotelsDomainURL_1)) {
                                    hotel.path = hotel.path.substr(tajhotelsDomainURL_1.length);
                                }
                                if (hotel.path.startsWith(tajhotelsDomainURL_2)) {
                                    hotel.path = hotel.path.substr(tajhotelsDomainURL_2.length);
                                }
                                hotel.path = "/en-in/swt/?redirectUrl=" + hotel.path;
                            }
                            // starts-new changes for IHCL CrossBrand
                            let seleqtionsDomainURL_1 = "https://www.seleqtionshotels.com";
                            let vivantaDomainURL_1 = "https://www.vivantahotels.com";
                            let amaDomainURL_1 = "https://www.amastaysandtrails.com";
                            let tajDomainURL_1 = "https://www.tajhotels.com";
                            if ((localStorage.getItem("access_token") != null && localStorage.getItem("access_token") != undefined) && (hotel.path.startsWith(tajDomainURL_1) || hotel.path.startsWith(seleqtionsDomainURL_1) || hotel.path.startsWith(vivantaDomainURL_1) || hotel.path.startsWith(amaDomainURL_1))) {
                                hotel.path = "/en-in/swt/?redirectUrl=" + hotel.path;

                            }
                            // ends-new changes for IHCL CrossBrand
                            var resultHtml = createSearchResult(hotel.title, hotel.path);
                            otherHotelResults.append(resultHtml);
                        }
                        hotelResultCont.find('.others-result').show();
                    });
                });
            }

            if (websiteHotels && Object.keys(websiteHotels).length == 0) {
                hotelResultCont.find('.website-result').hide();

            }
            if (otherHotels && Object.keys(otherHotels).length == 0) {
                hotelResultCont.find('.others-result').hide();
            }
        }
    }

    function getBrand(hotelContentPath) {
        if (hotelContentPath.indexOf('/gateway/') != -1)
            return 'Gateway';
        if (hotelContentPath.indexOf('/ginger/') != -1)
            return 'Ginger';
        if (hotelContentPath.indexOf('tajhotels') != -1 || hotelContentPath.indexOf('taj/') != -1)
            return 'Taj';
        if (hotelContentPath.indexOf('seleqtions') != -1)
            return 'SeleQtions';
        if (hotelContentPath.indexOf('vivanta') != -1)
            return 'Vivanta';
        if (hotelContentPath.indexOf('/ama/') != -1 || hotelContentPath.indexOf('amastaysandtrails') != -1)
            return 'Ama';
    }


    function brandWiseSplitOtherHotels(otherHotels) {
        var vivantaArray = [];
        var tajArray = [];
        var seleqtionsArray = [];
        var amaArray = [];
        var gatewayArray = [];
        var gingerArray = [];
        var arraygroup = [];
        if (otherHotels && Object.keys(otherHotels).length) {
            otherHotels.forEach(function(hotel) {
                if (hotel.path.indexOf('/gateway/') != -1 || (hotel.title && hotel.title.indexOf('The Gateway') != -1))
                    gatewayArray.push(hotel);
                else if (hotel.path.indexOf('ginger') != -1 || hotel.path.indexOf('/ginger/') != -1)
                    gingerArray.push(hotel);
                else if (hotel.path.indexOf('tajhotels') != -1 || hotel.path.indexOf('/taj/') != -1)
                    tajArray.push(hotel);
                else if (hotel.path.indexOf('vivanta') != -1 || (hotel.title && hotel.title.indexOf('Vivanta') != -1))
                    vivantaArray.push(hotel);
                else if (hotel.path.indexOf('seleqtions') != -1 || (hotel.title && hotel.title.indexOf('SeleQtions') != -1))
                    seleqtionsArray.push(hotel);
                else if (hotel.path.indexOf('amastays') != -1 || hotel.path.indexOf('/ama/') != -1)
                    amaArray.push(hotel);
            });
        }
        if (tajArray.length > 0)
            arraygroup.push({
                'Taj': tajArray
            });
        if (seleqtionsArray.length > 0)
            arraygroup.push({
                'SeleQtions': seleqtionsArray
            });
        if (vivantaArray.length > 0)
            arraygroup.push({
                'Vivanta': vivantaArray
            });
        if (gingerArray.length > 0)
            arraygroup.push({
                'Ginger': gingerArray
            });
        if (gatewayArray.length > 0)
            arraygroup.push({
                'Gateway': gatewayArray
            });
        if (amaArray.length > 0)
            arraygroup.push({
                'Ama Stays & Trails': amaArray
            });

        return arraygroup;
    }

    function addDestSearchResults(dests) {
        if (Object.keys(dests).length) {
            dests.forEach(function(dest) {
                if (!(dest.path.indexOf("tajinnercircle") != -1)) {
                    var resultHtml = createSearchResult(dest.title, dest.path);
                    destResults.append(resultHtml);
                }
            });
        }
    }

    function addRestrntSearchResults(restaurants) {
        if (Object.keys(restaurants).length) {
            var websiteRestaurants = restaurants.website;
            var otherRestaurants = restaurants.others;
            if (Object.keys(websiteRestaurants).length) {
                websiteRestaurants.forEach(function(restaurant) {
                    var resultHtml = createSearchResult(restaurant.title, restaurant.path);
                    websiteRestaurantResults.append(resultHtml);
                    restaurantResultCont.find('.website-result').show();
                });
                var thisBrand = getBrand(websiteRestaurants[0].path);
                websiteRestaurantResults.prev().find('.trending-search-text').text(thisBrand + " Restaurants");
            }
            var otherRestaurantsGrouped = brandWiseSplitOtherHotels(otherRestaurants);

            if (Object.keys(otherRestaurants).length) {
                restaurantResultCont.find('.others-result').remove();
                otherRestaurantsGrouped.forEach(function(group) {
                    var brandName = Object.keys(group)[0];
                    var brandArray = group[brandName];
                    otherRestaurantResults.append('<p class="explore-heading others-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                        '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Restaurants</span></p>');
                    brandArray.forEach(function(restaurant) {
                        var resultHtml = createSearchResult(restaurant.title, restaurant.path);
                        otherRestaurantResults.append(resultHtml);
                        restaurantResultCont.find('.others-result').show();
                    });
                });
            }
            if (Object.keys(websiteRestaurants).length == 0) {
                restaurantResultCont.find('.website-result').hide();
            }
            if (Object.keys(otherRestaurants).length == 0) {
                restaurantResultCont.find('.others-result').hide();
            }
        }
    }

    function addExperiencesSearchResults(experiences) {
        if (Object.keys(experiences).length) {
            var websiteExperiences = experiences.website;
            var otherExperiences = experiences.others;
            if (Object.keys(websiteExperiences).length) {
                websiteExperiences.forEach(function(experience) {
                    var resultHtml = createSearchResult(experience.title, experience.path);
                    websiteExperienceResults.append(resultHtml);
                    experienceResultsCont.find('.website-result').show();
                });
                var thisBrand = getBrand(websiteExperiences[0].path);
                websiteExperienceResults.prev().find('.trending-search-text').text(thisBrand + " Experiences");
            }

            var otherExpereincesGrouped = brandWiseSplitOtherHotels(otherExperiences);

            if (Object.keys(otherExperiences).length) {
                experienceResultsCont.find('.others-result').remove();
                otherExpereincesGrouped.forEach(function(group) {
                    var brandName = Object.keys(group)[0];
                    var brandArray = group[brandName];
                    otherExperienceResults.append('<p class="explore-heading others-result"><img class="destination-hotel-icon" src="/content/dam/tajhotels/icons/style-icons/location.svg" alt="Location icon">' +
                        '<span class="trending-explore-taj-text trending-search-text">' + brandName + ' Experiences</span></p>');
                    brandArray.forEach(function(experience) {
                        var resultHtml = createSearchResult(experience.title, experience.path);
                        otherExperienceResults.append(resultHtml);
                        experienceResultsCont.find('.others-result').show();
                    });
                });
            }
            if (Object.keys(websiteExperiences).length == 0) {
                experienceResultsCont.find('.website-result').hide();
            }
            if (Object.keys(otherExperiences).length == 0) {
                experienceResultsCont.find('.others-result').hide();
            }
        }
    }

    function addHolidaySearchResults(holidays) {
        if (Object.keys(holidays).length) {
            holidays.forEach(function(holidays) {
                if (holidays.title != null) {
                    var resultHtml = createSearchResult(holidays.title, holidays.path);
                    holidayResults.append(resultHtml);
                }
            });
        }
    }

    function addHolidayHotelSearchResults(holidayHotel) {
        if (Object.keys(holidayHotel).length) {
            holidayHotel.forEach(function(holidayHotel) {
                var resultHtml = createSearchResult(holidayHotel.title, holidayHotel.path);
                holidayHotelResults.append(resultHtml);
            });
        }
    }

    function isDestinationsResultAvailable() {
        if (destResults.children().length > 0) {
            return true;
        } else {
            return false;
        }
    }

    function createSearchResult(title, path) {
        /*if(path.startsWith('/en-in/ginger/')) {
            var authCodeLocal = localStorage.getItem("authCode");
            var codeVerifierLocal = localStorage.getItem("codeVerifier");
            path = path + "?authCode=" +  authCodeLocal + "&codeVerifier=" + codeVerifierLocal;
        }*/
        if (path.startsWith('/en-in/ginger/')) {
            path = "/en-in/swt/?redirectUrl=" + path;
        }
        var redirectElem = '<a class="individual-trends" href="' + path + '">' + title + '</a>';
        if (sessionStorage.getItem("source") && sessionStorage.getItem("source") != 'null') {
            var redirectUrl = $(redirectElem).attr('href');
            redirectUrl = redirectUrl + "?source=" + sessionStorage.getItem("source");
            $(redirectElem).attr('href', redirectUrl);
        }
        return redirectElem;
    }

    if ($(document).width() > 425) {
        if ($('.home-page-layout, .holidays-homepage-layout').length > 0) {
            var stickyOffset = $('#home-search.search-container .search-and-suggestions-wrapper').offset() ? $(
                '#home-search.search-container .search-and-suggestions-wrapper').offset().top : null;

            $(window).scroll(
                function() {
                    var sticky = $('#home-search.search-container .search-and-suggestions-wrapper'),
                        scroll = $(window)
                        .scrollTop();

                    if (scroll >= stickyOffset)
                        sticky.addClass('mr-stickyScroll');
                    else
                        sticky.removeClass('mr-stickyScroll');
                });
        }
    }

    hotelTab.on('click', function() {
        hotelResultCont.show()
        if (isDestinationsResultAvailable()) {
            destResultCont.show();
        }
        if (ifHolidayPage == true) {
            hotelTabOnHoliday();
        }
        restaurantResultCont.hide()
        experienceResultsCont.hide()
        activateTab($(this))
    });

    restaurantsTab.on('click', function() {
        hotelResultCont.hide()
        destResultCont.hide()
        experienceResultsCont.hide()
        restaurantResultCont.show()
        activateTab($(this))
    });

    experiencesTab.on('click', function() {
        hotelResultCont.hide()
        destResultCont.hide()
        restaurantResultCont.hide()
        experienceResultsCont.show()
        activateTab($(this))
    });

    // for holiday
    holidayTab.on('click', function() {
        hotelResultCont.hide();
        destResultCont.hide();
        restaurantResultCont.hide();
        holidayResultsCont.show();
        activateTab($(this));

    });

    // on holiday page -on click on hotel tab
    function hotelTabOnHoliday() {
        holidayHotelResultsCont.hide();
        holidayResultsCont.hide();

    }

    /*
     * Search results will show a tab incase there are results across hotels , restaurants and experiences The logic
     * below dynamically creates the tabs based on the result. incase all three results are available all the tabs are
     * shown and the hotel tab is active by default Incase only two results are available only two tabs are shown . The
     * order of activation being hotel and then restaurants.If only one result set is available no tabs are displayed
     */
    function initiateTabs(res) {
        removeAllTabs();
        if (Object.keys(res.hotels.website).length || Object.keys(res.hotels.others).length) {
            if (Object.keys(res.restaurants.website).length || Object.keys(res.restaurants.others).length) {
                hotelTab.removeClass("display-none");
                restaurantsTab.removeClass("display-none");

            }
            if (Object.keys(res.experiences.website).length || Object.keys(res.experiences.others).length) {
                hotelTab.removeClass("display-none");
                experiencesTab.removeClass("display-none");

            }
            // show destination only if exists along with hotel
            if (Object.keys(res.destinations).length) {
                destResultCont.show();
            }
            hotelTab.click()
        } else if (Object.keys(res.restaurants.website).length || Object.keys(res.restaurants.others).length) {
            if (Object.keys(res.experiences.website).length || Object.keys(res.experiences.others).length) {
                restaurantsTab.removeClass("display-none");
                experiencesTab.removeClass("display-none");
            }
            restaurantsTab.click()
        } else if (Object.keys(res.experiences.website).length || Object.keys(res.experiences.others).length) {
            experiencesTab.click()
        }
    }

    function removeAllTabs() {
        tabCont.find("a").addClass("display-none");
    }

    function activateTab(tab) {
        tabCont.find("a").removeClass("selected");
        tab.addClass("selected");
    }

});
$('.searchbar-input').val('');
var initiateNavPreloginSearch = function() {
    var navPreloginSearch = $('.header-nav-prelogin-search');
    $('.gb-search-con').click(function() {
        navPreloginSearch.show().promise().then(function() {
            navPreloginSearch.find('.searchbar-input').click();
        });
    });
    $('.nav-prelogin-close, .closeIconImg ,.cm-overlay').click(function() {
        navPreloginSearch.hide();
    });
}

initiateNavPreloginSearch();

$(document).ready(function() {
    var url = window.location.href;
    var pageName = '';

    if (url.indexOf('dining') != -1) {
        pageName = 'Dining';
    } else if (url.indexOf('about') != -1) {
        pageName = 'About';
    } else if (url.indexOf('experiences') != -1) {
        pageName = 'Experiences';
    } else {
        pageName = 'Hotels';
    }

    $('nav .tab-child-container').each(function(i) {
        $(this).removeClass("selected");
    });

    $('nav .tab-child-container').each(function(i) {
        if ($(this).html() === pageName) {
            $(this).addClass("selected");
        }
    });
});
$(document).ready(function() {
    //On page load functions only.
    try {
        $(".popular-destination-wrap").infiniteScrollLazyLoad(true);
    } catch (error) {
        console.error(error);
    }
});
$(document).ready(function() {
    $(".title-descriptor").each(function(index) {
        var showMore = $($(".title-descriptor")[index]).find('#showMoreEnabled').val();
        if (showMore == "true") {
            var charLimit = $($(".title-descriptor")[index]).find('#hotelLongDescCharLimit').val();
            if (!charLimit || charLimit == "") {
                charLimit = 200;
            } else {
                charLimit = parseInt(charLimit);
            }

            $($(".title-descriptor")[index]).find('.description-text').cmToggleText({
                charLimit: charLimit,
                showVal: "Show More",
                hideVal: "Show Less",
            });
        }

    });
});




/*document.addEventListener( 'DOMContentLoaded', function() {
	
	$('.placeholder-header-title').each(function() {
       $(this).cmToggleText({
           charLimit: 500,
       })
   });
	
});
*/
var charLimitVar;

$(document).ready(function() {
    if (window.innerWidth < 768) {
        charLimitVar = 90;
    } else {
        charLimitVar = 150;
    }
    $('.offers-card-title').each(function() {
        $(this).cmToggleText({
            charLimit: 25,
            showVal: ""
        });
    });
    $('.offers-card-description').each(function() {
        $(this).cmToggleText({
            charLimit: charLimitVar
        });
    });
});
var renditionSuffix = '/jcr:content/renditions/cq5dam.web.756.756.'

$(document).ready(function() {
    if ($('.trending-offers-new-design').length == 0) {
        return false;
    }
    $('#timelineId li:first').addClass('active-circle-selection');
    $('#timelineId li:first div:first').addClass('active-selection');
    $('.offers-images .image-wrapper').attr('src', $(".offers-list-item:first").attr('data-imgPath') +
        getRenditionImageExtension($(".offers-list-item:first").attr('data-imgPath')));
    $('.offers-details-content .offers-card-title').text($(".offers-list-item:first").attr('data-title'));
    $('.offers-details-content .view-details-btn a').attr('href', $(".offers-list-item:first").attr('data-url'));
    $('.offers-details-content .offers-card-description').text($(".offers-list-item:first").attr('data-desc'));
    $('.offers-details-content .offer-validity-text').text($(".offers-list-item:first").attr('data-validity'));
    $('.offers-details-container').addClass('active');
    $('.offers-images').addClass('active');

    setTimeout(function() {
        var width = $(window).width();
        var marginContainer = $('.content-wrapper').css('margin-left');
        $('.trending-offers-new-design .offers-and-deals-wrap.mobile-display-none').css('margin-left', '-' + marginContainer);
        $('.trending-offers-new-design .trending-offers-wrapper-desktop').css('width', width + 'px');
    }, 400);
});

var header = document.getElementById("timelineId");
var offerSelector = header ? header.getElementsByClassName("offers-list-item") : [];

for (var i = 0; i < offerSelector.length; i++) {
    offerSelector[i].addEventListener("click", function() {

        var currentCircle = document.getElementsByClassName("active-circle-selection");
        currentCircle[0].className = currentCircle[0].className.replace(" active-circle-selection", "");

        var currentText = document.getElementsByClassName("active-selection");
        currentText[0].className = currentText[0].className.replace(" active-selection", "");

        this.className += " active-selection";
        this.className += " active-circle-selection";
        $('.offers-details-container').removeClass('active');
        $('.offers-images').removeClass('active');
        $('.offers-details-container').hide();
        $('.offers-images').hide();
        $('.offers-details-content .offers-card-title').text($(this).attr('data-title'));
        $('.offers-details-content .offers-card-description').text($(this).attr('data-desc'));
        if ($(this).attr('data-title') == "Festivals of India") {
            $('.offers-images .image-wrapper').css('object-fit', 'fill');
        }
        if ($(this).attr('data-roundtheyear') == "true") {
            $('.offers-details-content .offer-validity-text').text("Round the year");
        } else {
            var dataValidity = $(this).attr('data-validity');
            if (dataValidity.startsWith("Valid till")) {
                var splits = dataValidity.split(" ");
                var dataValidityDate = splits[2];
                dataValidityDate = dataValidityDate + "<sup class='text-lowercase'>" + ordinal(dataValidityDate) + "</sup>";
                splits[2] = dataValidityDate;
                dataValidity = splits.join(" ");
            }
            $('.offers-details-content .offer-validity-text').html(dataValidity);
        }
        $('.offers-images .image-wrapper').attr('src', $(this).attr('data-imgPath') + getRenditionImageExtension($(this).attr('data-imgPath')));
        $('.view-details-btn a').attr('href', $(this).attr('data-url'));
        $('.offers-details-container').show();
        $('.offers-images').show();
        $('.offers-details-container').addClass('active');
        $('.offers-images').addClass('active');

    });
}

function getRenditionImageExtension(imgPath) {
    var extension = imgPath.trim().split('.').pop().toLowerCase();
    extension = extension != 'png' ? 'jpeg' : 'png';
    return renditionSuffix + extension;
}

function ordinal(n) {
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

$(document).ready(function() {
    $('.offers-card-title').each(function() {
        $(this).cmToggleText({
            charLimit: 25,
            showVal: ""
        });
    });
    $('.offers-card-description').each(function() {
        $(this).cmToggleText({
            charLimit: 90
        });
    });
});
$(document).ready(function() {
    $('.offers-card-title').each(function() {
        $(this).cmToggleText({
            charLimit: 25,
            showVal: ""
        });
    });
    $('.offers-card-description').each(function() {
        $(this).cmToggleText({
            charLimit: 90
        });
    });
});

function onOfferSelection(navPath, offerRateCode, offerRoundTheYear, offerTitle, noOfNights, offerStartDate,
    offerEndDate, comparableOfferRateCode, offerType) {
    try {
        // test
        // offer details functionality
        var ROOMS_PATH = "";
        var nights = '';
        var startsFrom = '';
        var endsOn = '';
        var today = moment().format('MMM Do YY');
        var tomorrow = '';
        var dayAfterTomorrow = '';
        var hotelPath = $("[data-hotel-path]").data("hotel-path");

        if ($('.cm-page-container').hasClass('ama-theme')) {
            ROOMS_PATH = "accommodations.html";
        } else {
            ROOMS_PATH = "rooms-and-suites.html";
        }

        if (noOfNights && noOfNights != "" && noOfNights != '0') {
            nights = noOfNights;
        } else {
            nights = 1;
        }
        // override default t+15 booking date for custom start and end dates and adding nights
        if (offerRateCode && !offerRoundTheYear) {
            if (comparableOfferRateCode) {
                offerRateCode = offerRateCode + ',' + comparableOfferRateCode;
            }
            if (offerStartDate && offerEndDate) {
                startsFrom = moment(offerStartDate).format('MMM Do YY');
                endsOn = moment(offerEndDate).format('MMM Do YY');
                if (moment(startsFrom, 'MMM Do YY').isSameOrBefore(moment(today, 'MMM Do YY')) &&
                    moment(today, 'MMM Do YY').isSameOrBefore(moment(endsOn, 'MMM Do YY'))) {
                    tomorrow = moment().add(1, 'days').format('D/MM/YYYY');
                    dayAfterTomorrow = moment(tomorrow, "D/MM/YYYY").add(parseInt(nights), 'days').format("D/MM/YYYY");
                }
            } else if (!offerStartDate && offerEndDate) {
                endsOn = moment(offerEndDate).format('MMM Do YY');
                if (moment(today, 'MMM Do YY').isSameOrBefore(moment(endsOn, 'MMM Do YY'))) {
                    tomorrow = moment().add(1, 'days').format('D/MM/YYYY');
                    dayAfterTomorrow = moment(tomorrow, "D/MM/YYYY").add(parseInt(nights), 'days').format("D/MM/YYYY");
                }

                // default t+1 booking dates and adding nights
            } else {
                tomorrow = moment().add(1, 'days').format('D/MM/YYYY');
                dayAfterTomorrow = moment(tomorrow, "D/MM/YYYY").add(parseInt(nights), 'days').format('D/MM/YYYY');
            }

            // round the year offer with t+1 dates and nights
        } else {
            tomorrow = moment().add(1, 'days').format('D/MM/YYYY');
            dayAfterTomorrow = moment(tomorrow, "D/MM/YYYY").add(parseInt(nights), 'days').format('D/MM/YYYY');
        }
        if (hotelPath) {
            navPath = hotelPath.replace(".html", "");
            navPath = navPath + ROOMS_PATH;
            navPath = updateQueryString("overrideSessionDates", "true", navPath);
            navPath = updateQueryString("from", tomorrow, navPath);
            navPath = updateQueryString("to", dayAfterTomorrow, navPath);
            navPath = updateQueryString("offerRateCode", offerRateCode, navPath);
            navPath = updateQueryString("offerTitle", offerTitle, navPath);
        }

        // creating the URL for the button
        if (navPath != "" && navPath != null && navPath != undefined) {
            navPath = navPath.replace("//", "/");
        }
        if ((!navPath.includes("http://") && navPath.includes("http:/")) ||
            (!navPath.includes("https://") && navPath.includes("https:/"))) {
            navPath = navPath.replace("http:/", "http://").replace("https:/", "https://");
        }
        if (offerType != undefined && offerType != null && offerType.indexOf("taj-innercircle-special-offer") != -1 && !getUserData()) {
            $('body').trigger('taj:sign-in');
        } else {
            window.location.href = navPath;
        }
    } catch (err) {
        console.error('error caught in function onOfferSelection');
        console.error(err);
    }
}

function onOfferViewDetailsSelection(offerDetailsPath, offerRateCode, offerTitle, noOfNights, startsFrom,
    comparableOfferRateCode, offerType) {
    try {
        // code replaced to navigate to rooms page instead of view details
        if (offerRateCode) {
            navigateToRooms(offerDetailsPath, offerRateCode, offerTitle, noOfNights, startsFrom,
                comparableOfferRateCode);
        } else {

            window.location.href = offerDetailsPath;

        }
    } catch (err) {
        console.error('error caught in function onOfferViewDetailsSelection');
        console.error(err);
    }
}

function navigateToRooms(offerDetailsPath, offerRateCode, offerTitle, noOfNights, startsFrom, comparableOfferRateCode) {
    try {
        var hotelPath = offerDetailsPath.split("offers-and-promotions")[0];
        var ROOMS_PATH = "rooms-and-suites.html";
        var navPath = hotelPath.replace(".html", "");
        navPath = navPath + ROOMS_PATH;
        if (navPath != "" && navPath != null) {
            navPath = navPath.replace("//", "/");
        }
        if (offerRateCode) {
            if (comparableOfferRateCode) {
                offerRateCode = offerRateCode + ',' + comparableOfferRateCode;
            }
            navPath = updateQueryString("offerRateCode", offerRateCode, navPath);
            navPath = updateQueryString("offerTitle", offerTitle, navPath);
        }
        navPath = navPath.replace("//", "/");
        if ((!navPath.includes("http://") && navPath.includes("http:/")) ||
            (!navPath.includes("https://") && navPath.includes("https:/"))) {
            navPath = navPath.replace("http:/", "http://").replace("https:/", "https://");
        }
        // console.log(navPath)
        window.location.href = navPath;
    } catch (err) {
        console.error('error caught in function navigateToRooms');
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', function() {

    $('.description-text-brand p').each(function() {
        $(this).cmToggleText({
            charLimit: 150,
        })
    });

});
window.addEventListener('load', function() {

    $('.description-text-brand p').each(function() {
        $(this).cmToggleText({
            charLimit: 150,
        })
    });

});

function loadBrandPage(obj) {
    var parent = $(obj).data("url-id");
    window.location.href = parent;
}

$(document).ready(function() {
    //On page load functions only.
    try {
        $(".months-hotels-container").infiniteScrollLazyLoad(true);
    } catch (error) {
        console.error(error);
    }

    var mobHorizontalScroll = $('#mobCarouselButton').val();
    if (mobHorizontalScroll == 'true' && navigator.userAgent.match(/Mobi/)) {
        $('.happenings-carousel .row').removeClass('row');
        $('.happenings-carousel').customSlide(1);
    } else if (mobHorizontalScroll == 'true') {
        $('.happenings-carousel .row').removeClass('row');
        $('.happenings-carousel .monthly-event-card').removeClass('col-md-6 col-xs-12');
        $('.happenings-carousel').customSlide(2);
    }
});

function popUpIhcl(elem) {

    var presentScroll = $(window).scrollTop();



    var thisLightBox = $(elem).closest('.experiences-container').next().css('display', 'block')
        .addClass('active-popUp');
    $(".cm-page-container").addClass('prevent-page-scroll');
    $('.the-page-carousel').css('-webkit-overflow-scrolling', 'unset');



    // thisLightBox.find('.cm-local-details-container')
    // $(elem).closest('.experiences-container').next().css('display', 'block');

    /*
     * var parent = $(obj).data("spa-id"); $('#'+parent).css('display', 'block');
     */

    // $('#' + parent).children
    // $('.light-popup').show();
    /*
     * $( '.button-view-details' ).click( function() { $( '.light-popup' ).show();
     *  } );
     */
    $(document).keydown(function(e) {
        if (($('.active-popUp').length) && (e.which === 27)) {
            $('.showMap-close').trigger("click");
        }
    });
    $('.showMap-close').click(function() {

        thisLightBox.hide().removeClass('active-popUp');
        $(".cm-page-container").removeClass('prevent-page-scroll');
        $('.the-page-carousel').css('-webkit-overflow-scrolling', 'touch');
        $(window).scrollTop(presentScroll);
    })

}

$(document).ready(function() {
    var mobHorizontalScrollProfile = $('#mobCarouselButtonProfileList').val();
    if (mobHorizontalScrollProfile == 'true') {
        $('.horicarouselwrapper .ihcl-leadership-wrap').removeClass('row');
        $('.horicarouselwrapper .ihcl-leadership-wrap .offers-page-card-component').removeClass('col-lg-4 col-md-6 col-12');
        $('.horicarouselwrapper .offers-page-card-component').removeClass('cm-seleqtions');
        if (navigator.userAgent.match(/Mobi/)) {
            setTimeout(function() {
                $('.horicarouselwrapper .jiva-spa-show-more').trigger('click').hide();
                $('.horicarouselwrapper .executive-leader-profile-card-carousel-wrp').customSlide(1);
            }, 500);
        } else {
            setTimeout(function() {
                $('.horicarouselwrapper .jiva-spa-show-more').trigger('click').hide();
                $('.horicarouselwrapper .executive-leader-profile-card-carousel-wrp').customSlide(3);
            }, 500);
        }

        $('.horicarouselwrapper .offers-page-card-component').css('padding', '0px');
        $('.horicarouselwrapper .cm-card-showmore-spacing:nth-child(3n-2)').attr('style', 'padding-right:0px !important');
        $('.horicarouselwrapper .cm-card-showmore-spacing:nth-child(3n)').attr('style', 'padding-left:0px !important');

    }
});

// #
// sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYXJrdXAvY29tcG9uZW50cy9paGNsLWxpZ2h0LXBvcHVwL2loY2wtbGlnaHQtcG9wdXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gcG9wVXBJaGNsKCkge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJCggJy5idXR0b24tdmlldy1kZXRhaWxzJyApLmNsaWNrKCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCggJy5saWdodC1wb3B1cCcgKS5zaG93KCk7XHJcbiAgICAgICAgICAgICQoICcubGlnaHQtcG9wdXAnICkuc2hvdygpO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgJCggJy5zaG93TWFwLWNsb3NlJyApLmNsaWNrKCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCggJy5saWdodC1wb3B1cCcgKS5oaWRlKCk7XHJcbiAgICAgICAgICAgICQoICcubGlnaHQtcG9wdXAnICkuaGlkZSgpO1xyXG4gICAgICAgIH0gKVxyXG5cclxuICAgIH0gKTtcclxufSJdLCJmaWxlIjoibWFya3VwL2NvbXBvbmVudHMvaWhjbC1saWdodC1wb3B1cC9paGNsLWxpZ2h0LXBvcHVwLmpzIn0=


$(document).ready(function() {
    $('.mr-contact-us-products-container').customSlide(3);
});


function popUpIhclTaj(elem) {





    var presentScroll = $(window).scrollTop();
    var thisLightBox = $(elem).closest('.popularDest-containers').next().css('display', 'block')
        .addClass('active-popUp');
    $(".cm-page-container").addClass('prevent-page-scroll');
    $('.the-page-carousel').css('-webkit-overflow-scrolling', 'unset');


    $(document).keydown(function(e) {
        if (($('.active-popUp').length) && (e.which === 27)) {
            $('.showMap-close').trigger("click");
        }
    });
    $('.showMap-close').click(function() {

        thisLightBox.hide().removeClass('active-popUp');
        $(".cm-page-container").removeClass('prevent-page-scroll');
        $('.the-page-carousel').css('-webkit-overflow-scrolling', 'touch');
        $(window).scrollTop(presentScroll);

    })

}
//initializing with default values
var _globalDateOccupancyCombinationString = fetchDateOccupancyAsQueryString();
$(document).ready(function() {
    offerSearchCheckAvailability();
    if (!$(".cm-page-container").hasClass("ama-theme")) {
        if (document.getElementById("shouldInvokeCalendarApi")) {
            var shouldInvokeCalendarApi = document.getElementById("shouldInvokeCalendarApi").value;
            if (shouldInvokeCalendarApi) {
                calendarPricing();
            }
        }
        var bookingOptions = dataCache.session.getData("bookingOptions");
        if (bookingOptions && bookingOptions.hotelId) {
            $('#check-availaility-searchbar-input').attr('data-hotel-id', bookingOptions.hotelId);
            enableCheckAvailabilityCTA();
        }

    }

    if (window.location.pathname.indexOf('ihcl-special-employee-benefits') != -1) {
        var queryPresent = false;

        var myTajREQID = getQueryParameter('reqid');
        var employeeID = getQueryParameter('eid');
        var sebEntitlement = getQueryParameter('sebbalance');
        var salutation = getQueryParameter('salutation');
        var firstName = getQueryParameter('fname');
        var lastName = getQueryParameter('lname');
        var emailID = getQueryParameter('email');
        var mobileNumber = getQueryParameter('mobile');
        var employeeNumber = getQueryParameter('enum');
        var discountRate = getQueryParameter('discount');
        var isTajSats = true;
        isTajSats = getQueryParameter('isTajSats');
        var sebObject;

        if (myTajREQID && myTajREQID != null && employeeID && employeeID != null &&
            sebEntitlement && sebEntitlement != null && salutation && salutation != null &&
            firstName && firstName != null && lastName && lastName != null &&
            emailID && emailID != null && mobileNumber && mobileNumber != null &&
            employeeNumber && employeeNumber != null && discountRate && discountRate != null) {
            queryPresent = true;
            sebObject = {
                sebRedemption: "true",
                myTajREQID: myTajREQID,
                employeeID: employeeID,
                sebEntitlement: sebEntitlement,
                salutation: salutation,
                firstName: firstName,
                lastName: lastName,
                emailID: emailID,
                mobileNumber: mobileNumber,
                employeeNumber: employeeNumber,
                discountRate: discountRate,
                discount: discountRate
            };
            dataCache.session.setData('sebObject', sebObject);
            if (isTajSats == null)
                isTajSats = false;
            else if (isTajSats == "true")
                isTajSats = true;
            else
                isTajSats = false;
            dataCache.session.setData('isTajSats', isTajSats);

        } else {
            window.location.href = "";
        }
        $('.search-submit-btn').click(function(e) {
            var href = e.currentTarget.parentElement.href;
            //alert(href + '&sebObject='+JSON.stringify(sebObject));

            href = href + '&sebObject=' + JSON.stringify(sebObject) + '&isTajSats=' + isTajSats;
            $('#ca-global-re-direct').attr('href', href);
        });

    }

    if (window.location.pathname.indexOf('4dtravel') != -1) {
        $('.ihclButton button').click(function(e) {
            var rateCode = document.getElementById("offerCode").innerHTML;
            var fortnightAway = new Date(Date.now() + 12096e5);
            var fromDate = fortnightAway.getDate() + '/' + (fortnightAway.getMonth() + 1) + '/' + fortnightAway.getFullYear();
            var fortnightAway2 = new Date(Date.now() + 12966e5);
            var toDate = fortnightAway2.getDate() + '/' + (fortnightAway2.getMonth() + 1) + '/' + fortnightAway2.getFullYear();
            var href = e.currentTarget.parentElement.href;
            window.location = href + '?overrideSessionDates=true&from=' + fromDate + '&to=' + toDate + '&offerRateCode=' + rateCode;
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });

        var fortnightAway = new Date(Date.now() + 12096e5);
        var fortnightAway2 = new Date(Date.now() + 12966e5);
        var fromDate = fortnightAway.getDate() + '/' + (fortnightAway.getMonth() + 1) + '/' + fortnightAway.getFullYear();
        var toDate = fortnightAway2.getDate() + '/' + (fortnightAway2.getMonth() + 1) + '/' + fortnightAway2.getFullYear();
        $('.package-check-in-date input').val(fromDate);
        $('.package-check-out-date input').val(toDate);


        var fromDate = moment().add(1, 'day');
        var toDate = moment().add(2, 'day');
        $('#enquiry-from-date').datepicker('setDate', fromDate['_d']);
        $('#enquiry-to-date').datepicker('setDate', toDate['_d']);

    }


});

function setInitialVal() {
    $('#check-availaility-searchbar-input').val("");
    var selectBoxIt2 = $('#packageNoOfRooms').data("selectBoxIt");
    if (selectBoxIt2) {
        selectBoxIt2.selectOption('1');
    }
    disableCheckAvailabilityCTA();
}

function offerSearchCheckAvailability() {
    var redirectPath = "";
    var hotelId = "";

    var checkNoOfNights = $('#checkNoOfNights').val();
    var noOfNights = $('#noOfNights').val();
    var maxNoOfNights = $('#maxNoOfNights').val();
    var fromDateTimestamp = 0;
    var toDateTimestamp = 0;


    PackageSearchDropdownsInit();
    setInitialVal();

    var isAuthorable = $('#isAuthorable').val();
    var tommorow = new Date();
    var dayAfterTommorow = new Date();
    var calStartDate = moment(new Date()).add(0, 'days')['_d'];
    var calStartToDate = moment(new Date()).add(1, 'days')['_d'];
    if (isAuthorable != 'true') {
        tommorow = moment(new Date()).add(1, 'days')['_d'];

        fromDateTimestamp = new Date(tommorow).getTime();
        // check for the min no of nights criteria
        if (checkNoOfNights && checkNoOfNights == 'true') {
            if (+noOfNights) {
                dayAfterTommorow = moment(new Date()).add(+noOfNights + 1, 'days')['_d'];
            } else {
                dayAfterTommorow = moment(new Date()).add(2, 'days')['_d'];
            }
        } else {
            dayAfterTommorow = moment(new Date()).add(2, 'days')['_d'];
        }
        toDateTimestamp = new Date(dayAfterTommorow).getTime();

        $('.enquiry-from-value').val(moment(tommorow).format("DD/MM/YYYY"));
        $('.enquiry-to-value').val(moment(dayAfterTommorow).format("DD/MM/YYYY"));
    } else {
        var checkinDateString = $('#checkinDate').val();
        var arr = checkinDateString.split('/');
        tommorow.setDate(arr[0]);
        tommorow.setMonth(arr[1] - 1);
        tommorow.setYear(arr[2]);

        var checkoutDateString = $('#checkoutDate').val();
        var arr2 = checkoutDateString.split('/');
        dayAfterTommorow.setDate(arr2[0]);
        dayAfterTommorow.setMonth(arr2[1] - 1);
        dayAfterTommorow.setYear(arr2[2]);
        calStartDate = tommorow < calStartDate ? tommorow : calStartDate;
        calStartToDate = dayAfterTommorow < calStartToDate ? dayAfterTommorow : calStartToDate;
        $('.enquiry-from-value').val(moment(tommorow).format("DD/MM/YYYY"));
        $('.enquiry-to-value').val(moment(dayAfterTommorow).format("DD/MM/YYYY"));

    }
    $('#enquiry-from-date').datepicker({
        startDate: calStartDate
    }).on('changeDate', function(element) {
        if ($(this).hasClass('visible')) {
            fromDateTimestamp = element.date.valueOf();
            var minDate = (new Date(element.date.valueOf()));
            var selectedDate = moment(minDate).format("DD/MM/YYYY");
            var nextDate = moment(minDate).add(1, 'day');
            $('.enquiry-from-value').val(selectedDate).removeClass('invalid-input');
            $(this).removeClass('visible');
            $('.jiva-spa-date-con').removeClass('jiva-spa-not-valid');
            if ($('#enquiry-from-date').datepicker("getDate") >= $('#enquiry-to-date').datepicker("getDate")) {
                $('#enquiry-to-date').datepicker('setDate', nextDate['_d']);
                $('.enquiry-to-value').val(nextDate.format("DD/MM/YYYY"));
                toDateTimestamp = nextDate._d.getTime();
            }
            handleOfferNoOfNights(checkNoOfNights, noOfNights, maxNoOfNights);
            isSynxisCheck();
        }
    });

    $('#enquiry-from-date').datepicker('setDate', tommorow);

    $('#enquiry-to-date').datepicker({
        startDate: calStartToDate
    }).on('changeDate', function(element) {
        if ($('.jiva-spa-date').hasClass('visible')) {
            toDateTimestamp = element.date.valueOf();
            var minDate = (new Date(element.date.valueOf()));
            var selectedDate = moment(minDate).format("DD/MM/YYYY");
            var prevDate = moment(minDate).subtract(1, 'day');
            $('.enquiry-to-value').val(selectedDate).removeClass('invalid-input');
            $(this).removeClass('visible');
            $('.jiva-spa-date-con').removeClass('jiva-spa-not-valid');
            if ($('#enquiry-to-date').datepicker("getDate") <= $('#enquiry-from-date').datepicker("getDate")) {
                $('#enquiry-from-date').datepicker('setDate', prevDate['_d']);
                $('.enquiry-from-value').val(prevDate.format("DD/MM/YYYY"));
                fromDateTimestamp = prevDate._d.getTime();
            }
            handleOfferNoOfNights(checkNoOfNights, noOfNights, maxNoOfNights);
            isSynxisCheck();
        }
    });
    $('#enquiry-to-date').datepicker('setDate', dayAfterTommorow);

    var validateEnquiryElements = function() {
        $('.package-search-form').find('.sub-form-mandatory').each(function() {
            if ($(this).val() == "") {
                $(this).addClass('invalid-input');
                invalidWarningMessage($(this));
            }
        });
    }
    // Request quote submit handler
    $('.search-submit-btn').off('click').on('click', function() {
        var flag = true;
        flag = validatePromoCouponCode();
        if (!flag) {
            return false
        };
        var agencyCodeFlag = true;
        agencyCodeFlag = validateAgencyCode();
        if (!agencyCodeFlag) {
            return false
        };

        var isValidNights = true;
        if (window.location.pathname.indexOf('ihcl-special-employee-benefits') != -1) {
            var isValidNights = verifySebNights();
        }
        if (isValidNights) {
            // updateBookingDetailsInStorage();
            validateEnquiryElements();
            var invalidCheck = $('.package-search-form .invalid-input');
            if (invalidCheck.length) {
                invalidCheck.first().focus();
                return false;
            } else {
                updateGlobalDateOccupancy();
                setCheckAvailaibilityRoomsPath();

            }
        }

        //********************This should be the LAST PART OF THIS FUNCTION******************

        if ($('#check-availaility-voucher-code-input').length) {
            if ($('#check-availaility-voucher-code-input').val().length > 0 && $('#check-availaility-voucher-pin-input').val().length > 0) {
                validateVoucherwithQC();
                return false;
            }
        } else {
            return true;
        }

    });

    function validateVoucherwithQC() {
        var vCode = $('#check-availaility-voucher-code-input').val();
        var vPin = $('#check-availaility-voucher-pin-input').val();
        var requestString = "cardNumber=" + vCode + "&cardPin=" + vPin;
        $('body').showLoader();
        $.ajax({
            method: "POST",
            cache: false,
            url: "/bin/buy-prepaid-epicure/balance",
            dataType: 'json',
            data: requestString
        }).done(function(response) {
            $('body').hideLoader();
            if (response.status == false) {
                warningBox({
                    title: "Your voucher code or PIN does not exist or has been redeemed."
                });
                return false;
            } else {
                if (response.message == "Transaction successful.") {
                    var buyPrepaidEpicure = response.buyPrepaidEpicure;
                    buyPrepaidEpicure = JSON.parse(buyPrepaidEpicure);
                    if (buyPrepaidEpicure.amount == "0.0") {
                        warningBox({
                            title: "Voucher number entered is already used and cannot be processed further."
                        });
                        return false;
                    } else {
                        if (JSON.parse(response.buyPrepaidEpicure).cardType != $('#cardType').val()) {
                            warningBox({
                                title: "Card Sequence does not match."
                            });
                            return false;
                        } else {
                            appendQCVoucherDetailsAndRedirect();
                            return true;
                        }
                    }
                }
            }
        }).fail(function() {
            $('body').hideLoader();
            if (response.status == 504) {
                setWarningInDom("TIMEOUT ERROR OCCURED WHILE VALIDATING VOUCHER");
            } else {
                setWarningInDom("VOUCHER VALIDATION FAILED");
            }
            return false;
        });
    }

    function validatePromoCouponCode() {
        var promocodeinput = $('#check-availaility-promo-code-input').length > 0 ? true : false;
        var couponcodeinput = $('#check-availaility-coupon-code-input').length > 0 ? true : false;
        var vouchercodeinput = $('#check-availaility-voucher-code-input').length > 0 ? true : false;
        var voucherpininput = $('#check-availaility-voucher-pin-input').length > 0 ? true : false;
        var ratecodeInput = $('#check-availaility-rate-code-input').length > 0 ? true : false;
        var promocodemandate = $('#promoCodeMandatory').val();
        var couponcodemandate = $('#couponCodeMandatory').val();
        var flag = true;
        if (promocodeinput && promocodemandate == "true" && $('#check-availaility-promo-code-input').val().length == 0) {
            if (ratecodeInput && $('#check-availaility-rate-code-input').val().length == 0) {
                $('.promo .sub-form-input-warning').html('Please enter either the promo or rate code').show();
                flag = false;
                $('#check-availaility-rate-code-input, #check-availaility-promo-code-input').on('keyup', function() {
                    if ($('#check-availaility-promo-code-input').val().length > 0 || $('#check-availaility-rate-code-input').val().length > 0) {
                        $('.promo .sub-form-input-warning').html('').hide();
                    }
                });
            } else {
                $('.promo .sub-form-input-warning').html('Please enter the promo code').show();
                flag = false;
                $('#check-availaility-promo-code-input').on('keyup', function() {
                    if ($('#check-availaility-promo-code-input').val().length > 0) {
                        $('.promo .sub-form-input-warning').html('').hide();
                    }
                });
            }
        } else {
            $('.promo .sub-form-input-warning').html('').hide();
            flag = true;
        }
        if (couponcodeinput && couponcodemandate == "true" && $('#check-availaility-coupon-code-input').val().length == 0) {
            $('.coupon .sub-form-input-warning').html('Please enter the coupon code').show();
            flag = false;
            $('#check-availaility-coupon-code-input').on('keyup', function() {
                if ($('#check-availaility-coupon-code-input').val().length > 0) {
                    $('.coupon .sub-form-input-warning').html('').hide();
                }
            })
        } else {
            $('.coupon .sub-form-input-warning').html('').hide();
        }
        if (vouchercodeinput && $('#check-availaility-voucher-code-input').val().length == 0) {
            $('.voucher-code .sub-form-input-warning').html('Please enter the voucher code').show();
            flag = false;
            $('#check-availaility-voucher-code-input').on('keyup', function() {
                if ($('#check-availaility-voucher-code-input').val().length > 0) {
                    $('.voucher-code .sub-form-input-warning').html('').hide();
                }
            })
        } else {
            $('.voucher-code .sub-form-input-warning').html('').hide();
        }
        if (voucherpininput && $('#check-availaility-voucher-pin-input').val().length == 0) {
            $('.voucher-pin .sub-form-input-warning').html('Please enter the voucher pin').show();
            flag = false;
            $('#check-availaility-voucher-pin-input').on('keyup', function() {
                if ($('#check-availaility-voucher-pin-input').val().length > 0) {
                    $('.voucher-pin .sub-form-input-warning').html('').hide();
                }
            })
        } else {
            $('.voucher-pin .sub-form-input-warning').html('').hide();
        }

        return flag;
    }

    function validateAgencyCode() {
        var agencycodeinput = $('#check-availaility-agency-id-input').length > 0 ? true : false;
        var agencycodemandate = $('#agencyCodeMandatory').val();
        var flag = true;
        if (agencycodeinput && agencycodemandate == "true" && $('#check-availaility-agency-id-input').val().length == 0) {
            $('.agency-code .sub-form-input-warning').html('Please enter a valid agency code').show();
            flag = false;
            $('#check-availaility-agency-id-input').on('keyup', function() {
                if ($('#check-availaility-agency-id-input').val().length > 0) {
                    $('.agency-code .sub-form-input-warning').html('').hide();
                }
            });
        } else {
            $('.agency-code .sub-form-input-warning').html('').hide();
        }
        return flag;
    }

    $(".jiva-spa-search-list li").click(function() {
        $(this).closest('.jiva-spa-hotel-input').find('.jiva-spa-mand').removeClass("invalid-input");
    });

    $(document).click(function() {
        $(".jiva-spa-date").removeClass("visible");
    });

    $(".jiva-spa-date-section").click(function(e) {
        e.stopPropagation();
    });

    $('.jiva-spa-date-con').click(function(e) {
        e.stopPropagation();
        $(".jiva-spa-date").removeClass("visible");
        $(this).next(".jiva-spa-date").addClass("visible");
    })

    var checkAvailabilitySearch = new searchComponent('#check-availaility-searchbar-input',
        '#check-availaility-search-results', '#check-availaility-search-results-destinations',
        '.search-destination', noResultsCallback);

    function noResultsCallback() {
        // toggleCheckAvailable("#", false);
        $('#ca-global-re-direct').attr('href', "#");
    }

    function PackageSearchDropdownsInit() {
        var $PackageRooms = $('#packageNoOfRooms');
        $PackageRooms.selectBoxIt().change(function() {
            var roomsIndex = parseInt($(this).val());
            $('.package-no-of-adults').hide();
            $('.package-no-of-adults:lt(' + roomsIndex + ')').show();
            $('.package-no-of-children').hide();
            $('.package-no-of-children:lt(' + roomsIndex + ')').show();

            isSynxisCheck();
        });
        $('.package-occupancy-count-row select').each(function() {
            $(this).selectBoxIt().change(function() {
                isSynxisCheck();
            });
        });
    }

    function isSynxisCheck() {
        var isSynxis = $("#isSynxis").text().trim();
        if (isSynxis == 'true') {
            updateRedirectPath();
            return true;
        }
    }

    $('#check-availaility-promo-code-input').on('keyup', function() {
        updateRedirectPath();
    });

    $('#check-availaility-rate-code-input').on('keyup', function() {
        updateRedirectPath();
    });

    $('#check-availaility-coupon-code-input').on('keyup', function() {
        updateRedirectPath();
    });
    $('#check-availaility-agency-id-input').on('keyup', function() {
        updateRedirectPath();
    });

    $('#check-availaility-agency-id-input').on('keyup', function() {
        updateRedirectPath();
    });


    $('#check-availaility-search-results').on("click", '.search-result-item', function() {
        enableCheckAvailabilityCTA();
        var offerCodeFromId = $('#offerCode').text().trim();
        var codelabel = $('#codelabel').text().trim();

        redirectPath = $(this).attr('data-redirect-path');
        hotelId = $(this).attr('data-hotel-id').trim();
        if (!isSynxisCheck()) {
            if (offerCodeFromId) {
                var rateTab = "";
                if (codelabel === "promoCode") {
                    rateTab = "&rateTab=PROMOCODE";
                }
                var offerRateCodeAttr = $(".offers-room-container").data("offer-rate-code");
                var showTabs = "";
                if (offerRateCodeAttr && ((typeof offerRateCodeAttr) == 'string') && offerRateCodeAttr.indexOf("&showTabs") != -1) {
                    showTabs = offerRateCodeAttr.substr(offerRateCodeAttr.indexOf("&showTabs"));
                }
                redirectPath = redirectPath + "?" + codelabel + "=" + offerCodeFromId + rateTab + showTabs;

                if ($('#voucherRedemption').val()) {
                    redirectPath = redirectPath + "&voucherRedemption=" + $('#voucherRedemption').val();
                }

                if (hotelId == "99999" && redirectPath.substr(0, redirectPath.indexOf("?")).indexOf('/en-in/ginger/') != -1) {
                    redirectPathQueryParams = redirectPath.substr(redirectPath.indexOf("?"));
                    if (redirectPath.indexOf("/accommodations/") != -1) {
                        redirectPath = redirectPath.substr(0, redirectPath.indexOf("/accommodations/") + 1) + redirectPathQueryParams;
                    } else if (redirectPath.indexOf("/rooms-and-suites/") != -1) {
                        redirectPath = redirectPath.substr(0, redirectPath.indexOf("/rooms-and-suites/") + 1) + redirectPathQueryParams;
                    }
                    redirectPath = "/en-in/swt/?redirectUrl=" + redirectPath;
                }
                let seleqtionsDomainURL_1 = "https://www.seleqtionshotels.com";
                let vivantaDomainURL_1 = "https://www.vivantahotels.com";
                let amaDomainURL_1 = "https://www.amastaysandtrails.com";
                let tajDomainURL_1 = "https://www.tajhotels.com";
                if ((localStorage.getItem("access_token") != null && localStorage.getItem("access_token") != undefined) && (redirectPath.startsWith(tajDomainURL_1) || redirectPath.startsWith(seleqtionsDomainURL_1) || redirectPath.startsWith(vivantaDomainURL_1) || redirectPath.startsWith(amaDomainURL_1))) {
                    redirectPath = "/en-in/swt/?redirectUrl=" + redirectPath;
                }

                $('#ca-global-re-direct').attr('href', redirectPath);
            }
        }
        $('#check-availaility-search-results').css("display", "none");
        moment().add(1, 'day');
        var fromDate = moment().add(1, 'day');
        if (noOfNights != null && checkNoOfNights && checkNoOfNights == 'true') {

            var toDate = moment().add(1 + (+$("#noOfNights").val()), 'day');
        } else {
            var toDate = moment().add(2, 'day');
        }
        /*$('#enquiry-from-date').datepicker('setDate', fromDate['_d']);
        $('#enquiry-to-date').datepicker('setDate', toDate['_d']);
		$('.check-in-date').val( moment(fromDate).format('DD/MM/YYYY'));
        $('.check-out-date').val( moment(toDate).format('DD/MM/YYYY'));*/
    })

    // function toggleCheckAvailable(redirectPath, redirectStatus) {
    // $('#ca-global-re-direct').attr('href', redirectPath).toggleClass('re-direct-disabled', !redirectStatus);
    // }

    function updateRedirectPath() {
        var checkInDate = moment($('#enquiry-from-date').datepicker("getDate")).format("YYYY-MM-DD");
        var checkOutDate = moment($('#enquiry-to-date').datepicker("getDate")).format("YYYY-MM-DD");
        var numberOfRooms = $('#packageNoOfRooms').val();
        var adults = "";
        var children = "";
        var isPromoCode = $("#promocode").text().trim();
        var promoCode = "";
        if (isPromoCode == 'true') {
            promoCode = $("#check-availaility-promo-code-input").val().trim();
        }
        for (var i = 0; i < numberOfRooms; i++) {
            var noOfAdults = $("#packageNoOfAdults" + (i + 1)).val().trim();
            var noOfChildren = $("#packageNoOfChildren" + (i + 1)).val().trim();
            adults = adults + noOfAdults + ",";
            children = children + noOfChildren + ",";
        }
        adults = adults.substring(0, (adults.length - 1));
        children = children.substring(0, (children.length - 1));
        var adult = adults;
        var arrive = checkInDate;
        var chain = $("#chain").text().trim();
        var child = children;
        var currency = $("#currency").text().trim();
        var depart = checkOutDate;
        var hotel = hotelId;
        var level = $("#level").text().trim();
        var locale = $("#locale").text().trim();
        var rooms = numberOfRooms;
        var sbe_ri = $("#sberi").text().trim();

        var isCorporateAccess = $("#isCorporateAccess").text().trim();
        var preOfferCode = $('#offerCode').text().trim();

        var couponCode = $('#check-availaility-coupon-code-input') && $('#check-availaility-coupon-code-input').val() ?
            $('#check-availaility-coupon-code-input').val().trim() : '';

        var synxisLink = "https://be.synxis.com/";
        redirectPath = synxisLink + "?adult=" + adult + "&arrive=" + arrive + "&chain=" + chain + "&child=" + child +
            "&currency=" + currency + "&depart=" + depart + "&hotel=" + hotel + "&level=" + level + "&locale=" +
            locale + "&rooms=" + rooms + "&sbe_ri=" + sbe_ri;

        if (couponCode) {
            redirectPath += "&coupon=" + couponCode;
        }
        var agencyCode = $('#check-availaility-agency-id-input') && $('#check-availaility-agency-id-input').val() ?
            $('#check-availaility-agency-id-input').val().trim() : '';
        if (agencyCode) {
            redirectPath += "&agencyid=" + agencyCode;
        }

        if (isCorporateAccess == 'true') {
            var rateCode = $("#check-availaility-rate-code-input").val().trim();
            if (rateCode && rateCode != '') {
                redirectPath = redirectPath + "&rate=" + rateCode;
            }
            if (promoCode && promoCode != '') {
                redirectPath = redirectPath + "&promo=" + promoCode;
            }
        } else {
            var paramName = $('#paramName').text().trim();
            if (paramName && paramName != '') {
                if (preOfferCode && preOfferCode != '') {
                    redirectPath = redirectPath + "&" + paramName + "=" + preOfferCode;
                }
            } else {
                if (preOfferCode && preOfferCode != '') {
                    redirectPath = redirectPath + "&promo=" + preOfferCode;
                }
            }
        }

        $('#ca-global-re-direct').attr('href', redirectPath);
        $('#ca-global-re-direct').attr('target', "_blank");
    }

    function updateGlobalDateOccupancy() {
        var checkInDate = moment($('#enquiry-from-date').datepicker("getDate")).format('DD/MM/YYYY');
        var checkOutDate = moment($('#enquiry-to-date').datepicker("getDate")).format('DD/MM/YYYY');
        var numberOfRooms = $('#packageNoOfRooms').val();
        var selectedRoomOptions = [];
        for (var i = 0; i < numberOfRooms; i++) {
            var packageNoOfAdults = $('#packageNoOfAdults' + (i + 1)).val();
            var packageNoOfChildren = $('#packageNoOfChildren' + (i + 1)).val();
            var roomInfo = {
                adults: packageNoOfAdults,
                children: packageNoOfChildren,
            }
            selectedRoomOptions.push(roomInfo);
        }
        var adults = '';
        var children = '';
        if (selectedRoomOptions) {
            selectedRoomOptions.forEach(function(roomObj, index) {
                adults += roomObj.adults + ",";
                children += roomObj.children + ",";
            });
            adults = adults.substring(0, adults.length - 1);
            children = children.substring(0, children.length - 1);
        }
        _globalDateOccupancyCombinationString = "from=" + checkInDate + "&to=" + checkOutDate + "&rooms=" +
            numberOfRooms + "&adults=" + adults + "&children=" + children;

        addCheckAvailabilityFromGlobalOfferDataToDataLayer(checkInDate, checkOutDate, numberOfRooms, adults, children);
    }

    // handle minimum no of nights stay
    function handleOfferNoOfNights(checkNoOfNights, noOfNights, maxNoOfNights) {
        if (checkNoOfNights && checkNoOfNights == 'true') {
            var checkinCheck = moment($('#enquiry-from-date').datepicker("getDate"));
            var checkoutCheck = moment($('#enquiry-to-date').datepicker("getDate"));
            checkinCheck.set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            });


            if (+noOfNights && ((checkoutCheck.diff(checkinCheck, 'days')) < (+noOfNights))) {
                disableCheckAvailabilityCTA();
                handleLessThenNoOfNights(true);
            } else if (+maxNoOfNights && ((checkoutCheck.diff(checkinCheck, 'days')) > (+maxNoOfNights))) {
                disableCheckAvailabilityCTA();
                handleLessThenNoOfNights(true);
            } else {
                if ($('#check-availaility-searchbar-input').val()) {
                    enableCheckAvailabilityCTA();
                }
                handleLessThenNoOfNights(false);
            }
        }
    }

    function handleLessThenNoOfNights(show) {
        var checkinCheck = moment($('#enquiry-from-date').datepicker("getDate"));
        var checkoutCheck = moment($('#enquiry-to-date').datepicker("getDate"));
        checkinCheck.set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
        });

        if ((noOfNights != null) && (show) && ((checkoutCheck.diff(checkinCheck, 'days')) < (+noOfNights))) {
            $('.enquiry-to-value').siblings('.sub-form-input-warning')
                .text('Please select checkout date at least ' + noOfNights + ' days after checkin date').show();
        } else if ((+maxNoOfNights != 0) && (show) && ((checkoutCheck.diff(checkinCheck, 'days')) > (+maxNoOfNights))) {
            $('.enquiry-to-value').siblings('.sub-form-input-warning')
                .text('Please select checkout date not more than ' + maxNoOfNights + ' days after checkin date').show();
        } else {
            $('.enquiry-to-value').siblings('.sub-form-input-warning').text('').hide();
        }
    }

}

function disableCheckAvailabilityCTA() {
    $('.search-submit-btn').prop('disabled', true);
    $('.search-submit-btn').addClass('background-image-none');
}

function enableCheckAvailabilityCTA() {
    $('.search-submit-btn').prop('disabled', false);
    /*$('.search-submit-btn').css('background-image',
            'linear-gradient(to top, rgb(123, 85, 25), rgb(170, 121, 56) 52%, rgb(210, 152, 81))'); */
    $('.search-submit-btn').removeClass('background-image-none');
}

function setCheckAvailaibilityRoomsPath() {
    try {
        var hrefValue = $('#ca-global-re-direct').attr('href');
        if (hrefValue.includes("?")) {
            if (hrefValue.charAt(hrefValue.length - 1) === "?") {
                hrefValue += _globalDateOccupancyCombinationString;
                hrefValue += "&overrideSessionDates=true";
            } else {
                hrefValue += "&" + _globalDateOccupancyCombinationString;
                hrefValue += "&overrideSessionDates=true";
            }
        } else {
            hrefValue += "?" + _globalDateOccupancyCombinationString;
            hrefValue += "&overrideSessionDates=true";
        }

        if (sessionStorage.getItem("source") && sessionStorage.getItem("source") != 'null') {
            hrefValue = hrefValue.includes('?') ? hrefValue + "&source=" + sessionStorage.getItem("source") : hrefValue + "?source=" + sessionStorage.getItem("source");
        }

        if (sessionStorage.getItem("gravtyVoucherSelected") == "true") {
            hrefValue += "&gravtyVoucherSelected=" + sessionStorage.getItem('gravtyVoucherSelected');
            hrefValue += "&gravtyVoucherprivilegeCode=" + sessionStorage.getItem('gravtyVoucherprivilegeCode');
            hrefValue += "&gravtyVoucherbitid=" + sessionStorage.getItem('gravtyVoucherbitid');
            hrefValue += "&gravtyVoucherpin=" + sessionStorage.getItem('gravtyVoucherpin');
            hrefValue += "&gravtyMemberNumber=" + sessionStorage.getItem('gravtyMemberNumber');
            hrefValue += "&memberType=" + sessionStorage.getItem('memberType');
            hrefValue += "&gravtySessionLogin=" + sessionStorage.getItem('gravtySessionLogin');
        }

        $('#ca-global-re-direct').attr('href', hrefValue);
    } catch (error) {
        console.error("Error occured while setting the dateOccupancy Combination as query string");
    }
}


function addCheckAvailabilityFromGlobalOfferDataToDataLayer(checkInDate, checkOutDate, numberOfRooms, adults, children) {
    if (location.pathname.includes('/en-in/offers')) {
        try {
            //updated for global data layer
            var offerDetails = $('.offerdetails');
            var offerName = offerDetails.find('.cm-header-label').text();
            var offerCode = offerDetails.find('.offers-room-container').data('offer-rate-code');
            var offerValidity = offerDetails.find('.validity-container .validity-content').text().trim();
            var offerCategory = offerDetails.find('.offers-room-container').data('offer-category');
            var eventName = offerName.split(' ').join('') + '_Offers&Promotions_Booking_OffersPage_CheckAvailibility';
            var offerObj = {};
            offerObj.checkInDate = checkInDate;
            offerObj.checkOutDate = checkOutDate;
            offerObj.numberOfRooms = numberOfRooms;
            offerObj.adults = adults;
            offerObj.children = children;
            offerObj.hotelName = $('#check-availaility-searchbar-input').val();

            offerObj.offerName = offerName;
            offerObj.offerCode = offerCode;
            offerObj.offerValidity = offerValidity;
            offerObj.offerCategory = offerCategory;

            addParameterToDataLayerObj(eventName, offerObj);
        } catch (err) {
            consolelog('error in adding to datalayer');
        }
    }
}

function addOfferCalendarLoaderCampaign() {
    var calenderText = "Fetching the prices..";
    if ($("#showPrice").val()) {
        calenderText = "Fetching the prices..";
    } else {
        calenderText = "Checking Availability..";
    }
    $('.datepicker-loader').remove();
    $('.datepicker-days').find('tbody').append(
        '<div  class="datepicker-loader" style=""><p style="opacity: 1;margin-top: 26%; margin-left: 23%;font-size: x-large;">' + calenderText + '</p></div>');
    $('.checkavailability .datepicker-loader').attr('style', 'max-width: 165% !important; width:' + $('.checkavailability .datepicker .table-condensed').width() + 'px');
}


function calendarPricing() {
    //var isCalendarPricing = document.getElementById("isCalendarPricing").value;
    var isCalendarPricing = true;
    if (isCalendarPricing == true) {

        $('.jiva-spa-date-con').each(function() {
            $(this).click(function(e) {
                $(".jiva-spa-date").removeClass('visible');
                $(".jiva-spa-date-itinerary").removeClass('visible');
                $(this).siblings('.jiva-spa-date').addClass('visible');
                $(this).siblings('.jiva-spa-date-itinerary').addClass('visible');
                e.stopImmediatePropagation();
                e.stopPropagation()
                //currentCalendarInputDate =new Date(moment($($(e.currentTarget).find('input')[0]).val()).format("DD/MM/YYYY"));
                var dateVar = $($(e.currentTarget).find('input')[0]).val().split('/');
                currentCalendarInputDate = new Date(dateVar[1] + '/' + dateVar[0] + '/' + dateVar[2]);

                if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0]).hasClass('enquiry-from-value')) {
                    currentCalendarInputDate = new Date();
                }
                if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0]).hasClass('enquiry-to-value')) {
                    currentCalendarInputDate = moment($($(e.currentTarget).closest('.row').find('.enquiry-from-value')[0]).val(), "DD/MM/YYYY")._i;
                }
                var currentCalendarMonthName = monthOfferNames[currentCalendarInputDate.getMonth()];
                var currentCalendarYear = currentCalendarInputDate.getFullYear();
                caSelectedHotel = $(this).parents('.row').find('#check-availaility-searchbar-input').attr('data-hotel-id');
                var monthJsonCheck = monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear];

                if (!monthJsonCheck && caSelectedHotel != "99999") {
                    caSelectedFromdate = new Date();
                    caSelectedTodate = new Date((caSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));
                    var isCodelabel = $("#codelabel").text().trim();
                    var promoCode = "";
                    var itineraryRateCode = "";
                    if (isCodelabel == 'promoCode') {
                        var rateCodeString = document.getElementById("offerCode").innerHTML;
                        var rateCodeArray = rateCodeString.split("&");
                        promoCode = rateCodeArray[0];
                    } else {
                        var rateCodeString = document.getElementById("offerCode").innerHTML;
                        var rateCodeArray = rateCodeString.split("&");
                        itineraryRateCode = rateCodeArray[0];
                    }
                    var caUrl = "/bin/calendarAvailability.rates/" + caSelectedHotel + "/" + moment(caSelectedFromdate).format('YYYY-MM-DD') + "/" +
                        moment(caSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/["' + itineraryRateCode + '"]/' + promoCode + '/P1N/ratesCache.json';
                    console.log("check availability URL", caUrl);

                    monthExisting = false;
                    console.log($('.datepicker-days').find('tbody'));
                    $('.datepicker-loader').remove();
                    addOfferCalendarLoaderCampaign();
                    $.ajax({
                        type: "GET",
                        url: caUrl,
                        contentType: "application/json"
                    }).done(addPriceDetails).fail().always(function() {});

                    setTimeout(function() {
                        $('.datepicker .datepicker-days .next,.datepicker .datepicker-days .prev').click(function(e) {

                            setTimeout(function() {
                                console.log("e", e);
                                var currentCalendarMonthName = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[0];
                                var currentCalendarYear = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[1].substring(0, 4);
                                var currentCalendarMonthLastDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName) + 1, 0);
                                console.log(currentCalendarMonthName, currentCalendarYear);
                                var isCodelabel = $("#codelabel").text().trim();
                                var promoCode = "";
                                var itineraryRateCode = "";
                                if (isCodelabel == 'promoCode') {
                                    var rateCodeString = document.getElementById("offerCode").innerHTML;
                                    var rateCodeArray = rateCodeString.split("&");
                                    promoCode = rateCodeArray[0];
                                } else {
                                    var rateCodeString = document.getElementById("offerCode").innerHTML;
                                    var rateCodeArray = rateCodeString.split("&");
                                    itineraryRateCode = rateCodeArray[0];
                                }

                                var monthJsonCheck = monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear];
                                if (!monthJsonCheck || (monthJsonCheck && new Date(monthJsonCheck[monthJsonCheck.length - 1].end) < currentCalendarMonthLastDay)) {

                                    caSelectedFromdate = caSelectedTodate ? new Date((caSelectedTodate.getTime() + (1 * 24 * 60 * 60 * 1000))) : new Date();
                                    caSelectedTodate = new Date((caSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));

                                    var caUrl = "/bin/calendarAvailability.rates/" + caSelectedHotel + "/" + moment(caSelectedFromdate).format('YYYY-MM-DD') + "/" +
                                        moment(caSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/["' + itineraryRateCode + '"]/' + promoCode + '/P1N/ratesCache.json';
                                    console.log("check availability URL", caUrl);

                                    monthExisting = false;
                                    $('.datepicker-loader').remove();
                                    addOfferCalendarLoaderCampaign();

                                    $.ajax({
                                        type: "GET",
                                        url: caUrl,
                                        contentType: "application/json"
                                    }).done(addPriceDetails).fail().always(function() {});
                                } else {
                                    monthExisting = true;
                                    addPriceDetails(monthAvailability);
                                }
                            }, 500);
                        });
                    }, 500);

                } else {
                    monthExisting = true;
                    addPriceDetails(monthAvailability);
                }
                return false;

            });
        });
    }
}

var caSelectedHotel;
var caSelectedFromdate;
var caSelectedTodate;
var ItineraryDetails;
var currentCalendarInputDate;
var monthExisting;
var monthOfferNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December", "December"
];
var monthAvailability = {};
var monthJson;

function processOfferRatesJSON(rateJson) {
    monthJson = monthJson ? monthJson : {};
    monthJson[caSelectedHotel] = monthJson[caSelectedHotel] ? monthJson[caSelectedHotel] : {};
    for (var i = 0; i < rateJson.hotelStays.length; i++) {
        var startmonth = new Date(rateJson.hotelStays[i].start).getMonth();
        var endmonth = new Date(rateJson.hotelStays[i].end).getMonth();
        var startYear = new Date(rateJson.hotelStays[i].start).getFullYear();
        var endYear = new Date(rateJson.hotelStays[i].end).getFullYear();
        if (!(monthJson[caSelectedHotel] && monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear]))
            monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear] = [];

        monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear].push(rateJson.hotelStays[i]);
        //startmonth ++;
        var arrayendmonth = endmonth;
        if (endYear > startYear) {
            arrayendmonth = startmonth + endmonth + 1
        }
        var thisYear = startYear;
        while (arrayendmonth >= startmonth) {
            if (!monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear])
                monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear] = [];
            monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear].push(rateJson.hotelStays[i]);
            caSelectedTodate = new Date(rateJson.hotelStays[i].end);
            startmonth++;
            if (endYear > startYear && startmonth == 12) {
                startmonth = 0;
                thisYear = endYear;
                arrayendmonth = endmonth;
            }
        }
    }


    console.log("FINAL JSON", monthJson);
    return monthJson;
}

function addPriceDetails(response) {
    $('.datepicker-loader').remove();




    var data = response;
    console.log('JSON response', response);

    if (response.errorMessage && response.errorMessage.indexOf('Invalid Promotion Code') != -1) {
        warningBox({
            title: '',
            description: 'The selected hotel is not participating in this offer.',
            callBack: null,
            needsCta: false,
            isWarning: true
        });
        return;
    }


    monthAvailability = monthExisting ? response : processOfferRatesJSON(response);


    if (!currentCalendarMonthName) {
        currentCalendarMonth = currentCalendarInputDate ? currentCalendarInputDate.getMonth() : $("#enquiry-from-date").datepicker("getDate").getMonth();
        //var currentCalendarMonth = $("#input-box1").datepicker("getDate").getMonth();
        if (currentCalendarMonth == undefined || currentCalendarMonth == null) {
            var currentDate = new Date();
            currentCalendarMonth = currentDate.getMonth();
        }
        var currentCalendarMonthName = monthOfferNames[currentCalendarMonth];
        var currentCalendarYear = currentCalendarInputDate ? currentCalendarInputDate.getFullYear() : $("#enquiry-from-date").datepicker("getDate").getFullYear();
        if (!currentCalendarYear) {
            var currentDate = new Date();
            currentCalendarYear = currentDate.getFullYear();
        }
    }
    if (monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear]) {
        showPrices(monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear]);
    }

    //$('.cm-bas-con .bas-datepicker-container .bas-calander-container .datepicker .prev').click(showPrices(currentMonth, lastDate));

    function showPrices(currentMonth) {
        var localDateTimestamp = "";
        var localDateMonth = "";
        var localDateYear = "";
        let isCheckInContainer = true;
        $(".datepicker-days td").filter(function() {

            var date = $(this).text();
            return /\d/.test(date);

        }).each(function() {
            let $currentInputElem = $(this).parents(".jiva-spa-date-section.package-input-wrp");
            if ($currentInputElem.hasClass("package-check-out-date"))
                isCheckInContainer = false;
            localDateTimestamp = new Date(new Date($(this).data('date')).toLocaleDateString('en-US')).getTime();
            localDateMonth = monthOfferNames[new Date(localDateTimestamp).getMonth()];
            localDateYear = new Date(localDateTimestamp).getFullYear();
            pricemonth = monthAvailability[caSelectedHotel][localDateMonth + localDateYear];

            if (pricemonth) {
                console.log("pricemonth", pricemonth);
                innerloop:
                    for (var i = 0; i < pricemonth.length; i++) {
                        if (localDateTimestamp <= new Date(pricemonth[i].end).getTime() && localDateTimestamp >= new Date(pricemonth[i].start).getTime()) {
                            if (pricemonth[i].status == 'Close') {
                                $(this).attr('data-custom', 'X').addClass("disabled");
                                if (!isCheckInContainer && $(this).prev().attr('data-custom') != 'X')
                                    $(this).removeClass("disabled");

                                break;
                            } else if (pricemonth[i].status == 'Open' || pricemonth[i].status == 'MinStay') {
                                var priceStartDate, priceEndDate, price;
                                for (var j = 0; j < pricemonth[i].prices.length; j++) {
                                    var priceItem = pricemonth[i].prices[j];
                                    priceStartDate = new Date(priceItem.start).getTime();
                                    priceEndDate = new Date(priceItem.end).getTime();
                                    var pricevals = ((parseInt(priceItem.amountBeforeTax) / 1000) + '').split('.');
                                    var decimal = pricevals[1] ? '.' + pricevals[1].substring(0, 1) : '';
                                    price = getCurrencySymbol(priceItem.currencyCode) + pricevals[0] + decimal + 'K';
                                    $(this).attr('data-custom', '');
                                    if (localDateTimestamp >= priceStartDate && localDateTimestamp <= priceEndDate) {
                                        if ($("#showPrice").val()) {
                                            $(this).attr('data-custom', price);
                                            break innerloop;
                                        }
                                        isCheckInContainer ? $(this).removeClass('disabled-checkIn') : $(this).removeClass('disabled-checkOut');
                                    }
                                }
                            }

                        }
                        /*else if(pricemonth[i].status == 'Open'){
                            var priceStartDate, priceEndDate, price;
                            if(priceStartDate && localDateTimestamp >= priceStartDate && localDateTimestamp <= priceEndDate){
                                $(this).attr('data-custom', price);	
                            }else{
                                for(var j=0;j<pricemonth[i].prices.length;j++){
                                    var priceItem = pricemonth[i].prices[j];
                                    priceStartDate = new Date(priceItem.start).getTime(); 
                                    priceEndDate = new Date(priceItem.end).getTime(); 
									priceItem.currencyCode = priceItem.currencyCode == 'INR' ? '₹' : priceItem.currencyCode;
                                    price = priceItem.currencyCode + parseInt(priceItem.amountBeforeTax) ;
                                    if(localDateTimestamp >= priceStartDate && localDateTimestamp <= priceEndDate){
                                        $(this).attr('data-custom', price);	
                                    }
                                }
                            }							
                        }*/

                    }
            }
        });
    }
}

function getCurrencySymbol(inputSymbol) {
    if (inputSymbol == 'INR')
        return '₹';
    else if (inputSymbol == 'USD')
        return '$';
    else if (inputSymbol == 'MYR')
        return 'RM';
    else if (inputSymbol == 'ZAR')
        return 'R';
    else if (inputSymbol == 'AED')
        return 'AED';
    else if (inputSymbol == 'GBP')
        return '£';
    else if (inputSymbol == 'EUR')
        return '€';
    else
        return inputSymbol;
}

function verifySebNights() {
    var bookingOptions = getBookingOptionsSessionData();
    var checkInDate = moment($('#enquiry-from-date').datepicker("getDate")).format('DD/MM/YYYY');
    var checkOutDate = moment($('#enquiry-to-date').datepicker("getDate")).format('DD/MM/YYYY');
    var numberOfRooms = $('#packageNoOfRooms').val();
    var nights = moment(checkOutDate, "DD.MM.YYYY").diff(moment(checkInDate, "DD.MM.YYYY"), 'days');
    var totalNights = parseInt(nights) * parseInt(numberOfRooms);
    var sebObject = getQuerySebRedemption();
    var sebNights = parseInt(sebObject.sebEntitlement);
    if (totalNights > sebNights) {
        showNightsLimitExceeded();
        return false;
    } else {
        return true;
    }
}

function getQuerySebRedemption() {
    return dataCache.session.getData('sebObject');
}

function showNightsLimitExceeded() {
    try {

        var popupParams = {
            title: 'Your maximum nights limit is exceeded.',
            description: 'Your maximum nights limit is exceeded',
            callBack: popUpWidgetAndAddRoom,
            needsCta: true,
            isWarning: true
        }

        warningBox(popupParams);
        $('#ca-global-re-direct').attr('href', "#");
        $('#check-availaility-searchbar-input').val("");

    } catch (error) {
        console.error(error);
    }
};
// function closeWarningPopup() {
// 	$('.selection-delete').trigger('click');
// }
function popUpWidgetAndAddRoom() {

    setTimeout(function() {
        window.location.reload;
    }, 100);
}

function appendQCVoucherDetailsAndRedirect() {
    var redirectPath = $('#ca-global-re-direct').attr('href');
    var voucherCode = $('#check-availaility-voucher-code-input') && $('#check-availaility-voucher-code-input').val() ?
        $('#check-availaility-voucher-code-input').val().trim() : '';
    if (voucherCode) {
        redirectPath += '&qcvoucherCode=' + voucherCode + '&qcvoucherpin=' + $('#check-availaility-voucher-pin-input').val();
    }
    $('#ca-global-re-direct').attr('href', redirectPath);
    window.location.href = redirectPath;

}


var searchComponent = function(searchInput, searchResutlsContainer, searchResutlsDestinations, searchResutlsHotels,
    noResultsCallBack) {
    var $searchInput = $(searchInput);
    var $searchPath = $('#searchPath').val();
    var $otherWebsitePath = $('#checkAvailOtherPath').val();
    var $searchResutlsContainer = $(searchResutlsContainer);
    var $searchResutlsHotels = $(searchResutlsHotels);
    var SEARCH_INPUT_DEBOUNCE_RATE = 1000;

    var alternateSearch = $('#alternateSearch').val();
    var alternateSearchPath = $('#alternateSearchPath').val();
    //var $searchCompContainer = $('.search-comp-container');
    var $searchCompContainer = $('.search-comp-container.package-input-wrp');
    var performDestinationHotelSearch = function(key) {
        var url = "/bin/checkHotelsForOffers.data/" + $searchPath.replace(/\/content\//g, ":") + "/" +
            $otherWebsitePath.replace(/\/content\//g, ":").replace(/,/g, "_") + "/" +
            $searchInput.val() + "/offersSearchCache.json";

        if (alternateSearch && alternateSearch == 'true') {
            url = alternateSearchPath;
        }
        $("#check-availaility-searchbar-input").addClass("loading");
        $.ajax({
            method: "GET",
            url: url
        }).success(function(response) {
            $("#check-availaility-searchbar-input").removeClass("loading");
            succcesCallBack(response);
        }).fail(function(error) {
            console.error("search failed : ", error);
        });
    }
    var succcesCallBack = function(response) {
        clearSearchResults();
        $searchResutlsContainer.show();
        $('.others').show();

        updateResults(response, $searchResutlsHotels, true);
        if (Object.keys(response.websites).length == 0 && Object.keys(response.others).length == 0) {
            $('.search-comp-no-results').show();
            noResultsCallBack();
        } else {
            $('.search-comp-no-results').hide();
            searchInHotelDropdownList();
        }
    }
    var clearSearchResults = function() {
        $searchResutlsHotels.empty();

    }
    $searchInput.on("keyup", debounce(function() {
        disableCheckAvailabilityCTA();
        var searchText = $(this).val();
        if (searchText.length > 2) {
            performDestinationHotelSearch(searchText);
        } else {
            $searchResutlsContainer.hide();
        }
    }, SEARCH_INPUT_DEBOUNCE_RATE));

    if (alternateSearch && alternateSearch == 'true') {
        // handle alternate search path
        $searchCompContainer.on('click', function() {
            performDestinationHotelSearch("");
        });
    }

    $searchResutlsContainer.on("click", '.search-result-item', function() {
        $searchInput.val($(this).text());
        $searchInput.attr('data-hotel-id', $(this)[0].dataset.hotelId);
        $searchInput.attr('data-hotel-path', $(this)[0].dataset.redirectPath);
    })
    $searchResutlsContainer.click(function(e) {
        e.stopPropagation();
    })
    $(document).click(function(e) {
        $searchResutlsContainer.hide();
    });
    var updateResults = function(results, $resultsList, isHotels) {
        console.log("results from search", results);
        console.log("isHotels ", isHotels);
        if (isHotels) {
            var websiteHotels = results.websites || [];
            var otherHotels = results.others || [];
            var websiteResults = $('.search-comp-results-list.website');
            var otherResults = $('.search-comp-results-list.others');
            var websiteCount = websiteHotels ? Object.keys(websiteHotels).length : 0;
            var websiteBrand = $('.search-comp-results-sub-container.website');
            var otherCount = otherHotels ? Object.keys(otherHotels).length : 0;
            if (otherCount == 0) {
                $('.others').hide();
            }
            var otherBrand = $('.search-comp-results-sub-container.others');
            if (Object.keys(websiteHotels).length || Object.keys(otherHotels).length) {
                if ((Object.keys(websiteHotels).length)) {
                    websiteHotels
                        .forEach(function(websiteHotel) {
                            var reDirectToRoomPath = websiteHotel.path;
                            var hotelId = websiteHotel.id;
                            if (!reDirectToRoomPath.includes("tajinnercircle")) {
                                if (isHotels) {
                                    var ROOMS_PATH = "rooms-and-suites/";
                                    /*For identifying ama brand in amastays and trails domain*/
                                    if ((reDirectToRoomPath.indexOf('/taj/') == -1 && (reDirectToRoomPath.indexOf('/gateway/') == -1 && reDirectToRoomPath.indexOf('vivanta') == -1 &&
                                                websiteHotel.title.indexOf('SeleQtions') == -1 && reDirectToRoomPath.indexOf('seleqtions') == -1) ||
                                            reDirectToRoomPath.indexOf('amastaysandtrails.com') !== -1 || reDirectToRoomPath.includes("/ama"))) {
                                        var ROOMS_PATH = "accommodations/";
                                    }
                                    reDirectToRoomPath = websiteHotel.path.replace(".html", "") + ROOMS_PATH;
                                }
                                if (!window.location.href.includes('businessConnect')) {
                                    reDirectToRoomPath = reDirectToRoomPath.replace('//', '/');
                                }

                                if (reDirectToRoomPath.indexOf('amastaysandtrails.com') !== -1) {
                                    websiteHotel.title = "amã Stays & Trails " + websiteHotel.title;
                                }
                                websiteResults.append('<li class="search-result-item" data-hotel-id="' + hotelId +
                                    '"  data-redirect-path="' + reDirectToRoomPath + '">' + websiteHotel.title +
                                    '</li>');
                            }
                        });
                }
                if (otherHotels && (Object.keys(otherHotels).length)) {
                    otherHotels.forEach(function(otherHotel) {
                        var reDirectToRoomPath = otherHotel.path;
                        if (!reDirectToRoomPath.includes("tajinnercircle")) {
                            var hotelId = otherHotel.id;
                            if (isHotels) {
                                var ROOMS_PATH = "rooms-and-suites/";
                                if (otherHotel.path.includes('amastaysandtrails') || otherHotel.path.includes('/ama/')) {
                                    ROOMS_PATH = "accommodations/";
                                }
                                reDirectToRoomPath = otherHotel.path.replace(".html", "") + ROOMS_PATH;
                            }
                            if (!reDirectToRoomPath.includes('https')) {
                                reDirectToRoomPath = reDirectToRoomPath.replace('//', '/');
                            }
                            if (reDirectToRoomPath.indexOf('amastaysandtrails.com') !== -1) {
                                otherHotel.title = "amã Stays & Trails " + otherHotel.title;
                            }
                            otherResults.append('<li class="search-result-item" data-hotel-id="' + hotelId +
                                '"  data-redirect-path="' + reDirectToRoomPath + '">' + otherHotel.title + '</li>');
                        }
                    });
                }
                if (websiteCount == 0 && otherCount == 0) {
                    websiteBrand.hide();
                    otherBrand.hide();
                } else if (websiteCount != 0 && otherCount == 0) {
                    websiteBrand.show();
                    otherBrand.hide();
                } else if (websiteCount == 0 && otherCount != 0) {
                    websiteBrand.hide();
                    otherBrand.show();
                    $('.others').show();
                } else if (websiteCount != 0 && otherCount != 0) {
                    websiteBrand.show();
                    otherBrand.show();
                    $('.others').show();
                }
            } else {
                $resultsList.closest('.search-comp-results-sub-container').hide();
            }
        } else {
            if ((results.length > 0) && $resultsList) {
                (results).forEach(function(result) {
                    var reDirectToRoomPath = result.path;
                    var hotelId = null ? "" : result.id;
                    reDirectToRoomPath = reDirectToRoomPath.replace('//', '/');
                    $resultsList.append('<li class="search-result-item" data-hotel-id="' + hotelId +
                        '"  data-redirect-path="' + reDirectToRoomPath + '">' + result.title + '</li>');
                });
                $resultsList.closest('.search-comp-results-sub-container').show();
            } else {
                $resultsList.closest('.search-comp-results-sub-container').hide();
            }
        }
    }
};

$("#check-availaility-searchbar-input.search-hotel") ?
    $("#check-availaility-searchbar-input.search-hotel").prop("disabled", false) : "";

function searchInHotelDropdownList() {
    let input, filter, li;
    input = document.querySelector("#check-availaility-searchbar-input.search-hotel");
    if (input) {
        filter = input.value.toUpperCase();
        li = $("#check-availaility-search-results-hotels li.search-result-item");
        for (let i = 0; i < li.length; i++) {
            txtValue = li[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
}

$('#check-availaility-searchbar-input.search-hotel')[0] ? $('#check-availaility-searchbar-input.search-hotel')[0].addEventListener('blur', () => {

    if ($('#check-availaility-searchbar-input.search-hotel').val()) {
        $('#check-availaility-searchbar-input.search-hotel').next().next().css('display', 'none');
    }
}) : "";

$("#check-availaility-search-results-hotels").on("click", function() {
    setTimeout(() => {
        if ($("#check-availaility-searchbar-input.search-hotel").val()) {
            $("#check-availaility-searchbar-input.search-hotel").next().next().css("display", "none");
            $('#check-availaility-searchbar-input.search-hotel').removeClass('invalid-input');
        }
    }, 0);
});


document
    .addEventListener(
        'DOMContentLoaded',
        function() {

            $('.footer-destination-expand-button').click(function(e) {
                if ($(this).text().trim() == '+') {
                    $('.footer-destination-list').slideDown(100);
                    $(this).text('-');
                } else {
                    $(this).text('+');
                    $('.footer-destination-list').slideUp(100);
                }
                e.stopImmediatePropagation();
                return false;
            });


            $('.footer-tic-expand-button').click(function(e) {
                if ($(this).find('button').text() == '+') {
                    $('.footer-brands-list').slideDown(100);
                    $(this).find('button').text('-');
                } else {
                    $(this).find('button').text('+');
                    $('.footer-brands-list').slideUp(100);
                }
                e.stopImmediatePropagation();
                return false;
            });

            if ($('#scrollview')) {
                bindScrollFunction();
            }

            $('#newsletter').click(function() {

            });
            updateBrandSpecificSocialLinks();
            //below code is for changing the tataneu related content

            updateFooterForTataNeu();


            // The below function call is declared at dining-filter js
            try {
                populateFilterFromHtml();
            } catch (e) {
                // Dining filter is not available in the page
                // console.log("The function[populateFilterFromHtml()]
                // can't be called. Dining filter is not available in
                // the page ")
            }
            toggleFooterPadding();
        });

function updateBrandSpecificSocialLinks() {
    var $pageContainer = $('.cm-page-container');
    var $facebookLink = $('.facebook-redirect');
    var $instagramLink = $('.instagram-redirect');
    var $twitterLink = $('.twitter-redirect');
    var $youtubeLink = $('.youtube-redirect')
    if ($pageContainer.hasClass('vivanta-theme')) {
        $facebookLink.attr('href', 'https://www.facebook.com/VivantaHotels');
        $instagramLink.attr('href', 'https://www.instagram.com/vivantahotels');
        $twitterLink.attr('href', 'https://twitter.com/vivantahotels');
        $youtubeLink.attr('href', 'https://www.youtube.com/user/VivantabyTaj');
    } else if ($pageContainer.hasClass('gateway-theme')) {
        $facebookLink.attr('href', 'https://www.facebook.com/TheGatewayHotel');
        $instagramLink.attr('href', 'https://www.instagram.com/thegatewayhotels');
        $twitterLink.attr('href', 'https://twitter.com/TheGatewayHotel');
        $youtubeLink.attr('href', 'https://www.youtube.com/user/TheGatewayHotel');
    }
}

function toggleFooterPadding() {
    if ($('.book-ind-container').length != 0) {
        $('.footer').addClass('footer-padding-for-cart-info');
    }
}

function bindScrollFunction() {
    $('.scrollview').click(function() {
        document.getElementById("scrollTarget").scrollIntoView();
    });

}

function updateFooterForTataNeu() {
    var userDetails = getUserData();
    if (userDetails && userDetails.loyalCustomer == 'Y') {
        var tataneuText = ['NeuPass Home', '', 'NeuPass Participating Hotels', ''];
        var tataneuLinks = ['https://www.tajhotels.com/en-in/neupass/', '', 'https://www.tajhotels.com/en-in/our-hotels/', '']
        $('.footer-brands-list li').each(function(index, value) {
            if (index == 0 || index == 2) {
                $(this).children().attr('href', tataneuLinks[index]);
                $(this).children().text(tataneuText[index]);
            }


        })
    }
}


$(document).ready(
    function() {
        try {

            if ($("#isOnlyBungalow").text()) {
                var bookingOptions = dataCache.session.getData("bookingOptions");
                bookingOptions.isOnlyBungalowPage = true;
                dataCache.session.setData("bookingOptions", bookingOptions);
            }
            amaBookingObject = getInitialBookAStaySessionObject();
            amaBookingObject.isAmaCheckAvailabilitySelected = false;
            amaBookingObject.roomType = "room";
            var $guestDropdownWrp = $('.guests-dropdown-wrap');
            autoPopulateBannerBookAStay();

            $guestDropdownWrp.on('click', '.roomHeading', function() {
                $(this).parent().toggleClass('hideDiv');

            });

            var shouldInvokeCalendarApi = false;
            if (document.getElementById("shouldInvokeCalendarApi"))
                var shouldInvokeCalendarApi = document.getElementById("shouldInvokeCalendarApi").value;
            var checkoutCalendarCAbinded = false;
            if (shouldInvokeCalendarApi) {
                //***Removing Ama Calendar rates****///
                amacacalendarPricing();
            }
            $('.check-avblty-guests-input').click(function() {
                showGuestSelectionDropdown();
                $('.check-avblty-guests-input').toggleClass('eNone');
            });
            var isEndDateTriggered;
            $('#ama-cal-img-to').on('click', function() {
                $('#input-box-to').focus();
                $('#input-box-to').click();
            });
            $('#ama-cal-img-from').on('click', function() {
                $('#input-box-from').focus();
                $('#input-box-from').click();
            });
            $('#input-box-from').on('change', function(e) {
                var $nextInput = $('.input-box-ama.date-explore').not($(this));
                var currVal = $(this).val();
                var nextVal = $nextInput.val();
                amaBookingObject.fromDate = moment(new Date(currVal)).format('MMM D YY');
                amaBookingObject.isAmaCheckAvailabilitySelected = true;

                addOfferCalendarLoader();
                setTimeout(function() {
                    $('.datepicker-loader').remove();
                }, 150);
                setTimeout(function() {
                    $(this).blur();
                    $('#input-box-to').focus();
                    $('#input-box-to').click();
                    $('.bas-left-date-wrap-ama').removeClass('active');
                    $nextInput.focus();
                    if ($('#input-box-from').datepicker('getDate') >= $('#input-box-to').datepicker('getDate')) {
                        var nextDate = moment((new Date(currVal)).setDate((new Date(currVal)).getDate() + 1)).format('MMM D YY');
                        $nextInput.datepicker('setDate', new Date(nextDate));
                        isEndDateTriggered = true;
                        amaBookingObject.toDate = moment(new Date(nextDate)).format('MMM D YY');
                        amaBookingObject.isAmaCheckAvailabilitySelected = true;
                    }
                    CloseDatePickerIfRequired();
                    if (!checkoutCalendarCAbinded) {
                        //***Removing Ama Calendar rates****///
                        amacacalendarPricing();
                        bindNextPrevClickAmaCa();
                        checkoutCalendarCAbinded = true;
                    }
                    $('.check-in-check-out-input-wrap').trigger('click');
                }, 100);
            });

            $('#input-box-to').on('change', function(e) {
                setTimeout(function() {
                    if (isEndDateTriggered) {
                        isEndDateTriggered = false;
                    } else {
                        $(this).blur();
                        $('.check-avblty-input-wrap .input-daterange#ama-ca-datepicker input').each(function() {
                            $(this).blur();
                        });
                        $('.input-box-wrapper-ama').hide();
                        $(document).click();
                    }
                    amaBookingObject.toDate = moment(new Date($('#input-box-to').val())).format('MMM D YY');
                    amaBookingObject.isAmaCheckAvailabilitySelected = true;
                    CloseDatePickerIfRequired();
                }, 100);
            });
            // function in book a stay js
            initializeDatepickerForBookAStay($('.check-avblty-input-wrap .input-daterange#ama-ca-datepicker'),
                $('.input-box-wrapper-ama'));

            $('#input-box-from').on('click', function() {
                showCalenderCheckAvailAma($(this), $('.bas-left-date-wrap-ama'));
            });

            $('#input-box-to').on('click', function() {
                showCalenderCheckAvailAma($(this), $('.bas-right-date-wrap-ama'));
            });

            function showCalenderCheckAvailAma(_this, checkinoutCont) {
                _this.focus();
                checkinoutCont.addClass('active').siblings('.bas-single-wrap').removeClass('active');
                $('.input-box-wrapper-ama').show();
                $('.bas-calander-container-ama').css('display', 'flex');
            }

            $guestDropdownWrp.on('click', ' .adult-dec, .child-dec, .adult-inc, .child-inc',
                function() {
                    var item = $(this);
                    var parentItem = item.parent().parent();
                    var count = item.siblings('.counter').text();
                    var isAdultWrp = parentItem.hasClass('adult-wrap');
                    if (item.attr('class').includes('inc')) {
                        if (isBungalowSelected()) {
                            if ((isAdultWrp && (count > 0 && count < 16)) ||
                                (!isAdultWrp && (count > -1 && count < 8))) {
                                changeGuestCounter(item);
                            }
                        } else {
                            if ((isAdultWrp && (count > 0 && count < 16)) ||
                                (!isAdultWrp && (count > -1 && count < 7))) {
                                changeGuestCounter(item);
                            }
                        }
                    } else if (item.attr('class').includes('dec')) {
                        if ((isAdultWrp && count > 1) || (!isAdultWrp && count > 0)) {
                            changeGuestCounter(item);
                        }
                    }
                    updateIndividualRoomGuestCount($(this));
                    updateGuestPlaceholder();
                    amaBookingObject.isAmaCheckAvailabilitySelected = true;
                    amaBookingObject.roomOptions = getRoomOptionsSelectedAma();

                });

            var $guestDropdwnAddBtn = $('.add-room-button');
            $guestDropdownWrp.on('click', '.close-current-room', function() {
                var roomCounter = $('.guests-dropdown-wrap .guest-room-header').length;
                var deletedRoom = $(this).closest(".guest-room-header");
                var deletedRoomIndex = deletedRoom.index();
                deleteRoomInCartAndUpdateSelectionData(deletedRoomIndex);
                deletedRoom.nextAll('.guest-room-header').each(function() {
                    deletedRoomIndex++;
                    var _this = $(this);
                    _this.attr('id', 'roomGuestDetails' + deletedRoomIndex);
                    _this.attr('data-room-index', deletedRoomIndex);
                    _this.find('.guest-room-count').text(deletedRoomIndex);
                });
                deletedRoom.remove();
                if (deletedRoomIndex < 5) {
                    $guestDropdwnAddBtn.removeClass('add-room-button-remove');
                }
                updateGuestPlaceholder();
                amaBookingObject.isAmaCheckAvailabilitySelected = true;
                amaBookingObject.roomOptions = getRoomOptionsSelectedAma();
            });

            $('#addButton').on('click', function() {
                var roomCounter = $('.guests-dropdown-wrap .guest-room-header').length;
                if (roomCounter < 5) {
                    roomCounter++;
                    var roomGuestDetails = $(this).prev();
                    var clonedRoomGuestDetails = roomGuestDetails.clone();
                    clonedRoomGuestDetails.find('.noOfPeople').text("(1 Guest)");
                    roomGuestDetails.after(clonedRoomGuestDetails);
                    var cloned = $(this).prev();
                    cloned.find('.guest-room-count').text(roomCounter);
                    cloned.find('.adult-wrap .counter').text(1);
                    cloned.find('.children-wrap .counter').text(0);
                    cloned.attr('data-room-index', roomCounter);
                    cloned.attr('id', 'roomGuestDetails' + roomCounter)
                    cloned.find('.close-current-room').removeClass('display-none');
                }
                if (roomCounter > 4) {
                    $guestDropdwnAddBtn.addClass('add-room-button-remove');
                }
                updateGuestPlaceholder();

                amaBookingObject.isAmaCheckAvailabilitySelected = true;
                amaBookingObject.roomOptions = getRoomOptionsSelectedAma();
            });

            $('#checkAvailability').click(function() {
                var path = $(this).attr('hrefvalue');
                isAmaCheckAvailability = true;
                if (path) {
                    if (numberOfNightsSelectedCheck()) {
                        onClickOnCheckAvailabilty();
                    } else {
                        numberOfNightsExcessWarning(); // function in book a stay js
                    }
                }

            });

            setTimeout(function() {
                /* Dropdown Menu */
                $('.ama-check-availability .dropdown').click(function() {
                    $(this).attr('tabindex', 1).focus();
                    $(this).toggleClass('active');
                    $(this).find('.dropdown-menu').slideToggle(300);
                });
                $('.ama-check-availability .dropdown').focusout(function() {
                    $(this).removeClass('active');
                    $(this).find('.dropdown-menu').slideUp(300);
                });
                /* End Dropdown Menu */
            }, 3000);

            $('.check-avblty-wrap').on('click', '.dest-item, .hotel-item', function() {
                updateDestination($(this)); // function in searchBar js
            });

            // radio button click events
            $('.check-avblty-container .radio-container input[type=radio]').change(function() {
                bungalowRadioSelector();
                resetAdultChildCount('1', '0');
            });

            $('.book-stay-popup-radio-btn #onlyBungalowBtn').change(function() {
                // function in book a stay js
                removePopulatedRoomsBookAStay($(".bas-room-no"));
                removePopulatedRoomsBookAStay($(".bas-room-details"));
                $(".bas-room-no").click();
                selectedRoomsCount = $('.fc-add-package-con').length;
                if (selectedRoomsCount > 1) {
                    deleteSeletedRoomsInCartAma();
                }
            });

            disableRoomsRadioBtnInBungalowPage();

        } catch (err) {
            console.error('caught exception in ama checkAvailability js', err);
        }

    });

function disableRoomsRadioBtnInBungalowPage() {
    var isOnlyBungalow = isOnlyBungalowAvailable();
    var currentURL = window.location.pathname;
    if (currentURL.includes('accommodations')) {
        if (isOnlyBungalow) {
            updateOnlyBungalowInSession(true);
            updateBungalowGuest();
        } else {
            updateOnlyBungalowInSession(false);
            updateGuests();
        }
    } else if ($('.cm-page-container').hasClass('home-page-layout') || $('.cm-page-container').hasClass('specific-hotels-page')) {
        updateOnlyBungalowInSession(false);
        updateGuests();
    }
    updateRadioBtnStatus();
    updateGuestPlaceholder();
}

function updateBungalowGuest() {
    amaBookingObject.isAmaCheckAvailabilitySelected = false;
    var bookingOptions = dataCache.session.getData('bookingOptions');
    resetAdultChildCount(bookingOptions.roomOptions[0].adults, bookingOptions.roomOptions[0].children);
}

function updateRadioBtnStatus() {
    if (isOnlyBungalowPageInSession()) {
        $('#onlyRoom, #onlyRoomBtn').parent('.radio-container').addClass('disable-radiobtn');
        $('.check-avblty-container .radio-container #onlyBungalow, .book-stay-popup-radio-btn #onlyBungalowBtn')
            .click();
    } else {
        $('#onlyRoom, #onlyRoomBtn').parent('.radio-container').removeClass('disable-radiobtn');
    }
}

function updateOnlyBungalowInSession(isOnlyBungalow) {
    var bookingOptions = dataCache.session.getData("bookingOptions");
    if (bookingOptions) {
        bookingOptions.isOnlyBungalowPage = isOnlyBungalow;
        if (isOnlyBungalow) {
            bookingOptions.BungalowType = "onlyBungalow";
            if (bookingOptions.previousDates) {
                bookingOptions.previousDates.BungalowType = "onlyBungalow";
            }
            bookingOptions.rooms = 1;
            var roomOptions = changeRoomGuestToBungalow(bookingOptions.roomOptions);
            bookingOptions.roomOptions = [roomOptions];
        }
        dataCache.session.setData("bookingOptions", bookingOptions);
    }
}

function isOnlyBungalowPageInSession() {
    var bookingOptions = dataCache.session.getData("bookingOptions");
    if (bookingOptions && bookingOptions.isOnlyBungalowPage) {
        return true;
    }
    return false;
}

function autoPopulateBannerBookAStay() {
    updateDate();
    populateRadioButton();
    // updateGuests();
    // updateGuestPlaceholder();
}

function deleteSeletedRoomsInCartAma() {
    var bookingOptions = dataCache.session.getData("bookingOptions");
    bookingOptions.selection = [];
    bookingOptions.rooms = 1;
    bookingOptions.roomOptions = getInitialRoomOption();
    dataCache.session.setData("bookingOptions", bookingOptions);
    $('.fc-add-package-con').each(function() {
        $(this).remove();
    });
    var floatingCartAma = $('.book-ind-container');
    floatingCartAma.find('.checkout-num').text('0');
    floatingCartAma.find('.cart-total-price').text('0');
    floatingCartAma.css('display', 'none');
    $('.cm-bas-con .cm-bas-content-con').css('bottom', '4%');
}

function getRoomOptionsSelectedAma() {
    var roomsSelector = $('.guests-dropdown-wrap .guest-room-header');
    var roomOptions = [];
    roomsSelector.each(function() {
        var $this = $(this);
        var index = parseInt($this.data('room-index')) - 1;
        roomOptions.push({
            "adults": $this.find('.adult-wrap .counter').text(),
            "children": $this.find('.children-wrap .counter').text(),
            "initialRoomIndex": index
        });
    });
    return roomOptions;
}

function CloseDatePickerIfRequired() {
    if (!$('.input-box-wrapper-ama').is(':visible')) {
        $('.bas-calander-container-ama').css('display', 'none');
    }
}

function updateIndividualRoomGuestCount(_this) {
    var room = _this.closest('.guest-room-header');
    var count = parseInt(room.find('.adult-wrap .counter').text()) +
        parseInt(room.find('.children-wrap .counter').text());
    room.find('.noOfPeople').text('(' + count + ' ' + createGuestWordAma(+count, 'Guest') + ')');
}

function changeGuestCounter(element) {
    var counter = element.siblings('.counter').text();
    if (element.attr('class').includes('inc')) {
        counter++;
    } else if (element.attr('class').includes('dec')) {
        counter--;
    }
    element.siblings('.counter').text(counter);
    var currentAdult = $('.adult-wrap .counter').text();
    var currentChild = $('.children-wrap .counter').text();
    var guestUpdate = element.parent().parent().parent().siblings(".roomHeading").children(".noOfPeople");
    var totalGuest = parseInt(currentAdult) + parseInt(currentChild);
}

function updateDate() {
    var bookedOptions = fetchBookAStayDataToPopulate();
    if (bookedOptions) {
        var bookedCheckInDate = moment(bookedOptions.fromDate, "MMM Do YY").format("DD MMM YYYY");
        var bookedCheckOutDate = moment(bookedOptions.toDate, "MMM Do YY").format("DD MMM YYYY");
        $('#input-box-from').val(bookedCheckInDate);
        $('#input-box-to').val(bookedCheckOutDate);
    }

}

function updateGuests() {
    var bookingOptions = fetchBookAStayDataToPopulate();
    var adults;
    var children;
    var rooms = bookingOptions.roomOptions.length;
    removePopulatedRoomsBookAStay($('.check-avblty-wrap .guest-room-header'));
    if (rooms > 1) {
        var index = 1;
        adults = bookingOptions.roomOptions[index - 1].adults;
        children = bookingOptions.roomOptions[index - 1].children;
        $('.guests-dropdown-wrap .adult-wrap .counter').text(adults);
        $('.guests-dropdown-wrap .children-wrap .counter').text(children);
        while (index < rooms) {
            var roomGuestDetails = $('#addButton').prev();
            roomGuestDetails.after(roomGuestDetails.clone());
            adults = bookingOptions.roomOptions[index].adults;
            children = bookingOptions.roomOptions[index].children;
            var cloned = $('#addButton').prev();
            index++;
            cloned.attr("id", "roomGuestDetails" + index);
            cloned.find('.guest-room-count').text(index);
            cloned.find('.adult-wrap .counter').text(adults);
            cloned.find('.children-wrap .counter').text(children);
            cloned.attr('data-room-index', index);
            cloned.find('.close-current-room').removeClass('display-none');
            var guestCountOfThisRoom = +adults + +children;
            cloned.find('.noOfPeople').text(
                '(' + guestCountOfThisRoom + ' ' + createGuestWordAma(+guestCountOfThisRoom, 'Guest') + ')');

        }
        if (rooms == 5) {
            $('.check-avblty-wrap #addButton').addClass('add-room-button-remove');
        } else {
            $('.check-avblty-wrap #addButton').removeClass('add-room-button-remove');
        }
    } else {
        adults = bookingOptions.roomOptions[0].adults;
        children = bookingOptions.roomOptions[0].children;
        resetAdultChildCount(adults, children);
    }
}

function fetchBookAStayDataToPopulate() {
    return amaBookingObject.isAmaCheckAvailabilitySelected ? amaBookingObject : dataCache.session
        .getData('bookingOptions');
}

function showGuestSelectionDropdown() {
    $('.guests-dropdown-wrap').toggleClass('display-block');
    $('.check-avblty-guests-input .icon-drop-down-arrow').toggleClass('rotate-arrow');
}

function updateGuestPlaceholder() {
    var roomGuestDetails = $('.guests-dropdown-wrap .guest-room-header');
    var rooms = roomGuestDetails.length;
    var adults = 0;
    var children = 0;
    roomGuestDetails.each(function() {
        adults = adults + parseInt($(this).find('.adult-wrap .counter').text());
        children = children + parseInt($(this).find('.children-wrap .counter').text());
    })
    var guests = adults + children;
    if (isBungalowSelected()) {
        var guestsCount = guests + ' ' + createGuestWordAma(guests, "Guest");
    } else {
        var guestsCount = guests + ' ' + createGuestWordAma(guests, "Guest") + ' ' + rooms + ' ' +
            createGuestWordAma(guests, "Room");
    }
    $('.guest-title-wrap').text(guestsCount);
}

function createGuestWordAma(count, word) {
    if (count > 1) {
        return word + 's';
    }
    return word;
}

function parseDate(selectedDateValue) {
    return moment(selectedDateValue).format("MMM Do YY");
}

function bungalowRadioSelector() {
    var roomHeading = $('.check-avblty-wrap .roomHeading');
    var addRoom = $('.check-avblty-wrap #addButton');
    var roomElements = $('.guests-dropdown-wrap .guest-room-header');
    amaBookingObject.isAmaCheckAvailabilitySelected = true;
    if (isBungalowSelected()) {
        amaBookingObject.roomType = "onlyBungalow";
        roomHeading.hide();
        addRoom.addClass('add-room-button-remove');
        var selectedRoomsCount = $('.fc-add-package-con').length;
        if (selectedRoomsCount > 1) {
            deleteSeletedRoomsInCartAma()
        }
        if (roomElements) {
            removePopulatedRoomsBookAStay(roomElements); // function present in book a stay js
        }
    } else {
        amaBookingObject.roomType = "IndividualRoom";
        roomHeading.show();
        addRoom.removeClass('add-room-button-remove');
    }
    setTimeout(function() {
        updateGuestPlaceholder();
    }, 100);
}

function resetAdultChildCount(adults, children) {
    $('.adult-wrap .counter').text(adults);
    $('.children-wrap .counter').text(children);
}

function populateRadioButton() {
    var bookingOptions = fetchBookAStayDataToPopulate();
    var bungalow = $('.check-avblty-container .radio-container #onlyBungalow, .book-stay-popup-radio-btn #onlyBungalowBtn');
    var room = $('.check-avblty-container .radio-container #onlyRoom, .book-stay-popup-radio-btn #onlyRoomBtn');
    var addRoom = $('.check-avblty-wrap #addButton');
    if (bookingOptions && bookingOptions["BungalowType"] && bookingOptions["BungalowType"] == "onlyBungalow") {
        bungalow.click();
        addRoom.addClass('add-room-button-remove');
    } else {
        room.click();
        addRoom.removeClass('add-room-button-remove');
    }
}

function numberOfNightsSelectedCheck() {
    var currentDate = parseSelectedDate($("#input-box-from").datepicker("getDate"));
    var nextDate = parseSelectedDate($("#input-box-to").datepicker("getDate"));
    var numberOFNights = moment(nextDate, "MMM Do YY").diff(moment(currentDate, "MMM Do YY"), 'days');
    if (numberOFNights > 10 && $('#checkAvailability').hasClass('enabled'))
        return false;
    else
        return true;
}

function isOnlyBungalowAvailable() {
    var roomsList = $('.rate-cards-container .rate-card-wrap');
    var roomIterator = 0;
    var roomCount = roomsList.length;
    if (!roomCount) {
        return false;
    }
    for (roomIterator = 0; roomIterator < roomCount; roomIterator++) {
        if ($(roomsList[roomIterator]).attr('data-room-type') != "bungalow") {
            return false;
        }
    }
    return true;
}

//***Removing Ama Calendar rates****//
function amacacalendarPricing() {
    //var isCalendarPricing = document.getElementById("isCalendarPricing").value;
    var isCalendarPricing = true;
    checkoutCalendarCAbinded = false;
    if (isCalendarPricing == true) {

        if (checkoutCalendarCAbinded)
            return;

        $('.check-in-check-out-input-wrap').click(function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation()
            currentCalendarInputDate = new Date($($(e.currentTarget).find('input')[0]).val());

            if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0]).hasClass('enquiry-from-value')) {
                currentCalendarInputDate = new Date();
            }
            if (!($($(e.currentTarget).find('input')[0]).val()) && $($(e.currentTarget).find('input')[0]).hasClass('enquiry-to-value')) {
                currentCalendarInputDate = moment($($(e.currentTarget).closest('.row').find('.enquiry-from-value')[0]).val(), "DD/MM/YYYY")._i;
            }
            var currentCalendarMonthName = monthOfferNames[currentCalendarInputDate.getMonth()];
            var currentCalendarYear = currentCalendarInputDate.getFullYear();
            var currentCalendarMonthLastDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName) + 1, 0);

            caSelectedHotel = $("#hotelIdFromSearch").text() || pageLevelData.hotelCode;
            var monthJsonCheck = monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear];

            if (!monthJsonCheck || (monthJsonCheck && new Date(monthJsonCheck[monthJsonCheck.length - 1].end) < currentCalendarMonthLastDay)) {
                $('td.day').attr('data-custom', '');
                caSelectedFromdate = caSelectedTodate ? new Date((caSelectedTodate.getTime() + (1 * 24 * 60 * 60 * 1000))) : new Date();
                caSelectedTodate = new Date((caSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));

                var caUrl = "/bin/calendarAvailability.rates/" + caSelectedHotel + "/" + moment(caSelectedFromdate).format('YYYY-MM-DD') + "/" +
                    moment(caSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/[]//P1N/ratesCache.json';
                console.log("check availability URL", caUrl);

                monthExisting = false;
                console.log($('.datepicker-days').find('tbody'));
                $('.datepicker-loader').remove();
                addOfferCalendarLoader();
                $.ajax({
                    type: "GET",
                    url: caUrl,
                    contentType: "application/json"
                }).done(addPriceDetails1).fail().always(function() {});

                bindNextPrevClickAmaCa();


            } else {
                monthExisting = true;
                addPriceDetails1(monthAvailability);
            }
            return false;
        });
    }
}

$('.check-avblty-wrap').on('click', '.dest-item, .hotel-item', function() {
    if (shouldInvokeCalendarApi) {
        caSelectedTodate = currentCalendarInputDate;
    }
});

function bindNextPrevClickAmaCa() {
    setTimeout(function() {
        $('.datepicker .datepicker-days .next,.datepicker .datepicker-days .prev').click(function(e) {
            setTimeout(function() {
                console.log("e", e);
                var currentCalendarMonthName = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[0];
                var currentCalendarYear = $($(e.target).closest('tr').find('.datepicker-switch')[0]).text().split(' ')[1].substring(0, 4);
                var currentCalendarMonthLastDay = new Date(currentCalendarYear, monthOfferNames.indexOf(currentCalendarMonthName) + 1, 0);
                console.log(currentCalendarMonthName, currentCalendarYear);

                var monthJsonCheck = monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear];
                if (!monthJsonCheck || (monthJsonCheck && new Date(monthJsonCheck[monthJsonCheck.length - 1].end) < currentCalendarMonthLastDay)) {

                    caSelectedFromdate = caSelectedTodate ? new Date((caSelectedTodate.getTime() + (1 * 24 * 60 * 60 * 1000))) : new Date();
                    caSelectedTodate = new Date((caSelectedFromdate.getTime() + (60 * 24 * 60 * 60 * 1000)));

                    var caUrl = "/bin/calendarAvailability.rates/" + caSelectedHotel + "/" + moment(caSelectedFromdate).format('YYYY-MM-DD') + "/" +
                        moment(caSelectedTodate).format('YYYY-MM-DD') + '/INR/1,0/["STD"]/[]//P1N/ratesCache.json';
                    console.log("check availability URL", caUrl);

                    monthExisting = false;
                    $('.datepicker-loader').remove();
                    addOfferCalendarLoader();

                    $.ajax({
                        type: "GET",
                        url: caUrl,
                        contentType: "application/json"
                    }).done(addPriceDetails1).fail().always(function() {});
                } else {
                    monthExisting = true;
                    addPriceDetails1(monthAvailability);
                }
            }, 500);
        });
    }, 500);
}

function addOfferCalendarLoader() {
    var calenderText = "Finding best rates..";
    if ($("#showPrice").val()) {
        calenderText = "Finding best rates..";
    } else {
        calenderText = "Checking Availability..";
    }
    $('.datepicker-days').find('tbody').append(
        '<div  class="datepicker-loader" style=""><p style="opacity: 1;margin-top: 26%; margin-left: 23%;font-size: x-large;">' + calenderText + '</p></div>');
    $('.ama-check-availability .datepicker-loader').attr('style', 'max-width: 165% !important; width:' + $('.ama-check-availability .datepicker .table-condensed').width() + 'px');

}


var caSelectedHotel;
var caSelectedFromdate;
var caSelectedTodate;
var ItineraryDetails;
var currentCalendarInputDate;
var monthExisting;
var monthOfferNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December", "December"
];
var monthAvailability = {};
var monthJson;

function processOfferRatesJSON(rateJson) {
    monthJson = monthJson ? monthJson : {};
    monthJson[caSelectedHotel] = monthJson[caSelectedHotel] ? monthJson[caSelectedHotel] : {};
    for (var i = 0; i < rateJson.hotelStays.length; i++) {
        var startmonth = new Date(rateJson.hotelStays[i].start).getMonth();
        var endmonth = new Date(rateJson.hotelStays[i].end).getMonth();
        var startYear = new Date(rateJson.hotelStays[i].start).getFullYear();
        var endYear = new Date(rateJson.hotelStays[i].end).getFullYear();
        if (!(monthJson[caSelectedHotel] && monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear]))
            monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear] = [];

        monthJson[caSelectedHotel][monthOfferNames[startmonth] + startYear].push(rateJson.hotelStays[i]);
        //startmonth ++;
        var arrayendmonth = endmonth;
        if (endYear > startYear) {
            arrayendmonth = startmonth + endmonth + 1
        }
        var thisYear = startYear;
        while (arrayendmonth >= startmonth) {
            if (!monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear])
                monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear] = [];
            monthJson[caSelectedHotel][monthOfferNames[startmonth] + thisYear].push(rateJson.hotelStays[i]);
            caSelectedTodate = new Date(rateJson.hotelStays[i].end);
            startmonth++;
            if (endYear > startYear && startmonth == 12) {
                startmonth = 0;
                thisYear = endYear;
                arrayendmonth = endmonth;
            }
        }
    }


    console.log("FINAL JSON", monthJson);
    return monthJson;
}

//***Removing Ama Calendar rates****//
function addPriceDetails1(response) {
    $('.datepicker-loader').remove();
    var data = response;
    console.log('JSON response', response);

    if (response.errorMessage && response.errorMessage.indexOf('Invalid Promotion Code') != -1) {
        warningBox({
            title: '',
            description: 'The selected hotel is not participating in this offer.',
            callBack: null,
            needsCta: false,
            isWarning: true
        });
        return;
    }

    monthAvailability = monthExisting ? response : processOfferRatesJSON(response);

    if (!currentCalendarMonthName) {
        currentCalendarMonth = currentCalendarInputDate ? currentCalendarInputDate.getMonth() : $("#input-box-from").datepicker("getDate").getMonth();
        //var currentCalendarMonth = $("#input-box1").datepicker("getDate").getMonth();
        if (currentCalendarMonth == undefined || currentCalendarMonth == null) {
            var currentDate = new Date();
            currentCalendarMonth = currentDate.getMonth();
        }
        var currentCalendarMonthName = monthOfferNames[currentCalendarMonth];
        var currentCalendarYear = currentCalendarInputDate ? currentCalendarInputDate.getFullYear() : $("#input-box-to").datepicker("getDate").getFullYear();
        if (!currentCalendarYear) {
            var currentDate = new Date();
            currentCalendarYear = currentDate.getFullYear();
        }
    }
    if (monthAvailability[caSelectedHotel] && monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear]) {
        showPricesOne(monthAvailability[caSelectedHotel][currentCalendarMonthName + currentCalendarYear]);
    }
}

//***Removing Ama Calendar rates****//
function showPricesOne(currentMonth) {
    var localDateTimestamp = "";
    var localDateMonth = "";
    var localDateYear = "";
    let isCheckInContainer = true;
    $(".datepicker-days td").filter(function() {
        var date = $(this).text();
        return /\d/.test(date);

    }).each(function() {
        let $currentInputElem = $(this).parents(".jiva-spa-date-section.package-input-wrp");
        if ($('.bas-right-date-wrap-ama').hasClass('active'))
            isCheckInContainer = false;
        //localDateTimestamp = new Date(new Date($(this).data('date')).toLocaleDateString()).getTime();
        localDateTimestamp = new Date(moment(($(this).data('date'))).format("MM/DD/YYYY")).getTime();
        localDateMonth = monthOfferNames[new Date(localDateTimestamp).getMonth()];
        localDateYear = new Date(localDateTimestamp).getFullYear();
        pricemonth = monthAvailability[caSelectedHotel][localDateMonth + localDateYear];

        if (pricemonth) {
            innerloopbas:
                //console.log("pricemonth",pricemonth);
                for (var i = 0; i < pricemonth.length; i++) {
                    if (localDateTimestamp <= new Date(pricemonth[i].end).getTime() && localDateTimestamp >= new Date(pricemonth[i].start).getTime()) {
                        if (pricemonth[i].status == 'Close') {
                            $(this).attr('data-custom', 'X').addClass("disabled");
                            if (!isCheckInContainer && $(this).prev().attr('data-custom') != 'X') {
                                $(this).removeClass("disabled");
                            }
                            break;
                        }
                        /*else if(pricemonth[i].status == 'Open' || pricemonth[i].status == 'MinStay'){
						var priceStartDate, priceEndDate, price;
						for(var j=0;j<pricemonth[i].prices.length;j++){
						var priceItem = pricemonth[i].prices[j];
						priceStartDate = new Date(priceItem.start).getTime(); 
						priceEndDate = new Date(priceItem.end).getTime(); 
                        //priceItem.currencyCode = priceItem.currencyCode == 'INR' ? '₹' : priceItem.currencyCode;
                        //price = priceItem.currencyCode + parseInt(priceItem.amountBeforeTax) 
						var pricevals = ((parseInt(priceItem.amountBeforeTax)/1000)+'').split('.');
						var decimal= pricevals[1] ? '.'+pricevals[1].substring(0,1)  : '';
						price = '₹' + pricevals[0] + decimal + 'K';
						$(this).attr('data-custom', '');
                            if(localDateTimestamp >= priceStartDate && localDateTimestamp <= priceEndDate){	
						if($("#showPrice").val()){
							$(this).attr('data-custom', price);
                            break innerloopbas;
						  }
						if(isCheckInContainer)
							$(this).removeClass('disabled-checkIn');
						else 
							$(this).removeClass('disabled-checkOut');

						}
                        }
					}*/
                    }
                }
        }
    });
}



$(document).mouseup(function(e) {
    var container = $(".guests-dropdown-wrap");
    var datepickerContainer = $(".input-box-wrapper-ama");

    if (datepickerContainer.is(":visible")) {
        if (!datepickerContainer.is(e.target) && datepickerContainer.has(e.target).length === 0) {
            $('.bas-calander-container-ama').css('display', 'none');
        }
    } else {
        $('.bas-calander-container-ama').css('display', 'none');
    }
    // if the target of the click isn't the container nor a descendant of the container
    if (container.is(":visible")) {
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.toggleClass('display-block');
            $('.check-avblty-guests-input').toggleClass('eNone');
            $('.check-avblty-guests-input .icon-drop-down-arrow').toggleClass('rotate-arrow');
        }
    }
});

/* START - Banner auto suggest textbox - hotels/destinations search */

$("#dest-banner").click(function(event) {
    event.preventDefault();
    if ($("#search-properties").children().length > 1) {
        $("#search-properties").show();
        const myTimeout = setTimeout(regiterRedirectionEvents, 20);
    }
});

function regiterRedirectionEvents() {
    $(".dest-item").click(function() {
        selectDestOrProp($(this));
        //redirectToDestOrHotel($(this).attr("data-redirect-path"));
    });
    $(".hotel-item").click(function() {
        selectDestOrProp($(this));
        /*
        let hotelRedirectionPath = $(this).attr("data-redirect-path");
        if(hotelRedirectionPath.indexOf("accommodations/") == (hotelRedirectionPath.length-15) ) {
            hotelRedirectionPath = hotelRedirectionPath.slice(0, -15);
        }
        redirectToDestOrHotel(hotelRedirectionPath);
        */
    });
}

function selectDestOrProp(selectedElement) {
    $('#dest-banner').val(selectedElement.text());
    $("#search-properties").hide();
    if ($('#checkAvailability').hasClass('enabled') == false)
        $('#checkAvailability').addClass('enabled');
    startOfDataRedirectPath = selectedElement[0].outerHTML.indexOf("data-redirect-path=") + 20;
    selectedHTML = selectedElement[0].outerHTML;
    var reDirectPath = selectedHTML.substring(startOfDataRedirectPath, selectedHTML.indexOf('"', startOfDataRedirectPath));
    //var reDirectPath = selectedElement.children("a").data("redirect-path");
    enableBestAvailableButton(reDirectPath);
}

function redirectToDestOrHotel(dataRedirectPath) {
    document.location.href = dataRedirectPath;
}

$(document).ready(function() {

    $('#onlyBungalow').trigger('click')
    $('.ama-check-availability .radio-button').hide();

    $(window).click(function(e) {
        var id = e.target.id;
        if (id != "dest-banner") {
            if ($('#search-properties').is(':visible')) {
                $('#search-properties').hide();
            }
        }
    });

    //$(".neupass-benfits").css("margin-top", "45px");

    $("#dest-banner").val("");
});

var destBannerInput = $('#dest-banner');
var SELECT_INPUT_DEBOUNCE_RATE = 1000;
var contentRootPath = $('#contentRootPath').val();

function createDestResult(title, path) {
    return '<li class="dest-item ama-dest-item"><a class="select-result-item" data-redirect-path="' + path + '">' + title +
        '</a></li>';
}

function createHotelResult(title, path, hotelId, isOnlyBungalow) {
    return '<li class="hotel-item"><a class="select-result-item" data-hotelId="' + hotelId +
        '"data-isOnlyBungalow="' + isOnlyBungalow + '" data-redirect-path="' + path + '">' + title + '</a></li>';
}

function clearSelectResults() {
    $('#search-properties').empty();
    var items = $('.ama-theme .banner-container #search-properties li');
}

function showSelectResults() {
    $('#search-properties').empty();
    if (propertyArray.destination.length) {
        $('#search-properties').append('<li class="dest-item property-heading">Destinations</li>');
        var destinations = propertyArray.destination;
        destinations.forEach(function(destination) {
            var destRedirectPath = destination.path;
            var destinationString = destination.title;
            var destHtml = createDestResult(destination.title, destRedirectPath);
            $('#search-properties').append(destHtml);
        });
    }

    if (propertyArray.hotel.length) {
        $('#search-properties').append('<li class="dest-item property-heading">Hotels</li>');
        propertyArray.hotel.forEach(function(hotel) {
            var hotelDestination = hotel.title.split(', ');

            var reDirectToRoomPath = hotel.path.concat("accommodations/");
            var hotelHtml = createHotelResult(hotel.title, reDirectToRoomPath, hotel.id, hotel.isOnlyBungalowPage);
            $('#search-properties').append(hotelHtml);

        });
    }
}

$(".ama-dest-item").click(function() {
    //alert("click");
});

$('#dest-banner').on("keyup", debounce(function(e) {
    e.stopPropagation();
    $('#search-properties')[0].classList.remove("d-none");
    if (destBannerInput.val().length > 0) {
        clearSelectResults();

        $.ajax({
            method: "GET",
            url: "/bin/search.data/" + contentRootPath.replace(/\/content\//g, ":") + "//" + destBannerInput.val() + "/result/searchCache.json"
        }).done(function(res, count) {
            if (Object.keys(res.destinations).length) {
                $('#search-properties').append('<li class="dest-item property-heading">Destinations</li>');
                var destinations = res.destinations;
                destinations.forEach(function(destination) {
                    var destRedirectPath = destination.path;
                    var destinationString = destination.title;
                    var destHtml = createDestResult(destination.title, destRedirectPath);
                    $('#search-properties').append(destHtml);

                });
            }
            var websiteHotels = res.hotels.website;
            if (Object.keys(websiteHotels).length) {
                $('#search-properties').append('<li class="dest-item property-heading">Hotels</li>');
                websiteHotels.forEach(function(hotel) {
                    var hotelDestination = hotel.title.split(', ');

                    var reDirectToRoomPath = hotel.path.concat("accommodations/");
                    var hotelHtml = createHotelResultOnlyBunglow(hotel.title, reDirectToRoomPath, hotel.id,
                        hotel.maxGuests, hotel.maxBeds, hotel.isOnlyBungalowPage);
                    $('#search-properties').append(hotelHtml);

                });
            }
            if (!(Object.keys(websiteHotels).length) && !(Object.keys(res.destinations).length)) {
                $('#search-properties').append('<li>No results found. Please try another keyword</li>');
            }
            $('#search-properties').show();
            regiterRedirectionEvents()

        }).fail(function() {
            console.error('Ajax call failed.')
        });

    } else {
        showSelectResults();
        regiterRedirectionEvents();
    }


}, SELECT_INPUT_DEBOUNCE_RATE));

function createHotelResultOnlyBunglow(title, path, hotelId, maxGuests, maxBeds, isOnlyBungalow) {
    return '<li id="' + title + '" class="hotel-item" data-hotelid = "' + hotelId + '" data-max-guests="' +
        maxGuests + '" data-max-beds="' + maxBeds + '" data-redirect-path="' + path + '"' +
        '"data-isOnlyBungalow="true">' + title + '</li>';
}

/* END - Banner auto suggest textbox - hotels/destinations search */

$(document).ready(function() {

    try {
        $(".experience-card").infiniteScrollLazyLoad(true);
    } catch (error) {
        console.error(error);
    }
});

$(document).ready(function() {
    $(".carousel").swipe({

        swipe: function(event, direction, distance, duration, fingerCount, fingerData) {

            if (direction == 'left') $(this).carousel('next');
            if (direction == 'right') $(this).carousel('prev');

        },
        allowPageScroll: "vertical"

    });
});

/**
 * Owl Carousel v2.3.4
 * Copyright 2013-2018 David Deutsch
 * Licensed under: SEE LICENSE IN https://github.com/OwlCarousel2/OwlCarousel2/blob/master/LICENSE
 */
/**
 * Owl carousel
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;
(function($, window, document, undefined) {

    /**
     * Creates a carousel.
     * @class The Owl Carousel.
     * @public
     * @param {HTMLElement|jQuery} element - The element to create the carousel for.
     * @param {Object} [options] - The options
     */
    function Owl(element, options) {

        /**
         * Current settings for the carousel.
         * @public
         */
        this.settings = null;

        /**
         * Current options set by the caller including defaults.
         * @public
         */
        this.options = $.extend({}, Owl.Defaults, options);

        /**
         * Plugin element.
         * @public
         */
        this.$element = $(element);

        /**
         * Proxied event handlers.
         * @protected
         */
        this._handlers = {};

        /**
         * References to the running plugins of this carousel.
         * @protected
         */
        this._plugins = {};

        /**
         * Currently suppressed events to prevent them from being retriggered.
         * @protected
         */
        this._supress = {};

        /**
         * Absolute current position.
         * @protected
         */
        this._current = null;

        /**
         * Animation speed in milliseconds.
         * @protected
         */
        this._speed = null;

        /**
         * Coordinates of all items in pixel.
         * @todo The name of this member is missleading.
         * @protected
         */
        this._coordinates = [];

        /**
         * Current breakpoint.
         * @todo Real media queries would be nice.
         * @protected
         */
        this._breakpoint = null;

        /**
         * Current width of the plugin element.
         */
        this._width = null;

        /**
         * All real items.
         * @protected
         */
        this._items = [];

        /**
         * All cloned items.
         * @protected
         */
        this._clones = [];

        /**
         * Merge values of all items.
         * @todo Maybe this could be part of a plugin.
         * @protected
         */
        this._mergers = [];

        /**
         * Widths of all items.
         */
        this._widths = [];

        /**
         * Invalidated parts within the update process.
         * @protected
         */
        this._invalidated = {};

        /**
         * Ordered list of workers for the update process.
         * @protected
         */
        this._pipe = [];

        /**
         * Current state information for the drag operation.
         * @todo #261
         * @protected
         */
        this._drag = {
            time: null,
            target: null,
            pointer: null,
            stage: {
                start: null,
                current: null
            },
            direction: null
        };

        /**
         * Current state information and their tags.
         * @type {Object}
         * @protected
         */
        this._states = {
            current: {},
            tags: {
                'initializing': ['busy'],
                'animating': ['busy'],
                'dragging': ['interacting']
            }
        };

        $.each(['onResize', 'onThrottledResize'], $.proxy(function(i, handler) {
            this._handlers[handler] = $.proxy(this[handler], this);
        }, this));

        $.each(Owl.Plugins, $.proxy(function(key, plugin) {
            this._plugins[key.charAt(0).toLowerCase() + key.slice(1)] = new plugin(this);
        }, this));

        $.each(Owl.Workers, $.proxy(function(priority, worker) {
            this._pipe.push({
                'filter': worker.filter,
                'run': $.proxy(worker.run, this)
            });
        }, this));

        this.setup();
        this.initialize();
    }

    /**
     * Default options for the carousel.
     * @public
     */
    Owl.Defaults = {
        items: 3,
        loop: false,
        center: false,
        rewind: false,
        checkVisibility: true,

        mouseDrag: true,
        touchDrag: true,
        pullDrag: true,
        freeDrag: false,

        margin: 0,
        stagePadding: 0,

        merge: false,
        mergeFit: true,
        autoWidth: false,

        startPosition: 0,
        rtl: false,

        smartSpeed: 250,
        fluidSpeed: false,
        dragEndSpeed: false,

        responsive: {},
        responsiveRefreshRate: 200,
        responsiveBaseElement: window,

        fallbackEasing: 'swing',
        slideTransition: '',

        info: false,

        nestedItemSelector: false,
        itemElement: 'div',
        stageElement: 'div',

        refreshClass: 'owl-refresh',
        loadedClass: 'owl-loaded',
        loadingClass: 'owl-loading',
        rtlClass: 'owl-rtl',
        responsiveClass: 'owl-responsive',
        dragClass: 'owl-drag',
        itemClass: 'owl-item',
        stageClass: 'owl-stage',
        stageOuterClass: 'owl-stage-outer',
        grabClass: 'owl-grab'
    };

    /**
     * Enumeration for width.
     * @public
     * @readonly
     * @enum {String}
     */
    Owl.Width = {
        Default: 'default',
        Inner: 'inner',
        Outer: 'outer'
    };

    /**
     * Enumeration for types.
     * @public
     * @readonly
     * @enum {String}
     */
    Owl.Type = {
        Event: 'event',
        State: 'state'
    };

    /**
     * Contains all registered plugins.
     * @public
     */
    Owl.Plugins = {};

    /**
     * List of workers involved in the update process.
     */
    Owl.Workers = [{
        filter: ['width', 'settings'],
        run: function() {
            this._width = this.$element.width();
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function(cache) {
            cache.current = this._items && this._items[this.relative(this._current)];
        }
    }, {
        filter: ['items', 'settings'],
        run: function() {
            this.$stage.children('.cloned').remove();
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function(cache) {
            var margin = this.settings.margin || '',
                grid = !this.settings.autoWidth,
                rtl = this.settings.rtl,
                css = {
                    'width': 'auto',
                    'margin-left': rtl ? margin : '',
                    'margin-right': rtl ? '' : margin
                };

            !grid && this.$stage.children().css(css);

            cache.css = css;
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function(cache) {
            var width = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
                merge = null,
                iterator = this._items.length,
                grid = !this.settings.autoWidth,
                widths = [];

            cache.items = {
                merge: false,
                width: width
            };

            while (iterator--) {
                merge = this._mergers[iterator];
                merge = this.settings.mergeFit && Math.min(merge, this.settings.items) || merge;

                cache.items.merge = merge > 1 || cache.items.merge;

                widths[iterator] = !grid ? this._items[iterator].width() : width * merge;
            }

            this._widths = widths;
        }
    }, {
        filter: ['items', 'settings'],
        run: function() {
            var clones = [],
                items = this._items,
                settings = this.settings,
                // TODO: Should be computed from number of min width items in stage
                view = Math.max(settings.items * 2, 4),
                size = Math.ceil(items.length / 2) * 2,
                repeat = settings.loop && items.length ? settings.rewind ? view : Math.max(view, size) : 0,
                append = '',
                prepend = '';

            repeat /= 2;

            while (repeat > 0) {
                // Switch to only using appended clones
                clones.push(this.normalize(clones.length / 2, true));
                append = append + items[clones[clones.length - 1]][0].outerHTML;
                clones.push(this.normalize(items.length - 1 - (clones.length - 1) / 2, true));
                prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
                repeat -= 1;
            }

            this._clones = clones;

            $(append).addClass('cloned').appendTo(this.$stage);
            $(prepend).addClass('cloned').prependTo(this.$stage);
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function() {
            var rtl = this.settings.rtl ? 1 : -1,
                size = this._clones.length + this._items.length,
                iterator = -1,
                previous = 0,
                current = 0,
                coordinates = [];

            while (++iterator < size) {
                previous = coordinates[iterator - 1] || 0;
                current = this._widths[this.relative(iterator)] + this.settings.margin;
                coordinates.push(previous + current * rtl);
            }

            this._coordinates = coordinates;
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function() {
            var padding = this.settings.stagePadding,
                coordinates = this._coordinates,
                css = {
                    'width': Math.ceil(Math.abs(coordinates[coordinates.length - 1])) + padding * 2,
                    'padding-left': padding || '',
                    'padding-right': padding || ''
                };

            this.$stage.css(css);
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function(cache) {
            var iterator = this._coordinates.length,
                grid = !this.settings.autoWidth,
                items = this.$stage.children();

            if (grid && cache.items.merge) {
                while (iterator--) {
                    cache.css.width = this._widths[this.relative(iterator)];
                    items.eq(iterator).css(cache.css);
                }
            } else if (grid) {
                cache.css.width = cache.items.width;
                items.css(cache.css);
            }
        }
    }, {
        filter: ['items'],
        run: function() {
            this._coordinates.length < 1 && this.$stage.removeAttr('style');
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function(cache) {
            cache.current = cache.current ? this.$stage.children().index(cache.current) : 0;
            cache.current = Math.max(this.minimum(), Math.min(this.maximum(), cache.current));
            this.reset(cache.current);
        }
    }, {
        filter: ['position'],
        run: function() {
            this.animate(this.coordinates(this._current));
        }
    }, {
        filter: ['width', 'position', 'items', 'settings'],
        run: function() {
            var rtl = this.settings.rtl ? 1 : -1,
                padding = this.settings.stagePadding * 2,
                begin = this.coordinates(this.current()) + padding,
                end = begin + this.width() * rtl,
                inner, outer, matches = [],
                i, n;

            for (i = 0, n = this._coordinates.length; i < n; i++) {
                inner = this._coordinates[i - 1] || 0;
                outer = Math.abs(this._coordinates[i]) + padding * rtl;

                if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end))) ||
                    (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
                    matches.push(i);
                }
            }

            this.$stage.children('.active').removeClass('active');
            this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass('active');

            this.$stage.children('.center').removeClass('center');
            if (this.settings.center) {
                this.$stage.children().eq(this.current()).addClass('center');
            }
        }
    }];

    /**
     * Create the stage DOM element
     */
    Owl.prototype.initializeStage = function() {
        this.$stage = this.$element.find('.' + this.settings.stageClass);

        // if the stage is already in the DOM, grab it and skip stage initialization
        if (this.$stage.length) {
            return;
        }

        this.$element.addClass(this.options.loadingClass);

        // create stage
        this.$stage = $('<' + this.settings.stageElement + '>', {
            "class": this.settings.stageClass
        }).wrap($('<div/>', {
            "class": this.settings.stageOuterClass
        }));

        // append stage
        this.$element.append(this.$stage.parent());
    };

    /**
     * Create item DOM elements
     */
    Owl.prototype.initializeItems = function() {
        var $items = this.$element.find('.owl-item');

        // if the items are already in the DOM, grab them and skip item initialization
        if ($items.length) {
            this._items = $items.get().map(function(item) {
                return $(item);
            });

            this._mergers = this._items.map(function() {
                return 1;
            });

            this.refresh();

            return;
        }

        // append content
        this.replace(this.$element.children().not(this.$stage.parent()));

        // check visibility
        if (this.isVisible()) {
            // update view
            this.refresh();
        } else {
            // invalidate width
            this.invalidate('width');
        }

        this.$element
            .removeClass(this.options.loadingClass)
            .addClass(this.options.loadedClass);
    };

    /**
     * Initializes the carousel.
     * @protected
     */
    Owl.prototype.initialize = function() {
        this.enter('initializing');
        this.trigger('initialize');

        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

        if (this.settings.autoWidth && !this.is('pre-loading')) {
            var imgs, nestedSelector, width;
            imgs = this.$element.find('img');
            nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
            width = this.$element.children(nestedSelector).width();

            if (imgs.length && width <= 0) {
                this.preloadAutoWidthImages(imgs);
            }
        }

        this.initializeStage();
        this.initializeItems();

        // register event handlers
        this.registerEventHandlers();

        this.leave('initializing');
        this.trigger('initialized');
    };

    /**
     * @returns {Boolean} visibility of $element
     *                    if you know the carousel will always be visible you can set `checkVisibility` to `false` to
     *                    prevent the expensive browser layout forced reflow the $element.is(':visible') does
     */
    Owl.prototype.isVisible = function() {
        return this.settings.checkVisibility ?
            this.$element.is(':visible') :
            true;
    };

    /**
     * Setups the current settings.
     * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
     * @todo Support for media queries by using `matchMedia` would be nice.
     * @public
     */
    Owl.prototype.setup = function() {
        var viewport = this.viewport(),
            overwrites = this.options.responsive,
            match = -1,
            settings = null;

        if (!overwrites) {
            settings = $.extend({}, this.options);
        } else {
            $.each(overwrites, function(breakpoint) {
                if (breakpoint <= viewport && breakpoint > match) {
                    match = Number(breakpoint);
                }
            });

            settings = $.extend({}, this.options, overwrites[match]);
            if (typeof settings.stagePadding === 'function') {
                settings.stagePadding = settings.stagePadding();
            }
            delete settings.responsive;

            // responsive class
            if (settings.responsiveClass) {
                this.$element.attr('class',
                    this.$element.attr('class').replace(new RegExp('(' + this.options.responsiveClass + '-)\\S+\\s', 'g'), '$1' + match)
                );
            }
        }

        this.trigger('change', {
            property: {
                name: 'settings',
                value: settings
            }
        });
        this._breakpoint = match;
        this.settings = settings;
        this.invalidate('settings');
        this.trigger('changed', {
            property: {
                name: 'settings',
                value: this.settings
            }
        });
    };

    /**
     * Updates option logic if necessery.
     * @protected
     */
    Owl.prototype.optionsLogic = function() {
        if (this.settings.autoWidth) {
            this.settings.stagePadding = false;
            this.settings.merge = false;
        }
    };

    /**
     * Prepares an item before add.
     * @todo Rename event parameter `content` to `item`.
     * @protected
     * @returns {jQuery|HTMLElement} - The item container.
     */
    Owl.prototype.prepare = function(item) {
        var event = this.trigger('prepare', {
            content: item
        });

        if (!event.data) {
            event.data = $('<' + this.settings.itemElement + '/>')
                .addClass(this.options.itemClass).append(item)
        }

        this.trigger('prepared', {
            content: event.data
        });

        return event.data;
    };

    /**
     * Updates the view.
     * @public
     */
    Owl.prototype.update = function() {
        var i = 0,
            n = this._pipe.length,
            filter = $.proxy(function(p) {
                return this[p]
            }, this._invalidated),
            cache = {};

        while (i < n) {
            if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
                this._pipe[i].run(cache);
            }
            i++;
        }

        this._invalidated = {};

        !this.is('valid') && this.enter('valid');
    };

    /**
     * Gets the width of the view.
     * @public
     * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
     * @returns {Number} - The width of the view in pixel.
     */
    Owl.prototype.width = function(dimension) {
        dimension = dimension || Owl.Width.Default;
        switch (dimension) {
            case Owl.Width.Inner:
            case Owl.Width.Outer:
                return this._width;
            default:
                return this._width - this.settings.stagePadding * 2 + this.settings.margin;
        }
    };

    /**
     * Refreshes the carousel primarily for adaptive purposes.
     * @public
     */
    Owl.prototype.refresh = function() {
        this.enter('refreshing');
        this.trigger('refresh');

        this.setup();

        this.optionsLogic();

        this.$element.addClass(this.options.refreshClass);

        this.update();

        this.$element.removeClass(this.options.refreshClass);

        this.leave('refreshing');
        this.trigger('refreshed');
    };

    /**
     * Checks window `resize` event.
     * @protected
     */
    Owl.prototype.onThrottledResize = function() {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate);
    };

    /**
     * Checks window `resize` event.
     * @protected
     */
    Owl.prototype.onResize = function() {
        if (!this._items.length) {
            return false;
        }

        if (this._width === this.$element.width()) {
            return false;
        }

        if (!this.isVisible()) {
            return false;
        }

        this.enter('resizing');

        if (this.trigger('resize').isDefaultPrevented()) {
            this.leave('resizing');
            return false;
        }

        this.invalidate('width');

        this.refresh();

        this.leave('resizing');
        this.trigger('resized');
    };

    /**
     * Registers event handlers.
     * @todo Check `msPointerEnabled`
     * @todo #261
     * @protected
     */
    Owl.prototype.registerEventHandlers = function() {
        if ($.support.transition) {
            this.$stage.on($.support.transition.end + '.owl.core', $.proxy(this.onTransitionEnd, this));
        }

        if (this.settings.responsive !== false) {
            this.on(window, 'resize', this._handlers.onThrottledResize);
        }

        if (this.settings.mouseDrag) {
            this.$element.addClass(this.options.dragClass);
            this.$stage.on('mousedown.owl.core', $.proxy(this.onDragStart, this));
            this.$stage.on('dragstart.owl.core selectstart.owl.core', function() {
                return false
            });
        }

        if (this.settings.touchDrag) {
            this.$stage.on('touchstart.owl.core', $.proxy(this.onDragStart, this));
            this.$stage.on('touchcancel.owl.core', $.proxy(this.onDragEnd, this));
        }
    };

    /**
     * Handles `touchstart` and `mousedown` events.
     * @todo Horizontal swipe threshold as option
     * @todo #261
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragStart = function(event) {
        var stage = null;

        if (event.which === 3) {
            return;
        }

        if ($.support.transform) {
            stage = this.$stage.css('transform').replace(/.*\(|\)| /g, '').split(',');
            stage = {
                x: stage[stage.length === 16 ? 12 : 4],
                y: stage[stage.length === 16 ? 13 : 5]
            };
        } else {
            stage = this.$stage.position();
            stage = {
                x: this.settings.rtl ?
                    stage.left + this.$stage.width() - this.width() + this.settings.margin : stage.left,
                y: stage.top
            };
        }

        if (this.is('animating')) {
            $.support.transform ? this.animate(stage.x) : this.$stage.stop()
            this.invalidate('position');
        }

        this.$element.toggleClass(this.options.grabClass, event.type === 'mousedown');

        this.speed(0);

        this._drag.time = new Date().getTime();
        this._drag.target = $(event.target);
        this._drag.stage.start = stage;
        this._drag.stage.current = stage;
        this._drag.pointer = this.pointer(event);

        $(document).on('mouseup.owl.core touchend.owl.core', $.proxy(this.onDragEnd, this));

        $(document).one('mousemove.owl.core touchmove.owl.core', $.proxy(function(event) {
            var delta = this.difference(this._drag.pointer, this.pointer(event));

            $(document).on('mousemove.owl.core touchmove.owl.core', $.proxy(this.onDragMove, this));

            if (Math.abs(delta.x) < Math.abs(delta.y) && this.is('valid')) {
                return;
            }

            event.preventDefault();

            this.enter('dragging');
            this.trigger('drag');
        }, this));
    };

    /**
     * Handles the `touchmove` and `mousemove` events.
     * @todo #261
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragMove = function(event) {
        var minimum = null,
            maximum = null,
            pull = null,
            delta = this.difference(this._drag.pointer, this.pointer(event)),
            stage = this.difference(this._drag.stage.start, delta);

        if (!this.is('dragging')) {
            return;
        }

        event.preventDefault();

        if (this.settings.loop) {
            minimum = this.coordinates(this.minimum());
            maximum = this.coordinates(this.maximum() + 1) - minimum;
            stage.x = (((stage.x - minimum) % maximum + maximum) % maximum) + minimum;
        } else {
            minimum = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
            maximum = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
            pull = this.settings.pullDrag ? -1 * delta.x / 5 : 0;
            stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
        }

        this._drag.stage.current = stage;

        this.animate(stage.x);
    };

    /**
     * Handles the `touchend` and `mouseup` events.
     * @todo #261
     * @todo Threshold for click event
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragEnd = function(event) {
        var delta = this.difference(this._drag.pointer, this.pointer(event)),
            stage = this._drag.stage.current,
            direction = delta.x > 0 ^ this.settings.rtl ? 'left' : 'right';

        $(document).off('.owl.core');

        this.$element.removeClass(this.options.grabClass);

        if (delta.x !== 0 && this.is('dragging') || !this.is('valid')) {
            this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
            this.current(this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction));
            this.invalidate('position');
            this.update();

            this._drag.direction = direction;

            if (Math.abs(delta.x) > 3 || new Date().getTime() - this._drag.time > 300) {
                this._drag.target.one('click.owl.core', function() {
                    return false;
                });
            }
        }

        if (!this.is('dragging')) {
            return;
        }

        this.leave('dragging');
        this.trigger('dragged');
    };

    /**
     * Gets absolute position of the closest item for a coordinate.
     * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
     * @protected
     * @param {Number} coordinate - The coordinate in pixel.
     * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
     * @return {Number} - The absolute position of the closest item.
     */
    Owl.prototype.closest = function(coordinate, direction) {
        var position = -1,
            pull = 30,
            width = this.width(),
            coordinates = this.coordinates();

        if (!this.settings.freeDrag) {
            // check closest item
            $.each(coordinates, $.proxy(function(index, value) {
                // on a left pull, check on current index
                if (direction === 'left' && coordinate > value - pull && coordinate < value + pull) {
                    position = index;
                    // on a right pull, check on previous index
                    // to do so, subtract width from value and set position = index + 1
                } else if (direction === 'right' && coordinate > value - width - pull && coordinate < value - width + pull) {
                    position = index + 1;
                } else if (this.op(coordinate, '<', value) &&
                    this.op(coordinate, '>', coordinates[index + 1] !== undefined ? coordinates[index + 1] : value - width)) {
                    position = direction === 'left' ? index + 1 : index;
                }
                return position === -1;
            }, this));
        }

        if (!this.settings.loop) {
            // non loop boundries
            if (this.op(coordinate, '>', coordinates[this.minimum()])) {
                position = coordinate = this.minimum();
            } else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
                position = coordinate = this.maximum();
            }
        }

        return position;
    };

    /**
     * Animates the stage.
     * @todo #270
     * @public
     * @param {Number} coordinate - The coordinate in pixels.
     */
    Owl.prototype.animate = function(coordinate) {
        var animate = this.speed() > 0;

        this.is('animating') && this.onTransitionEnd();

        if (animate) {
            this.enter('animating');
            this.trigger('translate');
        }

        if ($.support.transform3d && $.support.transition) {
            this.$stage.css({
                transform: 'translate3d(' + coordinate + 'px,0px,0px)',
                transition: (this.speed() / 1000) + 's' + (
                    this.settings.slideTransition ? ' ' + this.settings.slideTransition : ''
                )
            });
        } else if (animate) {
            this.$stage.animate({
                left: coordinate + 'px'
            }, this.speed(), this.settings.fallbackEasing, $.proxy(this.onTransitionEnd, this));
        } else {
            this.$stage.css({
                left: coordinate + 'px'
            });
        }
    };

    /**
     * Checks whether the carousel is in a specific state or not.
     * @param {String} state - The state to check.
     * @returns {Boolean} - The flag which indicates if the carousel is busy.
     */
    Owl.prototype.is = function(state) {
        return this._states.current[state] && this._states.current[state] > 0;
    };

    /**
     * Sets the absolute position of the current item.
     * @public
     * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
     * @returns {Number} - The absolute position of the current item.
     */
    Owl.prototype.current = function(position) {
        if (position === undefined) {
            return this._current;
        }

        if (this._items.length === 0) {
            return undefined;
        }

        position = this.normalize(position);

        if (this._current !== position) {
            var event = this.trigger('change', {
                property: {
                    name: 'position',
                    value: position
                }
            });

            if (event.data !== undefined) {
                position = this.normalize(event.data);
            }

            this._current = position;

            this.invalidate('position');

            this.trigger('changed', {
                property: {
                    name: 'position',
                    value: this._current
                }
            });
        }

        return this._current;
    };

    /**
     * Invalidates the given part of the update routine.
     * @param {String} [part] - The part to invalidate.
     * @returns {Array.<String>} - The invalidated parts.
     */
    Owl.prototype.invalidate = function(part) {
        if ($.type(part) === 'string') {
            this._invalidated[part] = true;
            this.is('valid') && this.leave('valid');
        }
        return $.map(this._invalidated, function(v, i) {
            return i
        });
    };

    /**
     * Resets the absolute position of the current item.
     * @public
     * @param {Number} position - The absolute position of the new item.
     */
    Owl.prototype.reset = function(position) {
        position = this.normalize(position);

        if (position === undefined) {
            return;
        }

        this._speed = 0;
        this._current = position;

        this.suppress(['translate', 'translated']);

        this.animate(this.coordinates(position));

        this.release(['translate', 'translated']);
    };

    /**
     * Normalizes an absolute or a relative position of an item.
     * @public
     * @param {Number} position - The absolute or relative position to normalize.
     * @param {Boolean} [relative=false] - Whether the given position is relative or not.
     * @returns {Number} - The normalized position.
     */
    Owl.prototype.normalize = function(position, relative) {
        var n = this._items.length,
            m = relative ? 0 : this._clones.length;

        if (!this.isNumeric(position) || n < 1) {
            position = undefined;
        } else if (position < 0 || position >= n + m) {
            position = ((position - m / 2) % n + n) % n + m / 2;
        }

        return position;
    };

    /**
     * Converts an absolute position of an item into a relative one.
     * @public
     * @param {Number} position - The absolute position to convert.
     * @returns {Number} - The converted position.
     */
    Owl.prototype.relative = function(position) {
        position -= this._clones.length / 2;
        return this.normalize(position, true);
    };

    /**
     * Gets the maximum position for the current item.
     * @public
     * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
     * @returns {Number}
     */
    Owl.prototype.maximum = function(relative) {
        var settings = this.settings,
            maximum = this._coordinates.length,
            iterator,
            reciprocalItemsWidth,
            elementWidth;

        if (settings.loop) {
            maximum = this._clones.length / 2 + this._items.length - 1;
        } else if (settings.autoWidth || settings.merge) {
            iterator = this._items.length;
            if (iterator) {
                reciprocalItemsWidth = this._items[--iterator].width();
                elementWidth = this.$element.width();
                while (iterator--) {
                    reciprocalItemsWidth += this._items[iterator].width() + this.settings.margin;
                    if (reciprocalItemsWidth > elementWidth) {
                        break;
                    }
                }
            }
            maximum = iterator + 1;
        } else if (settings.center) {
            maximum = this._items.length - 1;
        } else {
            maximum = this._items.length - settings.items;
        }

        if (relative) {
            maximum -= this._clones.length / 2;
        }

        return Math.max(maximum, 0);
    };

    /**
     * Gets the minimum position for the current item.
     * @public
     * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
     * @returns {Number}
     */
    Owl.prototype.minimum = function(relative) {
        return relative ? 0 : this._clones.length / 2;
    };

    /**
     * Gets an item at the specified relative position.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
     */
    Owl.prototype.items = function(position) {
        if (position === undefined) {
            return this._items.slice();
        }

        position = this.normalize(position, true);
        return this._items[position];
    };

    /**
     * Gets an item at the specified relative position.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
     */
    Owl.prototype.mergers = function(position) {
        if (position === undefined) {
            return this._mergers.slice();
        }

        position = this.normalize(position, true);
        return this._mergers[position];
    };

    /**
     * Gets the absolute positions of clones for an item.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
     */
    Owl.prototype.clones = function(position) {
        var odd = this._clones.length / 2,
            even = odd + this._items.length,
            map = function(index) {
                return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2
            };

        if (position === undefined) {
            return $.map(this._clones, function(v, i) {
                return map(i)
            });
        }

        return $.map(this._clones, function(v, i) {
            return v === position ? map(i) : null
        });
    };

    /**
     * Sets the current animation speed.
     * @public
     * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
     * @returns {Number} - The current animation speed in milliseconds.
     */
    Owl.prototype.speed = function(speed) {
        if (speed !== undefined) {
            this._speed = speed;
        }

        return this._speed;
    };

    /**
     * Gets the coordinate of an item.
     * @todo The name of this method is missleanding.
     * @public
     * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
     * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
     */
    Owl.prototype.coordinates = function(position) {
        var multiplier = 1,
            newPosition = position - 1,
            coordinate;

        if (position === undefined) {
            return $.map(this._coordinates, $.proxy(function(coordinate, index) {
                return this.coordinates(index);
            }, this));
        }

        if (this.settings.center) {
            if (this.settings.rtl) {
                multiplier = -1;
                newPosition = position + 1;
            }

            coordinate = this._coordinates[position];
            coordinate += (this.width() - coordinate + (this._coordinates[newPosition] || 0)) / 2 * multiplier;
        } else {
            coordinate = this._coordinates[newPosition] || 0;
        }

        coordinate = Math.ceil(coordinate);

        return coordinate;
    };

    /**
     * Calculates the speed for a translation.
     * @protected
     * @param {Number} from - The absolute position of the start item.
     * @param {Number} to - The absolute position of the target item.
     * @param {Number} [factor=undefined] - The time factor in milliseconds.
     * @returns {Number} - The time in milliseconds for the translation.
     */
    Owl.prototype.duration = function(from, to, factor) {
        if (factor === 0) {
            return 0;
        }

        return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
    };

    /**
     * Slides to the specified item.
     * @public
     * @param {Number} position - The position of the item.
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.to = function(position, speed) {
        var current = this.current(),
            revert = null,
            distance = position - this.relative(current),
            direction = (distance > 0) - (distance < 0),
            items = this._items.length,
            minimum = this.minimum(),
            maximum = this.maximum();

        if (this.settings.loop) {
            if (!this.settings.rewind && Math.abs(distance) > items / 2) {
                distance += direction * -1 * items;
            }

            position = current + distance;
            revert = ((position - minimum) % items + items) % items + minimum;

            if (revert !== position && revert - distance <= maximum && revert - distance > 0) {
                current = revert - distance;
                position = revert;
                this.reset(current);
            }
        } else if (this.settings.rewind) {
            maximum += 1;
            position = (position % maximum + maximum) % maximum;
        } else {
            position = Math.max(minimum, Math.min(maximum, position));
        }

        this.speed(this.duration(current, position, speed));
        this.current(position);

        if (this.isVisible()) {
            this.update();
        }
    };

    /**
     * Slides to the next item.
     * @public
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.next = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) + 1, speed);
    };

    /**
     * Slides to the previous item.
     * @public
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.prev = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) - 1, speed);
    };

    /**
     * Handles the end of an animation.
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onTransitionEnd = function(event) {

        // if css2 animation then event object is undefined
        if (event !== undefined) {
            event.stopPropagation();

            // Catch only owl-stage transitionEnd event
            if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
                return false;
            }
        }

        this.leave('animating');
        this.trigger('translated');
    };

    /**
     * Gets viewport width.
     * @protected
     * @return {Number} - The width in pixel.
     */
    Owl.prototype.viewport = function() {
        var width;
        if (this.options.responsiveBaseElement !== window) {
            width = $(this.options.responsiveBaseElement).width();
        } else if (window.innerWidth) {
            width = window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            width = document.documentElement.clientWidth;
        } else {
            console.warn('Can not detect viewport width.');
        }
        return width;
    };

    /**
     * Replaces the current content.
     * @public
     * @param {HTMLElement|jQuery|String} content - The new content.
     */
    Owl.prototype.replace = function(content) {
        this.$stage.empty();
        this._items = [];

        if (content) {
            content = (content instanceof jQuery) ? content : $(content);
        }

        if (this.settings.nestedItemSelector) {
            content = content.find('.' + this.settings.nestedItemSelector);
        }

        content.filter(function() {
            return this.nodeType === 1;
        }).each($.proxy(function(index, item) {
            item = this.prepare(item);
            this.$stage.append(item);
            this._items.push(item);
            this._mergers.push(item.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
        }, this));

        this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

        this.invalidate('items');
    };

    /**
     * Adds an item.
     * @todo Use `item` instead of `content` for the event arguments.
     * @public
     * @param {HTMLElement|jQuery|String} content - The item content to add.
     * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
     */
    Owl.prototype.add = function(content, position) {
        var current = this.relative(this._current);

        position = position === undefined ? this._items.length : this.normalize(position, true);
        content = content instanceof jQuery ? content : $(content);

        this.trigger('add', {
            content: content,
            position: position
        });

        content = this.prepare(content);

        if (this._items.length === 0 || position === this._items.length) {
            this._items.length === 0 && this.$stage.append(content);
            this._items.length !== 0 && this._items[position - 1].after(content);
            this._items.push(content);
            this._mergers.push(content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
        } else {
            this._items[position].before(content);
            this._items.splice(position, 0, content);
            this._mergers.splice(position, 0, content.find('[data-merge]').addBack('[data-merge]').attr('data-merge') * 1 || 1);
        }

        this._items[current] && this.reset(this._items[current].index());

        this.invalidate('items');

        this.trigger('added', {
            content: content,
            position: position
        });
    };

    /**
     * Removes an item by its position.
     * @todo Use `item` instead of `content` for the event arguments.
     * @public
     * @param {Number} position - The relative position of the item to remove.
     */
    Owl.prototype.remove = function(position) {
        position = this.normalize(position, true);

        if (position === undefined) {
            return;
        }

        this.trigger('remove', {
            content: this._items[position],
            position: position
        });

        this._items[position].remove();
        this._items.splice(position, 1);
        this._mergers.splice(position, 1);

        this.invalidate('items');

        this.trigger('removed', {
            content: null,
            position: position
        });
    };

    /**
     * Preloads images with auto width.
     * @todo Replace by a more generic approach
     * @protected
     */
    Owl.prototype.preloadAutoWidthImages = function(images) {
        images.each($.proxy(function(i, element) {
            this.enter('pre-loading');
            element = $(element);
            $(new Image()).one('load', $.proxy(function(e) {
                element.attr('src', e.target.src);
                element.css('opacity', 1);
                this.leave('pre-loading');
                !this.is('pre-loading') && !this.is('initializing') && this.refresh();
            }, this)).attr('src', element.attr('src') || element.attr('data-src') || element.attr('data-src-retina'));
        }, this));
    };

    /**
     * Destroys the carousel.
     * @public
     */
    Owl.prototype.destroy = function() {

        this.$element.off('.owl.core');
        this.$stage.off('.owl.core');
        $(document).off('.owl.core');

        if (this.settings.responsive !== false) {
            window.clearTimeout(this.resizeTimer);
            this.off(window, 'resize', this._handlers.onThrottledResize);
        }

        for (var i in this._plugins) {
            this._plugins[i].destroy();
        }

        this.$stage.children('.cloned').remove();

        this.$stage.unwrap();
        this.$stage.children().contents().unwrap();
        this.$stage.children().unwrap();
        this.$stage.remove();
        this.$element
            .removeClass(this.options.refreshClass)
            .removeClass(this.options.loadingClass)
            .removeClass(this.options.loadedClass)
            .removeClass(this.options.rtlClass)
            .removeClass(this.options.dragClass)
            .removeClass(this.options.grabClass)
            .attr('class', this.$element.attr('class').replace(new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'), ''))
            .removeData('owl.carousel');
    };

    /**
     * Operators to calculate right-to-left and left-to-right.
     * @protected
     * @param {Number} [a] - The left side operand.
     * @param {String} [o] - The operator.
     * @param {Number} [b] - The right side operand.
     */
    Owl.prototype.op = function(a, o, b) {
        var rtl = this.settings.rtl;
        switch (o) {
            case '<':
                return rtl ? a > b : a < b;
            case '>':
                return rtl ? a < b : a > b;
            case '>=':
                return rtl ? a <= b : a >= b;
            case '<=':
                return rtl ? a >= b : a <= b;
            default:
                break;
        }
    };

    /**
     * Attaches to an internal event.
     * @protected
     * @param {HTMLElement} element - The event source.
     * @param {String} event - The event name.
     * @param {Function} listener - The event handler to attach.
     * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
     */
    Owl.prototype.on = function(element, event, listener, capture) {
        if (element.addEventListener) {
            element.addEventListener(event, listener, capture);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, listener);
        }
    };

    /**
     * Detaches from an internal event.
     * @protected
     * @param {HTMLElement} element - The event source.
     * @param {String} event - The event name.
     * @param {Function} listener - The attached event handler to detach.
     * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
     */
    Owl.prototype.off = function(element, event, listener, capture) {
        if (element.removeEventListener) {
            element.removeEventListener(event, listener, capture);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, listener);
        }
    };

    /**
     * Triggers a public event.
     * @todo Remove `status`, `relatedTarget` should be used instead.
     * @protected
     * @param {String} name - The event name.
     * @param {*} [data=null] - The event data.
     * @param {String} [namespace=carousel] - The event namespace.
     * @param {String} [state] - The state which is associated with the event.
     * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
     * @returns {Event} - The event arguments.
     */
    Owl.prototype.trigger = function(name, data, namespace, state, enter) {
        var status = {
                item: {
                    count: this._items.length,
                    index: this.current()
                }
            },
            handler = $.camelCase(
                $.grep(['on', name, namespace], function(v) {
                    return v
                })
                .join('-').toLowerCase()
            ),
            event = $.Event(
                [name, 'owl', namespace || 'carousel'].join('.').toLowerCase(),
                $.extend({
                    relatedTarget: this
                }, status, data)
            );

        if (!this._supress[name]) {
            $.each(this._plugins, function(name, plugin) {
                if (plugin.onTrigger) {
                    plugin.onTrigger(event);
                }
            });

            this.register({
                type: Owl.Type.Event,
                name: name
            });
            this.$element.trigger(event);

            if (this.settings && typeof this.settings[handler] === 'function') {
                this.settings[handler].call(this, event);
            }
        }

        return event;
    };

    /**
     * Enters a state.
     * @param name - The state name.
     */
    Owl.prototype.enter = function(name) {
        $.each([name].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
            if (this._states.current[name] === undefined) {
                this._states.current[name] = 0;
            }

            this._states.current[name]++;
        }, this));
    };

    /**
     * Leaves a state.
     * @param name - The state name.
     */
    Owl.prototype.leave = function(name) {
        $.each([name].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
            this._states.current[name]--;
        }, this));
    };

    /**
     * Registers an event or state.
     * @public
     * @param {Object} object - The event or state to register.
     */
    Owl.prototype.register = function(object) {
        if (object.type === Owl.Type.Event) {
            if (!$.event.special[object.name]) {
                $.event.special[object.name] = {};
            }

            if (!$.event.special[object.name].owl) {
                var _default = $.event.special[object.name]._default;
                $.event.special[object.name]._default = function(e) {
                    if (_default && _default.apply && (!e.namespace || e.namespace.indexOf('owl') === -1)) {
                        return _default.apply(this, arguments);
                    }
                    return e.namespace && e.namespace.indexOf('owl') > -1;
                };
                $.event.special[object.name].owl = true;
            }
        } else if (object.type === Owl.Type.State) {
            if (!this._states.tags[object.name]) {
                this._states.tags[object.name] = object.tags;
            } else {
                this._states.tags[object.name] = this._states.tags[object.name].concat(object.tags);
            }

            this._states.tags[object.name] = $.grep(this._states.tags[object.name], $.proxy(function(tag, i) {
                return $.inArray(tag, this._states.tags[object.name]) === i;
            }, this));
        }
    };

    /**
     * Suppresses events.
     * @protected
     * @param {Array.<String>} events - The events to suppress.
     */
    Owl.prototype.suppress = function(events) {
        $.each(events, $.proxy(function(index, event) {
            this._supress[event] = true;
        }, this));
    };

    /**
     * Releases suppressed events.
     * @protected
     * @param {Array.<String>} events - The events to release.
     */
    Owl.prototype.release = function(events) {
        $.each(events, $.proxy(function(index, event) {
            delete this._supress[event];
        }, this));
    };

    /**
     * Gets unified pointer coordinates from event.
     * @todo #261
     * @protected
     * @param {Event} - The `mousedown` or `touchstart` event.
     * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
     */
    Owl.prototype.pointer = function(event) {
        var result = {
            x: null,
            y: null
        };

        event = event.originalEvent || event || window.event;

        event = event.touches && event.touches.length ?
            event.touches[0] : event.changedTouches && event.changedTouches.length ?
            event.changedTouches[0] : event;

        if (event.pageX) {
            result.x = event.pageX;
            result.y = event.pageY;
        } else {
            result.x = event.clientX;
            result.y = event.clientY;
        }

        return result;
    };

    /**
     * Determines if the input is a Number or something that can be coerced to a Number
     * @protected
     * @param {Number|String|Object|Array|Boolean|RegExp|Function|Symbol} - The input to be tested
     * @returns {Boolean} - An indication if the input is a Number or can be coerced to a Number
     */
    Owl.prototype.isNumeric = function(number) {
        return !isNaN(parseFloat(number));
    };

    /**
     * Gets the difference of two vectors.
     * @todo #261
     * @protected
     * @param {Object} - The first vector.
     * @param {Object} - The second vector.
     * @returns {Object} - The difference.
     */
    Owl.prototype.difference = function(first, second) {
        return {
            x: first.x - second.x,
            y: first.y - second.y
        };
    };

    /**
     * The jQuery Plugin for the Owl Carousel
     * @todo Navigation plugin `next` and `prev`
     * @public
     */
    $.fn.owlCarousel = function(option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function() {
            var $this = $(this),
                data = $this.data('owl.carousel');

            if (!data) {
                data = new Owl(this, typeof option == 'object' && option);
                $this.data('owl.carousel', data);

                $.each([
                    'next', 'prev', 'to', 'destroy', 'refresh', 'replace', 'add', 'remove'
                ], function(i, event) {
                    data.register({
                        type: Owl.Type.Event,
                        name: event
                    });
                    data.$element.on(event + '.owl.carousel.core', $.proxy(function(e) {
                        if (e.namespace && e.relatedTarget !== this) {
                            this.suppress([event]);
                            data[event].apply(this, [].slice.call(arguments, 1));
                            this.release([event]);
                        }
                    }, data));
                });
            }

            if (typeof option == 'string' && option.charAt(0) !== '_') {
                data[option].apply(data, args);
            }
        });
    };

    /**
     * The constructor for the jQuery Plugin
     * @public
     */
    $.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the auto refresh plugin.
     * @class The Auto Refresh Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var AutoRefresh = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Refresh interval.
         * @protected
         * @type {number}
         */
        this._interval = null;

        /**
         * Whether the element is currently visible or not.
         * @protected
         * @type {Boolean}
         */
        this._visible = null;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoRefresh) {
                    this.watch();
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     */
    AutoRefresh.Defaults = {
        autoRefresh: true,
        autoRefreshInterval: 500
    };

    /**
     * Watches the element.
     */
    AutoRefresh.prototype.watch = function() {
        if (this._interval) {
            return;
        }

        this._visible = this._core.isVisible();
        this._interval = window.setInterval($.proxy(this.refresh, this), this._core.settings.autoRefreshInterval);
    };

    /**
     * Refreshes the element.
     */
    AutoRefresh.prototype.refresh = function() {
        if (this._core.isVisible() === this._visible) {
            return;
        }

        this._visible = !this._visible;

        this._core.$element.toggleClass('owl-hidden', !this._visible);

        this._visible && (this._core.invalidate('width') && this._core.refresh());
    };

    /**
     * Destroys the plugin.
     */
    AutoRefresh.prototype.destroy = function() {
        var handler, property;

        window.clearInterval(this._interval);

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the lazy plugin.
     * @class The Lazy Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Lazy = function(carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Already loaded items.
         * @protected
         * @type {Array.<jQuery>}
         */
        this._loaded = [];

        /**
         * Event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel change.owl.carousel resized.owl.carousel': $.proxy(function(e) {
                if (!e.namespace) {
                    return;
                }

                if (!this._core.settings || !this._core.settings.lazyLoad) {
                    return;
                }

                if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
                    var settings = this._core.settings,
                        n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
                        i = ((settings.center && n * -1) || 0),
                        position = (e.property && e.property.value !== undefined ? e.property.value : this._core.current()) + i,
                        clones = this._core.clones().length,
                        load = $.proxy(function(i, v) {
                            this.load(v)
                        }, this);
                    //TODO: Need documentation for this new option
                    if (settings.lazyLoadEager > 0) {
                        n += settings.lazyLoadEager;
                        // If the carousel is looping also preload images that are to the "left"
                        if (settings.loop) {
                            position -= settings.lazyLoadEager;
                            n++;
                        }
                    }

                    while (i++ < n) {
                        this.load(clones / 2 + this._core.relative(position));
                        clones && $.each(this._core.clones(this._core.relative(position)), load);
                        position++;
                    }
                }
            }, this)
        };

        // set the default options
        this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

        // register event handler
        this._core.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     */
    Lazy.Defaults = {
        lazyLoad: false,
        lazyLoadEager: 0
    };

    /**
     * Loads all resources of an item at the specified position.
     * @param {Number} position - The absolute position of the item.
     * @protected
     */
    Lazy.prototype.load = function(position) {
        var $item = this._core.$stage.children().eq(position),
            $elements = $item && $item.find('.owl-lazy');

        if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
            return;
        }

        $elements.each($.proxy(function(index, element) {
            var $element = $(element),
                image,
                url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src') || $element.attr('data-srcset');

            this._core.trigger('load', {
                element: $element,
                url: url
            }, 'lazy');

            if ($element.is('img')) {
                $element.one('load.owl.lazy', $.proxy(function() {
                    $element.css('opacity', 1);
                    this._core.trigger('loaded', {
                        element: $element,
                        url: url
                    }, 'lazy');
                }, this)).attr('src', url);
            } else if ($element.is('source')) {
                $element.one('load.owl.lazy', $.proxy(function() {
                    this._core.trigger('loaded', {
                        element: $element,
                        url: url
                    }, 'lazy');
                }, this)).attr('srcset', url);
            } else {
                image = new Image();
                image.onload = $.proxy(function() {
                    $element.css({
                        'background-image': 'url("' + url + '")',
                        'opacity': '1'
                    });
                    this._core.trigger('loaded', {
                        element: $element,
                        url: url
                    }, 'lazy');
                }, this);
                image.src = url;
            }
        }, this));

        this._loaded.push($item.get(0));
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Lazy.prototype.destroy = function() {
        var handler, property;

        for (handler in this.handlers) {
            this._core.$element.off(handler, this.handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the auto height plugin.
     * @class The Auto Height Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var AutoHeight = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        this._previousHeight = null;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight) {
                    this.update();
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight && e.property.name === 'position') {
                    this.update();
                }
            }, this),
            'loaded.owl.lazy': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight &&
                    e.element.closest('.' + this._core.settings.itemClass).index() === this._core.current()) {
                    this.update();
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);
        this._intervalId = null;
        var refThis = this;

        // These changes have been taken from a PR by gavrochelegnou proposed in #1575
        // and have been made compatible with the latest jQuery version
        $(window).on('load', function() {
            if (refThis._core.settings.autoHeight) {
                refThis.update();
            }
        });

        // Autoresize the height of the carousel when window is resized
        // When carousel has images, the height is dependent on the width
        // and should also change on resize
        $(window).resize(function() {
            if (refThis._core.settings.autoHeight) {
                if (refThis._intervalId != null) {
                    clearTimeout(refThis._intervalId);
                }

                refThis._intervalId = setTimeout(function() {
                    refThis.update();
                }, 250);
            }
        });

    };

    /**
     * Default options.
     * @public
     */
    AutoHeight.Defaults = {
        autoHeight: false,
        autoHeightClass: 'owl-height'
    };

    /**
     * Updates the view.
     */
    AutoHeight.prototype.update = function() {
        var start = this._core._current,
            end = start + this._core.settings.items,
            lazyLoadEnabled = this._core.settings.lazyLoad,
            visible = this._core.$stage.children().toArray().slice(start, end),
            heights = [],
            maxheight = 0;

        $.each(visible, function(index, item) {
            heights.push($(item).height());
        });

        maxheight = Math.max.apply(null, heights);

        if (maxheight <= 1 && lazyLoadEnabled && this._previousHeight) {
            maxheight = this._previousHeight;
        }

        this._previousHeight = maxheight;

        this._core.$stage.parent()
            .height(maxheight)
            .addClass(this._core.settings.autoHeightClass);
    };

    AutoHeight.prototype.destroy = function() {
        var handler, property;

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] !== 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the video plugin.
     * @class The Video Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Video = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Cache all video URLs.
         * @protected
         * @type {Object}
         */
        this._videos = {};

        /**
         * Current playing item.
         * @protected
         * @type {jQuery}
         */
        this._playing = null;

        /**
         * All event handlers.
         * @todo The cloned content removale is too late
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    this._core.register({
                        type: 'state',
                        name: 'playing',
                        tags: ['interacting']
                    });
                }
            }, this),
            'resize.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
                    e.preventDefault();
                }
            }, this),
            'refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.is('resizing')) {
                    this._core.$stage.find('.cloned .owl-video-frame').remove();
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'position' && this._playing) {
                    this.stop();
                }
            }, this),
            'prepared.owl.carousel': $.proxy(function(e) {
                if (!e.namespace) {
                    return;
                }

                var $element = $(e.content).find('.owl-video');

                if ($element.length) {
                    $element.css('display', 'none');
                    this.fetch($element, $(e.content));
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Video.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);

        this._core.$element.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
            this.play(e);
        }, this));
    };

    /**
     * Default options.
     * @public
     */
    Video.Defaults = {
        video: false,
        videoHeight: false,
        videoWidth: false
    };

    /**
     * Gets the video ID and the type (YouTube/Vimeo/vzaar only).
     * @protected
     * @param {jQuery} target - The target containing the video data.
     * @param {jQuery} item - The item containing the video.
     */
    Video.prototype.fetch = function(target, item) {
        var type = (function() {
                if (target.attr('data-vimeo-id')) {
                    return 'vimeo';
                } else if (target.attr('data-vzaar-id')) {
                    return 'vzaar'
                } else {
                    return 'youtube';
                }
            })(),
            id = target.attr('data-vimeo-id') || target.attr('data-youtube-id') || target.attr('data-vzaar-id'),
            width = target.attr('data-width') || this._core.settings.videoWidth,
            height = target.attr('data-height') || this._core.settings.videoHeight,
            url = target.attr('href');

        if (url) {

            /*
            		Parses the id's out of the following urls (and probably more):
            		https://www.youtube.com/watch?v=:id
            		https://youtu.be/:id
            		https://vimeo.com/:id
            		https://vimeo.com/channels/:channel/:id
            		https://vimeo.com/groups/:group/videos/:id
            		https://app.vzaar.com/videos/:id

            		Visual example: https://regexper.com/#(http%3A%7Chttps%3A%7C)%5C%2F%5C%2F(player.%7Cwww.%7Capp.)%3F(vimeo%5C.com%7Cyoutu(be%5C.com%7C%5C.be%7Cbe%5C.googleapis%5C.com)%7Cvzaar%5C.com)%5C%2F(video%5C%2F%7Cvideos%5C%2F%7Cembed%5C%2F%7Cchannels%5C%2F.%2B%5C%2F%7Cgroups%5C%2F.%2B%5C%2F%7Cwatch%5C%3Fv%3D%7Cv%5C%2F)%3F(%5BA-Za-z0-9._%25-%5D*)(%5C%26%5CS%2B)%3F
            */

            id = url.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com|be\-nocookie\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

            if (id[3].indexOf('youtu') > -1) {
                type = 'youtube';
            } else if (id[3].indexOf('vimeo') > -1) {
                type = 'vimeo';
            } else if (id[3].indexOf('vzaar') > -1) {
                type = 'vzaar';
            } else {
                throw new Error('Video URL not supported.');
            }
            id = id[6];
        } else {
            throw new Error('Missing video URL.');
        }

        this._videos[url] = {
            type: type,
            id: id,
            width: width,
            height: height
        };

        item.attr('data-video', url);

        this.thumbnail(target, this._videos[url]);
    };

    /**
     * Creates video thumbnail.
     * @protected
     * @param {jQuery} target - The target containing the video data.
     * @param {Object} info - The video info object.
     * @see `fetch`
     */
    Video.prototype.thumbnail = function(target, video) {
        var tnLink,
            icon,
            path,
            dimensions = video.width && video.height ? 'width:' + video.width + 'px;height:' + video.height + 'px;' : '',
            customTn = target.find('img'),
            srcType = 'src',
            lazyClass = '',
            settings = this._core.settings,
            create = function(path) {
                icon = '<div class="owl-video-play-icon"></div>';

                if (settings.lazyLoad) {
                    tnLink = $('<div/>', {
                        "class": 'owl-video-tn ' + lazyClass,
                        "srcType": path
                    });
                } else {
                    tnLink = $('<div/>', {
                        "class": "owl-video-tn",
                        "style": 'opacity:1;background-image:url(' + path + ')'
                    });
                }
                target.after(tnLink);
                target.after(icon);
            };

        // wrap video content into owl-video-wrapper div
        target.wrap($('<div/>', {
            "class": "owl-video-wrapper",
            "style": dimensions
        }));

        if (this._core.settings.lazyLoad) {
            srcType = 'data-src';
            lazyClass = 'owl-lazy';
        }

        // custom thumbnail
        if (customTn.length) {
            create(customTn.attr(srcType));
            customTn.remove();
            return false;
        }

        if (video.type === 'youtube') {
            path = "//img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
            create(path);
        } else if (video.type === 'vimeo') {
            $.ajax({
                type: 'GET',
                url: '//vimeo.com/api/v2/video/' + video.id + '.json',
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    path = data[0].thumbnail_large;
                    create(path);
                }
            });
        } else if (video.type === 'vzaar') {
            $.ajax({
                type: 'GET',
                url: '//vzaar.com/api/videos/' + video.id + '.json',
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    path = data.framegrab_url;
                    create(path);
                }
            });
        }
    };

    /**
     * Stops the current video.
     * @public
     */
    Video.prototype.stop = function() {
        this._core.trigger('stop', null, 'video');
        this._playing.find('.owl-video-frame').remove();
        this._playing.removeClass('owl-video-playing');
        this._playing = null;
        this._core.leave('playing');
        this._core.trigger('stopped', null, 'video');
    };

    /**
     * Starts the current video.
     * @public
     * @param {Event} event - The event arguments.
     */
    Video.prototype.play = function(event) {
        var target = $(event.target),
            item = target.closest('.' + this._core.settings.itemClass),
            video = this._videos[item.attr('data-video')],
            width = video.width || '100%',
            height = video.height || this._core.$stage.height(),
            html,
            iframe;

        if (this._playing) {
            return;
        }

        this._core.enter('playing');
        this._core.trigger('play', null, 'video');

        item = this._core.items(this._core.relative(item.index()));

        this._core.reset(item.index());

        html = $('<iframe frameborder="0" allowfullscreen mozallowfullscreen webkitAllowFullScreen ></iframe>');
        html.attr('height', height);
        html.attr('width', width);
        if (video.type === 'youtube') {
            html.attr('src', '//www.youtube.com/embed/' + video.id + '?autoplay=1&rel=0&v=' + video.id);
        } else if (video.type === 'vimeo') {
            html.attr('src', '//player.vimeo.com/video/' + video.id + '?autoplay=1');
        } else if (video.type === 'vzaar') {
            html.attr('src', '//view.vzaar.com/' + video.id + '/player?autoplay=true');
        }

        iframe = $(html).wrap('<div class="owl-video-frame" />').insertAfter(item.find('.owl-video'));

        this._playing = item.addClass('owl-video-playing');
    };

    /**
     * Checks whether an video is currently in full screen mode or not.
     * @todo Bad style because looks like a readonly method but changes members.
     * @protected
     * @returns {Boolean}
     */
    Video.prototype.isInFullScreen = function() {
        var element = document.fullscreenElement || document.mozFullScreenElement ||
            document.webkitFullscreenElement;

        return element && $(element).parent().hasClass('owl-video-frame');
    };

    /**
     * Destroys the plugin.
     */
    Video.prototype.destroy = function() {
        var handler, property;

        this._core.$element.off('click.owl.video');

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the animate plugin.
     * @class The Navigation Plugin
     * @param {Owl} scope - The Owl Carousel
     */
    var Animate = function(scope) {
        this.core = scope;
        this.core.options = $.extend({}, Animate.Defaults, this.core.options);
        this.swapping = true;
        this.previous = undefined;
        this.next = undefined;

        this.handlers = {
            'change.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name == 'position') {
                    this.previous = this.core.current();
                    this.next = e.property.value;
                }
            }, this),
            'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    this.swapping = e.type == 'translated';
                }
            }, this),
            'translate.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
                    this.swap();
                }
            }, this)
        };

        this.core.$element.on(this.handlers);
    };

    /**
     * Default options.
     * @public
     */
    Animate.Defaults = {
        animateOut: false,
        animateIn: false
    };

    /**
     * Toggles the animation classes whenever an translations starts.
     * @protected
     * @returns {Boolean|undefined}
     */
    Animate.prototype.swap = function() {

        if (this.core.settings.items !== 1) {
            return;
        }

        if (!$.support.animation || !$.support.transition) {
            return;
        }

        this.core.speed(0);

        var left,
            clear = $.proxy(this.clear, this),
            previous = this.core.$stage.children().eq(this.previous),
            next = this.core.$stage.children().eq(this.next),
            incoming = this.core.settings.animateIn,
            outgoing = this.core.settings.animateOut;

        if (this.core.current() === this.previous) {
            return;
        }

        if (outgoing) {
            left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
            previous.one($.support.animation.end, clear)
                .css({
                    'left': left + 'px'
                })
                .addClass('animated owl-animated-out')
                .addClass(outgoing);
        }

        if (incoming) {
            next.one($.support.animation.end, clear)
                .addClass('animated owl-animated-in')
                .addClass(incoming);
        }
    };

    Animate.prototype.clear = function(e) {
        $(e.target).css({
                'left': ''
            })
            .removeClass('animated owl-animated-out owl-animated-in')
            .removeClass(this.core.settings.animateIn)
            .removeClass(this.core.settings.animateOut);
        this.core.onTransitionEnd();
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Animate.prototype.destroy = function() {
        var handler, property;

        for (handler in this.handlers) {
            this.core.$element.off(handler, this.handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.3.4
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @author David Deutsch
 * @author Tom De Caluwé
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    /**
     * Creates the autoplay plugin.
     * @class The Autoplay Plugin
     * @param {Owl} scope - The Owl Carousel
     */
    var Autoplay = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * The autoplay timeout id.
         * @type {Number}
         */
        this._call = null;

        /**
         * Depending on the state of the plugin, this variable contains either
         * the start time of the timer or the current timer value if it's
         * paused. Since we start in a paused state we initialize the timer
         * value.
         * @type {Number}
         */
        this._time = 0;

        /**
         * Stores the timeout currently used.
         * @type {Number}
         */
        this._timeout = 0;

        /**
         * Indicates whenever the autoplay is paused.
         * @type {Boolean}
         */
        this._paused = true;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'settings') {
                    if (this._core.settings.autoplay) {
                        this.play();
                    } else {
                        this.stop();
                    }
                } else if (e.namespace && e.property.name === 'position' && this._paused) {
                    // Reset the timer. This code is triggered when the position
                    // of the carousel was changed through user interaction.
                    this._time = 0;
                }
            }, this),
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoplay) {
                    this.play();
                }
            }, this),
            'play.owl.autoplay': $.proxy(function(e, t, s) {
                if (e.namespace) {
                    this.play(t, s);
                }
            }, this),
            'stop.owl.autoplay': $.proxy(function(e) {
                if (e.namespace) {
                    this.stop();
                }
            }, this),
            'mouseover.owl.autoplay': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
                    this.pause();
                }
            }, this),
            'mouseleave.owl.autoplay': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
                    this.play();
                }
            }, this),
            'touchstart.owl.core': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
                    this.pause();
                }
            }, this),
            'touchend.owl.core': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause) {
                    this.play();
                }
            }, this)
        };

        // register event handlers
        this._core.$element.on(this._handlers);

        // set default options
        this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
    };

    /**
     * Default options.
     * @public
     */
    Autoplay.Defaults = {
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        autoplaySpeed: false
    };

    /**
     * Transition to the next slide and set a timeout for the next transition.
     * @private
     * @param {Number} [speed] - The animation speed for the animations.
     */
    Autoplay.prototype._next = function(speed) {
        this._call = window.setTimeout(
            $.proxy(this._next, this, speed),
            this._timeout * (Math.round(this.read() / this._timeout) + 1) - this.read()
        );

        if (this._core.is('interacting') || document.hidden) {
            return;
        }
        this._core.next(speed || this._core.settings.autoplaySpeed);
    }

    /**
     * Reads the current timer value when the timer is playing.
     * @public
     */
    Autoplay.prototype.read = function() {
        return new Date().getTime() - this._time;
    };

    /**
     * Starts the autoplay.
     * @public
     * @param {Number} [timeout] - The interval before the next animation starts.
     * @param {Number} [speed] - The animation speed for the animations.
     */
    Autoplay.prototype.play = function(timeout, speed) {
        var elapsed;

        if (!this._core.is('rotating')) {
            this._core.enter('rotating');
        }

        timeout = timeout || this._core.settings.autoplayTimeout;

        // Calculate the elapsed time since the last transition. If the carousel
        // wasn't playing this calculation will yield zero.
        elapsed = Math.min(this._time % (this._timeout || timeout), timeout);

        if (this._paused) {
            // Start the clock.
            this._time = this.read();
            this._paused = false;
        } else {
            // Clear the active timeout to allow replacement.
            window.clearTimeout(this._call);
        }

        // Adjust the origin of the timer to match the new timeout value.
        this._time += this.read() % timeout - elapsed;

        this._timeout = timeout;
        this._call = window.setTimeout($.proxy(this._next, this, speed), timeout - elapsed);
    };

    /**
     * Stops the autoplay.
     * @public
     */
    Autoplay.prototype.stop = function() {
        if (this._core.is('rotating')) {
            // Reset the clock.
            this._time = 0;
            this._paused = true;

            window.clearTimeout(this._call);
            this._core.leave('rotating');
        }
    };

    /**
     * Pauses the autoplay.
     * @public
     */
    Autoplay.prototype.pause = function() {
        if (this._core.is('rotating') && !this._paused) {
            // Pause the clock.
            this._time = this.read();
            this._paused = true;

            window.clearTimeout(this._call);
        }
    };

    /**
     * Destroys the plugin.
     */
    Autoplay.prototype.destroy = function() {
        var handler, property;

        this.stop();

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
    'use strict';

    /**
     * Creates the navigation plugin.
     * @class The Navigation Plugin
     * @param {Owl} carousel - The Owl Carousel.
     */
    var Navigation = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Indicates whether the plugin is initialized or not.
         * @protected
         * @type {Boolean}
         */
        this._initialized = false;

        /**
         * The current paging indexes.
         * @protected
         * @type {Array}
         */
        this._pages = [];

        /**
         * All DOM elements of the user interface.
         * @protected
         * @type {Object}
         */
        this._controls = {};

        /**
         * Markup for an indicator.
         * @protected
         * @type {Array.<String>}
         */
        this._templates = [];

        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this._core.$element;

        /**
         * Overridden methods of the carousel.
         * @protected
         * @type {Object}
         */
        this._overrides = {
            next: this._core.next,
            prev: this._core.prev,
            to: this._core.to
        };

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'prepared.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.push('<div class="' + this._core.settings.dotClass + '">' +
                        $(e.content).find('[data-dot]').addBack('[data-dot]').attr('data-dot') + '</div>');
                }
            }, this),
            'added.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.splice(e.position, 0, this._templates.pop());
                }
            }, this),
            'remove.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.splice(e.position, 1);
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name == 'position') {
                    this.draw();
                }
            }, this),
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && !this._initialized) {
                    this._core.trigger('initialize', null, 'navigation');
                    this.initialize();
                    this.update();
                    this.draw();
                    this._initialized = true;
                    this._core.trigger('initialized', null, 'navigation');
                }
            }, this),
            'refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._initialized) {
                    this._core.trigger('refresh', null, 'navigation');
                    this.update();
                    this.draw();
                    this._core.trigger('refreshed', null, 'navigation');
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

        // register event handlers
        this.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     * @todo Rename `slideBy` to `navBy`
     */
    Navigation.Defaults = {
        nav: false,
        navText: [
            '<span aria-label="' + 'Previous' + '">&#x2039;</span>',
            '<span aria-label="' + 'Next' + '">&#x203a;</span>'
        ],
        navSpeed: false,
        navElement: 'button type="button" role="presentation"',
        navContainer: false,
        navContainerClass: 'owl-nav',
        navClass: [
            'owl-prev',
            'owl-next'
        ],
        slideBy: 1,
        dotClass: 'owl-dot',
        dotsClass: 'owl-dots',
        dots: true,
        dotsEach: false,
        dotsData: false,
        dotsSpeed: false,
        dotsContainer: false
    };

    /**
     * Initializes the layout of the plugin and extends the carousel.
     * @protected
     */
    Navigation.prototype.initialize = function() {
        var override,
            settings = this._core.settings;

        // create DOM structure for relative navigation
        this._controls.$relative = (settings.navContainer ? $(settings.navContainer) :
            $('<div>').addClass(settings.navContainerClass).appendTo(this.$element)).addClass('disabled');

        this._controls.$previous = $('<' + settings.navElement + '>')
            .addClass(settings.navClass[0])
            .html(settings.navText[0])
            .prependTo(this._controls.$relative)
            .on('click', $.proxy(function(e) {
                this.prev(settings.navSpeed);
            }, this));
        this._controls.$next = $('<' + settings.navElement + '>')
            .addClass(settings.navClass[1])
            .html(settings.navText[1])
            .appendTo(this._controls.$relative)
            .on('click', $.proxy(function(e) {
                this.next(settings.navSpeed);
            }, this));

        // create DOM structure for absolute navigation
        if (!settings.dotsData) {
            this._templates = [$('<button role="button">')
                .addClass(settings.dotClass)
                .append($('<span>'))
                .prop('outerHTML')
            ];
        }

        this._controls.$absolute = (settings.dotsContainer ? $(settings.dotsContainer) :
            $('<div>').addClass(settings.dotsClass).appendTo(this.$element)).addClass('disabled');

        this._controls.$absolute.on('click', 'button', $.proxy(function(e) {
            var index = $(e.target).parent().is(this._controls.$absolute) ?
                $(e.target).index() : $(e.target).parent().index();

            e.preventDefault();

            this.to(index, settings.dotsSpeed);
        }, this));

        /*$el.on('focusin', function() {
        	$(document).off(".carousel");

        	$(document).on('keydown.carousel', function(e) {
        		if(e.keyCode == 37) {
        			$el.trigger('prev.owl')
        		}
        		if(e.keyCode == 39) {
        			$el.trigger('next.owl')
        		}
        	});
        });*/

        // override public methods of the carousel
        for (override in this._overrides) {
            this._core[override] = $.proxy(this[override], this);
        }
    };

    /**
     * Destroys the plugin.
     * @protected
     */
    Navigation.prototype.destroy = function() {
        var handler, control, property, override, settings;
        settings = this._core.settings;

        for (handler in this._handlers) {
            this.$element.off(handler, this._handlers[handler]);
        }
        for (control in this._controls) {
            if (control === '$relative' && settings.navContainer) {
                this._controls[control].html('');
            } else {
                this._controls[control].remove();
            }
        }
        for (override in this.overides) {
            this._core[override] = this._overrides[override];
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    /**
     * Updates the internal state.
     * @protected
     */
    Navigation.prototype.update = function() {
        var i, j, k,
            lower = this._core.clones().length / 2,
            upper = lower + this._core.items().length,
            maximum = this._core.maximum(true),
            settings = this._core.settings,
            size = settings.center || settings.autoWidth || settings.dotsData ?
            1 : settings.dotsEach || settings.items;

        if (settings.slideBy !== 'page') {
            settings.slideBy = Math.min(settings.slideBy, settings.items);
        }

        if (settings.dots || settings.slideBy == 'page') {
            this._pages = [];

            for (i = lower, j = 0, k = 0; i < upper; i++) {
                if (j >= size || j === 0) {
                    this._pages.push({
                        start: Math.min(maximum, i - lower),
                        end: i - lower + size - 1
                    });
                    if (Math.min(maximum, i - lower) === maximum) {
                        break;
                    }
                    j = 0, ++k;
                }
                j += this._core.mergers(this._core.relative(i));
            }
        }
    };

    /**
     * Draws the user interface.
     * @todo The option `dotsData` wont work.
     * @protected
     */
    Navigation.prototype.draw = function() {
        var difference,
            settings = this._core.settings,
            disabled = this._core.items().length <= settings.items,
            index = this._core.relative(this._core.current()),
            loop = settings.loop || settings.rewind;

        this._controls.$relative.toggleClass('disabled', !settings.nav || disabled);

        if (settings.nav) {
            this._controls.$previous.toggleClass('disabled', !loop && index <= this._core.minimum(true));
            this._controls.$next.toggleClass('disabled', !loop && index >= this._core.maximum(true));
        }

        this._controls.$absolute.toggleClass('disabled', !settings.dots || disabled);

        if (settings.dots) {
            difference = this._pages.length - this._controls.$absolute.children().length;

            if (settings.dotsData && difference !== 0) {
                this._controls.$absolute.html(this._templates.join(''));
            } else if (difference > 0) {
                this._controls.$absolute.append(new Array(difference + 1).join(this._templates[0]));
            } else if (difference < 0) {
                this._controls.$absolute.children().slice(difference).remove();
            }

            this._controls.$absolute.find('.active').removeClass('active');
            this._controls.$absolute.children().eq($.inArray(this.current(), this._pages)).addClass('active');
        }
    };

    /**
     * Extends event data.
     * @protected
     * @param {Event} event - The event object which gets thrown.
     */
    Navigation.prototype.onTrigger = function(event) {
        var settings = this._core.settings;

        event.page = {
            index: $.inArray(this.current(), this._pages),
            count: this._pages.length,
            size: settings && (settings.center || settings.autoWidth || settings.dotsData ?
                1 : settings.dotsEach || settings.items)
        };
    };

    /**
     * Gets the current page position of the carousel.
     * @protected
     * @returns {Number}
     */
    Navigation.prototype.current = function() {
        var current = this._core.relative(this._core.current());
        return $.grep(this._pages, $.proxy(function(page, index) {
            return page.start <= current && page.end >= current;
        }, this)).pop();
    };

    /**
     * Gets the current succesor/predecessor position.
     * @protected
     * @returns {Number}
     */
    Navigation.prototype.getPosition = function(successor) {
        var position, length,
            settings = this._core.settings;

        if (settings.slideBy == 'page') {
            position = $.inArray(this.current(), this._pages);
            length = this._pages.length;
            successor ? ++position : --position;
            position = this._pages[((position % length) + length) % length].start;
        } else {
            position = this._core.relative(this._core.current());
            length = this._core.items().length;
            successor ? position += settings.slideBy : position -= settings.slideBy;
        }

        return position;
    };

    /**
     * Slides to the next item or page.
     * @public
     * @param {Number} [speed=false] - The time in milliseconds for the transition.
     */
    Navigation.prototype.next = function(speed) {
        $.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
    };

    /**
     * Slides to the previous item or page.
     * @public
     * @param {Number} [speed=false] - The time in milliseconds for the transition.
     */
    Navigation.prototype.prev = function(speed) {
        $.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
    };

    /**
     * Slides to the specified item or page.
     * @public
     * @param {Number} position - The position of the item or page.
     * @param {Number} [speed] - The time in milliseconds for the transition.
     * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
     */
    Navigation.prototype.to = function(position, speed, standard) {
        var length;

        if (!standard && this._pages.length) {
            length = this._pages.length;
            $.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
        } else {
            $.proxy(this._overrides.to, this._core)(position, speed);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.3.4
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {
    'use strict';

    /**
     * Creates the hash plugin.
     * @class The Hash Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Hash = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Hash index for the items.
         * @protected
         * @type {Object}
         */
        this._hashes = {};

        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this._core.$element;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.startPosition === 'URLHash') {
                    $(window).trigger('hashchange.owl.navigation');
                }
            }, this),
            'prepared.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    var hash = $(e.content).find('[data-hash]').addBack('[data-hash]').attr('data-hash');

                    if (!hash) {
                        return;
                    }

                    this._hashes[hash] = e.content;
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'position') {
                    var current = this._core.items(this._core.relative(this._core.current())),
                        hash = $.map(this._hashes, function(item, hash) {
                            return item === current ? hash : null;
                        }).join();

                    if (!hash || window.location.hash.slice(1) === hash) {
                        return;
                    }

                    window.location.hash = hash;
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Hash.Defaults, this._core.options);

        // register the event handlers
        this.$element.on(this._handlers);

        // register event listener for hash navigation
        $(window).on('hashchange.owl.navigation', $.proxy(function(e) {
            var hash = window.location.hash.substring(1),
                items = this._core.$stage.children(),
                position = this._hashes[hash] && items.index(this._hashes[hash]);

            if (position === undefined || position === this._core.current()) {
                return;
            }

            this._core.to(this._core.relative(position), false, true);
        }, this));
    };

    /**
     * Default options.
     * @public
     */
    Hash.Defaults = {
        URLhashListener: false
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Hash.prototype.destroy = function() {
        var handler, property;

        $(window).off('hashchange.owl.navigation');

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.3.4
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
;
(function($, window, document, undefined) {

    var style = $('<support>').get(0).style,
        prefixes = 'Webkit Moz O ms'.split(' '),
        events = {
            transition: {
                end: {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd',
                    transition: 'transitionend'
                }
            },
            animation: {
                end: {
                    WebkitAnimation: 'webkitAnimationEnd',
                    MozAnimation: 'animationend',
                    OAnimation: 'oAnimationEnd',
                    animation: 'animationend'
                }
            }
        },
        tests = {
            csstransforms: function() {
                return !!test('transform');
            },
            csstransforms3d: function() {
                return !!test('perspective');
            },
            csstransitions: function() {
                return !!test('transition');
            },
            cssanimations: function() {
                return !!test('animation');
            }
        };

    function test(property, prefixed) {
        var result = false,
            upper = property.charAt(0).toUpperCase() + property.slice(1);

        $.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
            if (style[property] !== undefined) {
                result = prefixed ? property : true;
                return false;
            }
        });

        return result;
    }

    function prefixed(property) {
        return test(property, true);
    }

    if (tests.csstransitions()) {
        /* jshint -W053 */
        $.support.transition = new String(prefixed('transition'))
        $.support.transition.end = events.transition.end[$.support.transition];
    }

    if (tests.cssanimations()) {
        /* jshint -W053 */
        $.support.animation = new String(prefixed('animation'))
        $.support.animation.end = events.animation.end[$.support.animation];
    }

    if (tests.csstransforms()) {
        /* jshint -W053 */
        $.support.transform = new String(prefixed('transform'));
        $.support.transform3d = tests.csstransforms3d();
    }

})(window.Zepto || window.jQuery, window, document);

$(document).ready(function() {

    if ($(window).width() < 767) {
        $('.feature-stay-container').owlCarousel({
            loop: true,
            center: false,
            autoWidth: false,
            autoplay: true,
            autoplayTimeout: 4000,
            smartSpeed: 1000,
            margin: 10,
            items: 1,
            nav: true,
            navText: ["<img src='/content/dam/tajhotels/icons/ama/arrow-left.png'>", "<img src='/content/dam/tajhotels/icons/ama/arrow-left.png'>"],
        });
    } else {
        $('.feature-stay-container').owlCarousel({
            loop: true,
            center: true,
            autoplay: true,
            autoplayTimeout: 4000,
            smartSpeed: 1000,
            autoWidth: true,
            margin: 50,
            nav: true,
            navText: ["<img src='/content/dam/tajhotels/icons/ama/arrow-left.png'>", "<img src='/content/dam/tajhotels/icons/ama/arrow-left.png'>"],
        });
    }
});

$(document).ready(function() {
    var scrollrequired = $("#scrollRequired").val();
    if (scrollrequired == 'true') {
        $(".ama-cards-container.row").addClass("scroll");
        $('.ama-cards-container').customSlide(2);
        if ($('.ama-cards-container').children().length <= 2) {
            $('.ama-cards').find(".rightArrow").hide();
            $('.ama-cards').find(".leftArrow").hide();
        }
    }
});

$(document).ready(function() {
    // activity dropdown filter
    $('#actfilterBy').change(function() {
        var value = this.value;
        filterActResults(value);
        setInitialHeights();
    });

    $('.activities-show-more').unbind().click(function(e) {
        var wrapper = $('.our-activities .act-cards-container');
        var cards = $(wrapper).find('.combo-div:visible');
        var cardsNum = cards.length;
        var cardsNumInRow;
        if ($(window).width() < 767) {
            cardsNumInRow = 1;
        } else {
            cardsNumInRow = 2;
        }
        var singleCard = $(wrapper).find('.combo-div:visible:first');
        var cardHeight = singleCard.outerHeight(true);
        var heightLimit = cardHeight * 2;
        var totalHeight = (cardsNum / cardsNumInRow) * cardHeight;
        // $( cards ).toggleClass( 'show-more-card-element-active' );

        var textReference = $(this).find('span');
        var iconReference = $(this).find('i');
        if (textReference.text() == "SHOW MORE") {
            wrapperHeight = wrapper.height();
            console.log("total ht: " + totalHeight + "wrapper ht: " + wrapperHeight);
            if (totalHeight <= wrapperHeight) {
                textReference.text("SHOW LESS");
                iconReference.toggleClass('cm-rotate-show-more-icon');
                wrapper.css('maxHeight', 'unset');
            } else {
                var setHeight = wrapperHeight + heightLimit
                wrapper.css('maxHeight', setHeight);
                console.log("maxheight: " + setHeight);
                if (totalHeight <= wrapper.height()) {
                    console.log("set show less");
                    textReference.text("SHOW LESS");
                    iconReference.toggleClass('cm-rotate-show-more-icon');
                }
            }
        } else {
            textReference.text("SHOW MORE");
            iconReference.toggleClass('cm-rotate-show-more-icon');
            wrapper.css('maxHeight', heightLimit);
            this.scrollIntoView();
        }
    });
    setInitialHeights();
    $(window).on('resize', setInitialHeights);
});

function setInitialHeights() {
    var showMoreContents = $('.activities-show-more');
    console.log("inside initial ht fn each fn");
    var showMoreWrapper = $('.act-cards-container');
    var cardsNum = $(showMoreWrapper).find('.combo-div:visible').length;
    var singleCard = $(showMoreWrapper).find('.combo-div:visible:first');
    var cardHeight = singleCard.outerHeight(true);
    var cardsNumInRow;
    var reduceHt = false;
    var textReference = showMoreContents.find('span');
    var iconReference = showMoreContents.find('i');
    if (textReference.text() == "SHOW LESS") {
        console.log("inside here");
        iconReference.toggleClass('cm-rotate-show-more-icon');
    }
    textReference.text("SHOW MORE");
    console.log("window width: " + $(window).width());
    if ($(window).width() < 767) {
        cardsNumInRow = 1;
    } else {
        cardsNumInRow = 2;
    }
    var heightLimit = cardHeight * 2;
    var totalHeight = (cardsNum / cardsNumInRow) * cardHeight;
    console.log("ht limit: " + heightLimit + ", total ht: " + totalHeight + ", cardsnum: " + cardsNum +
        ", cardsnuminrow: " + cardsNumInRow + ", cards ht: " + cardHeight);
    if (totalHeight > heightLimit) {
        showMoreWrapper.css('maxHeight', heightLimit);
        $('.activities-show-more').removeClass('no-display-show-more');
    } else {
        $('.activities-show-more').addClass('no-display-show-more');
    }
}

function filterActResults(searchKey) {

    var filteredActList = $(".our-activities .card-wrapper").filter(function() {
        console.log('print the data value and searchkey' + $(this).data('destination-type') + "::" + searchKey);
        if (searchKey == "all") {
            $(this).parent().show();
        } else {
            if ($(this).data('destination-type').includes(searchKey)) {
                $(this).parent().show();
            } else {
                $(this).parent().hide();
            }
        }
    });
}

function popUpActivityList(elem) {
    var presentScroll = $(window).scrollTop();
    var thisLightBox = $(elem).closest('.card-wrapper').next().css('display', 'block').addClass('active-popUp');
    $(".cm-page-container").addClass('prevent-page-scroll');
    $('.the-page-carousel').css('-webkit-overflow-scrolling', 'unset');

    $(document).keydown(function(e) {
        if (($('.active-popUp').length) && (e.which === 27)) {
            $('.showMap-close').trigger("click");
        }
    });
    $('.showMap-close').click(function() {

        thisLightBox.hide().removeClass('active-popUp');
        $(".cm-page-container").removeClass('prevent-page-scroll');
        $('.the-page-carousel').css('-webkit-overflow-scrolling', 'touch');
        $(window).scrollTop(presentScroll);

    })

}

document.addEventListener('DOMContentLoaded', function() {
    if (dataCache.session.getData("holidayTheme")) {
        if ((window.location.href).indexOf('rooms-and-suites') != -1)
            $('.offers-deals-container').hide();
    }
    var locator = location.href;
    var midStr = 'meeting/meeting-request-quote.html?';
    var laststr = locator.lastIndexOf("?");
    var dynamicStr = locator.substring(laststr + 1);
    var finalStr = midStr + dynamicStr;
    var formatedURL = locator.toString().replace(finalStr, 'meeting.html');
    injectHotelNameForMobileView();
    var entierUrl = locator.split("?");
    locator = entierUrl[0];

    $('.tab-child-container').each(function() {

        $(this).removeClass('selected');
        var id = $(this).text();
        if (document.getElementById(id) && ((document.getElementById(id).href === locator) || (document.getElementById(id).href === formatedURL))) {
            $(this).addClass('selected');
        }
    });



    if ($(window).width() < 992) {
        var tabCount = $('.cm-nav-tab-con .tab-child-container').length;
        if (tabCount < 3) {
            $('.more-container-mobile').hide();
        }
        $('.more-tab-child-container > a').each(function() {
            var id = $(this).text();
            if (document.getElementById(id).href === locator) {
                $('.more-container-mobile').addClass('selected');
                $('.more-container-mobile').html('<span>' + $(this).text() + '</span><img src="/content/dam/tajhotels/icons/style-icons/drop-down-arrow-white.svg" alt  = "drop-down-arrow-white-icon"/>');
                $(this).css('display', 'none');
                if ($(window).width() > 767) {
                    var selTab = $('.tab-child-container:eq(2)').text();
                    if (id == selTab) {
                        $('.more-container-mobile').html('<span>More</span><img src="/content/dam/tajhotels/icons/style-icons/drop-down-arrow.svg" alt = "drop-down-arrow-icon"/>');
                        $('.more-container-mobile').removeClass('selected');
                    }
                }
            }
        })
    }

    $('.more-container-mobile').click(function() {
        $('.more-content-wrap').css('display', 'block');
    });

    $('.more-content-heading .icon-prev-arrow').click(function() {
        $('.more-content-wrap').css('display', 'none');
    });

    function injectHotelNameForMobileView() {

        var hotelName = getHotelNameFromDom();
        var mobileViewDomArray = $.find("[data-injector-key='hotel-name']");
        var mobileViewConatiner = "";
        if (mobileViewDomArray != undefined) {
            mobileViewConatiner = mobileViewDomArray[0];
        }
        if (hotelName != undefined) {
            $(mobileViewConatiner).text(hotelName);
        }
    }

    function getHotelNameFromDom() {
        var hotelNameDomArray = $.find("[data-hotel-name]");
        var hotelNameContainer = "";
        if (hotelNameDomArray.length > 0) {
            //		if(hotelNameDomArray != undefined) {
            hotelNameContainer = hotelNameDomArray[0];
            if ($(hotelNameContainer).data()) {
                return $(hotelNameContainer).data().hotelName;
            }
        }

    }
    if (window.location.href.includes("drivecation")) {
        console.log("Js working");
        var elem = document.querySelector(".tab-child-container.selected");
        elem.style.setProperty("--primaryColorLight", "#0c5d90");
        elem.style.setProperty("--primaryColor", "#002b49");
        elem.style.setProperty("--primaryColorDark", "#002b49");
    }

    if (window.innerWidth >= 991) {
        var locationImgJson = $('#hotelnavbarimg').val();
        updateImageInTabs(locationImgJson);
    }

});

function updateImageInTabs(locationImgJson) {
    if (!locationImgJson) {
        return;
    }
    locationImgJson = JSON.parse(locationImgJson);
    Object.keys(locationImgJson).forEach(function(key) {
        $('.hotel-navigation a:contains("' + key + '")').prepend('<img src="' + locationImgJson[key] + '" class="hotel-nav-img" height="80px" width="100px" >');
        $('.hotel-navigation a:contains("' + key + '")').addClass('hotel-nav-a');
    })
}

$(document).ready(function() {
    try {
        init_pagination_ama();
    } catch (err) {
        console.error('exception caught in pagination js of ama offer card component');
        console.error(err);
    }

    if ($('.offers-and-deals-wrap .clearfix .offers-page-card-component') && $('.offers-and-deals-wrap .clearfix .offers-page-card-component').length == 2) {
        $('.offers-and-deals-wrap .clearfix').addClass('clearfix-width');
    }

});

init_pagination_ama = function() {
    var $offersContainer = $(".offers-container");
    $offersContainer.siblings('.jiva-spa-show-more').remove();
    var viewallButton = $offersContainer.siblings('.align-items').length;
    if (viewallButton != 0) {
        $offersContainer.showMore(6, 3);
        $offersContainer.siblings('.jiva-spa-show-more').remove();
    } else {
        $offersContainer.showMore(6, 6);
        var filteredOffersLength = $offersContainer.find(".row .offers-page-card-component").length;
        $('.no-offers-found').toggle(filteredOffersLength == 0);
    }
    $('.ama-theme .ama-offer-card-wth-car .cm-inner-carousal-cards').removeClass('col-lg-4 col-md-4 col-xs-12');

}


var labelArray = [];
var options;
var dummyOptions = [];

$(document).ready(function() {
    labelArray = [];
    options;
    dummyOptions = $('#filter-json-string').val() ? JSON.parse($('#filter-json-string').val()) : '';
    addLabel();
    initHolidayFilter();
});

function addLabel() {
    var labelvalue;
    var i = 0;
    var $titleLink = $('.holidays-dest-popularDest');
    $titleLink.each(function() {
        var labelObject = {};
        labelvalue = $(this).find('.cm-header-label').text();
        labelObject.label = labelvalue;
        labelObject.value = labelvalue;
        labelArray.push(labelObject);
        i++;
        labelvalue = "";
    });
}

var applyOnSamePage = false;

function addOption() {
    for (var i = 0; i < options.length; i++) {
        var temp = '<div class="filter-catagory">' +
            '<div class="filter-header">' +
            options[i].selector +
            '</div>' +
            '<div class="filter-dropDD"  id=' +
            options[i].selector +
            '><select aria-label="filter drop down" name="filter-drop-down" class="cm-multi-dd" multiple="multiple"></select></div>' +
            '</div>';
        $('.filter-wrap-catagory').append(temp);
    }
}

// for landing page show search bar with filter
$('.holiday-filter-wrapper .filter-searchBar-wrap.cm-hide').removeClass('cm-hide');
$('.filter-landing-cont-image').addClass(' cm-hide');

function initDD(options) {
    $('#holidaysFilterNoResults').hide();
    $('.filter-wrap-catagory').find('.cm-multi-dd').each(function(i) {
        $(this).multiselectDropdown(options[i]);
    });
    var valueofOpt = dataCache.session.getData('landingOptions');
    if (applyOnSamePage && valueofOpt) {
        $('.filter-wrap-catagory').find('.cm-multi-dd').not("span").each(function(i) {
            if (valueofOpt[i].selectedOptionList) {
                $(this).val(valueofOpt[i].selectedOptionList);
                $(this).multiselect("refresh");
            }
        });
        filterSetOnDestFromLand(valueofOpt);
    } else {
        dataCache.session.removeData('landingOptions');
    }
    $('.dropdown-toggle').dropdown();
}

function onLoadTocheckURL() {
    if ($('.cm-page-container').hasClass('holidays-homepage-layout') || $('.cm-page-container').hasClass('weddings')) {
        applyOnSamePage = false;
    } else {
        applyOnSamePage = true;
    }
}

function actionFilter() {
    $('.filter-searchBar-wrap, #holidayFilterSearch, .events-filter-back-arrow').on('click', function() {
        $('.events-filter-subsection').toggle();
    });
}

function initHolidayFilter() {
    initializeOptions();
    addOption();
    onLoadTocheckURL();
    initDD(options);
    actionFilter();
    applyFilterOptions();
}

function initializeOptions() {
    // var hiddenDivContents =$($.find("[data-dropdown='json']")[0]).text();
    // options=JSON && JSON.parse(hiddenDivContents) || $.parseJSON(hiddenDivContents);
    options = dummyOptions;
}

function applyFilter(isAutomaticallyLoading) {
    if (isHolidayPage()) {
        filterIndividualDestination();
    } else if (applyOnSamePage) {
        if ($('.cm-page-container').hasClass('weddings-list')) {
            filterOnWedding();
        } else {
            // call this function for same page filter func
            filterOnDestination();
        }
    } else {
        if (!isAutomaticallyLoading) {
            dataCache.session.setData('landingOptions', options);
            var redirectPage = $('.filter-go-container').data('redirecturl');
            window.location.assign(redirectPage + ".html");
        }
    }
    // formatHotelCardUI();
}

function isHolidayPage() {
    return $('.cm-page-container').hasClass('holidays-experiences-layout') ||
        $('.cm-page-container').hasClass('holidays-theme-layout') ||
        $('.cm-page-container').hasClass('holidays-packages-layout');
}

function applyFilterOptions() {
    var filterOptions = dataCache.session.getData('filterOptions');
    if (filterOptions) {
        filterOptions.forEach(function(item) {
            var selectedOptionList = item.selectedOptionList;
            if (selectedOptionList) {
                selectedOptionList.forEach(function(item) {
                    var $optionToSelect = $('input[value="' + item + '"]');
                    if (!$optionToSelect.prop('checked')) {
                        $optionToSelect.trigger('click');
                    }
                })
            }
        });
        setTimeout(function() {
            applyFilter(true);
        }, 200);
    }
}

var $alldestCard = [];
var $noResult;
var $individualDestinationCards = [];

$(document).ready(function() {
    $noResult = $('#dest-no-result');
    if ($('.cm-page-container').hasClass('weddings-list')) {
        $('.weddings-wrap-spec').each(function() {
            $(this).showMore(12, 9);
        });
        // keep all initial card in one variable
        $('.weddings-wrap-spec').each(function() {
            $alldestCard.push($(this).find('.events-card-wrap').clone(true));
        });

        $('.destination-package-card-container').each(function(index) {
            $individualDestinationCards.push($(this).clone("true"));
        });
        if ($('.cm-page-container').hasClass('weddings-list')) {
            filterOnWedding();
        }
        $('.jiva-spa-show-more').hide();
    } else {
        $('.popular-destination-wrap-spec').each(function() {
            $(this).showMore(12, 9);
        });
        // keep all initial card in one variable
        $('.popular-destination-wrap-spec').each(function() {
            $alldestCard.push($(this).find('.popularDest-wrap').clone(true));
        });

        $('.destination-package-card-container').each(function(index) {
            $individualDestinationCards.push($(this).clone("true"));
        });
    }
});

function filterIndividualPackages($hotelWrapper) {
    var $packageWrapper = $hotelWrapper.find('.holidays-dest-more-packages');
    var packages = $packageWrapper.find('.more-rate-card-container');
    globalMultipleFilterLocal(options, $packageWrapper, packages, '.more-rate-card-container');
}

function filterIndividualHotels($destinationWrapper) {
    var $hotelsOfDestination = $destinationWrapper.find('.holidays-dest-package-card-outer-wrap');
    $hotelsOfDestination.each(function() {
        filterIndividualPackages($(this));
        var $packages = $(this).find('.more-rate-card-container');
        if ($packages.length == 0) {
            $(this).remove();
        } else {
            var minRate = Number.POSITIVE_INFINITY;
            $packages.each(function() {
                var packagePrice = parseFloat($(this).data('price'));
                if (packagePrice < minRate) {
                    minRate = packagePrice;
                }
            });
            $(this).find('.holidays-dest-package-card-rate-actual .amount').text(minRate.toLocaleString('en-IN'));
        }
    });
    return $destinationWrapper;
}

function filterIndividualDestination() {
    var totalFilterResults = 0;
    $($individualDestinationCards).each(function(index) {
        var $currentWrapper = $('.destination-package-card-container').eq(index);
        var $currentWrapperContainer = $currentWrapper.parent();
        var $currentTitleWrapper = $currentWrapperContainer.prev('.title-link');
        var $filteredWrapper = filterIndividualHotels($(this).clone("true"));
        $currentWrapper.children('.row').replaceWith($filteredWrapper.children('.row'));
        $currentWrapper.find('.holidays-dest-package-card-outer-wrap').show();
        var resultsHotelsCount = $currentWrapper.find('.holidays-dest-package-card-outer-wrap').length;
        $currentWrapperContainer.toggle(resultsHotelsCount > 0);
        $currentTitleWrapper.toggle(resultsHotelsCount > 0);
    })
    if (options[5] && options[5].selectedOptionList) {
        filterDestinations(options[5].selectedOptionList);
    }
    totalFilterResults += $('.more-rate-card-container').length;
    $("#holidaysFilterNoResults").toggle(totalFilterResults == 0);
}

function filterOnDestination(options) {
    try {
        var totalFilterResults = 0;
        if (!options) {
            options = window.options;
        }
        if ($alldestCard.length == 0) {
            $('.popular-destination-wrap-spec').each(function() {
                $alldestCard.push($(this).find('.popularDest-wrap').clone(true));
            });
        }
        var $popularDestSpecWrp = $('.popular-destination-wrap-spec');
        if ($popularDestSpecWrp.length) {
            $popularDestSpecWrp.each(function(index) {
                globalMultipleFilterLocal(options, $(this), $alldestCard[index], '.popularDest-wrap');
                var destinationsInCountry = $(this).find('.popularDest-wrap').length;
                $(this).closest('.holiday-destinations').toggle(destinationsInCountry > 0);
                $(this).closest('.holiday-destinations').prev('.cmp-title').toggle(destinationsInCountry > 0);
            });
            totalFilterResults += $('.popularDest-wrap').length;
            $("#holidaysFilterNoResults").toggle(totalFilterResults == 0);
        }
    } catch (error) {
        console.error("Error in holiday filter ", error);
    }
}

function globalMultipleFilterLocal(options, $cardsWrapper, $cardsList, cardSelector) {
    $cardsWrapper.next('.jiva-spa-show-more').remove();
    $cardsWrapper.children('.row').empty();

    var selectedData = {};

    for (var i = 0; i < options.length; i++) {
        if (options[i].selectedOptionList && options[i].selectedOptionList.length > 0)
            selectedData[options[i].selectorCode] = options[i].selectedOptionList;
    }
    $cardsList.each(function() {
        var match;
        if (Object.keys(selectedData).length == 0) {
            $cardsWrapper.children('.row').append($(this).removeAttr('style'));
        } else {
            try {
                var data = JSON.parse($(this)[0].dataset.key);
                for (var key in selectedData) {
                    if (match == false)
                        break;
                    else {
                        if (key.toLowerCase() == "season") {
                            match = seasonFilter(data[key.toLowerCase()], selectedData);
                        } else if (key.toLowerCase() == "price") {
                            var priceList = data[key.toLowerCase()].split(',');
                            $(priceList).each(function() {
                                match = priceFilter(parseFloat(this), selectedData, match);
                                if (match)
                                    return false;
                            })
                            // match=priceFilter(data[key.toLowerCase()],selectedData,match);
                        } else if (key.toLowerCase() == "stay") {
                            match = stayFilter(data[key.toLowerCase()], selectedData.stay);

                        } else {
                            if (key.toLowerCase() == 'destination') {
                                match = true;
                                break;
                            } else {
                                for (var j = 0; j < selectedData[key].length; j++) {
                                    if (data[key.toLowerCase()].indexOf(selectedData[key][j]) > -1) {
                                        match = true;
                                        break;
                                    } else if (j == selectedData[key].length - 1) {
                                        match = false;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
            // after for
            if (match == true) {
                $cardsWrapper.children('.row').append($(this).removeAttr('style'));
            }
        }
    });

    selectedData = {};
    if (cardSelector != ".more-rate-card-container")
        $cardsWrapper.showMore(12, 9);
}

function stayFilter(nights, stay) {
    var nightsArray = nights.split(',');
    var nightsLength = nightsArray.length;
    var nightsStatus = false;
    $(stay).each(function() {
        var stayArray = this.split(',');
        var stayLength = stayArray.length;
        if (nightsLength > 0 && stayLength > 0) {
            var startNight = parseInt(nightsArray[0]);
            var endNight = parseInt(nightsArray[nightsLength - 1]);
            for (var itr = startNight; itr <= endNight; itr++) {
                if (itr >= parseInt(stayArray[0]) && itr <= parseInt(stayArray[stayLength - 1])) {
                    nightsStatus = true;
                    break;
                    // return false is to break the each loop
                    return false;
                }
            }
        }
    });
    return nightsStatus;
}

function filterDestinations(destinations) {
    var fLength = destinations.length;
    var $titleLinkTitle = $('.holidays-dest-popularDest');
    $titleLinkTitle
        .each(function() {
            var filterDestination = false;
            var packagesFilteredCount = $(this).parent().next('.holidays-hotel-list').find(
                '.more-rate-card-container').length;
            if (packagesFilteredCount > 0) {
                for (var i = 0; i < fLength; i++) {
                    if (destinations[i] == $(this).find('.cm-header-label').text()) {
                        filterDestination = true;
                        break;
                    }
                }
            }
            $(this).parent().toggle(filterDestination)
            $(this).parent().next('.holidays-hotel-list').toggle(filterDestination);
        });
}

function seasonFilter(season, selectedData) {
    var filterSeason = false;
    if (season == "")
        return false;
    if (selectedData['season']) {
        selectedData['season'].forEach(function(item) {
            if (season.indexOf(item.toLowerCase()) > -1) {
                filterSeason = true;
                return;
            }
        })
    }
    return filterSeason;
}

function priceFilter(priceOncard, selectedData, match) {
    var price = priceOncard;
    for (var j = 0; j < selectedData["price"].length; j++) {
        if (selectedData["price"][j] == "Upto ₹40,000" || selectedData["price"][j] == "below") {
            if (price <= 39999) {
                return true;
            }
        } else if (selectedData["price"][j] == "₹40,00 to ₹80,000" || selectedData["price"][j] == "between") {
            if (price >= 40000 && price <= 80000) {
                return true;
            }
        } else {
            if (price >= 80000) {
                return true;
            }
        }
    }
    return false;
}

// filter intitiate on destination page
function filterSetOnDestFromLand(options) {
    filterOnDestination(options);
    // globalMultipleFilterLocal(options,$('.popular-destination-wrap-spec'), $alldestCard , '.popularDest-wrap');
}

function filterOnWedding() {
    $('#holidaysFilterNoResults').hide();
    var selectedWeddingFilter = [];
    $('.multiselect-container .active input').each(function() {
        selectedWeddingFilter.push($(this).val());
    });
    $('.weddings-wrap-spec .events-card-wrap').each(function() {
        var cardData = $(this).attr('data-venuetypes');
        var currentWeddingCard = $(this);
        var capacityFlag;
        var countryFlag;
        var weddingFlag = 0;
        var _this = $(this);
        if (selectedWeddingFilter) {
            weddingFlag = 1;
            capacityFlag = filterOnCapacity($(this));
            countryFlag = filterOnCountry($(this));
        }

        if (weddingFlag && capacityFlag && countryFlag) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

function filterOnCapacity(_this) {
    var selectedCapacityFilter = [];
    var capacityFlag = 0;
    $('#Max .multiselect-container .active input').each(function() {
        selectedCapacityFilter.push($(this).val());
    });
    selectedCapacityFilter.forEach(function(capacityFilter) {
        var cardCapacity = _this.attr('data-capacity');
        if (cardCapacity) {
            var lowerLimit = 0,
                upperLimit = 100;
            if (capacityFilter.includes('-')) {
                var filterValues = capacityFilter.split('-');
                lowerLimit = filterValues[0];
                upperLimit = filterValues[1];
            } else if (capacityFilter.includes('+')) {
                var filterValues = capacityFilter.split('+');
                upperLimit = filterValues[0];
            }
            if (Number(cardCapacity) >= Number(lowerLimit) && Number(cardCapacity) <= Number(upperLimit)) {
                capacityFlag++;
            }
        }
    });
    if (selectedCapacityFilter.length == 0) {
        capacityFlag = 1;
    }
    return capacityFlag;
}

function filterOnCountry(_this) {
    var selectedCountryFilter = [];
    var countryFlag = 0;
    $('#Country .multiselect-container .active input').each(function() {
        selectedCountryFilter.push($(this).val());
    });
    selectedCountryFilter.forEach(function(countryFilter) {
        if (_this.attr('data-location') && _this.attr('data-location').includes(countryFilter.toLowerCase())) {
            countryFlag++;
        }
    });
    if (selectedCountryFilter.length == 0) {
        countryFlag = 1;
    }
    return countryFlag;
}

$(document).ready(function() {
    $(".Terms-cond-head-wrapper").click(function(e) {
        if ($(".Terms-cond-desc").hasClass("open")) {
            $(".image-view").removeClass("up");
            $(".Terms-cond-desc").slideUp(200);;
            $(".Terms-cond-desc").removeClass('open');

        } else {
            $(".Terms-cond-desc").slideDown(200);;
            $(".image-view").addClass("up");
            $(".Terms-cond-desc").addClass('open');
        }
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        return false;
    });
});
$(document).ready(function() {

    //Corporate page
    var button_list = document.querySelectorAll('.corporate-btn');
    var button_array = [...button_list];
    button_array.forEach(button => {
        button.addEventListener('click', (event) => {
            let hotel_id = $(button).attr("data-corporatehotel-id");
            let hotel_name = $(button).attr("data-corporatehotel-name");
            let corporate_hotel = {
                'hotel_id': hotel_id,
                'hotel_name': hotel_name
            };
            localStorage.setItem("corporate-hotel", JSON.stringify(corporate_hotel));
        })
    });


    var isRateRequired = $("#hide-rates").data("hide-rate-container");
    var isButtonRequired = $("#hide-button").data("hide-button-container");
    if (isRateRequired == true) {
        $('.hotelCard_hotelDetails .taj-loader.spinner_wait_con').hide();
        $('.rate_con').hide();
        //$('.hotelCard_hotelDetails .hotelDetails-name-wrap').width("90%");
    }
    if (isButtonRequired == true) {
        $('.hotelCard_hotelDetails .view-btn-con').hide();
    }
})

function onOfferDetailsHotelSelection(hotelPath, hotelId) {

    var redirectToSynXis = $("#synxis-settings").data("redirecttosynxis");
    if (redirectToSynXis == true) {
        goToSynXis(hotelId);
    } else {
        goToHotelRoomsPage(hotelPath, hotelId);

    }

}

function goToHotelRoomsPage(hotelPath, hotelId) {

    var ROOMS_PATH = "rooms-and-suites.html";
    if ($('.cm-page-container').hasClass('ama-theme') || hotelPath.includes('amastaysandtrails.com')) {
        ROOMS_PATH = "accommodations.html";
    }
    var offerRateCode = $("[data-offer-rate-code]").data("offer-rate-code");
    var comparableOfferRateCode = $("[data-offer-rate-code]").data("comparable-offer-rate-code");
    var offerTitle = $("[data-offer-rate-code]").data("offer-title");
    var noOfNights = $("[data-offer-rate-code]").data("offer-no-of-nights");
    var offerStartsFrom = $("[data-offer-rate-code]").data("offer-starts-from");

    // to check member signin in rooms and suits page
    var dataOfferCategory = $("[data-offer-rate-code]").data("offer-category");
    var memberOnlyOffer = $("[data-offer-rate-code]").data("offer-member-only");

    if ((dataOfferCategory && dataOfferCategory.toLowerCase().includes('member')) ||
        (memberOnlyOffer && memberOnlyOffer == true)) {
        dataCache.session.setData("memberOnlyOffer", "true");
    }


    var bookOptions = dataCache.session.getData("bookingOptions");
    var fromDate = "";
    if (bookOptions != undefined) {
        fromDate = moment(bookOptions.fromDate, "MMM Do YY");
    }
    if (offerStartsFrom) {
        var startsFrom = moment(offerStartsFrom).format('MMM Do YY');
        if (!moment(startsFrom, 'MMM Do YY').isSameOrBefore(moment(fromDate, 'MMM Do YY'))) {
            fromDate = startsFrom;
            bookOptions.fromDate = fromDate;
            var nextDate = moment(fromDate, "MMM Do YY").add(1, 'days').format("MMM Do YY");
            bookOptions.toDate = nextDate;

        }
    }
    var nights;
    if (noOfNights && noOfNights != '0') {
        nights = noOfNights;
        var toDate = moment(fromDate, "MMM Do YY").add(parseInt(nights), 'days').format("MMM Do YY");
        bookOptions.toDate = toDate;

    }
    if (bookOptions != undefined) {
        bookOptions.nights = parseInt(moment.duration(
                moment(moment(bookOptions.toDate, "MMM Do YY")).diff(moment(bookOptions.fromDate, "MMM Do YY")))
            .asDays());
    }
    dataCache.session.setData("bookingOptions", bookOptions);

    var navPath = hotelPath.replace(".html", "");
    if (hotelPath.slice(-1) === '/') {
        navPath = navPath + ROOMS_PATH;
    } else {
        navPath = navPath + '/' + ROOMS_PATH;
    }
    if (navPath != "" && navPath != null && navPath != undefined && !navPath.includes("https")) {
        navPath = navPath.replace("//", "/");
    }
    var from = moment(bookOptions.fromDate, "MMM Do YY").format('D/MM/YYYY');
    var to = moment(bookOptions.toDate, "MMM Do YY").format('D/MM/YYYY');
    if (offerRateCode) {
        if (comparableOfferRateCode) {
            offerRateCode = offerRateCode + ',' + comparableOfferRateCode;
        }
        navPath = updateQueryString("overrideSessionDates", "true", navPath);
        navPath = updateQueryString("from", from, navPath);
        navPath = updateQueryString("to", to, navPath);
        if ($("#offerCodeName").text()) {
            navPath = updateQueryString($("#offerCodeName").text(), offerRateCode, navPath);
        } else {
            navPath = updateQueryString("offerRateCode", offerRateCode, navPath);
        }
        navPath = updateQueryString("offerTitle", offerTitle, navPath);
    }
    if (window.location.href.includes("businessConnect") && !navPath.includes('/en-in/ginger/')) {
        navPath = 'https://author-taj-dev65-02.adobecqms.net/content/tajhotels/en-in/about-us/special/corporate-access.html?wcmmode=disabled'
    }


    addNavigateToHotelDataToDataLayer(hotelId, hotelPath);

    window.open(navPath, '_blank');
}

function goToSynXis(hotelId) {

    var offerRateCode = $(".offers-room-container").data("offer-rate-code");
    var synXisParamName = $("#synxis-settings").data("synxisparam");
    var startDate = $(".offers-room-container").data("offer-starts-from");
    var rooms = 1;
    var adult = 1;
    var child = 0;
    var arrive = moment(startDate).format('YYYY-MM-DD');
    var depart = moment(arrive, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD");
    var chain = $("#synxis-settings").data("chain");
    var currency = $("#synxis-settings").data("currency");
    var level = $("#synxis-settings").data("level");
    var locale = $("#synxis-settings").data("locale");
    var sbe_ri = $("#synxis-settings").data("sberi");
    var synXisParamValue = $("#synxis-settings").data("offercode");
    var hotel = hotelId;

    var synxisLink = "https://be.synxis.com/";

    redirectPath = synxisLink + "?adult=" + adult + "&arrive=" + arrive + "&chain=" + chain + "&child=" + child +
        "&currency=" + currency + "&depart=" + depart + "&hotel=" + hotel + "&level=" + level + "&locale=" +
        locale + "&rooms=" + rooms + "&sbe_ri=" + sbe_ri;

    if (synXisParamName && synXisParamName != '') {
        if (synXisParamValue && synXisParamValue != '') {
            redirectPath = redirectPath + "&" + synXisParamName + "=" + synXisParamValue;
        }
    } else if (synXisParamValue && synXisParamValue != '') {
        redirectPath = redirectPath + "&promo=" + synXisParamValue;
    } else if (offerRateCode && offerRateCode != '') {
        redirectPath = redirectPath + "&offerRateCode=" + offerRateCode;
    }
    window.open(redirectPath, "_blank");
}


//updated for global data layer
function addNavigateToHotelDataToDataLayer(hotelId, hotelPath) {
    if (location.pathname.includes('/en-in/offers')) {
        try {
            var offerDetails = $('.offerdetails');
            var offerName = offerDetails.find('.cm-header-label').text();
            var offerCode = offerDetails.find('.offers-room-container').data('offer-rate-code');
            var offerValidity = offerDetails.find('.validity-container .validity-content').text().trim();
            var offerCategory = offerDetails.find('.offers-room-container').data('offer-category');
            var eventName = offerName.split(' ').join('') + '_ParticipatingHotels_KnowMore_OffersPage_ViewHotel';
            var offerObj = {};
            offerObj.hotelName = hotelPath.split('/')[5];
            offerObj.hotelCode = hotelId;
            offerObj.offerName = offerName;
            offerObj.offerCode = offerCode;
            offerObj.offerValidity = offerValidity;
            offerObj.offerCategory = offerCategory;

            addParameterToDataLayerObj(eventName, offerObj);
        } catch (err) {
            console.log('error in adding data to datalayer');
        }
    }
}
$(window).load(function() {
    if (!$(".cm-page-container").hasClass("ama-theme")) {
        if ($("#booking-search-campaign").is(":visible") == false) {
            updateBookingCache();
        }
    }
    var showContact = $("#showContact").text();
    if (showContact == "true") {
        $(".ho-contact-options-con").removeClass("d-none");
    }

});

function updateBookingCache() {
    var redirectPath = "";
    var hotelId = "";
    var today = new Date();
    today.setDate(today.getDate());
    var tommorow = moment(new Date()).add(1, 'days')['_d'];
    var dayAfterTommorow = moment(new Date()).add(2, 'days')['_d'];

    var checkInDate = moment(tommorow).format("MMM Do YY");
    var checkOutDate = moment(dayAfterTommorow).format("MMM Do YY");
    var numberOfRooms = 1;
    var selectedRoomOptions = [];

    var packageNoOfAdults = 1;
    var packageNoOfChildren = 0;
    var roomInfo = {
        adults: packageNoOfAdults,
        children: packageNoOfChildren,
        initialRoomIndex: 1
    }
    selectedRoomOptions.push(roomInfo);

    var bookingOptions = dataCache.session.getData("bookingOptions");
    if (bookingOptions != undefined) {
        bookingOptions.fromDate = checkInDate;
        bookingOptions.toDate = checkOutDate;
        bookingOptions.roomOptions = selectedRoomOptions;
        bookingOptions.isAvailabilityChecked = false;
        bookingOptions.nights = 1;
        dataCache.session.setData("bookingOptions", bookingOptions);
    }

}
$(document).ready(function() {
    $(".participating-hotels button.cm-btn-secondary.view-button").text('Book Now');
    //$(".view-button").text('Book Now');
    //participating-hotels-search

    if ($('.cm-page-container').hasClass('ama-theme')) {
        $('.participating-hotels-search').hide();
    }
    var searchFilteredLength = 0;
    var $participatingHotelsRow = $(".participating-hotels .row.participating-hotels-row");
    var $participatingHotelsFilterRow = $participatingHotelsRow.clone("true");
    $participatingHotelsRow.after($participatingHotelsFilterRow);
    $participatingHotelsFilterRow.hide();
    $participatingHotelsFilterRow
        .removeClass("participating-hotels-row")
        .addClass("participating-hotels-filter-row");
    $(".search-input-section input").on("keyup", function() {
        disable_pagination()
        var value = $(this).val().toLowerCase();
        $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
        searchFilteredLength = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap:visible").length;
        if (searchFilteredLength == 0) {

            resultsWarningText(false);
        } else {
            resultsWarningText(true);
        }
        if (value == '') {
            init_pagination();
        }

    });

    $(".hotelTypes").on('change', function() {
        var value = $(this).val().toLowerCase();

        var $filteredHotels;
        if (value == "choose") {
            $(".participating-hotels .row.participating-hotels-filter-row .hotelCard-container-outer-wrap").addClass("filtered-hotel-card");
        } else {
            $(".participating-hotels .row.participating-hotels-filter-row .hotelCard-container-outer-wrap").each(function() {
                $(this).toggleClass("filtered-hotel-card", $(this).data('hoteltypes').indexOf(value) > -1)
            });
        }
        $filteredHotels = $(".participating-hotels .row.participating-hotels-filter-row .hotelCard-container-outer-wrap.filtered-hotel-card").clone("true");
        $participatingHotelsRow.empty().append($filteredHotels);
        if ($(".sortTypes").val().toLowerCase() != "choose") {
            sortParticipatingHotels();
        } else {
            init_pagination();
            $(".search-input-section input").trigger("keyup");
        }
    });

    $(".sortTypes").on('change', function() {
        sortParticipatingHotels();
    });

    $('#search-filter-section-dropdown').selectBoxIt();
    $('#search-sort-section-dropdown').selectBoxIt();
});

function sortParticipatingHotels() {
    var value = $(".sortTypes").val().toLowerCase();

    var $sortedHotels;
    if (value == "choose") {
        $(".hotelTypes").trigger("change");
        $sortedHotels = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap.filtered-hotel-card");
        if ($sortedHotels.length == 0) {
            $sortedHotels = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap");
        }
    } else if (value == "reviewrating") {
        var reviewRatings = [];
        var $ratingContainer = $('.rating-container');
        for (var i = 0; i < $ratingContainer.length; i++) {
            var reviewRating = $($ratingContainer[i]).find('.rating').text();
            if ($.inArray(reviewRating, reviewRatings) === -1) reviewRatings.push(reviewRating);
        }
        reviewRatings = reviewRatings.sort().reverse();

        var participatedHotelCards = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap.filtered-hotel-card");

        if (participatedHotelCards.length == 0) {
            participatedHotelCards = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap");
        }

        for (var r = 0; r < reviewRatings.length; r++) {
            participatedHotelCards.each(function() {
                if (reviewRatings[r] == $(this).find('.rating').text()) {
                    if ($sortedHotels) {
                        $sortedHotels = $sortedHotels + $(this).context.outerHTML;
                    } else {
                        $sortedHotels = $(this).context.outerHTML;
                    }
                }
            });
        }
    }
    if ($sortedHotels) {
        $(".participating-hotels .row.participating-hotels-row").empty().append($sortedHotels);
    }
    init_pagination();
    $(".search-input-section input").trigger("keyup");

}

function resultsWarningText(isSuccess) {
    var $resultWarningWrapper = $(".results-warning-text-wrapper");
    var $successResult = $(".results-warning-text-wrapper .results-success");
    var $failedResult = $(".results-warning-text-wrapper .results-failed");
    var $resultsWarningValue = $(".results-warning-value");
    var warningResultText = "";
    var searchBarValue = $(".search-input-section input").val();
    var filterByValue = $(".hotelTypes option:selected").text();
    if (searchBarValue.length > 0) {
        searchBarValue = 'for "' + searchBarValue + '"';
        warningResultText += searchBarValue;
    }
    if (filterByValue != "Choose" && filterByValue.length > 0) {
        filterByValue = ' with filter "' + filterByValue + '"';
        warningResultText += filterByValue;
    }
    $resultWarningWrapper.toggle(warningResultText != "");
    $resultsWarningValue.text(warningResultText);
    $successResult.toggle(isSuccess);
    $failedResult.toggle(!isSuccess);
}
$(document).ready(function() {
    init_pagination();
    bind_paginate_function();
});

init_pagination = function() {

    list_size = $(".participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap").length;
    paginate_interval = 6;
    current_offset = paginate_interval;
    if (list_size < paginate_interval) {
        disable_pagination()
    } else {
        $('.participating-hotels-show-more').show();
        $('.participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap').not(':lt(' + current_offset + ')').hide();
    }
}

bind_paginate_function = function() {
    $('.participating-hotels-show-more').click(function() {
        current_offset = (current_offset + paginate_interval < list_size) ? current_offset + paginate_interval : (list_size)
        $('.participating-hotels .row.participating-hotels-row .hotelCard-container-outer-wrap:lt(' + current_offset + ')').show()
        if (current_offset == list_size) {
            disable_pagination();
        }
    });
}

disable_pagination = function() {
    $('.participating-hotels-show-more').hide();
}






$(document).ready(function() {

    hideRateLabels();
    var bookingOptionsSelected = dataCache.session.getData("bookingOptions") || {
        fromDate: moment(new Date()).add(1, 'days').format("MMM Do YY"),
        toDate: moment(new Date()).add(2, 'days').format("MMM Do YY"),
        rooms: 1,
        nights: 1,
        roomOptions: [{
            adults: 1,
            children: 0
        }],
        selection: [],
        promoCode: null,
        hotelChainCode: null,
        hotelId: null
    };
    // updateHotelChainCodeAndHoteID( bookingOptionsSelected );
    dataCache.session.setData("bookingOptions", bookingOptionsSelected);

    $(document).on('currency:changed', function(e, currency) {
        currencySelected = currency;

        if (currencySelected != undefined) {
            setCurrencyInSessionStorage(currencySelected);
        }
    });
    checkForCurrencyStringInCache();


});

function checkForCurrencyStringInCache() {
    var bookingOptions = getBookingOptionsSessionData();
    if (bookingOptions.currencySelected === undefined) {
        try {
            setCurrencyInSessionStorage(getCurrentCurrencyInHeader());
        } catch (error) {
            console.log('caught error in fetching currency');
        }
    }
}

function getCurrentCurrencyInHeader() {
    return $($.find("[data-selected-currency]")[0]).data().selectedCurrency;
}

$(window).load(function() {
    hideRateLabels();
    var isRateRequired = $("#hide-rates").data("hide-rate-container");
    if (!(isRateRequired == true)) {
        invokeRateFetcherAjaxCall();
    }

    /*To display custom offer price in hotel cards*/
    var customOfferRateDisplay = $('#customOfferRateDisplay').text();
    var priceJson = $('#customPriceJson').text() ? JSON.parse($('#customPriceJson').text()) : '';
    if (customOfferRateDisplay && priceJson) {
        $('.hotelCard-container-outer-wrap[data-hotelid] .rate_con').show();
        $('.hotelCard-container-outer-wrap[data-hotelid] .rate_con .hotelDetailsRate').text('Rates not available')
        for (let x in priceJson) {
            console.log(x + ": " + priceJson[x]);
            $('.hotelCard-container-outer-wrap[data-hotelid="' + x + '"] .rate_con .hotelDetailsRate').text('Starting Rate/Night');
            $('.hotelCard-container-outer-wrap[data-hotelid="' + x + '"] .rate_con .hotelDetailsRateNew .rate-currency-symbol').html('₹');
            $('.hotelCard-container-outer-wrap[data-hotelid="' + x + '"] .rate_con .current-rate').text(priceJson[x]);
        }
    }
});

var popupCheck = true;
var participatingHotelsResponse = [];

function invokeRateFetcherAjaxCall() {
    $('.check-wait-spinner').css('display', "block");
    console.log("inside invokeRateFetcherAjaxCall");
    var hotelID = [];
    $('[data-hotelid]').each(function() {
        if (!hotelID.includes($(this).attr("data-hotelid"))) {
            hotelID.push($(this).attr("data-hotelid"));
        }
    });

    var cacheText = JSON.stringify(dataCache.session.getData("bookingOptions"));
    var cacheJSONData = JSON.parse(cacheText);
    var checkInDate = cacheJSONData.fromDate;
    var checkOutDate = cacheJSONData.toDate;
    var rooms = cacheJSONData.rooms;
    var selectionCount = cacheJSONData.selectionCount;
    var roomCount = cacheJSONData.roomCount;
    var selection = (cacheJSONData.selection.length <= 0) ? cacheJSONData.roomOptions : cacheJSONData.selection;
    var hotelId = cacheJSONData.hotelCode;

    var roomDetails = [];
    for (i = 0; i < selection.length; i++) {
        var roomDetail = {};
        roomDetail["numberOfAdults"] = selection[i].adults;
        roomDetail["numberOfChildren"] = selection[i].children;
        roomDetails.push(roomDetail);
    }

    var checkInDate = moment(checkInDate, "MMM Do YY").format("YYYY-MM-DD");
    var checkOutDate = moment(checkOutDate, "MMM Do YY").format("YYYY-MM-DD");

    var hotelIds = [];
    var isSuccess = true;
    var lengthOfString = hotelID.length;
    console.log("total length of hotels ::" + lengthOfString);
    var i = 0;
    setNonAvailableToAllRoomCards("Rates Not Available");
    var promoCode = $('#promoCodeforPriceFetch').text();
    promoCode = promoCode ? '&promoCode=' + promoCode : '';

    while (i < lengthOfString) {
        var ids = [];
        for (i; i < lengthOfString; i++) {

            if (i == 0 || i % 10 != 0) {
                ids.push(hotelID[i]);
            } else {
                ids.push(hotelID[i]);
                break;
            }

        }
        $.ajax({
            type: 'GET',
            url: '/bin/fetch/rooms-prices',
            dataType: 'json',
            data: "hotelIds=" + JSON.stringify(ids) + "&checkInDate=" + checkInDate + "&checkOutDate=" + checkOutDate +
                "&roomDetails=" + JSON.stringify(roomDetails) + "&roomCount=" + rooms + promoCode,
            success: function(response) {
                var successResponse = JSON.stringify(response.responseCode);
                var successMessage = successResponse.substring(1, successResponse.length - 1);
                if (successMessage == "SUCCESS") {
                    isSuccess = true;
                    $('.check-wait-spinner').css('display', "none");
                    var hotelDetailsList = JSON.parse(response.hotelDetails);
                    participatingHotelsResponse.push(hotelDetailsList);
                    setRatesForHotel(hotelDetailsList);
                } else {
                    if (popupCheck) {
                        popupCheck = false;
                        $('.spinner_wait_con').hide();
                        showRateLabel();
                        var warningPopupParams = {
                            title: 'Availability Failed!',
                            description: response.message,
                        }
                        warningBox(warningPopupParams);
                    }
                }
            },
            error: function(error) {
                isSuccess = false;
                console.error("Failed to get rate for availability" + error);
            }
        })
        hotelIds.push(ids);
        i = i + 1;
    }

    if (isSuccess) {
        // setRatesForHotel(hotelDetailsList);
    } else {
        console.log("Error occured while trying to fetch the hotel details");
    }

}

function setRatesForHotel(hotelDetailsList) {
    hideLoadingSpinner();
    showRateLabel();
    if (hotelDetailsList.length > 0) {
        for (i = 0; i < hotelDetailsList.length; i++) {
            enablePriceViewforRoomsWithRate(hotelDetailsList[i]);
        }
    } else {
        setNonAvailableToAllRoomCards("Rates Not Available");
    }
}

function setNonAvailableToAllRoomCards(status) {

    $(".participating-hotels .row .hotelCard-container-outer-wrap").each(function() {
        $(this).find(".hotelDetailsRate").html(status);
        $(this).find(".bookingButtonContainer").hide();
    })
}

function enablePriceViewforRoomsWithRate(hotelDetail) {
    var currentHotelRef = $(".participating-hotels .row").find("[data-hotelid='" + hotelDetail.hotelCode + "']");
    var hotelDetailsRate = currentHotelRef.find(".hotelDetailsRate");
    var bookingButtonContainer = currentHotelRef.find(".bookingButtonContainer");
    var currentRate = bookingButtonContainer.find(".current-rate")
    var rateCurrencySymbol = bookingButtonContainer.find(".rate-currency-symbol");
    var totalPrice = hotelDetail.lowestTotalPrice;
    var discountedPrice = hotelDetail.lowestDiscountedPrice;
    var currencySymbol = "";
    if (hotelDetail.currencyCode) {
        currencySymbol = hotelDetail.currencyCode.currencyString;
    }
    var checking;
    checking = setActiveCurrencyWithResponseValue(currencySymbol);

    if (checking) {
        currencySymbol = getCurrencyCache().currencySymbol.trim();
    }

    if (totalPrice > 0) {
        bookingButtonContainer.show();
        hotelDetailsRate.html("Starting Rate/Night")
        rateCurrencySymbol.html(currencySymbol.trim());
        if (discountedPrice == 0) {
            currentRate.html(getCommaFormattedNumber(totalPrice));
            bookingButtonContainer.find(".hotelDetailsRateStriked").hide();
        } else {
            currentRate.html(getCommaFormattedNumber(discountedPrice));
            discountedRoomRef = bookingButtonContainer.find(".hotelDetailsRateStriked");
            discountedRoomRef.html(hotelDetail.lowestTotalPrice);
        }
    }

}

function getBookingOptionsSessionData() {
    return dataCache.session.getData("bookingOptions");
}

function setCurrencyInSessionStorage(currency) {
    var bookingOptions = getBookingOptionsSessionData();
    bookingOptions.currencySelected = currency;

    dataCache.session.setData("bookingOptions", bookingOptions);
}

function getCommaFormattedNumber(number) {
    var formattedNumber;
    if (isNaN(number)) {
        formattedNumber = number;
    } else {
        formattedNumber = number.toLocaleString('en-IN')
    }
    return formattedNumber;
}

function hideRateLabels() {
    $('.rate_con').hide();
}

function showRateLabel() {
    $('.rate_con').show();
}

function hideLoadingSpinner() {
    $('.waiting-spinner-participating-hotels').hide();
}

function showLoadingSpinner() {
    $('.rate_con').show();
}


var contextualBanners;

if (!contextualBanners)
    contextualBanners = [];

$(document).ready(
    function() {
        //            ihclImageCarousel();
        hideControlsMobile();
        hideControlsSingleBanner();

        $("#bannerCarousel").on("slid.bs.carousel", "", hideControlsMobile);


        var isSafari = navigator.userAgent.indexOf('Safari') != -1 && navigator.vendor == "Apple Computer, Inc.";
        if (isSafari && document.getElementById("videoPlaySafari")) {
            document.getElementById("videoPlaySafari").style.visibility = "visible";
        }

        var videoPlaySafari = document.getElementById("videoPlaySafari");
        if (videoPlaySafari) {
            $("#videoPlaySafari").on("touchstart click", function() {
                var vid = document.getElementById("videoAudio");
                //vid.play();
                document.getElementById("videoPlaySafari").style.display = "none";
                /*  if(vid.muted){
                var volumeImage = document.getElementById("muteVideo");
                    volumeImage.src= "/content/dam/tajhotels/icons/style-icons/mute-48.png";
                    vid.muted = false;
                }else{
                    var volumeImage = document.getElementById("muteVideo");
                    volumeImage.src= "/content/dam/tajhotels/icons/style-icons/volume-up-2-48.png";
                    vid.muted = true;
                }
                */
                var playPromise = vid.play();
                if (playPromise !== undefined) {
                    playPromise.then(function(d) {
                        document.getElementById("videoPlaySafari").style.display = "none";
                        if (vid.muted) {
                            var volumeImage = document.getElementById("muteVideo");
                            volumeImage.src = "/content/dam/tajhotels/icons/style-icons/mute-48.png";
                            vid.muted = false;
                        } else {
                            var volumeImage = document.getElementById("muteVideo");
                            volumeImage.src = "/content/dam/tajhotels/icons/style-icons/volume-up-2-48.png";
                            vid.muted = true;
                        }
                    }, function(err) {
                        console.log('auto play is muted');
                    })
                }
                return false;
            });
        }

        var muteVideo = document.getElementById("muteVideo");
        if (muteVideo) {
            $("#muteVideo").on("touchstart click", function() {
                var vid = document.getElementById("videoAudio");
                vid.play();
                if (vid.muted) {
                    var volumeImage = document.getElementById("muteVideo");
                    volumeImage.src = "/content/dam/tajhotels/icons/style-icons/mute-48.png";
                    vid.muted = false;
                } else {
                    var volumeImage = document.getElementById("muteVideo");
                    volumeImage.src = "/content/dam/tajhotels/icons/style-icons/volume-up-2-48.png";
                    vid.muted = true;
                }
                /*var playPromise = vid.play();
                      if (playPromise !== undefined) {
                        playPromise.then(_ => {
                          if(vid.muted){
                        var volumeImage = document.getElementById("muteVideo");
                            volumeImage.src= "/content/dam/tajhotels/icons/style-icons/mute-48.png";
                            vid.muted = false;
                        }else{
                            var volumeImage = document.getElementById("muteVideo");
                            volumeImage.src= "/content/dam/tajhotels/icons/style-icons/volume-up-2-48.png";
                            vid.muted = true;
                        }
                        })
                        .catch(error => {
                          // Auto-play was prevented
                          // Show paused UI.
                        });
                    }*/
                return false;
            });
        }

        /* if(document.getElementById("fullHeight")){

			var fullheight= document.getElementById("fullHeight").value;
            console.log(fullheight);
            if( fullheight=="true")
            {
                $(".carousel, .mr-carousel-wrap, .mr-carousel-wrap .banner-carousel-each-wrap .bannerImage img, .mr-carousel-wrap .banner-carousel-each-wrap, .mr-carousel-wrap img.img-hotel, .banner-carousel>.banner-container-wrapper>.hotel-carousel-section .carousel-item").css('height', '93vh');


                $(".carousel",".mr-carousel-wrap",".mr-carousel-wrap .banner-carousel-each-wrap img",
                 ".mr-carousel-wrap .banner-carousel-each-wrap",".mr-carousel-wrap img.img-hotel",
                 "#bannerCarousel .carousel-item").css("height","93vh");


            }

            }*/


        // hide left, right control on mobile viewport
        function hideControlsMobile() {
            var $this = $("#bannerCarousel");
            if (window.matchMedia('(max-width: 767px)').matches) {
                $this.children(".carousel-control-prev").hide();
                $this.children(".carousel-control-next").hide();
            }
        };

        // hide controls if there is a single banner
        function hideControlsSingleBanner() {
            var $this = $("#bannerCarousel");
            var banners = $this.find(".carousel-item");
            var indicators = $this.find(".carousel-indicators");
            if (banners.length === 1) {
                indicators.hide();
                $this.children(".carousel-control-prev").hide();
                $this.children(".carousel-control-next").hide();
            }
        }
        // show controls if there is a single banner
        function showControlsBanner() {
            var $this = $("#bannerCarousel");
            var banners = $this.find(".carousel-item");
            var indicators = $this.find(".carousel-indicators");
            if (banners.length > 1) {
                indicators.show();
                $this.children(".carousel-control-prev").show();
                $this.children(".carousel-control-next").show();
            }
        }


        if (contextualBanners.length > 0) {
            profileFetchListener(updateContextualBanner)
            //if (userCacheExists()) {
            updateContextualBanner();
            //}
        }

        // Login related
        if ($("#bannerCarousel").data("login-support")) {
            //registerLoginListener(updateUserCarousel);
            if (userCacheExists()) {
                updateUserCarousel();
            }
            showControlsBanner();
        }

        // Update the first banner slide with user name
        function updateUserCarousel() {
            var banner = $("#bannerCarousel");
            var userData = getUserData();
            var userBannerIndex = 0;
            if (userData && userData.loyalCustomer == 'Y') {
                userBannerIndex = 0;
            }
            var firstSlide = banner.find(".carousel-item").get(userBannerIndex);
            if (userData.nameDetails) {
                userData.nameDetails.salutation = userData.nameDetails.salutation ? userData.nameDetails.salutation : "";
                $($(firstSlide).find(".banner-titles .cm-header-label")[0]).text(userData.nameDetails.salutation + ' ' + userData.nameDetails.firstName + ' ' + userData.nameDetails.lastName);
                var userData = getUserData();
                userData.tier = userData.loyaltyInfo && userData.loyaltyInfo.length > 0 ?
                    (userData.loyaltyInfo[0].currentSlab ? userData.loyaltyInfo[0].currentSlab : '') : '';
                userData.tier = userData.tier == "Copper*" ? "Copper" : userData.tier;

                if ($($(firstSlide).find(".mr-banner-btn-anc")[userBannerIndex])) {
                    $($(firstSlide).find(".banner-titles .holidays-selection-text")[0]).html("<img src='/content/dam/tajhotels/icons/style-icons/tick.svg' width='20'><span> You are a " + userData.tier + " Member</span>");
                    if (window.location.href.indexOf("en-in/tajinnercircle") != -1) {
                        $($(firstSlide).find(".mr-banner-btn-anc")[0]).attr('href', '/en-in/tajinnercircle/My-Profile/');
                    } else if (window.location.href.indexOf("en-in/tataneu") != -1) {
                        $($(firstSlide).find(".mr-banner-btn-anc")[0]).attr('href', '/en-in/tataneu/my-profile/');
                    } else if (window.location.href.indexOf("en-in/neupass") != -1) {
                        $($(firstSlide).find(".mr-banner-btn-anc")[0]).attr('href', '/en-in/neupass/my-profile/');
                    }
                }
            }
            $($('.banner-carousel-each-wrap')[userBannerIndex]).find('.mr-innerCircle-member-offers .holidays-selection-text').removeClass('mobile-display-none')
            $('#bannerCarousel').carousel(0);
        }


        function updateContextualBanner() {
            var userData = getUserData();
            if (userData) {
                userData.tier = userData.loyaltyInfo && userData.loyaltyInfo.length > 0 ? userData.loyaltyInfo[0].currentSlab : '';
                userData.tier = userData.tier == "Copper*" ? "Copper" : userData.tier;
            }
            contextualBanners.forEach(function(banner) {
                if (userData && userData.tier && banner.context.toLowerCase().includes(userData.tier.toLowerCase())) {
                    $("#bannerCarousel .carousel-inner").prepend(banner.dom);
                    //$( banner.dom ).insertAfter($($("#bannerCarousel .carousel-inner").children())[0] ); 
                    var ind = $('#bannerCarousel .carousel-indicators li');
                    $('#bannerCarousel .carousel-indicators').append('<li data-target="#bannerCarousel" data-slide-to="' + (ind.length) + '"></li>');
                } else if (!banner.context && !userData) {
                    $("#bannerCarousel .carousel-inner").prepend(banner.dom);
                    var ind = $('#bannerCarousel .carousel-indicators li');
                    $('#bannerCarousel .carousel-indicators').append('<li data-target="#bannerCarousel" data-slide-to="' + (ind.length) + '"></li>');
                }

                $('#bannerCarousel').carousel(0);
            });

        }

        $('body').on('taj:update-banner-onlogin', function() {
            updateContextualBanner();
            updateUserCarousel();
        });


        getBannerDataForDataLayer();
    });

function registerContextualBanner(contextBannerKey, context) {
    var banner = document.getElementById(contextBannerKey);
    var obj = {
        context: context,
        dom: banner
    };
    contextualBanners.push(obj);
}


//updated for global data layer
function getBannerDataForDataLayer() {
    $('.mr-visit-hotel').each(function() {
        $(this).click(function() {
            try {
                var carousalBtnTxt = $(this).text().split(' ').join('');
                var bannerLabel = $(this).parent('a').siblings('.cm-header-label').text().split(' ').join('');
                var eventName = bannerLabel + '_CarouselBanner_' + carousalBtnTxt + '_HomePage_' + carousalBtnTxt;
                addParameterToDataLayerObj(eventName, {});
            } catch (err) {
                console.log('error in creating eventName');
            }
        });
    });

}
$(document).ready(function() {
    setDateInBanner();
    setTempInBanner();
});

function setDateInBanner() {
    try {
        var apiKey = $('.hotel-carousel-section').data('apikey');
        var hotellat = $('#banner-temperature').data('hotellat');
        var hotellon = $('#banner-temperature').data('hotellon');

        if (hotellat != undefined && hotellon != undefined) {
            var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + hotellat + "&lon=" + hotellon +
                "&appid=" + apiKey + "&units=metric";

            $.getJSON(queryURL, function(data) {
                var temp = data.main.temp;
                var tempRound = parseFloat(temp).toFixed();
                if (tempRound != 'NaN') {
                    $('#bannerCarousel #temperature-update').append(tempRound);
                } else {
                    $('.hotel-banner-temperature').hide();
                }
            });
        }
    } catch (error) {
        console.log("Lat and long can't found.");
    }
}

function setTempInBanner() {
    try {
        var currentDate = moment(new Date()).format('Do MMM YYYY');
        $('#bannerCarousel').find('.banner-date').text(currentDate);
    } catch (error) {
        console.log("Setting Date in banner failed.");
    }
}





const companyName = document.getElementById("business-company");
const addressLineOne = document.getElementById("business-addresslineOne");
const addressLineTwo = document.getElementById("business-addresslinetwo");
const state = document.getElementById("business-state");
const city = document.getElementById("business-city");
const postalCode = document.getElementById("business-postal");
const telephoneNumber = document.getElementById("business-telephone");
const gstNumber = document.getElementById("business-gstno");
const addMemberButton = document.querySelector(".register-addmember-btn");

//Declaring Member section variables which comes in loop
/*const firstName = document.getElementsByClassName("business-firstName");
const lastName = document.getElementsByClassName("business-lastName");
const residentialAddress = document.getElementsByClassName("business-residentialaddress");
const mobileNumber = document.getElementsByClassName("business-mobile");
const dateOfBirth = document.getElementsByClassName("business-dateofbirth");
const emailID = document.getElementsByClassName("business-email");
var memberStatus = "";*/

const getCompanyNameError = companyName ? companyName.nextElementSibling.innerText : "";
const getAddressLine1Error = addressLineOne ? addressLineOne.nextElementSibling.innerText : "";
const getAddressLine2Error = addressLineTwo ? addressLineTwo.nextElementSibling.innerText : "";
const getStateError = state ? state.nextElementSibling.innerText : "";
const getCityError = city ? city.nextElementSibling.innerText : "";
const getPostalCodeError = postalCode ? postalCode.nextElementSibling.innerText : "";
const getTelephoneError = telephoneNumber ? telephoneNumber.nextElementSibling.innerText : "";
const getGstNumberError = gstNumber ? gstNumber.nextElementSibling.innerText : "";

const getFirstNameError = $($('.business-firstName')[0]) ? $($('.business-firstName')[0]).next().text() : "";
const getLastNameError = $($('.business-lastName')[0]) ? $($('.business-lastName')[0]).next().text() : "";
const getAddressError = $($('.business-residentialaddress')[0]) ? $($('.business-residentialaddress')[0]).next().text() : "";
const getMobileError = $($('.business-mobile')[0]) ? $($('.business-mobile')[0]).next().text() : "";
const getDateOfBirthError = $($('.business-dateofbirth')[0]) ? $($('.business-dateofbirth')[0]).next().text() : "";
const getEmailIDError = $($('.business-email')[0]) ? $($('.business-email')[0]).next().text() : "";

//Company Validation
function companyValidation(val) {
    const regName = /^[a-zA-Z0-9\s,&'-]+$/;
    if (!regName.test(val.trim())) {
        document.getElementById("business-errormessage-company").innerHTML = "Please enter valid Company Name";
        document.getElementById("business-errormessage-company").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-company").innerHTML = "Success";
        document.getElementById("business-errormessage-company").style.color = "Green";
        return true;
    }
}

//Address Line One Validation
function addressLineOneValidation(val) {
    const regName = /^[a-zA-Z0-9\s,&'-\/]+$/;
    if (!regName.test(val.trim())) {
        document.getElementById("business-errormessage-addresslineOne").innerHTML = "Please enter the Valid Address";
        document.getElementById("business-errormessage-addresslineOne").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-addresslineOne").innerHTML = "Success";
        document.getElementById("business-errormessage-addresslineOne").style.color = "Green";
        return true;
    }
}

//Address Line Two Validation
function addressLineTwoValidation(val) {
    const regName = /^[a-zA-Z0-9\s,&'-\/]+$/;
    if (!regName.test(val.trim())) {
        document.getElementById("business-errormessage-addresslinetwo").innerHTML = "Please enter the Valid Address";
        document.getElementById("business-errormessage-addresslinetwo").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-addresslinetwo").innerHTML = "Success";
        document.getElementById("business-errormessage-addresslinetwo").style.color = "Green";
        return true;
    }
}

//State Validation
function statevalidation(val) {
    const regName = /^[a-zA-Z\s,'-]+$/;
    if (!regName.test(val.trim())) {
        document.getElementById("business-errormessage-state").innerHTML = "Please enter valid State";
        document.getElementById("business-errormessage-state").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-state").innerHTML = "Success";
        document.getElementById("business-errormessage-state").style.color = "Green";
        return true;
    }
}

//City Validation
function cityvalidation(val) {
    const regName = /^[a-zA-Z\s,'-]+$/;
    if (!regName.test(val.trim())) {
        document.getElementById("business-errormessage-city").innerHTML = "Please enter valid City";
        document.getElementById("business-errormessage-city").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-city").innerHTML = "Success";
        document.getElementById("business-errormessage-city").style.color = "Green";
        return true;
    }
}

//Postal Code Validation
function postalCodeValidation(val) {
    const regName = /^[1-9][0-9]{5}$/;
    if (!regName.test(val)) {
        document.getElementById("business-errormessage-postalcode").innerHTML = "Please enter valid Postal Code";
        document.getElementById("business-errormessage-postalcode").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-postalcode").innerHTML = "Success";
        document.getElementById("business-errormessage-postalcode").style.color = "Green";
        return true;
    }
}

//Telephone Number Validation
function TelephoneValidation(val) {
    const regName = /^[0-9]{10}$/;
    if (!regName.test(val)) {
        document.getElementById("business-errormessage-telephone").innerHTML = "Please enter valid Mobile Number";
        document.getElementById("business-errormessage-telephone").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-telephone").innerHTML = "Success";
        document.getElementById("business-errormessage-telephone").style.color = "Green";
        return true;
    }
}

//Gst Validation
function gstValidation(val) {
    const regName = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
    if (!regName.test(val)) {
        document.getElementById("business-errormessage-gstnumber").innerHTML = "Please enter valid Gst Number";
        document.getElementById("business-errormessage-gstnumber").style.color = "red";
        return false;
    } else {
        document.getElementById("business-errormessage-gstnumber").innerHTML = "Success";
        document.getElementById("business-errormessage-gstnumber").style.color = "Green";
        return true;
    }
}

//First Name Validation
function firstNamevalidation(event) {
    let val = event.value;
    const regName = /^[A-Za-z]+$/;
    if (!regName.test(val)) {
        event.nextElementSibling.innerHTML = "Please enter valid First Name";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        event.nextElementSibling.innerHTML = "Success";
        event.nextElementSibling.style.color = "Green";
        return true;
    }
}


//LastName Validation
function lastNamevalidation(event) {
    let val = event.value;
    const regName = /^[A-Za-z]+$/;
    if (!regName.test(val)) {
        event.nextElementSibling.innerHTML = "Please enter valid Last Name";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        event.nextElementSibling.innerHTML = "Success";
        event.nextElementSibling.style.color = "Green";
        return true;

    }
}

//Residential Address Validation
function residentialAddressValidation(event) {
    let val = event.value;
    const regName = /^[a-zA-Z0-9\s,&'-\/]+$/;
    if (!regName.test(val.trim())) {
        event.nextElementSibling.innerHTML = "Please enter the Valid Registered Address";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        event.nextElementSibling.innerHTML = "Success";
        event.nextElementSibling.style.color = "Green";
        return true;
    }
}

//Mobile Validation
function MobileValidation(event) {
    let val = event.value;
    const regName = /^[0-9]{10}$/;
    if (!regName.test(val) || val[0] < 6) {
        event.nextElementSibling.innerHTML = "Please enter valid Mobile Number";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        event.nextElementSibling.innerHTML = "Success";
        event.nextElementSibling.style.color = "Green";
        return true;
    }
}

// //Date of Birth validation
function dateOfBirthValidation(event) {
    let val = event.value;
    const regName = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    if (!regName.test(val.toString())) {
        event.nextElementSibling.innerHTML = "Please enter valid Date of Birth";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        let g1 = new Date();
        let g2 = new Date(val.toString());
        let g3 = new Date("1900-01-01");
        if ((g1.valueOf() > g2.valueOf()) && (g3.valueOf() < g2.valueOf())) {
            event.nextElementSibling.innerHTML = "Success";
            event.nextElementSibling.style.color = "Green";
            return true;
        } else {
            event.nextElementSibling.innerHTML = "Please enter valid Date of Birth";
            event.nextElementSibling.style.color = "red";
            return false;
        }
        // event.nextElementSibling.innerHTML = "Success";
        // event.nextElementSibling.style.color = "Green";
        // return true;
    }
}

//Email Validation
function emailvalidation(event) {
    let val = event.value;
    // const regName = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const regName = /^[^.[\]\\"@)(:;><,]([a-zA-Z0-9~`!#$%^&*_+-=}{|'/?]+)*[^.[\\\]"@)(:;><,]@[a-zA-Z0-9]+[.]([-]*[a-zA-Z0-9]+)+$/;
    if (!regName.test(val) || val.includes(' ')) {
        event.nextElementSibling.innerHTML = "Please enter valid Email";
        event.nextElementSibling.style.color = "red";
        return false;
    } else {
        event.nextElementSibling.innerHTML = "Success";
        event.nextElementSibling.style.color = "Green";
        return true;
    }
}

//Member YesStatus Validation
function statusvalidation(event, event1) {
    let statusError = $(event).parents(".mem-status").next();
    if (event.checked) {
        memberStatus = "Yes";
        // statusError.html("Success");
        // statusError.css("color", "green");
        return [true, memberStatus];
    } else if (event1.checked) {
        memberStatus = "No";
        // statusError.html("Success");
        // statusError.css("color", "green");
        return [true, memberStatus];
    } else {
        // statusError.html("Please select Member Status");
        // statusError.css("color", "red");
        return [false];
    }
}


function submitFormClick() {
    let companyValid = companyValidation(companyName.value);
    let addressOneValid = addressLineOneValidation(addressLineOne.value);
    let addressTwoValid = addressLineTwoValidation(addressLineTwo.value);
    let stateValid = statevalidation(state.value);
    let cityValid = cityvalidation(city.value);
    let postalValid = postalCodeValidation(postalCode.value);
    let telephoneValid = TelephoneValidation(telephoneNumber.value);
    let gstValid = gstValidation(gstNumber.value);
    let membersValid = membersValidation();
    if (companyValid && addressOneValid && addressTwoValid && stateValid && cityValid && postalValid && telephoneValid && gstValid && membersValid) {
        $('.memberformsubmit').attr('disabled', 'disabled');
        $('.memberformsubmit').addClass('disabled');
        let submitButtonText = $('.memberformsubmit').text().trim(' ');
        $('.memberformsubmit').text('Submitting...');
        $.ajax({
            type: "POST",
            url: "/bin/bussinessConnectMail",
            data: {
                companyName: companyName.value.trim(),
                addressLineOne: addressLineOne.value.trim(),
                addressLineTwo: addressLineTwo.value.trim(),
                state: state.value.trim(),
                city: city.value.trim(),
                postalCode: postalCode.value,
                telephoneNumber: telephoneNumber.value,
                gstNumber: gstNumber.value,
                memberDetails: JSON.stringify(memberDetail)
            },
            success: function(data) {
                $('.memberformsubmit').removeAttr('disabled');
                $('.memberformsubmit').removeClass('disabled');
                $('.memberformsubmit').text(submitButtonText);
                if (data == "Mail Sent Successfully") {
                    /*$("#bannerModal").removeClass("show");
                    $("#bannerModal").css("display", "none");
                    $(".modal-backdrop").prop("outerHTML", "");
                    $("body").removeClass("modal-open");
                    $(".form-success").show();
                    setTimeout(function() {
                        $(".form-success").hide();
                    }, 3000);
                    $(".form-horizontal").reset();*/

                    closeBusinessConnectForm();
                    $("#businessConnectFormSuccess").show();
                    setTimeout(function() {
                        $("#businessConnectFormSuccess").hide();
                    }, 3000);
                    resetBusinessConnectForm();
                }
            },
            error: function(data) {
                console.log("Error in sending email", data);
            },
        })
    }
}

$(document).ready(function() {
    var tablinks_list = document.querySelectorAll(".register-addmember-btn");
    var tablinks_array = [...tablinks_list];

    tablinks_array.forEach((div) => {
        div.addEventListener("click", addMember);
    });
});

function addMember() {
    var getLengthOfMembers = document.querySelectorAll(".member-number-container").length;

    var newElement = document.createElement("div");
    newElement.className = "member-number-container";
    newElement.innerHTML = `<div class="form-group">
                              <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                  <div class="row">
                                      <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-5">
                                          <div class="register-member-role">
                                              <p>Member ${getLengthOfMembers + 1}</p>
                                          </div>
                                      </div>
 
                                  </div>
                              </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div class="row">
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                                            <label class="control-label" for="email">Full Name</label>
                                        </div>
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 checkSpace">
                                            <div class="col-xl-12 col-lg-12 col-md-12 co-sm-12 col-12 gridsspacing checkSpace">
                                                <div class="row">
                                                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 gridsinnerspacing">
                                                        <input type="text" class="form-control business-firstName" name="businessfirstName" onkeyup="firstNamevalidation(this)" />
                                                        <span class="business-errormessage-firstname">First Name</span>
                                                    </div>
                                                    <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 gridsinnerspacing">
                                                        <input type="text" class="form-control business-lastName" name="businessLastName" onkeyup="lastNamevalidation(this)" />
                                                        <span class="business-errormessage-lastname">Last Name</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div class="row">
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                                            <label class="control-label" for="email">Residential Address</label>
                                        </div>
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 gridsinnerspacing">
                                            <input type="text" class="form-control business-residentialaddress" name="businessresidentialaddress" onkeyup="residentialAddressValidation(this)" />
                                            <span class="business-errormessage-residentialaddress">Residential Address</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div class="row">
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                                            <label class="control-label" for="email">Mobile Number</label>
                                        </div>
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 gridsinnerspacing">
                                            <div class="form-group business-mobilegroup">
                                                <span class="border-end country-code px-2">+91</span>
                                                <input type="text" class="form-control business-mobile" name="businessmobile" placeholder="XXXXX XXXXX" aria-describedby="emailHelp" onkeyup="MobileValidation(this)" />
                                                <span class="business-errormessage-mobile">Mobile Number</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div class="row">
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12">
                                            <label class="control-label" for="email">Date of Birth</label>
                                        </div>
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 gridsinnerspacing">
                                            <input type="date" class="form-control business-dateofbirth" name="businessdateofbirth" onkeyup="dateOfBirthValidation(this)" />
                                            <span class="business-errormessage-dateofBirth">Date of Birth</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12">
                                    <div class="row">
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-12">
                                            <label class="control-label" for="email">Email ID</label>
                                        </div>
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 gridsinnerspacing">
                                            <input type="email" class="form-control business-email" name="businessEmail" onkeyup="emailvalidation(this)" />
                                            <span class="business-errormessage-emailId">Email ID</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 member-rol-program-grid">
                                    <div class="row">
                                        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
                                            <label class="control-label member-rol-program" for="email">Are you a member of any IHCL Loyalty Program like Tata Neu or Epicure</label>
                                        </div>
                                        <div class="col-xl-4 col-lg-4 col-md-4 col-sm-12 col-12 gridsinnerspacing">
                                            <div class="mem-status">
                                                <label class="radio-inline radio-spacing"> <input type="radio" name="businessRadio${getLengthOfMembers}" class="membership-radio business-yesOtp" checked />Yes </label>
                                                <label class="radio-inline"> <input type="radio" name="businessRadio${getLengthOfMembers}" class="membership-radio business-noOtp" />No </label>
                                            </div>
                                            <span class="business-errormessage-memberstatus"></span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                                    <div class="row">
                                        <div class="business-horizontal-line member-submit-line"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 submit-form-section"></div>
                            </div>`;

    document.querySelector(".register-member-container").appendChild(newElement);

    tablinks_list = document.querySelectorAll(".register-addmember-btn");
    tablinks_array = [...tablinks_list];
    tablinks_array.forEach((div) => {
        div.addEventListener("click", addMember);
    });

    if (getLengthOfMembers >= 4) {
        tablinks_array.forEach((div) => {
            div.remove();
            return true;
        });
    }

    $($('.business-firstName')[getLengthOfMembers]).focus();
}

var memberDetail = [];

function membersValidation() {
    var getAllMembers = document.querySelectorAll('.member-number-container');
    var memberStatus = [];

    var allMembersValid = [];
    for (i = 0; i < getAllMembers.length; i++) {
        let firstNameValid = firstNamevalidation(document.querySelectorAll(".business-firstName")[i]);
        let lastNameValid = lastNamevalidation(document.querySelectorAll(".business-lastName")[i]);
        let resAddressValid = residentialAddressValidation(document.querySelectorAll(".business-residentialaddress")[i]);
        let mobileValid = MobileValidation(document.querySelectorAll(".business-mobile")[i]);
        let dobValid = dateOfBirthValidation(document.querySelectorAll(".business-dateofbirth")[i]);
        let emailValid = emailvalidation(document.querySelectorAll(".business-email")[i]);
        let statusValid = statusvalidation(document.querySelectorAll(".business-yesOtp")[i], document.querySelectorAll(".business-noOtp")[i]);

        if (firstNameValid && lastNameValid && resAddressValid && mobileValid && dobValid && emailValid && statusValid[0]) {
            allMembersValid[i] = true;
            memberDetail[i] = {
                firstName: document.querySelectorAll(".business-firstName")[i].value.trim(),
                lastName: document.querySelectorAll(".business-lastName")[i].value.trim(),
                residentialAddress: document.querySelectorAll(".business-residentialaddress")[i].value.trim(),
                mobileNumber: document.querySelectorAll(".business-mobile")[i].value,
                dateOfBirth: document.querySelectorAll(".business-dateofbirth")[i].value,
                emailID: document.querySelectorAll(".business-email")[i].value.trim(),
                memberStatus: statusValid[1]
            }
        } else {
            allMembersValid[i] = false;
        }
    }
    const allEqual = allMembersValid => allMembersValid.every(val => val === allMembersValid[0] && val != false);
    const result = allEqual(allMembersValid)
    return result;
}

function resetBusinessConnectForm() {
    $(".form-horizontal")[0].reset();
    companyName.nextElementSibling.innerText = getCompanyNameError;
    addressLineOne.nextElementSibling.innerText = getAddressLine1Error;
    addressLineTwo.nextElementSibling.innerText = getAddressLine2Error;
    state.nextElementSibling.innerText = getStateError;
    city.nextElementSibling.innerText = getCityError;
    postalCode.nextElementSibling.innerText = getPostalCodeError;
    telephoneNumber.nextElementSibling.innerText = getTelephoneError;
    gstNumber.nextElementSibling.innerText = getGstNumberError;

    let getAllMembers = document.querySelectorAll('.member-number-container');
    for (i = 0; i < getAllMembers.length; i++) {
        $($('.business-firstName')[i]).next().text(getFirstNameError);
        $($('.business-lastName')[i]).next().text(getLastNameError);
        $($('.business-residentialaddress')[i]).next().text(getAddressError);
        $($('.business-mobile')[i]).next().text(getMobileError);
        $($('.business-dateofbirth')[i]).next().text(getDateOfBirthError);
        $($('.business-email')[i]).next().text(getEmailIDError);
    }
    for (let i = getAllMembers.length - 1; i > 0; i--) {
        $($('.member-number-container')[i]).prop("outerHTML", "");
    }

    $('.form-horizontal input.form-control + span').removeAttr("style");
    if ($('.register-add-member').html().trim('') == '') {
        $('.register-add-member').html(addMemberButton);
    }
}

function openBusinessConnectForm() {
    let backDropModal = document.createElement("div");
    backDropModal.className = "modal-backdrop fade show";
    $("#bannerModal").css("display", "block");
    $("body").addClass("modal-open");
    $("body").append(backDropModal);
    setTimeout(function() {
        $("#bannerModal").addClass("show");
        $('#bannerModal').scrollTop("0");
    }, 0);
}

$('.business-banner-enrol').removeAttr('data-toggle');
$('.business-banner-enrol').removeAttr('data-target');
$('.membership-enrolbtn').removeAttr('data-toggle');
$('.membership-enrolbtn').removeAttr('data-target');
$('.modalbuttonclose').removeAttr('data-dismiss');

$('.business-banner-enrol').click(() => {
    openBusinessConnectForm();
});

$('.membership-enrolbtn').click(() => {
    openBusinessConnectForm();
});

$('.modalbuttonclose').click(() => {
    closeBusinessConnectForm();
    resetBusinessConnectForm();
});

function closeBusinessConnectForm() {
    $("#bannerModal").removeClass("show");
    $(".modal-backdrop").prop("outerHTML", "");
    $("body").removeClass("modal-open");
    $("#bannerModal").css("display", "none");
}