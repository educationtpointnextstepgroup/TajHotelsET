async function getTdlSsoToken({
    authCode,
    codeVerifier
}) {
    console.log('Logging tdl tokens', authCode, codeVerifier);
    if (!authCode || !codeVerifier) return;
    var req_data = {
        "codeVerifier": decodeURI(codeVerifier)
    }
    $.ajax({
        type: "POST",
        url: "/bin/ssoTd",
        crossDomain: true,
        dataType: 'json',
        data: {
            authToken: authCode,
            req_data: JSON.stringify(req_data)
        }
    }).done(function(res) {
        var ssoResponse = JSON.parse(res);
        console.log("ssoResponse", ssoResponse);
        localStorage.setItem("access_token", ssoResponse.accessToken);
        localStorage.setItem("refresh_token", ssoResponse.refreshToken);
        const {
            firstName,
            lastName,
            email,
            phone,
            customerHash
        } = ssoResponse.idToken;
        localStorage.setItem('user', JSON.stringify(ssoResponse.idToken));
        tdlSsoAuth ? tdlSsoAuth.createSession(ssoResponse.accessToken) : '';
        var tajUser = JSON.parse(localStorage.getItem('tajData')) ? JSON.parse(localStorage.getItem('tajData')).userDetails : null;
        if (ssoResponse.accessToken != null && ssoResponse.refreshToken != null) {
            var userDetails = JSON.parse(localStorage.getItem('user'));
            validateAccessToken(ssoResponse.accessToken, userDetails, ssoResponse.refreshToken);
        }
    }).fail(function(res) {
        console.log('login error:  ', res);

    });


}

