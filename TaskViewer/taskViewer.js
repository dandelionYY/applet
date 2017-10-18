
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

    },
    methods:{
        seach:function seachFolder() {
            for(var taskIndex in this.taskList){
                for(var jobIndex in this.taskList[taskIndex].jobList){
                    var job = this.taskList[taskIndex].jobList[jobIndex];
                    seachByCondition(job);
                }
            }
        }
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
                taskShow:true
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
                    job.time = this.trim();
                    break;
                case 5:
                    job.actualDate = this.trim();
                    formatDate(job.actualDate);
                    break;
                case 6:
                    job.planDate = this.trim();
                    formatDate(job.planDate);
                    break;
                case 7:
                    job.delayDate = this.trim();
                    formatDate(job.delayDate);
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
    if(job.delayDate.trim() == "cancel"){
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
            if(formatDate(today) <= job.planDate){
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

    return job.jobItemShow = true;
}

//日期格式化函数
function formatDate(dateStr){
    if (!dateStr) {
        return ''
    }
    var dateObj=new Date(dateStr);
    var year=dateObj.getFullYear();
    var month=dateObj.getMonth()+1<10 ? '0'+(dateObj.getMonth()+1) : dateObj.getMonth()+1;
    var date=dateObj.getDate()<10 ? '0'+dateObj.getDate() : dateObj.getDate();

    return year +'-'+ month +'-'+ date;
}

loadTaskList("./taskFile/");
