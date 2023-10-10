//var FP_ID_MISS_ERR = "Please enter your registered Email id or your Membership id";
var FP_ID_MISS_ERR = "Please enter your registered Email id or your Membership id";
var FP_ID_MISS_ERR_IHCLCB = "Please enter your registered Email id";
var FP_GEN_ERR = "There seems be an error fetching your details, please try again";
var RP_TOKEN_MISS_ERR = "Please enter the dynamic token sent to your registered id";
var RP_GEN_ERR = "There seems be an error resetting your password please try again";
$(document).ready(
    function() {
        var entityLogin = typeof(isIHCLCBSite) == 'undefined' ? false : isIHCLCBSite();
        var signinPopup = $('#signin-popup');
        var forgotPasswordContainer = $(signinPopup).find('.member-forgot-password');
        var forgotPasswordInputWrapper = $(forgotPasswordContainer).find('.forgot-password-input-wrapper');
        var forgotPasswordConfirmEmailWrapper = $(forgotPasswordContainer).find(
            '.forgot-password-confirm-email-wrapper');
        var forgotPasswordTokenInputWrapper = $(forgotPasswordContainer).find(
            '.forgot-password-token-input-wrapper');
        var forgotPasswordConfirmationWrapper = $(forgotPasswordContainer).find(
            '.forgot-password-confirmation-wrapper');
        var currentEmailId;

        $('body').on('taj:forgot-password', function() {
            $('body').trigger('taj:reset-fp-form');
            forgotPasswordContainer.show();
            forgotPasswordInputWrapper.show();
        });

        $('body').on('taj:reset-fp-form', function() {
            forgotPasswordInputWrapper.hide();
            forgotPasswordTokenInputWrapper.hide();
            forgotPasswordConfirmationWrapper.hide();
            forgotPasswordConfirmEmailWrapper.hide();
        });

        $("#fp-pre-confirm-submit").on('click', function() {
            var registeredId = $('#fp-pre-confirm-input').val();
            if (entityLogin) {
                if (validateEmailInput(registeredId)) {
                    $('.forgot-password-confirm-email').click();
                } else {
                    showForgotPasswordWarning(FP_ID_MISS_ERR_IHCLCB);
                }
            } else {
                if (validateForgotPasswordInput(registeredId)) {
                    requestForgotPasswordToken(registeredId);
                } else {
                    showForgotPasswordWarning(FP_ID_MISS_ERR);
                }
            }
        });

        $(".forgot-password-confirm-email").on('click', function() {
            var registeredId = $('#fp-pre-confirm-input').val();
            sendDAC(registeredId);
        });

        $(".forgot-password-cancel-email").on('click', function() {
            $('.generic-signin-close-icon').trigger("click");
        });

        $(".forgot-password-back-email").on('click', function() {
            forgotPasswordConfirmEmailWrapper.hide();
            forgotPasswordInputWrapper.show();
        });

        $(".fp-back-token").on('click', function() {
            if (entityLogin) {
                forgotPasswordInputWrapper.show();
            } else {
                forgotPasswordConfirmEmailWrapper.show();
            }
            forgotPasswordTokenInputWrapper.hide();

        });
        forgotPasswordContainer.find("input").keyup(function() {
            $(".forgot-password-message").hide();
        });

        $("#fp-token-submit").on('click', function() {
            var token = $('#fp-token').val();
            if (token) {
                requestPasswordReset(token);
            } else {
                showResetPasswordError(RP_TOKEN_MISS_ERR);
            }
        });

        $("#fp-confirm-done").on("click", function(e) {
            e.stopPropagation();
            $('body').trigger('taj:reset-fp-form');
            forgotPasswordContainer.hide();
            signinPopup.hide();
            window.location.reload();
        });

        function validateForgotPasswordInput(fpInput) {
            var flag = false;
            if (fpInput && typeof fpInput == 'string') {
                var regex = /^[a-zA-Z\d-]+$/;
                flag = regex.test(fpInput);
            }

            return flag;
        }

        function showConfirmWrapper(email) {
            currentEmailId = email;
            $('body').trigger('taj:reset-fp-form');
            forgotPasswordConfirmEmailWrapper.show();
            var re = /([^@]+)@([^@]+)$/;
            var emailDivide = email.match(re);
            if (emailDivide[1].length > 3) {
                forgotPasswordConfirmEmailWrapper.find(".forgot-password-confirm-email-input").text(
                    emailDivide[1].slice(0, 2) + '*******' + emailDivide[1].slice(-2) + '@' + emailDivide[2]);
            } else {
                forgotPasswordConfirmEmailWrapper.find(".forgot-password-confirm-email-input").text(
                    emailDivide[1].slice(0, 1) + '*******' + emailDivide[1].slice(-1) + '@' + emailDivide[2]);
            }
        }

        // TODO: remove useless
        function requestTokenError(message) {
            console.log(message);
            console.log("Error while requesting token for forgot password");
            if (entityLogin) {
                showForgotPasswordWarning(message.message);
            }
        }

        function sendDAC(loginId) {
            showLoader();
            var dataInput = {
                username: loginId
            };
            $.ajax({
                type: 'GET',
                cache: false,
                url: '/bin/send-activation-code',
                data: dataInput,
                contentType: "application/json"
            }).done(function(res) {
                if (res && res.status && res.status.toUpperCase() == "SUCCESS") {
                    requestTokenSuccess();
                } else {
                    requestTokenError(res);
                }
            }).fail(function(response) {
                requestTokenError();
            }).always(function() {
                hideLoader();
            });
        }

        function requestForgotPasswordToken(loginId) {
            var isFetchEmailCalled = false;
            showLoader();
            $.ajax({
                type: "GET",
                cache: false,
                url: "/bin/password/request-token?login=" + loginId,
                contentType: "application/json"
            }).done(function(res) {
                if (res && res.status === "SUCCESS") {
                    var responseValue = res.responseValue;
                    var email = responseValue.email;
                    showConfirmWrapper(email);
                } else if (res && res.status === "FAILURE") {
                    isFetchEmailCalled = true;
                    fetchEmailId(loginId);
                    //                    var error = res.errorText;
                    //                    showForgotPasswordWarning(error);
                }
            }).fail(function(response) {
                showForgotPasswordWarning();
            }).always(function() {
                if (!isFetchEmailCalled) {
                    hideLoader();
                }
            });
        }

        function requestPasswordReset(token) {
            var registeredId = $('#fp-pre-confirm-input').val();
            var passwordResetInput = {
                login: registeredId,
                token: token
            };
            showLoader();
            $.ajax({
                type: "POST",
                cache: false,
                url: "/bin/password/reset",
                data: JSON.stringify(passwordResetInput),
                contentType: "application/json"
            }).done(function(res) {
                if (res && res.status === "SUCCESS") {
                    passwordResetSuccess();
                } else if (res && res.status === "FAILURE") {
                    var error = res.errorText;
                    showResetPasswordError(error);
                }
            }).fail(function() {
                passwordResetError();
            }).always(function() {
                hideLoader();
            });
        }

        function passwordResetSuccess() {
            $('body').trigger('taj:reset-fp-form');
            forgotPasswordConfirmationWrapper.show();
        }

        function showResetPasswordError(message) {
            var error = message || RP_GEN_ERR;
            var forgotPasswordMessage = $('.fp-token-error');
            forgotPasswordMessage.html(error);
            forgotPasswordMessage.show();
        }

        function requestTokenSuccess() {
            $('body').trigger('taj:reset-fp-form');
            forgotPasswordTokenInputWrapper.show();
        }

        function showLoader() {
            $('body').showLoader();
        }

        function hideLoader() {
            $('body').hideLoader();
        }
    });

