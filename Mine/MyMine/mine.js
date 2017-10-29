
var mineApp = new Vue({
    el:"#panel",
    data:{
        table:[],
        rows: 10,
        cols: 10,
        mines: 15,
        findCells:0,
        isGameOver: false
    },
    methods:{
        start: function(){
            this.bulei(this.rows, this.cols, this.mines);
            this.isGameOver = false;
        },
        initPanel: function(rows,cols){
            this.table = [];
            for( var row=0; row<rows+2; row++){
                this.table.push([]);
                for( var col=0; col<cols+2; col++){
                    var cell = {
                        text: "",
                        isShow:true,
                        isOpen:false,
                        isWord:false,
                        isBomb:false
                    };
                    this.table[row].push(cell);
                }
            }
        },
        bulei: function(rows, cols, mines){
            this.initPanel(rows,cols);
            var i=0, j=0, k=0;
            do
            {
                i = this.randomRange(1, rows);
                j = this.randomRange(1, cols);
                if (this.table[i][j].text == "*") continue;
                this.table[i][j].text = "*";
                k++;
            } while (k < mines);

            for (var i=0; i<rows+2; i++)
            {
                for (var j=0; j<cols+2; j++)
                {
                    if (this.table[i][j].text == "*") continue;
                    if (i==0 || j==0 || i==rows+1 || j==cols+1)
                    {
                        this.table[i][j].isShow = false;
                        this.table[i][j].text = "";
                        continue;
                    }
                    this.table[i][j].text = this.roundNumber(i, j);
                }
            }


        },
        randomRange: function (min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },
        roundNumber:function (row,col) {
            var n = 0;
            if (this.table[row-1][col-1].text == "*")   n+=1;
            if (this.table[row-1][col].text == "*")     n+=1;
            if (this.table[row-1][col+1].text == "*")   n+=1;
            if (this.table[row][col+1].text == "*")     n+=1;
            if (this.table[row+1][col+1].text == "*")   n+=1;
            if (this.table[row+1][col].text == "*")     n+=1;
            if (this.table[row+1][col-1].text == "*")   n+=1;
            if (this.table[row][col-1].text == "*")     n+=1;
            return n == 0 ? "" : n.toString();
        },
        open:function (row, col) {
            if ( row == 0 || row == this.rows+1 || col == 0 || col == this.cols+1 ){
                return;
            }
            this.table[row][col].isOpen = true;
            this.table[row][col].isWord = true;
            this.findCells ++;

            if(this.table[row][col].text == ""){
                if (this.table[row-1][col-1].isOpen == false)  this.open(row-1, col-1);
                if (this.table[row-1][col].isOpen == false)    this.open(row-1, col);
                if (this.table[row-1][col+1].isOpen == false)  this.open(row-1, col+1);
                if (this.table[row][col+1].isOpen == false)    this.open(row, col+1);
                if (this.table[row+1][col+1].isOpen == false)  this.open(row+1, col+1);
                if (this.table[row+1][col].isOpen == false)    this.open(row+1, col);
                if (this.table[row+1][col-1].isOpen == false)  this.open(row+1, col-1);
                if (this.table[row][col-1].isOpen == false)    this.open(row, col-1);
            }

        },
        click:function (row,col) {
            if(this.isGameOver) return;

            if(this.table[row][col].text == "*"){
                this.table[row][col].isBomb = true;
                alert(" ***** 爆炸 ***** ");
                this.isGameOver = true;
                return;
            }
            if(this.table[row][col].isOpen == false){
                this.open(row,col);
                if (this.findCells == this.rows * this.cols - this.mines){
                    alert("*****恭喜找到所有地雷*****");
                    this.isGameOver = true;
                    return;
                }
            }
        },
    }
})


mineApp.start();