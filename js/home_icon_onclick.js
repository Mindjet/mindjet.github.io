window.onload = function() {
    // var current_path = window.location.pathname;
    // if (current_path == "/") {
    //     var blocks = document.getElementsByClassName("home-block");
    //     // blocks[0].onclick = function() {
    //     //     window.location = "/coding/index.html";
    //     // }
    //     // blocks[1].onclick = function() {
    //     //     window.location = "/photography/index.html";
    //     // }
    //     setListener(blocks[0], "/coding/index.html", false);
    //     setListener(blocks[1], "/photography/index.html", false);
    //     setListener(blocks[2], "/contact/index.html", false);

    // } else if (current_path == "/contact/index.html") {
    //     var locations = new Array("https://github.com/mindjet", "mailto:pearl920@outlook.com", "https://www.instagram.com/mindjet_android", "https://www.facebook.com/yingduo.zheng", "https://www.twitter.com/android_mindjet");
    //     var blocks = document.getElementsByClassName("home-block");
    //     for (var i = 0; i < 5; i++) {
    //         setListener(blocks[i], locations[i], true);
    //     }
    //     // blocks[0].onclick = function()
    // }
    var menu_icon = document.getElementsByClassName("menu-icon")[0];
    var trigger = document.getElementsByClassName("trigger")[0];
    menu_icon.onclick = function() {
        trigger.style.display = trigger.style.display == "none" ? "block" : "none";
    }
}

// function setListener(btn, url, new_window) {
//     if (new_window) {
//         btn.onclick = function() {
//             window.open(url);
//         }
//     }else{
//         btn.onclick = function(){
//             window.location = url;
//         }
//     }

// }