const getParameterByName2 = (name, url) => {

    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const authCode = getParameterByName2('authCode');
const codeVerifier = getParameterByName2('codeVerifier');

if (authCode != null)
    localStorage.setItem("authCode", authCode);
if (codeVerifier != null)
    localStorage.setItem("codeVerifier", codeVerifier);

var customerDataFetched = false;

if (authCode && codeVerifier) {
    getTdlSsoToken({
        authCode,
        codeVerifier
    });
} else {
    if (typeof tdlSsoAuth != 'undefined') {
        tdlSsoAuth.getSession().then(function(ssoResp) {
            if (ssoResp.authCode && ssoResp.codeVerifier) {
                var authObj = {
                    'authCode': ssoResp.authCode,
                    'codeVerifier': ssoResp.codeVerifier
                };
                getTdlSsoToken(authObj);
            } else if (localStorage.getItem("access_token")) {
                if (typeof tdlSsoAuth != 'undefined') {
                    tdlSsoAuth.createSession(localStorage.getItem("access_token")).then(function(ssoResp) {
                        if (ssoResp) {
                            tdlSsoAuth.getSession().then(function(ssoResp) {
                                if (ssoResp.authCode && ssoResp.codeVerifier) {
                                    var authObj = {
                                        'authCode': ssoResp.authCode,
                                        'codeVerifier': ssoResp.codeVerifier
                                    };
                                    getTdlSsoToken(authObj);
                                }
                            });
                        } else {
                            localStorage.removeItem("access_token");
                            localStorage.removeItem("refresh_token");
                            localStorage.removeItem("user");
                            localStorage.removeItem("auth_code");
                        }
                    });
                }

            } else {
                var tajData = JSON.parse(localStorage.getItem("tajData"));
                if (tajData && tajData.userDetails) {
                    delete tajData["userDetails"];
                    localStorage.setItem("tajData", JSON.stringify(tajData));
                }
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                localStorage.removeItem("auth_code");
            }
        });

    }
}

var userDetails;
var tdlsignOut;
$(window).load(function() {
    var currentUrl = window.location.href;
    var encodedUri = encodeURIComponent(currentUrl);
    var clientID = document.querySelector("meta[name='tdl-sso-client_id']").getAttribute("content");

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("authCode")) {
        var auth_code = urlParams.get("authCode");
        var uri = window.location.toString();
        var clean_uri = uri.substring(0, uri.indexOf("?"));
        var campaignparams = (uri.indexOf("utm_")) !== -1 ? uri.substring(uri.indexOf("utm_")) : ''; //uri.substring(uri.indexOf("utm_"));
        clean_uri = campaignparams !== "" ? clean_uri + '?' + campaignparams : clean_uri;
        window.history.replaceState({}, document.title, clean_uri);
        currentUrl = window.location.href;
    } else {
        if (typeof tdlSsoAuth != 'undefined') {
            tdlSsoAuth.getSession().then(function(ssoResp) {
                if (ssoResp.authCode && ssoResp.codeVerifier) {
                    var authObj = {
                        'authCode': ssoResp.authCode,
                        'codeVerifier': ssoResp.codeVerifier
                    };
                    getTdlSsoToken(authObj);
                } else {
                    if (localStorage.getItem("access_token")) {
                        tdlSsoAuth ? tdlSsoAuth.createSession(localStorage.getItem("access_token")) : '';
                    }
                }
            });
        }

    }

    var access_tkn = localStorage.getItem("access_token");
    const refresh_tkn = localStorage.getItem("refresh_token");
    userDetails = JSON.parse(localStorage.getItem('user'));
    console.log("tokens received", access_tkn, refresh_tkn);
    if (!(authCode && codeVerifier) && access_tkn != null && refresh_tkn != null) {
        validateAccessToken(access_tkn, userDetails, refresh_tkn);
    }

    tdlsignOut = logoutAccessToken => {
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
            window.location.href = "https://www.tajhotels.com/en-in/tajinnercircle/";
        } else if (window.location.href.includes('tajinnercircle/My-Profile') || window.location.href.includes('tajinnercircle/my-profile')) {
            window.location.href = "https://www.tajhotels.com/en-in/tajinnercircle/";
        }

    }
    const selectEnv = (href) => {
        href = href ? href : window.location.href;
        if (href.includes('localhost') || href.includes('0.0.0.0')) return 'http://localhost:8080/api/v1';
        if (href.includes('taj-dev65-02')) return 'https://ppapi.tatadigital.com/api/v2/sso';
        if (href.includes('dev')) return 'https://ppapi.tatadigital.com/api/v2/sso';
        if (href.includes('stage')) return 'https://sapi.tatadigital.com/api/v1/sso';
        return 'https://api.tatadigital.com/api/v2/sso';
    }

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

})

function upateAccessToken() {
    console.log("call refresh token");
    callToRefreshToken(refresh_tkn, userdetails);
}
//setInterval(upateAccessToken, 120000);    //120000 1800000
var userdetailsGlobal;

function validateAccessToken(accessTk, userdetails, refresTk) {
    console.log("inside validate token");
    $.ajax({
        type: "POST",
        url: "/bin/validateTokenTd",
        crossDomain: true,
        dataType: 'json',
        data: {
            authToken: accessTk,
            req_data: JSON.stringify(accessTk)
        }
    }).done(function(res) {
        var validateToknResp = JSON.parse(res);
        if (validateToknResp == null) {
            callToRefreshToken(refresTk, userdetails);
        } else if (validateToknResp.success && validateToknResp.success.toLowerCase() === "valid access token") {
            if (!userdetails) {
                userdetails = {
                    'customerHash': validateToknResp.customerHash
                };
            }!customerDataFetched ? getUserDetailsUsingToken(accessTk, userdetails) : '';
            userdetailsGlobal = userdetails;
            if (customerDataFetched == 'pending') {
                setTimeout(function() {
                    customerDataFetched != true ? getUserDetailsUsingToken(accessTk, userdetailsGlobal) : '';
                }, 3000);
            }
        } else if (validateToknResp.message && validateToknResp.message.toLowerCase() == "invalid token") {
            callToRefreshToken(refresTk, userdetails);
        }
    }).fail(function(res) {
        console.log('login error:  ', res);
        var validateToknResp = JSON.parse(res);

        if (validateToknResp.success && validateToknResp.success.toLowerCase() != "valid access token") {
            callToRefreshToken(refresTk, userdetails);
        }
    });
}

