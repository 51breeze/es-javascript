import Class from "./../core/Class.js";
import Router from "./Router.js";
import Vue from "vue";
/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */




Vue.use( Router );
var Viewport = Vue.component('RouterView');
Class.creator(9,Viewport,{
	'id':1,
	'global':true,
	'dynamic':false,
	'name':'Viewport'
});
export default Viewport;