
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


function loadTaskList(folder){
    $.get(folder, function(data) {
        var list = [];
        $(data).find("ul#files li a.icon-directory").each(function() {
            var title = $(this).attr('title');
            if(title == ".."){
                return;
            }

            var titleList = {
                title: title,
            }
            list.push(titleList);

            taskEvaluation.taskList = list;
            


        })

    });






}



