function showForgotPasswordWarning(message) {
    var error = message || FP_GEN_ERR;
    var forgotPasswordMessage = $('.forgot-password-message');
    forgotPasswordMessage.html(error);
    forgotPasswordMessage.show();
}

$(document).ready(function() {
    var activateaccountpopup = $('#activateonlinepopup');
    var activateaccountContainer = $(activateaccountpopup).find('.member-account-activate');
    var activateaccountInputWrapper = $(activateaccountContainer).find('.account-activate-input-wrapper');
    var signinPopup = $(".generic-signin-popup");
    var signupPopup = $(".member-signup-wrapper");

    $(activateaccountpopup).hide();
    $('body').on('taj:account-activate', function(e, username) {
        $('body').trigger('taj:otp-activate-init', [username]);
        $(activateaccountpopup).show();
        activateaccountContainer.show();
        activateaccountInputWrapper.show();
        signupPopup.hide();
    });

    $(activateaccountpopup).find('#resend-submit').on('click', function(e) {
        e.stopPropagation();
        sendDynamicAccessCode();
    });

    $(activateaccountpopup).find('#acc-submit').on('click', function(e) {
        e.stopPropagation();
        validateDynamicAccessCode();
    });

    $(activateaccountpopup).find('.change-close-icon').on('click', function(e) {
        e.stopPropagation();
        $(activateaccountpopup).hide();
    });
});

