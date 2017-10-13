//aaa

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
        loadTaskList("./Task/", tableBody);

    }


    //显示任务项列表
    function loadTaskList(folder, tableBody){
        $.get(folder, function(data) {
            //console.log(data);
            $(data).find("ul#files li a.icon-directory").each(function() {
                var title = $(this).attr("title");
                if (title == "..") {
                    return;
                }
                //console.log(title);
                $('table#jobGrid>tbody').append('<tr><td>'+title+'</td>/tr>');

            });

        });
    }








