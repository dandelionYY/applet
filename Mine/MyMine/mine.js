
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
        },
        startGameAgain:function (rows,cols,mines) {
            this.bulei(rows, cols, mines);
        },
        initiPanel: function(rows,cols){
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
            this.initiPanel(rows,cols);
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
        open:function (row, cell) {

            cell.isOpen = true;
            cell.isWord = true;
            this.findCells ++;
            
        },
        click:function (row,cell) {
            if(this.isGameOver) return;
            if(cell.text == "*"){
                cell.isBomb = true;
                alert(" ***** 爆炸 ***** ");
                this.isGameOver = true;
            }
            if(cell.isOpen == false){
                this.open(row,cell);
                if (this.findCells == this.rows * this.cols - this.mines){
                    alert("*****恭喜找到所有地雷*****");
                    this.isGameOver = true;
                }
            }
        },
    }
})


mineApp.start();