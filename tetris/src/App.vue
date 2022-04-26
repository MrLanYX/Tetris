<template>
    <div id="app">
        <div class="main">
            移动中
            <div v-for="(x,i) in gameData_move" :key="i">
                <div v-for="(y,j) in x" :key="j">{{y}}</div>
            </div>
        </div>
        <div class="main">
            固定显示
            <div v-for="(x,i) in gameData_fixed" :key="i">
                <div v-for="(y,j) in x" :key="j">{{y}}</div>
            </div>
        </div>
        <div class="main">
            画面显示结果
            <div v-for="(x,i) in gameData_result" :key="i">
                <div v-for="(y,j) in x" :key="j">{{y}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    // 配置游戏参数
    let h = 10;
    let w = 4;
    let setTime;

    export default {
        name: 'app',
        props: {},
        data() {
            return {
                // 移动区域游戏数据
                gameData_move: [],
                // 固定显示游戏数据
                gameData_fixed: [],
                // 最终合并显示区域游戏数据，gameData_move 和 gameData_fixed 的相加
                gameData_result: [],
                // 记录gameData_move的中心点，用于旋转算法
                gameData_move_center: [0, 0]
            }
        },
        mounted() {
            // 监听键盘操作
            document.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") this.left_fun()
                if (e.key === "ArrowRight") this.right_fun()
                if (e.key === "ArrowUp") this.spin_fun()
                if (e.key === "ArrowDown") this.moveDown_fun()
            })
        },
        created() {
            // 通过配置初始化数据
            this.initialize_gameData_fun(this.gameData_move)
            this.initialize_gameData_fun(this.gameData_fixed)
            this.initialize_gameData_fun(this.gameData_result)

            // 测试
            this.gameData_move[9][3] = this.gameData_move[8][3] = this.gameData_move[8][2] = this.gameData_move[7][2] = 1
            this.gameData_fixed[0][1] = this.gameData_fixed[0][2] = this.gameData_fixed[0][3] = this.gameData_fixed[1][2] = this.gameData_fixed[1][3] = 1
            // setTime = setInterval(() => {
            //     this.moveDown_fun()
            // }, 1000);
            // 测试 end
        },
        methods: {
            /**
             * 初始化全归零
             * 确保传入为空数组
             */
            initialize_gameData_fun(value = []) {
                for (const i of new Array(h)) {
                    let arr = new Array(w).fill(0)
                    value.push(arr)
                }
                return value
            },
            /**
             * 数据结果显示判断
             * 1. gameData_move & gameData_fixed 不能出现重合
             * 2. gameData_move 触底 传入 bottomOut=false 表示已经触底
             * 3. 判断使用新的 gameData_move，重合点上一位判断要用旧的快照
             */
            whereaboutsJudgment_fun(snapshoot = this.gameData_result, bottomOut = true) {
                let arr = this.initialize_gameData_fun();
                let flag = true // 重合标致
                let flag2 = true // 重合确定无误（平移重合不改这个值）
                // 预判结果
                for (const i in arr) {
                    if (Object.hasOwnProperty.call(arr, i)) {
                        for (const j in arr[i]) {
                            if (Object.hasOwnProperty.call(arr, j)) {
                                arr[i][j] = this.gameData_move[i][j] + this.gameData_fixed[i][j]
                                // 出现重合
                                if (arr[i][j] == 2) {
                                    if (snapshoot[i * 1 + 1][j] === 1) flag2 = false // 重合点上一位有gameData_move的值
                                    flag = false
                                }
                            }
                        }
                    }
                }

                if (flag === false && flag2 === false) { // 有重合 且结束一轮游戏
                    console.log("重合结束");
                    this.gameData_fixed = JSON.parse(JSON.stringify(this.gameData_result))
                    this.gameData_move = this.initialize_gameData_fun()
                } else if (flag === false && flag2 === true) { // 重合异常，不会阻断游戏，矫正移动数据
                    console.log("重合异常");
                    this.gameData_move = JSON.parse(JSON.stringify(snapshoot))
                } else if (flag === true && bottomOut === false) { // 没有重合但是触底了 使用 arr
                    console.log("触底结束");
                    this.gameData_fixed = JSON.parse(JSON.stringify(arr))
                    this.gameData_move = this.initialize_gameData_fun()
                } else if (flag === true && bottomOut === true) { // 没有重合也没有触底 使用正常的 arr
                    console.log("正常显示结果");
                    this.gameData_result = arr
                }
            },
            /**
             * 左移
             */
            left_fun() {
                // 未到头能移动
                if (this.gameData_move.find(n => n[0] === 1) === undefined) {
                    console.log("左移")
                    this.gameData_move.forEach(item => {
                        item.shift()
                        item.push(0)
                    })
                };
            },
            /**
             * 右移
             */
            right_fun() {
                // 未到头能移动
                if (this.gameData_move.find(n => n[w - 1] === 1) === undefined) {
                    console.log("右移")
                    this.gameData_move.forEach(item => {
                        item.pop()
                        item.unshift(0)
                    })
                };
            },
            /**
             * 旋转处理
             */
            spin_fun() {
                if (gameData_move_center[0] === 0 && gameData_move_center[1] === 0) return false; // 正方形方块没有旋转功能
                console.log("旋转")
                // 1. 按照中心点旋转附近的子
                // 2. 判断1是否能够填入
                // 3. 判断是否重合
            },
            /**
             * 改变中心点
             */
            change_center_fun(x = 0, y = 0) {
                this.gameData_move_center[0] += x
                this.gameData_move_center[1] += y
            },
            /**
             * 快速下移一格
             */
            moveDown_fun() {
                console.log("下移")
                this.gameData_move.shift()
                this.gameData_move.push(new Array(w).fill(0))
            }
        },
        watch: {
            gameData_move_copy: {
                handler(newValue, oldValue) {
                    // console.log(newValue, oldValue);
                    // console.log("gameData_move性能检测");
                    // 触底判断
                    if (newValue[0].find(n => n === 1)) {
                        this.whereaboutsJudgment_fun(oldValue, false)
                    } else {
                        this.whereaboutsJudgment_fun(oldValue)
                    }
                },
                deep: true
            },
            gameData_fixed() {
                console.log("有新的无法移动棋子加入");
                let i = this.gameData_fixed.findIndex(n => {
                    if (n.find(m => m == 0) === undefined) return true
                    return false
                })
                if (i != -1) {
                    this.gameData_fixed.splice(i, 1)
                    this.gameData_fixed.push(new Array(w).fill(0))
                    this.gameData_result = JSON.parse(JSON.stringify(this.gameData_fixed))
                }
            }
        },
        computed: {
            /**
             * 数组 gameData_move 无法监听获取旧值解决方案
             */
            gameData_move_copy() {
                return JSON.parse(JSON.stringify(this.gameData_move))
            }
        },
        filters: {},
        beforeDestroy() {}
    }
</script>

<style lang="scss">
    #app {
        display: flex;

        .main {
            display: flex;
            flex-direction: column-reverse;
            margin: 0 20px;

            >div {
                display: flex;
            }
        }
    }
</style>