function callToRefreshToken(refreshTokenR, userdetails) {
    var refreshTk = {
        refreshToken: refreshTokenR
    }
    $.ajax({
        type: "POST",
        url: '/bin/refreshTokenTd',
        crossDomain: true,
        dataType: 'json',
        data: {
            authToken: refreshTokenR,
            req_data: JSON.stringify(refreshTk)
        },
        success: function(result) {
            var refreshTokenResp = JSON.parse(result);
            var newAccess_token = "";

            if (result == null || refreshTokenResp.message === "TOKEN_GENERATION_FAILED" || refreshTokenResp.code === "SSO-1069") {
                var popupParams = {
                    title: 'Session timed out',
                    description: "Please Login again to continue."
                };

                var isInnerCirclePage = window.location.href.indexOf("tajinnercircle") != -1;

                if ($('.cm-warning-box-main') && $('.cm-warning-box-main').length === 0 && !warningShown && isInnerCirclePage) {
                    warningBox(popupParams);
                    warningShown = true;
                    $('.cm-warning-box-main > .cm-warning-box-inner-wrap')
                        .append("<div class='cm-warning-box-btns' style='display: block;'><div class='cm-warning-box-proceed-btn'><button class='cm-btn-secondary warning-proceed-btn' id='proceedToSignIn'><span>Proceed</span><span class='dummy-to-middle-align'></span></button></div><div class='cm-warning-box-cancel-btn'><button class='cm-btn-primary warning-cancel-btn' id='proceedToSignOut'><span>Cancel</span><span class='dummy-to-middle-align'></span></button></div></div>");
                    $('#proceedToSignOut').on('click', function() {
                        //ssoTdSignOut();
                        if (localStorage.getItem("access_token")) {
                            tdlsignOut(refreshTokenR);
                        }
                        $('.cm-warning-box-con').remove();
                    });
                    $('#proceedToSignIn').on('click', function() {
                        if (typeof clientID === 'undefined') {
                            encodedUri = encodeURIComponent(window.location.href);
                            clientID = document.querySelector('meta[name="tdl-sso-client_id"]').getAttribute("content");
                        }
                        window.location.href = selectLoginUrlEnv() + '?clientId=' + clientID + '&redirectURL=' + encodedUri;
                    });
                } else {
                    if (localStorage.getItem("access_token")) {
                        tdlsignOut(refreshTokenR);
                    }
                }
            } else {

                if (refreshTokenResp && (refreshTokenResp.access_token || refreshTokenResp.accessToken)) {
                    var accessToken = refreshTokenResp.access_token || refreshTokenResp.accessToken;
                    localStorage.setItem("access_token", accessToken);
                    newAccess_token = refreshTokenResp.accessToken;
                    getUserDetailsUsingToken(newAccess_token, userdetails);
                }
            }
        },
        error: function(error) {
            if (access_tkn != null && refresh_tkn != null) {
                if (typeof clientID === 'undefined') {
                    encodedUri = encodeURIComponent(window.location.href);
                    clientID = document.querySelector('meta[name="tdl-sso-client_id"]').getAttribute("content");
                }
                window.location.href = selectLoginUrlEnv() + '?clientId=' + clientID + '&redirectURL=' + encodedUri;
            }
        },
    });
}

