#vser (mvvm server side render)

    1. 可以兼容到ie7的前端mvvm框架；

    2. 可以使用后端模板语法编写服务端模板，构建时自动生成服务端渲染模板文件，通过服务端模板引擎进行渲染，性能更高；

#一、环境搭建

    1. 下载node.js 网址：http://nodejs.cn/ 
    
    2. 指向淘宝镜像 运行命令 npm install -g cnpm --registry=https://registry.npm.taobao.org

    3. 下载项目代码 git地址：http://192.168.6.10:3000/caojianyu/front-end-comp-proj

    4. 建议安装vscode开发工具 网址：https://code.visualstudio.com/


#二、打开工程，运行项目

    1. 安装依赖包 
        cnpm install 或 npm install

    2. 开启本地调试 
        npm run dev

    3. 脚本打包
        npm run build


#三、注意事项

    1. 由于此项目主要针对c端，力求减小代码尺寸，避免引入过多的polyfill兼容代码，建议大家可以使用es6的语法，但是尽量不要使用ES6新的API方法。

        比如let 、 const 、class、 箭头函数等语法可以使用，而 Object.assign、Array.from、Promise、Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol等新的API最好不要使用。

    2. js数组遍历不能用 for in

#四、使用说明

        组件生命周期方法为：

            beforeMounted(){},  组件挂载前，组件html尚未挂载到页面上，可以执行一些组件初始化的准备工作。

            mounted(){},        组件已挂载，组件html已经挂载到页面上，可以执行一些事件绑定和数据请求等操作。

            beforeUpdated(){},  组件参数发生改变，更新渲染前

            updated(){},         组件更新渲染后

            beforeDestroyed(){},组件销毁前，可以执行一些组件销毁前的操作，比如移除事件，关闭定时器等。

            destroyed(){}       组件已销毁，可以执行一些组件销毁后的逻辑操作。

        对于使用vser-router的单页应用，还具有如下方法：

            routerUpdate(param)  路由参数更新；

            routerLeave(nextRoute, route) 路由离开；
            
            routerRecover(route, prevRoute) 路由从缓存恢复；


#五、组件通信

    1. 子组件发  ->   父组件收
        子组件：
        this.$emit(name,value0,value1,....valueN)
        
        父组件：
        <xxx @on:name="callback"></xxx>
        <xxx v-on:name="callback"></xxx>

#六、模板语法

    vser和vue不同，vue所有data数据和props数据都是挂载到组件根实例上；

    vser的data数据挂载在this.data上，props数据挂载在this.props上，这样代码维护者会清晰的明白数据的来源;

    vser采用和vue一样的模板语法，如：

    1. 条件语句：

        v-if="xxx"

        v-else-if="xxx"

        v-else

    2. 循环语句：

        v-for="(item,index) in xxx"
        
        v-for="item in xxx"


    3. 数据绑定：

        v-html="xxx"

        {{xxx}}

        v-bind:xxx="xxx"

        :xxx="xxx"

    4. 事件监听：（可监听dom事件，和子组件自定义消息）

        v-on:xxx="xxx"

        @xxx="xxx"

    5. 样式绑定：（不支持vue的数组模式）
        
        :class="{'xxx': true}"

        :style="{'color':'#f00'}"


#七、数据更新

    this.set(target[,key][,value])

    * target: <object> | <*>   需要更新的参数对象{key:value,key1:value1} 或 更新的目标数据
    * key: <string> | <number> 参数的key，或数组的索引
    * value: <*>  参数的值

    如：
    this.set({
        x:1,
        y:2
    });

    this.set(this.data,'x',1)
    this.set(this.data,'y',2)

    结果：
    this.data.x = 1
    this.data.y = 2



#未完事项
   

    1. 目前不支持数据双向绑定