

    var taskEvaluation = new Vue({
        el:'#taskEvaluation',
        data:{
            taskList:[]
            
        },
        methods:{
            loadFolder: function loadFolder() {
                loadTaskList("./taskFile/");
            }
        },
    });



    //1 显示任务项列表
    function loadTaskList(folder){
        $.get(folder, function(data) {
            $(data).find("ul#files li a.icon-directory").each(function() {
                var title = $(this).attr('title');
                if(title == ".."){
                    return;
                }
                var titleList = [];
                titleList = title;

                taskEvaluation.taskList = titleList;
                console.log(taskEvaluation.taskList);


            })






        });






    }








