function registerOtpComp(componentId) {
    $(document).ready(function() {
        var GEN_OTP_ERR = "An error occurred while validating OTP, please check the OTP and try again";
        var OTP_SIZE_ERR = "Please enter valid OTP";
        var component = $('#' + componentId);
        var successSection = $('[data-component-id="' + componentId + '-otp-success"]');
        var currentUsername;
        $('body').on('taj:otp-activate-init', function(e, username) {
            currentUsername = username;
            $(component).find('[data-form-id="online-otp-input"]').val("");
            $(successSection).hide();
        });
        $(component).find('[data-form-id="signup-otp-next"]').on('click', function(e) {
            e.stopPropagation();
            var otpInput = $(component).find('[data-form-id="online-otp-input"]');
            handleOtpInput(otpInput, currentUsername);
        });

        $(component).find('.tic-online-resend-otp').on('click', function(e) {
            e.stopPropagation();
            handleResendOtp(currentUsername);
        });

        function handleOtpInput(inputEl, email) {
            var otp = $(inputEl).val();

            if (otp.length > 3) {
                $(inputEl).removeClass('invalid-input');
                $(inputEl).siblings('.sub-form-input-warning').html('').hide();
                $('body').showLoader();
                $('body').trigger('taj:otp-activate-submit', [componentId, otp]);
                validateOtp(otp, email).done(function(res) {
                    if (res.status === "success") {
                        otpValidateSuccess();
                    } else {
                        warningBox({
                            description: GEN_OTP_ERR
                        });
                    }
                }).fail(function() {
                    warningBox({
                        description: GEN_OTP_ERR
                    });
                }).always(function() {
                    $('body').hideLoader();
                });
            } else {
                $(inputEl).addClass('invalid-input');
                $(inputEl).siblings('.sub-form-input-warning').html(OTP_SIZE_ERR).show();
            }
        }

        function handleResendOtp(email) {
            $('body').showLoader();
            sendOtp(email).done(function(res) {
                if (isIHCLCBSite()) {
                    validateResponseForSendingOtp(res);
                } else {
                    $(component).find('.account-online-otp-wrapper .resend-fail-message').hide();
                    $(component).find('.account-online-otp-wrapper .resend-success-message').show();
                }
            }).fail(function() {
                if (isIHCLCBSite()) {
                    $('[data-form-id="account-offline-details-error"]').text("There seems to be an error fetching your details, kindly try again later").show();
                } else {
                    $(component).find('.account-online-otp-wrapper .resend-success-message').hide();
                    $(component).find('.account-online-otp-wrapper .resend-fail-message').show();
                }
            }).always(function() {
                $('body').hideLoader();
            });
        }

        function validateResponseForSendingOtp(res) {
            if (res && res.status.toLowerCase() == "success") {
                openOTPInputScreenIHCLCB();
                $('[data-form-id="account-offline-details-error"]').text('').hide();
            } else {
                $('[data-form-id="account-offline-details-error"]').text(res.message).show();
            }
        }

        function otpValidateSuccess() {
            $(component).hide();
            $('.account-activate-heading').hide();
            $(successSection).find('[data-form-id="validate-otp-done"]').on("click", function() {
                window.location.reload();
            });
            $(successSection).show();
            $('body').trigger('taj:otp-activate-success', [componentId]);
        }
    });
}