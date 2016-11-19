window.onload = function() {

    var menu_icon = document.getElementsByClassName("menu-icon")[0];
    var trigger = document.getElementsByClassName("trigger")[0];
    menu_icon.onclick = function() {
        trigger.style.display = trigger.style.display == "none" ? "block" : "none";
    }
}
