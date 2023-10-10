$(document).ready(function() {

    var showMoreSelection = $('#show-more-settings').data("selected");
    var charlimit = $('#show-more-settings').data("chars");
    if (showMoreSelection && showMoreSelection.localeCompare("required") == 0) {
        if (charlimit) {
            $('.richtext-font').cmToggleText(charlimit);
        } else {
            $('.richtext-font').cmToggleText(100);
        }
    }

})