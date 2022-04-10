sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        var oController;

        return Controller.extend("academia2022.luuc3ordenes.controller.StartApp", {
            onInit: function () {
                oController = this;
                this.byId("id_banner").setSrc("/img/ot.png")
        },

        onVisualizarOrdenes: function(){
            this.getOwnerComponent().getRouter().navTo("RouteOrdenes");
        },

    })
});