function getUserDetailsUsingToken(accesstkn, userInfo) {
    var cstmhash = userInfo.customerHash;
    var req_data = {
        "customerHash": cstmhash
    }
    customerDataFetched = "pending";
    $.ajax({
        type: "POST",
        url: '/bin/fetchTdCustomer',
        data: {
            req_data: JSON.stringify(req_data),
            authToken: accesstkn
        },
        dataType: "json",

    }).done(function(data) {

        data = JSON.parse(data);
        if (data.brandData == null) {
            data.brandData = {};
            data.brandData.ticNumber = [];
            data.brandData.ticNumber[0] = data.tcpNumber;

        } else if (data.brandData.ticNumber == null) {
            data.brandData.ticNumber = [];
            data.brandData.ticNumber[0] = data.tcpNumber;
        }
        if (data.loyaltyInfo == null) {
            data.loyaltyInfo = [{}];
        }
        data.nameDetails = data.nameDetails ? data.nameDetails : {};
        if (typeof dataCache != 'undefined') {
            dataCache.local.setData("userDetails", data);
        }
        if (typeof(trigger_signin) != 'undefined' && !window.userLoggedInSession) {
            trigger_signin('TIC_FormLogin_SignIn_HomePage_Login', {
                tcpHash: cstmhash
            });
            window.userLoggedInSession = true;
        }

        /*Setting global var to true so that subsequent fetch customer calls does not trigger */
        customerDataFetched = true;

        if (userDetails && userDetails.firstName)
            loginSuccessHandler1(userDetails);
        else {
            if (typeof dataCache != 'undefined') {
                dataCache.local.setData("userDetails", data);
            }
            var userDetails = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {};

            userDetails.firstName = data.nameDetails.firstName;
            userDetails.lastName = data.nameDetails.lastName;
            localStorage.setItem('user', JSON.stringify(userDetails));

            loginSuccessHandler1(data);
        }
        typeof displayTataNeuHeaderFooter !== "undefined" ? displayTataNeuHeaderFooter() : '';
        typeof updateFooterForTataNeu !== "undefined" ? updateFooterForTataNeu() : '';
    }).fail(function(error) {

        console.log("error in fetch customer api", error);
    });
}

function loginSuccessHandler1(user_info) {
    var name = user_info.firstName ? user_info.firstName : (user_info.nameDetails ? user_info.nameDetails.firstName : '');
    if (typeof dataToBot != "undefined")
        dataToBot();
    setTimeout(function() {
        $('body').trigger('taj:loginSuccess', [name]);
    }, 3000);
}


$(document).ready(function() {
    $('body').on('taj:sign-in', function() {
        console.log("inside sign in function");
        var currentUrl = window.location.href;
        var encodedUri = encodeURIComponent(currentUrl);
        // console.log("Encoded uri ",encodedUri);
        var clientID = document.querySelector("meta[name='tdl-sso-client_id']").getAttribute("content");
        //   console.log("cureenturl: "+currentUrl+ "clientId "+clientID)
        if (!userLoggedIn()) {
            trigger_signin('TIC_FormLogin_SignIn_HomePage_Login', {});
            var signInLink = $('#sign-in-btn a').attr('data-component-id');
            if (signInLink != undefined || signInLink != null) {
                $('#sign-in-btn > .nav-link').attr('href', signInLink + '?clientId=' + clientID + '&redirectURL=' + encodedUri);
            } else {
                $('#sign-in-btn > .nav-link').attr('href', 'https://members.tajhotels.com/v2/?clientId=' + clientID + '&redirectURL=' + encodedUri);
            }
            if (window.location.href.indexOf("rooms-and-suites") != -1 || window.location.href.indexOf("offers-and-promotions") != -1) {
                var popupParams = {
                    title: 'Login to avail this offer. Not a member yet? <a class="signupanchor" style="text-decoration: underline;color: var(--primaryColor);">Sign Up</a> now',
                    description: '',
                    callBack: redirectToSignIn,
                    callBackSecondary: reloadRoomPage,
                    needsCta: true,
                }
                successBox(popupParams);
                if ($('.successBoxRemoveRef') && $('.successBoxRemoveRef').length > 0) {
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.warning-proceed-btn span')[0]).html('Login');
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.cm-warning-box-logo-con')[0])
                        .html('<img src="/content/dam/tajhotels/icons/style-icons/TIC%20logo-N.png" width="120" style="margn-bottom: 10px;">');
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.cm-success-box-heading-text')[0]).css('font-size', '18px');
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.signupanchor')[0]).attr("href", $('#sign-in-btn > .nav-link').attr('href').replace('login', ''));
                }

                function redirectToSignIn() {
                    window.location.href = $('#sign-in-btn > .nav-link').attr('href');
                }

                function reloadRoomPage() {
                    //window.location.reload();
                }
            } else {
                window.location.href = $('#sign-in-btn > .nav-link').attr('href');
            }
            $('.checkout-anchor').attr("href", $('#sign-in-btn > .nav-link').attr('href'));
        } else {
            document.location.reload();
        }

    });
});

