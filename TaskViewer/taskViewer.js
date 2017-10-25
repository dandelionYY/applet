
var taskApp = new Vue({
    el:"#taskApp",
    data:{
        taskList:[],
        condition:{
            personList:["所有人"],
            selectDate:[],
            startDate:null,
            endDate:null,
            selectPerson:[],
            statusList:["草稿","待分配","进行中","已延迟"]
        },
        allTimeJobs: new TimeJobs(),
        statistics:[],
        allPerson:[
            "沈瀚", "李发健", "曾厚儒", "高智成", "李罗平", "常建杰",
            "黄锦洋", "马恒", "李桂滋", "姚仕", "冯燕萍",
            "吴浪", "梁高鹏", "周海丰", "林建鹏", "杜嘉林", "杨雅丽"
        ],
        statusClass:{
            "草稿":"draft",
            "待分配":"todo",
            "进行中":"doing",
            "已延迟":"delay",
            "按时完成":"done",
            "延迟完成":"doneDelay",
            "撤销":"cancel"
        },
        IsImportant:false,
    },
    methods:{
        filter:filters,
        displayTimeJobs:displayTimeJobs,
        showdown:showdowns,
        IsSelectStatus:IsSelectStatus,
        IsSelectPerson:IsSelectPerson
    }
})


function filters() {
    InitiAddUpData();
    for(var taskIndex in taskApp.taskList){
        var task = taskApp.taskList[taskIndex];
        task.number = 0;
        for(var jobIndex in task.jobList){
            var job = task.jobList[jobIndex];
            filterByCondition(job);
            if(job.show){
                task.number++;
            }
        }
    }
}

function displayTimeJobs(time,job) {
    var s1 = time == 0 ? "" : time;
    var s2 = job == 0 ? "" : "(" + job + ")";
    var s = s1 + s2;
    return s;
}

function IsSelectStatus(status) {
    return $.inArray(status,this.condition.statusList) != -1;
}

function IsSelectPerson(person) {
    return $.inArray(person,this.condition.personList) != -1;
}

function loadTaskList(folder) {
    $.get(folder,function (data) {
        var titleList = [];
        $(data).find("ul#files li a.icon-directory").each(function () {
            var title = $(this).attr("title");
            if(title == "..") return;

            var task = {
                title:title,
                jobList:[],
                number:0
            }
            titleList.push(task);
            taskApp.taskList = titleList;

            var fileUrl = folder + "/" + title + "/readme.md";
            $.get(fileUrl,function (data) {
				var start = data.indexOf("[BEGIN JOBS TABLE]");
                var end = data.indexOf("[END JOBS TABLE]");
                var rows = data.substring(start,end).split("\n");
                task.jobList =  readJobList(rows);
            })

        })
    })
}

function readJobList(rows) {
    var jobList = [];
    $.each(rows,function () {
        var row = this.trim();
		if(row.indexOf("[BEGIN JOBS TABLE]") >= 0
            || row.length == 0
            || row.indexOf("|编号") >= 0
            || row.indexOf("|---") >= 0 ){
            return;
        }

        var job = {};
        $.each(row.split("|"),function (index) {
            if(index == 0 || index == 9) return;
            switch(index){
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
                    job.time = parseInt(this.trim());
                    job.time = isNaN(job.time) ? 0 : job.time;
                    break;
                case 5:
                    if(this.trim().length != 0){
                        job.actualDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 6:
                    if(this.trim().length != 0){
                        job.planDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 7:
                    if(this.trim().length != 0){
                        job.delayDate = new Date(this.trim().replace(/-/g, "/"));
                    }
                    break;
                case 8:
                    job.detailed = this.trim();
                    break;
            }
        })//each row

        job.status = setStatus(job);
        jobList.push(job);
        job.show = true;

        if (job.detailed.indexOf("!") >= 0 || job.detailed.indexOf("！") >= 0 ){
            job.IsImportant = true;
        }
        
        filterByCondition(job);

    })//each rows
    return jobList;
}

function setStatus(job) {
    if(job.delayDate == "cancel") return "撤销";
    if(job.time <= 0){
        return "草稿";
    }else {
        if(job.person == "" || job.planDate == null) return "待分配";
        var today = new Date();
        if(job.actualDate){
            if(job.actualDate <= job.planDate) return "按时完成";
            else return "延迟完成";
        }else {
            if(today <= job.planDate) return "进行中";
            else return "已延迟";
        }
    }
}

function filterByCondition(job) {
    if($.inArray("所有人",taskApp.condition.personList) == -1){
        if(taskApp.condition.selectPerson == "责任人"){
            if($.inArray(job.person,taskApp.condition.personList) == -1){
                job.show = false;
                return;
            }
        }
        if(taskApp.condition.selectPerson == "分派人"){
            if($.inArray(job.assigner,taskApp.condition.personList) == -1){
                job.show = false;
                return;
            }
        }
    }
    
    if($.inArray(job.status,taskApp.condition.statusList) == -1){
        job.show = false;
        return;
    }
    
    if(taskApp.condition.selectDate == "实际完成时间"){
        var startDate = new Date(taskApp.condition.startDate);
        var endDate = new Date(taskApp.condition.endDate);
        if(job.actualDate != null &&(job.actualDate < startDate || job.actualDate > endDate)){
            job.show = false;
            return;
        }
    }
    if(taskApp.condition.selectDate == "计划完成时间"){
        if(job.planDate != null && (job.planDate < startDate || job.planDate > endDate)){
            job.show = false;
            return;
        }
    }

    job.show = true;
    addUp(job);
}

function addUp(job) {

    index = $.inArray(job.person,taskApp.allPerson);
    if(index == -1){
        return;
    }

    var attrTime;
    var attrJobs;
    switch (job.status){
        case "进行中":
            attrTime = "doingTime";
            attrJobs = "doingJobs";
            break;
        case "已延迟":
            attrTime = "doingDelayTime";
            attrJobs = "doingDelayJobs";
            break;
        case "按时完成":
            attrTime = "doneTime";
            attrJobs = "doneJobs";
            break;
        case "延迟完成":
            attrTime = "doneDelayTime";
            attrJobs = "doneDelayJobs";
            break;
    }

    if(!attrJobs) return;
    taskApp.allTimeJobs[attrJobs]++;
    taskApp.statistics[index][attrJobs]++;


    if (job.detailed.indexOf("[TEST]") >= 0  ){
        return;
    }
    taskApp.allTimeJobs[attrTime] += job.time;
    taskApp.statistics[index][attrTime] += job.time;
}

function InitiAddUpData() {
    taskApp.allTimeJobs = new TimeJobs();
    for(var personIndex in taskApp.allPerson){
        var person = taskApp.allPerson[personIndex];
        taskApp.statistics[personIndex] = new TimeJobs();
    }
}

function TimeJobs() {
    this.doingTime = 0;
    this.doingJobs = 0;
    this.doingDelayTime = 0;
    this.doingDelayJobs = 0;
    this.doneTime = 0;
    this.doneJobs = 0;
    this.doneDelayTime = 0;
    this.doneDelayJobs = 0;
}


function showdowns() {
    var taskItem = $("#taskTable tbody tr").attr("data-url");
    var converter = new showdown.Converter();
    $.get(taskItem, function(data) {
        html = converter.makeHtml(data);
        alert(html);
        new jBox('Modal', {
            width: 1000,
            height:700,
            title: '任务说明文档',
            content: html,
            showClose:true,
            buttons:{'关闭':true}
        }).open();

    })
}


InitiAddUpData();
loadTaskList("./Task");
loadTaskList("./TaskDone");