var offlineSignUpDetails = {};
var registeredEmailId;
var ID_FETCH_ERR = "There seems to be an error fetching your details, kindly try again later";
var signinPopup;
var forgotPasswordContainer;
var genericMemberSignin;
var activateofflineaccountpopup;
var resendSuccess;
var activateofflineaccountContainer;
var activateofflineaccountInputWrapper;
var activateUserConfirmDetailsPopup;
var signupPopup;
var emailFetcherDiv;
var emailConfWrp;
$(document).ready(function() {
    signinPopup = $("#signin-popup");
    forgotPasswordContainer = $(signinPopup).find('.member-forgot-password');
    genericMemberSignin = signinPopup.find('.generic-member-signin');
    activateofflineaccountpopup = $('#activateofflinepopup');
    resendSuccess = $('.account-offline-otp-wrapper').find('.resend-success-message');
    activateofflineaccountContainer = activateofflineaccountpopup.find('.member-activate-offline');
    activateofflineaccountInputWrapper = activateofflineaccountContainer.find('.account-offline-input-wrapper');
    activateUserConfirmDetailsPopup = $('.validate-details-input-wrapper');
    signupPopup = $(".member-signup-wrapper");
    emailFetcherDiv = $('.email-fetcher');
    emailConfWrp = $('.fetch-email-wrapper');
    $('body').on('taj:account-activate-offline', function() {
        activateofflineaccountpopup.show();
        activateofflineaccountContainer.show();
        activateofflineaccountInputWrapper.show();
        resendSuccess.hide();
        emailFetcherDiv.hide();
        signupPopup.hide();
    });
    $('body').on('taj:otp-activate-submit', function(e, componentId, otp) {
        if (componentId === "act-offline-otp" && otp) { /*call reset password in background*/
            if (isIHCLCBSite()) {
                if (!registeredEmailId) {
                    registeredEmailId = $('#membershipNumber').val();
                }
            }
            var passwordResetInput = {
                login: registeredEmailId,
                token: otp
            };
            $.ajax({
                type: "POST",
                url: "/bin/password/reset",
                data: JSON.stringify(passwordResetInput),
                contentType: "application/json"
            }).done(function(res) {
                if (res && res.status === "FAILURE") { /*reset failure*/ }
            }).fail(function() { /*reset failure*/ })
        }
    });
    $('.sub-form-input-element#membershipNumber').keyup(function() {
        activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').hide();
    });
    $('[data-form-id="validate-user-gender"]').on("change",
        function() {
            $(this).removeClass('invalid-input');
        }); /* method to remove invalid input from a field if state has changed*/
    $('.validate-profile-submit-btn').on('click',
        function(e) { /* logic to reset inalid input class if input is provided*/
            if (validateProfileDetails()) {
                var profileForm = $('.profile-validate-form');
                offlineSignUpDetails.gender = profileForm.find('[data-form-id="validate-user-gender"]').val();
                createUser(autoInvokeActivateAccount);
            }
        });
    activateofflineaccountpopup.find('#tic-offline-membership-next').on('click',
        function(e) {
            if ($('.sub-form-input-element#membershipNumber').hasClass('invalid-input')) {
                $(this).focus();
            } else {
                var membershipId = $('#membershipNumber').val();
                if (membershipId.length) {
                    if (isIHCLCBSite()) {
                        if (validateEmailInput(membershipId)) {
                            $('body').trigger('taj:otp-activate-init', [membershipId]);
                            activateofflineaccountpopup.find('.tic-online-resend-otp').click();
                        } else {
                            console.log("========== Not an Email ============");
                        }
                    } else {
                        fetchEmailId(membershipId);
                    }
                }
            }
        });
    activateofflineaccountpopup.find('.change-close-icon').on('click',
        function(e) {
            e.stopPropagation();
            activateofflineaccountpopup.hide();
            signinPopup.hide();
        });
    activateofflineaccountpopup.find('#tic-offline-otp-next').on('click',
        function(e) {
            createUser();
        });
    var titleDropDown = $('.profile-validate-form').find('[data-form-id="validate-user-title"]');
    var genderDropDown = $('.profile-validate-form').find('[data-form-id="validate-user-gender"]');
    genderDropDown.prop('disabled',
        true);
    titleDropDown.selectBoxIt().change(function() {
        var titleVal = $(this).val();
        if (titleVal == 'Mr.') {
            genderDropDown.data("selectBox-selectBoxIt").remove().add({
                value: "M",
                text: "Male"
            });
        } else {
            genderDropDown.data("selectBox-selectBoxIt").remove().add({
                value: "F",
                text: "Female"
            });
        }
    });
});

function createUser(dataInput) {
    showLoader();
    $.ajax({
        type: 'POST',
        cache: false,
        url: '/bin/tic/create-syzygy-profile',
        data: dataInput,
        error: function(response) {
            activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').show();
        },
        success: function(response) {
            var responseJsonString = response.responseJSON;
            if (responseJsonString) {
                responseJson = JSON.parse(responseJsonString)
                if (responseJson.status == "SUCCESS") {
                    autoInvokeActivateAccount(responseJson.newAccount.membershipId);
                } else {
                    var errors = responseJson.errorTokenList;
                    var firstError = errors[0];
                    console.log(firstError);
                    warningBox({
                        description: firstError.message
                    });
                }
            }
        },
        complete: function() {}
    })
}

function fetchEmailId(membershipId) {
    var sendPasswordFlag = false;
    var dataInput = {
        membershipId: membershipId
    }
    $('#fp-pre-confirm-submit').attr("disabled", true);
    $('#fp-pre-confirm-submit').text("Please wait...");
    $('#fp-pre-confirm-submit').css({
        "opacity": 0.4
    });
    showLoader();
    $.ajax({
        type: 'GET',
        cache: false,
        url: '/bin/tic/get-member-email',
        data: dataInput,
        error: function(response) {
            activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').show();
            hideLoader();
        },
        success: function(response) {
            activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').hide();
            let responseData = response.data;
            if (responseData) {
                var emailAddress = responseData.emailAddress;
                verifySyzygyProfileExists(dataInput);
            } else {
                handleAccDetailsFailure(response.message);
                showForgotPasswordWarning(response.message);
            }
            hideLoader();
        },
        complete: function() {}
    });

    function verifySyzygyProfileExists(dataInput) {
        showLoader();
        $.ajax({
            type: 'GET',
            cache: false,
            url: '/bin/profile/validate-email',
            data: dataInput,
            error: function(response) {
                activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').show();
                hideLoader();
            },
            success: function(response) {
                if (response.message == 'SUCCESS') {
                    var duplicateProfileError = "Email id is already registered with another account. Please contact Taj InnerCircle Member Services";
                    handleAccDetailsFailure(duplicateProfileError);
                    showForgotPasswordWarning(duplicateProfileError);
                } else {
                    createUser(dataInput);
                }
                hideLoader();
            },
            complete: function() {}
        });

    }
}

