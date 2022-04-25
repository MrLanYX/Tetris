<template>
    <div id="app">
        <div class="main">
            <div v-for="(x,i) in gameData_result" :key="i">
                <div v-for="(y,j) in x" :key="j">{{y}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    // 配置游戏参数
    let h = 20
    let w = 10

    import diamond from '@/mixin/diamond'

    export default {
        name: 'app',
        props: {},
        mixins: [diamond],
        components: {

        },
        data() {
            return {
                // 移动区域游戏数据
                gameData_move: [],
                // 固定显示游戏数据
                gameData_fixed: [],
            }
        },
        mounted() {

        },
        created() {
            // 通过配置初始化数据
            this.initialize_gameData_fun(this.gameData_move)
            this.initialize_gameData_fun(this.gameData_fixed)
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
        },
        watch: {

        },
        computed: {
            // 最终合并显示区域游戏数据
            // gameData_move 和 gameData_fixed 的相加
            gameData_result() {
                let arr = this.initialize_gameData_fun()
                console.log("gameData_result 计算生成一次");
                for (const i in arr) {
                    if (Object.hasOwnProperty.call(arr, i)) {
                        for (const j in arr[i]) {
                            if (Object.hasOwnProperty.call(arr, i)) {
                                arr[i][j] = this.gameData_move[i][j] + this.gameData_fixed[i][j]
                            }
                        }
                    }
                }
                return arr
            },
        },
        filters: {

        },
        beforeDestroy() {

        }
    }
</script>

<style lang="scss">
    #app {
        .main {
            display: flex;
            flex-direction: column-reverse;

            >div {
                display: flex;
            }
        }
    }
</style>