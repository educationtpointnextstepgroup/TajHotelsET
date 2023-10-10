$(document).ready(function() {
    //On page load functions only.
    try {
        $(".months-hotels-container").infiniteScrollLazyLoad(true);
    } catch (error) {
        console.error(error);
    }
});