function validateDetails(dataInput) {

    if (offlineSignUpDetails.membershipId != null && offlineSignUpDetails.title != null &&
        offlineSignUpDetails.firstName != null && offlineSignUpDetails.lastName != null &&
        offlineSignUpDetails.email != null && offlineSignUpDetails.loginId != null &&
        offlineSignUpDetails.password != null && offlineSignUpDetails.countryCode != null &&
        offlineSignUpDetails.mobile != null && offlineSignUpDetails.gender != null &&
        !offlineSignUpDetails.mobile.includes('+') &&
        ((offlineSignUpDetails.gender.localeCompare('F') == 0 || offlineSignUpDetails.gender.localeCompare('M') == 0) &&
            offlineSignUpDetails.gender.length == 1)) {
        return true;
    } else {
        if (offlineSignUpDetails.mobile.includes('+')) {
            offlineSignUpDetails.mobile = offlineSignUpDetails.mobile.replace('+', '');
            return true;
        }
    }
    return false;

}

function showValidateDetailsForm() {
    autoFillProfileValidateForm();
    $(forgotPasswordContainer).hide();
    activateUserConfirmDetailsPopup.removeClass('d-none');
    hideLoader();
}

function autoFillProfileValidateForm() { /* logic to auto populate form and disable the req fields*/
    injectValueToDropDownInput('validate-user-title',
        offlineSignUpDetails.title);
    injectValueToTextTypeInput('validate-user-firstname',
        offlineSignUpDetails.firstName);
    injectValueToTextTypeInput('validate-user-lastname',
        offlineSignUpDetails.lastName);
    injectValueToDropDownInput('validate-user-gender',
        offlineSignUpDetails.gender);
    injectValueToTextTypeInput('validate-user-email',
        offlineSignUpDetails.email);
    injectValueToTextTypeInput('validate-user-mobile',
        offlineSignUpDetails.mobile);
}

function validateProfileDetails() {
    var flag = true;
    $('.profile-validate-form').find('input.sub-form-mandatory,select.sub-form-mandatory').each(function() {
        if ($(this).val() == "" || $(this).hasClass('invalid-input')) {
            $(this).addClass('invalid-input');
            flag = false;
            invalidWarningMessage($(this));
        }
    });
    return flag;
}

function handleEmailSuccess(email) {
    $('.account-offline-input-wrapper').hide();
    var re = /([^@]+)@([^@]+)$/;
    var emailDivide = email.match(re);
    var maskedEmail;
    if (emailDivide[1].length > 3) {
        maskedEmail = emailDivide[1].slice(0,
            2) + '*******' + emailDivide[1].slice(-2) + '@' + emailDivide[2];
    } else {
        maskedEmail = emailDivide[1].slice(0,
            1) + '*******' + emailDivide[1].slice(-1) + '@' + emailDivide[2];
    }
    $('.fetch-emailid').text(maskedEmail);
    $('.fetch-email-wrapper').show();
    $(".account-offline-input-wrapper #membershipNumber").val("");
}

function handleAccDetailsFailure(message) {
    if (message) {
        activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').text(message);
    }
    activateofflineaccountpopup.find('[data-form-id="account-offline-details-error"]').show();
}

function autoInvokeActivateAccount(membershipId) {
    $(forgotPasswordContainer).hide();
    $(activateofflineaccountContainer).hide();
    invokeActivateAccount(membershipId);
}

function invokeActivateAccount(username) {
    genericMemberSignin.hide();
    activateUserConfirmDetailsPopup.addClass('d-none');
    $('body').trigger('taj:account-activate', [username]);
}

function injectValueToTextTypeInput(selector,
    value) {
    if (value != null && value != "") {
        $('[data-form-id="' + selector + '"]').val(value);
    }
}

function injectValueToDropDownInput(selector,
    value) {
    if (value != null && value != "") {
        var $selectBox = $('[data-form-id="' + selector + '"]');
        var $selectBoxRef = $selectBox.data("selectBoxIt");
        if ($selectBoxRef) {
            $selectBoxRef.selectOption(value);
        } else {
            $selectBox.find('option').removeAttr('selected');
            var selectedText = $selectBox.find('option[value="' + value + '"]').attr('selected',
                'selected').text();
            $selectBox.find('.selectboxit-text').text(selectedText);
        }
    }
}

function showLoader() {
    $('body').showLoader();
}

function hideLoader() {
    $('body').hideLoader();
}

