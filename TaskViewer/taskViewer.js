

    var taskEvaluation = new Vue({
        el:'#taskEvaluation',
        data:{
            /*taskLists:[]*/
            
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
    var taskList = [];
    function loadTaskList(folder, tableBody){
        $.get(folder, function(data) {
            //console.log(data);
            /*taskEvaluation.taskLists = $(data).find("ul#files li a.icon-directory").attr("title");*/

            $(data).find("ul#files li a.icon-directory").each(function(index) {
                var title = $(this).attr("title");
                if (title == "..") {
                    return;
                }
                //tableBody.append('<tr><td>'+title+'</td>/tr>');

                var taskFileUrl = folder + title + "/readme.md";
                taskList.push(taskFileUrl);

                $.get(taskFileUrl, function(data) {
                    //console.log(data);
                    var titleRow = $("<tr class='title' data-url='" + taskFileUrl + "'></tr>").appendTo(tableBody);
                    titleRow.append("<td colspan='9'>" + title + " </td>");

                    var start = data.indexOf("[BEGIN JOBS TABLE]");
                    var stop = data.indexOf("[END JOBS TABLE]");
                    var lines = data.slice(start, stop).split("\n");

                    loadTaskJobs(titleRow,lines);
                });


            });

        });
    }

    //2 遍历文件夹下的所有任务项
    function loadTaskJobs(titleRow,lines){
        $.each(lines, function() {
            var line = this.trim();
            if(line.length == 0 || line.indexOf("编号") >=0 || line.indexOf("|---") >=0 ){
                return true;
            }

            var tableBody = $("table#jobGrid>tbody");
            var row = $("<tr class='data'></tr>").appendTo(tableBody);
            $.each(line.split("|"), function(index) {
                if(index == 9){
                    return true;
                }
                $("<td>" + this + "</td>").appendTo(row);

            });
        });



    }








