/*global QUnit*/

sap.ui.define([
	"academia2022/luuc3_ordenes/controller/Ordenes.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Ordenes Controller");

	QUnit.test("I should test the Ordenes controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
