<template>
    <div id="app">
        <!-- <div class="main">
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
        </div> -->
        <div class="main">
            <div class="operate">
                <button @click="spin_fun()" style="border-radius: 50%;">旋转</button>
                <div>
                    <p>
                        <button @click="left_fun()">左移</button>
                        <button @click="right_fun()">右移</button>
                    </p>
                    <p>
                        <button @click="moveDown_fun()">下移</button>
                    </p>
                </div>
            </div>
            <div v-for="(x,i) in gameData_result" :key="i">
                <div :class="computer_diamondClass_fun(y,i,j)" v-for="(y,j) in x" :key="j" />
            </div>
            <button @click="game_allow=!game_allow">{{game_allow?'暂停':'开始'}}</button>
        </div>
        <!-- <div>{{gameData_move_center}}</div> -->
    </div>
</template>

<script>
    // 配置游戏参数
    let h = 20;
    let w = 10;
    let setTime;
    let gameData_config = [{
        label: '田',
        value: [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ]
    }, {
        label: 'L',
        value: [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ]
    }, {
        label: 'J',
        value: [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    }, {
        label: 'Z',
        value: [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0]
        ]
    }, {
        label: 'S',
        value: [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0]
        ]
    }, {
        label: 'l',
        value: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    }, {
        label: '山',
        value: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0]
        ]
    }]

    export default {
        name: 'app',
        props: {},
        data() {
            return {
                // 是否允许进行游戏
                game_allow: false,
                // 移动区域游戏数据
                gameData_move: [],
                // 固定显示游戏数据
                gameData_fixed: [],
                // 最终合并显示区域游戏数据，gameData_move 和 gameData_fixed 的相加
                gameData_result: [],
                // 记录gameData_move的中心点，用于旋转算法
                gameData_move_center: { h: -1, w: -1 },
                // 记录旧的用于矫正恢复
                gameData_move_center_old: { h: 0, w: 0 },
                // 触底定时器 用存在来判断是否能继续
                bottom_setTime: true,
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
            this.initialize_gameData_fun(this.gameData_move, 3)
            this.initialize_gameData_fun(this.gameData_fixed)
            this.initialize_gameData_fun(this.gameData_result)

            // 装填
            this.game_start_fun()

            // 永循环下落开始
            setTime = setInterval(() => {
                if (this.game_allow) this.moveDown_fun()
            }, 1000);
        },
        methods: {
            /**
             * 开始一轮游戏
             */
            game_start_fun() {
                // 初始化重置
                this.gameData_move = this.initialize_gameData_fun(undefined, 3)
                this.change_center_fun()
                // 随机选取方块
                let random = Math.floor(Math.random() * gameData_config.length)
                let obj = gameData_config[random]
                // 找到中心点
                this.gameData_move_center.h = h + 1
                this.gameData_move_center.w = Math.floor(w / 2)
                // 数组变换装填
                let x = this.gameData_move_center.h;
                let y = this.gameData_move_center.w;
                let arr = obj.value[0].concat(obj.value[1]).concat(obj.value[2])
                for (let i = x - 1; i <= x + 1; i++) {
                    for (let j = y - 1; j <= y + 1; j++) {
                        let num = arr.shift()
                        this.gameData_move[i][j] = num
                    }
                }
                // 开启游戏
                // this.game_allow = true
            },
            /**
             * 初始化全归零
             * 确保传入为空数组
             */
            initialize_gameData_fun(value = [], rise = 0) {
                for (const i of new Array(h + rise)) {
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
                    if (/1/.test(arr.slice(h - 1, h + 2))) {
                        // 结束游戏
                        this.game_allow = false
                        this.gameData_move = this.initialize_gameData_fun(undefined, 3)
                        this.change_center_fun()
                        alert('游戏结束，重新开始！！！')
                        location.reload()
                        return false
                    }
                    this.game_start_fun()
                } else if (flag === false && flag2 === true) { // 重合异常，不会阻断游戏，矫正移动数据
                    console.log("重合异常");
                    this.gameData_move = JSON.parse(JSON.stringify(snapshoot))
                    this.$nextTick(() => { // 直接写和前面的移动修改算成了一次watch倒致问题
                        this.gameData_move_center.h = this.gameData_move_center_old.h
                        this.gameData_move_center.w = this.gameData_move_center_old.w
                    })
                } else if (flag === true && bottomOut === false) { // 没有重合但是触底了 使用 arr
                    console.log("触底结束");
                    // 给个延迟 用户触底也能操作
                    this.bottom_setTime = false
                    setTimeout(() => {
                        this.gameData_fixed = JSON.parse(JSON.stringify(arr))
                        this.bottom_setTime = true
                        if (/1/.test(arr.slice(h - 1, h + 2))) {
                            // 结束游戏
                            this.game_allow = false
                            this.gameData_move = this.initialize_gameData_fun(undefined, 3)
                            this.change_center_fun()
                            alert('游戏结束，重新开始！！！')
                            location.reload()
                            return false
                        }
                        this.game_start_fun()
                    }, 500);
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
                if (this.gameData_move.find(n => n[0] === 1) === undefined && this.game_allow) {
                    console.log("左移")
                    this.change_center_fun(0, -1)
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
                if (this.gameData_move.find(n => n[w - 1] === 1) === undefined && this.game_allow) {
                    console.log("右移")
                    this.change_center_fun(0, 1)
                    this.gameData_move.forEach(item => {
                        item.pop()
                        item.unshift(0)
                    })
                };
            },
            /**
             * 快速下移一格
             */
            moveDown_fun() {
                if (!this.game_allow || !this.bottom_setTime) return false
                console.log("下移")
                this.change_center_fun(-1, 0)
                this.gameData_move.shift()
                this.gameData_move.push(new Array(w).fill(0))
            },
            /**
             * 顺时针旋转处理
             */
            spin_fun() {
                if (this.gameData_move_center.h === -1 && this.gameData_move_center.w === -1 && this.game_allow) return false; // 正方形方块没有旋转功能 且 不能进行游戏
                let x = this.gameData_move_center.h;
                let y = this.gameData_move_center.w;
                let arr = []
                let newArr = []
                let flag = true
                // 查找九宫格
                for (let i = x - 1; i <= x + 1; i++) {
                    for (let j = y - 1; j <= y + 1; j++) {
                        // 排除超出的九宫格 且找出 1
                        if (i > -1 && i < (h + 3) && j > -1 && j < w && this.gameData_move[i][j] === 1) {
                            let item = { h: i, w: j }
                            arr.push(item)
                            let newX = x - (item.w - y)
                            let newY = y - (x - item.h)
                            // 不能超出 且 旋转位置不能再固定盘有子
                            if (newX < 0 || newX >= (h + 3) || newY < 0 || newY >= w || (newX < h && this.gameData_fixed[newX][newY] === 1)) {
                                flag = false
                                return false
                            }
                            newArr.push({ h: newX, w: newY })
                        }
                    }
                }
                if (flag) {
                    // 允许旋转 执行旋转操作
                    console.log("旋转")
                    arr.forEach((item) => {
                        this.gameData_move[item.h][item.w] = 0
                    })
                    newArr.forEach((item) => {
                        this.gameData_move[item.h][item.w] = 1
                    })
                    this.gameData_move = JSON.parse(JSON.stringify(this.gameData_move)); // 不执行此步没法触发 computed
                }
            },
            /**
             * 改变中心点
             */
            change_center_fun(y = 0, x = 0) {
                if (y === 0 && x === 0) {
                    this.gameData_move_center.h = this.gameData_move_center.w = -1
                    return false
                }
                this.gameData_move_center.h += y;
                this.gameData_move_center.w += x;
            },
            /**
             * 计算返回的样式
             */
            computer_diamondClass_fun(value, i, j) {
                if (value === 1 && this.gameData_fixed[i][j] === 1) {
                    return 'diamond selected'
                } else if (value === 1 && this.gameData_fixed[i][j] === 0) {
                    return 'diamond move'
                } else {
                    return 'diamond'
                }
            }
        },
        watch: {
            gameData_move_copy: {
                handler(newValue, oldValue) {
                    console.log(123);
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
            },
            gameData_move_center_copy(newValue, oldValue) {
                // 记录上次中心点用于恢复
                this.gameData_move_center_old.w = oldValue.w
                this.gameData_move_center_old.h = oldValue.h
            },
        },
        computed: {
            /**
             * 数组 gameData_move 无法监听获取旧值解决方案
             */
            gameData_move_copy() {
                return JSON.parse(JSON.stringify(this.gameData_move))
            },
            /**
             * 数组 gameData_move_center 无法监听获取旧值解决方案
             */
            gameData_move_center_copy() {
                return JSON.parse(JSON.stringify(this.gameData_move_center))
            }
        },
        beforeDestroy() {
            clearInterval(setTime)
        }
    }
</script>

<style lang="scss">
    #app {

        .main {
            width: min-content;
            margin: 100px auto;
            display: flex;
            flex-direction: column-reverse;

            >div {
                display: flex;
            }

            .diamond {
                width: 30px;
                height: 30px;
                border: 1px solid #ccc;
            }

            .selected {
                background: #ccc;
            }

            .move {
                background: sandybrown;
            }

            .operate {
                display: flex;
                justify-content: space-between;

                p {
                    margin: 0;
                    text-align: center;
                }
            }
        }
    }
</style>