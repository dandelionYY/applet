var loadFolder = function(folder) {

    $.get(folder, function(data) {
        var list = [];

        $(data).find("ul#files li a.icon-directory").each(function(index) {
            var title = $(this).attr("title");
            if (title == "..") {
                return;
            }
            var task = {
                title: title
            };
            list.push(task);
        });
    }); // break point
};

loadFolder("./Task");