$(document).ready(
    function() {
        // for open signin popup on unauthorized logout
        checkForSigninParameter();
        var GEN_SIGNIN_ERR = "There seems to be an error during your login. Please try again.";

        var signinPopup = $('#signin-popup');
        var genericSigninContentHolder = signinPopup.find('.generic-signin-content-holder');
        var genericMemberSignin = signinPopup.find('.generic-member-signin');
        var memberSignupWrapper = signinPopup.find('.member-signup-wrapper');
        var socialSignupWrapper = signinPopup.find('.social-signup-wrapper');
        var memberSignupConfirmationWrapper = signinPopup.find('.member-signup-confirmation-wrapper');
        var errorOverlay = signinPopup.find('.generic-signin-error-wrapper');
        var globalSignUpEmail;
        var preventPageScrollInitial;
        var incorrectLoginCount = 0;
        var verifyUserName;
        var verifyPassword;
        var generalSignInPassword;
        var maxFailAttempts;
        var recaptchaDom = $('#recaptcha');
        if (recaptchaDom) {
            var dataAttr = recaptchaDom.attr("data-noOfAttempts");
            if (dataAttr) {
                maxFailAttempts = parseInt(dataAttr);
            }
        }
        maxFailAttempts = isNaN(maxFailAttempts) ? 3 : maxFailAttempts;
        var forgotPasswordLinkWrp = signinPopup.find('.forgot-pass-wrp');
        var entityLogin = $('#corporate-booking-login').attr('data-corporate-isCorporateLogin') == "true";

        $('.generic-input-wrp input').blur(validateLogin);
        /*tdl sso changes start */
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
                /*if(window.location.href.indexOf("rooms-and-suites") != -1){*/
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
                        .html('<img src="/content/dam/tic/tataneu/logo/220216-NEUPASS-Identity-RGB-Positive.jpg" width="120" style="margn-bottom: 10px;">');
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.cm-success-box-heading-text')[0]).css('font-size', '18px');
                    $($($('.successBoxRemoveRef')[$('.successBoxRemoveRef').length - 1]).find('.signupanchor')[0]).attr("href", $('#sign-in-btn > .nav-link').attr('href').replace('login', ''));
                }

                function redirectToSignIn() {
                    window.location.href = $('#sign-in-btn > .nav-link').attr('href');
                }

                function reloadRoomPage() {
                    //window.location.reload();
                    $('.checkout-anchor').attr("href", "/en-in/booking-cart/");
                }
                /*}
                else{
                window.location.href = $('#sign-in-btn > .nav-link').attr('href');
                }*/
                $('.checkout-anchor').attr("href", $('#sign-in-btn > .nav-link').attr('href'));
            } else {
                document.location.reload();
            }

        });

        /*--tdl sso changes end */

        $('body').on('taj:reset-password', function() {
            resetSiginPopupToDefaultState();
        });

        $('body').on('taj:perform-login', function(e, username, password) {
            performLogin(username, password);
        });

        $('body').on('taj:invoke-fb-login', function() {
            performFbLogin();
        });

        $('body').on('taj:signup-flow', function() {
            showSignupForm();
            signinPopup.show();
        });

        $('body').on('taj:external-forgot-password', function() {
            signinPopup.show();
            genericMemberSignin.hide();
            $('body').trigger('taj:forgot-password');
        });
        $('body').on('taj:tier', function() {
            queryMemberUsingNumber();
        });

        function queryMemberUsingNumber() {

            var userData = getUserData();
            var formData = new FormData();
            formData.append("membershipId", userData.membershipId);
            $.ajax({
                type: 'POST',
                contentType: false,
                processData: false,
                cache: false,
                url: '/bin/tic/member-tier',
                data: formData

            }).done(function(res) {
                if (res.ErrorMsg) {
                    // unable to get Tier
                    console.log("not able to get the tier ::" + res.ErrorMsg)
                } else {
                    fetchMemberTier(res);

                }
            }).fail(function() {
                $('body').trigger('taj:loginFailed', [GEN_SIGNIN_ERR]);
            })

        }

        function fetchMemberTier(res) {
            var userDetails = dataCache.local.getData("userDetails");
            userDetails.tier = res.data.tier;
            if (userDetails && userDetails.card && userDetails.card.tier) {
                console.log('tier', userDetails.card.tier);
                userDetails.tier = userDetails.card.tier;
            }
            dataCache.local.setData("userDetails", userDetails);
        }
        signinPopup.find('.generic-member-signin-container, .generic-signin-close-icon, .generic-signin-done-btn, .fp-pre-confirm-cancel')
            .click(function(e) {
                e.stopPropagation();
                signinPopup.hide();
                resetSiginPopupToDefaultState();
                if (!preventPageScrollInitial) {
                    $(".cm-page-container").removeClass('prevent-page-scroll');
                    $('.the-page-carousel').css('-webkit-overflow-scrolling', 'touch');
                }
                // added for ihclcb
                if (entityLogin) {
                    signinPopup.addClass('ihclcb-remove-overlay').show();
                    genericMemberSignin.show();
                }
            });

        genericSigninContentHolder.on('click', function(e) {
            e.stopPropagation();
        });

        signinPopup.find('.forgot-password-button').on('click', function(e) {
            e.stopPropagation();
            if (!entityLogin) {
                genericMemberSignin.hide();
            } else {
                $('body').trigger('taj:sign-in');
            }
            $('body').trigger('taj:forgot-password');

            // added by sarath
            signinPopup.removeClass('ihclcb-remove-overlay');
        });

        signinPopup.find('[data-component-id="create-account"]').on('click', function(e) {
            e.stopPropagation();
            showSignupForm();
        });

        $('body').on(
            'taj:fetch-profile-details',
            function(event, loginButtonClicked) {
                var userData = getUserData();
                if (userData && userData.membershipId) {
                    var membershipId = userData.membershipId;
                    var authToken = userData.authToken;
                    var fetchDataRequestJson = {
                        "membershipId": membershipId,
                        "authToken": authToken
                    };
                    var profileDetailsDeferred = fetchLoyaltyMemberProfileDetails(fetchDataRequestJson,
                        loginButtonClicked);
                    var pointsDeferred = fetchMemberPoints(membershipId);
                    $.when(profileDetailsDeferred, pointsDeferred).done(function() {
                        $('body').trigger('taj:login-fetch-complete');
                    });
                }
            });

        var validateLogin = function() {
            $(".login-error").hide();
            $(".login-error span").text("");
            var flag = true;
            $('.generic-input-wrp input').each(function() {
                if ($(this).val().trim() == "") {
                    $(this).addClass('invalid-input');
                    var text = $(this).attr("placeholder");
                    flag ? text : text = $(".login-error span").text() + " and " + text;
                    $(".login-error span").text(text);
                    $(".login-error").show();
                    flag = false;
                }
            });
            return flag;
        }

        function showSignupForm() {
            genericMemberSignin.hide();
            memberSignupWrapper.show();
        }

        function resetSiginPopupToDefaultState() {
            genericMemberSignin.show();
            memberSignupWrapper.hide();
            memberSignupConfirmationWrapper.hide();
            genericSigninContentHolder.removeClass('signup-confirmation-content-holder');
            socialSignupWrapper.hide();
            $('body').trigger('taj:reset-fp-form');

            // added by aravind

            $(signinPopup).find(".account-offline-otp-wrapper").hide();
            $(signinPopup).find(".fetch-email-wrapper").hide();
            $(signinPopup).find(".member-activate-offline").hide();
            $(signinPopup).find(".generic-signin-error-wrapper").hide();
            $(signinPopup).find(".user-creation").hide();
            $(signinPopup).find(".member-signup-confirmation-wrapper").hide();
            $(signinPopup).find(".member-signup-wrapper").hide();
            $(signinPopup).find(".member-forgot-password").hide();
            $(signinPopup).find('.resend-success-message').hide();
            $(signinPopup).find(".member-activate-online").hide();
            $(signinPopup).find('.validate-details-input-wrapper').addClass('d-none');
            $(signinPopup).find(".account-offline-input-wrapper").show();
            // reset forgot password popup to initial state
            $('#fp-pre-confirm-submit').attr("disabled", false);
            $('#fp-pre-confirm-submit').text("Submit");
            $('#fp-pre-confirm-submit').css({
                "opacity": 1
            });
        }

        // - Google login -
        /*
         * loadGapi(attachSignin);
         * 
         * function attachSignin() { var element = document.getElementById('google-login');
         * auth2.attachClickHandler(element, {}, function(googleUser) { var userProfile =
         * googleUser.getBasicProfile(); // transform user data to common structure var userData =
         * mapUserData(userProfile.getEmail(), userProfile.getGivenName(), userProfile .getFamilyName(), null, null,
         * null, userProfile.getId()); socialLoginGoogle(userData); }, function(error) {
         * console.error(JSON.stringify(error, undefined, 2)); }); }
         */

        function socialLoginGoogle(userProfile) {
            showLoader();
            $.ajax({
                type: "POST",
                cache: false,
                url: "/bin/social-signin?googleId=" + userProfile.googleId,
                contentType: "application/json"
            }).done(function(res) {
                if (res.errorCode === "INVALID_LOGIN" && res.status === "404") {
                    // user does not exist, create user
                    showSocialSignupForm(userProfile);
                } else {
                    loginRespHandler(res, userProfile.loginId);
                }
            }).fail(function() {
                $('body').trigger('taj:loginFailed', [GEN_SIGNIN_ERR]);
            }).always(function() {
                hideLoader();
            });
        }
        // - Google login -

        // - Facebook login -
        $('#facebook-login').on(
            'click',
            function(e) {
                e.stopPropagation();
                performFbLogin(function(response) {
                    var userData = mapUserData(response.email, response.first_name, response.last_name, null,
                        null, response.id, null);
                    socialLoginFb(userData);
                });
            });

        // unotech fb login
        function socialLoginFb(userProfile) {
            showLoader();
            $.ajax({
                type: "POST",
                url: "/bin/social-signin?facebookId=" + userProfile.facebookId,
                contentType: "application/json"
            }).done(function(res) {
                if (res.errorCode === "INVALID_LOGIN" && res.status === "404") {
                    // user does not exist, create user
                    showSocialSignupForm(userProfile);
                } else {
                    loginRespHandler(res, userProfile.loginId);
                }
            }).fail(function() {
                $('body').trigger('taj:loginFailed', [GEN_SIGNIN_ERR]);
            }).always(function() {
                hideLoader();
            });
        }
        // - Facebook login -

        function mapUserData(email, firstName, lastName, mobile, gender, facebookId, googleId) {
            return {
                firstName: firstName,
                middleName: "",
                lastName: lastName,
                email: email,
                countryCode: "91",
                mobile: mobile,
                gender: gender,
                loginId: email,
                facebookId: facebookId,
                googleId: googleId
            };
        }

        function showSocialSignupForm(userData) {
            // show signup fields
            genericMemberSignin.hide();
            socialSignupWrapper.show();
            $('body').trigger('taj:social-signup', [userData]);
        }

        function loginSuccessHandler(accessToken, userInfo) {
            //  saveUserDetails(accessToken, userDetails);
            console.log("inside login successfull method");
            var name = userInfo.firstName;
            console.log("username " + name);
            /* $('.generic-signin-close-icon').trigger("click");
             resetSiginPopupToDefaultState();*/
            $('body').trigger('taj:loginSuccess', [name]);

            /*   if (id) {
                   $('body').trigger('taj:fetch-profile-details', [ true ]);
               } else {
                   $('body').trigger('taj:login-fetch-complete');
               } */
            if (!entityLogin) { // added by sarath
                $('body').trigger('taj:tier');
            } else {
                // fetchEntityDetails();
                redirectUser();
            }
        }

        signinPopup.find("[data-form-id='login-btn']").click(function(e) {
            e.stopPropagation();
            if (validateLogin()) {
                if (incorrectLoginCount >= maxFailAttempts) {
                    console.log("Incorrect Login Attempt No Exceeded : Invisible Google reCAPTCHA Enabled ");
                    grecaptcha.execute();
                } else {
                    getTdlSsoToken();
                    initiateLogin();
                }
            } else {
                $('.generic-input-wrp input.invalid-input').eq(0).focus();
            }
            e.preventDefault(); // avoid to execute the actual submit of the form.
        });

        window.onSuccessCallBackRecaptcha = function() {
            console.log("Invisible reCAPTCHA Passed");
            grecaptcha.reset();
            initiateLogin();
        }

        function initiateLogin() {
            var username = signinPopup.find('[data-form-id="login-id"]').val();
            var password = signinPopup.find('[data-form-id="login-pass"]').val();
            generalSignInPassword = password;
            performLogin(username, password);
        }

        function performLogin(username, password) {
            showLoader();
            if (entityLogin) {
                forgotPasswordLinkWrp.hide()
            }
            console.log('perform login::');
            // add data to datalayer
            trigger_signin('TIC_FormLogin_SignIn_HomePage_Login', {
                username: username
            });

            globalSignUpEmail = username;
            var loginDetails = {
                username: username,
                password: password
            };
            $.ajax({
                type: "POST",
                url: "/bin/signin",
                data: JSON.stringify(loginDetails),
                contentType: "application/json"
            }).done(function(res) {
                console.log('login success:  ', res);
                if (entityLogin) {
                    $('.ihclcb-login-error').hide();
                }
                loginRespHandler(res, username);
            }).fail(function(res) {
                console.log('login error:  ', res);
                if (res.status === 401) {
                    forceLogoutAfterUnauthorized();
                } else if (entityLogin) {
                    $('.ihclcb-login-error').text('Something went wrong!').show();
                } else {
                    $('body').trigger('taj:loginFailed', [GEN_SIGNIN_ERR]);
                }
            }).always(function() {
                console.log('always');
                hideLoader();
                if (entityLogin) {
                    forgotPasswordLinkWrp.show();
                }
            });
        }

        function loginRespHandler(res, username) {
            if (res.authToken) {
                var userDetails = res.userDetails;
                var authToken = res.authToken;
                incorrectLoginCount = 0;
                loginSuccessHandler(authToken, userDetails);
            } else if (res.errorCode === "INVALID_USER_STATUS" && res.status === "504") {
                // user activation flow
                if (entityLogin) {
                    $('.ihclcb-login-error').text(res.error).show();
                    invokeActivateAccountIHCLCB();
                } else {
                    invokeActivateAccount(username);
                }
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
                } else {
                    var error = res.error || GEN_SIGNIN_ERR;
                    $('body').trigger('taj:loginFailed', [error]);
                }
                verifyIncorrectAttempts(username);
            }
        }

        function verifyIncorrectAttempts(username) {
            if (!verifyPassword) {
                verifyPassword = generalSignInPassword;
            }
            if (!verifyUserName) {
                verifyUserName = username;
            }
            if (verifyUserName !== username) {
                verifyUserName = username;
                incorrectLoginCount = 0;
                if (verifyPassword !== generalSignInPassword) {
                    verifyPassword = generalSignInPassword;
                    incorrectLoginCount++;
                } else {
                    incorrectLoginCount++;
                }
            } else {
                if (verifyPassword !== generalSignInPassword) {
                    verifyPassword = generalSignInPassword;
                    incorrectLoginCount++;
                } else {
                    incorrectLoginCount++;
                }
            }
            console.log("Incorrect Login Attempt No ", incorrectLoginCount);
        }

        // this will store all user details to session
        function saveUserDetails(authToken, userDetails) {
            var user = {
                authToken: authToken,
                name: userDetails.name,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                gender: userDetails.gender,
                email: userDetails.email,
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
            ssoDetailsForDomains(entityLogin, authToken);
        }

        function saveMemberPointInfo(epicurePoints, ticPoints) {
            var userData = getUserData();
            userData.epicurePoints = epicurePoints;
            userData.ticPoints = ticPoints;
            dataCache.local.setData("userDetails", userData);
        }

        function showSignUpConfirmation(accountDetails) {
            memberSignupConfirmationWrapper.find(".first-name").text(accountDetails.firstName);
            memberSignupConfirmationWrapper.find(".last-name").text(accountDetails.lastName);
            memberSignupConfirmationWrapper.find(".TIC-ID-value").text(accountDetails.email);
            memberSignupConfirmationWrapper.show();
            genericSigninContentHolder.addClass('signup-confirmation-content-holder');
        }

        function showLoader() {
            $('.generic-login-btn').hide();
            $('.generic-login-loader').show();
        }

        function hideLoader() {
            $('.generic-login-loader').hide();
            $('.generic-login-btn').show();
        }

        $('body').on('taj:loginFailed', function(event, error, errorButtonText, errorButtonHandler) {
            signinErrorHandler(error, errorButtonText, errorButtonHandler);
        });

        function signinErrorHandler(error, buttonText, buttonHandler) {
            if (signinPopup.is(':visible')) {
                $(errorOverlay).find(".error-message").text(error);
                if (buttonText) {
                    $(errorOverlay).find(".error-cta").text(buttonText);
                }
                $(errorOverlay).find('.error-cta').on('click', function() {
                    if (buttonHandler) {
                        buttonHandler();
                    }
                    removeError();
                });
                $(errorOverlay).show();
            }
        }

        function removeError() {
            $(errorOverlay).hide();
        }

        function saveMemberPointInfo(epicurePoints, ticPoints, tapPoints, tappmePoints) {
            var userData = getUserData();
            userData.epicurePoints = epicurePoints;
            userData.ticPoints = ticPoints;
            userData.tapPoints = tapPoints;
            userData.tappmePoints = tappmePoints;
            setUserData(userData);
            $('body').trigger('taj:pointsUpdated');
        }

        function fetchLoyaltyMemberProfileDetails(fetchDataRequestJson, loginButtonClicked) {
            return $.ajax({
                type: 'POST',
                cache: false,
                url: '/bin/tic/account-details',
                data: fetchDataRequestJson,
                error: function(response) {
                    console.error(response);
                    if (response.status === 401) {
                        forceLogoutAfterUnauthorized();
                    }
                },
                success: function(response) {
                    if (response.data) {
                        var memberData = response.data;
                        var userData = getUserData();
                        userData.emailAddresses = memberData.emailAddresses;
                        userData.alternatePhoneNumbers = memberData.alternatePhoneNumbers;
                        userData.addresses = memberData.addresses;
                        userData.card = getCurrentCardDetails(memberData.loyaltyCards);
                        userData.dob = memberData.dob;
                        /*
                         * if (userData.card) { userData.tier = userData.card.tier; }
                         */
                        userData.cards = memberData.loyaltyCards;
                        userData.contactId = memberData.contactId;
                        setUserData(userData);
                        // [TIC-DATA-LAYER]
                        if (loginButtonClicked) {
                            prepareLoginJsonAfterSumbitClick('TICLogin', userData);
                        }
                        // Do Not Change
                        $('body').trigger('taj:profile-fetch-success');
                    }
                }
            });
        }

        function getCurrentCardDetails(cardList) {
            var sortedCardList = cardList.sort(function(a, b) {
                var startDateA = moment(a.startDate, "MM/DD/YYYY HH:mm:ss");
                var startDateB = moment(b.startDate, "MM/DD/YYYY HH:mm:ss");
                if (startDateA.isBefore(startDateB)) {
                    return 1;
                }
                if (startDateA.isAfter(startDateB)) {
                    return -1;
                }
                return 0;
            });
            return sortedCardList[0];
        }

        function invokeActivateAccount(username) {
            genericMemberSignin.hide();
            $('body').trigger('taj:account-activate', [username]);
        }

        function invokeActivateAccountIHCLCB(username) {
            openActivatePopupIHCLCB();
            openOTPInputScreenIHCLCB();
        }

        signinPopup.find('.activate-offline-account').on('click', function(e) {
            e.stopPropagation();
            genericMemberSignin.hide();
            $('body').trigger('taj:account-activate-offline');
        });

        //          IHCLCB Activate Account
        signinPopup.find('.ihclcb-activate-account').on('click', function(e) {
            e.stopPropagation();
            openActivatePopupIHCLCB();
        });
        //          IHCLCB Activate Account ends

        function openActivatePopupIHCLCB() {
            signinPopup.removeClass('ihclcb-remove-overlay');
            $('body').trigger('taj:account-activate-offline');
        }

        // Used in migrated user flow
        function invokeForgotPassword() {
            $('body').trigger('taj:external-forgot-password');
        }

        $('body').trigger('taj:fetch-profile-details');


        function redirectUser() {
            // [IHCL_CB] this can be changed to better code.
            window.location.href = $("[data-form-id='login-btn']").attr("data-login-success-url");
        }
    });

