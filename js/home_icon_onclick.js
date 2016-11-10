window.onload = function() {
    var current_path = window.location.pathname;
    if (current_path == "/") {
        var blocks = document.getElementsByClassName("home-block");
        blocks[0].style.cursor = "pointer";
        blocks[0].onclick = function() {
            window.location = "/coding/index.html";
        }
        blocks[1].style.cursor = "pointer";
        blocks[1].onclick = function() {
            window.location = "/photography/index.html";
        }
    }
    var menu_icon = document.getElementsByClassName("menu-icon")[0];
    var trigger = document.getElementsByClassName("trigger")[0];
    menu_icon.onclick = function() {
        trigger.style.display = trigger.style.display == "none" ? "block" : "none";
    }
}