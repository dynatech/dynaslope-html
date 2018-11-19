
$(document).ready( function() {
    reposition("#loading");
});

function reposition(modal) {
    $(modal).on('show.bs.modal', repositionModal)
    $(window).on('resize', function() {
        $(modal + ':visible').each(repositionModal);
    });

}

function repositionModal() 
{
    var modal = $(this),
        dialog = modal.find('.modal-dialog');
    
    modal.css('display', 'block');
    
    // Dividing by two centers the modal exactly, but dividing by three 
    // or four works better for larger screens.
    dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
}