const base64encode = (arraybuffer) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bytes = new Uint8Array(arraybuffer),
        i, len = bytes.length,
        base64 = "";
    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
};

const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const base64Digest = base64encode(digest);

    return base64Digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

function generateRandomStringTdlSsoAuth(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const getTdSsoRedirectClientAuthCode = async (redirectUrl) => {

    let accessToken = localStorage.getItem("access_token");

    if (!redirectUrl) return;

    var domain = "";
    var redirectClientId = "";

    if (window.location.href.indexOf("https://author-taj-dev65-02.adobecqms.net/") == 0 ||
        window.location.href.indexOf("https://taj-dev65-02.adobecqms.net/") == 0) {
        domain = "https://gingerhotels.w007cms.milestoneinternet.info/";
        if (redirectUrl.indexOf("/ginger-") != -1) {
            redirectClientId = "IHCL-GINGER-WEB-APP";
        }
    } else if (window.location.href.indexOf("https://www.tajhotels.com/") == 0 ||
        window.location.href.indexOf("https://www.vivantahotels.com/") == 0 ||
        window.location.href.indexOf("https://www.seleqtionshotels.com/") == 0 ||
        window.location.href.indexOf("https://author-taj-prod65a.adobecqms.net/") == 0) {
        domain = "https://www.gingerhotels.com/";
        //if (redirectUrl.indexOf("/ginger-") != -1) { // starts-new changes for IHCL CrossBrand
        redirectClientId = "IHCL-WEB-APP";
        //}
    } else {
        return;
    }

    if (redirectUrl.indexOf("/content/tajhotels/en-in/our-hotels/hotels-in-") != -1) {
        redirectUrl = redirectUrl.split("/content/tajhotels/en-in/our-hotels/hotels-in-")[1];
        redirectUrl = "/en-in" + redirectUrl.substr(redirectUrl.indexOf("/"), redirectUrl.indexOf(".html") - redirectUrl.indexOf("/"));
    }

    if (!accessToken) {
        if (redirectUrl.indexOf("&overrideSessionDates=true") == -1) {
            var originalGingerQueryParams = redirectUrl.split("/")[5];
            redirectUrl = domain + redirectUrl.split("/")[3].split(".html")[0] + "?";
            if (originalGingerQueryParams) {
                redirectUrl = redirectUrl + originalGingerQueryParams;
            }
            //redirectUrl = domain + redirectUrl.split("/")[3].split(".html")[0] + "?" + redirectUrl.split("/")[4];
            redirectUrl = redirectUrl + appendDefaultGingerQueryParams(redirectUrl);
        } else {
            const unwantedParams = ["&rateTab=PROMOCODE", "&overrideSessionDates=true"];
            redirectUrl = removeUnwantedGingerQueryParams(redirectUrl, unwantedParams);
            redirectUrl = redirectUrl + appendDefaultGingerQueryParams(redirectUrl);
        }
        window.location.href = redirectUrl;
    }

    var oldRedirectUrl = redirectUrl;
    if (redirectUrl.indexOf("/ginger-") != -1) {
        indexOfGinger = redirectUrl.indexOf("/ginger-") + 1;
        redirectUrl = domain + redirectUrl.substr(indexOfGinger);
        //redirectUrl = redirectUrl.replace("/&", "?");
        //redirectUrl = redirectUrl.substr(0, indexOfGinger + 1 + domain.length);
        //redirectUrl = redirectUrl + "?" + oldRedirectUrl.split("/")[4];
    }
    // celebrating the joy- offer - click here link changes ---------
    if (accessToken && redirectUrl.indexOf("ginger") != -1 && redirectUrl.indexOf("/specials") != -1 && redirectUrl.indexOf("celebrating-the-joy") != -1) {
        redirectUrl = domain + redirectUrl.substr(redirectUrl.indexOf("specials/"));
        redirectClientId = "IHCL-GINGER-WEB-APP";
    }
    // -----------------
    redirectUrl = redirectUrl.replace("/&", "?");

    // return if redirectClientId is not set
    if (redirectClientId == "") return;

    var codeVerifier = generateRandomStringTdlSsoAuth(128);

    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
        var req_data = {
            "redirectClientId": redirectClientId, //"TARGET-BRAND-WEB-APP", for example, GINGER_WEB_APP or VIVANTA_WEB_APP
            "redirectUrl": redirectUrl, //Brand website url to redirect to
            "codeChallenge": codeChallenge
        }
        $.ajax({
            type: "POST",
            url: "/bin/redirectClientAuthCode",
            crossDomain: true,
            dataType: 'json',
            data: {
                accessToken: accessToken,
                req_data: JSON.stringify(req_data)
            }
        }).done(function(res) {

            var ssoResponse = JSON.parse(res);
            console.log("SsoRedirectClientAuthCode Response", ssoResponse);

            if (ssoResponse.authCode && codeVerifier) {
                if (redirectUrl.indexOf("?") == -1)
                    redirectUrl = redirectUrl + "?authCode=" + ssoResponse.authCode + "&codeVerifier=" + codeVerifier;
                else
                    redirectUrl = redirectUrl + "&authCode=" + ssoResponse.authCode + "&codeVerifier=" + codeVerifier;

                var bookingQueryParams = oldRedirectUrl.split("?")[1];
                // Remove authCode received from Tata Neu to IHCL
                var newBookingQueryParams = "";

                if (bookingQueryParams) {
                    newBookingQueryParams = bookingQueryParams.split("&authCode=")[0];

                    if (redirectUrl.indexOf(newBookingQueryParams) == -1) {
                        if (bookingQueryParams.indexOf("&") == 0)
                            redirectUrl = redirectUrl + newBookingQueryParams;
                        else
                            redirectUrl = redirectUrl + "&" + newBookingQueryParams;
                    }
                } else {
                    redirectUrl = redirectUrl + appendDefaultGingerQueryParams(redirectUrl);
                }
                window.location.href = redirectUrl;
                //window.location = redirectUrl;
                //window.location.assign(redirectUrl);
                //window.location.replace(redirectUrl);
            } else {
                window.location.href = redirectUrl;
            }

        }).fail(function(res) {
            console.log('login error:  ', res);
        });
    });

}