function validateEmailInput(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function openOTPInputScreenIHCLCB() {
    $('#activateofflinepopup .account-offline-otp-wrapper').show();
    $('#activateofflinepopup .account-offline-input-wrapper').hide();
}


function checkForSigninParameter() {
    var queryString = window.location.search;
    //var urlParams = new URLSearchParams(queryString);
    if (window.location.search.indexOf('popup') > -1) {
        console.log(queryString);
        refinedUrl = window.location.href.slice(0, window.location.href.indexOf("?popup"));
        signinPopup.show();
        window.history.replaceState({}, document.title, refinedUrl);
    }
}


function ssoDetailsForDomains(entityLogin, authToken) {
    if (!entityLogin) {
        if (authToken) {
            if ($.cookie) {
                $.cookie($(".single-sign-on-sevlet-param-name").text() || 'ihcl-sso-token', authToken, {
                    expires: $("single-sign-on-cookie-expires").text() || 7,
                    path: '/',
                    domain: location.hostname
                });
            } else {
                var expiresIn = $("single-sign-on-cookie-expires").text() || 7
                setIhclToken('ihcl-sso-token', authToken, expiresIn, location.hostname);
            }
        }
        var imgTagForCookieCalls = $('#single-sign-on');
        $(".sso-urls-to-set-cookie").each(
            function() {
                var indTagForCookieCall = '<img src="' +
                    $(this).text() +
                    $('.single-sign-on-sevlet-uri').text() +
                    '?' +
                    $(".single-sign-on-sevlet-param-name").text() +
                    '=' +
                    encodeURIComponent(authToken) +
                    '" style="display: none !important; width: 1px !important; height: 1px !important; opacity: 0 !important; pointer-events: none !important;"></img>';
                imgTagForCookieCalls.append(indTagForCookieCall);
            });
        $('#single-sign-on').html(imgTagForCookieCalls);
        //console.log('single-sign-on: saveUserDetails() and entityLogin: ' + !entityLogin);
    }
}


function setIhclToken(cname, cvalue, exdays, domain) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + ";domain=" + domain;
}