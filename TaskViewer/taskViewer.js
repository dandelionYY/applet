
var TimeJobs = function() {
    this.doingTime = 0;
    this.doingDelayTime = 0;
    this.doneTime = 0;
    this.doneDelayTime = 0;
    this.doingJobs = 0;
    this.doingDelayJobs = 0;
    this.doneJobs = 0;
    this.doneDelayJobs = 0;
}

var taskApp = new Vue({
    el:'#taskEvaluation',
    data:{
        taskList:[],
        condition:{
            statusList:["草稿","待分配","进行中","已延迟"],
            personList:["所有人"],
            selectTime:[],
            fromDate:"",
            toDate:"",
            selectRole:[]
        },
        allPersons:[
            "沈瀚", "李发健", "曾厚儒", "高智成", "李罗平", "常建杰",
            "黄锦洋", "马恒", "李桂滋", "姚仕", "冯燕萍",
            "吴浪", "梁高鹏", "周海丰", "林建鹏", "杜嘉林", "杨雅丽"
        ],
        allTimeJobs: new TimeJobs(),
        statistics: [],
        statusClass:{
            "草稿": "draft" ,
            "待分配": "todo",
            "进行中": "doing" ,
            "按时完成": "doneInTime",
            "延迟完成": "doneDelay" ,
            "已延迟": "delay" ,
            "撤销": "cancel"
        }
    },
    methods:{
        seach:function seachFolder() {
            initiStatisticsData();
            for(var taskIndex in this.taskList){
                var task = this.taskList[taskIndex];
                task.taskNumber = 0;
                for(var jobIndex in this.taskList[taskIndex].jobList){
                    var job = this.taskList[taskIndex].jobList[jobIndex];
                    seachByCondition(job);
                    if(job.jobItemShow){
                        task.taskNumber++;
                    }
                    calculate(job);
                }
            }
        },
    },

});



//1 显示任务列表
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
                jobList:[],
                taskNumber:0
            }
            titleList.push(task);
            taskApp.taskList = titleList;

            var fileUrl = folder + title + "/readme.md";
            $.get(fileUrl,function (data) {
                var start = data.indexOf("[BEGIN JOBS TABLE]");
                var stop = data.indexOf("[END JOBS TABLE]");
                var lines = data.slice(start, stop).split("\n");
                task.jobList = loadTaskJobs(lines);
            })
        })
    })
}

//2 遍历文件夹下的所有任务项
function loadTaskJobs(lines) {
    var fileTaskList = [];
    $.each(lines,function (index,value) {
        var line = this.trim();
        if(line.indexOf("[BEGIN JOBS TABLE]") >=0
            ||line.length == 0 || line.indexOf("编号") >=0 || line.indexOf("|---") >=0
            ||line.indexOf("[END JOBS TABLE]") >=0){
            return;
        }

        var job = {};
        $.each(line.split("|"),function (index,value) {
            if(index == 0 || index == 9){
                return;
            }
            switch (index) {
                case 1:
                    job.number = this.trim();
                    break;
                case 2:
                    job.assigner = this.trim();
                    break;
                case 3:
                    job.person = this.trim();
                    break;
                case 4:
                    job.time = parseFloat(this.trim());
                    job.time = isNaN(job.time) ? 0 : job.time;
                    break;
                case 5:
                    if (this.trim().length != 0) {
                        job.actualDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 6:
                    if (this.trim().length != 0) {
                        job.planDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 7:
                    if (this.trim().length != 0) {
                        job.delayDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 8:
                    job.detailed = this.trim();
                    break;
            }
        })
        job.status = setStatus(job);
        job.jobItemShow = true;

        fileTaskList.push(job);
        seachByCondition(job);

    })
    return fileTaskList;
}

//3 状态信息
function setStatus(job) {
    if(job.delayDate == "cancel"){
        return "撤销";
    }
    if(job.time <= 0){
        return "草稿";
    }else{
        if(job.person == "" || job.planDate == null) {
            return "待分配";
        }
        var today = new Date();
        if(job.actualDate){
            if(job.actualDate <= job.planDate){
                return "按时完成";
            }else{
                return "延迟完成";
            }
        }
        else {
            if(today <= job.planDate){
                return "进行中";
            }else{
                return "已延迟";
            }
        }
    }
}

//4 根据条件筛选
function seachByCondition(job) {

    //4-1 状态筛选
    if($.inArray(job.status, taskApp.condition.statusList) == -1) {
        job.jobItemShow = false;
        return;
    }

    //4-2 人员筛选
    if ($.inArray("所有人", taskApp.condition.personList) == -1) {
        if(taskApp.condition.selectRole == "分派人"){
            if($.inArray(job.assigner,taskApp.condition.personList) == -1){
                job.jobItemShow = false;
                return;
            }
        }
        if(taskApp.condition.selectRole == "责任人"){
            if($.inArray(job.person,taskApp.condition.personList) == -1){
                job.jobItemShow = false;
                return;
            }
        }
    }

    //4-3 时间筛选
    if(taskApp.condition.selectTime == "计划完成时间"){
        if((job.planDate < taskApp.condition.fromDate || job.planDate > taskApp.condition.toDate) && job.actualDate != null ){
            job.jobItemShow = false;
            return;
        }
    }
    if(taskApp.condition.selectTime == "实际完成时间"){
        if((job.actualDate < taskApp.condition.fromDate || job.actualDate > taskApp.condition.toDate) && job.actualDate != null ){
            job.jobItemShow = false;
            return;
        }
    }

    job.jobItemShow = true;
}

//5 初始化统计数据
function initiStatisticsData(){
    taskApp.allTimeJobs = new TimeJobs();
    for (var personIndex in taskApp.allPersons) {
        taskApp.statistics[personIndex] = new TimeJobs();
    }
}

//6 计算
function calculate(job) {

    var index = $.inArray(job.person, taskApp.allPersons);
    if(index == -1){
        return;
    }

    var propertyTime;
    var propertyJobs;
    switch (job.status) {
        case "进行中":
            propertyTime = "doingTime";
            propertyJobs = "doingJobs";
            break;
        case "已延迟":
            propertyTime = "doingDelayTime";
            propertyJobs = "doingDelayJobs";
            break;
        case "按时完成":
            propertyTime = "doneTime";
            propertyJobs = "doneJobs";
            break;
        case "延迟完成":
            propertyTime = "doneDelayTime";
            propertyJobs = "doneDelayJobs";
            break;
    }
    if(!propertyJobs){
        return;
    }

    taskApp.allTimeJobs[propertyJobs]++;
    taskApp.statistics[index][propertyJobs]++;

    taskApp.allTimeJobs[propertyTime] += job.time;
    taskApp.statistics[index][propertyTime] += job.time;

}


initiStatisticsData();
loadTaskList("./taskFile/");
