String.prototype.startWith = function(str) {
    return this.indexOf(str) == 0;
};

var TimeJobs = function() {
    this.doingTime = 0;
    this.doingDelayTime = 0;
    this.doneTime = 0;
    this.doneDelayTime = 0;
    this.doingJobs = 0;
    this.doingDelayJobs = 0;
    this.doneJobs = 0;
    this.doneDelayJobs = 0;
};

var vueApp = new Vue({
    el: '#taskEvaluation',
    data: {
        condition: {
            personList: ["所有人"],
            selectTime: "计划时间",
            fromDate: "",
            toDate: "",
            selectRole: "责任人",
            statusList: ["草稿", "待分配", "进行中", "已延迟"]
        },
        taskList: [],
        allPersons: ["沈瀚", "李发健", "曾厚儒", "高智成", "李罗平", "常建杰",
            "黄锦洋", "马恒", "李桂滋", "姚仕", "冯燕萍",
            "吴浪", "梁高鹏", "周海丰", "林建鹏", "杜嘉林", "杨雅丽"
        ],
        allTimeJobs: new TimeJobs(),
        statistics: [], // 数组元素的类型是TimeJobs
    },
    methods: {
        isSelectStatus: function(status) {
            return $.inArray(status, this.condition.statusList) != -1;
        },
        search: function() {
            initStatistics();
            for (var index in this.taskList) {
                var task = this.taskList[index];
                task.number = 0;
                for (var jobIndex in task.jobList) {
                    var job = task.jobList[jobIndex];
                    jobFilter(job, this.condition);
                    if (job.show) {
                        task.number++;
                    }
                    addUp(job);
                }
            }
        },
        displayTimeJobs: function(time, jobs) {
            var s1 = time + "";
            var s2 = "(" + jobs + ")";
            if (time == 0) s1 = "";
            if (jobs == 0) s2 = "";
            return s1 + s2;
        }
    },
});

var jobFilter = function(job, condition) {
    if ($.inArray(job.status, condition.statusList) == -1) {
        job.show = false;
        return;
    }
    // 过滤人员条件
    if ($.inArray("所有人", condition.personList) == -1) {
        var person = job.person;
        if (condition.selectRole != "责任人") {
            person = job.assigner;
        }
        if ($.inArray(person, condition.personList) == -1) {
            job.show = false;
            return;
        }
    }
    // 过滤时间条件
    // var date = job.actualDate;
    // if (condition.selectTime != "完成时间") {
    //     date = job.planDate;
    // }
    // if (date != null && (date < condition.fromDate || date > condition.toDate)) {
    //     job.show = false;
    //     return;
    // }
    job.show = true;
};

var loadTaskList = function(folder) {
    $.get(folder, function(data) {
        var list = [];
        $(data).find("ul#files li a.icon-directory").each(function(index) {
            var title = $(this).attr("title");
            if (title == "..") {
                return;
            }
            var task = {
                title: title,
                taskFileUrl: folder + title + "/readme.md",
                jobList: [],
                show: 0
            };
            readJobFromTask(task);
            list.push(task);
        });
        vueApp.taskList = list;
    });
};

var readJobFromTask = function(task) {
    var fileUrl = "./Task/" + task.title + "/readme.md";
    $.get(fileUrl, function(data) {
        var start = data.indexOf("[BEGIN JOBS TABLE]");
        var stop = data.indexOf("[END JOBS TABLE]");
        var lines = data.substring(start, stop).split("\n");
        var jobList = [];
        $.each(lines, function() {
            var line = this.trim();
            if (line.length == 0 || line.startWith("//") ||
                line.indexOf("编号") >= 0 ||
                line.startWith("|---") ||
                line.startWith("[BEGIN JOBS TABLE]"))
                return true;

            jobList.push(readFieldFromJobLine(line));
        });
        task.jobList = jobList;
    });
};

var readFieldFromJobLine = function(line) {
    var job = { actualDate: null, planDate: null, show: true };

    $.each(line.split("|"), function(index) {
        if (index == 0 || index == 9) return true;

        if (this.startWith("!") || this.startWith("！")) job.important = true;
        //| 1 |杨无鬼|黄楷仁|8 |2017-7- | 2017-7- | - |分解子任务，Task-005.1-黄楷仁-缴费 | 
        switch (index) {
            case 2:
                job.assigner = this.trim();
                break;
            case 3:
                job.person = this.trim();
                break;
            case 4:
                var time = parseFloat(this.trim());
                job.time = isNaN(time) ? 0 : time;
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
                job.delayDate = this.trim();
                break;
            case 8:
                job.title = this.trim();
                break;
        }
    });
    setJobStatus(job);
    jobFilter(job, vueApp.condition);
    return job;
};

var setJobStatus = function(job) {
    if (job.time <= 0) {
        job.status = "草稿";
        job.statusClass = "draft";
        return;
    }
    if (job.delayDate.trim() == "cancel") {
        job.status = "撤销";
        job.statusClass = "cancel";
        return;
    }
    if (job.time > 0) {
        if (job.person == "" || job.planDate == null) {
            job.status = "待分配";
            job.statusClass = "todo";
            return;
        }
        var today = new Date();
        today.setHours(0, 0, 0);
        job.planDate.setHours(23, 59, 59); // 当前晚上12点。
        if (job.actualDate) {
            if (job.actualDate <= job.planDate) {
                job.status = "按时完成";
                job.statusClass = "doneInTime";
                return;
            } else {
                job.status = "延迟完成";
                job.statusClass = "doneDelay";
                return;
            }
        } else {
            if (today <= job.planDate) {
                job.status = "进行中";
                job.statusClass = "doing";
                return;
            } {
                job.status = "已延迟";
                job.statusClass = "delay";
                return;
            }
        }
    }
    job.status = " ? ";
    job.statusClass = "normal";
};

var initStatistics = function() {
    vueApp.allTimeJobs = new TimeJobs();
    for (var index in vueApp.allPersons) {
        vueApp.statistics[index] = new TimeJobs();
    }
};

var addUp = function(job) {
    var index = $.inArray(job.person, vueApp.allPersons)
    if (index == -1) return;

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
    if (!propertyJobs) return;

    vueApp.allTimeJobs[propertyJobs]++;
    vueApp.statistics[index][propertyJobs]++;

    vueApp.allTimeJobs[propertyTime] += job.time;
    vueApp.statistics[index][propertyTime] += job.time;
};

initStatistics();
loadTaskList("./Task/");