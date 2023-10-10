function aboutUsSustainabilityCard() {
    $(document).ready(function() {
        $('.sustainability-card-wrap p').each(function() {
            $(this).cmToggleText({
                charLimit: 350
            })
        });
        if (deviceDetector.checkDevice() == "small") {
            $('.sustainability-card-wrap p').each(function() {
                $(this).cmToggleText({
                    charLimit: 200
                })
            });
        }
    });
}