    var tableBody = $("table#jobGrid>tbody");
   
    var taskEvaluation = new Vue({
        el:'#taskEvaluation',
        data:{

        },
        methods:{
            loadFolder: loadFolder,
        },
    });


    function loadFolder() {
        var tableBody = $("table#jobGrid>tbody");
        loadTaskList("./Task/", tableBody);

    }


    //1 显示任务项列表
    function loadTaskList(folder, tableBody){
        $.get(folder, function(data) {
            $(data).find("ul#files li a.icon-directory").each(function() {
                var title = $(this).attr("title");
                if (title == "..") {
                    return;
                }
                $('table#jobGrid>tbody').append('<tr><td>'+title+'</td>/tr>');


                //2 遍历文件夹下的所有任务项
                var taskFileUrl = folder + title + "/readme.md";


            });

        });
    }








