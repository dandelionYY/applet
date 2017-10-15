
var taskApp = new Vue({
    el:'#taskEvaluation',
    data:{
        taskList:[]
    },
    methods:{
        seach:function loadFolder() {
            loadTaskList("./taskFile/");
        },

    },
});

function loadTaskList(folder){
    $.get(folder,function (data) {
        var titleList = [];
        $(data).find("ul#files li a.icon-directory").each(function () {
            var title = $(this).attr('title');
            if(title == ".."){
                return;
            }

            var task = {
                title:title,
                jobList:[]
            }
            titleList.push(task);
            taskApp.taskList = titleList;

            var fileUrl = folder + title + "/readme.md";
            $.get(fileUrl,function (data) {
                var start = data.indexOf("[BEGIN JOBS TABLE]");
                var stop = data.indexOf("[END JOBS TABLE]");
                var lines = data.slice(start, stop).split("\n");

                var fileTaskList = [];
                $.each(lines,function (index,value) {
                    var line = this.trim();
                    if(line.indexOf("[BEGIN JOBS TABLE]") >=0
                        ||line.length == 0 || line.indexOf("编号") >=0 || line.indexOf("|---") >=0
                        ||line.indexOf("[END JOBS TABLE]") >=0){
                        return;
                    }
                    var number = "";
                    var assigner = "";
                    var person = "";
                    var time = "";
                    var actualDate = "";
                    var planDate = "";
                    var delayDate = "";
                    var detailed ="";
                    $.each(line.split("|"),function (index,value) {
                        if(index == 0 || index == 9){
                            return;
                        }
                        switch (index) {
                            case 1:
                                number = this.trim();
                                break;
                            case 2:
                                assigner = this.trim();
                                break;
                            case 3:
                                person = this.trim();
                                break;
                            case 4:
                                time = parseFloat(this.trim());
                                break;
                            case 5:
                                actualDate = this.trim();
                                break;
                            case 6:
                                planDate = this.trim();
                                break;
                            case 7:
                                delayDate = this.trim();
                                break;
                            case 8:
                                detailed = this.trim();
                                break;
                        }
                    })
                    var status =getStatus(time, person, planDate, actualDate, delayDate);

                    var job = {
                        status:status,
                        number:number,
                        assigner:assigner,
                        person:person,
                        time:time,
                        actualDate:actualDate,
                        planDate:planDate,
                        delayDate:delayDate,
                        detailed:detailed
                    }
                    fileTaskList.push(job);
                })
                task.jobList = fileTaskList;

            })

        })
    })
}


//状态
function getStatus(time, person, planDate, actualDate, delayDate) {
    if(delayDate.trim() == "cancel"){
        return "撤销";
    }
    if(time <= 0){
        return "草稿";
    }else{
        if(person == "" || planDate == null) {
            return "待分配";
        }
        var today = new Date();
        if(actualDate){
            if(actualDate <= planDate){
                return "按时完成";
            }else{
                return "延迟完成";
            }
        }
        else {
            if(today <= planDate){
                return "进行中";
            }else{
                return "已延迟";
            }
        }
    }
    return "";
}


























