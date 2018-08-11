<template>
    <section class="real-app">
        <input
            type="text"
            class="add-input"
            autofocus="autofocus"
            placeholder="接下去要做什么?"
            @keyup.enter="addTodo"
        >
        <Item
            :todo="todo"
            v-for="todo in filteredTodos"
            :key="todo.id"
            @del="deleteTodo"
        />
        <Tabs
            :filter="filter"
            :todos="todos"
            @toggle="toggleFilter"
            @clearAllCompleted="clearAllCompleted"
        />
    </section>
</template>

<script>

    import Item from "./item.vue";
    import Tabs from "./tabs.vue";

    let id = 0;

    export default {
        //声明数据
        data() {
            return {
                todos: [],
                filter: 'all'
            }
        },
        //组件
        components: {Tabs, Item},
        //计算
        computed:{
            filteredTodos(){
                if (this.filter ==='all' ){
                    return this.todos
                }
                const completed = this.filter === 'completed';
                // 将todos数组中，completed为true的值过滤出来，并返回一个新数组
                return this.todos.filter(todo => completed === todo.completed)

            }
        },
        //方法
        methods: {
            addTodo(e) {
                if(e.target.value.trim()){
                    this.todos.unshift({
                        id: id++,
                        content: e.target.value.trim(),
                        completed: false,
                    });
                    e.target.value = '';
                }else{
                    alert("输入空格你是要上天?")
                }
            },
            deleteTodo(id) {
                this.todos.splice(this.todos.findIndex(todo => todo.id === id), 1)
            },
            toggleFilter(state) {
                this.filter = state
            },
            clearAllCompleted(){
                //我们做删除的时候如果按照角标删除会导致之前的顺序出问题,使之前面的方法失效
                //所以我们这里用条件删除,给todos数组重新赋值
                this.todos = this.todos.filter(todo => !todo.completed)
            }
        }
    }
</script>

<style lang="stylus" scoped>
    .real-app {
        width 600px
        margin 0 auto
        box-shadow 0 0 5px #666
    }

    .add-input {
        position: relative;
        margin: 0;
        width: 100%;
        font-size: 24px;
        font-family: inherit;
        font-weight: inherit;
        line-height: 1.4em;
        border: 0;
        outline: none;
        color: inherit;
        box-sizing: border-box;
        font-smoothing: antialiased;
        padding: 16px 16px 16px 36px;
        border: none;
        box-shadow: inset 0 -2px 1px rgba(0, 0, 0, 0.03);
    }
</style>