function appendDefaultGingerQueryParams(redirectUrl) {
    var appendGingerQueryParams = "";

    if (redirectUrl.indexOf("&source=") == -1 && redirectUrl.indexOf("?source=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&source=taj"

    if (redirectUrl.indexOf("&promoCode=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&promoCode="

    if (redirectUrl.indexOf("&from=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&from="

    if (redirectUrl.indexOf("&to=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&to="

    if (redirectUrl.indexOf("&rooms=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&rooms="

    if (redirectUrl.indexOf("&adults=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&adults="

    if (redirectUrl.indexOf("&children=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&children="

    if (redirectUrl.indexOf("&utm_source=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&utm_source=taj"

    if (redirectUrl.indexOf("&utm_medium=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&utm_medium=website"

    if (redirectUrl.indexOf("&pincode=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&pincode="

    if (redirectUrl.indexOf("&city=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&city="

    if (redirectUrl.indexOf("&lat=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&lat="

    if (redirectUrl.indexOf("&long=") == -1)
        appendGingerQueryParams = appendGingerQueryParams + "&long="

    return appendGingerQueryParams;
}

function removeUnwantedGingerQueryParams(redirectUrl, unwantedParams) {
    for (let i = 0; i < unwantedParams.length; i++) {
        redirectUrl = redirectUrl.replace(unwantedParams[i], "");
    }
    return redirectUrl;
}