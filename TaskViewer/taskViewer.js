

    var taskEvaluation = new Vue({
        el:'#taskEvaluation',
        data:{
            taskLists:[]
            
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

            taskEvaluation.taskLists = $(data).find("ul#files li a.icon-directory");
            //console.log(taskEvaluation.taskLists[1]);
            




        });






    }








